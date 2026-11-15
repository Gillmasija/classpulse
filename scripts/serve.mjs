import { createServer } from 'node:http';
import { createReadStream, stat } from 'node:fs';
import { resolve, join, extname } from 'node:path';

const root = resolve('dist');
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml' };

createServer((request, response) => {
  const requested = request.url === '/' ? 'index.html' : decodeURIComponent(request.url);
  const file = join(root, requested);
  if (!file.startsWith(root)) {
    response.writeHead(403);
    response.end();
    return;
  }
  stat(file, (error, details) => {
    if (error || !details.isFile()) {
      response.writeHead(404);
      response.end('Not found');
      return;
    }
    response.setHeader('Content-Type', types[extname(file)] ?? 'application/octet-stream');
    createReadStream(file).pipe(response);
  });
}).listen(8000, '127.0.0.1', () => {
  console.log('ClassPulse running at http://127.0.0.1:8000');
});
