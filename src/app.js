import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import rutasEstacionamiento from './rutas/estacionamiento.js';
import rutasClientes from './rutas/clientes.js';

const app = express();
const carpeta = import.meta.dirname;

app.set('view engine', 'ejs');
app.set('views', path.join(carpeta, 'vistas'));
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(carpeta, 'public')));
app.get('/sweetalert2.js', (req, res) => {
    const archivo = import.meta.resolve('sweetalert2/dist/sweetalert2.all.min.js');
    res.sendFile(fileURLToPath(archivo));
});

app.use('/', rutasEstacionamiento);
app.use('/clientes', rutasClientes);

app.use((error, req, res, next) => {
    console.error(error.message);
    res.status(500).send('Ocurrió un error. Revisá la conexión con MySQL.');
});

const puerto = Number(process.env.PORT || 3000);
app.listen(puerto, '127.0.0.1', () => {
    console.log(`Parking Control en http://127.0.0.1:${puerto}`);
});
