import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import matter from 'gray-matter';

const articlesRoot = fileURLToPath(new URL('../src/content/articles/', import.meta.url));

function markdownFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const location = join(directory, entry.name);
    if (entry.isDirectory()) return markdownFiles(location);
    return entry.isFile() && /\.(md|mdx)$/.test(entry.name) ? [location] : [];
  });
}

test('article frontmatter locale matches its content directory', () => {
  for (const locale of ['pt', 'en']) {
    const seenTranslationKeys = new Map();
    const files = markdownFiles(join(articlesRoot, locale));
    assert.ok(files.length > 0, `Expected articles for ${locale}`);

    for (const file of files) {
      const { data } = matter(readFileSync(file, 'utf8'));
      assert.equal(
        data.lang,
        locale,
        `${file}: frontmatter lang must match its directory (otherwise getPublishedArticles hides it)`,
      );
      assert.equal(typeof data.publish, 'boolean', `${file}: publish must be explicitly true or false`);
      assert.ok(typeof data.title === 'string' && data.title.trim(), `${file}: missing title`);

      if (data.translationKey) {
        assert.ok(
          !seenTranslationKeys.has(data.translationKey),
          `${file}: duplicated translationKey in ${locale}; already used by ${seenTranslationKeys.get(data.translationKey)}`,
        );
        seenTranslationKeys.set(data.translationKey, file);
      }
    }
  }
});
