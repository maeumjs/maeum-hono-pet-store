import fs from 'node:fs';
import path from 'node:path';

import { parse } from 'jsonc-parser';

import type { PackageJson as PackageJsonType } from 'type-fest';

export async function initPackageJson(): Promise<PackageJsonType> {
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  const buf = await fs.promises.readFile(packageJsonPath);
  const json = parse(buf.toString()) as PackageJsonType;

  return json;
}
