# Conexiones de ChambaFast

Angular se comunica con FastAPI por HTTP. FastAPI utiliza las tablas existentes de
`ChambaFastDB` en SQL Server 2025. El arranque no crea tablas ni carga datos demo.

## Backend

Requisitos: Python compatible con `backend/pyproject.toml`, uv, SQL Server activo y
ODBC Driver 18 for SQL Server.

Desde `backend`:

```powershell
uv sync
uv run backend
```

La API escucha en `http://127.0.0.1:8000`. Por defecto conecta con `localhost`,
base `ChambaFastDB`, usando la identidad de Windows que inicia el backend.
No utiliza el usuario de Windows del visitante del navegador.

Para cambiar la conexión, antes de iniciar el backend:

```powershell
$env:SQLSERVER_CONNECTION_STRING = 'DRIVER={ODBC Driver 18 for SQL Server};SERVER=DESKTOP-S1H599Q;DATABASE=ChambaFastDB;Trusted_Connection=yes;Encrypt=yes;TrustServerCertificate=yes;'
$env:FRONTEND_ORIGINS = 'http://localhost:4200,http://127.0.0.1:4200'
uv run backend
```

`TrustServerCertificate=yes` permite el certificado local de esta instalación.
En un servidor con certificado válido utiliza `TrustServerCertificate=no`.
Si se utiliza autenticación SQL, configura la cadena de conexión mediante variables
de entorno sin guardar contraseñas en el repositorio.

## Frontend

Desde `frontend`:

```powershell
npm start
```

Abre `http://localhost:4200`. La dirección de FastAPI se configura mediante
`apiUrl` en `frontend/src/environments/environment.ts`.
Si cambia el origen del frontend, inclúyelo también en `FRONTEND_ORIGINS`.

El adaptador HTTP implementa el contrato `ApiChambaFast`. Utiliza el token Bearer
devuelto por el backend y lo conserva en `sessionStorage` durante la sesión de la
pestaña. No guarda contraseñas y no envía tokens a la caché de renderizado SSR.
El cierre de sesión elimina el token del navegador; no agrega rutas nuevas al backend.

Las cuentas y datos disponibles son los de SQL Server, no los de los servicios demo.
No se modificaron componentes, reglas de negocio ni el esquema de la base de datos.
