# habito1-tracker

Tracker personal de los 7 hábitos de Covey: rituales diarios (Mañana/Noche) y revisiones periódicas (semanal, mensual, trimestral, anual). Lo uso a diario desde el celular.
React 18 (Create React App) + Firebase (Auth con Google + Firestore). Publicado en https://fiorfida.github.io/habito1-tracker.

## Estructura
- `src/App.js` — estado global, carga/guardado y pestañas.
- `src/views/` — pantallas:
  - **Home**: resumen del día y qué está pendiente.
  - **Mañana** (`Manana.js`): 4 pasos — Misión, Visión (+ "Mis 8 roles"), Adaptación diaria (tarea clave + "🎯 Mi fin para hoy"), Anticipación proactiva.
  - **Noche** (`Noche.js`): cierre del día; disponible desde las 19:00 (`NOCHE_DESDE` en `lib/fechas.js`).
  - **Periódica** (`Periodica.js`): Semanal (`RevisionSemanal.js`, dom–sáb), Mensual (días 1–7), Trimestral + plan, Anual (15/12–31/01, edita misión/roles), Pendientes, 🔥 Chispa.
  - **Resumen**: estadísticas por período y exportación a Drive.
  - **Historial**: línea de tiempo (más reciente primero) + subvista Proactividad.
- `src/lib/` — lógica pura (fechas, períodos, proactividad, hábitos, fin, Drive, exportar).
- `src/content/contenido.js` — textos, roles y principios por defecto.
- `src/components/` — piezas de UI compartidas. `theme.js` / `responsive.css` — estilos.

## Datos
- Fuente de verdad: Firestore `users/{uid}/{colección}/{docId}` (colecciones en `COLECCIONES`, `lib/datos.js`). Escritura con `merge:true`.
- Copia local en `localStorage` (`habito1_*`) como fallback; guardados fallidos van a la cola `habito1_pendientes_sync`.
- Fechas en hora de Buenos Aires; claves de semana = domingo (`plan/{domingo}`).
- Export opcional a Google Drive (carpeta "Tracker — Registros"); el permiso dura 1 h.
- Link "backup" en el encabezado descarga todo en JSON.
- Antes de cambiar el esquema de Firestore: mostrame actual, propuesto y migración.

## Comandos
- `npm start` — dev en http://localhost:3000 (config `habito1-tracker` en `.claude/launch.json`).
- `npx react-scripts test --watchAll=false` — tests (hoy solo `src/lib/proactividad.test.js`).
- `npm run deploy` — build + publica `build/` en la rama `gh-pages`.

## Reglas
- Toda la interfaz en español (rioplatense, como está).
- **Siempre preguntame antes de hacer push o deploy** (y antes de mergear a `main`). Commit solo después de que diga "aprobado".
- Una rama `feature/<nombre>` por cambio.
- Probá los cambios en el panel del navegador **en tamaño celular** (y también compu), con capturas.

## Problemas conocidos (ya resueltos / a tener en cuenta)
- **El dev server escribe en mi Firestore real.** Para probar sin tocar datos: bloquear fetch/XHR/sendBeacon a `firestore.googleapis.com` en la pestaña después de cargar, y al terminar vaciar `habito1_pendientes_sync` y recargar. Editar código con el bloqueo puesto dispara hot reload y pisa el cache local: editar antes de bloquear.
- Para probar la Noche antes de las 19 h: bajar `NOCHE_DESDE` temporalmente y restaurarlo con `git checkout`.
- `config/chispa` se leía un nivel arriba y no se veía al recargar (corregido en Fase 4b).
- `node_modules/` y `build/` ya no están versionados: cuidado al mergear ramas viejas.
- En Windows el dev server bloquea `node_modules`: detenerlo antes de mover carpetas.
- El `README.md` está desactualizado (dice que los datos van solo a localStorage).
