import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = fileURLToPath(new URL('../', import.meta.url));
const distRoot = join(projectRoot, 'dist');
const assetsRoot = join(distRoot, 'assets');

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.png': 'image/png',
};

const routes = [];

async function addRoute(route, filePath) {
  const contents = await readFile(filePath);
  routes.push([
    route,
    [
      contentTypes[extname(filePath)] ?? 'application/octet-stream',
      contents.toString('base64'),
    ],
  ]);
}

await addRoute('/index.html', join(distRoot, 'index.html'));
await addRoute('/og.png', join(distRoot, 'og.png'));

for (const file of await readdir(assetsRoot)) {
  await addRoute(`/assets/${file}`, join(assetsRoot, file));
}

const workerSource = `const encodedAssets = new Map(${JSON.stringify(routes)});
const decodedAssets = new Map();

function decodeAsset(path, encoded) {
  if (decodedAssets.has(path)) return decodedAssets.get(path);
  const binary = atob(encoded);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  decodedAssets.set(path, bytes);
  return bytes;
}

export default {
  async fetch(request) {
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return new Response('Method not allowed', {
        status: 405,
        headers: { Allow: 'GET, HEAD' },
      });
    }

    const url = new URL(request.url);
    const path = url.pathname === '/' ? '/index.html' : url.pathname;
    const asset = encodedAssets.get(path);

    if (!asset) return new Response('Not found', { status: 404 });

    const [contentType, encoded] = asset;
    const cacheControl = path === '/index.html'
      ? 'public, max-age=0, must-revalidate'
      : 'public, max-age=31536000, immutable';

    return new Response(
      request.method === 'HEAD' ? null : decodeAsset(path, encoded),
      {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Cache-Control': cacheControl,
          'X-Content-Type-Options': 'nosniff',
        },
      },
    );
  },
};
`;

await mkdir(join(distRoot, 'server'), { recursive: true });
await writeFile(join(distRoot, 'server', 'index.js'), workerSource);
