# 🚀 SalesFlow - Sistema Corporativo de Gestión de Ventas

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

Sistema empresarial completo para gestión de ventas, CRM, pipeline, productos y análisis predictivo.

## 📋 Características Principales

### 🎯 Módulos del Sistema
- **CRM Corporativo**: Gestión completa de clientes con historial de interacciones
- **Pipeline de Ventas**: Sistema Kanban con etapas personalizables
- **Gestión de Productos**: Inventario, precios, categorías y costos
- **Módulo de Ventas**: Registro de transacciones y cotizaciones PDF
- **Dashboard Analítico**: Métricas en tiempo real y KPIs personalizables
- **Pronóstico de Ventas**: Predicción de ingresos con algoritmos inteligentes
- **Sistema de Roles**: Admin, Gerente y Vendedor con permisos específicos
- **Auditoría**: Log completo de actividades del sistema

### 🔒 Seguridad Enterprise
- Autenticación JWT con refresh tokens
- Encriptación bcrypt para contraseñas
- Rate limiting y protección DDoS
- Validación exhaustiva de datos
- Protección XSS y CSRF
- Middleware de autorización por roles

## 🛠️ Stack Tecnológico

### Frontend
- **Framework**: React 18 + Vite
- **Estilos**: TailwindCSS + Shadcn/UI
- **Gráficos**: Recharts + Chart.js
- **Animaciones**: Framer Motion
- **Estado**: Context API + React Query
- **Routing**: React Router v6
- **Formularios**: React Hook Form + Zod

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Base de Datos**: PostgreSQL 15
- **ORM**: Prisma
- **Autenticación**: JWT + bcrypt
- **Validación**: Zod
- **Documentación**: Swagger/OpenAPI

## 📦 Instalación

### Prerequisitos
```bash
node >= 18.0.0
npm >= 9.0.0
postgresql >= 15.0
```

### 1. Clonar el Repositorio
```bash
git clone https://github.com/tu-empresa/salesflow.git
cd salesflow
```

### 2. Configurar Backend

```bash
cd backend
npm install
```

Crear archivo `.env`:
```env
# Database
DATABASE_URL="postgresql://usuario:password@localhost:5432/salesflow"

# JWT
JWT_SECRET="tu_secret_super_seguro_cambiar_en_produccion"
JWT_REFRESH_SECRET="tu_refresh_secret_super_seguro"
JWT_EXPIRE="15m"
JWT_REFRESH_EXPIRE="7d"

# Server
PORT=5000
NODE_ENV="development"

# CORS
FRONTEND_URL="http://localhost:5173"

# Email (opcional)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="tu_email@empresa.com"
SMTP_PASSWORD="tu_password"
```

Ejecutar migraciones:
```bash
npx prisma migrate dev
npx prisma db seed
```

Iniciar servidor:
```bash
npm run dev
```

### 3. Configurar Frontend

```bash
cd frontend
npm install
```

Crear archivo `.env`:
```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=SalesFlow
VITE_APP_VERSION=1.0.0
```

Iniciar aplicación:
```bash
npm run dev
```

## 🔑 Usuarios de Prueba

Después del seed, puedes usar:

| Email | Password | Rol |
|-------|----------|-----|
| admin@salesflow.com | Admin123! | Administrador |
| gerente@salesflow.com | Gerente123! | Gerente |
| vendedor@salesflow.com | Vendedor123! | Vendedor |

## 📚 Documentación de API

### Autenticación

#### POST /api/auth/login
```json
{
  "email": "usuario@empresa.com",
  "password": "password123"
}
```

