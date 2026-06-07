import { UpdatePetRepositorySchema } from "#schema/repository/pet/update.pet.repository.schema.js";

export const ModifyPetRepositorySchema = UpdatePetRepositorySchema.partial().refine(
  (v) => Object.values(v).some((val) => val !== undefined),
  { message: "At least one field must be provided" },
);
