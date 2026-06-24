import api from './api'

const ordenCompraService = {
  buscar: (estado) =>
    api.get('/orden-compra', { params: { estado } }),

  listarDetalle: (idOrdenCompra) =>
    api.get(`/orden-compra/${idOrdenCompra}/detalle`),

  crear: (idProveedor, idUsuario) =>
    api.post('/orden-compra', { idProveedor, idUsuario }),

  agregarDetalle: (idOrdenCompra, detalle) =>
    api.post(`/orden-compra/${idOrdenCompra}/detalle`, detalle),

  anular: (idOrdenCompra) =>
    api.patch(`/orden-compra/${idOrdenCompra}/anular`),
}

export default ordenCompraService