import {
  lstat,
  readFile,
  readdir,
  realpath,
  writeFile,
} from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const bootstrapSource =
  /\ssrc\s*=\s*(["'])\/_next\/static\/chunks\/[^"']+\.js\1/i;
const asyncAttribute =
  /\sasync(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+))?(?=\s|>)/i;

export function deferStaticBootstrap(html) {
  const deferred = html.replace(/<script\b[^>]*>/gi, (tag) => {
    if (
      !bootstrapSource.test(tag) ||
      /\snomodule(?:\s|=|>)/i.test(tag) ||
      !asyncAttribute.test(tag)
    ) {
      return tag;
    }
    const next = tag.replace(asyncAttribute, '');
    return /\sdefer(?:\s|=|>)/i.test(next)
      ? next
      : next.replace(/>$/, ' defer>');
  });
  return deferred.replace(
    /(<head\b[^>]*>)([\s\S]*?)(<\/head>)/i,
    (_, start, content, end) => {
      const startup = [];
      const head = content.replace(
        /<script\b[^>]*>[\s\S]*?<\/script>/gi,
        (script) => {
          const tag = script.slice(0, script.indexOf('>') + 1);
          if (
            bootstrapSource.test(tag) &&
            /\sdefer(?:\s|=|>)/i.test(tag) &&
            !/\snomodule(?:\s|=|>)/i.test(tag)
          ) {
            startup.push(script);
            return '';
          }
          return script;
        }
      );
      // React skips async script resources when matching custom head nodes.
      // Keep deferred resources after those nodes so their identity is stable.
      return start + head + startup.join('') + end;
    }
  );
}

async function stabilizeExport(directory) {
  const stats = await lstat(directory);
  if (!stats.isDirectory() || stats.isSymbolicLink()) {
    throw new Error('Static export must be an owned directory, not a symlink.');
  }
  let htmlFiles = 0;
  let changedFiles = 0;
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const filename = path.join(directory, entry.name);
    if (entry.isDirectory() && entry.name !== '_next') {
      const nested = await stabilizeExport(filename);
      htmlFiles += nested.htmlFiles;
      changedFiles += nested.changedFiles;
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      const html = await readFile(filename, 'utf8');
      const next = deferStaticBootstrap(html);
      htmlFiles++;
      if (next !== html) {
        await writeFile(filename, next);
        changedFiles++;
      }
    }
  }
  return { htmlFiles, changedFiles };
}

if (
  process.argv[1] &&
  (await realpath(process.argv[1])) === fileURLToPath(import.meta.url)
) {
  // Static documents are complete snapshots. Parse the entire document,
  // including edge-added tail nodes, before React begins hydrating it.
  const result = await stabilizeExport(
    fileURLToPath(new URL('../out/', import.meta.url))
  );
  if (!result.htmlFiles) throw new Error('No exported HTML documents found.');
  console.log(
    `Static bootstrap: ${result.htmlFiles} HTML documents checked; ${result.changedFiles} use deferred startup.`
  );
}
