mport { Router } from 'express';
import { PrismaClient, EtapaVenta } from '@prisma/client';
import { z } from 'zod';
import { autenticar, registrarActividad } from '../middleware/auth.middleware';

const router = Router();
const prisma = new PrismaClient();

router.use(autenticar);

// Schema de validación
const oportunidadSchema = z.object({
  titulo: z.string().min(3, 'El título debe tener al menos 3 caracteres'),
  descripcion: z.string().optional(),
  clienteId: z.string().uuid('ID de cliente inválido'),
  vendedorId: z.string().uuid('ID de vendedor inválido').optional(),
  valor: z.number().positive('El valor debe ser mayor a 0'),
  etapa: z.enum(['PROSPECTO', 'CALIFICADO', 'NEGOCIACION', 'CIERRE', 'GANADO', 'PERDIDO']),
  probabilidad: z.number().int().min(0).max(100),
  fechaCierre: z.string().datetime().or(z.date()),
  origen: z.string().optional(),
  competidor: z.string().optional()
});

/**
 * GET /api/oportunidades
 * Listar oportunidades (tipo Kanban)
 */
router.get('/', async (req, res) => {
  try {
    const { etapa, vendedorId, clienteId } = req.query;
    const usuario = req.usuario!;

    // Construir filtros
    const where: any = {};

    // Vendedores solo ven sus oportunidades
    if (usuario.rol === 'VENDEDOR') {
      where.vendedorId = usuario.id;
    } else if (vendedorId) {
      where.vendedorId = vendedorId as string;
    }

    if (etapa) {
      where.etapa = etapa as EtapaVenta;
    }

    if (clienteId) {
      where.clienteId = clienteId as string;
    }

    const oportunidades = await prisma.oportunidad.findMany({
      where,
      include: {
        cliente: {
          select: {
            id: true,
            nombre: true,
            email: true,
            tipo: true
          }
        },
        vendedor: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            avatar: true
          }
        },
        _count: {
          select: {
            actividades: true,
            ventas: true
          }
        }
      },
      orderBy: [
        { etapa: 'asc' },
        { fechaCierre: 'asc' }
      ]
    });

    // Agrupar por etapa para vista Kanban
    const porEtapa = oportunidades.reduce((acc, opp) => {
      if (!acc[opp.etapa]) {
        acc[opp.etapa] = [];
      }
      acc[opp.etapa].push(opp);
      return acc;
    }, {} as Record<string, any[]>);

    res.json({
      success: true,
      data: {
        todas: oportunidades,
        porEtapa,
        resumen: {
          total: oportunidades.length,
          valorTotal: oportunidades.reduce((sum, o) => sum + o.valor, 0),
          valorPonderado: oportunidades.reduce((sum, o) => sum + (o.valor * o.probabilidad / 100), 0)
        }
      }
    });
  } catch (error) {
    console.error('Error al listar oportunidades:', error);
    res.status(500).json({
      success: false,
      error: 'Error al listar oportunidades'
    });
  }
});

/**
 * GET /api/oportunidades/:id
 * Obtener una oportunidad específica
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const oportunidad = await prisma.oportunidad.findUnique({
      where: { id },
      include: {
        cliente: true,
        vendedor: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            email: true,
            telefono: true
          }
        },
        actividades: {
          include: {
            usuario: {
              select: { nombre: true, apellido: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        ventas: {
          include: {
            items: {
              include: {
                producto: true
              }
            }
          }
        }
      }
    });

    if (!oportunidad) {
      return res.status(404).json({
        success: false,
        error: 'Oportunidad no encontrada'
      });
    }

    res.json({
      success: true,
      data: oportunidad
    });
  } catch (error) {
    console.error('Error al obtener oportunidad:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener oportunidad'
    });
  }
});

/**
 * POST /api/oportunidades
 * Crear nueva oportunidad
 */
