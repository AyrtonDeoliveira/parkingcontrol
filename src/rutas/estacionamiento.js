import express from 'express';
import { cargarInicio, registrarIngreso, registrarSalida, cambiarEstadoPlaza } from '../controllers/estacionamiento.js';

const router = express.Router();

router.get('/', cargarInicio);
router.post('/ingresos', registrarIngreso);
router.post('/salidas', registrarSalida);
router.post('/plazas', cambiarEstadoPlaza);

export default router;
