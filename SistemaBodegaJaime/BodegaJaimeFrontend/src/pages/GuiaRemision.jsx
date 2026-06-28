import { useState, useEffect } from 'react'
import guiaRemisionService from '../services/guiaRemisionService'
import ordenCompraService from '../services/ordenCompraService'
import { obtenerUsuarioSesion } from '../services/sesionService'

function GuiaRemision() {
  const [guias, setGuias] = useState([])
  const [mensaje, setMensaje] = useState(null)
  const [mensajeError, setMensajeError] = useState(false)

  const [ordenesPendientes, setOrdenesPendientes] = useState([])

  // Modal crear guía
  const [modalCrear, setModalCrear] = useState(false)
  const [idOrdenCompra, setIdOrdenCompra] = useState('')
  const [numeroGuia, setNumeroGuia] = useState('')

  // Modal detalle / recepción de productos
  const [modalDetalle, setModalDetalle] = useState(false)
  const [guiaActual, setGuiaActual] = useState(null)
  const [detalleOrden, setDetalleOrden] = useState([])
  const [detalleGuia, setDetalleGuia] = useState([])
  const [nuevoDetalle, setNuevoDetalle] = useState({ idProducto: '', cantidad: '' })

  const cargar = async () => {
    try {
      const res = await guiaRemisionService.buscar(null)
      setGuias(res.data)
    } catch {
      setMensaje('Error al cargar guías de remisión')
      setMensajeError(true)
    }
  }

  const cargarOrdenesPendientes = async () => {
    try {
      const res = await ordenCompraService.buscar('PENDIENTE')
      setOrdenesPendientes(res.data)
    } catch {
      setMensaje('Error al cargar órdenes pendientes')
      setMensajeError(true)
    }
  }

  useEffect(() => { cargar() }, [])

  const abrirCrear = async () => {
    await cargarOrdenesPendientes()
    setIdOrdenCompra('')
    setNumeroGuia('')
    setMensaje(null)
    setModalCrear(true)
  }

  const crearGuia = async () => {
    try {
      const usuario = obtenerUsuarioSesion()
      const res = await guiaRemisionService.crear(idOrdenCompra, usuario.idUsuario, numeroGuia)
      const exito = res.data.mensaje.startsWith('OK')
      setMensaje(res.data.mensaje)
      setMensajeError(!exito)
      if (exito) {
        setModalCrear(false)
        cargar()
        abrirDetalle({ codigo: res.data.idGenerado, idOrdenCompra, numeroGuia, estado: 1 })
      }
    } catch (error) {
      setMensaje(error.response?.data?.mensaje || 'Error al crear guía')
      setMensajeError(true)
    }
  }

  const abrirDetalle = async (guia) => {
    setGuiaActual(guia)
    setNuevoDetalle({ idProducto: '', cantidad: '' })
    setMensaje(null)
    await Promise.all([
      cargarDetalleOrden(guia.idOrdenCompra),
      cargarDetalleGuia(guia.codigo),
    ])
    setModalDetalle(true)
  }

  const cargarDetalleOrden = async (idOrdenCompra) => {
    try {
      const res = await ordenCompraService.listarDetalle(idOrdenCompra)
      setDetalleOrden(res.data)
    } catch {
      setMensaje('Error al cargar el detalle de la orden')
      setMensajeError(true)
    }
  }

  const cargarDetalleGuia = async (idGuiaRemision) => {
    try {
      const res = await guiaRemisionService.listarDetalle(idGuiaRemision)
      setDetalleGuia(res.data)
    } catch {
      setMensaje('Error al cargar el detalle de la guía')
      setMensajeError(true)
    }
  }

  const recibirProducto = async () => {
    try {
      const res = await guiaRemisionService.agregarDetalle(guiaActual.codigo, nuevoDetalle)
      const exito = res.data.mensaje.startsWith('OK')
      setMensaje(res.data.mensaje)
      setMensajeError(!exito)
      if (exito) {
        setNuevoDetalle({ idProducto: '', cantidad: '' })
        await Promise.all([
          cargarDetalleOrden(guiaActual.idOrdenCompra),
          cargarDetalleGuia(guiaActual.codigo),
        ])
      }
    } catch (error) {
      setMensaje(error.response?.data?.mensaje || 'Error al recibir producto')
      setMensajeError(true)
    }
  }

  const anular = async (id) => {
    try {
      const res = await guiaRemisionService.anular(id)
      setMensaje(res.data.mensaje)
      setMensajeError(!res.data.mensaje.startsWith('OK'))
      cargar()
    } catch (error) {
      setMensaje(error.response?.data?.mensaje || 'Error al anular guía')
      setMensajeError(true)
    }
  }

  // Productos pendientes por recibir en la orden actual (cantidad - cantidadRecibida > 0)
  const productosPendientes = detalleOrden.filter(d => d.cantidad > d.cantidadRecibida)

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold">Guías de remisión</h1>
        <button onClick={abrirCrear} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          + Nueva guía
        </button>
      </div>

      {mensaje && !modalCrear && !modalDetalle && (
        <div className={`mb-4 p-3 rounded text-sm flex justify-between items-center ${mensajeError ? 'bg-red-50 text-red-800' : 'bg-blue-50 text-blue-800'}`}>
          {mensaje}
          <button onClick={() => setMensaje(null)} className="ml-4">✕</button>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full bg-white rounded shadow text-sm">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="p-3 text-left">ID</th>
              <th className="p-3 text-left">N° Guía</th>
              <th className="p-3 text-left">Orden Compra</th>
              <th className="p-3 text-left">Proveedor</th>
              <th className="p-3 text-left">Usuario</th>
              <th className="p-3 text-left">Fecha</th>
              <th className="p-3 text-left">Estado</th>
              <th className="p-3 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {guias.length === 0 ? (
              <tr><td colSpan={8} className="p-3 text-center text-gray-400">Sin resultados</td></tr>
            ) : (
              guias.map((g) => (
                <tr key={g.codigo} className="border-t hover:bg-gray-50">
                  <td className="p-3">{g.codigo}</td>
                  <td className="p-3">{g.numeroGuia}</td>
                  <td className="p-3">#{g.idOrdenCompra}</td>
                  <td className="p-3">{g.proveedor}</td>
                  <td className="p-3">{g.usuario}</td>
                  <td className="p-3">{new Date(g.fecha).toLocaleString()}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${g.estado === 1 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {g.estado === 1 ? 'Activa' : 'Anulada'}
                    </span>
                  </td>
                  <td className="p-3 flex flex-wrap gap-1">
                    <button onClick={() => abrirDetalle(g)} className="bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600">
                      Ver detalle
                    </button>
                    {g.estado === 1 && (
                      <button onClick={() => anular(g.codigo)} className="bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600">
                        Anular
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal crear guía */}
      {modalCrear && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[440px] shadow-xl">
            <h2 className="text-lg font-semibold mb-4">Nueva guía de remisión</h2>
            <div className="flex flex-col gap-3">
              <select
                value={idOrdenCompra}
                onChange={e => setIdOrdenCompra(e.target.value)}
                className="border rounded px-3 py-2 text-sm"
              >
                <option value="">-- Selecciona una orden de compra pendiente --</option>
                {ordenesPendientes.map(o => (
                  <option key={o.codigo} value={o.codigo}>
                    #{o.codigo} - {o.proveedor} - S/ {o.total}
                  </option>
                ))}
              </select>
              <input
                placeholder="Número de guía (ej: G001-00123)"
                value={numeroGuia}
                onChange={e => setNumeroGuia(e.target.value)}
                className="border rounded px-3 py-2 text-sm"
              />
            </div>

            {mensaje && (
              <div className={`mt-3 p-2 rounded text-xs ${mensajeError ? 'bg-red-50 text-red-800' : 'bg-blue-50 text-blue-800'}`}>
                {mensaje}
              </div>
            )}

            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setModalCrear(false)} className="px-4 py-2 rounded bg-gray-200 text-sm hover:bg-gray-300">
                Cancelar
              </button>
              <button onClick={crearGuia} className="px-4 py-2 rounded bg-blue-600 text-white text-sm hover:bg-blue-700">
                Crear y recibir productos
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal detalle / recepción */}
      {modalDetalle && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[600px] shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-1">Guía #{guiaActual?.codigo} - {guiaActual?.numeroGuia}</h2>
            <p className="text-xs text-gray-500 mb-4">Orden de compra #{guiaActual?.idOrdenCompra}</p>

            <p className="text-sm font-medium mb-2">Productos recibidos en esta guía</p>
            <table className="w-full text-sm mb-4">
              <thead className="bg-gray-100 text-gray-600">
                <tr>
                  <th className="p-2 text-left">Producto</th>
                  <th className="p-2 text-left">Cantidad</th>
                </tr>
              </thead>
              <tbody>
                {detalleGuia.length === 0 ? (
                  <tr><td colSpan={2} className="p-2 text-center text-gray-400">Aún no se han recibido productos</td></tr>
                ) : (
                  detalleGuia.map(d => (
                    <tr key={d.codigo} className="border-t">
                      <td className="p-2">{d.producto}</td>
                      <td className="p-2">{d.cantidad}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {guiaActual?.estado === 1 && (
              <div className="border-t pt-3">
                <p className="text-sm font-medium mb-2">Registrar recepción de producto</p>
                {productosPendientes.length === 0 ? (
                  <p className="text-xs text-gray-400">No hay productos pendientes por recibir en esta orden.</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    <select
                      value={nuevoDetalle.idProducto}
                      onChange={e => setNuevoDetalle({ ...nuevoDetalle, idProducto: e.target.value })}
                      className="border rounded px-3 py-2 text-sm"
                    >
                      <option value="">-- Selecciona un producto pendiente --</option>
                      {productosPendientes.map(d => (
                        <option key={d.idProducto} value={d.idProducto}>
                          {d.producto} (pendiente: {d.cantidad - d.cantidadRecibida})
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min="1"
                      placeholder="Cantidad recibida"
                      value={nuevoDetalle.cantidad}
                      onChange={e => setNuevoDetalle({ ...nuevoDetalle, cantidad: e.target.value })}
                      className="border rounded px-3 py-2 text-sm"
                    />
                    <button onClick={recibirProducto} className="bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 self-end">
                      Registrar recepción (aumenta stock)
                    </button>
                  </div>
                )}
              </div>
            )}

            {mensaje && (
              <div className={`mt-3 p-2 rounded text-xs ${mensajeError ? 'bg-red-50 text-red-800' : 'bg-blue-50 text-blue-800'}`}>
                {mensaje}
              </div>
            )}

            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setModalDetalle(false)} className="px-4 py-2 rounded bg-gray-200 text-sm hover:bg-gray-300">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default GuiaRemision