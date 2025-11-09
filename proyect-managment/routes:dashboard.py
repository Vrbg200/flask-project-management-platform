from flask import Blueprint, render_template
from flask_login import login_required, current_user
from models import Project, Task
from datetime import datetime, timedelta

dashboard_bp = Blueprint('dashboard', __name__, url_prefix='/dashboard')

@dashboard_bp.route('/')
@login_required
def index():
    """Dashboard principal con estadísticas y resumen"""
    
    projects = Project.query.filter_by(owner_id=current_user.id).all()
    tasks = Task.query.join(Project).filter(
        (Project.owner_id == current_user.id) | (Task.assigned_to == current_user.id)
    ).all()
    
    project_stats = {
        'total': len(projects),
        'active': sum(1 for p in projects if p.status == 'active'),
        'completed': sum(1 for p in projects if p.status == 'completed'),
        'archived': sum(1 for p in projects if p.status == 'archived')
    }
    
    task_stats = {
        'total': len(tasks),
        'pending': sum(1 for t in tasks if t.status == 'pending'),
        'in_progress': sum(1 for t in tasks if t.status == 'in_progress'),
        'completed': sum(1 for t in tasks if t.status == 'completed'),
        'overdue': sum(1 for t in tasks if t.is_overdue())
    }
    
    if task_stats['total'] > 0:
        overall_progress = int((task_stats['completed'] / task_stats['total']) * 100)
    else:
        overall_progress = 0
    
    recent_tasks = sorted(tasks, key=lambda x: x.created_at, reverse=True)[:5]
    
    upcoming_tasks = [
        t for t in tasks 
        if t.due_date and t.status != 'completed' and 
        datetime.now() <= t.due_date <= datetime.now() + timedelta(days=7)
    ]
    upcoming_tasks = sorted(upcoming_tasks, key=lambda x: x.due_date)[:5]
    
    active_projects = [p for p in projects if p.status == 'active']
    active_projects = sorted(active_projects, key=lambda x: x.updated_at, reverse=True)[:5]
    
    priority_stats = {
        'high': sum(1 for t in tasks if t.priority == 'high' and t.status != 'completed'),
        'medium': sum(1 for t in tasks if t.priority == 'medium' and t.status != 'completed'),
        'low': sum(1 for t in tasks if t.priority == 'low' and t.status != 'completed')
    }
    
    week_ago = datetime.now() - timedelta(days=7)
    recent_activity = {
        'projects_created': Project.query.filter(
            Project.owner_id == current_user.id,
            Project.created_at >= week_ago
        ).count(),
        'tasks_created': Task.query.join(Project).filter(
            Project.owner_id == current_user.id,
            Task.created_at >= week_ago
        ).count(),
        'tasks_completed': Task.query.join(Project).filter(
            Project.owner_id == current_user.id,
            Task.completed_at >= week_ago
        ).count()
    }
    
    return render_template('dashboard/index.html',
                         project_stats=project_stats,
                         task_stats=task_stats,
                         overall_progress=overall_progress,
                         recent_tasks=recent_tasks,
                         upcoming_tasks=upcoming_tasks,
                         active_projects=active_projects,
                         priority_stats=priority_stats,
                         recent_activity=recent_activity)

@dashboard_bp.route('/profile')
@login_required
def profile():
    """Perfil del usuario"""
    total_projects = Project.query.filter_by(owner_id=current_user.id).count()
    total_tasks = Task.query.filter_by(created_by=current_user.id).count()
    completed_tasks = Task.query.filter_by(
        created_by=current_user.id, 
        status='completed'
    ).count()
    
    stats = {
        'total_projects': total_projects,
        'total_tasks': total_tasks,
        'completed_tasks': completed_tasks,
        'completion_rate': int((completed_tasks / total_tasks * 100)) if total_tasks > 0 else 0
    }
    
    return render_template('dashboard/profile.html', stats=stats)