router.post('/', registrarActividad('CREATE', 'OPORTUNIDAD'), async (req, res) => {
  try {
    const validacion = oportunidadSchema.safeParse(req.body);
    if (!validacion.success) {
      return res.status(400).json({
        success: false,
        error: 'Datos inválidos',
        details: validacion.error.errors
      });
    }

    const data = validacion.data;

    // Si no se especifica vendedor, asignar al usuario actual
    if (!data.vendedorId) {
      data.vendedorId = req.usuario!.id;
    }

    // Verificar que el cliente existe
    const cliente = await prisma.cliente.findUnique({
      where: { id: data.clienteId }
    });

    if (!cliente) {
      return res.status(404).json({
        success: false,
        error: 'Cliente no encontrado'
      });
    }

    const oportunidad = await prisma.oportunidad.create({
      data: {
        ...data,
        fechaCierre: new Date(data.fechaCierre)
      },
      include: {
        cliente: {
          select: { nombre: true, email: true }
        },
        vendedor: {
          select: { nombre: true, apellido: true }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: oportunidad
    });
  } catch (error) {
    console.error('Error al crear oportunidad:', error);
    res.status(500).json({
      success: false,
      error: 'Error al crear oportunidad'
    });
  }
});

/**
 * PUT /api/oportunidades/:id
 * Actualizar oportunidad
 */
router.put('/:id', registrarActividad('UPDATE', 'OPORTUNIDAD'), async (req, res) => {
  try {
    const { id } = req.params;

    const validacion = oportunidadSchema.partial().safeParse(req.body);
    if (!validacion.success) {
      return res.status(400).json({
        success: false,
        error: 'Datos inválidos',
        details: validacion.error.errors
      });
    }

    const oportunidadExistente = await prisma.oportunidad.findUnique({
      where: { id }
    });

    if (!oportunidadExistente) {
      return res.status(404).json({
        success: false,
        error: 'Oportunidad no encontrada'
      });
    }

    const data: any = { ...validacion.data };

    if (data.fechaCierre) {
      data.fechaCierre = new Date(data.fechaCierre);
    }

    // Si se marca como GANADO o PERDIDO, registrar fecha de cierre real
    if (data.etapa === 'GANADO' || data.etapa === 'PERDIDO') {
      data.fechaCierreReal = new Date();
    }

    const oportunidadActualizada = await prisma.oportunidad.update({
      where: { id },
      data,
      include: {
        cliente: true,
        vendedor: {
          select: { nombre: true, apellido: true }
        }
      }
    });

    res.json({
      success: true,
      data: oportunidadActualizada
    });
  } catch (error) {
    console.error('Error al actualizar oportunidad:', error);
    res.status(500).json({
      success: false,
      error: 'Error al actualizar oportunidad'
    });
  }
});

/**
 * PATCH /api/oportunidades/:id/etapa
 * Cambiar etapa de oportunidad (para Kanban drag & drop)
 */
router.patch('/:id/etapa', registrarActividad('UPDATE', 'OPORTUNIDAD'), async (req, res) => {
  try {
    const { id } = req.params;
    const { etapa, razonPerdida } = req.body;

    if (!etapa || !['PROSPECTO', 'CALIFICADO', 'NEGOCIACION', 'CIERRE', 'GANADO', 'PERDIDO'].includes(etapa)) {
      return res.status(400).json({
        success: false,
        error: 'Etapa inválida'
      });
    }

    const oportunidadExistente = await prisma.oportunidad.findUnique({
      where: { id }
    });

    if (!oportunidadExistente) {
      return res.status(404).json({
        success: false,
        error: 'Oportunidad no encontrada'
      });
    }

    const data: any = { etapa };

    // Ajustar probabilidad según etapa
    const probabilidadesPorEtapa: Record<string, number> = {
      'PROSPECTO': 10,
      'CALIFICADO': 25,
      'NEGOCIACION': 50,
      'CIERRE': 75,
      'GANADO': 100,
      'PERDIDO': 0
    };

    data.probabilidad = probabilidadesPorEtapa[etapa];

    // Registrar cierre
    if (etapa === 'GANADO' || etapa === 'PERDIDO') {
      data.fechaCierreReal = new Date();
      if (etapa === 'PERDIDO' && razonPerdida) {
        data.razonPerdida = razonPerdida;
      }
    }

    const oportunidadActualizada = await prisma.oportunidad.update({
      where: { id },
      data
    });

    res.json({
      success: true,
      data: oportunidadActualizada
    });
  } catch (error) {
    console.error('Error al cambiar etapa:', error);
    res.status(500).json({
      success: false,
      error: 'Error al cambiar etapa de oportunidad'
    });
  }
});

/**
 * DELETE /api/oportunidades/:id
 * Eliminar oportunidad
 */
router.delete('/:id', registrarActividad('DELETE', 'OPORTUNIDAD'), async (req, res) => {
  try {
    const { id } = req.params;

    const oportunidadExistente = await prisma.oportunidad.findUnique({
      where: { id }
    });

    if (!oportunidadExistente) {
      return res.status(404).json({
        success: false,
        error: 'Oportunidad no encontrada'
      });
    }

    await prisma.oportunidad.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Oportunidad eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar oportunidad:', error);
    res.status(500).json({
      success: false,
      error: 'Error al eliminar oportunidad'
    });
  }
});

/**
 * GET /api/oportunidades/estadisticas/embudo
 * Obtener estadísticas del embudo de ventas
 */
router.get('/estadisticas/embudo', async (req, res) => {
  try {
    const usuario = req.usuario!;
    const filtroVendedor = usuario.rol === 'VENDEDOR' ? { vendedorId: usuario.id } : {};

    const estadisticas = await prisma.oportunidad.groupBy({
      by: ['etapa'],
      where: {
        ...filtroVendedor,
        etapa: {
          notIn: ['GANADO', 'PERDIDO']
        }
      },
      _count: true,
      _sum: {
        valor: true
      },
      _avg: {
        probabilidad: true
      }
    });

    // Calcular tasa de conversión
    const ganadas = await prisma.oportunidad.count({
      where: {
        ...filtroVendedor,
        etapa: 'GANADO'
      }
    });

    const perdidas = await prisma.oportunidad.count({
      where: {
        ...filtroVendedor,
        etapa: 'PERDIDO'
      }
    });

    const total = ganadas + perdidas;
    const tasaConversion = total > 0 ? (ganadas / total) * 100 : 0;

    res.json({
      success: true,
      data: {
        porEtapa: estadisticas,
        conversion: {
          ganadas,
          perdidas,
          total,
          tasa: Math.round(tasaConversion * 100) / 100
        }
      }
    });
  } catch (error) {
    console.error('Error al obtener estadísticas del embudo:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener estadísticas'
    });
  }
});

export default router;
