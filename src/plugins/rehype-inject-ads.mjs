// Inserts ad slots into article body (Markdown/MDX) without touching the content files.
// Slots: after 3rd paragraph, before the middle H2, and before the "Sources"/"Related" H2 (or at the end).
// Short pages (< 14 top-level blocks) get no in-content ads.

const text = (n) => (n.value ?? '') + (n.children ?? []).map(text).join('');
const slot = (name) => ({
  type: 'element', tagName: 'aside',
  properties: { className: ['ad-slot'], dataSlot: name, ariaLabel: 'Advertisement' },
  children: [],
});

export default function rehypeInjectAds() {
  return (tree) => {
    const kids = tree.children;
    if (kids.length < 14) return;

    let pCount = 0, afterP3 = -1;
    const h2 = [];
    kids.forEach((n, i) => {
      if (n.type !== 'element') return;
      if (n.tagName === 'p' && ++pCount === 3) afterP3 = i + 1;
      if (n.tagName === 'h2') h2.push(i);
    });

    const inserts = [];
    if (afterP3 > 0) inserts.push([afterP3, 'inline-1']);

    const mid = h2.length >= 4 ? h2[Math.floor(h2.length / 2)] : -1;
    if (mid > afterP3 + 4) inserts.push([mid, 'inline-2']);

    const endIdx = h2.find((i) => /^(sources|related)/i.test(text(kids[i]).trim()));
    const endPos = endIdx ?? kids.length;
    if (endPos > (mid > 0 ? mid : afterP3) + 4) inserts.push([endPos, 'end']);

    inserts.sort((a, b) => b[0] - a[0]).forEach(([pos, name]) => kids.splice(pos, 0, slot(name)));
  };
}
