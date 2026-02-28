import * as esbuild from 'esbuild';
import readPkg from 'read-pkg';
import builtinModules from 'builtin-modules';
import { globSync } from 'glob';

const pkg = readPkg.sync();

if (process.env.FORMAT !== 'cjs' && process.env.FORMAT !== 'esm') {
  console.log(`support "cjs" or "esm"`);
  console.log(`eg. FORMAT=cjs node esbuild.mjs`);

  process.exit(1);
}

console.log('esbuild start bundling');
console.log(`version: ${pkg.version}`);
console.log(`FORMAT: ${process.env.FORMAT}`);
console.log(`MINIFY: ${process.env.MINIFY}`);

// Get all TypeScript files while maintaining directory structure
const entryPoints = globSync('src/**/*.ts', { ignore: ['src/**/*.test.ts', 'src/**/*.spec.ts'] });

await esbuild.build({
  entryPoints,
  target: 'es2022',
  bundle: false, // Don't bundle - keep separate files
  sourcemap: true,
  platform: 'node',
  minify: process.env.MINIFY === 'true',
  outdir: 'dist',
  format: process.env.FORMAT,
  preserveSymlinks: false,

  plugins: [
    {
      name: 'path-alias-resolver',
      setup(build) {
        // Resolve path aliases (#/* -> relative imports)
        build.onResolve({ filter: /^#\// }, args => {
          const targetPath = args.path.replace(/^#\//, '');

          // Calculate relative path from importer to target
          if (args.importer) {
            const importerDir = args.importer.replace('src/', '').split('/').slice(0, -1);
            const targetParts = targetPath.split('/');

            // Calculate how many directories to go up
            const upLevels = importerDir.length;
            const prefix = upLevels > 0 ? '../'.repeat(upLevels) : './';

            return {
              path: prefix + targetPath + '.js',
              external: false
            };
          }

          return {
            path: './' + targetPath + '.js',
            external: false
          };
        });
      },
    }
  ],
});
