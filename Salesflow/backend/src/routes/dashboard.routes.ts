import { Router } from 'express';
import { PrismaClient, EtapaVenta } from '@prisma/client';
import { autenticar } from '../middleware/auth.middleware';

const router = Router();
const prisma = new PrismaClient();

// Todas las rutas requieren autenticación
router.use(autenticar);

/**
 * GET /api/dashboard/metricas
 * Obtener métricas generales del dashboard
 */
router.get('/metricas', async (req, res) => {
  try {
    const { periodo } = req.query; // 'mes', 'trimestre', 'año'
    const usuario = req.usuario!;

    // Calcular rango de fechas
    const ahora = new Date();
    let fechaInicio = new Date();
    
    switch (periodo) {
      case 'trimestre':
        fechaInicio.setMonth(ahora.getMonth() - 3);
        break;
      case 'año':
        fechaInicio.setFullYear(ahora.getFullYear() - 1);
        break;
      default: // mes
        fechaInicio.setMonth(ahora.getMonth() - 1);
    }

    // Filtro por vendedor si no es admin o gerente
    const filtroVendedor = usuario.rol === 'VENDEDOR' 
      ? { vendedorId: usuario.id }
      : {};

    // 1. Total de ventas
    const ventasData = await prisma.venta.aggregate({
      where: {
        ...filtroVendedor,
        fechaVenta: {
          gte: fechaInicio
        },
        estado: 'COMPLETADO'
      },
      _sum: {
        total: true
      },
      _count: true
    });

    // 2. Ventas del mes anterior para comparación
    const mesAnteriorInicio = new Date(fechaInicio);
    mesAnteriorInicio.setMonth(mesAnteriorInicio.getMonth() - 1);
    
    const ventasMesAnterior = await prisma.venta.aggregate({
      where: {
        ...filtroVendedor,
        fechaVenta: {
          gte: mesAnteriorInicio,
          lt: fechaInicio
        },
        estado: 'COMPLETADO'
      },
      _sum: {
        total: true
      }
    });

    // Calcular crecimiento
    const totalActual = ventasData._sum.total || 0;
    const totalAnterior = ventasMesAnterior._sum.total || 0;
    const crecimiento = totalAnterior > 0 
      ? ((totalActual - totalAnterior) / totalAnterior) * 100 
      : 0;

    // 3. Clientes activos
    const clientesActivos = await prisma.cliente.count({
      where: { estado: 'ACTIVO' }
    });

    // 4. Oportunidades por etapa
    const oportunidadesPorEtapa = await prisma.oportunidad.groupBy({
      by: ['etapa'],
      where: filtroVendedor,
      _count: true,
      _sum: {
        valor: true
      }
    });

    // 5. Productos más vendidos
    const productosPopulares = await prisma.itemVenta.groupBy({
      by: ['productoId'],
      _sum: {
        cantidad: true,
        subtotal: true
      },
      orderBy: {
        _sum: {
          subtotal: 'desc'
        }
      },
      take: 5
    });

    // Obtener detalles de productos
    const productosIds = productosPopulares.map(p => p.productoId);
    const productos = await prisma.producto.findMany({
      where: { id: { in: productosIds } },
      select: { id: true, nombre: true, categoria: true }
    });

    const productosConDetalles = productosPopulares.map(item => {
      const producto = productos.find(p => p.id === item.productoId);
      return {
        ...item,
        nombre: producto?.nombre,
        categoria: producto?.categoria
      };
    });

    // 6. Rendimiento de vendedores (solo para admin y gerentes)
    let rankingVendedores = [];
    if (usuario.rol === 'ADMIN' || usuario.rol === 'GERENTE') {
      const ventas = await prisma.venta.groupBy({
        by: ['vendedorId'],
        where: {
          fechaVenta: { gte: fechaInicio },
          estado: 'COMPLETADO'
        },
        _sum: {
          total: true,
          comisionVendedor: true
        },
        _count: true
      });

      const vendedoresIds = ventas.map(v => v.vendedorId);
      const vendedores = await prisma.usuario.findMany({
        where: { id: { in: vendedoresIds } },
        select: { id: true, nombre: true, apellido: true }
      });

      rankingVendedores = ventas.map(venta => {
        const vendedor = vendedores.find(v => v.id === venta.vendedorId);
        return {
          vendedorId: venta.vendedorId,
          nombre: `${vendedor?.nombre} ${vendedor?.apellido}`,
          totalVentas: venta._sum.total || 0,
          numeroVentas: venta._count,
          comisiones: venta._sum.comisionVendedor || 0
        };
      }).sort((a, b) => b.totalVentas - a.totalVentas);
    }

    // 7. Actividades pendientes
    const actividadesPendientes = await prisma.actividad.count({
      where: {
        usuarioId: usuario.id,
        completada: false,
        fechaProgramada: {
          gte: new Date()
        }
      }
    });

    res.json({
      success: true,
      data: {
        ventas: {
          total: totalActual,
          cantidad: ventasData._count,
          crecimiento: Math.round(crecimiento * 100) / 100,
          comparacion: totalAnterior
        },
        clientes: {
          activos: clientesActivos
        },
        oportunidades: {
          porEtapa: oportunidadesPorEtapa.map(o => ({
            etapa: o.etapa,
            cantidad: o._count,
            valorTotal: o._sum.valor || 0
          })),
          total: oportunidadesPorEtapa.reduce((acc, o) => acc + o._count, 0)
        },
        productosPopulares: productosConDetalles,
        rankingVendedores,
        actividadesPendientes
      }
    });
  } catch (error) {
    console.error('Error al obtener métricas:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener métricas del dashboard'
    });
  }
});

