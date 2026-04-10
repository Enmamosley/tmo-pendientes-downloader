// ==UserScript==
// @name         ZonaTMO - Exportar Listas de Perfil
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Navega todas las páginas de una lista de perfil y exporta los títulos a TXT, JSON o Excel (CSV)
// @author       You
// @match        https://zonatmo.nakamasweb.com/profile/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // Mapeo de URL a nombre de lista
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

    function getTitulosPagina() {
        const titulos = [];
        document.querySelectorAll('.thumbnail-title h4.text-truncate').forEach(h4 => {
            const titulo = h4.getAttribute('title') || h4.textContent.trim();
            if (titulo) titulos.push(titulo);
        });
        return titulos;
    }

    function getSiguientePagina() {
        const links = document.querySelectorAll('a[rel="next"]');
        for (const link of links) {
            if (link.textContent.includes('Siguiente')) return link.href;
        }
        return null;
    }

    function getPaginaActual() {
        const params = new URLSearchParams(window.location.search);
        return parseInt(params.get('page') || '1');
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
        const encabezado = ['#', 'Título'];
        const filas = datos.map((titulo, i) => [
            i + 1,
            `"${titulo.replace(/"/g, '""')}"`
        ]);
        return [encabezado, ...filas].map(f => f.join(',')).join('\n');
    }

    function mostrarModal(datos, nombre) {
        const texto = datos.map((t, i) => `${i + 1}. ${t}`).join('\n');
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
                <h3 style="margin:0;color:#cba6f7;">📋 ${datos.length} títulos — ${nombre}</h3>
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
        modal.querySelector('#btn-cerrar').onclick = () => {
            modal.remove();
            sessionStorage.removeItem('tmo_titulos');
        };
        modal.querySelector('#btn-txt').onclick = () => descargar(`${nombre}.txt`, texto, 'text/plain');
        modal.querySelector('#btn-json').onclick = () => descargar(`${nombre}.json`, json, 'application/json');
        modal.querySelector('#btn-csv').onclick = () => descargar(`${nombre}.csv`, '\uFEFF' + csv, 'text/csv;charset=utf-8');
        modal.addEventListener('click', e => { if (e.target === modal) { modal.remove(); sessionStorage.removeItem('tmo_titulos'); } });
    }

    function actualizarBoton(btn, texto, color) {
        btn.textContent = texto;
        btn.style.background = color;
    }

    function crearBoton() {
        if (document.getElementById('btn-exportar-perfil')) return;

        const btn = document.createElement('button');
        btn.id = 'btn-exportar-perfil';
        btn.textContent = '📥 Exportar Lista Completa';
        btn.style.cssText = `
            position: fixed; bottom: 20px; right: 20px; z-index: 9999999;
            background: #e74c3c; color: white; border: none;
            padding: 10px 16px; border-radius: 8px; font-size: 14px;
            cursor: pointer; box-shadow: 0 4px 10px rgba(0,0,0,0.3);
        `;

        btn.addEventListener('click', () => {
            // Si ya hay datos acumulados en sessionStorage (venimos de paginación automática), mostrar modal
            const guardados = sessionStorage.getItem('tmo_titulos');
            if (guardados) {
                const datos = JSON.parse(guardados);
                const nombre = getNombreLista();
                mostrarModal(datos, nombre);
                return;
            }

            // Iniciar recolección desde página 1
            const base = window.location.pathname.split('?')[0];
            const paginaActual = getPaginaActual();

            if (paginaActual !== 1) {
                // Volver a página 1 para empezar
                sessionStorage.setItem('tmo_recolectando', 'true');
                sessionStorage.removeItem('tmo_titulos');
                window.location.href = base + '?page=1';
                return;
            }

            iniciarRecoleccion(btn);
        });

        document.body.appendChild(btn);
    }

    function iniciarRecoleccion(btn) {
        sessionStorage.setItem('tmo_recolectando', 'true');
        sessionStorage.removeItem('tmo_titulos');
        recolectarPagina(btn);
    }

    function recolectarPagina(btn) {
        const paginaActual = getPaginaActual();
        const siguientePagina = getSiguientePagina();

        // Leer títulos de esta página
        const titulosExistentes = JSON.parse(sessionStorage.getItem('tmo_titulos') || '[]');
        const titulosNuevos = getTitulosPagina();
        const total = [...titulosExistentes, ...titulosNuevos];
        sessionStorage.setItem('tmo_titulos', JSON.stringify(total));

        if (siguientePagina) {
            actualizarBoton(btn, `⏳ Página ${paginaActual}... (${total.length} títulos)`, '#f39c12');
            setTimeout(() => {
                window.location.href = siguientePagina;
            }, 800);
        } else {
            // Última página — mostrar modal
            sessionStorage.removeItem('tmo_recolectando');
            actualizarBoton(btn, `✅ ${total.length} títulos`, '#27ae60');
            const nombre = getNombreLista();
            mostrarModal(total, nombre);
        }
    }

    // Al cargar la página, verificar si estamos en medio de una recolección
    function verificarRecoleccion() {
        const recolectando = sessionStorage.getItem('tmo_recolectando');
        if (recolectando) {
            const btn = document.getElementById('btn-exportar-perfil');
            if (btn) recolectarPagina(btn);
        }

        // Si ya terminamos y hay datos, mostrar modal automáticamente
        const guardados = sessionStorage.getItem('tmo_titulos');
        const recolectandoAun = sessionStorage.getItem('tmo_recolectando');
        if (guardados && !recolectandoAun) {
            const datos = JSON.parse(guardados);
            const nombre = getNombreLista();
            mostrarModal(datos, nombre);
        }
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
