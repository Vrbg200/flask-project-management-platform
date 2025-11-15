import { PrismaClient, Rol, TipoCliente, EtapaVenta, Estado, MetodoPago, EstadoVenta, TipoActividad } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de base de datos...');

  // Limpiar base de datos
  await prisma.auditoria.deleteMany();
  await prisma.notaCliente.deleteMany();
  await prisma.actividad.deleteMany();
  await prisma.itemVenta.deleteMany();
  await prisma.venta.deleteMany();
  await prisma.oportunidad.deleteMany();
  await prisma.contacto.deleteMany();
  await prisma.cliente.deleteMany();
  await prisma.producto.deleteMany();
  await prisma.meta.deleteMany();
  await prisma.configuracion.deleteMany();
  await prisma.usuario.deleteMany();

  // ===== USUARIOS =====
  console.log('👤 Creando usuarios...');
  
  const hashedPassword = await bcrypt.hash('Admin123!', 10);
  
  const admin = await prisma.usuario.create({
    data: {
      email: 'admin@salesflow.com',
      password: hashedPassword,
      nombre: 'Carlos',
      apellido: 'Administrador',
      telefono: '+502 2222-3333',
      rol: Rol.ADMIN,
      activo: true
    }
  });

  const gerente = await prisma.usuario.create({
    data: {
      email: 'gerente@salesflow.com',
      password: await bcrypt.hash('Gerente123!', 10),
      nombre: 'María',
      apellido: 'Gerente',
      telefono: '+502 3333-4444',
      rol: Rol.GERENTE,
      activo: true
    }
  });

  const vendedor1 = await prisma.usuario.create({
    data: {
      email: 'vendedor@salesflow.com',
      password: await bcrypt.hash('Vendedor123!', 10),
      nombre: 'Juan',
      apellido: 'Vendedor',
      telefono: '+502 4444-5555',
      rol: Rol.VENDEDOR,
      activo: true
    }
  });

  const vendedor2 = await prisma.usuario.create({
    data: {
      email: 'ana.lopez@salesflow.com',
      password: await bcrypt.hash('Vendedor123!', 10),
      nombre: 'Ana',
      apellido: 'López',
      telefono: '+502 5555-6666',
      rol: Rol.VENDEDOR,
      activo: true
    }
  });

  console.log(`✅ ${4} usuarios creados`);

  // ===== PRODUCTOS =====
  console.log('📦 Creando productos...');
  
  const productos = await Promise.all([
    prisma.producto.create({
      data: {
        codigo: 'CRM-001',
        nombre: 'Licencia CRM Empresarial',
        descripcion: 'Sistema completo de gestión de relaciones con clientes',
        categoria: 'SOFTWARE',
        precio: 2500.00,
        costo: 800.00,
        margen: 68,
        stock: 50,
        activo: true,
        destacado: true
      }
    }),
    prisma.producto.create({
      data: {
        codigo: 'CONS-001',
        nombre: 'Consultoría Estratégica',
        descripcion: 'Asesoría personalizada en ventas y marketing',
        categoria: 'SERVICIOS',
        precio: 5000.00,
        costo: 2000.00,
        margen: 60,
        stock: 999,
        activo: true
      }
    }),
    prisma.producto.create({
      data: {
        codigo: 'TRAIN-001',
        nombre: 'Capacitación Equipo Ventas',
        descripcion: 'Programa completo de formación en ventas',
        categoria: 'SERVICIOS',
        precio: 3500.00,
        costo: 1200.00,
        margen: 65.7,
        stock: 999,
        activo: true
      }
    }),
    prisma.producto.create({
      data: {
        codigo: 'ERP-001',
        nombre: 'Sistema ERP Integrado',
        descripcion: 'Solución empresarial completa para gestión de recursos',
        categoria: 'SOFTWARE',
        precio: 15000.00,
        costo: 5000.00,
        margen: 66.7,
        stock: 20,
        activo: true,
        destacado: true
      }
    }),
    prisma.producto.create({
      data: {
        codigo: 'SUPP-001',
        nombre: 'Soporte Técnico Premium',
        descripcion: 'Soporte 24/7 con tiempo de respuesta garantizado',
        categoria: 'SERVICIOS',
        precio: 800.00,
        costo: 200.00,
        margen: 75,
        stock: 999,
        activo: true
      }
    })
  ]);

  console.log(`✅ ${productos.length} productos creados`);

  // ===== CLIENTES =====
  console.log('🏢 Creando clientes...');
  
  const clientes = await Promise.all([
    prisma.cliente.create({
      data: {
        nombre: 'TechCorp Guatemala',
        email: 'contacto@techcorp.gt',
        telefono: '+502 2300-0000',
        direccion: 'Zona 10, Ciudad de Guatemala',
        ciudad: 'Ciudad de Guatemala',
        tipo: TipoCliente.EMPRESA,
        industria: 'TECNOLOGIA',
        numeroEmpleados: 150,
        ingresoAnual: 5000000,
        estado: Estado.ACTIVO,
        valorVida: 25000
      }
    }),
    prisma.cliente.create({
      data: {
        nombre: 'Distribuidora Central',
        email: 'ventas@distribuidoracentral.com',
        telefono: '+502 2400-0000',
        direccion: 'Zona 4, Ciudad de Guatemala',
        ciudad: 'Ciudad de Guatemala',
        tipo: TipoCliente.EMPRESA,
        industria: 'RETAIL',
        numeroEmpleados: 80,
        ingresoAnual: 2000000,
        estado: Estado.ACTIVO,
        valorVida: 15000
      }
    }),
    prisma.cliente.create({
      data: {
        nombre: 'Servicios Médicos Integrados',
        email: 'info@serviciosmedicos.gt',
        telefono: '+502 2500-0000',
        direccion: 'Zona 14, Ciudad de Guatemala',
        ciudad: 'Ciudad de Guatemala',
        tipo: TipoCliente.EMPRESA,
        industria: 'SALUD',
        numeroEmpleados: 200,
        ingresoAnual: 8000000,
        estado: Estado.ACTIVO,
        valorVida: 35000
      }
    }),
    prisma.cliente.create({
      data: {
        nombre: 'Constructora Moderna',
        email: 'proyectos@constructoramoderna.com',
        telefono: '+502 2600-0000',
        direccion: 'Zona 15, Ciudad de Guatemala',
        ciudad: 'Ciudad de Guatemala',
        tipo: TipoCliente.EMPRESA,
        industria: 'CONSTRUCCION',
        numeroEmpleados: 120,
        ingresoAnual: 10000000,
        estado: Estado.ACTIVO,
        valorVida: 50000
      }
    }),
    prisma.cliente.create({
      data: {
        nombre: 'Importadora del Pacífico',
        email: 'contacto@importadorapacifico.com',
        telefono: '+502 2700-0000',
        direccion: 'Escuintla',
        ciudad: 'Escuintla',
        tipo: TipoCliente.EMPRESA,
        industria: 'IMPORTACION',
        numeroEmpleados: 60,
        ingresoAnual: 3000000,
        estado: Estado.ACTIVO,
        valorVida: 18000
      }
    })
  ]);

  console.log(`✅ ${clientes.length} clientes creados`);

  // ===== CONTACTOS =====
  console.log('👥 Creando contactos...');
  
  await Promise.all([
    prisma.contacto.create({
      data: {
        clienteId: clientes[0].id,
        nombre: 'Roberto',
        apellido: 'Méndez',
        cargo: 'Director de Tecnología',
        email: 'rmendez@techcorp.gt',
        telefono: '+502 5000-0001',
        esPrincipal: true
      }
    }),
    prisma.contacto.create({
      data: {
        clienteId: clientes[1].id,
        nombre: 'Laura',
        apellido: 'Castillo',
        cargo: 'Gerente de Compras',
        email: 'lcastillo@distribuidoracentral.com',
        telefono: '+502 5000-0002',
        esPrincipal: true
      }
    })
  ]);

  console.log('✅ Contactos creados');

  // ===== OPORTUNIDADES =====
  console.log('💼 Creando oportunidades...');
  
  const oportunidades = await Promise.all([
    prisma.oportunidad.create({
      data: {
        titulo: 'Implementación CRM TechCorp',
        descripcion: 'Proyecto completo de implementación del sistema CRM',
        clienteId: clientes[0].id,
        vendedorId: vendedor1.id,
        valor: 25000,
        etapa: EtapaVenta.NEGOCIACION,
        probabilidad: 75,
        fechaCierre: new Date('2025-12-15'),
        origen: 'REFERIDO'
      }
    }),
    prisma.oportunidad.create({
      data: {
        titulo: 'Capacitación Equipo Distribuidora',
        descripcion: 'Programa de capacitación en técnicas de ventas',
        clienteId: clientes[1].id,
        vendedorId: vendedor2.id,
        valor: 8500,
        etapa: EtapaVenta.CALIFICADO,
        probabilidad: 60,
        fechaCierre: new Date('2025-11-30'),
        origen: 'INBOUND'
      }
    }),
    prisma.oportunidad.create({
      data: {
        titulo: 'ERP Servicios Médicos',
        descripcion: 'Sistema ERP para gestión hospitalaria',
        clienteId: clientes[2].id,
        vendedorId: vendedor1.id,
        valor: 75000,
        etapa: EtapaVenta.PROSPECTO,
        probabilidad: 30,
        fechaCierre: new Date('2026-02-28'),
        origen: 'OUTBOUND'
      }
    }),
    prisma.oportunidad.create({
      data: {
        titulo: 'Consultoría Constructora Moderna',
        descripcion: 'Asesoría en optimización de procesos',
        clienteId: clientes[3].id,
        vendedorId: vendedor2.id,
        valor: 15000,
        etapa: EtapaVenta.CIERRE,
        probabilidad: 90,
        fechaCierre: new Date('2025-11-20'),
        origen: 'REFERIDO'
      }
    }),
    prisma.oportunidad.create({
      data: {
        titulo: 'Soporte Premium Importadora',
        descripcion: 'Contrato anual de soporte técnico',
        clienteId: clientes[4].id,
        vendedorId: vendedor1.id,
        valor: 9600,
        etapa: EtapaVenta.GANADO,
        probabilidad: 100,
        fechaCierre: new Date('2025-11-01'),
        fechaCierreReal: new Date('2025-11-01')
      }
    })
  ]);

  console.log(`✅ ${oportunidades.length} oportunidades creadas`);

  // ===== VENTAS =====
  console.log('💰 Creando ventas...');
  
  const venta1 = await prisma.venta.create({
    data: {
      numeroVenta: 'VTA-2025-001',
      clienteId: clientes[4].id,
      vendedorId: vendedor1.id,
      oportunidadId: oportunidades[4].id,
      fechaVenta: new Date('2025-11-01'),
      subtotal: 9600,
      descuento: 0,
      impuesto: 1152,
      total: 10752,
      estado: EstadoVenta.COMPLETADO,
      metodoPago: MetodoPago.TRANSFERENCIA,
      comisionVendedor: 960
    }
  });

  await prisma.itemVenta.create({
    data: {
      ventaId: venta1.id,
      productoId: productos[4].id,
      cantidad: 12,
      precioUnitario: 800,
      descuento: 0,
      subtotal: 9600
    }
  });

  const venta2 = await prisma.venta.create({
    data: {
      numeroVenta: 'VTA-2025-002',
      clienteId: clientes[0].id,
      vendedorId: vendedor2.id,
      fechaVenta: new Date('2025-10-15'),
      subtotal: 5500,
      descuento: 500,
      impuesto: 600,
      total: 5600,
      estado: EstadoVenta.COMPLETADO,
      metodoPago: MetodoPago.TARJETA,
      comisionVendedor: 550
    }
  });

  await Promise.all([
    prisma.itemVenta.create({
      data: {
        ventaId: venta2.id,
        productoId: productos[0].id,
        cantidad: 2,
        precioUnitario: 2500,
        descuento: 500,
        subtotal: 4500
      }
    }),
    prisma.itemVenta.create({
      data: {
        ventaId: venta2.id,
        productoId: productos[4].id,
        cantidad: 1,
        precioUnitario: 1000,
        descuento: 0,
        subtotal: 1000
      }
    })
  ]);

  console.log('✅ Ventas creadas');

  // ===== ACTIVIDADES =====
  console.log('📅 Creando actividades...');
  
  await Promise.all([
    prisma.actividad.create({
      data: {
        tipo: TipoActividad.REUNION,
        titulo: 'Presentación Propuesta CRM',
        descripcion: 'Reunión con director de TI para presentar propuesta',
        clienteId: clientes[0].id,
        oportunidadId: oportunidades[0].id,
        usuarioId: vendedor1.id,
        fechaProgramada: new Date('2025-11-18T10:00:00'),
        completada: false
      }
    }),
    prisma.actividad.create({
      data: {
        tipo: TipoActividad.LLAMADA,
        titulo: 'Seguimiento Propuesta',
        descripcion: 'Llamada de seguimiento post-presentación',
        clienteId: clientes[1].id,
        oportunidadId: oportunidades[1].id,
        usuarioId: vendedor2.id,
        fechaProgramada: new Date('2025-11-16T14:00:00'),
        fechaCompletada: new Date('2025-11-16T14:15:00'),
        completada: true,
        duracion: 15,
        resultado: 'Cliente interesado, solicitó cotización formal'
      }
    }),
    prisma.actividad.create({
      data: {
        tipo: TipoActividad.EMAIL,
        titulo: 'Envío de Cotización',
        descripcion: 'Enviar cotización detallada del sistema ERP',
        clienteId: clientes[2].id,
        oportunidadId: oportunidades[2].id,
        usuarioId: vendedor1.id,
        fechaProgramada: new Date('2025-11-15T09:00:00'),
        fechaCompletada: new Date('2025-11-15T09:30:00'),
        completada: true
      }
    })
  ]);

  console.log('✅ Actividades creadas');

  // ===== NOTAS =====
  console.log('📝 Creando notas...');
  
  await Promise.all([
    prisma.notaCliente.create({
      data: {
        clienteId: clientes[0].id,
        usuarioId: vendedor1.id,
        contenido: 'Cliente muy interesado en funcionalidades de automatización. Presupuesto aprobado para Q4.',
        esPrivada: false
      }
    }),
    prisma.notaCliente.create({
      data: {
        clienteId: clientes[2].id,
        usuarioId: gerente.id,
        contenido: 'Oportunidad grande. Asignar recursos adicionales para soporte técnico en presentación.',
        esPrivada: true
      }
    })
  ]);

  console.log('✅ Notas creadas');

  // ===== METAS =====
  console.log('🎯 Creando metas...');
  
  await Promise.all([
    prisma.meta.create({
      data: {
        nombre: 'Meta Ventas Q4 2025',
        descripcion: 'Objetivo de ventas para el último trimestre',
        tipoMeta: 'INGRESOS',
        periodoInicio: new Date('2025-10-01'),
        periodoFin: new Date('2025-12-31'),
        valorObjetivo: 150000,
        valorActual: 16352,
        activa: true
      }
    }),
    prisma.meta.create({
      data: {
        nombre: 'Nuevos Clientes Noviembre',
        descripcion: 'Captación de nuevos clientes',
        tipoMeta: 'CLIENTES',
        periodoInicio: new Date('2025-11-01'),
        periodoFin: new Date('2025-11-30'),
        valorObjetivo: 10,
        valorActual: 5,
        activa: true
      }
    })
  ]);

  console.log('✅ Metas creadas');

  // ===== CONFIGURACIÓN =====
  console.log('⚙️  Creando configuración...');
  
  await Promise.all([
    prisma.configuracion.create({
      data: {
        clave: 'empresa_nombre',
        valor: 'SalesFlow Corporation',
        descripcion: 'Nombre de la empresa'
      }
    }),
    prisma.configuracion.create({
      data: {
        clave: 'empresa_nit',
        valor: '12345678-9',
        descripcion: 'NIT de la empresa'
      }
    }),
    prisma.configuracion.create({
      data: {
        clave: 'moneda',
        valor: { codigo: 'GTQ', simbolo: 'Q', nombre: 'Quetzal Guatemalteco' },
        descripcion: 'Moneda predeterminada'
      }
    }),
    prisma.configuracion.create({
      data: {
        clave: 'impuesto_iva',
        valor: 12,
        descripcion: 'Porcentaje de IVA'
      }
    }),
    prisma.configuracion.create({
      data: {
        clave: 'comision_vendedor',
        valor: 10,
        descripcion: 'Porcentaje de comisión para vendedores'
      }
    })
  ]);

  console.log('✅ Configuración creada');

  console.log('');
  console.log('✅ ¡Seed completado exitosamente!');
  console.log('');
  console.log('📊 Resumen:');
  console.log(`   - ${4} usuarios creados`);
  console.log(`   - ${productos.length} productos creados`);
  console.log(`   - ${clientes.length} clientes creados`);
  console.log(`   - ${oportunidades.length} oportunidades creadas`);
  console.log(`   - 2 ventas completadas`);
  console.log('');
  console.log('🔐 Credenciales de acceso:');
  console.log('   Admin:    admin@salesflow.com / Admin123!');
  console.log('   Gerente:  gerente@salesflow.com / Gerente123!');
  console.log('   Vendedor: vendedor@salesflow.com / Vendedor123!');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
