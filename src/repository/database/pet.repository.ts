import { and, eq, inArray, ne } from 'drizzle-orm';
import { orThrow } from 'my-easy-fp';
import { omit } from 'radash';
import { z } from 'zod';

import { container } from '#/loader';
import { NotFoundError } from '#/modules/error/not.found.error';
import { uuidV7Binary } from '#/modules/uuid/uuid.buffer';
import { categoryRepository } from '#/repository/database/category.repository';
import { categories, pets, petsToTags, photoUrls, tags } from '#/schema/database/schema.drizzle';
import {
  CategorySelectSchema,
  PetInsertSchema,
  PetSelectSchema,
  PhotoUrlSelectSchema,
  TagSelectSchema,
} from '#/schema/database/schema.zod';

import type { TDataSource } from '#/schema/database/schema.type';

export const CreatePetRepositorySchema = PetInsertSchema.omit({
  categoryId: true,
  id: true,
}).extend({
  category: CategorySelectSchema.pick({ name: true }),
  tags: z.array(
    z.union([TagSelectSchema.pick({ id: true }), TagSelectSchema.pick({ name: true })]),
  ),
  photoUrls: z.array(PhotoUrlSelectSchema.shape.url),
});

export const UpdatePetRepositorySchema = PetInsertSchema.omit({
  categoryId: true,
  id: true,
}).extend({
  category: z.union([
    CategorySelectSchema.pick({ id: true }),
    CategorySelectSchema.pick({ name: true }),
  ]),
  tags: z.array(
    z.union([TagSelectSchema.pick({ id: true }), TagSelectSchema.pick({ name: true })]),
  ),
  photoUrls: z.array(PhotoUrlSelectSchema.shape.url),
});

export const ModifyPetRepositorySchema = UpdatePetRepositorySchema.partial();

export const ReadPetRepositorySchema = PetSelectSchema.omit({ categoryId: true }).extend({
  category: CategorySelectSchema,
  tags: z.array(TagSelectSchema),
  photoUrls: z.array(PhotoUrlSelectSchema.omit({ petId: true })),
});

async function handleTags(
  db: TDataSource,
  values: z.infer<typeof UpdatePetRepositorySchema>['tags'],
) {
  const existsTagIds = values.flatMap((tag) => ('id' in tag ? [tag.id] : []));
  const selectedTags =
    existsTagIds.length > 0
      ? await db.select().from(tags).where(inArray(tags.id, existsTagIds))
      : [];

  const selectedIdsSet = new Set(selectedTags.map((t) => t.id));
  const missingIds = existsTagIds.filter((id) => !selectedIdsSet.has(id));

  if (missingIds.length > 0) {
    // 존재하지 않는 태그 ID가 포함된 경우 처리
    throw new NotFoundError(`Cannot found Tag: ${missingIds.join(', ')}`);
  }

  const willInsertTags = values.flatMap((tag) => ('name' in tag ? [tag.name] : []));
  const insertedTagIds =
    willInsertTags.length > 0
      ? await db
          .insert(tags)
          .values(
            willInsertTags.map((tag) => ({
              uuid: uuidV7Binary(),
              name: tag,
            })),
          )
          .$returningId()
      : [];

  const ids = insertedTagIds.map((row) => row.id);
  const insertedTags =
    ids.length > 0 ? await db.select().from(tags).where(inArray(tags.id, ids)) : [];

  return {
    selected: selectedTags,
    inserted: insertedTags,
    all: [...selectedTags, ...insertedTags],
  };
}

async function handleCategory(
  db: TDataSource,
  category: z.infer<typeof UpdatePetRepositorySchema>['category'],
) {
  if ('id' in category) {
    const selectedCategory = await db.query.categories.findFirst({
      where: eq(categories.id, category.id),
    });

    return orThrow(selectedCategory, new Error(`Cannot found category: ${category.id}`));
  }

  const uuid = uuidV7Binary();
  const [insertedCategoryId] = await db
    .insert(categories)
    .values({ uuid, name: category.name })
    .$returningId();
  const insertedCategory = await categoryRepository.readCategoryById(
    orThrow(insertedCategoryId?.id),
    'writer',
  );

  return insertedCategory;
}

