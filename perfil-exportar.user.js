// ==UserScript==
// @name         ZonaTMO - Exportar Perfil (con imágenes)
// @namespace    http://tampermonkey.net/
// @version      2.2
// @description  Navega páginas de perfil ZonaTMO y exporta con portadas a HTML y Excel
// @author       You
// @match        https://zonatmo.nakamasweb.com/profile/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const NOMBRES_LISTA = {
        'pending':   'Pendientes',
        'follow':    'Siguiendo',
        'read':      'Leídos',
        'wish':      'Deseados',
        'have':      'Tengo',
        'abandoned': 'Abandonados'
    };

    function getNombreLista() {
        const path = window.location.pathname;
        for (const [key, val] of Object.entries(NOMBRES_LISTA)) {
            if (path.includes(key)) return val;
        }
        return 'lista';
    }

    function getCoverUrl(el) {
        const style = el.querySelector('style');
        if (style) {
            const match = style.textContent.match(/url\(['"]?([^'")\s]+)['"]?\)/);
            if (match) return match[1];
        }
        const thumb = el.querySelector('[class*="thumbnail"]');
        if (thumb) {
            const inlineStyle = thumb.getAttribute('style') || '';
            const match = inlineStyle.match(/url\(['"]?([^'")\s]+)['"]?\)/);
            if (match) return match[1];
        }
        const img = el.querySelector('img');
        if (img) return img.src || img.dataset.src || '';
        return '';
    }

    function getTitulosPagina() {
        const items = [];
        document.querySelectorAll('.thumbnail-title h4.text-truncate').forEach(h4 => {
            const titulo = h4.getAttribute('title') || h4.textContent.trim();
            if (!titulo) return;
            const card = h4.closest('[class*="element"], .book, [class*="col-"]') || h4.parentElement.parentElement.parentElement;
            const cover = card ? getCoverUrl(card) : '';
            const tipo = card ? (card.querySelector('[class*="badge"]') || {textContent:''}).textContent.trim() : '';
            const link = card ? card.querySelector('a') : null;
            const progreso = card ? (card.querySelector('.chapters_pending') || {textContent:''}).textContent.trim() : '';
            items.push({
                titulo,
                tipo,
                progreso,
                url: link ? link.href.trim() : '',
                cover: cover || ''
            });
        });
        return items;
    }

    function getSiguientePagina() {
        for (const link of document.querySelectorAll('a[rel="next"]')) {
            if (link.textContent.includes('Siguiente')) return link.href;
        }
        return null;
    }

    function getPaginaActual() {
        return parseInt(new URLSearchParams(window.location.search).get('page') || '1');
    }

    function descargar(nombre, contenido, tipo) {
        const blob = new Blob([contenido], { type: tipo });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = nombre; a.click();
        URL.revokeObjectURL(url);
    }

    function descargarBlob(nombre, blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = nombre; a.click();
        URL.revokeObjectURL(url);
    }

    function toCSV(datos) {
        const enc = ['#', 'Título', 'Tipo', 'Progreso', 'URL', 'Portada'];
        const filas = datos.map((d, i) => [
            i + 1,
            `"${d.titulo.replace(/"/g, '""')}"`,
            d.tipo,
            `"${d.progreso.replace(/"/g, '""')}"`,
            d.url,
            d.cover
        ]);
        return [enc, ...filas].map(f => f.join(',')).join('\n');
    }

    function generarHTML(datos, nombre) {
        const total = datos.length;

        const tipoColor = (tipo) => {
            if (tipo.includes('MANGA')) return '#4f8ef7';
            if (tipo.includes('MANHUA')) return '#e07b3c';
            if (tipo.includes('MANHWA')) return '#9b59b6';
            return '#6c7086';
        };

        const cards = datos.map((d, i) => `
        <div class="card">
            <div class="card-num">${i + 1}</div>
            ${d.cover
                ? `<img class="cover" src="${d.cover}" alt="${d.titulo.replace(/"/g, '&quot;')}" loading="lazy">`
                : `<div class="no-cover">Sin portada</div>`}
            <div class="info">
                <a class="titulo" href="${d.url}" target="_blank">${d.titulo}</a>
                ${d.tipo ? `<span class="badge" style="background:${tipoColor(d.tipo)}">${d.tipo}</span>` : ''}
                ${d.progreso ? `<span class="progreso">${d.progreso}</span>` : ''}
            </div>
        </div>`).join('');

        return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>${nombre} — ZonaTMO</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:Arial,sans-serif;background:#0f0f1a;color:#e0e0e0;padding:24px}
  h1{text-align:center;color:#cba6f7;margin-bottom:8px;font-size:2rem}
  .meta{text-align:center;color:#888;margin-bottom:24px;font-size:.9rem}
  .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:16px}
  .card{background:#1e1e2e;border-radius:10px;overflow:hidden;position:relative;
        display:flex;flex-direction:column;transition:transform .2s}
  .card:hover{transform:translateY(-4px);box-shadow:0 8px 20px rgba(0,0,0,.4)}
  .card-num{position:absolute;top:6px;left:6px;background:rgba(0,0,0,.75);
            color:#fff;font-size:.68rem;padding:2px 6px;border-radius:4px;z-index:1}
  .cover{width:100%;aspect-ratio:2/3;object-fit:cover;display:block}
  .no-cover{width:100%;aspect-ratio:2/3;background:#313244;
            display:flex;align-items:center;justify-content:center;
            color:#555;font-size:.75rem}
  .info{padding:8px;display:flex;flex-direction:column;gap:5px;flex:1}
  .titulo{color:#cdd6f4;font-size:.78rem;font-weight:bold;text-decoration:none;
          display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
  .titulo:hover{color:#cba6f7}
  .badge{font-size:.65rem;color:#fff;padding:2px 7px;border-radius:4px;
         width:fit-content;font-weight:bold}
  .progreso{font-size:.7rem;color:#a6adc8}
  @media print{
    body{background:#fff;color:#000}
    .card{background:#f5f5f5;break-inside:avoid}
    .titulo{color:#000}
    .progreso{color:#444}
  }
</style>
</head>
<body>
<h1>📚 ${nombre}</h1>
<p class="meta">${total} títulos &nbsp;·&nbsp; ZonaTMO &nbsp;·&nbsp; ${new Date().toLocaleDateString('es-MX')}</p>
<div class="grid">${cards}</div>
</body>
</html>`;
    }

    function cargarScript(src) {
        return new Promise((resolve, reject) => {
            if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
            const s = document.createElement('script');
            s.src = src; s.onload = resolve; s.onerror = reject;
            document.head.appendChild(s);
        });
    }

    async function generarExcel(datos, nombre, onProgress) {
        await cargarScript('https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js');
        const wsData = [['#', 'Portada (URL)', 'Título', 'Tipo', 'Progreso', 'URL']];
        datos.forEach((d, i) => {
            wsData.push([i + 1, d.cover, d.titulo, d.tipo, d.progreso, d.url]);
            if (onProgress) onProgress(i + 1, datos.length);
        });
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(wsData);
        ws['!cols'] = [{wch:5},{wch:60},{wch:50},{wch:12},{wch:18},{wch:60}];
        XLSX.utils.book_append_sheet(wb, ws, nombre.substring(0, 31));
        const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        return new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    }

    function btnStyle(color) {
        return `flex:1;min-width:80px;padding:8px;background:${color};color:#1e1e2e;
                border:none;border-radius:6px;cursor:pointer;font-weight:bold;font-size:.8rem;`;
    }

    function mostrarModal(datos, nombre) {
        if (document.getElementById('tmo-modal')) document.getElementById('tmo-modal').remove();
        const texto = datos.map((d, i) => `${i + 1}. ${d.titulo}${d.progreso ? ' | ' + d.progreso : ''}`).join('\n');
        const json = JSON.stringify(datos, null, 2);
        const csv = toCSV(datos);

        const modal = document.createElement('div');
        modal.id = 'tmo-modal';
        modal.style.cssText = `position:fixed;top:0;left:0;width:100%;height:100%;
            background:rgba(0,0,0,.75);z-index:99999999;
            display:flex;align-items:center;justify-content:center;`;

        modal.innerHTML = `
        <div style="background:#1e1e2e;color:#cdd6f4;padding:24px;border-radius:14px;
                    max-width:720px;width:92%;max-height:85vh;
                    display:flex;flex-direction:column;gap:14px;">
            <h3 style="margin:0;color:#cba6f7;font-size:1.1rem;">
                📋 ${datos.length} títulos —
                <span style="color:#89dceb">${nombre}</span>
            </h3>
            <div id="tmo-progress" style="display:none;background:#313244;border-radius:8px;
                 padding:10px 14px;font-size:.85rem;color:#a6e3a1;"></div>
            <div style="display:flex;gap:8px;flex-wrap:wrap;">
                <button id="tmo-txt"  style="${btnStyle('#89b4fa')}">⬇ TXT</button>
                <button id="tmo-json" style="${btnStyle('#a6e3a1')}">⬇ JSON</button>
                <button id="tmo-csv"  style="${btnStyle('#94e2d5')}">⬇ CSV</button>
                <button id="tmo-html" style="${btnStyle('#f9e2af')}">🌐 HTML + portadas</button>
                <button id="tmo-xlsx" style="${btnStyle('#cba6f7')}">📊 Excel</button>
                <button id="tmo-close" style="${btnStyle('#f38ba8')}">✕ Cerrar</button>
            </div>
            <textarea readonly style="flex:1;min-height:240px;background:#313244;color:#cdd6f4;
                border:none;border-radius:8px;padding:12px;font-size:11px;
                font-family:monospace;resize:none;">${texto}</textarea>
        </div>`;

        document.body.appendChild(modal);

        const progress = modal.querySelector('#tmo-progress');
        const setProgress = (msg) => { progress.style.display = 'block'; progress.textContent = msg; };

        modal.querySelector('#tmo-close').onclick = () => { modal.remove(); sessionStorage.removeItem('tmo_items'); };
        modal.querySelector('#tmo-txt').onclick   = () => descargar(`${nombre}.txt`, texto, 'text/plain');
        modal.querySelector('#tmo-json').onclick  = () => descargar(`${nombre}.json`, json, 'application/json');
        modal.querySelector('#tmo-csv').onclick   = () => descargar(`${nombre}.csv`, '\uFEFF' + csv, 'text/csv;charset=utf-8');

        modal.querySelector('#tmo-html').onclick = () => {
            setProgress(`⏳ Generando HTML...`);
            setTimeout(() => {
                const html = generarHTML(datos, nombre);
                descargar(`${nombre}.html`, html, 'text/html;charset=utf-8');
                setProgress('✅ HTML descargado — ábrelo en el navegador para ver las portadas');
            }, 50);
        };

        modal.querySelector('#tmo-xlsx').onclick = async () => {
            setProgress('⏳ Generando Excel...');
            try {
                const blob = await generarExcel(datos, nombre, (n, t) =>
                    setProgress(`⏳ Procesando... ${n} / ${t}`));
                setProgress(`✅ Excel listo — ${datos.length} filas`);
                descargarBlob(`${nombre}.xlsx`, blob);
            } catch (e) { setProgress('❌ Error: ' + e.message); }
        };

        modal.addEventListener('click', e => {
            if (e.target === modal) { modal.remove(); sessionStorage.removeItem('tmo_items'); }
        });
    }

    function actualizarBoton(btn, texto, color) {
        btn.textContent = texto;
        btn.style.background = color;
    }

    function recolectarPagina(btn) {
        const paginaActual = getPaginaActual();
        const siguientePagina = getSiguientePagina();
        const existentes = JSON.parse(sessionStorage.getItem('tmo_items') || '[]');
        const nuevos = getTitulosPagina();
        const total = [...existentes, ...nuevos];
        sessionStorage.setItem('tmo_items', JSON.stringify(total));

        if (siguientePagina) {
            actualizarBoton(btn, `⏳ Pág. ${paginaActual}... (${total.length})`, '#f39c12');
            setTimeout(() => { window.location.href = siguientePagina; }, 800);
        } else {
            sessionStorage.removeItem('tmo_recolectando');
            actualizarBoton(btn, `✅ ${total.length} títulos — Exportar`, '#27ae60');
            mostrarModal(total, getNombreLista());
        }
    }

    function crearBoton() {
        if (document.getElementById('btn-exportar-perfil')) return;
        const btn = document.createElement('button');
        btn.id = 'btn-exportar-perfil';
        btn.textContent = '📥 Exportar Lista Completa';
        btn.style.cssText = `position:fixed;bottom:20px;right:20px;z-index:9999999;
            background:#e74c3c;color:white;border:none;padding:10px 16px;
            border-radius:8px;font-size:14px;cursor:pointer;
            box-shadow:0 4px 10px rgba(0,0,0,.3);`;

        btn.addEventListener('click', () => {
            const guardados = sessionStorage.getItem('tmo_items');
            const recolectando = sessionStorage.getItem('tmo_recolectando');
            if (guardados && !recolectando) {
                mostrarModal(JSON.parse(guardados), getNombreLista());
                return;
            }
            sessionStorage.setItem('tmo_recolectando', 'true');
            sessionStorage.removeItem('tmo_items');
            const base = window.location.pathname;
            if (getPaginaActual() !== 1) {
                window.location.href = base + '?page=1';
            } else {
                recolectarPagina(btn);
            }
        });

        document.body.appendChild(btn);
    }

    function verificarRecoleccion() {
        const recolectando = sessionStorage.getItem('tmo_recolectando');
        if (!recolectando) return;
        const btn = document.getElementById('btn-exportar-perfil');
        if (btn) recolectarPagina(btn);
    }

    function esperarContenido() {
        const hay = document.querySelectorAll('.thumbnail-title h4.text-truncate').length > 0;
        if (hay) {
            crearBoton();
            verificarRecoleccion();
        } else {
            setTimeout(esperarContenido, 500);
        }
    }

    esperarContenido();
})();
