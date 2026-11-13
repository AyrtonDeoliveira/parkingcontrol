const express = require('express');
const estacionamiento = require('../controllers/estacionamiento');

const router = express.Router();

router.get('/', estacionamiento.cargarInicio);
router.post('/ingresos', estacionamiento.registrarIngreso);
router.post('/salidas', estacionamiento.registrarSalida);
router.post('/plazas', estacionamiento.cambiarEstadoPlaza);

module.exports = router;
