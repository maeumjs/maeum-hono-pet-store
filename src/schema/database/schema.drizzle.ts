import { relations } from 'drizzle-orm';
import { index, integer, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core';

// ------------------------------------------------------------------------------------
// Schema
// ------------------------------------------------------------------------------------
export const tags = sqliteTable('tags', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name', { length: 100 }).notNull(),
});

export const categories = sqliteTable('categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name', { length: 100 }).notNull(),
});

export const photoUrls = sqliteTable('photo_urls', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  url: text('url', { length: 500 }).notNull(),
  petId: integer('pet_id').notNull(),
});

export const pets = sqliteTable('pets', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name', { length: 100 }).notNull(),
  status: integer('status').notNull(),
  categoryId: integer('category_id').notNull(),
});

// ------------------------------------------------------------------------------------
// Relation
// ------------------------------------------------------------------------------------
// 3. 중간 테이블 (Many-to-Many Bridge)
export const petsToTags = sqliteTable(
  'pets_to_tags',
  {
    petId: integer('pet_id').notNull(), // .references() 제거
    tagId: integer('tag_id').notNull(), // .references() 제거
  },
  (table) => [
    primaryKey({ columns: [table.petId, table.tagId] }),
    // 운영을 위해 인덱스는 걸어두는 것이 좋습니다. (Gap Lock 방지)
    index('pet_id_idx').on(table.petId),
    index('tag_id_idx').on(table.tagId),
  ],
);

// ✅ 이 Relations 설정이 타입 추론의 핵심입니다!
export const petsToTagsRelations = relations(petsToTags, ({ one }) => ({
  pet: one(pets, {
    fields: [petsToTags.petId],
    references: [pets.id],
  }),
  tag: one(tags, {
    fields: [petsToTags.tagId],
    references: [tags.id],
  }),
}));

// 하지만 Drizzle 관계는 설정해줍니다 (App 레벨의 관계)
export const petsRelations = relations(pets, ({ one, many }) => ({
  // 1:1 관계 (Pet has one Category)
  category: one(categories, {
    fields: [pets.categoryId],
    references: [categories.id],
  }),
  // 1:N 관계 (Pet has many PhotoUrl)
  photoUrls: many(photoUrls),
  // N:N
  petsToTags: many(petsToTags),
}));

// 반대 방향 (선택 사항이지만 조회를 위해 추천)
export const categoriesRelations = relations(categories, ({ one }) => ({
  pet: one(pets, {
    fields: [categories.id],
    references: [pets.categoryId],
  }),
}));

export const photoUrlsRelations = relations(photoUrls, ({ one }) => ({
  pet: one(pets, {
    fields: [photoUrls.petId],
    references: [pets.id],
  }),
}));
