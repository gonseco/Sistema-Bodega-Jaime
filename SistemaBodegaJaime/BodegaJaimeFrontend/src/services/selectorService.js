import api from './api'

const selectorService = {
    marcas: () =>
        api.get('/marca/listar-activas'),

    categorias: () =>
        api.get('/categoria/listar-activas'),

    unidades: () =>
        api.get('/unidad-de-medida/listar-activas'),

    proveedores: () =>
        api.get('/proveedor/listar-activos').then(res => ({
            data: res.data.map(p => [p.codigo, p.nombre])
        })),

    productos: () =>
        api.get('/producto/listar-activos').then(res => ({
            data: res.data.map(p => [p.codigo, p.nombre, p.precio])
        })),
}

export default selectorService