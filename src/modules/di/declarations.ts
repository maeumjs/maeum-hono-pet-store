import type { CE_DI as TOOLS, Encryptioner } from '@maeum/tools';
import type { AsyncReturnType, PackageJson } from 'type-fest';
import type { DataSource } from 'typeorm';

import type { IConfiguration } from '#/configs/interfaces/IConfiguration';
import type { CronContainer } from '#/crons/CronContainer';
import type { CE_DI } from '#/modules/di/CE_DI';
import type { makeServer } from '#/modules/makers/makeServer';

declare module '@maeum/tools' {
  interface IClassContainer {
    resolve(name: typeof CE_DI.CONFIG): IConfiguration;
    resolve(name: typeof CE_DI.PACKAGE_JSON): PackageJson;
    resolve(name: typeof CE_DI.SERVER): AsyncReturnType<typeof makeServer>;
    resolve(name: typeof CE_DI.PET_DATA_SOURCE): DataSource;
    resolve(name: typeof CE_DI.CRON): CronContainer;
    resolve(name: typeof TOOLS.ENCRYPTIONER): Encryptioner;
  }
}