// Reconciliation(동기화)
async function handlePhotoUrls(
  db: TDataSource,
  petId: bigint,
  newUrls: string[], // z.array(PhotoUrlSelectSchema.shape.url)
) {
  // 1. 현재 DB에 저장된 해당 Pet의 사진 목록 조회
  const existingPhotos = await db.query.photoUrls.findMany({
    where: eq(photoUrls.petId, petId),
  });

  const existingUrls = existingPhotos.map((p) => p.url);
  const existingUrlsSet = new Set(existingUrls);
  const newUrlsSet = new Set(newUrls);

  // 2. 삭제할 URL (DB에는 있지만, 입력 목록에는 없는 것)
  const urlsToDelete = existingUrls.filter((url) => !newUrlsSet.has(url));

  // 3. 추가할 URL (입력 목록에는 있지만, DB에는 없는 것)
  const urlsToInsert = newUrls.filter((url) => !existingUrlsSet.has(url));

  // 4. DB 작업 수행
  // 삭제 작업
  if (urlsToDelete.length > 0) {
    await db
      .delete(photoUrls)
      .where(and(eq(photoUrls.petId, petId), inArray(photoUrls.url, urlsToDelete)));
  }

  // 추가 작업
  if (urlsToInsert.length > 0) {
    await db
      .insert(photoUrls)
      .values(urlsToInsert.map((url) => ({ url, uuid: uuidV7Binary(), petId })));
  }

  // 5. 최종 결과 반환 (유지된 것 + 새로 들어온 것)
  // 다시 조회하거나 메모리 상에서 조립하여 반환
  return db.query.photoUrls.findMany({
    where: eq(photoUrls.petId, petId),
  });
}

async function readPetById(
  id: bigint,
  use: keyof typeof container.db = 'reader',
): Promise<z.infer<typeof ReadPetRepositorySchema> | undefined> {
  // Drizzle ORM으로 pet select
  const db = use === 'writer' ? container.db.writer : container.db.reader;

  const result = await db.query.pets.findFirst({
    where: eq(pets.id, id),
    with: {
      category: true, // 1:1 관계
      photoUrls: true, // 1:N 관계
      petsToTags: {
        // N:N 관계 (중간 테이블 거침)
        with: {
          tag: true,
        },
      },
    },
  });

  if (result == null) {
    throw new NotFoundError(`Cannot found Pet(${id})`);
  }

  const selectedPet = omit(
    {
      ...result,
      tags: result?.petsToTags.map((relation) => relation.tag),
    },
    ['petsToTags', 'categoryId'],
  );

  return selectedPet;
}

async function createPet(
  pet: z.infer<typeof CreatePetRepositorySchema>,
): Promise<z.infer<typeof ReadPetRepositorySchema>> {
  // Drizzle ORM으로 pet insert
  const id = await container.db.writer.transaction(
    async (tx) => {
      const insertedTags = await handleTags(tx, pet.tags);
      const insertedCategory = await categoryRepository.createCategoryWithDs(tx, pet.category);
      const uuid = uuidV7Binary();

      const [nullableInsertedPetId] = await tx
        .insert(pets)
        .values({
          uuid,
          name: pet.name,
          status: pet.status,
          categoryId: insertedCategory.id,
        })
        .$returningId();
      const insertedPetId = orThrow(nullableInsertedPetId);

      await tx
        .insert(photoUrls)
        .values(
          pet.photoUrls.map((url) => ({ url, uuid: uuidV7Binary(), petId: insertedPetId.id })),
        );

      await tx.insert(petsToTags).values(
        insertedTags.all.map((tag) => ({
          petId: insertedPetId.id,
          tagId: tag.id,
        })),
      );

      return insertedPetId.id;
    },
    { isolationLevel: 'read committed' },
  );

  const insertedPet = await readPetById(id, 'writer');
  return orThrow(insertedPet);
}

