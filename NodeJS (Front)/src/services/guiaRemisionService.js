import api from './api'

const guiaRemisionService = {
  buscar: (idOrdenCompra) =>
    api.get('/guia-remision', { params: { idOrdenCompra } }),

  listarDetalle: (idGuiaRemision) =>
    api.get(`/guia-remision/${idGuiaRemision}/detalle`),

  crear: (idOrdenCompra, idUsuario, numeroGuia) =>
    api.post('/guia-remision', { idOrdenCompra, idUsuario, numeroGuia }),

  agregarDetalle: (idGuiaRemision, detalle) =>
    api.post(`/guia-remision/${idGuiaRemision}/detalle`, detalle),

  anular: (idGuiaRemision) =>
    api.patch(`/guia-remision/${idGuiaRemision}/anular`),
}

export default guiaRemisionService