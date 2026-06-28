import { useState, useEffect } from 'react'
import productoService from '../services/productoService'
import selectorService from '../services/selectorService'
import marcaService from '../services/marcaService'
import categoriaService from '../services/categoriaService'
import unidadDeMedidaService from '../services/unidadDeMedidaService'

function Producto() {
  const [productos, setProductos] = useState([])
  const [verActivos, setVerActivos] = useState(true)
  const [filtroNombre, setFiltroNombre] = useState('')
  const [filtroMarca, setFiltroMarca] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState('')
  const [mensaje, setMensaje] = useState(null)
  const [mensajeError, setMensajeError] = useState(false)

  const [marcas, setMarcas] = useState([])
  const [categorias, setCategorias] = useState([])
  const [unidades, setUnidades] = useState([])

  const [modalAbierto, setModalAbierto] = useState(false)
  const [editando, setEditando] = useState(null)
  const [form, setForm] = useState({
    idMarca: '', idCategoria: '', idUnidadDeMedida: '',
    nombre: '', stockActual: '', stockMinimo: '', precioVenta: '',
    codigoBarras: ''
  })

  const [expandido, setExpandido] = useState({ marca: false, categoria: false, unidad: false })
  const [nuevaMarca, setNuevaMarca] = useState({ nombre: '', empresa: '' })
  const [nuevaCategoria, setNuevaCategoria] = useState({ nombre: '', descripcion: '' })
  const [nuevaUnidad, setNuevaUnidad] = useState({ nombre: '', abreviacion: '', descripcion: '' })
  const [mensajeExpandido, setMensajeExpandido] = useState({ marca: null, categoria: null, unidad: null })

  const guardarNuevaMarca = async () => {
    try {
      const res = await marcaService.crear(nuevaMarca)
      if (res.data.mensaje.startsWith('OK')) {
        await cargarSelectores()
        const todasMarcas = await marcaService.buscarActivas()
        const creada = todasMarcas.data.find(m => m[1].toLowerCase() === nuevaMarca.nombre.toLowerCase())
        if (creada) setForm(prev => ({ ...prev, idMarca: creada[0] }))
        setNuevaMarca({ nombre: '', empresa: '' })
        setExpandido(prev => ({ ...prev, marca: false }))
        setMensajeExpandido(prev => ({ ...prev, marca: null }))
      } else {
        setMensajeExpandido(prev => ({ ...prev, marca: res.data.mensaje }))
      }
    } catch (error) {
      setMensajeExpandido(prev => ({ ...prev, marca: error.response?.data?.mensaje || 'Error al guardar' }))
    }
  }

  const guardarNuevaCategoria = async () => {
    try {
      const res = await categoriaService.crear(nuevaCategoria)
      if (res.data.mensaje.startsWith('OK')) {
        await cargarSelectores()
        const todas = await categoriaService.buscarActivas()
        const creada = todas.data.find(c => c[1].toLowerCase() === nuevaCategoria.nombre.toLowerCase())
        if (creada) setForm(prev => ({ ...prev, idCategoria: creada[0] }))
        setNuevaCategoria({ nombre: '', descripcion: '' })
        setExpandido(prev => ({ ...prev, categoria: false }))
        setMensajeExpandido(prev => ({ ...prev, categoria: null }))
      } else {
        setMensajeExpandido(prev => ({ ...prev, categoria: res.data.mensaje }))
      }
    } catch (error) {
      setMensajeExpandido(prev => ({ ...prev, categoria: error.response?.data?.mensaje || 'Error al guardar' }))
    }
  }

  const guardarNuevaUnidad = async () => {
    try {
      const res = await unidadDeMedidaService.crear(nuevaUnidad)
      if (res.data.mensaje.startsWith('OK')) {
        await cargarSelectores()
        const todas = await unidadDeMedidaService.buscarActivas()
        const creada = todas.data.find(u => u[1].toLowerCase() === nuevaUnidad.nombre.toLowerCase())
        if (creada) setForm(prev => ({ ...prev, idUnidadDeMedida: creada[0] }))
        setNuevaUnidad({ nombre: '', abreviacion: '', descripcion: '' })
        setExpandido(prev => ({ ...prev, unidad: false }))
        setMensajeExpandido(prev => ({ ...prev, unidad: null }))
      } else {
        setMensajeExpandido(prev => ({ ...prev, unidad: res.data.mensaje }))
      }
    } catch (error) {
      setMensajeExpandido(prev => ({ ...prev, unidad: error.response?.data?.mensaje || 'Error al guardar' }))
    }
  }

  const cargar = async () => {
    try {
      const res = verActivos
        ? await productoService.buscarActivos(filtroNombre || null, filtroMarca || null, filtroCategoria || null)
        : await productoService.buscarInactivos(filtroNombre || null, filtroMarca || null, filtroCategoria || null)
      setProductos(res.data)
    } catch {
      setMensaje('Error al cargar productos')
      setMensajeError(true)
    }
  }

  const cargarSelectores = async () => {
    try {
      const [rm, rc, ru] = await Promise.all([
        selectorService.marcas(),
        selectorService.categorias(),
        selectorService.unidades(),
      ])
      setMarcas(rm.data)
      setCategorias(rc.data)
      setUnidades(ru.data)
    } catch {
      setMensaje('Error al cargar selectores')
      setMensajeError(true)
    }
  }

  useEffect(() => { cargar() }, [verActivos])

  const abrirCrear = async () => {
    await cargarSelectores()
    setEditando(null)
    setForm({ idMarca: '', idCategoria: '', idUnidadDeMedida: '', nombre: '', stockActual: '', stockMinimo: '', precioVenta: '', codigoBarras: '' })
    setMensaje(null)
    setModalAbierto(true)
  }

  const abrirEditar = async (producto) => {
    await cargarSelectores()
    setEditando(producto)
    setForm({
      idMarca: '', idCategoria: '', idUnidadDeMedida: '',
      nombre: producto.nombre,
      stockActual: producto.stockActual,
      stockMinimo: producto.stockMinimo,
      precioVenta: producto.precio,
      codigoBarras: producto.codigoBarras || ''
    })
    setMensaje(null)
    setModalAbierto(true)
  }

  const guardar = async () => {
    try {
      const datosProducto = editando
        ? {
            idMarca: form.idMarca || null,
            idCategoria: form.idCategoria || null,
            idUnidadDeMedida: form.idUnidadDeMedida || null,
            nombre: form.nombre,
            precioVenta: form.precioVenta
          }
        : form
      const res = editando
        ? await productoService.editar(editando.codigo, datosProducto)
        : await productoService.crear(datosProducto)
      const exito = res.data.mensaje.startsWith('OK')
      setMensaje(res.data.mensaje)
      setMensajeError(!exito)
      if (exito) { setModalAbierto(false); cargar() }
    } catch (error) {
      setMensaje(error.response?.data?.mensaje || 'Error al guardar')
      setMensajeError(true)
    }
  }

  const cambiarEstado = async (id, nuevoEstado) => {
    try {
      const res = await productoService.cambiarEstado(id, nuevoEstado)
      setMensaje(res.data.mensaje)
      setMensajeError(false)
      cargar()
    } catch (error) {
      setMensaje(error.response?.data?.mensaje || 'Error al cambiar estado')
      setMensajeError(true)
    }
  }

  const formatStock = (val, unidad) => {
    if (val === null || val === undefined) return '-'
    const num = parseFloat(val)
    if (unidad === 'kg') return `${num.toFixed(3)} kg`
    return Number.isInteger(num) ? num : num.toFixed(3)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold">Productos</h1>
        <button onClick={abrirCrear} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          + Nuevo producto
        </button>
      </div>

      {mensaje && !modalAbierto && (
        <div className={`mb-4 p-3 rounded text-sm flex justify-between items-center ${mensajeError ? 'bg-red-50 text-red-800' : 'bg-blue-50 text-blue-800'}`}>
          {mensaje}
          <button onClick={() => setMensaje(null)} className="ml-4">✕</button>
        </div>
      )}

      <div className="flex flex-wrap gap-3 mb-4">
        <input placeholder="Buscar por nombre" value={filtroNombre} onChange={e => setFiltroNombre(e.target.value)} className="border rounded px-3 py-2 text-sm flex-1 min-w-32" />
        <input placeholder="Buscar por marca" value={filtroMarca} onChange={e => setFiltroMarca(e.target.value)} className="border rounded px-3 py-2 text-sm flex-1 min-w-32" />
        <input placeholder="Buscar por categoría" value={filtroCategoria} onChange={e => setFiltroCategoria(e.target.value)} className="border rounded px-3 py-2 text-sm flex-1 min-w-32" />
        <button onClick={cargar} className="bg-gray-200 px-4 py-2 rounded text-sm hover:bg-gray-300">Buscar</button>
        <button onClick={() => setVerActivos(!verActivos)} className="bg-gray-200 px-4 py-2 rounded text-sm hover:bg-gray-300">Ver {verActivos ? 'inactivos' : 'activos'}</button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full bg-white rounded shadow text-sm">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="p-3 text-left">ID</th>
              <th className="p-3 text-left">Nombre</th>
              <th className="p-3 text-left">Marca</th>
              <th className="p-3 text-left">Categoría</th>
              <th className="p-3 text-left">Unidad</th>
              <th className="p-3 text-left">Stock Act.</th>
              <th className="p-3 text-left">Stock Mín.</th>
              <th className="p-3 text-left">Precio</th>
              <th className="p-3 text-left">Cód. Barras</th>
              <th className="p-3 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {productos.length === 0 ? (
              <tr><td colSpan={10} className="p-3 text-center text-gray-400">Sin resultados</td></tr>
            ) : (
              productos.map((p) => (
                <tr key={p.codigo} className="border-t hover:bg-gray-50">
                  <td className="p-3">{p.codigo}</td>
                  <td className="p-3">{p.nombre}</td>
                  <td className="p-3">{p.marca}</td>
                  <td className="p-3">{p.categoria}</td>
                  <td className="p-3">{p.unidadMedida}</td>
                  <td className="p-3">{formatStock(p.stockActual, p.unidadMedida)}</td>
                  <td className="p-3">{formatStock(p.stockMinimo, p.unidadMedida)}</td>
                  <td className="p-3">S/ {p.precio}</td>
                  <td className="p-3 font-mono text-xs">{p.codigoBarras || '-'}</td>
                  <td className="p-3 flex flex-wrap gap-1">
                    <button onClick={() => abrirEditar(p)} className="bg-yellow-400 text-white px-3 py-1 rounded text-xs hover:bg-yellow-500">Editar</button>
                    <button
                      onClick={() => cambiarEstado(p.codigo, verActivos ? 0 : 1)}
                      className={`px-3 py-1 rounded text-xs text-white ${verActivos ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
                    >
                      {verActivos ? 'Desactivar' : 'Activar'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {modalAbierto && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[480px] shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">{editando ? 'Editar producto' : 'Nuevo producto'}</h2>
            <div className="flex flex-col gap-3">
              <input placeholder="Nombre" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} className="border rounded px-3 py-2 text-sm" />

              {/* Marca */}
              <div className="flex flex-col gap-1">
                <div className="flex gap-2">
                  <select value={form.idMarca} onChange={e => setForm({ ...form, idMarca: e.target.value })} className="border rounded px-3 py-2 text-sm flex-1">
                    <option value="">-- Selecciona una marca --</option>
                    {marcas.map(m => <option key={m[0]} value={m[0]}>{m[1]}</option>)}
                  </select>
                  <button onClick={() => setExpandido(prev => ({ ...prev, marca: !prev.marca }))} className="text-xs px-3 py-2 rounded border border-blue-300 text-blue-600 hover:bg-blue-50">
                    {expandido.marca ? '✕' : '+ Nueva'}
                  </button>
                </div>
                {expandido.marca && (
                  <div className="flex flex-col gap-2 p-3 border rounded bg-gray-50">
                    <input placeholder="Nombre de la marca" value={nuevaMarca.nombre} onChange={e => setNuevaMarca({ ...nuevaMarca, nombre: e.target.value })} className="border rounded px-3 py-2 text-sm bg-white" />
                    <input placeholder="Empresa" value={nuevaMarca.empresa} onChange={e => setNuevaMarca({ ...nuevaMarca, empresa: e.target.value })} className="border rounded px-3 py-2 text-sm bg-white" />
                    <button onClick={guardarNuevaMarca} className="bg-blue-600 text-white px-3 py-2 rounded text-xs hover:bg-blue-700 self-end">Guardar marca</button>
                    {mensajeExpandido.marca && <p className="text-xs text-red-700 bg-red-50 p-2 rounded">{mensajeExpandido.marca}</p>}
                  </div>
                )}
              </div>

              {/* Categoría */}
              <div className="flex flex-col gap-1">
                <div className="flex gap-2">
                  <select value={form.idCategoria} onChange={e => setForm({ ...form, idCategoria: e.target.value })} className="border rounded px-3 py-2 text-sm flex-1">
                    <option value="">-- Selecciona una categoría --</option>
                    {categorias.map(c => <option key={c[0]} value={c[0]}>{c[1]}</option>)}
                  </select>
                  <button onClick={() => setExpandido(prev => ({ ...prev, categoria: !prev.categoria }))} className="text-xs px-3 py-2 rounded border border-blue-300 text-blue-600 hover:bg-blue-50">
                    {expandido.categoria ? '✕' : '+ Nueva'}
                  </button>
                </div>
                {expandido.categoria && (
                  <div className="flex flex-col gap-2 p-3 border rounded bg-gray-50">
                    <input placeholder="Nombre de la categoría" value={nuevaCategoria.nombre} onChange={e => setNuevaCategoria({ ...nuevaCategoria, nombre: e.target.value })} className="border rounded px-3 py-2 text-sm bg-white" />
                    <input placeholder="Descripción" value={nuevaCategoria.descripcion} onChange={e => setNuevaCategoria({ ...nuevaCategoria, descripcion: e.target.value })} className="border rounded px-3 py-2 text-sm bg-white" />
                    <button onClick={guardarNuevaCategoria} className="bg-blue-600 text-white px-3 py-2 rounded text-xs hover:bg-blue-700 self-end">Guardar categoría</button>
                    {mensajeExpandido.categoria && <p className="text-xs text-red-700 bg-red-50 p-2 rounded">{mensajeExpandido.categoria}</p>}
                  </div>
                )}
              </div>

              {/* Unidad de medida */}
              <div className="flex flex-col gap-1">
                <div className="flex gap-2">
                  <select value={form.idUnidadDeMedida} onChange={e => setForm({ ...form, idUnidadDeMedida: e.target.value })} className="border rounded px-3 py-2 text-sm flex-1">
                    <option value="">-- Selecciona una unidad --</option>
                    {unidades.map(u => <option key={u[0]} value={u[0]}>{u[1]}</option>)}
                  </select>
                  <button onClick={() => setExpandido(prev => ({ ...prev, unidad: !prev.unidad }))} className="text-xs px-3 py-2 rounded border border-blue-300 text-blue-600 hover:bg-blue-50">
                    {expandido.unidad ? '✕' : '+ Nueva'}
                  </button>
                </div>
                {expandido.unidad && (
                  <div className="flex flex-col gap-2 p-3 border rounded bg-gray-50">
                    <input placeholder="Nombre de la unidad" value={nuevaUnidad.nombre} onChange={e => setNuevaUnidad({ ...nuevaUnidad, nombre: e.target.value })} className="border rounded px-3 py-2 text-sm bg-white" />
                    <input placeholder="Abreviación" value={nuevaUnidad.abreviacion} onChange={e => setNuevaUnidad({ ...nuevaUnidad, abreviacion: e.target.value })} className="border rounded px-3 py-2 text-sm bg-white" />
                    <input placeholder="Descripción" value={nuevaUnidad.descripcion} onChange={e => setNuevaUnidad({ ...nuevaUnidad, descripcion: e.target.value })} className="border rounded px-3 py-2 text-sm bg-white" />
                    <button onClick={guardarNuevaUnidad} className="bg-blue-600 text-white px-3 py-2 rounded text-xs hover:bg-blue-700 self-end">Guardar unidad</button>
                    {mensajeExpandido.unidad && <p className="text-xs text-red-700 bg-red-50 p-2 rounded">{mensajeExpandido.unidad}</p>}
                  </div>
                )}
              </div>

              {!editando && (
                <div className="flex gap-3">
                  <input
                    placeholder="Stock actual"
                    type="number" min="0" step="0.001"
                    value={form.stockActual}
                    onChange={e => setForm({ ...form, stockActual: e.target.value })}
                    className="border rounded px-3 py-2 text-sm flex-1"
                  />
                  <input
                    placeholder="Stock mínimo"
                    type="number" min="0" step="0.001"
                    value={form.stockMinimo}
                    onChange={e => setForm({ ...form, stockMinimo: e.target.value })}
                    className="border rounded px-3 py-2 text-sm flex-1"
                  />
                </div>
              )}
              <input
                placeholder="Precio de venta"
                type="number" min="0.01" step="0.01"
                value={form.precioVenta}
                onChange={e => setForm({ ...form, precioVenta: e.target.value })}
                className="border rounded px-3 py-2 text-sm"
              />

              {editando && (
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-500">Código de barras (generado automáticamente)</label>
                  <input value={form.codigoBarras} disabled className="border rounded px-3 py-2 text-sm font-mono bg-gray-100 text-gray-500 cursor-not-allowed" />
                </div>
              )}
            </div>

            {mensaje && (
              <div className={`mt-3 p-2 rounded text-xs ${mensajeError ? 'bg-red-50 text-red-800' : 'bg-blue-50 text-blue-800'}`}>
                {mensaje}
              </div>
            )}

            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setModalAbierto(false)} className="px-4 py-2 rounded bg-gray-200 text-sm hover:bg-gray-300">Cancelar</button>
              <button onClick={guardar} className="px-4 py-2 rounded bg-blue-600 text-white text-sm hover:bg-blue-700">Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Producto