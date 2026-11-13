# jhserodio.github.io — Astro base

Scaffold independente para a refatoração do portfólio em **Astro 5**, sem migrar ou sobrescrever o conteúdo atual do repositório. A intenção é oferecer uma base pequena e modular, não um design final.

## Visão geral

- **Páginas:** Home, Resume, Articles (lista + detalhe), Apps (lista + detalhe), Cover Letter, 404 e RSS, disponíveis em `/pt/` e `/en/` (exceto o RSS/404, que seguem suas rotas próprias).
- **Template único:** `src/layouts/BaseLayout.astro` monta `<head>`, canonical, hreflang, header e footer. A navegação/idioma fica em `src/components/Header.astro`.
- **Conteúdo:** Astro Content Collections (`src/content.config.ts`) tipadas por Zod. Artigos Markdown/MDX com KaTeX, expressive-code, wikilinks, callouts e imagens Obsidian; Apps em JSON.
- **Currículo:** `src/i18n/resume/{pt,en}.json`, com `ResumeSchema` único. **Os dados são placeholders** — substitua antes de publicar.
- **Estilo mínimo:** `src/styles/main.css` e tokens de cor/tipografia/espaço. Fantasque Sans Mono é usada se instalada no dispositivo; há fallback monospace. Não inclui arquivos de fonte.
- **WASM futuro:** catálogo permite `wasm-interactive`, mas o crate **ainda não existe**. `scripts/build-wasm.mjs` só compila após adicionar seu `Cargo.toml`.

## Como iniciar

Requer Node.js 22+ e npm. A partir desta pasta:

```sh
npm install
npm run dev
npm test
npm run check
npm run build
npm run preview
```

O workflow `.github/workflows/deploy.yml` publica no GitHub Pages. Gere e versione um `package-lock.json` após o primeiro `npm install`; depois troque o passo de instalação do workflow por `npm ci` para builds reproduzíveis. Ajuste **Settings → Pages → Build and deployment → GitHub Actions** antes de usar o workflow. `site` está configurado como `https://jhserodio.github.io`, sem `base`, porque é um repositório Pages de usuário.

> `npm run build` executa `sync:vault`, `build:wasm`, `build:site` nessa ordem. Sem vault configurado ou sem crate WASM, as duas primeiras etapas são ignoradas com mensagem explicativa.

## Idiomas: navegador + escolha manual

O conteúdo usa os códigos de rota `/pt/` e `/en/`, exibidos como **PT-BR** e **EN-US**. Na primeira visita à raiz `/`:

1. O navegador tenta ler uma escolha manual anterior da chave `jhserodio:locale` no `localStorage`.
2. Sem preferência válida, procura o primeiro idioma suportado na lista de idiomas do navegador (`navigator.languages`), aceitando variantes como `pt-BR`, `pt-PT`, `en-US` e `en-GB`.
3. Se não encontrar nenhum, usa `pt`.
4. Redireciona para `/pt/` ou `/en/` no browser. A URL de uma rota específica acessada diretamente **não é redirecionada** por esse mecanismo.

O seletor de idioma é um link no Header global. Ao clicar, navega para a página equivalente em outro idioma e grava a escolha, que prevalece no próximo acesso à raiz. Se JavaScript ou armazenamento estiver bloqueado, o link continua navegável; apenas a persistência deixa de funcionar. Para artigos sem tradução, o switch leva ao índice de artigos no outro idioma.

Este site é **100% estático**: `Astro.preferredLocale` não detecta `Accept-Language` por visitante em um arquivo já gerado pelo build. Por isso a detecção na rota `/` é client-side.

## Onde editar cada página

