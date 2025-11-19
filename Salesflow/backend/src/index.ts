import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Rutas
import authRoutes from './routes/auth.routes';
import usuariosRoutes from './routes/usuarios.routes';
import clientesRoutes from './routes/clientes.routes';
import oportunidadesRoutes from './routes/oportunidades.routes';
import productosRoutes from './routes/productos.routes';
import ventasRoutes from './routes/ventas.routes';
import actividadesRoutes from './routes/actividades.routes';
import dashboardRoutes from './routes/dashboard.routes';
import reportesRoutes from './routes/reportes.routes';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 5000;

// ===== MIDDLEWARES DE SEGURIDAD =====
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // límite de 100 requests por IP
  message: 'Demasiadas peticiones desde esta IP, por favor intenta de nuevo más tarde.'
});

app.use('/api/', limiter);

// ===== MIDDLEWARES GENERALES =====
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));

// ===== RUTAS =====
app.get('/', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'SalesFlow API v1.0',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      usuarios: '/api/usuarios',
      clientes: '/api/clientes',
      oportunidades: '/api/oportunidades',
      productos: '/api/productos',
      ventas: '/api/ventas',
      actividades: '/api/actividades',
      dashboard: '/api/dashboard',
      reportes: '/api/reportes'
    }
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/oportunidades', oportunidadesRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/ventas', ventasRoutes);
app.use('/api/actividades', actividadesRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reportes', reportesRoutes);

// ===== MANEJO DE ERRORES =====
interface ErrorResponse {
  success: false;
  error: string;
  details?: any;
  stack?: string;
}

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);

  const response: ErrorResponse = {
    success: false,
    error: err.message || 'Error interno del servidor'
  };

  if (process.env.NODE_ENV === 'development') {
    response.details = err.details;
    response.stack = err.stack;
  }

  res.status(err.status || 500).json(response);
});

// Ruta 404
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Ruta no encontrada'
  });
});

// ===== INICIO DEL SERVIDOR =====
app.listen(PORT, () => {
  console.log('🚀 ====================================');
  console.log(`🚀 SalesFlow API corriendo en puerto ${PORT}`);
  console.log(`🚀 Entorno: ${process.env.NODE_ENV || 'development'}`);
  console.log('🚀 ====================================');
});

export default app;
