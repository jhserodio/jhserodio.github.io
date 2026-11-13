import { visit } from 'unist-util-visit';

const slugify = (value) => value
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/**
 * Subconjunto intencional da sintaxe Obsidian:
 *   [[Artigo|Rótulo]], ![[imagem.png]], > [!NOTE] texto
 * Markdown normal e KaTeX continuam no pipeline Remark/Rehype do Astro.
 */
export function remarkObsidian() {
  return (tree, file) => {
    const path = String(file.path || '').replaceAll('\\', '/');
    const lang = /\/articles\/en\//.test(path) ? 'en' : 'pt';
    const wikiPrefix = /\/articles\/(pt|en)\/vault\//.test(path) ? 'vault/' : '';

    visit(tree, 'blockquote', (node) => {
      const first = node.children?.[0];
      const firstText = first?.type === 'paragraph' ? first.children?.[0] : null;
      if (firstText?.type !== 'text') return;
      const found = /^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION|INFO|SUCCESS|QUESTION|EXAMPLE|QUOTE)\](?:\s+|$)/i.exec(firstText.value);
      if (!found) return;
      const kind = found[1].toLowerCase();
      firstText.value = firstText.value.slice(found[0].length);
      if (!firstText.value && first.children.length === 1) node.children.shift();
      node.data = { ...node.data, hName: 'aside', hProperties: { className: ['callout'], 'data-callout': kind } };
      node.children.unshift({ type: 'paragraph', children: [
        { type: 'strong', children: [{ type: 'text', value: kind.toUpperCase() }] },
      ] });
    });

    visit(tree, 'text', (node, index, parent) => {
      if (!parent || typeof index !== 'number' || !node.value.includes('[[')) return;
      const pattern = /(!?)\[\[([^\]]+)\]\]/g;
      let match, position = 0;
      const children = [];
      while ((match = pattern.exec(node.value)) !== null) {
        if (match.index > position) children.push({ type: 'text', value: node.value.slice(position, match.index) });
        const [target, alias] = match[2].split('|').map(x => x.trim());
        if (match[1] === '!' && /\.(png|jpe?g|gif|webp|svg|avif)$/i.test(target)) {
          children.push({ type: 'image', url: `/vault-assets/${encodeURIComponent(target.split('/').pop())}`, alt: alias || target });
        } else if (match[1] !== '!') {
          const page = target.split('#')[0];
          const anchor = target.includes('#') ? `#${slugify(target.split('#').slice(1).join('#'))}` : '';
          children.push({ type: 'link', url: `/${lang}/articles/${wikiPrefix}${slugify(page)}/${anchor}`, children: [
            { type: 'text', value: alias || page },
          ] });
        } else {
          children.push({ type: 'text', value: match[0] });
        }
        position = pattern.lastIndex;
      }
      if (!children.length) return;
      if (position < node.value.length) children.push({ type: 'text', value: node.value.slice(position) });
      parent.children.splice(index, 1, ...children);
      return index + children.length;
    });
  };
}
