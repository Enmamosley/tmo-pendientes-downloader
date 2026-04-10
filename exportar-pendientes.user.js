// ==UserScript==
// @name         ZonaTMO - Exportar Pendientes
// @namespace    http://tampermonkey.net/
// @version      1.5
// @description  Exporta los títulos pendientes de ZonaTMO a TXT, JSON o Excel (CSV)
// @author       You
// @match        https://zonatmo.nakamasweb.com/*
// @match        https://zonatmo.nakamasweb.com/
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    function exportarTitulos() {
        const titulos = [];
        const elementos = document.querySelectorAll('#list-elements .element');
        elementos.forEach(el => {
            const h4 = el.querySelector('h4.text-truncate');
            const progreso = el.querySelector('.chapters_pending');
            const tipo = el.querySelector('.book-type');
            const link = el.querySelector('a');
            if (h4) {
                titulos.push({
                    titulo: h4.getAttribute('title') || h4.textContent.trim(),
                    tipo: tipo ? tipo.textContent.trim() : '',
                    progreso: progreso ? progreso.textContent.trim() : '',
                    url: link ? link.href.trim() : ''
                });
            }
        });
        return titulos;
    }

    function descargar(nombre, contenido, tipo) {
        const blob = new Blob([contenido], { type: tipo });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = nombre;
        a.click();
        URL.revokeObjectURL(url);
    }

    function toCSV(datos) {
        const encabezado = ['#', 'Título', 'Tipo', 'Progreso', 'URL'];
        const filas = datos.map((d, i) => [
            i + 1,
            `"${d.titulo.replace(/"/g, '""')}"`,
            d.tipo,
            `"${d.progreso.replace(/"/g, '""')}"`,
            d.url
        ]);
        return [encabezado, ...filas].map(f => f.join(',')).join('\n');
    }

    function mostrarModal(datos) {
        const texto = datos.map((d, i) =>
            `${i + 1}. [${d.tipo}] ${d.titulo} | Progreso: ${d.progreso}\n   ${d.url}`
        ).join('\n\n');
        const json = JSON.stringify(datos, null, 2);
        const csv = toCSV(datos);

        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.7); z-index: 99999999;
            display: flex; align-items: center; justify-content: center;
        `;
        modal.innerHTML = `
            <div style="background:#1e1e2e;color:#cdd6f4;padding:24px;border-radius:12px;
                        max-width:700px;width:90%;max-height:80vh;display:flex;flex-direction:column;gap:12px;">
                <h3 style="margin:0;color:#cba6f7;">📋 ${datos.length} títulos encontrados</h3>
                <div style="display:flex;gap:8px;flex-wrap:wrap;">
                    <button id="btn-txt" style="flex:1;padding:8px;background:#89b4fa;color:#1e1e2e;
                        border:none;border-radius:6px;cursor:pointer;font-weight:bold;">⬇ TXT</button>
                    <button id="btn-json" style="flex:1;padding:8px;background:#a6e3a1;color:#1e1e2e;
                        border:none;border-radius:6px;cursor:pointer;font-weight:bold;">⬇ JSON</button>
                    <button id="btn-csv" style="flex:1;padding:8px;background:#f9e2af;color:#1e1e2e;
                        border:none;border-radius:6px;cursor:pointer;font-weight:bold;">⬇ Excel (CSV)</button>
                    <button id="btn-cerrar" style="padding:8px 14px;background:#f38ba8;color:#1e1e2e;
                        border:none;border-radius:6px;cursor:pointer;font-weight:bold;">✕ Cerrar</button>
                </div>
                <textarea readonly style="flex:1;min-height:300px;background:#313244;color:#cdd6f4;
                    border:none;border-radius:8px;padding:12px;font-size:12px;
                    font-family:monospace;resize:none;">${texto}</textarea>
            </div>
        `;
        document.body.appendChild(modal);
        modal.querySelector('#btn-cerrar').onclick = () => modal.remove();
        modal.querySelector('#btn-txt').onclick = () => descargar('pendientes_manga.txt', texto, 'text/plain');
        modal.querySelector('#btn-json').onclick = () => descargar('pendientes_manga.json', json, 'application/json');
        modal.querySelector('#btn-csv').onclick = () => descargar('pendientes_manga.csv', '\uFEFF' + csv, 'text/csv;charset=utf-8');
        modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
    }

    function crearBoton() {
        if (document.getElementById('btn-exportar-tmo')) return;

        const btn = document.createElement('button');
        btn.id = 'btn-exportar-tmo';
        btn.textContent = '📥 Exportar Pendientes';
        btn.style.cssText = `
            position: fixed; bottom: 20px; right: 20px; z-index: 9999999;
            background: #e74c3c; color: white; border: none;
            padding: 10px 16px; border-radius: 8px; font-size: 14px;
            cursor: pointer; box-shadow: 0 4px 10px rgba(0,0,0,0.3);
        `;
        btn.addEventListener('click', () => {
            const datos = exportarTitulos();
            if (datos.length === 0) {
                alert('Primero selecciona "Pendientes" en el dropdown.');
                return;
            }
            mostrarModal(datos);
        });
        document.body.appendChild(btn);
    }

    function iniciar() {
        const lista = document.querySelector('#list-elements');
        if (!lista) {
            setTimeout(iniciar, 500);
            return;
        }
        crearBoton();
        const observer = new MutationObserver(() => {
            if (lista.querySelectorAll('.element').length > 0) crearBoton();
        });
        observer.observe(lista, { childList: true, subtree: true });
    }

    iniciar();

})();
