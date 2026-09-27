/* Todas las duplas posibles usan las fotos individuales ya cargadas en La Velada. */
(function (root) {
  'use strict';
  const clean = s => String(s || '').trim();
  // Este orden es el de la lista original de jugadores. Los números son
  // estables: no dependen del ranking ni del orden en que se elijan nombres.
  const roster = ['Risu','Totti','Thiago','Mica','Valentín','Laza','Lara','Martín','Cori','Flor','Tomás'];
  const fixed = [
    ['Martín','Valentín'], ['Laza','Tomás'], ['Thiago','Lara'],
    ['Totti','Risu'], ['Cori','Flor','Mica']
  ];
  const key = names => names.slice().sort((a, b) => roster.indexOf(a) - roster.indexOf(b)).join('|');
  const fixedPairs = new Set(fixed.filter(x => x.length === 2).map(key));
  function pair(name) {
    const parts = String(name || '').split('/').map(clean).filter(Boolean);
    if (parts.length !== 2 || parts[0] === parts[1]) return null;
    const indices = parts.map(p => roster.findIndex(n => n.toLocaleLowerCase('es') === p.toLocaleLowerCase('es')));
    if (indices.some(i => i < 0)) return null;
    return indices[0] < indices[1] ? [roster[indices[0]], roster[indices[1]]]
      : [roster[indices[1]], roster[indices[0]]];
  }
  function all() {
    const out = []; let number = 6;
    roster.forEach((a, i) => roster.slice(i + 1).forEach(b => {
      if (!fixedPairs.has(key([a, b]))) out.push({ names: [a, b], file: 'equipo' + number++ + '.jpg' });
    }));
    return out;
  }
  const byPair = new Map(all().map(x => [key(x.names), x.file]));
  function filename(names) {
    const pairNames = pair(names.join(' / '));
    if (!pairNames) return null;
    const fixedIdx = fixed.findIndex(x => x.length === 2 && key(x) === key(pairNames));
    return fixedIdx >= 0 ? 'equipo' + (fixedIdx + 1) + '.jpg' : byPair.get(key(pairNames)) || null;
  }
  function mapping() {
    return fixed.map((names, i) => ({ names, file: 'equipo' + (i + 1) + '.jpg' })).concat(all());
  }
  function photo(name) {
    return (typeof _prensaFotos !== 'undefined' && _prensaFotos[name]) || getPlayerPhoto(name);
  }
  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('No se pudo abrir la foto'));
      img.src = src;
    });
  }
  function cover(ctx, img, x, y, w, h) {
    const iw = img.naturalWidth || img.width, ih = img.naturalHeight || img.height;
    const scale = Math.max(w / iw, h / ih);
    const sw = w / scale, sh = h / scale;
    ctx.drawImage(img, (iw - sw) / 2, (ih - sh) * .28, sw, sh, x, y, w, h);
  }
  async function compose(names) {
    const missing = names.filter(n => !photo(n));
    if (missing.length) throw new Error('Faltan fotos individuales de ' + missing.join(' y '));
    const images = await Promise.all(names.map(n => loadImage(photo(n))));
    const canvas = document.createElement('canvas');
    canvas.width = 900; canvas.height = 900;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#171720'; ctx.fillRect(0, 0, 900, 900);
    cover(ctx, images[0], 0, 0, 449, 900);
    cover(ctx, images[1], 451, 0, 449, 900);
    ctx.fillStyle = '#f5c842'; ctx.fillRect(449, 0, 2, 900);
    return canvas.toDataURL('image/jpeg', .86);
  }
  async function downloadAll() {
    const missing = roster.filter(n => !photo(n));
    if (missing.length) {
      showToast('⚠️', 'Faltan fotos individuales: ' + missing.join(', '), false);
      return;
    }
    if (!root.JSZip) { showToast('⚠️', 'No se pudo abrir el generador ZIP', false); return; }
    const button = document.getElementById('duplas-descargar');
    if (button) button.disabled = true;
    try {
      const zip = new JSZip();
      const rows = all();
      for (let i = 0; i < rows.length; i++) {
        const item = rows[i];
        const jpeg = await compose(item.names);
        zip.file(item.file, jpeg.slice(jpeg.indexOf(',') + 1), { base64: true });
        if (button) button.textContent = `Preparando ${i + 1}/${rows.length}…`;
      }
      zip.file('equipos.csv', 'archivo,integrante_1,integrante_2,integrante_3\n' + mapping().map(r =>
        [r.file, r.names[0] || '', r.names[1] || '', r.names[2] || '']
          .map(v => '"' + v.replace(/"/g, '""') + '"').join(',')).join('\n'));
      const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 5 } });
      const url = URL.createObjectURL(blob), a = document.createElement('a');
      a.href = url; a.download = 'la-velada-equipos-6-a-56.zip';
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 10000);
      showToast('✓', '51 fotos JPG (equipo6 a equipo56) descargadas', false);
    } catch (e) { showToast('⚠️', e.message || 'No se pudieron armar las duplas', false); }
    finally { if (button) { button.disabled = false; button.textContent = '⬇️ Descargar equipo6.jpg a equipo56.jpg'; } }
  }
  root.VeladaDuplas = { pair, all, mapping, filename, photo, compose, downloadAll };
})(window);
