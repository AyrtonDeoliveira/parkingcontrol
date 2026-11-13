import db from '../database/conexion.js';

async function cargarClientes(req, res) {
    const [clientes] = await db.query('SELECT * FROM clientes ORDER BY nombre');
    res.render('clientes', { clientes, mensaje: req.query.mensaje, error: req.query.error });
}

async function guardarCliente(req, res) {
    const nombre = String(req.body.nombre || '').trim();
    const telefono = String(req.body.telefono || '').trim();
    const estado = req.body.estado;

    if (!nombre || nombre.length > 100 || !telefono || telefono.length > 25 ||
        !['Activa', 'Inactiva'].includes(estado)) {
        return res.redirect('/clientes?error=Revisá los datos del cliente.');
    }

    await db.execute('INSERT INTO clientes (nombre, telefono, estado) VALUES (?, ?, ?)',
        [nombre, telefono, estado]);

    res.redirect('/clientes?mensaje=Cliente guardado.');
}

export { cargarClientes, guardarCliente };
