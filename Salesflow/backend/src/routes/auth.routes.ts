const router = Router();
const prisma = new PrismaClient();

// Schemas de validación
const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres')
});

const registroSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  apellido: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  telefono: z.string().optional()
});

const refreshTokenSchema = z.object({
  refreshToken: z.string()
});

/**
 * Generar tokens JWT
 */
const generarTokens = (userId: string, email: string, rol: string) => {
  const accessToken = jwt.sign(
    { id: userId, email, rol },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: process.env.JWT_EXPIRE || '15m' }
  );

  const refreshToken = jwt.sign(
    { id: userId, email, rol },
    process.env.JWT_REFRESH_SECRET || 'refresh_secret',
    { expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' }
  );

  return { accessToken, refreshToken };
};

/**
 * POST /api/auth/login
 * Iniciar sesión
 */
router.post('/login', async (req, res) => {
  try {
    // Validar datos
    const validacion = loginSchema.safeParse(req.body);
    if (!validacion.success) {
      return res.status(400).json({
        success: false,
        error: 'Datos inválidos',
        details: validacion.error.errors
      });
    }

    const { email, password } = validacion.data;

    // Buscar usuario
    const usuario = await prisma.usuario.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        nombre: true,
        apellido: true,
        telefono: true,
        avatar: true,
        rol: true,
        activo: true
      }
    });

    if (!usuario) {
      return res.status(401).json({
        success: false,
        error: 'Credenciales inválidas'
      });
    }

    if (!usuario.activo) {
      return res.status(401).json({
        success: false,
        error: 'Usuario inactivo'
      });
    }

    // Verificar contraseña
    const passwordValido = await bcrypt.compare(password, usuario.password);
    if (!passwordValido) {
      return res.status(401).json({
        success: false,
        error: 'Credenciales inválidas'
      });
    }

    // Generar tokens
    const { accessToken, refreshToken } = generarTokens(
      usuario.id,
      usuario.email,
      usuario.rol
    );

    // Guardar refresh token
    await prisma.usuario.update({
      where: { id: usuario.id },
      data: {
        refreshToken,
        ultimoAcceso: new Date()
      }
    });

    // Registrar auditoría
    await prisma.auditoria.create({
      data: {
        usuarioId: usuario.id,
        accion: 'LOGIN',
        entidad: 'USUARIO',
        entidadId: usuario.id,
        ip: req.ip || req.socket.remoteAddress,
        userAgent: req.headers['user-agent']
      }
    });

    // Responder con datos del usuario (sin password)
    const { password: _, refreshToken: __, ...usuarioSeguro } = usuario;

    res.json({
      success: true,
      data: {
        usuario: usuarioSeguro,
        accessToken,
        refreshToken
      }
    });
  } catch (error: any) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      error: 'Error al iniciar sesión'
    });
  }
});

/**
 * POST /api/auth/registro
 * Registrar nuevo usuario (solo admins)
 */
router.post('/registro', autenticar, async (req, res) => {
  try {
    // Solo admins pueden registrar usuarios
    if (req.usuario?.rol !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'No tienes permisos para registrar usuarios'
      });
    }

    // Validar datos
    const validacion = registroSchema.safeParse(req.body);
    if (!validacion.success) {
      return res.status(400).json({
        success: false,
        error: 'Datos inválidos',
        details: validacion.error.errors
      });
    }

    const { email, password, nombre, apellido, telefono } = validacion.data;

    // Verificar si el usuario ya existe
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { email }
    });

    if (usuarioExistente) {
      return res.status(409).json({
        success: false,
        error: 'El email ya está registrado'
      });
    }

    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario
    const nuevoUsuario = await prisma.usuario.create({
      data: {
        email,
        password: hashedPassword,
        nombre,
        apellido,
        telefono,
        rol: req.body.rol || 'VENDEDOR'
      },
      select: {
        id: true,
        email: true,
        nombre: true,
        apellido: true,
        telefono: true,
        rol: true,
        activo: true,
        createdAt: true
      }
    });

    res.status(201).json({
      success: true,
      data: nuevoUsuario
    });
  } catch (error: any) {
    console.error('Error en registro:', error);
    res.status(500).json({
      success: false,
      error: 'Error al registrar usuario'
    });
  }
});

/**
 * POST /api/auth/refresh
 * Refrescar access token
 */
router.post('/refresh', async (req, res) => {
  try {
    const validacion = refreshTokenSchema.safeParse(req.body);
    if (!validacion.success) {
      return res.status(400).json({
        success: false,
        error: 'Refresh token no proporcionado'
      });
    }

    const { refreshToken } = validacion.data;

    // Verificar refresh token
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || 'refresh_secret'
    ) as any;

    // Verificar que el refresh token coincida con el almacenado
    const usuario = await prisma.usuario.findUnique({
      where: { id: decoded.id }
    });

    if (!usuario || usuario.refreshToken !== refreshToken || !usuario.activo) {
      return res.status(401).json({
        success: false,
        error: 'Refresh token inválido'
      });
    }

    // Generar nuevos tokens
    const tokens = generarTokens(usuario.id, usuario.email, usuario.rol);

    // Actualizar refresh token
    await prisma.usuario.update({
      where: { id: usuario.id },
      data: { refreshToken: tokens.refreshToken }
    });

    res.json({
      success: true,
      data: tokens
    });
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Refresh token inválido o expirado'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Error al refrescar token'
    });
  }
});

/**
 * POST /api/auth/logout
 * Cerrar sesión
 */
router.post('/logout', autenticar, async (req, res) => {
  try {
    // Eliminar refresh token
    await prisma.usuario.update({
      where: { id: req.usuario!.id },
      data: { refreshToken: null }
    });

    // Registrar auditoría
    await prisma.auditoria.create({
      data: {
        usuarioId: req.usuario!.id,
        accion: 'LOGOUT',
        entidad: 'USUARIO',
        entidadId: req.usuario!.id
      }
    });

    res.json({
      success: true,
      message: 'Sesión cerrada exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al cerrar sesión'
    });
  }
});

/**
 * GET /api/auth/perfil
 * Obtener perfil del usuario autenticado
 */
router.get('/perfil', autenticar, async (req, res) => {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id: req.usuario!.id },
      select: {
        id: true,
        email: true,
        nombre: true,
        apellido: true,
        telefono: true,
        avatar: true,
        rol: true,
        activo: true,
        ultimoAcceso: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.json({
      success: true,
      data: usuario
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al obtener perfil'
    });
  }
});

export default router;
