USE parkingcontrol;

-- Plazas disponibles por sección, incluso cuando quedan cero.
SELECT seccion, COUNT(CASE WHEN estado = 'Disponible' THEN 1 END) AS libres
FROM plazas
GROUP BY seccion
ORDER BY seccion;

-- Vehículos que están dentro del estacionamiento.
SELECT vehiculos.patente, tarifas.tipo, plazas.codigo AS plaza, tickets.entrada
FROM tickets
JOIN vehiculos ON tickets.vehiculo_id = vehiculos.id
JOIN tarifas ON tickets.tarifa_id = tarifas.id
JOIN plazas ON tickets.plaza_id = plazas.id
WHERE tickets.salida IS NULL
ORDER BY tickets.entrada;

-- Recaudación por método en la fecha indicada.
SET @fecha = '2026-01-10';

SELECT pagos.metodo, SUM(pagos.monto) AS total
FROM pagos
JOIN tickets ON pagos.ticket_id = tickets.id
WHERE DATE(tickets.salida) = @fecha
GROUP BY pagos.metodo
ORDER BY pagos.metodo;

-- Promedio de horas reales de los tickets cerrados.
SELECT ROUND(AVG(TIMESTAMPDIFF(SECOND, entrada, salida)) / 3600, 2) AS horas_promedio
FROM tickets
WHERE salida IS NOT NULL;
