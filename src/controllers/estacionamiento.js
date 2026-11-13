const db = require('../database/conexion');

async function cargarInicio(req, res) {
    const [tarifas] = await db.query('SELECT * FROM tarifas ORDER BY id');
    const [plazas] = await db.query('SELECT * FROM plazas ORDER BY codigo');
    const [activos] = await db.query(`
        SELECT tickets.id, vehiculos.patente, tarifas.tipo, plazas.codigo, tickets.entrada
        FROM tickets
        JOIN vehiculos ON tickets.vehiculo_id = vehiculos.id
        JOIN tarifas ON tickets.tarifa_id = tarifas.id
        JOIN plazas ON tickets.plaza_id = plazas.id
        WHERE tickets.salida IS NULL
        ORDER BY tickets.entrada
    `);
    const [pagos] = await db.query(`
        SELECT pagos.ticket_id, vehiculos.patente, tickets.salida, pagos.monto, pagos.metodo
        FROM pagos
        JOIN tickets ON pagos.ticket_id = tickets.id
        JOIN vehiculos ON tickets.vehiculo_id = vehiculos.id
        ORDER BY tickets.salida DESC, pagos.id DESC
    `);

    res.render('inicio', { tarifas, plazas, activos, pagos,
        mensaje: req.query.mensaje, error: req.query.error });
}

async function registrarIngreso(req, res) {
    const patente = String(req.body.patente || '').trim().toUpperCase().replace(/\s+/g, '');
    const tarifaId = Number(req.body.tarifa);
    const plazaId = Number(req.body.plaza);

    if (!/^[A-Z0-9-]{1,15}$/.test(patente) ||
        !Number.isInteger(tarifaId) || tarifaId < 1 ||
        !Number.isInteger(plazaId) || plazaId < 1) {
        return res.redirect('/?error=Revisá la patente, el tipo y la plaza.');
    }

    const [tarifas] = await db.execute('SELECT precio_hora FROM tarifas WHERE id = ?', [tarifaId]);
    if (tarifas.length === 0) {
        return res.redirect('/?error=El tipo de vehículo no existe.');
    }

    const conexion = await db.getConnection();
    try {
        // Los cambios del ingreso se guardan juntos.
        await conexion.beginTransaction();

        // La patente única también permite reutilizar el vehículo en otra visita.
        const [vehiculo] = await conexion.execute(`
            INSERT INTO vehiculos (patente) VALUES (?)
            ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id)
        `, [patente]);
        const [tickets] = await conexion.execute(`
            SELECT id FROM tickets WHERE vehiculo_id = ? AND salida IS NULL
        `, [vehiculo.insertId]);
        if (tickets.length > 0) {
            await conexion.rollback();
            return res.redirect('/?error=La patente ya está dentro del estacionamiento.');
        }

        const [plaza] = await conexion.execute(`
            UPDATE plazas SET estado = 'Ocupada' WHERE id = ? AND estado = 'Disponible'
        `, [plazaId]);
        if (plaza.affectedRows === 0) {
            await conexion.rollback();
            return res.redirect('/?error=La plaza no está disponible.');
        }

        await conexion.execute(`
            INSERT INTO tickets (vehiculo_id, tarifa_id, plaza_id, precio_hora, entrada)
            VALUES (?, ?, ?, ?, NOW())
        `, [vehiculo.insertId, tarifaId, plazaId, tarifas[0].precio_hora]);

        await conexion.commit();
        res.redirect('/?mensaje=Ingreso registrado.');
    } catch (error) {
        await conexion.rollback();
        throw error;
    } finally {
        conexion.release();
    }
}

async function registrarSalida(req, res) {
    const ticketId = Number(req.body.ticket);
    const metodo = req.body.metodo;

    if (!Number.isInteger(ticketId) || ticketId < 1 ||
        !['Efectivo', 'Tarjeta', 'Transferencia'].includes(metodo)) {
        return res.redirect('/?error=Elegí un vehículo y un método de pago.');
    }

    const conexion = await db.getConnection();
    try {
        await conexion.beginTransaction();

        const [tickets] = await conexion.execute(`
            SELECT plaza_id, precio_hora FROM tickets
            WHERE id = ? AND salida IS NULL FOR UPDATE
        `, [ticketId]);
        if (tickets.length === 0) {
            await conexion.rollback();
            return res.redirect('/?error=El ticket no está activo.');
        }

        await conexion.execute('UPDATE tickets SET salida = NOW() WHERE id = ?', [ticketId]);
        const [tiempos] = await conexion.execute(`
            SELECT TIMESTAMPDIFF(SECOND, entrada, salida) AS segundos FROM tickets WHERE id = ?
        `, [ticketId]);

        const segundos = tiempos[0].segundos;
        const horas = Math.max(1, Math.ceil(segundos / 3600));
        const monto = (horas * Number(tickets[0].precio_hora)).toFixed(2);

        await conexion.execute('INSERT INTO pagos (ticket_id, monto, metodo) VALUES (?, ?, ?)',
            [ticketId, monto, metodo]);
        await conexion.execute("UPDATE plazas SET estado = 'Disponible' WHERE id = ?",
            [tickets[0].plaza_id]);

        await conexion.commit();
        const minutos = Math.floor(segundos / 60);
        res.redirect(`/?mensaje=Salida registrada. Tiempo: ${minutos} min ${segundos % 60} s. Total: $${monto}.`);
    } catch (error) {
        await conexion.rollback();
        throw error;
    } finally {
        conexion.release();
    }
}

async function cambiarEstadoPlaza(req, res) {
    const plazaId = Number(req.body.plaza);
    const estado = req.body.estado;

    if (!Number.isInteger(plazaId) || plazaId < 1 ||
        !['Disponible', 'Mantenimiento'].includes(estado)) {
        return res.redirect('/?error=Revisá la plaza y el estado.');
    }

    const [plaza] = await db.execute(`
        UPDATE plazas SET estado = ? WHERE id = ? AND estado <> 'Ocupada'
    `, [estado, plazaId]);
    if (plaza.affectedRows === 0) {
        return res.redirect('/?error=La plaza no existe o está ocupada.');
    }

    res.redirect('/?mensaje=Estado de la plaza guardado.');
}

module.exports = { cargarInicio, registrarIngreso, registrarSalida, cambiarEstadoPlaza };
