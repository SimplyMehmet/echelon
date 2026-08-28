import { copyFile } from 'node:fs/promises';
import { join } from 'node:path';

/**
 * Every real route is prerendered to its own index.html, but an unknown URL has
 * no file to serve. Netlify, Cloudflare Pages and GitHub Pages all fall back to
 * 404.html, so point that at the client-render shell: the app boots and renders
 * its own NotFound page instead of the host's.
 */
const browser = join('dist', 'front-end', 'browser');
await copyFile(join(browser, 'index.csr.html'), join(browser, '404.html'));
console.log('postbuild: wrote 404.html');
