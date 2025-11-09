from flask import Blueprint

# Importar blueprints
from .auth import auth_bp
from .dashboard import dashboard_bp
from .projects import projects_bp
from .tasks import tasks_bp
from .admin import admin_bp
from .api import api_bp

def register_blueprints(app):
    """Registra todos los blueprints en la aplicación"""
    app.register_blueprint(auth_bp)
    app.register_blueprint(dashboard_bp)
    app.register_blueprint(projects_bp)
    app.register_blueprint(tasks_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(api_bp)

__all__ = ['register_blueprints']
