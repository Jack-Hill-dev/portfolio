import * as esbuild from 'esbuild';
import { readFile, writeFile, mkdir, cp } from 'node:fs/promises';
import { watch, watchFile } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const output = join(root, 'dist');
const publicDirectory = join(root, 'public');
const page = join(root, 'index.html');
const mode = process.argv[2] ?? 'build';
const developing = mode === 'dev';
let pendingWrite = Promise.resolve();

function writeHTML() {
  pendingWrite = pendingWrite.catch(() => {}).then(async () => {
    await mkdir(output, { recursive: true });
    await cp(publicDirectory, output, { recursive: true, force: true });
    let html = await readFile(page, 'utf8');
    html = html.replace('src="/src/main.js"', 'src="./assets/main.js"');
    if (developing) {
      html = html.replace('</body>', `<script type="module">
        new EventSource('/esbuild').addEventListener('change', () => location.reload());
      </script></body>`);
    }
    await writeFile(join(output, 'index.html'), html);
  });
  return pendingWrite;
}

const options = {
  absWorkingDir: root,
  entryPoints: ['src/main.js'],
  bundle: true,
  outdir: join(output, 'assets'),
  format: 'esm',
  minify: !developing,
  sourcemap: developing,
  logLevel: 'info',
  plugins: [{
    name: 'page-shell',
    setup(build) {
      build.onEnd(async (result) => {
        if (result.errors.length === 0) await writeHTML();
      });
    },
  }],
};

if (mode === 'build') {
  await esbuild.build(options);
} else {
  const context = await esbuild.context(options);
  await context.rebuild();
  if (developing) {
    await context.watch();
    watchFile(page, { interval: 250 }, () => {
      writeHTML().catch(console.error);
    });
    watch(publicDirectory, { recursive: true }, () => {
      writeHTML().catch(console.error);
    });
  }
  const { port } = await context.serve({
    servedir: output,
    host: '127.0.0.1',
    port: developing ? 5173 : 4173,
  });
  console.log(`\nPortfolio: http://127.0.0.1:${port}\n`);
}
