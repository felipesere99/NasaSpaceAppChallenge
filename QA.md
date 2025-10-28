# QA

Guía resumida para verificar que el frontend y el backend funcionen correctamente antes de entregar cambios.

## 1. Preparación del entorno

- **Backend**
  - `cd NasaSpaceAppChallengeBackend`
  - `npm install`
  - Revisar `.env` (se suministra con valores por defecto):
    ```
    PORT=3000
    JWT_SECRET=dev-secret-secret
    FORECAST_API_DAYS=10
    FORECAST_DAYS_TO_FETCH=7
    ```
  - Si querés usar otra base de datos de prueba, exportá `SQLITE_DB_PATH` antes de arrancar el server (por ejemplo `SQLITE_DB_PATH=:memory:`).

- **Frontend**
  - `cd NasaSpaceAppChallenge`
  - `npm install`

## 2. Pruebas automatizadas

- **Frontend (lint + unit tests)**
  - `npm run qa` → ejecuta `eslint` y `node --test`.
  - `npm run ci` → agrega el build de producción al flujo QA.

- **Backend (API + base de datos en memoria)**
  - `npm test` → corre `node --test` con una base SQLite en memoria y mocks del weather service.
  - `npm run ci` → útil en pipelines (usa `npm test`, y si existiera `npm run lint` se dispararía automáticamente).

> Los tests del backend cubren validaciones de `/api/weather`, el flujo completo de registro/login/perfil y la protección de rutas de favoritos.

## 3. Smoke test manual

1. **Arrancar servicios**
   - Backend: `npm run dev` dentro de `NasaSpaceAppChallengeBackend` (deberías ver “Servidor corriendo…” y “Conectado a la base de datos…”).
   - Frontend: `npm run dev -- --host` dentro de `NasaSpaceAppChallenge` (Vite expone `http://localhost:5173/`).
2. **Flujos críticos**
   - Registro + login (verificá que el header muestre el botón de perfil y el nuevo botón “Salir”).
   - Consulta rápida de clima desde la home → confirmar que se renderiza el resultado.
   - Navegar al configurador (`/dates`), elegir fecha/ubicación, obtener forecast y chequear que los botones de descarga funcionen (JSON/CSV).
   - Guardar una ubicación favorita y verificar su forecast desde el perfil.
3. **Errores esperados**
   - Login con credenciales inválidas muestra mensaje de error.
   - Consulta a `/dates` sin seleccionar métricas debería deshabilitar el botón “Get Forecast”.
   - Favoritos protegidos: acceder sin token redirige al login o responde 401 desde el backend.

## 4. QA de API (Postman / manual)

- **Clima puntual**  
  `GET http://localhost:3000/api/weather?latitude=-34.6&longitude=-58.4&date=2024-10-01`  
  Esperar 200 + payload con `type`, `temperature`, etc.

- **Validaciones**  
  - Faltan parámetros → status 400 con mensaje `"Faltan parámetros requeridos..."`.
  - Latitud/longitud fuera de rango → status 400.

- **Usuarios**
  - `POST /api/users/register` (`{ username, password }`) → 201 + user.
  - `POST /api/users/login` → 200 + token (guardar en Postman como variable).
  - `GET /api/users/profile` con header `Authorization: Bearer <token>` → 200 + datos del usuario.
  - `PUT /api/users/profile` para cambiar username o password (requiere `currentPassword` si se cambia la password).

- **Favoritos**
  - Todas las rutas (`/api/favorite-locations/...`) requieren header `Authorization`. Sin token responden 401.

## 5. Observabilidad y mantenimiento

- El backend usa `morgan` + `console.error`; mantené esos logs visibles mientras probás.
- Para depurar pruebas de backend podés exportar `SQLITE_DB_PATH=/tmp/qa.db` y revisar el archivo resultante.
- Verificá que `npm run build` (frontend) y `npm run dev` (frontend/backend) sigan funcionando después de cada cambio grande.

## 6. Checklist rápido antes de entregar

- [ ] `npm test` dentro de `NasaSpaceAppChallengeBackend`
- [ ] `npm run qa` dentro de `NasaSpaceAppChallenge`
- [ ] Smoke test manual completado (registro/login, consulta, favoritos, descargas)
- [ ] Endpoints críticos verificados via Postman o script
- [ ] Logs revisados y sin errores inesperados
