import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';

const root = new URL('../src/pages/index.astro', import.meta.url);
const source = readFileSync(root, 'utf8');
const inlineScript = source.match(/<script is:inline>([\s\S]*?)<\/script>/)?.[1];
assert.ok(inlineScript, 'o redirect inicial deve existir no index');

function redirectFor(browserLanguages, saved = null, blockStorage = false) {
  const visits = [];
  const context = {
    navigator: { languages: browserLanguages, language: browserLanguages[0] },
    localStorage: { getItem() { if (blockStorage) throw new Error('Denied'); return saved; } },
    window: { location: { search: '', hash: '', replace(href) { visits.push(href); } } },
  };
  vm.runInNewContext(inlineScript, context, { timeout: 1000 });
  return visits;
}

test('navegador pt-BR abre o currículo /pt/resume/', () => assert.deepEqual(redirectFor(['pt-BR', 'en-US']), ['/pt/resume/']));
test('navegador en-US abre o currículo /en/resume/', () => assert.deepEqual(redirectFor(['en-US', 'pt-BR']), ['/en/resume/']));
test('navegador fr-FR cai no pt', () => assert.deepEqual(redirectFor(['fr-FR']), ['/pt/resume/']));
test('idioma secundário do navegador é usado', () => assert.deepEqual(redirectFor(['fr-FR', 'en-US']), ['/en/resume/']));
test('preferência salva prevalece sobre idioma do navegador', () => assert.deepEqual(redirectFor(['pt-BR'], 'en'), ['/en/resume/']));
test('armazenamento bloqueado usa o navegador', () => assert.deepEqual(redirectFor(['en-US'], null, true), ['/en/resume/']));

const legacySource = readFileSync(new URL('../src/components/LegacyRedirect.astro', import.meta.url), 'utf8');
const legacyScript = legacySource.match(/<script is:inline>([\s\S]*?)<\/script>/)?.[1];
assert.ok(legacyScript, 'redirect de rotas legadas deve existir');
function legacyRedirectFor(suffix, languages, saved = null) {
  const output = [];
  vm.runInNewContext(legacyScript, {
    document: { documentElement: { dataset: { legacySuffix: suffix } } },
    navigator: { languages },
    localStorage: { getItem: () => saved },
    URL,
    location: { origin: 'https://jhserodio.github.io', search: '?from=legacy', hash: '#bio' },
    window: { location: { replace: (url) => output.push(url) } },
  }, { timeout: 1000 });
  return output;
}
test('a rota /resume/ respeita idioma + query + hash', () => assert.deepEqual(
  legacyRedirectFor('resume', ['pt-BR'], 'en'),
  ['https://jhserodio.github.io/en/resume/?from=legacy#bio'],
));
test('a rota /cover-letter/ usa detecção de idioma', () => assert.deepEqual(
  legacyRedirectFor('cover-letter', ['en-US']),
  ['https://jhserodio.github.io/en/cover-letter/?from=legacy#bio'],
));
