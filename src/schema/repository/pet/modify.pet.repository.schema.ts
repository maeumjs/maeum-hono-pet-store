import { UpdatePetRepositorySchema } from './update.pet.repository.schema';

export const ModifyPetRepositorySchema = UpdatePetRepositorySchema.partial().refine(
  (v) => Object.values(v).some((val) => val !== undefined),
  { message: 'At least one field must be provided' },
);
