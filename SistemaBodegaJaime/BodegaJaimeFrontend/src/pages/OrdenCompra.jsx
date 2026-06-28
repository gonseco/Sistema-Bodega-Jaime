import { useState, useEffect } from 'react'
import ordenCompraService from '../services/ordenCompraService'
import selectorService from '../services/selectorService'
import { obtenerUsuarioSesion } from '../services/sesionService'

function OrdenCompra() {
  const [ordenes, setOrdenes] = useState([])
  const [filtroEstado, setFiltroEstado] = useState('')
  const [mensaje, setMensaje] = useState(null)
  const [mensajeError, setMensajeError] = useState(false)

  const [proveedores, setProveedores] = useState([])
  const [productos, setProductos] = useState([])

  // Modal crear orden
  const [modalCrear, setModalCrear] = useState(false)
  const [idProveedor, setIdProveedor] = useState('')

  // Modal detalle / agregar productos
  const [modalDetalle, setModalDetalle] = useState(false)
  const [ordenActual, setOrdenActual] = useState(null)
  const [detalle, setDetalle] = useState([])
  const [nuevoDetalle, setNuevoDetalle] = useState({ idProducto: '', cantidad: '', precioUnitario: '' })

  const cargar = async () => {
    try {
      const res = await ordenCompraService.buscar(filtroEstado || null)
      setOrdenes(res.data)
    } catch {
      setMensaje('Error al cargar órdenes de compra')
      setMensajeError(true)
    }
  }

  const cargarSelectores = async () => {
    try {
      const [rp, rpr] = await Promise.all([
        selectorService.proveedores(),
        selectorService.productos(),
      ])
      setProveedores(rp.data)
      setProductos(rpr.data)
    } catch {
      setMensaje('Error al cargar selectores')
      setMensajeError(true)
    }
  }

  useEffect(() => { cargar() }, [filtroEstado])

  const abrirCrear = async () => {
    await cargarSelectores()
    setIdProveedor('')
    setMensaje(null)
    setModalCrear(true)
  }

  const crearOrden = async () => {
    try {
      const usuario = obtenerUsuarioSesion()
      const res = await ordenCompraService.crear(idProveedor, usuario.idUsuario)
      const exito = res.data.mensaje.startsWith('OK')
      setMensaje(res.data.mensaje)
      setMensajeError(!exito)
      if (exito) {
        setModalCrear(false)
        cargar()
        abrirDetalle({ codigo: res.data.idGenerado, estado: 'PENDIENTE' })
      }
    } catch (error) {
      setMensaje(error.response?.data?.mensaje || 'Error al crear orden')
      setMensajeError(true)
    }
  }

  const abrirDetalle = async (orden) => {
    await cargarSelectores()
    setOrdenActual(orden)
    setNuevoDetalle({ idProducto: '', cantidad: '', precioUnitario: '' })
    setMensaje(null)
    await cargarDetalle(orden.codigo)
    setModalDetalle(true)
  }

  const cargarDetalle = async (idOrdenCompra) => {
    try {
      const res = await ordenCompraService.listarDetalle(idOrdenCompra)
      setDetalle(res.data)
    } catch {
      setMensaje('Error al cargar el detalle')
      setMensajeError(true)
    }
  }

  const agregarProducto = async () => {
    try {
      const res = await ordenCompraService.agregarDetalle(ordenActual.codigo, nuevoDetalle)
      const exito = res.data.mensaje.startsWith('OK')
      setMensaje(res.data.mensaje)
      setMensajeError(!exito)
      if (exito) {
        setNuevoDetalle({ idProducto: '', cantidad: '', precioUnitario: '' })
        await cargarDetalle(ordenActual.codigo)
        cargar()
      }
    } catch (error) {
      setMensaje(error.response?.data?.mensaje || 'Error al agregar producto')
      setMensajeError(true)
    }
  }

  const anular = async (id) => {
    try {
      const res = await ordenCompraService.anular(id)
      setMensaje(res.data.mensaje)
      setMensajeError(!res.data.mensaje.startsWith('OK'))
      cargar()
    } catch (error) {
      setMensaje(error.response?.data?.mensaje || 'Error al anular orden')
      setMensajeError(true)
    }
  }

  const colorEstado = (estado) => {
    if (estado === 'ATENDIDA') return 'bg-green-100 text-green-700'
    if (estado === 'ANULADA') return 'bg-red-100 text-red-700'
    return 'bg-yellow-100 text-yellow-700'
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold">Órdenes de compra</h1>
        <button onClick={abrirCrear} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          + Nueva orden
        </button>
      </div>

      {mensaje && !modalCrear && !modalDetalle && (
        <div className={`mb-4 p-3 rounded text-sm flex justify-between items-center ${mensajeError ? 'bg-red-50 text-red-800' : 'bg-blue-50 text-blue-800'}`}>
          {mensaje}
          <button onClick={() => setMensaje(null)} className="ml-4">✕</button>
        </div>
      )}

      <div className="flex flex-wrap gap-3 mb-4">
        <select
          value={filtroEstado}
          onChange={e => setFiltroEstado(e.target.value)}
          className="border rounded px-3 py-2 text-sm"
        >
          <option value="">Todos los estados</option>
          <option value="PENDIENTE">Pendiente</option>
          <option value="ATENDIDA">Atendida</option>
          <option value="ANULADA">Anulada</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full bg-white rounded shadow text-sm">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="p-3 text-left">ID</th>
              <th className="p-3 text-left">Proveedor</th>
              <th className="p-3 text-left">Usuario</th>
              <th className="p-3 text-left">Fecha</th>
              <th className="p-3 text-left">Total</th>
              <th className="p-3 text-left">Estado</th>
              <th className="p-3 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {ordenes.length === 0 ? (
              <tr><td colSpan={7} className="p-3 text-center text-gray-400">Sin resultados</td></tr>
            ) : (
              ordenes.map((o) => (
                <tr key={o.codigo} className="border-t hover:bg-gray-50">
                  <td className="p-3">{o.codigo}</td>
                  <td className="p-3">{o.proveedor}</td>
                  <td className="p-3">{o.usuario}</td>
                  <td className="p-3">{new Date(o.fecha).toLocaleString()}</td>
                  <td className="p-3">S/ {o.total}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${colorEstado(o.estado)}`}>
                      {o.estado}
                    </span>
                  </td>
                  <td className="p-3 flex flex-wrap gap-1">
                    <button onClick={() => abrirDetalle(o)} className="bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600">
                      Ver detalle
                    </button>
                    {o.estado === 'PENDIENTE' && (
                      <button onClick={() => anular(o.codigo)} className="bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600">
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

      {/* Modal crear orden */}
      {modalCrear && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[420px] shadow-xl">
            <h2 className="text-lg font-semibold mb-4">Nueva orden de compra</h2>
            <select
              value={idProveedor}
              onChange={e => setIdProveedor(e.target.value)}
              className="border rounded px-3 py-2 text-sm w-full"
            >
              <option value="">-- Selecciona un proveedor --</option>
              {proveedores.map(p => (
                <option key={p[0]} value={p[0]}>{p[1]}</option>
              ))}
            </select>

            {mensaje && (
              <div className={`mt-3 p-2 rounded text-xs ${mensajeError ? 'bg-red-50 text-red-800' : 'bg-blue-50 text-blue-800'}`}>
                {mensaje}
              </div>
            )}

            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setModalCrear(false)} className="px-4 py-2 rounded bg-gray-200 text-sm hover:bg-gray-300">
                Cancelar
              </button>
              <button onClick={crearOrden} className="px-4 py-2 rounded bg-blue-600 text-white text-sm hover:bg-blue-700">
                Crear y agregar productos
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal detalle */}
      {modalDetalle && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[600px] shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-1">Orden de compra #{ordenActual?.codigo}</h2>
            <p className="text-xs text-gray-500 mb-4">Estado: {ordenActual?.estado}</p>

            <table className="w-full text-sm mb-4">
              <thead className="bg-gray-100 text-gray-600">
                <tr>
                  <th className="p-2 text-left">Producto</th>
                  <th className="p-2 text-left">Cant.</th>
                  <th className="p-2 text-left">P. Unit.</th>
                  <th className="p-2 text-left">Subtotal</th>
                  <th className="p-2 text-left">Recibido</th>
                </tr>
              </thead>
              <tbody>
                {detalle.length === 0 ? (
                  <tr><td colSpan={5} className="p-2 text-center text-gray-400">Sin productos agregados</td></tr>
                ) : (
                  detalle.map(d => (
                    <tr key={d.codigo} className="border-t">
                      <td className="p-2">{d.producto}</td>
                      <td className="p-2">{d.cantidad}</td>
                      <td className="p-2">S/ {d.precioUnitario}</td>
                      <td className="p-2">S/ {d.subtotal}</td>
                      <td className="p-2">{d.cantidadRecibida} / {d.cantidad}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {ordenActual?.estado === 'PENDIENTE' && (
              <div className="border-t pt-3">
                <p className="text-sm font-medium mb-2">Agregar producto</p>
                <div className="flex flex-col gap-2">
                  <select
                    value={nuevoDetalle.idProducto}
                    onChange={e => setNuevoDetalle({ ...nuevoDetalle, idProducto: e.target.value })}
                    className="border rounded px-3 py-2 text-sm"
                  >
                    <option value="">-- Selecciona un producto --</option>
                    {productos.map(p => (
                      <option key={p[0]} value={p[0]}>{p[1]}</option>
                    ))}
                  </select>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="1"
                      placeholder="Cantidad"
                      value={nuevoDetalle.cantidad}
                      onChange={e => setNuevoDetalle({ ...nuevoDetalle, cantidad: e.target.value })}
                      className="border rounded px-3 py-2 text-sm flex-1"
                    />
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      placeholder="Precio unitario"
                      value={nuevoDetalle.precioUnitario}
                      onChange={e => setNuevoDetalle({ ...nuevoDetalle, precioUnitario: e.target.value })}
                      className="border rounded px-3 py-2 text-sm flex-1"
                    />
                  </div>
                  <button onClick={agregarProducto} className="bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 self-end">
                    Agregar a la orden
                  </button>
                </div>
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

export default OrdenCompra