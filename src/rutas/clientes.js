import express from 'express';
import { cargarClientes, guardarCliente } from '../controllers/clientes.js';

const router = express.Router();

router.get('/', cargarClientes);
router.post('/', guardarCliente);

export default router;
