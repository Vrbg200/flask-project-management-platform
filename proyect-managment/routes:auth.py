from flask import Blueprint, render_template, redirect, url_for, flash, request
from flask_login import login_user, logout_user, login_required, current_user
from models import db, User
from utils.validators import validate_email, validate_username, validate_password

auth_bp = Blueprint('auth', __name__, url_prefix='/auth')

@auth_bp.route('/login', methods=['GET', 'POST'])
def login():
    """Página de inicio de sesión"""
    if current_user.is_authenticated:
        return redirect(url_for('dashboard.index'))
    
    if request.method == 'POST':
        username = request.form.get('username', '').strip()
        password = request.form.get('password', '')
        remember = request.form.get('remember', False)
        
        if not username or not password:
            flash('Por favor completa todos los campos.', 'danger')
            return render_template('auth/login.html')
        
        user = User.query.filter_by(username=username).first()
        
        if user and user.check_password(password):
            if not user.is_active:
                flash('Tu cuenta ha sido desactivada.', 'danger')
                return render_template('auth/login.html')
            
            login_user(user, remember=remember)
            flash(f'¡Bienvenido, {user.full_name or user.username}!', 'success')
            
            next_page = request.args.get('next')
            return redirect(next_page) if next_page else redirect(url_for('dashboard.index'))
        else:
            flash('Usuario o contraseña incorrectos.', 'danger')
    
    return render_template('auth/login.html')

@auth_bp.route('/register', methods=['GET', 'POST'])
def register():
    """Página de registro de usuarios"""
    if current_user.is_authenticated:
        return redirect(url_for('dashboard.index'))
    
    if request.method == 'POST':
        username = request.form.get('username', '').strip()
        email = request.form.get('email', '').strip()
        full_name = request.form.get('full_name', '').strip()
        password = request.form.get('password', '')
        password_confirm = request.form.get('password_confirm', '')
        
        if not all([username, email, password, password_confirm]):
            flash('Por favor completa todos los campos obligatorios.', 'danger')
            return render_template('auth/register.html')
        
        valid, message = validate_username(username)
        if not valid:
            flash(message, 'danger')
            return render_template('auth/register.html')
        
        if not validate_email(email):
            flash('El formato del email es inválido.', 'danger')
            return render_template('auth/register.html')
        
        valid, message = validate_password(password)
        if not valid:
            flash(message, 'danger')
            return render_template('auth/register.html')
        
        if password != password_confirm:
            flash('Las contraseñas no coinciden.', 'danger')
            return render_template('auth/register.html')
        
        if User.query.filter_by(username=username).first():
            flash('El nombre de usuario ya está en uso.', 'danger')
            return render_template('auth/register.html')
        
        if User.query.filter_by(email=email).first():
            flash('El email ya está registrado.', 'danger')
            return render_template('auth/register.html')
        
        user = User(username=username, email=email, full_name=full_name)
        user.set_password(password)
        
        if User.query.count() == 0:
            user.role = 'admin'
            flash('¡Bienvenido! Has sido registrado como administrador.', 'success')
        
        db.session.add(user)
        db.session.commit()
        
        flash('¡Registro exitoso! Ahora puedes iniciar sesión.', 'success')
        return redirect(url_for('auth.login'))
    
    return render_template('auth/register.html')

@auth_bp.route('/logout')
@login_required
def logout():
    """Cerrar sesión"""
    logout_user()
    flash('Has cerrado sesión exitosamente.', 'info')
    return redirect(url_for('auth.login'))
