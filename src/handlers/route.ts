import { swaggerUI } from "@hono/swagger-ui";
import { container } from "#app/loader.js";
import { createCategoryHandler, createCategoryRoute } from "#handlers/category/create.category.js";
import {
  deleteCategoryByIdHandler,
  deleteCategoryByIdRoute,
} from "#handlers/category/delete.category.by.id.js";
import {
  modifyCategoryByIdHandler,
  modifyCategoryByIdRoute,
} from "#handlers/category/modify.category.by.id.js";
import {
  readCategoryByIdHandler,
  readCategoryByIdRoute,
} from "#handlers/category/read.category.by.id.js";
import {
  updateCategoryByIdHandler,
  updateCategoryByIdRoute,
} from "#handlers/category/update.category.by.id.js";
import { handler as readHealth, route as readHealthRoute } from "#handlers/health/read.health.js";
import { handler as readRoot, route as readRootRoute } from "#handlers/health/read.root.js";
import { createPetHandler, createPetRoute } from "#handlers/pet/create.pet.js";
import { deletePetHandler, deletePetRoute } from "#handlers/pet/delete.pet.by.id.js";
import { modifyPetHandler, modifyPetRoute } from "#handlers/pet/modify.pet.by.id.js";
import { readPetHandler, readPetRoute } from "#handlers/pet/read.pet.by.id.js";
import { updatePetHandler, updatePetRoute } from "#handlers/pet/update.pet.by.id.js";
import { uploadImageHandler, uploadImageRoute } from "#handlers/pet/upload.image.js";
import { createTagHandler, createTagRoute } from "#handlers/tag/create.tag.js";
import { deleteTagByIdHandler, deleteTagByIdRoute } from "#handlers/tag/delete.tag.by.id.js";
import { modifyTagByIdHandler, modifyTagByIdRoute } from "#handlers/tag/modify.tag.by.id.js";
import { readTagByIdHandler, readTagByIdRoute } from "#handlers/tag/read.tag.by.id.js";
import { updateTagByIdHandler, updateTagByIdRoute } from "#handlers/tag/update.tag.by.id.js";

export function routing(): void {
  container.app.openapi(readRootRoute, readRoot);
  container.app.openapi(readHealthRoute, readHealth);

  container.app.openapi(readTagByIdRoute, readTagByIdHandler);
  container.app.openapi(createTagRoute, createTagHandler);
  container.app.openapi(updateTagByIdRoute, updateTagByIdHandler);
  container.app.openapi(modifyTagByIdRoute, modifyTagByIdHandler);
  container.app.openapi(deleteTagByIdRoute, deleteTagByIdHandler);

  container.app.openapi(readCategoryByIdRoute, readCategoryByIdHandler);
  container.app.openapi(createCategoryRoute, createCategoryHandler);
  container.app.openapi(updateCategoryByIdRoute, updateCategoryByIdHandler);
  container.app.openapi(modifyCategoryByIdRoute, modifyCategoryByIdHandler);
  container.app.openapi(deleteCategoryByIdRoute, deleteCategoryByIdHandler);

  container.app.openapi(createPetRoute, createPetHandler);
  container.app.openapi(readPetRoute, readPetHandler);
  container.app.openapi(updatePetRoute, updatePetHandler);
  container.app.openapi(modifyPetRoute, modifyPetHandler);
  container.app.openapi(deletePetRoute, deletePetHandler);

  container.app.openapi(uploadImageRoute, uploadImageHandler);

  container.app.doc("/swagger/json", {
    openapi: "3.0.0",
    info: {
      version: `${container.packageJson.version}`,
      title: "Pet Store",
    },
  });

  container.app.get(
    "/swagger",
    swaggerUI({ url: "/swagger/json", deepLinking: true, filter: true }),
  );
}