async function updatePet(
  id: bigint,
  pet: z.infer<typeof UpdatePetRepositorySchema>,
): Promise<z.infer<typeof ReadPetRepositorySchema>> {
  const selectedPet = await container.db.writer.query.pets.findFirst({ where: eq(pets.id, id) });

  if (selectedPet == null) {
    throw new Error(`존재하지 않는 pet(${id}) 입니다`);
  }

  await container.db.writer.transaction(
    async (tx) => {
      await handleTags(tx, pet.tags);
      const updatedCategory = await handleCategory(tx, pet.category);
      await handlePhotoUrls(tx, id, pet.photoUrls);

      await tx
        .update(pets)
        .set({
          name: pet.name,
          status: pet.status,
          categoryId: updatedCategory.id,
        })
        .where(eq(pets.id, id));
    },
    { isolationLevel: 'read committed' },
  );

  const updatedPet = await readPetById(id, 'writer');

  return orThrow(updatedPet);
}

async function modifyPet(
  id: bigint,
  pet: z.infer<typeof ModifyPetRepositorySchema>,
): Promise<z.infer<typeof ReadPetRepositorySchema>> {
  const selectedPet = await container.db.writer.query.pets.findFirst({ where: eq(pets.id, id) });

  if (selectedPet == null) {
    throw new Error(`존재하지 않는 pet(${id}) 입니다`);
  }

  await container.db.writer.transaction(
    async (tx) => {
      if (pet.tags != null) {
        await handleTags(tx, pet.tags);
      }

      const category = pet.category != null ? await handleCategory(tx, pet.category) : undefined;
      const categoryId = category?.id;

      if (pet.photoUrls != null) {
        await handlePhotoUrls(tx, id, pet.photoUrls);
      }

      await tx
        .update(pets)
        .set({
          name: pet.name,
          status: pet.status,
          categoryId,
        })
        .where(eq(pets.id, id));
    },
    {
      isolationLevel: 'read committed',
    },
  );

  const updatedPet = await readPetById(id, 'writer');

  return orThrow(updatedPet);
}

async function deletePet(id: bigint): Promise<z.infer<typeof ReadPetRepositorySchema>> {
  const selectedPet = await readPetById(id, 'writer');

  if (selectedPet == null) {
    throw new Error(`존재하지 않는 pet(${id}) 입니다`);
  }

  await container.db.writer.transaction(async (tx) => {
    // 1. 삭제할 펫이 가진 태그 ID 목록을 먼저 확보 (Dangling Tag 체크용)
    const tagIds = selectedPet.tags.map((tag) => tag.id);

    // 2. 관계 테이블(petsToTags) 데이터 삭제
    await tx.delete(petsToTags).where(eq(petsToTags.petId, id));

    // 3. Dangling Reference 태그 삭제
    // 해당 태그 ID 중, 현재 petsToTags 테이블에서 더 이상 참조되지 않는 태그만 삭제
    if (tagIds.length > 0) {
      // 아직 다른 펫에 연결되어 있는 태그 ID 조회
      const tiedTags = await tx
        .select({ tagId: petsToTags.tagId })
        .from(petsToTags)
        .where(inArray(petsToTags.tagId, tagIds));

      const tiedTagIds = new Set(tiedTags.map((t) => t.tagId));
      const danglingTagIds = tagIds.filter((tid) => !tiedTagIds.has(tid));

      if (danglingTagIds.length > 0) {
        await tx.delete(tags).where(inArray(tags.id, danglingTagIds));
      }
    }

    // 4. PhotoUrl 삭제
    await tx.delete(photoUrls).where(eq(photoUrls.petId, id));

    // 5. Pet 정보 조회 (카테고리 ID 확보용)
    // 6. Pet 삭제
    await tx.delete(pets).where(eq(pets.id, id));

    // 7. Dangling Category 삭제
    // 카테고리도 태그와 마찬가지로 이 카테고리를 쓰는 다른 펫이 있는지 확인 후 삭제
    if (selectedPet.category.id) {
      const otherPetWithCategory = await tx.query.pets.findFirst({
        where: and(
          eq(pets.categoryId, selectedPet.category.id),
          ne(pets.id, id), // 자기 자신 제외
        ),
      });

      if (!otherPetWithCategory) {
        await tx.delete(categories).where(eq(categories.id, selectedPet.category.id));
      }
    }
  });

  return selectedPet;
}

export const petRepository = {
  createPet,
  readPetById,
  updatePet,
  modifyPet,
  deletePet,
};