**Respuesta**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "usuario@empresa.com",
      "name": "Usuario",
      "role": "VENDEDOR"
    },
    "accessToken": "jwt_token",
    "refreshToken": "refresh_token"
  }
}
```

### Clientes

#### GET /api/clientes
Lista todos los clientes (paginado)

**Query params**:
- `page`: número de página (default: 1)
- `limit`: registros por página (default: 10)
- `search`: búsqueda por nombre/email
- `status`: filtrar por estado (ACTIVO/INACTIVO)

#### POST /api/clientes
```json
{
  "nombre": "Empresa XYZ",
  "email": "contacto@empresaxyz.com",
  "telefono": "+502 1234-5678",
  "direccion": "Ciudad de Guatemala",
  "tipo": "EMPRESA",
  "industria": "TECNOLOGIA"
}
```

### Oportunidades (Pipeline)

#### GET /api/oportunidades
Lista oportunidades de venta

#### POST /api/oportunidades
```json
{
  "titulo": "Venta de Software CRM",
  "clienteId": "uuid",
  "valor": 50000,
  "etapa": "CALIFICADO",
  "probabilidad": 60,
  "fechaCierre": "2025-12-31"
}
```

#### PATCH /api/oportunidades/:id/etapa
```json
{
  "etapa": "NEGOCIACION"
}
```

### Productos

#### GET /api/productos
Lista productos disponibles

#### POST /api/productos
```json
{
  "nombre": "Licencia Anual CRM",
  "descripcion": "Licencia completa con soporte 24/7",
  "precio": 999.99,
  "costo": 400.00,
  "categoria": "SOFTWARE",
  "stock": 100
}
```

### Ventas

#### POST /api/ventas
```json
{
  "clienteId": "uuid",
  "oportunidadId": "uuid",
  "items": [
    {
      "productoId": "uuid",
      "cantidad": 1,
      "precioUnitario": 999.99
    }
  ],
  "metodoPago": "TRANSFERENCIA",
  "notas": "Cliente premium"
}
```

### Dashboard

#### GET /api/dashboard/metricas
Retorna métricas generales

#### GET /api/dashboard/forecast
Retorna pronóstico de ventas

## 🐳 Docker

### Despliegue con Docker Compose

```bash
docker-compose up -d
```

El archivo `docker-compose.yml` incluye:
- Backend Node.js
- Frontend Nginx
- PostgreSQL
- Redis (cache)

## 📊 Base de Datos

### Esquema Prisma

```prisma
model Usuario {
  id            String   @id @default(uuid())
  email         String   @unique
  password      String
  nombre        String
  rol           Rol      @default(VENDEDOR)
  activo        Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model Cliente {
  id            String   @id @default(uuid())
  nombre        String
  email         String   @unique
  telefono      String?
  direccion     String?
  tipo          TipoCliente
  industria     String?
  estado        Estado   @default(ACTIVO)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model Oportunidad {
  id            String   @id @default(uuid())
  titulo        String
  clienteId     String
  valor         Float
  etapa         EtapaVenta
  probabilidad  Int
  fechaCierre   DateTime
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
npm run test:coverage
```

### Frontend Tests
```bash
cd frontend
npm test
npm run test:e2e
```

## 🚀 Despliegue en Producción

### Backend (Railway/Render)

1. Conectar repositorio
2. Configurar variables de entorno
3. Ejecutar comando build: `npm install && npx prisma generate && npm run build`
4. Comando start: `npm start`

### Frontend (Vercel)

1. Importar proyecto desde Git
2. Framework preset: Vite
3. Build command: `npm run build`
4. Output directory: `dist`

### Base de Datos (Neon/Supabase)

1. Crear base de datos PostgreSQL
2. Copiar connection string
3. Actualizar `DATABASE_URL` en variables de entorno
4. Ejecutar migraciones: `npx prisma migrate deploy`

## 📈 Roadmap

### v1.1 (Q1 2026)
- [ ] Integración con WhatsApp Business
- [ ] Módulo de marketing automation
- [ ] Dashboard personalizable drag-and-drop
- [ ] Reportes avanzados con BI

### v1.2 (Q2 2026)
- [ ] Mobile app (React Native)
- [ ] Integración con contabilidad
- [ ] AI para scoring de leads
- [ ] Multi-tenant completo

## 🤝 Contribución

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más información.

## 👥 Equipo

- **Arquitectura**: Equipo de desarrollo SalesFlow
- **Diseño UX/UI**: Equipo de diseño
- **DevOps**: Equipo de infraestructura

## 📞 Soporte

- Email: soporte@salesflow.com
- Documentación: https://docs.salesflow.com
- Comunidad: https://community.salesflow.com

---

**Hecho con ❤️ para empresas que buscan crecer**
