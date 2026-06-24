import { useState, useEffect } from 'react'
import comprobanteService from '../services/comprobanteService'
import selectorService from '../services/selectorService'
import { obtenerUsuarioSesion } from '../services/sesionService'

function Comprobante() {
  const [comprobantes, setComprobantes] = useState([])
  const [filtroTipo, setFiltroTipo] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('')
  const [mensaje, setMensaje] = useState(null)
  const [mensajeError, setMensajeError] = useState(false)

  const [productos, setProductos] = useState([])

  // Modal crear
  const [modalCrear, setModalCrear] = useState(false)
  const [form, setForm] = useState({
    tipo: 'BOLETA', serie: 'B001', nombreCliente: '', rucCliente: ''
  })

  // Modal detalle
  const [modalDetalle, setModalDetalle] = useState(false)
  const [comprobanteActual, setComprobanteActual] = useState(null)
  const [detalle, setDetalle] = useState([])
  const [nuevoDetalle, setNuevoDetalle] = useState({ idProducto: '', cantidad: '', precioUnitario: '' })

  const cargar = async () => {
    try {
      const res = await comprobanteService.buscar(filtroTipo || null, filtroEstado !== '' ? filtroEstado : null)
      setComprobantes(res.data)
    } catch {
      setMensaje('Error al cargar comprobantes')
      setMensajeError(true)
    }
  }

  useEffect(() => { cargar() }, [filtroTipo, filtroEstado])

  const abrirCrear = async () => {
    try {
      const res = await selectorService.productos()
      setProductos(res.data)
    } catch {
      setMensaje('Error al cargar productos')
      setMensajeError(true)
      return
    }
    setForm({ tipo: 'BOLETA', serie: 'B001', nombreCliente: '', rucCliente: '' })
    setMensaje(null)
    setModalCrear(true)
  }

  const handleTipoChange = (tipo) => {
    setForm({ ...form, tipo, serie: tipo === 'BOLETA' ? 'B001' : 'F001' })
  }

  const crear = async () => {
    try {
      const usuario = obtenerUsuarioSesion()
      const res = await comprobanteService.crear({
        idUsuario: usuario.idUsuario,
        tipo: form.tipo,
        serie: form.serie,
        nombreCliente: form.nombreCliente,
        rucCliente: form.rucCliente || null
      })
      const exito = res.data.mensaje.startsWith('OK')
      setMensaje(res.data.mensaje)
      setMensajeError(!exito)
      if (exito) {
        setModalCrear(false)
        cargar()
        abrirDetalle({ codigo: res.data.idGenerado, estado: 1, tipo: form.tipo })
      }
    } catch (error) {
      setMensaje(error.response?.data?.mensaje || 'Error al crear comprobante')
      setMensajeError(true)
    }
  }

  const abrirDetalle = async (comprobante) => {
    try {
      const res = await selectorService.productos()
      setProductos(res.data)
    } catch {}
    setComprobanteActual(comprobante)
    setNuevoDetalle({ idProducto: '', cantidad: '', precioUnitario: '' })
    setMensaje(null)
    await cargarDetalle(comprobante.codigo)
    setModalDetalle(true)
  }

  const cargarDetalle = async (idComprobante) => {
    try {
      const res = await comprobanteService.listarDetalle(idComprobante)
      setDetalle(res.data)
    } catch {
      setMensaje('Error al cargar detalle')
      setMensajeError(true)
    }
  }

  const agregarProducto = async () => {
    try {
      const res = await comprobanteService.agregarDetalle(comprobanteActual.codigo, nuevoDetalle)
      const exito = res.data.mensaje.startsWith('OK')
      setMensaje(res.data.mensaje)
      setMensajeError(!exito)
      if (exito) {
        setNuevoDetalle({ idProducto: '', cantidad: '', precioUnitario: '' })
        await cargarDetalle(comprobanteActual.codigo)
        cargar()
      }
    } catch (error) {
      setMensaje(error.response?.data?.mensaje || 'Error al agregar producto')
      setMensajeError(true)
    }
  }

  const anular = async (id) => {
    if (!window.confirm('¿Estás seguro de anular este comprobante? Se devolverá el stock.')) return
    try {
      const res = await comprobanteService.anular(id)
      setMensaje(res.data.mensaje)
      setMensajeError(!res.data.mensaje.startsWith('OK'))
      cargar()
    } catch (error) {
      setMensaje(error.response?.data?.mensaje || 'Error al anular')
      setMensajeError(true)
    }
  }

  const numeroComprobante = (c) =>
    `${c.serie}-${String(c.correlativo).padStart(5, '0')}`

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold">Boletas y Facturas</h1>
        <button onClick={abrirCrear} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          + Nuevo comprobante
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
          value={filtroTipo}
          onChange={e => setFiltroTipo(e.target.value)}
          className="border rounded px-3 py-2 text-sm"
        >
          <option value="">Todos los tipos</option>
          <option value="BOLETA">Boleta</option>
          <option value="FACTURA">Factura</option>
        </select>
        <select
          value={filtroEstado}
          onChange={e => setFiltroEstado(e.target.value)}
          className="border rounded px-3 py-2 text-sm"
        >
          <option value="">Todos los estados</option>
          <option value="1">Activos</option>
          <option value="0">Anulados</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full bg-white rounded shadow text-sm">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="p-3 text-left">Número</th>
              <th className="p-3 text-left">Tipo</th>
              <th className="p-3 text-left">Cliente</th>
              <th className="p-3 text-left">RUC</th>
              <th className="p-3 text-left">Usuario</th>
              <th className="p-3 text-left">Fecha</th>
              <th className="p-3 text-left">Total</th>
              <th className="p-3 text-left">Estado</th>
              <th className="p-3 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {comprobantes.length === 0 ? (
              <tr><td colSpan={9} className="p-3 text-center text-gray-400">Sin resultados</td></tr>
            ) : (
              comprobantes.map((c) => (
                <tr key={c.codigo} className="border-t hover:bg-gray-50">
                  <td className="p-3 font-mono text-xs">{numeroComprobante(c)}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${c.tipo === 'FACTURA' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                      {c.tipo}
                    </span>
                  </td>
                  <td className="p-3">{c.cliente}</td>
                  <td className="p-3">{c.ruc || '-'}</td>
                  <td className="p-3">{c.usuario}</td>
                  <td className="p-3">{new Date(c.fecha).toLocaleString()}</td>
                  <td className="p-3">S/ {c.total}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${c.estado === 1 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {c.estado === 1 ? 'Activo' : 'Anulado'}
                    </span>
                  </td>
                  <td className="p-3 flex flex-wrap gap-1">
                    <button onClick={() => abrirDetalle(c)} className="bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600">
                      Ver detalle
                    </button>
                    {c.estado === 1 && (
                      <button onClick={() => anular(c.codigo)} className="bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600">
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

      {/* Modal crear */}
      {modalCrear && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[440px] shadow-xl">
            <h2 className="text-lg font-semibold mb-4">Nuevo comprobante</h2>
            <div className="flex flex-col gap-3">
              <div className="flex gap-2">
                <button
                  onClick={() => handleTipoChange('BOLETA')}
                  className={`flex-1 py-2 rounded text-sm font-medium border ${form.tipo === 'BOLETA' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}
                >
                  Boleta
                </button>
                <button
                  onClick={() => handleTipoChange('FACTURA')}
                  className={`flex-1 py-2 rounded text-sm font-medium border ${form.tipo === 'FACTURA' ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}
                >
                  Factura
                </button>
              </div>
              <input
                placeholder="Serie (ej: B001 o F001)"
                value={form.serie}
                onChange={e => setForm({ ...form, serie: e.target.value })}
                className="border rounded px-3 py-2 text-sm"
              />
              <input
                placeholder="Nombre del cliente"
                value={form.nombreCliente}
                onChange={e => setForm({ ...form, nombreCliente: e.target.value })}
                className="border rounded px-3 py-2 text-sm"
              />
              {form.tipo === 'FACTURA' && (
                <input
                  placeholder="RUC del cliente (obligatorio)"
                  value={form.rucCliente}
                  onChange={e => setForm({ ...form, rucCliente: e.target.value })}
                  className="border rounded px-3 py-2 text-sm"
                />
              )}
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
              <button onClick={crear} className="px-4 py-2 rounded bg-blue-600 text-white text-sm hover:bg-blue-700">
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
            <h2 className="text-lg font-semibold mb-1">
              {comprobanteActual?.tipo} — {comprobanteActual?.serie && comprobanteActual?.correlativo
                ? `${comprobanteActual.serie}-${String(comprobanteActual.correlativo).padStart(5, '0')}`
                : `#${comprobanteActual?.codigo}`}
            </h2>
            <p className="text-xs text-gray-500 mb-4">
              Cliente: {comprobanteActual?.cliente}
              {comprobanteActual?.ruc && ` | RUC: ${comprobanteActual.ruc}`}
            </p>

            <table className="w-full text-sm mb-4">
              <thead className="bg-gray-100 text-gray-600">
                <tr>
                  <th className="p-2 text-left">Producto</th>
                  <th className="p-2 text-left">Cant.</th>
                  <th className="p-2 text-left">P. Unit.</th>
                  <th className="p-2 text-left">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {detalle.length === 0 ? (
                  <tr><td colSpan={4} className="p-2 text-center text-gray-400">Sin productos</td></tr>
                ) : (
                  detalle.map(d => (
                    <tr key={d.codigo} className="border-t">
                      <td className="p-2">{d.producto}</td>
                      <td className="p-2">{d.cantidad}</td>
                      <td className="p-2">S/ {d.precioUnitario}</td>
                      <td className="p-2">S/ {d.subtotal}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {comprobanteActual?.estado === 1 && (
              <div className="border-t pt-3">
                <p className="text-sm font-medium mb-2">Agregar producto</p>
                <div className="flex flex-col gap-2">
                  <select
                    value={nuevoDetalle.idProducto}
                    onChange={e => {
                      const p = productos.find(p => String(p[0]) === e.target.value)
                      setNuevoDetalle({ ...nuevoDetalle, idProducto: e.target.value, precioUnitario: p ? p[2] : '' })
                    }}
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
                    Agregar producto
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

export default Comprobante