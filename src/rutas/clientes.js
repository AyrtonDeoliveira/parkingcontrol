const express = require('express');
const clientes = require('../controllers/clientes');

const router = express.Router();

router.get('/', clientes.cargarClientes);
router.post('/', clientes.guardarCliente);

module.exports = router;
