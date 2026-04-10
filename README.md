# ZonaTMO - Exportar Pendientes 

Script de Tampermonkey para exportar tu lista de manga/manhua/manhwa pendientes de [ZonaTMO](https://zonatmo.nakamasweb.com/).

---

## ¿Qué hace?

Agrega un botón rojo ** Exportar Pendientes** en la esquina inferior derecha de la página. Al hacer clic, muestra un modal con todos tus títulos pendientes y te permite descargarlos en tres formatos:

| Formato | Descripción |
|---|---|
| **TXT** | Lista numerada con título, tipo, progreso y URL |
| **JSON** | Datos estructurados, ideal para procesar con otros programas |
| **Excel (CSV)** | Se abre directamente en Excel con columnas: #, Título, Tipo, Progreso, URL |

---

## Requisitos

- Navegador Chrome, Edge o Firefox
- Extensión **Tampermonkey** instalada
  - [Chrome / Edge](https://www.tampermonkey.net/)
  - [Firefox](https://addons.mozilla.org/es/firefox/addon/tampermonkey/)

---

## Instalación

1. Instala Tampermonkey en tu navegador
2. Abre el Dashboard de Tampermonkey
3. Haz clic en **"Crear nuevo script"**
4. Borra todo el contenido que aparece por defecto
5. Copia y pega el contenido del archivo `zonatmo-exportar-pendientes.user.js`
6. Guarda con **Ctrl+S**

---

## Uso

1. Ve a [https://zonatmo.nakamasweb.com/](https://zonatmo.nakamasweb.com/)
2. Inicia sesión si no lo has hecho
3. Haz clic en **"Listas de programación"** en el menú
4. Selecciona **"Pendientes"** en el dropdown
5. Espera a que cargue la lista
6. Haz clic en el botón rojo **📥 Exportar Pendientes** (esquina inferior derecha)
7. Elige el formato de descarga

---

## Ejemplo de salida TXT

```
1. [MANGA] Mushoku Tensei: Isekai Ittara Honki Dasu | Progreso: 115.00 / 117.00
   https://zonatmo.nakamasweb.com/library/manga/8635/mushokutenseiisekaiittarahonkidasu

2. [MANHUA] Tales of Demons and Gods | Progreso: 476.50 / 511.00
   https://zonatmo.nakamasweb.com/library/manhua/12956/tales-of-demons-and-gods
```

## Ejemplo de salida CSV (Excel)

| # | Título | Tipo | Progreso | URL |
|---|---|---|---|---|
| 1 | Mushoku Tensei | MANGA | 115.00 / 117.00 | https://... |
| 2 | Tales of Demons and Gods | MANHUA | 476.50 / 511.00 | https://... |

---

## Notas

- El CSV incluye BOM (`\uFEFF`) para que Excel muestre correctamente tildes y caracteres especiales
- El script solo funciona cuando la lista de pendientes está cargada en pantalla
- Compatible con Chrome, Edge y Firefox

---

## Versión

**v1.5** — Soporte para TXT, JSON y Excel (CSV)
