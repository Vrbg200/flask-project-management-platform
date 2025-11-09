#!/usr/bin/env python3
"""
Flask Project Manager - Aplicación Principal
Sistema completo de gestión de proyectos y tareas
"""

import os
from flask import Flask, render_template, redirect, url_for
from flask_login import LoginManager, login_required, current_user
from config import config
from models import db, User, Project, Task

def create_app(config_name='default'):
    """Factory para crear la aplicación Flask"""
    
    # Crear aplicación
    app = Flask(__name__)
    
    # Cargar configuración
    app.config.from_object(config[config_name])
    
    # Inicializar extensiones
    db.init_app(app)
    
    # Configurar Flask-Login
    login_manager = LoginManager()
    login_manager.init_app(app)
    login_manager.login_view = 'auth.login'
    login_manager.login_message = 'Por favor inicia sesión para acceder a esta página.'
    login_manager.login_message_category = 'info'
    
    @login_manager.user_loader
    def load_user(user_id):
        return User.query.get(int(user_id))
    
    # Registrar blueprints
    from routes import register_blueprints
    register_blueprints(app)
    
    # Ruta principal
    @app.route('/')
    def index():
        if current_user.is_authenticated:
            return redirect(url_for('dashboard.index'))
        return redirect(url_for('auth.login'))
    
    # Manejadores de errores
    @app.errorhandler(404)
    def not_found_error(error):
        return render_template('errors/404.html'), 404
    
    @app.errorhandler(403)
    def forbidden_error(error):
        return render_template('errors/403.html'), 403
    
    @app.errorhandler(500)
    def internal_error(error):
        db.session.rollback()
        return render_template('errors/500.html'), 500
    
    # Context processors
    @app.context_processor
    def inject_global_vars():
        return {
            'app_name': 'Flask Project Manager',
            'app_version': '1.0.0'
        }
    
    # Comandos CLI
    @app.cli.command()
    def init_db():
        """Inicializa la base de datos"""
        db.create_all()
        print('✓ Base de datos inicializada')
    
    @app.cli.command()
    def create_admin():
        """Crea un usuario administrador"""
        username = input('Username: ')
        email = input('Email: ')
        password = input('Password: ')
        full_name = input('Full name: ')
        
        if User.query.filter_by(username=username).first():
            print('✗ El usuario ya existe')
            return
        
        admin = User(
            username=username,
            email=email,
            full_name=full_name,
            role='admin'
        )
        admin.set_password(password)
        
        db.session.add(admin)
        db.session.commit()
        
        print(f'✓ Usuario administrador {username} creado exitosamente')
    
    @app.cli.command()
    def seed_data():
        """Crea datos de ejemplo"""
        from datetime import datetime, timedelta
        
        # Crear usuario de prueba
        if not User.query.filter_by(username='demo').first():
            demo_user = User(
                username='demo',
                email='demo@example.com',
                full_name='Usuario Demo',
                role='user'
            )
            demo_user.set_password('Demo123!')
            db.session.add(demo_user)
            db.session.commit()
            
            # Crear proyectos de ejemplo
            project1 = Project(
                name='Proyecto Web',
                description='Desarrollo de sitio web corporativo',
                priority='high',
                status='active',
                owner_id=demo_user.id
            )
            
            project2 = Project(
                name='App Móvil',
                description='Aplicación móvil para iOS y Android',
                priority='medium',
                status='active',
                owner_id=demo_user.id
            )
            
            db.session.add_all([project1, project2])
            db.session.commit()
            
            # Crear tareas de ejemplo
            tasks = [
                Task(
                    title='Diseñar interfaz de usuario',
                    description='Crear mockups y wireframes',
                    priority='high',
                    status='completed',
                    project_id=project1.id,
                    created_by=demo_user.id,
                    assigned_to=demo_user.id,
                    due_date=datetime.now() - timedelta(days=5)
                ),
                Task(
                    title='Implementar autenticación',
                    description='Sistema de login y registro',
                    priority='high',
                    status='in_progress',
                    project_id=project1.id,
                    created_by=demo_user.id,
                    assigned_to=demo_user.id,
                    due_date=datetime.now() + timedelta(days=3)
                ),
                Task(
                    title='Configurar base de datos',
                    description='PostgreSQL y migraciones',
                    priority='medium',
                    status='pending',
                    project_id=project1.id,
                    created_by=demo_user.id,
                    assigned_to=demo_user.id,
                    due_date=datetime.now() + timedelta(days=7)
                ),
                Task(
                    title='Diseñar pantallas principales',
                    description='Home, perfil, configuración',
                    priority='high',
                    status='pending',
                    project_id=project2.id,
                    created_by=demo_user.id,
                    assigned_to=demo_user.id,
                    due_date=datetime.now() + timedelta(days=10)
                )
            ]
            
            db.session.add_all(tasks)
            db.session.commit()
            
            print('✓ Datos de ejemplo creados')
            print('  Usuario: demo / Demo123!')
        else:
            print('✗ Los datos ya existen')
    
    return app

def main():
    """Punto de entrada principal"""
    # Obtener configuración del entorno
    config_name = os.getenv('FLASK_ENV', 'development')
    
    # Crear aplicación
    app = create_app(config_name)
    
    # Crear tablas si no existen
    with app.app_context():
        db.create_all()
    
    # Configuración del servidor
    host = os.getenv('HOST', '0.0.0.0')
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('DEBUG', 'True').lower() == 'true'
    
    print(f"""
    ╔══════════════════════════════════════════════════════════╗
    ║                                                          ║
    ║           Flask Project Manager - v1.0.0                 ║
    ║                                                          ║
    ║   Sistema de Gestión de Proyectos y Tareas              ║
    ║                                                          ║
    ╚══════════════════════════════════════════════════════════╝
    
    🚀 Servidor ejecutándose en: http://{host}:{port}
    📝 Modo: {config_name}
    🔍 Debug: {debug}
    
    Comandos disponibles:
    - flask init-db      : Inicializar base de datos
    - flask create-admin : Crear usuario administrador
    - flask seed-data    : Crear datos de ejemplo
    
    Presiona Ctrl+C para detener el servidor
    """)
    
    # Ejecutar aplicación
    app.run(host=host, port=port, debug=debug)

if __name__ == '__main__':
    main()
