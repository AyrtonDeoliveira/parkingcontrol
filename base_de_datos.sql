CREATE DATABASE parkingcontrol CHARACTER SET utf8mb4;
USE parkingcontrol;

CREATE TABLE clientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    telefono VARCHAR(25) NOT NULL,
    estado ENUM('Activa', 'Inactiva') NOT NULL
);

CREATE TABLE tarifas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tipo VARCHAR(30) NOT NULL UNIQUE,
    precio_hora DECIMAL(10, 2) NOT NULL
);

CREATE TABLE plazas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(10) NOT NULL UNIQUE,
    seccion VARCHAR(10) NOT NULL,
    estado ENUM('Disponible', 'Ocupada', 'Mantenimiento') NOT NULL DEFAULT 'Disponible'
);

CREATE TABLE vehiculos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patente VARCHAR(15) NOT NULL UNIQUE,
    cliente_id INT NULL,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id)
);

CREATE TABLE tickets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vehiculo_id INT NOT NULL,
    tarifa_id INT NOT NULL,
    plaza_id INT NOT NULL,
    precio_hora DECIMAL(10, 2) NOT NULL,
    entrada DATETIME NOT NULL,
    salida DATETIME NULL,
    FOREIGN KEY (vehiculo_id) REFERENCES vehiculos(id),
    FOREIGN KEY (tarifa_id) REFERENCES tarifas(id),
    FOREIGN KEY (plaza_id) REFERENCES plazas(id)
);

CREATE TABLE pagos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ticket_id INT NOT NULL UNIQUE,
    monto DECIMAL(12, 2) NOT NULL,
    metodo ENUM('Efectivo', 'Tarjeta', 'Transferencia') NOT NULL,
    FOREIGN KEY (ticket_id) REFERENCES tickets(id)
);

INSERT INTO tarifas (id, tipo, precio_hora) VALUES
    (1, 'Motocicleta', 1000.00),
    (2, 'Automóvil', 2000.00),
    (3, 'Camioneta', 3000.00);

INSERT INTO plazas (id, codigo, seccion, estado) VALUES
    (1, 'A-01', 'A', 'Ocupada'),
    (2, 'A-02', 'A', 'Disponible'),
    (3, 'A-03', 'A', 'Disponible'),
    (4, 'B-01', 'B', 'Disponible'),
    (5, 'B-02', 'B', 'Disponible'),
    (6, 'B-03', 'B', 'Mantenimiento');

INSERT INTO clientes (id, nombre, telefono, estado) VALUES
    (1, 'Ana Pérez', '099123456', 'Inactiva');

INSERT INTO vehiculos (id, patente, cliente_id) VALUES
    (1, 'ABC1234', NULL),
    (2, 'XYZ5678', 1),
    (3, 'DEF9012', NULL);

INSERT INTO tickets (id, vehiculo_id, tarifa_id, plaza_id, precio_hora, entrada, salida) VALUES
    (1, 1, 2, 1, 2000.00, NOW() - INTERVAL 30 MINUTE, NULL),
    (2, 2, 1, 2, 1000.00, '2026-01-10 09:00:00', '2026-01-10 10:20:00'),
    (3, 3, 3, 4, 3000.00, '2026-01-10 11:00:00', '2026-01-10 11:45:00');

INSERT INTO pagos (ticket_id, monto, metodo) VALUES
    (2, 2000.00, 'Efectivo'),
    (3, 3000.00, 'Tarjeta');
