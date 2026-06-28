import api from './api'

const proveedorService = {
  buscarActivos: (nombre) =>
    api.get('/proveedor/listar-activos', { params: { nombre } }),

  buscarInactivos: (nombre) =>
    api.get('/proveedor/listar-inactivos', { params: { nombre } }),

  crear: (proveedor) =>
    api.post('/proveedor', proveedor),

  editar: (id, proveedor) =>
    api.put(`/proveedor/${id}`, proveedor),

  cambiarEstado: (id, valor) =>
    api.patch(`/proveedor/${id}/estado`, null, { params: { valor } }),
}

export default proveedorService