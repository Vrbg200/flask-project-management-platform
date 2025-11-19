# 📦 Guía de Instalación - SalesFlow

Esta guía te ayudará a instalar y configurar SalesFlow en tu entorno local o en producción.

## 📋 Tabla de Contenidos

1. [Prerequisitos](#prerequisitos)
2. [Instalación Local](#instalación-local)
3. [Configuración de Base de Datos](#configuración-de-base-de-datos)
4. [Variables de Entorno](#variables-de-entorno)
5. [Despliegue con Docker](#despliegue-con-docker)
6. [Despliegue en Producción](#despliegue-en-producción)
7. [Solución de Problemas](#solución-de-problemas)

---

## Prerequisitos

### Software Requerido

```bash
# Versiones mínimas
Node.js: >= 18.0.0
npm: >= 9.0.0
PostgreSQL: >= 15.0
Git: >= 2.30.0
```

### Instalación de Node.js

**macOS (usando Homebrew):**
```bash
brew install node@18
```

**Linux (Ubuntu/Debian):**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**Windows:**
Descarga el instalador desde [nodejs.org](https://nodejs.org)

### Instalación de PostgreSQL

**macOS:**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**Windows:**
Descarga el instalador desde [postgresql.org](https://www.postgresql.org/download/windows/)

---

## Instalación Local

### 1. Clonar el Repositorio

```bash
git clone https://github.com/tu-empresa/salesflow.git
cd salesflow
```

### 2. Instalar Dependencias del Backend

```bash
cd backend
npm install
```

### 3. Instalar Dependencias del Frontend

```bash
cd ../frontend
npm install
```

---

## Configuración de Base de Datos

### 1. Crear Base de Datos

Conectarse a PostgreSQL:
```bash
psql -U postgres
```

Crear base de datos y usuario:
```sql
CREATE DATABASE salesflow;
CREATE USER salesflow_user WITH ENCRYPTED PASSWORD 'tu_password_seguro';
GRANT ALL PRIVILEGES ON DATABASE salesflow TO salesflow_user;
\q
```

### 2. Configurar Variables de Entorno del Backend

Crear archivo `.env` en la carpeta `backend/`:

```bash
cd backend
cp .env.example .env
nano .env  # o usar cualquier editor
```

Contenido del archivo `.env`:

```env
# Database
DATABASE_URL="postgresql://salesflow_user:tu_password_seguro@localhost:5432/salesflow"

# JWT Secrets (CAMBIAR EN PRODUCCIÓN)
JWT_SECRET="tu_secret_super_seguro_cambiar_en_produccion_min_32_caracteres"
JWT_REFRESH_SECRET="tu_refresh_secret_super_seguro_cambiar_en_produccion_min_32"
JWT_EXPIRE="15m"
JWT_REFRESH_EXPIRE="7d"

# Server
PORT=5000
NODE_ENV="development"

# CORS
FRONTEND_URL="http://localhost:5173"

# Email Configuration (Opcional)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="tu_email@empresa.com"
SMTP_PASSWORD="tu_app_password"
SMTP_FROM="SalesFlow <noreply@salesflow.com>"
```

**⚠️ IMPORTANTE:** Genera secrets seguros:
```bash
# En terminal, ejecutar:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Ejecutar Migraciones de Prisma

```bash
cd backend
npx prisma generate
npx prisma migrate dev --name init
```

### 4. Poblar Base de Datos con Datos de Prueba

```bash
npx prisma db seed
```

Esto creará:
- 4 usuarios (admin, gerente, 2 vendedores)
- 5 clientes empresariales
- 5 productos
- 5 oportunidades de venta
- 2 ventas completadas
- Actividades y notas de ejemplo

### 5. Configurar Variables de Entorno del Frontend

Crear archivo `.env` en la carpeta `frontend/`:

```bash
cd ../frontend
cp .env.example .env
nano .env
```

Contenido:
```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=SalesFlow
VITE_APP_VERSION=1.0.0
```

---

## Iniciar la Aplicación

### Backend

Terminal 1:
```bash
cd backend
npm run dev
```

El servidor estará disponible en `http://localhost:5000`

Verificar que funciona:
```bash
curl http://localhost:5000
```

### Frontend

Terminal 2:
```bash
cd frontend
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

### Acceder a la Aplicación

Abre tu navegador en `http://localhost:5173` y usa estas credenciales:

| Rol | Email | Password |
|-----|-------|----------|
| Admin | admin@salesflow.com | Admin123! |
| Gerente | gerente@salesflow.com | Gerente123! |
| Vendedor | vendedor@salesflow.com | Vendedor123! |

---

## Despliegue con Docker

### Opción 1: Docker Compose (Recomendado)

```bash
# En la raíz del proyecto
docker-compose up -d
```

Esto iniciará:
- PostgreSQL en puerto 5432
- Backend en puerto 5000
- Frontend en puerto 3000
- Redis en puerto 6379
- Adminer (admin DB) en puerto 8080

### Opción 2: Construcción Manual

**Backend:**
```bash
cd backend
docker build -t salesflow-backend .
docker run -p 5000:5000 \
  -e DATABASE_URL="postgresql://..." \
  -e JWT_SECRET="..." \
  salesflow-backend
```

**Frontend:**
```bash
cd frontend
docker build -t salesflow-frontend .
docker run -p 3000:80 salesflow-frontend
```

---

## Despliegue en Producción

### Backend en Railway/Render

1. **Crear cuenta** en [Railway](https://railway.app) o [Render](https://render.com)

2. **Conectar repositorio Git**

3. **Configurar variables de entorno:**
   ```
   DATABASE_URL=<tu_neon_postgres_url>
   JWT_SECRET=<secret_generado>
   JWT_REFRESH_SECRET=<refresh_secret_generado>
   NODE_ENV=production
   FRONTEND_URL=<url_de_tu_frontend>
   ```

4. **Configurar build:**
   - Build Command: `npm install && npx prisma generate && npm run build`
   - Start Command: `npm start`

5. **Ejecutar migraciones:**
   ```bash
   npx prisma migrate deploy
   ```

### Frontend en Vercel

1. **Instalar CLI de Vercel:**
   ```bash
   npm i -g vercel
   ```

2. **Desplegar:**
   ```bash
   cd frontend
   vercel
   ```

3. **Configurar variables de entorno:**
   - `VITE_API_URL`: URL de tu backend en Railway/Render

### Base de Datos en Neon/Supabase

**Opción A: Neon**
1. Crear cuenta en [neon.tech](https://neon.tech)
2. Crear nuevo proyecto
3. Copiar connection string
4. Actualizar `DATABASE_URL` en backend

**Opción B: Supabase**
1. Crear cuenta en [supabase.com](https://supabase.com)
2. Crear nuevo proyecto
3. Ir a Settings → Database → Connection string
4. Copiar y usar en `DATABASE_URL`

---

## Verificación Post-Instalación

### 1. Verificar Backend

```bash
# Health check
curl http://localhost:5000

# Test de autenticación
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@salesflow.com","password":"Admin123!"}'
```

### 2. Verificar Base de Datos

```bash
cd backend
npx prisma studio
```

Esto abrirá un navegador en `http://localhost:5555` donde puedes ver tus datos.

### 3. Verificar Frontend

Navega a `http://localhost:5173` y verifica:
- ✅ La página carga correctamente
- ✅ Puedes iniciar sesión
- ✅ El dashboard muestra métricas
- ✅ Las gráficas se renderizan

---

## Solución de Problemas

### Error: "Cannot find module '@prisma/client'"

**Solución:**
```bash
cd backend
npx prisma generate
npm install
```

### Error: "Port 5000 already in use"

**Solución:**
```bash
# Encontrar proceso
lsof -ti:5000

# Matar proceso (macOS/Linux)
kill -9 $(lsof -ti:5000)

# O cambiar puerto en .env
PORT=5001
```

### Error de conexión a PostgreSQL

**Verificar que PostgreSQL está corriendo:**
```bash
# macOS
brew services list

# Linux
sudo systemctl status postgresql

# Probar conexión
psql -U salesflow_user -d salesflow -h localhost
```

### Error: "JWT malformed"

**Solución:**
- Asegúrate de que `JWT_SECRET` esté configurado en `.env`
- Regenera el secret si es necesario
- Limpia cookies/localStorage del navegador

### Frontend no se conecta al Backend

**Verificar CORS:**
1. En `backend/.env`, asegúrate que `FRONTEND_URL` coincida
2. Si usas un puerto diferente, actualízalo
3. Reinicia el servidor backend

### Migraciones de Prisma fallan

**Reset completo (⚠️ borra todos los datos):**
```bash
cd backend
npx prisma migrate reset
npx prisma db seed
```

---

## Scripts Útiles

### Backend

```bash
# Desarrollo con hot-reload
npm run dev

# Build para producción
npm run build

# Iniciar producción
npm start

# Abrir Prisma Studio
npm run prisma:studio

# Crear nueva migración
npx prisma migrate dev --name nombre_migracion

# Formatear código
npm run format

# Linting
npm run lint

# Tests
npm test
```

### Frontend

```bash
# Desarrollo
npm run dev

# Build
npm run build

# Preview de build
npm run preview

# Formatear código
npm run format

# Linting
npm run lint
```

---

## Recursos Adicionales

- **Documentación Prisma:** https://www.prisma.io/docs
- **Documentación React:** https://react.dev
- **Documentación Express:** https://expressjs.com
- **Documentación PostgreSQL:** https://www.postgresql.org/docs

---

## Soporte

Si encuentras problemas:

1. Revisa la [documentación completa](./README.md)
2. Busca en [GitHub Issues](https://github.com/tu-empresa/salesflow/issues)
3. Contacta a soporte: soporte@salesflow.com

---

**¡Listo! Tu instalación de SalesFlow debería estar funcionando correctamente. 🎉**
