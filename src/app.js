const express = require('express');
const path = require('node:path');
const rutasEstacionamiento = require('./rutas/estacionamiento');
const rutasClientes = require('./rutas/clientes');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'vistas'));
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.get('/sweetalert2.js', (req, res) => {
    res.sendFile(require.resolve('sweetalert2/dist/sweetalert2.all.min.js'));
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