/**
 * GET /api/dashboard/forecast
 * Obtener pronóstico de ventas
 */
router.get('/forecast', async (req, res) => {
  try {
    const usuario = req.usuario!;
    const filtroVendedor = usuario.rol === 'VENDEDOR' 
      ? { vendedorId: usuario.id }
      : {};

    // Obtener oportunidades activas
    const oportunidades = await prisma.oportunidad.findMany({
      where: {
        ...filtroVendedor,
        etapa: {
          in: ['CALIFICADO', 'NEGOCIACION', 'CIERRE']
        },
        fechaCierre: {
          gte: new Date()
        }
      },
      include: {
        cliente: {
          select: { nombre: true }
        },
        vendedor: {
          select: { nombre: true, apellido: true }
        }
      }
    });

    // Calcular pronóstico ponderado
    const forecast = {
      optimista: 0,  // Suma todas las oportunidades
      probable: 0,   // Suma considerando probabilidad
      conservador: 0 // Solo oportunidades en CIERRE con alta probabilidad
    };

    oportunidades.forEach(op => {
      forecast.optimista += op.valor;
      forecast.probable += op.valor * (op.probabilidad / 100);
      
      if (op.etapa === 'CIERRE' && op.probabilidad >= 75) {
        forecast.conservador += op.valor;
      }
    });

    // Agrupar por mes
    const porMes: { [key: string]: any } = {};
    
    oportunidades.forEach(op => {
      const mes = op.fechaCierre.toISOString().substring(0, 7); // YYYY-MM
      
      if (!porMes[mes]) {
        porMes[mes] = {
          mes,
          optimista: 0,
          probable: 0,
          conservador: 0,
          oportunidades: 0
        };
      }
      
      porMes[mes].optimista += op.valor;
      porMes[mes].probable += op.valor * (op.probabilidad / 100);
      if (op.etapa === 'CIERRE' && op.probabilidad >= 75) {
        porMes[mes].conservador += op.valor;
      }
      porMes[mes].oportunidades++;
    });

    // Obtener ventas históricas para tendencia
    const seisMesesAtras = new Date();
    seisMesesAtras.setMonth(seisMesesAtras.getMonth() - 6);

    const ventasHistoricas = await prisma.venta.groupBy({
      by: ['fechaVenta'],
      where: {
        ...filtroVendedor,
        fechaVenta: { gte: seisMesesAtras },
        estado: 'COMPLETADO'
      },
      _sum: {
        total: true
      }
    });

    // Agrupar ventas por mes
    const ventasPorMes: { [key: string]: number } = {};
    ventasHistoricas.forEach(v => {
      const mes = v.fechaVenta.toISOString().substring(0, 7);
      ventasPorMes[mes] = (ventasPorMes[mes] || 0) + (v._sum.total || 0);
    });

    res.json({
      success: true,
      data: {
        resumen: {
          optimista: Math.round(forecast.optimista),
          probable: Math.round(forecast.probable),
          conservador: Math.round(forecast.conservador),
          totalOportunidades: oportunidades.length
        },
        porMes: Object.values(porMes).sort((a: any, b: any) => 
          a.mes.localeCompare(b.mes)
        ),
        oportunidadesDetalle: oportunidades.map(op => ({
          id: op.id,
          titulo: op.titulo,
          cliente: op.cliente.nombre,
          vendedor: `${op.vendedor.nombre} ${op.vendedor.apellido}`,
          valor: op.valor,
          etapa: op.etapa,
          probabilidad: op.probabilidad,
          valorPonderado: op.valor * (op.probabilidad / 100),
          fechaCierre: op.fechaCierre,
          diasParaCierre: Math.ceil(
            (op.fechaCierre.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
          )
        })),
        ventasHistoricas: Object.entries(ventasPorMes)
          .map(([mes, total]) => ({ mes, total }))
          .sort((a, b) => a.mes.localeCompare(b.mes))
      }
    });
  } catch (error) {
    console.error('Error al obtener forecast:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener pronóstico de ventas'
    });
  }
});

