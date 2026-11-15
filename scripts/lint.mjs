import { readdir, readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import assert from 'node:assert/strict';
async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = `${dir}/${entry.name}`;
    if (entry.isDirectory()) await walk(path);
    else if (/\.(js|mjs)$/.test(path)) {
      const result = spawnSync(process.execPath, ['--check', path], { encoding: 'utf8' });
      assert.equal(result.status, 0, result.stderr);
    } else if (path.endsWith('.html')) {
      const html = await readFile(path, 'utf8');
      assert.match(html, /lang="en"/, `${path}: document language`);
      assert.match(html, /name="viewport"/, `${path}: viewport`);
      assert.match(html, /rel="icon"/, `${path}: favicon`);
      for (const [, link] of html.matchAll(/(?:href|src)="([^"#]+)"/g)) {
        if (!/^(https?:|mailto:)/.test(link)) await readFile(`public/${link}`);
      }
    }
  }
}
await walk('public');
await walk('scripts');
console.log('Static lint passed: JavaScript syntax, page metadata, and local asset links.');
