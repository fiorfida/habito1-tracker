# Hábito 1 — Tracker Personal
## Instrucciones de instalación para Windows

---

## PASO 1 — Instalar Node.js (una sola vez)

1. Abrí tu navegador y entrá a: https://nodejs.org
2. Hacé clic en el botón verde grande que dice **"LTS"** (la versión estable)
3. Descargá el instalador (.msi) y ejecutalo
4. Aceptá todo con "Next" → "Next" → "Install"
5. Cuando termine, **reiniciá tu PC**

Para verificar que quedó bien instalado:
- Abrí el menú Inicio → buscá "cmd" → Enter
- Escribí: `node --version`
- Deberías ver algo como: `v20.x.x`

---

## PASO 2 — Instalar las dependencias de la app (una sola vez)

1. Descomprimí la carpeta `habito1-tracker` donde quieras (por ejemplo en `C:\habito1-tracker`)
2. Abrí el menú Inicio → buscá "cmd" → Enter
3. Navegá a la carpeta con este comando (ajustá la ruta si la pusiste en otro lado):
   ```
   cd C:\habito1-tracker
   ```
4. Ejecutá:
   ```
   npm install
   ```
5. Esperá que termine (puede tardar 1-2 minutos la primera vez). Cuando veas el cursor parpadeando de nuevo, terminó.

---

## PASO 3 — Correr la app (cada vez que la quieras usar)

1. Abrí "cmd"
2. Navegá a la carpeta:
   ```
   cd C:\habito1-tracker
   ```
3. Ejecutá:
   ```
   npm start
   ```
4. Se va a abrir automáticamente en tu navegador en: http://localhost:3000

Para cerrarla: volvé al cmd y apretá `Ctrl + C`

---

## ¿Dónde se guardan mis datos?

Los datos quedan guardados en el **localStorage de tu navegador** (Chrome, Edge, etc.).

**Importante:** usá siempre el mismo navegador para que tus datos estén ahí.

---

## ¿Cómo agrego nuevas funcionalidades sin perder la historia?

Muy simple:
1. Pedile a Claude que modifique el archivo `src/App.js`
2. Reemplazá el contenido de ese archivo con el nuevo código
3. Los datos NO se tocan — están guardados en el navegador, no en el código

Nunca pierdas tus datos por actualizar el código.

---

## ¿Cómo hago backup de mis datos?

Abrí la app → abrí la consola del navegador con `F12` → tab "Console" → pegá esto:

```javascript
console.log(localStorage.getItem('habito1_registros'))
```

Copiá el resultado y guardalo en un .txt. Para restaurarlo:

```javascript
localStorage.setItem('habito1_registros', 'PEGA_AQUI_TU_BACKUP')
```

---

## Problemas frecuentes

**"npm no se reconoce como comando"**
→ Node.js no quedó bien instalado. Repetí el Paso 1 y reiniciá la PC.

**"Puerto 3000 ya está en uso"**
→ Ya hay una instancia corriendo. Cerrá la otra o usá otro puerto: `set PORT=3001 && npm start`

**Los datos desaparecieron**
→ Probablemente cambiaste de navegador o limpiaste el caché. Usá siempre el mismo navegador.