| Objetivo | Arquivo |
| --- | --- |
| Header, navegação e troca de idioma | `src/components/Header.astro` |
| `<head>`, SEO e layout global | `src/layouts/BaseLayout.astro` |
| Home | `src/templates/HomePage.astro` |
| Resume | `src/templates/ResumePage.astro` e `src/i18n/resume/*.json` |
| Artigos | `src/templates/ArticlesIndexPage.astro` e `src/templates/ArticleDetailPage.astro` |
| Apps | `src/templates/AppsIndexPage.astro` e `src/templates/AppDetailPage.astro` |
| Cover Letter | `src/templates/CoverLetterPage.astro` |
| Textos de interface PT/EN | `src/i18n/ui.ts` |
| Cores, tipografia, espaçamento | `src/styles/tokens/*.css` |

As rotas em `src/pages/{pt,en}/` são adaptadores pequenos que invocam o mesmo template com a língua correta. Novas páginas devem seguir esse padrão, sem copiar o layout base.

## Conteúdo e publicação

### Artigos

Crie `src/content/articles/pt/meu-artigo.md` ou `src/content/articles/en/my-article.mdx` com metadados:

```yaml
---
title: Meu artigo
description: Uma descrição curta
lang: pt
publishedAt: 2026-11-13
translationKey: meu-artigo
tags: [rust, matematica]
publish: true
---
```

Somente `publish: true` é listado e gera rota. Para conectar traduções com slugs diferentes, coloque o **mesmo `translationKey`** nos dois arquivos. Caso não haja `translationKey`, a comparação usa o slug. `publish` ausente vale `false`.

### Obsidian

Informe `OBSIDIAN_VAULT_DIR` (diretório absoluto ou relativo ao projeto) e execute:

```sh
OBSIDIAN_VAULT_DIR=/caminho/para/MeuVault npm run sync:vault
```

O script busca `.md` com `publish: true` e campos obrigatórios `title`, `publishedAt` e `lang: pt|en`. Copia notas para `src/content/articles/{lang}/vault/` e os recursos de imagem referenciados para `public/vault-assets/`. Os diretórios gerados são ignorados pelo Git; **os artigos manuais não são apagados pelo sync**. Nomes de imagens duplicados no vault geram erro, para evitar sobrescrita. Exemplo de suportes básicos:

```md
> [!NOTE] Uma observação
> Texto de um callout

[[outra-nota|Ler esta nota]]
![[exemplo.png]]

$$
E = mc^2
$$
```

O plugin `src/plugins/remark-obsidian.mjs` implementa um **subconjunto intencional** da sintaxe Obsidian; não é um interpretador completo de vaults, anexos não-imagem e wikilinks ambíguos. Ajuste resolução de links e slugs ao padrão final do seu vault.

### Apps

Crie JSON em `src/content/apps/pt/` e `src/content/apps/en/` com `type: external-link|wasm-interactive|api-backed`. As páginas mostram as entradas com `status: planned` sem depender do backend/crate. Um `wasm-interactive` só roda de verdade após implementar o crate e expor `solve(input: string)` na interface gerada, ou adaptar `AppRunner.astro` e `src/wasm/registry.ts` às assinaturas escolhidas.

## Integração com o projeto existente

O repositório original atualmente tem uma estrutura Astro 5 com componentes React e páginas `/`, `/resume`, `/cover-letter`. Este scaffold é uma **nova estrutura isolada**. Para migrar de forma segura, faça backup ou trabalhe em uma branch e leve o conteúdo antigo gradualmente. Os links atuais sem prefixo mudam (`/resume/` → `/pt/resume/` ou `/en/resume/`): este scaffold já inclui rotas de compatibilidade `/resume/` e `/cover-letter/` com redirecionamento estático no cliente, preservando query string e hash. Se quiser preservar também outras URLs públicas, adicione rotas legadas equivalentes.

## Estado de validação

A estrutura e os scripts podem ser revisados sem dependências. A instalação `npm install` **não concluiu neste ambiente**, portanto **`astro build` e `astro check` não foram executados com sucesso aqui**. Rode ambos localmente antes do primeiro deploy.
