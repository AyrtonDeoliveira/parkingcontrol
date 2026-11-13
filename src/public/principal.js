const aviso = document.getElementById('aviso');

if (aviso && typeof Swal !== 'undefined') {
    Swal.fire({
        icon: aviso.dataset.icono,
        text: aviso.textContent
    });
}
