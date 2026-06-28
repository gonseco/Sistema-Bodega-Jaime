import api from './api'

const comprobanteService = {
  buscar: (tipo, estado) =>
    api.get('/comprobante', { params: { tipo, estado } }),

  listarDetalle: (idComprobante) =>
    api.get(`/comprobante/${idComprobante}/detalle`),

  crear: (datos) =>
    api.post('/comprobante', datos),

  agregarDetalle: (idComprobante, detalle) =>
    api.post(`/comprobante/${idComprobante}/detalle`, detalle),

  anular: (idComprobante) =>
    api.patch(`/comprobante/${idComprobante}/anular`),
}

export default comprobanteService