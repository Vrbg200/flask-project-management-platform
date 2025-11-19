# 🏗️ Arquitectura de SalesFlow

## 📋 Índice

1. [Visión General](#visión-general)
2. [Arquitectura de Alto Nivel](#arquitectura-de-alto-nivel)
3. [Stack Tecnológico](#stack-tecnológico)
4. [Estructura del Proyecto](#estructura-del-proyecto)
5. [Capa de Backend](#capa-de-backend)
6. [Capa de Frontend](#capa-de-frontend)
7. [Base de Datos](#base-de-datos)
8. [Seguridad](#seguridad)
9. [Escalabilidad](#escalabilidad)
10. [Monitoreo y Logging](#monitoreo-y-logging)

---

## Visión General

SalesFlow es un sistema empresarial de gestión de ventas construido con una arquitectura moderna de tres capas:

- **Frontend**: React + TypeScript con Vite
- **Backend**: Node.js + Express + TypeScript
- **Base de Datos**: PostgreSQL con Prisma ORM

### Principios de Diseño

1. **Modularidad**: Código organizado en módulos independientes y reutilizables
2. **Escalabilidad**: Diseño preparado para crecer horizontalmente
3. **Seguridad**: Múltiples capas de protección y validación
4. **Mantenibilidad**: Código limpio, bien documentado y testeado
5. **Performance**: Optimización de consultas y cacheo estratégico

---

## Arquitectura de Alto Nivel

```
┌─────────────────────────────────────────────────────────┐
│                      USUARIOS                           │
│         (Admin, Gerentes, Vendedores)                  │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                   FRONTEND LAYER                        │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   React UI   │  │  React Query │  │   Zustand    │ │
│  │  Components  │  │   (Cache)    │  │   (State)    │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │         React Router (Routing)                   │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────────┬────────────────────────────────────┘
                     │ HTTPS/REST API
                     ▼
┌─────────────────────────────────────────────────────────┐
│                   API GATEWAY                           │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Rate Limiting | CORS | Helmet | Compression    │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                   BACKEND LAYER                         │
│                                                         │
│  ┌────────────────────────────────────────────────┐    │
│  │            Authentication Layer                │    │
│  │         JWT + Refresh Tokens                   │    │
│  └────────────────────────────────────────────────┘    │
│                                                         │
│  ┌───────────┐ ┌───────────┐ ┌────────────────────┐   │
│  │  Routes   │ │Controllers│ │     Services       │   │
│  │  /auth    │→│   Auth    │→│   Business Logic   │   │
│  │  /clientes│→│  Clientes │→│   Validations      │   │
│  │  /ventas  │→│   Ventas  │→│   Calculations     │   │
│  └───────────┘ └───────────┘ └────────────────────┘   │
│                                                         │
│  ┌────────────────────────────────────────────────┐    │
│  │           Middleware Layer                     │    │
│  │  • Authentication                              │    │
│  │  • Authorization (Roles)                       │    │
│  │  • Validation (Zod)                            │    │
│  │  • Error Handling                              │    │
│  │  • Audit Logging                               │    │
│  └────────────────────────────────────────────────┘    │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                    DATA LAYER                           │
│                                                         │
│  ┌────────────────────────────────────────────────┐    │
│  │            Prisma ORM                          │    │
│  │  • Query Builder                               │    │
│  │  • Type Safety                                 │    │
│  │  • Migrations                                  │    │
│  └────────────────────────────────────────────────┘    │
│                                                         │
│  ┌────────────────────────────────────────────────┐    │
│  │         PostgreSQL Database                    │    │
│  │  • Usuarios  • Clientes  • Oportunidades      │    │
│  │  • Productos • Ventas    • Actividades        │    │
│  │  • Auditoría • Metas     • Configuración      │    │
│  └────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

---

## Stack Tecnológico

### Frontend

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| React | 18.2 | Framework UI |
| TypeScript | 5.3 | Tipado estático |
| Vite | 5.0 | Build tool |
| TailwindCSS | 3.4 | Estilos |
| Shadcn/UI | latest | Componentes UI |
| React Router | 6.21 | Navegación |
| React Query | 5.0 | Estado del servidor |
| Zustand | 4.4 | Estado global |
| Recharts | 2.10 | Visualizaciones |
| Zod | 3.22 | Validación |
| Axios | 1.6 | Cliente HTTP |

### Backend

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| Node.js | 18+ | Runtime |
| Express | 4.18 | Framework web |
| TypeScript | 5.3 | Tipado estático |
| Prisma | 5.7 | ORM |
| PostgreSQL | 15+ | Base de datos |
| JWT | 9.0 | Autenticación |
| Bcrypt | 2.4 | Hash passwords |
| Zod | 3.22 | Validación |
| Helmet | 7.1 | Seguridad HTTP |
| Morgan | 1.10 | Logging HTTP |

### DevOps

| Tecnología | Propósito |
|------------|-----------|
| Docker | Contenedorización |
| Docker Compose | Orquestación local |
| Nginx | Servidor web/proxy |
| Redis | Cache (opcional) |
| GitHub Actions | CI/CD |

---

## Estructura del Proyecto

```
salesflow/
│
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          # Esquema de base de datos
│   │   ├── migrations/            # Migraciones
│   │   └── seed.ts                # Datos de prueba
│   │
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.ts        # Configuración DB
│   │   │   └── environment.ts     # Variables de entorno
│   │   │
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts # Autenticación JWT
│   │   │   ├── validation.ts      # Validación de datos
│   │   │   └── errorHandler.ts    # Manejo de errores
│   │   │
│   │   ├── routes/
│   │   │   ├── auth.routes.ts
│   │   │   ├── clientes.routes.ts
│   │   │   ├── oportunidades.routes.ts
│   │   │   ├── productos.routes.ts
│   │   │   ├── ventas.routes.ts
│   │   │   ├── actividades.routes.ts
│   │   │   ├── dashboard.routes.ts
│   │   │   └── reportes.routes.ts
│   │   │
│   │   ├── controllers/          # Lógica de controladores
│   │   ├── services/             # Lógica de negocio
│   │   ├── utils/                # Utilidades
│   │   └── index.ts              # Entry point
│   │
│   ├── tests/                    # Tests
│   ├── .env.example
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── public/
│   │   └── assets/
│   │
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/               # Componentes base (shadcn)
│   │   │   ├── layout/           # Layout components
│   │   │   ├── dashboard/        # Componentes del dashboard
│   │   │   ├── clientes/         # Componentes de clientes
│   │   │   ├── ventas/           # Componentes de ventas
│   │   │   └── shared/           # Componentes compartidos
│   │   │
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Clientes.tsx
│   │   │   ├── Pipeline.tsx
│   │   │   ├── Productos.tsx
│   │   │   ├── Ventas.tsx
│   │   │   ├── Reportes.tsx
│   │   │   └── Login.tsx
│   │   │
│   │   ├── layouts/
│   │   │   ├── MainLayout.tsx
│   │   │   └── AuthLayout.tsx
│   │   │
│   │   ├── context/
│   │   │   ├── AuthContext.tsx
│   │   │   └── ThemeContext.tsx
│   │   │
│   │   ├── services/
│   │   │   ├── api.ts            # Cliente API base
│   │   │   ├── auth.service.ts
│   │   │   ├── clientes.service.ts
│   │   │   └── ventas.service.ts
│   │   │
│   │   ├── hooks/                # Custom hooks
│   │   ├── utils/                # Utilidades
│   │   ├── types/                # TypeScript types
│   │   ├── App.tsx
│   │   └── main.tsx
│   │
│   ├── .env.example
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── docker-compose.yml
├── .gitignore
├── README.md
├── INSTALLATION.md
└── ARCHITECTURE.md
```

---

## Capa de Backend

### Flujo de Request

```
Request → Rate Limiter → CORS → Helmet → Body Parser
    ↓
Authentication Middleware (JWT)
    ↓
Authorization Middleware (Roles)
    ↓
Route Handler
    ↓
Validation (Zod)
    ↓
Controller
    ↓
Service (Business Logic)
    ↓
Prisma ORM
    ↓
PostgreSQL
    ↓
Response ← Error Handler ← Audit Log
```

### Módulos Principales

#### 1. Módulo de Autenticación
```typescript
// Funcionalidades
- Login con JWT
- Refresh token rotation
- Logout
- Gestión de sesiones
- Password hashing con bcrypt
```

#### 2. Módulo de Clientes (CRM)
```typescript
// Funcionalidades
- CRUD de clientes
- Gestión de contactos
- Notas y comentarios
- Historial de interacciones
- Segmentación
```

#### 3. Módulo de Oportunidades (Pipeline)
```typescript
// Funcionalidades
- Gestión de oportunidades
- Pipeline Kanban
- Cambio de etapas
- Cálculo de probabilidad
- Pronóstico de ventas
```

#### 4. Módulo de Ventas
```typescript
// Funcionalidades
- Registro de ventas
- Gestión de items
- Cálculo de totales
- Comisiones
- Historial
```

#### 5. Módulo de Dashboard
```typescript
// Funcionalidades
- Métricas en tiempo real
- Gráficos y visualizaciones
- KPIs personalizables
- Forecast
- Ranking de vendedores
```

---

## Capa de Frontend

### Arquitectura de Componentes

```
App
├── AuthProvider (Context)
│   └── ThemeProvider (Context)
│       └── QueryClientProvider (React Query)
│           └── Router
│               ├── PublicRoutes
│               │   └── Login
│               └── PrivateRoutes
│                   ├── MainLayout
│                   │   ├── Sidebar
│                   │   ├── Topbar
│                   │   └── Content
│                   │       ├── Dashboard
│                   │       ├── Clientes
│                   │       ├── Pipeline
│                   │       ├── Productos
│                   │       ├── Ventas
│                   │       └── Reportes
│                   └── Modals/Dialogs
```

### Estado de la Aplicación

1. **Estado del Servidor** (React Query)
   - Datos de clientes
   - Oportunidades
   - Ventas
   - Métricas

2. **Estado Global** (Zustand)
   - Usuario autenticado
   - Tema (claro/oscuro)
   - Preferencias de UI
   - Notificaciones

3. **Estado Local** (useState)
   - Formularios
   - Modales
   - Interacciones temporales

### Gestión de API

```typescript
// services/api.ts
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000
});

// Interceptor para agregar token
api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Intentar refresh
      const newToken = await refreshAccessToken();
      // Retry request
    }
    return Promise.reject(error);
  }
);
```

---

## Base de Datos

### Diseño del Esquema

#### Relaciones Principales

```
Usuario 1 ──< * Oportunidad
Usuario 1 ──< * Venta
Usuario 1 ──< * Actividad
Usuario 1 ──< * Auditoria

Cliente 1 ──< * Oportunidad
Cliente 1 ──< * Venta
Cliente 1 ──< * Contacto
Cliente 1 ──< * Actividad
Cliente 1 ──< * NotaCliente

Oportunidad 1 ──< * Venta
Oportunidad 1 ──< * Actividad

Venta 1 ──< * ItemVenta
Producto 1 ──< * ItemVenta
```

### Índices y Optimización

```sql
-- Índices para búsquedas frecuentes
CREATE INDEX idx_cliente_email ON clientes(email);
CREATE INDEX idx_cliente_estado ON clientes(estado);
CREATE INDEX idx_oportunidad_etapa ON oportunidades(etapa);
CREATE INDEX idx_oportunidad_fecha_cierre ON oportunidades(fecha_cierre);
CREATE INDEX idx_venta_fecha ON ventas(fecha_venta);
CREATE INDEX idx_auditoria_usuario ON auditoria(usuario_id);
CREATE INDEX idx_auditoria_fecha ON auditoria(created_at);

-- Índices compuestos
CREATE INDEX idx_oportunidad_vendedor_etapa 
  ON oportunidades(vendedor_id, etapa);
CREATE INDEX idx_venta_cliente_fecha 
  ON ventas(cliente_id, fecha_venta DESC);
```

---

## Seguridad

### Capas de Seguridad

#### 1. Autenticación
```
- JWT con RS256 (opcional) o HS256
- Tokens de corta duración (15 min)
- Refresh tokens seguros (7 días)
- Rotación de refresh tokens
```

#### 2. Autorización
```
- Control basado en roles (RBAC)
- Permisos granulares por recurso
- Validación en cada endpoint
```

#### 3. Validación de Datos
```
- Zod schemas en backend y frontend
- Sanitización de inputs
- Prevención de SQL injection (Prisma)
- Validación de tipos
```

#### 4. Protección HTTP
```
- Helmet (headers de seguridad)
- CORS configurado
- Rate limiting
- XSS protection
- CSRF tokens
```

#### 5. Base de Datos
```
- Passwords hasheados (bcrypt, salt rounds: 10)
- Conexiones SSL
- Backup automático
- Encriptación en reposo
```

### Auditoría

Todas las acciones críticas se registran:
```typescript
{
  usuarioId: string,
  accion: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN',
  entidad: 'CLIENTE' | 'VENTA' | 'PRODUCTO',
  entidadId: string,
  detalles: JSON,
  ip: string,
  userAgent: string,
  timestamp: DateTime
}
```

---

## Escalabilidad

### Horizontal Scaling

1. **Backend**: Stateless, puede escalar horizontalmente
2. **Load Balancer**: Nginx/HAProxy para distribución
3. **Database**: PostgreSQL con replicación read/write
4. **Cache**: Redis para sesiones y datos frecuentes

### Optimizaciones

#### Backend
```typescript
// Paginación por defecto
const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 100;

// Eager loading estratégico
prisma.cliente.findMany({
  include: {
    contactos: true,
    oportunidades: { take: 5, orderBy: { createdAt: 'desc' } }
  }
});

// Agregaciones eficientes
prisma.venta.aggregate({
  where: { estado: 'COMPLETADO' },
  _sum: { total: true },
  _count: true
});
```

#### Frontend
```typescript
// Code splitting
const Dashboard = lazy(() => import('./pages/Dashboard'));

// Virtual scrolling para listas grandes
import { FixedSizeList } from 'react-window';

// Memoización
const MemoizedComponent = React.memo(ExpensiveComponent);
```

---

## Monitoreo y Logging

### Logging

```typescript
// Winston para logs estructurados
logger.info('Venta creada', {
  ventaId: venta.id,
  clienteId: venta.clienteId,
  total: venta.total,
  userId: req.usuario.id
});

logger.error('Error al procesar venta', {
  error: error.message,
  stack: error.stack,
  userId: req.usuario.id
});
```

### Métricas Clave

- Tiempo de respuesta de API
- Tasa de errores
- Uso de CPU/Memoria
- Conexiones activas
- Queries lentas (> 100ms)

---

## Próximos Pasos

### v1.1
- WebSockets para actualizaciones en tiempo real
- Sistema de notificaciones push
- Integración con email (SendGrid/AWS SES)
- Reportes avanzados con filtros

### v1.2
- Multi-tenant completo
- Mobile app (React Native)
- Integración con WhatsApp Business
- AI/ML para scoring de leads

---

**Documentación actualizada:** Noviembre 2025
