// Sistema de notificaciones
let notificaciones = [];
let notificacionesNoLeidas = 0;

// Cargar notificaciones del usuario
async function cargarNotificaciones() {
    try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch(`${API_URL}/api/notificaciones`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            notificaciones = await response.json();
            actualizarContadorNotificaciones();
            actualizarListaNotificaciones();
        } else {
            // Datos de ejemplo si el backend no está listo
            cargarNotificacionesEjemplo();
        }
    } catch (error) {
        console.log('Usando notificaciones de ejemplo');
        cargarNotificacionesEjemplo();
    }
}

// Datos de ejemplo mientras conectamos con el backend
function cargarNotificacionesEjemplo() {
    notificaciones = [
        {
            id: 1,
            titulo: "📌 Nueva nota cargada",
            mensaje: "Tu nota de Matemáticas ha sido publicada",
            fecha: new Date().toISOString(),
            leido: false
        },
        {
            id: 2,
            titulo: "📅 Evento próximo",
            mensaje: "Entrega de proyectos de ITP este viernes",
            fecha: new Date().toISOString(),
            leido: false
        },
        {
            id: 3,
            titulo: "📊 Inasistencia registrada",
            mensaje: "Se registró una falta el día 15/05/2024",
            fecha: new Date().toISOString(),
            leido: true
        }
    ];
    actualizarContadorNotificaciones();
    actualizarListaNotificaciones();
}

// Actualizar el contador de la campanita
function actualizarContadorNotificaciones() {
    notificacionesNoLeidas = notificaciones.filter(n => !n.leido).length;
    
    const campanita = document.getElementById('campanita');
    const contador = document.getElementById('contador-notificaciones');
    
    if (campanita && contador) {
        if (notificacionesNoLeidas > 0) {
            contador.textContent = notificacionesNoLeidas;
            contador.style.display = 'flex';
        } else {
            contador.style.display = 'none';
        }
    }
}

// Mostrar lista de notificaciones
function actualizarListaNotificaciones() {
    const lista = document.getElementById('lista-notificaciones');
    if (!lista) return;

    if (notificaciones.length === 0) {
        lista.innerHTML = '<div class="notificacion-vacia">No hay notificaciones</div>';
        return;
    }

    lista.innerHTML = notificaciones.map(notif => `
        <div class="notificacion-item ${notif.leido ? '' : 'no-leida'}" onclick="marcarComoLeida(${notif.id})">
            <div class="notificacion-titulo">${notif.titulo}</div>
            <div class="notificacion-mensaje">${notif.mensaje}</div>
            <div class="notificacion-fecha">${new Date(notif.fecha).toLocaleDateString()}</div>
        </div>
    `).join('');
}

// Marcar notificación como leída
async function marcarComoLeida(id) {
    try {
        const token = localStorage.getItem('token');
        if (token) {
            await fetch(`${API_URL}/api/notificaciones/${id}/leer`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
        }
        
        const notif = notificaciones.find(n => n.id === id);
        if (notif) notif.leido = true;
        
        actualizarContadorNotificaciones();
        actualizarListaNotificaciones();
    } catch (error) {
        console.log('Error marcando como leída');
    }
}

// Marcar todas como leídas
async function marcarTodasLeidas() {
    notificaciones.forEach(n => n.leido = true);
    actualizarContadorNotificaciones();
    actualizarListaNotificaciones();
}

// Toggle del panel de notificaciones
function toggleNotificaciones() {
    const panel = document.getElementById('panel-notificaciones');
    if (panel) {
        panel.classList.toggle('visible');
    }
}

// Cargar notificaciones al iniciar
document.addEventListener('DOMContentLoaded', cargarNotificaciones);
