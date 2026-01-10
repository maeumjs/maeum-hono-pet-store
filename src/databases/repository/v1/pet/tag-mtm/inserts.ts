import { PetTagMTMEntity } from '#/databases/entities/PetTagMTMEntity';
import { CE_DI } from '#/modules/di/CE_DI';
import { container } from '#/modules/di/container';
import { getAsyncTid } from '#/modules/loggings/stores/getAsyncTid';

import type { EntityManager } from 'typeorm';

import type { IPetTagMTMEntity } from '#/databases/interfaces/IPetTagMTMEntity';

export async function inserts(
  data: { values: IPetTagMTMEntity[] },
  options?: { transation?: EntityManager },
) {
  const tid = getAsyncTid();
  const ds =
    options?.transation != null ? options.transation : container.resolve(CE_DI.PET_DATA_SOURCE);

  const result = await ds
    .getRepository(PetTagMTMEntity)
    .createQueryBuilder()
    .insert()
    .values(data.values)
    .updateEntity(false)
    .comment(tid)
    .execute();

  return { result };
}
