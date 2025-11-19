import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient, Rol } from '@prisma/client';

const prisma = new PrismaClient();

interface JwtPayload {
  id: string;
  email: string;
  rol: Rol;
}

// Extender la interfaz Request de Express
declare global {
  namespace Express {
    interface Request {
      usuario?: {
        id: string;
        email: string;
        rol: Rol;
      };
    }
  }
}

/**
 * Middleware para verificar JWT y autenticar usuario
 */
export const autenticar = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Obtener token del header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Token no proporcionado'
      });
    }

    const token = authHeader.substring(7);

    // Verificar token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'secret'
    ) as JwtPayload;

    // Verificar que el usuario existe y está activo
    const usuario = await prisma.usuario.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        rol: true,
        activo: true
      }
    });

    if (!usuario || !usuario.activo) {
      return res.status(401).json({
        success: false,
        error: 'Usuario no autorizado'
      });
    }

    // Adjuntar usuario al request
    req.usuario = {
      id: usuario.id,
      email: usuario.email,
      rol: usuario.rol
    };

    next();
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Token inválido'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token expirado'
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Error en autenticación'
    });
  }
};

/**
 * Middleware para verificar roles específicos
 */
export const requiereRol = (...rolesPermitidos: Rol[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.usuario) {
      return res.status(401).json({
        success: false,
        error: 'Usuario no autenticado'
      });
    }

    if (!rolesPermitidos.includes(req.usuario.rol)) {
      return res.status(403).json({
        success: false,
        error: 'No tienes permisos para realizar esta acción'
      });
    }

    next();
  };
};

/**
 * Middleware solo para administradores
 */
export const soloAdmin = requiereRol(Rol.ADMIN);

/**
 * Middleware para admin y gerentes
 */
export const adminOGerente = requiereRol(Rol.ADMIN, Rol.GERENTE);

/**
 * Middleware para registrar actividad del usuario
 */
export const registrarActividad = (accion: string, entidad: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.usuario) {
        const entidadId = req.params.id || null;
        
        await prisma.auditoria.create({
          data: {
            usuarioId: req.usuario.id,
            accion,
            entidad,
            entidadId,
            detalles: {
              body: req.body,
              params: req.params,
              query: req.query
            },
            ip: req.ip || req.socket.remoteAddress,
            userAgent: req.headers['user-agent']
          }
        });
      }
      next();
    } catch (error) {
      console.error('Error al registrar auditoría:', error);
      next(); // Continuar aunque falle el registro
    }
  };
};