/**
 * GET /api/dashboard/actividades-recientes
 * Obtener actividades recientes del usuario
 */
router.get('/actividades-recientes', async (req, res) => {
  try {
    const usuario = req.usuario!;
    const limit = parseInt(req.query.limit as string) || 10;

    const actividades = await prisma.actividad.findMany({
      where: {
        usuarioId: usuario.id
      },
      include: {
        cliente: {
          select: { nombre: true }
        },
        oportunidad: {
          select: { titulo: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    });

    res.json({
      success: true,
      data: actividades
    });
  } catch (error) {
    console.error('Error al obtener actividades:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener actividades recientes'
    });
  }
});

/**
 * GET /api/dashboard/grafico-ventas
 * Datos para gráfico de ventas en el tiempo
 */
router.get('/grafico-ventas', async (req, res) => {
  try {
    const { meses = '6' } = req.query;
    const usuario = req.usuario!;
    
    const fechaInicio = new Date();
    fechaInicio.setMonth(fechaInicio.getMonth() - parseInt(meses as string));

    const filtroVendedor = usuario.rol === 'VENDEDOR' 
      ? { vendedorId: usuario.id }
      : {};

    const ventas = await prisma.venta.findMany({
      where: {
        ...filtroVendedor,
        fechaVenta: { gte: fechaInicio },
        estado: 'COMPLETADO'
      },
      select: {
        fechaVenta: true,
        total: true
      },
      orderBy: {
        fechaVenta: 'asc'
      }
    });

    // Agrupar por mes
    const ventasPorMes: { [key: string]: { total: number; cantidad: number } } = {};
    
    ventas.forEach(venta => {
      const mes = venta.fechaVenta.toISOString().substring(0, 7);
      if (!ventasPorMes[mes]) {
        ventasPorMes[mes] = { total: 0, cantidad: 0 };
      }
      ventasPorMes[mes].total += venta.total;
      ventasPorMes[mes].cantidad++;
    });

    const datos = Object.entries(ventasPorMes).map(([mes, data]) => ({
      mes,
      total: Math.round(data.total),
      cantidad: data.cantidad,
      promedio: Math.round(data.total / data.cantidad)
    }));

    res.json({
      success: true,
      data: datos
    });
  } catch (error) {
    console.error('Error al obtener gráfico de ventas:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener datos del gráfico'
    });
  }
});

export default router;
