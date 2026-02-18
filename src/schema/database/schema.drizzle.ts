import { relations } from 'drizzle-orm';
import {
  bigint,
  binary,
  index,
  int,
  mysqlTable,
  primaryKey,
  varchar,
} from 'drizzle-orm/mysql-core';

// ------------------------------------------------------------------------------------
// Schema
// ------------------------------------------------------------------------------------

export const tags = mysqlTable('tags', {
  id: bigint('id', { mode: 'bigint', unsigned: true }).autoincrement().primaryKey(),
  uuid: binary('uuid', { length: 16 }).notNull().unique(),
  // uuid: char('uuid', { length: 36 }).notNull().unique(),
  name: varchar('name', { length: 100 }).notNull(),
});

export const categories = mysqlTable('categories', {
  id: bigint('id', { mode: 'bigint', unsigned: true }).autoincrement().primaryKey(),
  uuid: binary('uuid', { length: 16 }).notNull().unique(),
  name: varchar('name', { length: 100 }).notNull(),
});

export const photoUrls = mysqlTable('photo_urls', {
  id: bigint('id', { mode: 'bigint', unsigned: true }).autoincrement().primaryKey(),
  uuid: binary('uuid', { length: 16 }).notNull().unique(),
  url: varchar('url', { length: 500 }).notNull(),
  petId: bigint('pet_id', { mode: 'bigint', unsigned: true }).notNull(),
});

export const pets = mysqlTable('pets', {
  id: bigint('id', { mode: 'bigint', unsigned: true }).autoincrement().primaryKey(),
  uuid: binary('uuid', { length: 16 }).notNull().unique(),
  name: varchar('name', { length: 100 }).notNull(),
  status: int('status').notNull(),
  categoryId: bigint('category_id', { mode: 'bigint', unsigned: true }).notNull(),
});

// ------------------------------------------------------------------------------------
// N:N Bridge Table
// ------------------------------------------------------------------------------------
export const petsToTags = mysqlTable(
  'pets_to_tags',
  {
    petId: bigint('pet_id', { mode: 'bigint', unsigned: true }).notNull(),
    tagId: bigint('tag_id', { mode: 'bigint', unsigned: true }).notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.petId, table.tagId] }),
    // mysql-core에서 가져온 index 함수를 사용합니다.
    petIdIdx: index('idx__pet_id').on(table.petId),
    tagIdIdx: index('idx__tag_id').on(table.tagId),
  }),
);

// ------------------------------------------------------------------------------------
// Relations (App Level)
// ------------------------------------------------------------------------------------

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

export const petsRelations = relations(pets, ({ one, many }) => ({
  category: one(categories, {
    fields: [pets.categoryId],
    references: [categories.id],
  }),
  photoUrls: many(photoUrls),
  petsToTags: many(petsToTags),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  // 1:N 관계이므로 many로 설정하는 것이 논리적으로 더 정확합니다.
  pets: many(pets),
}));

export const photoUrlsRelations = relations(photoUrls, ({ one }) => ({
  pet: one(pets, {
    fields: [photoUrls.petId],
    references: [pets.id],
  }),
}));
