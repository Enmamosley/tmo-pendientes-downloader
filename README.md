# ZonaTMO - Exportar Listas 

Scripts de Tampermonkey para exportar tus listas de manga/manhua/manhwa de [ZonaTMO](https://zonatmo.nakamasweb.com/).

Hay dos scripts disponibles según desde dónde quieras exportar:

| Script | Archivo | Página |
|---|---|---|
| **Exportar Pendientes** | `exportar-pendientes.user.js` | Página principal (listas personalizadas) |
| **Exportar Perfil** | `perfil-exportar.user.js` | Páginas de perfil con paginación |

---

## Requisitos

- Navegador Chrome, Edge o Firefox
- Extensión **Tampermonkey** instalada
  - [Chrome / Edge](https://www.tampermonkey.net/)
  - [Firefox](https://addons.mozilla.org/es/firefox/addon/tampermonkey/)

---

## Instalación (ambos scripts)

1. Instala Tampermonkey en tu navegador
2. Abre el Dashboard de Tampermonkey
3. Haz clic en **"Crear nuevo script"**
4. Borra todo el contenido que aparece por defecto
5. Copia y pega el contenido del archivo `.user.js` que quieras instalar
6. Guarda con **Ctrl+S**
7. Repite para el segundo script si lo necesitas

---

## Script 1 — Exportar Pendientes

**Archivo:** `zonatmo-exportar-pendientes.user.js`

Funciona en la página principal de ZonaTMO donde tienes tus listas personalizadas (el dropdown con "Pendientes", "Siguiendo", etc.).

### Uso

1. Ve a [https://zonatmo.nakamasweb.com/](https://zonatmo.nakamasweb.com/)
2. Inicia sesión si no lo has hecho
3. Haz clic en **"Listas de programación"** en el menú
4. Selecciona la lista que quieras en el dropdown (ej. "Pendientes")
5. Espera a que cargue la lista
6. Haz clic en el botón rojo **📥 Exportar Pendientes** (esquina inferior derecha)
7. Elige el formato de descarga — el archivo se llamará igual que la lista seleccionada

### Formatos de salida

| Formato | Columnas |
|---|---|
| **TXT** | Lista numerada con título, tipo, progreso y URL |
| **JSON** | Datos estructurados |
| **Excel (CSV)** | #, Título, Tipo, Progreso, URL |

### Ejemplo TXT

```
1. [MANGA] Mushoku Tensei: Isekai Ittara Honki Dasu | Progreso: 115.00 / 117.00
   https://zonatmo.nakamasweb.com/library/manga/8635/mushokutenseiisekaiittarahonkidasu

2. [MANHUA] Tales of Demons and Gods | Progreso: 476.50 / 511.00
   https://zonatmo.nakamasweb.com/library/manhua/12956/tales-of-demons-and-gods
```

---

## Script 2 — Exportar Perfil (con paginación automática)

**Archivo:** `zonatmo-perfil-exportar.user.js`

Funciona en las páginas de perfil que tienen paginación. Navega automáticamente por todas las páginas y al terminar exporta la lista completa.

### Páginas compatibles

| URL | Lista |
|---|---|
| `https://zonatmo.nakamasweb.com/profile/pending` | Pendientes |
| `https://zonatmo.nakamasweb.com/profile/follow` | Siguiendo |
| `https://zonatmo.nakamasweb.com/profile/read` | Leídos |
| `https://zonatmo.nakamasweb.com/profile/wish` | Deseados |
| `https://zonatmo.nakamasweb.com/profile/have` | Tengo |
| `https://zonatmo.nakamasweb.com/profile/abandoned` | Abandonados |

### Uso

1. Ve a cualquiera de las URLs de perfil listadas arriba
2. Aparecerá el botón rojo **📥 Exportar Lista Completa** en la esquina inferior derecha
3. Haz clic en el botón
4. El script navega automáticamente por todas las páginas — el botón muestra el progreso:
   `⏳ Página 3... (87 títulos)`
5. Al terminar abre el modal con las opciones de descarga
6. El archivo se descarga con el nombre de la lista (ej. `Siguiendo.csv`, `Pendientes.txt`)

### Formatos de salida

| Formato | Columnas |
|---|---|
| **TXT** | Lista numerada con títulos |
| **JSON** | Array de títulos |
| **Excel (CSV)** | #, Título |

### Ejemplo TXT

```
1. Black Haze
2. Mushoku Tensei
3. Tales of Demons and Gods
```

### Notas importantes

- El script usa `sessionStorage` para acumular títulos entre páginas — no cierres el navegador durante la recolección
- Si no estás en la página 1 al hacer clic, te redirige automáticamente al inicio
- Hay una pausa de 800ms entre páginas para no saturar el servidor
- Al cerrar el modal se limpian los datos temporales

---

## Notas generales

- Los CSV incluyen BOM (`\uFEFF`) para que Excel muestre correctamente tildes y caracteres especiales
- Compatibles con Chrome, Edge y Firefox
- Ambos scripts pueden estar instalados al mismo tiempo sin conflictos

---

## Versiones

| Script | Versión |
|---|---|
| Exportar Pendientes | v1.6 |
| Exportar Perfil | v1.0 |
