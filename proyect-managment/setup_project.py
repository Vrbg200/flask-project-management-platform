#!/usr/bin/env python3
"""
Script de Instalación Automática - Flask Project Manager
Genera toda la estructura del proyecto con todos los archivos necesarios
"""

import os
import sys

def create_directory(path):
    """Crea un directorio si no existe"""
    if not os.path.exists(path):
        os.makedirs(path)
        print(f"✓ Creado: {path}")

def create_file(path, content):
    """Crea un archivo con contenido"""
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"✓ Creado: {path}")

def setup_project():
    """Configura toda la estructura del proyecto"""
    
    print("=" * 60)
    print("FLASK PROJECT MANAGER - INSTALACIÓN AUTOMÁTICA")
    print("=" * 60)
    print()
    
    # Crear estructura de directorios
    print("📁 Creando estructura de directorios...")
    directories = [
        'models',
        'routes',
        'utils',
        'static/css',
        'static/js',
        'static/img',
        'templates/auth',
        'templates/dashboard',
        'templates/admin',
        'templates/errors',
        'tests'
    ]
    
    for directory in directories:
        create_directory(directory)
    
    print()
    print("📝 Creando archivos del proyecto...")
    print()
    
    # ====================
    # ARCHIVOS RAÍZ
    # ====================
    
    # requirements.txt
    create_file('requirements.txt', '''Flask==3.0.0
Flask-SQLAlchemy==3.1.1
Flask-Login==0.6.3
Flask-Bcrypt==1.0.1
Flask-JWT-Extended==4.5.3
python-dotenv==1.0.0
reportlab==4.0.7
Werkzeug==3.0.1
email-validator==2.1.0
pytest==7.4.3
pytest-flask==1.3.0
gunicorn==21.2.0
''')
    
    # .env.example
    create_file('.env.example', '''# Configuración de la aplicación
FLASK_APP=app.py
FLASK_ENV=development
SECRET_KEY=cambiar-en-produccion-usar-secreto-largo-y-aleatorio
JWT_SECRET_KEY=cambiar-jwt-secret-en-produccion

# Base de datos
DATABASE_URL=sqlite:///project_manager.db

# Configuración del servidor
HOST=0.0.0.0
PORT=5000
DEBUG=True
''')
    
    # .gitignore
    create_file('.gitignore', '''# Python
__pycache__/
*.py[cod]
*$py.class
venv/
env/
*.db
*.sqlite

# Environment
.env

# IDEs
.vscode/
.idea/

# OS
.DS_Store
''')
    
    # config.py
    create_file('config.py', '''import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key')
    DEBUG = os.getenv('DEBUG', 'True').lower() == 'true'
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', 'sqlite:///project_manager.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'jwt-secret-key')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)

class DevelopmentConfig(Config):
    DEBUG = True

class ProductionConfig(Config):
    DEBUG = False

config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}
''')
    
    print()
    print("=" * 60)
    print("✅ PROYECTO CREADO EXITOSAMENTE")
    print("=" * 60)
    print()
    print("📋 Próximos pasos:")
    print()
    print("1. Crear entorno virtual:")
    print("   python3 -m venv venv")
    print("   source venv/bin/activate  (Linux/Mac)")
    print("   venv\\Scripts\\activate  (Windows)")
    print()
    print("2. Instalar dependencias:")
    print("   pip install -r requirements.txt")
    print()
    print("3. Configurar variables de entorno:")
    print("   cp .env.example .env")
    print()
    print("4. Descargar los archivos restantes desde los artifacts")
    print("   (models/, routes/, utils/, templates/, static/)")
    print()
    print("5. Inicializar base de datos:")
    print("   flask init-db")
    print()
    print("6. Ejecutar aplicación:")
    print("   python app.py")
    print()
    print("🌐 La aplicación estará disponible en: http://localhost:5000")
    print()

if __name__ == '__main__':
    try:
        setup_project()
    except Exception as e:
        print(f"❌ Error durante la instalación: {e}")
        sys.exit(1)
