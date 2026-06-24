/* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react'
import ventaService from '../services/ventaService'
import usuarioService from '../services/usuarioService'

function Venta() {
  const [usuarios, setUsuarios] = useState([])
  const [productos, setProductos] = useState([])
  const [detalles, setDetalles] = useState([])
  const [cantidades, setCantidades] = useState({})

  const [idUsuario, setIdUsuario] = useState('')
  const [filtroNombre, setFiltroNombre] = useState('')
  const [filtroMarca, setFiltroMarca] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState('')
  const [filtroUnidad, setFiltroUnidad] = useState('')

  const [mensaje, setMensaje] = useState(null)
  const [mensajeError, setMensajeError] = useState(false)
  const [confirmacionAbierta, setConfirmacionAbierta] = useState(false)

  const inputClass = 'border border-slate-200 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500'
  const buttonPrimary = 'bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed'
  const buttonSecondary = 'bg-slate-100 text-slate-700 px-4 py-2 rounded text-sm font-medium hover:bg-slate-200'
  const buttonDanger = 'bg-red-500 text-white px-3 py-1.5 rounded text-xs font-medium hover:bg-red-600'

  const cargarUsuarios = async () => {
    try {
      const res = await usuarioService.buscarActivos()
      setUsuarios(res.data)
    } catch {
      setMensaje('Error al cargar usuarios')
      setMensajeError(true)
    }
  }

  const cargarProductos = async () => {
    try {
      const res = await ventaService.buscarProductosDisponibles(
        filtroNombre || null,
        filtroMarca || null,
        filtroCategoria || null,
        filtroUnidad || null
      )
      setProductos(res.data)
    } catch {
      setMensaje('Error al cargar productos disponibles')
      setMensajeError(true)
    }
  }

  useEffect(() => {
    cargarUsuarios()
    cargarProductos()
  }, [])

  const cambiarCantidad = (idProducto, valor) => {
    setCantidades({ ...cantidades, [idProducto]: valor })
  }

  const stockClass = (stock) => {
    if (stock <= 0) return 'bg-red-50 text-red-700 border-red-100'
    if (stock <= 3) return 'bg-yellow-50 text-yellow-700 border-yellow-100'
    return 'bg-green-50 text-green-700 border-green-100'
  }

  const agregarDetalle = (producto) => {
    const cantidad = Number(cantidades[producto.codigo] || 1)

    if (cantidad <= 0) {
      setMensaje('La cantidad debe ser mayor que cero.')
      setMensajeError(true)
      return
    }

    if (cantidad > producto.stockDisponible) {
      setMensaje('La cantidad no puede superar el stock disponible.')
      setMensajeError(true)
      return
    }

    const existente = detalles.find(d => d.idProducto === producto.codigo)

    if (existente) {
      const nuevaCantidad = existente.cantidad + cantidad
      if (nuevaCantidad > producto.stockDisponible) {
        setMensaje('La cantidad total no puede superar el stock disponible.')
        setMensajeError(true)
        return
      }

      setDetalles(detalles.map(d =>
        d.idProducto === producto.codigo
          ? { ...d, cantidad: nuevaCantidad, subtotal: nuevaCantidad * Number(producto.precio) }
          : d
      ))
    } else {
      setDetalles([
        ...detalles,
        {
          idProducto: producto.codigo,
          nombre: producto.nombre,
          marca: producto.marca,
          unidad: producto.unidad,
          precio: Number(producto.precio),
          stockDisponible: producto.stockDisponible,
          cantidad,
          subtotal: cantidad * Number(producto.precio)
        }
      ])
    }

    setMensaje('Producto agregado al carrito.')
    setMensajeError(false)
  }

  const quitarDetalle = (idProducto) => {
    setDetalles(detalles.filter(d => d.idProducto !== idProducto))
  }

  const disminuirDetalle = (idProducto) => {
    setDetalles(detalles.map(d => {
      if (d.idProducto !== idProducto) return d
      const nuevaCantidad = Math.max(1, d.cantidad - 1)
      return { ...d, cantidad: nuevaCantidad, subtotal: nuevaCantidad * d.precio }
    }))
  }

  const aumentarDetalle = (idProducto) => {
    const detalle = detalles.find(d => d.idProducto === idProducto)
    if (!detalle) return

    if (detalle.cantidad >= detalle.stockDisponible) {
      setMensaje('La cantidad no puede superar el stock disponible.')
      setMensajeError(true)
      return
    }

    setDetalles(detalles.map(d => {
      if (d.idProducto !== idProducto) return d
      const nuevaCantidad = d.cantidad + 1
      return { ...d, cantidad: nuevaCantidad, subtotal: nuevaCantidad * d.precio }
    }))
  }

  const totalVenta = detalles.reduce((total, d) => total + d.subtotal, 0)
  const totalProductos = detalles.reduce((total, d) => total + d.cantidad, 0)

  const validarVenta = () => {
    if (!idUsuario) {
      setMensaje('Selecciona un usuario responsable para registrar la venta.')
      setMensajeError(true)
      return false
    }

    if (detalles.length === 0) {
      setMensaje('Agrega al menos un producto al carrito antes de registrar.')
      setMensajeError(true)
      return false
    }

    return true
  }

  const abrirConfirmacionVenta = () => {
    if (!validarVenta()) return
    setMensaje(null)
    setConfirmacionAbierta(true)
  }

  const registrarVenta = async () => {
    if (!validarVenta()) return

    try {
      const res = await ventaService.registrar({
        idUsuario: Number(idUsuario),
        detalles: detalles.map(d => ({
          idProducto: d.idProducto,
          cantidad: d.cantidad
        }))
      })
      const exito = res.data.mensaje.startsWith('OK')
      setMensaje(exito ? 'Venta registrada correctamente.' : res.data.mensaje)
      setMensajeError(!exito)

      if (exito) {
        setDetalles([])
        setCantidades({})
        setConfirmacionAbierta(false)
        cargarProductos()
      }
    } catch (error) {
      setMensaje(error.response?.data?.mensaje || 'Error al registrar venta')
      setMensajeError(true)
      setConfirmacionAbierta(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Registro de venta</h1>
        <p className="text-sm text-slate-500">Caja de atencion</p>
      </div>

      {mensaje && (
        <div className={`border-l-4 p-3 rounded text-sm flex justify-between items-center shadow-sm ${mensajeError ? 'bg-red-50 text-red-800 border-red-500' : 'bg-green-50 text-green-800 border-green-500'}`}>
          <span>{mensaje}</span>
          <button onClick={() => setMensaje(null)} className="ml-4 text-base leading-none hover:opacity-70">x</button>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_420px] gap-5 items-start">
        <div className="bg-white rounded-md border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center gap-3 border-b border-slate-100 px-4 py-3">
            <h2 className="text-base font-semibold text-slate-900">Productos disponibles</h2>
            <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs">{productos.length} resultado(s)</span>
          </div>

          <div className="p-4">
            <div className="flex flex-wrap gap-3 mb-4">
              <input
                placeholder="Producto"
                value={filtroNombre}
                onChange={e => setFiltroNombre(e.target.value)}
                className={`${inputClass} flex-1 min-w-32`}
              />
              <input
                placeholder="Marca"
                value={filtroMarca}
                onChange={e => setFiltroMarca(e.target.value)}
                className={`${inputClass} flex-1 min-w-32`}
              />
              <input
                placeholder="Categoria"
                value={filtroCategoria}
                onChange={e => setFiltroCategoria(e.target.value)}
                className={`${inputClass} flex-1 min-w-32`}
              />
              <input
                placeholder="Unidad"
                value={filtroUnidad}
                onChange={e => setFiltroUnidad(e.target.value)}
                className={`${inputClass} flex-1 min-w-32`}
              />
              <button onClick={cargarProductos} className={buttonSecondary}>
                Buscar
              </button>
            </div>

            <div className="overflow-x-auto border border-slate-100 rounded-md">
              <table className="w-full min-w-[920px] text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="p-3 text-left font-semibold uppercase text-xs">ID</th>
                    <th className="p-3 text-left font-semibold uppercase text-xs">Producto</th>
                    <th className="p-3 text-left font-semibold uppercase text-xs">Marca</th>
                    <th className="p-3 text-left font-semibold uppercase text-xs">Unidad</th>
                    <th className="p-3 text-left font-semibold uppercase text-xs">Stock</th>
                    <th className="p-3 text-left font-semibold uppercase text-xs">Precio</th>
                    <th className="p-3 text-left font-semibold uppercase text-xs">Cantidad</th>
                    <th className="p-3 text-left font-semibold uppercase text-xs">Accion</th>
                  </tr>
                </thead>
                <tbody>
                  {productos.length === 0 ? (
                    <tr><td colSpan={8} className="p-6 text-center text-slate-400">Sin productos disponibles</td></tr>
                  ) : (
                    productos.map(p => (
                      <tr key={p.codigo} className="border-t border-slate-100 hover:bg-blue-50/40">
                        <td className="p-3 text-slate-500">{p.codigo}</td>
                        <td className="p-3 font-medium text-slate-900">{p.nombre}</td>
                        <td className="p-3 text-slate-600">{p.marca}</td>
                        <td className="p-3 text-slate-600">{p.unidad}</td>
                        <td className="p-3">
                          <span className={`inline-flex min-w-10 justify-center border px-2 py-1 rounded text-xs font-medium ${stockClass(Number(p.stockDisponible))}`}>
                            {p.stockDisponible}
                          </span>
                        </td>
                        <td className="p-3 font-medium text-slate-800">S/ {Number(p.precio).toFixed(2)}</td>
                        <td className="p-3">
                          <input
                            type="number"
                            min="1"
                            max={p.stockDisponible}
                            value={cantidades[p.codigo] || 1}
                            onChange={e => cambiarCantidad(p.codigo, e.target.value)}
                            className={`${inputClass} w-20 py-1.5`}
                          />
                        </td>
                        <td className="p-3">
                          <button
                            onClick={() => agregarDetalle(p)}
                            className="bg-blue-600 text-white px-3 py-1.5 rounded text-xs font-medium hover:bg-blue-700"
                          >
                            Agregar
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-md border border-slate-200 shadow-sm xl:sticky xl:top-4">
          <div className="flex justify-between items-start gap-3 border-b border-slate-100 px-4 py-3">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Carrito de compras</h2>
              <p className="text-xs text-slate-500">{totalProductos} producto(s) en total</p>
            </div>
            <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-medium">
              {detalles.length} item(s)
            </span>
          </div>

          <div className="p-4">
            <div className="flex flex-col gap-1 mb-4">
              <label className="text-xs font-medium text-slate-500">Usuario responsable</label>
              <select
                value={idUsuario}
                onChange={e => setIdUsuario(e.target.value)}
                className={inputClass}
              >
                <option value="">-- Selecciona un usuario --</option>
                {usuarios.map(u => (
                  <option key={u[0]} value={u[0]}>{u[1]} - {u[3]}</option>
                ))}
              </select>
            </div>

            <div className="max-h-[52vh] overflow-y-auto border border-slate-100 rounded-md bg-slate-50">
              {detalles.length === 0 ? (
                <div className="p-6 text-center text-sm text-slate-400">Sin productos agregados</div>
              ) : (
                detalles.map(d => (
                  <div key={d.idProducto} className="bg-white border-b border-slate-100 last:border-b-0 p-3">
                    <div className="flex justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-slate-900">{d.nombre}</p>
                        <p className="text-xs text-slate-500">{d.marca} - {d.unidad}</p>
                        <p className={`text-xs mt-1 ${d.stockDisponible - d.cantidad <= 3 ? 'text-yellow-700' : 'text-slate-500'}`}>
                          Stock restante: {d.stockDisponible - d.cantidad}
                        </p>
                      </div>
                      <button onClick={() => quitarDetalle(d.idProducto)} className={`${buttonDanger} h-fit`}>
                        Quitar
                      </button>
                    </div>

                    <div className="flex justify-between items-center mt-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => disminuirDetalle(d.idProducto)}
                          disabled={d.cantidad <= 1}
                          className={`w-8 h-8 rounded text-sm font-semibold ${d.cantidad <= 1 ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
                        >
                          -
                        </button>
                        <span className="min-w-10 text-center text-sm font-semibold text-slate-900">{d.cantidad}</span>
                        <button
                          onClick={() => aumentarDetalle(d.idProducto)}
                          disabled={d.cantidad >= d.stockDisponible}
                          className={`w-8 h-8 rounded text-sm font-semibold ${d.cantidad >= d.stockDisponible ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
                        >
                          +
                        </button>
                      </div>

                      <div className="text-right">
                        <p className="text-xs text-slate-500">S/ {d.precio.toFixed(2)} c/u</p>
                        <p className="text-sm font-semibold text-slate-900">S/ {d.subtotal.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="border-t border-slate-100 mt-4 pt-4">
              <div className="bg-white border border-slate-200 rounded-md p-4 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500">Total</span>
                  <span className="text-2xl font-semibold text-slate-900">S/ {totalVenta.toFixed(2)}</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">{totalProductos} producto(s) por cobrar</p>
              </div>
              <button onClick={abrirConfirmacionVenta} className={`${buttonPrimary} w-full py-3`}>
                Registrar venta
              </button>
            </div>
          </div>
        </div>
      </div>

      {confirmacionAbierta && (
        <div className="fixed inset-0 bg-slate-950/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-md shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h2 className="text-lg font-semibold text-slate-900">Confirmar venta</h2>
              <p className="text-sm text-slate-500">Revisa el total antes de registrar.</p>
            </div>

            <div className="p-5">
              <div className="border border-slate-100 rounded-md mb-4 max-h-52 overflow-y-auto">
                {detalles.map(d => (
                  <div key={d.idProducto} className="flex justify-between gap-3 p-3 border-b border-slate-100 last:border-b-0 text-sm">
                    <div>
                      <p className="font-medium text-slate-900">{d.nombre}</p>
                      <p className="text-xs text-slate-500">Cantidad: {d.cantidad}</p>
                    </div>
                    <p className="font-semibold text-slate-900">S/ {d.subtotal.toFixed(2)}</p>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center bg-blue-50 rounded-md p-4 mb-5">
                <span className="text-sm text-blue-700">Total a cobrar</span>
                <span className="text-2xl font-semibold text-blue-900">S/ {totalVenta.toFixed(2)}</span>
              </div>

              <div className="flex justify-end gap-3">
                <button onClick={() => setConfirmacionAbierta(false)} className={buttonSecondary}>
                  Cancelar
                </button>
                <button onClick={registrarVenta} className={buttonPrimary}>
                  Confirmar venta
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Venta
