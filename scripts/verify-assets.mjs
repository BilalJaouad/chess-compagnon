import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const root = new URL('../', import.meta.url);
const manifest = JSON.parse(readFileSync(new URL('vendor-manifest.json', root), 'utf8'));
for (const asset of manifest.assets) {
  const bytes = readFileSync(new URL(asset.path, root));
  assert.equal(bytes.length, asset.bytes, asset.path + ': size mismatch');
  assert.equal(createHash('sha256').update(bytes).digest('hex'), asset.sha256, asset.path + ': SHA-256 mismatch');
}
console.log(`Verified ${manifest.assets.length} vendor assets.`);
