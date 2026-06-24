import { useState, useEffect } from 'react'
import proveedorService from '../services/proveedorService'

function Proveedor() {
  const [proveedores, setProveedores] = useState([])
  const [verActivos, setVerActivos] = useState(true)
  const [filtroNombre, setFiltroNombre] = useState('')
  const [mensaje, setMensaje] = useState(null)
  const [mensajeError, setMensajeError] = useState(false)

  const [modalAbierto, setModalAbierto] = useState(false)
  const [editando, setEditando] = useState(null)
  const [form, setForm] = useState({ nombre: '', ruc: '', telefono: '', direccion: '' })

  const cargar = async () => {
    try {
      const res = verActivos
        ? await proveedorService.buscarActivos(filtroNombre || null)
        : await proveedorService.buscarInactivos(filtroNombre || null)
      setProveedores(res.data)
    } catch {
      setMensaje('Error al cargar proveedores')
      setMensajeError(true)
    }
  }

  useEffect(() => { cargar() }, [verActivos])

  const abrirCrear = () => {
    setEditando(null)
    setForm({ nombre: '', ruc: '', telefono: '', direccion: '' })
    setMensaje(null)
    setModalAbierto(true)
  }

  const abrirEditar = (proveedor) => {
    setEditando(proveedor)
    setForm({
      nombre: proveedor.nombre,
      ruc: proveedor.ruc || '',
      telefono: proveedor.telefono || '',
      direccion: proveedor.direccion || ''
    })
    setMensaje(null)
    setModalAbierto(true)
  }

  const guardar = async () => {
    try {
      const res = editando
        ? await proveedorService.editar(editando.codigo, form)
        : await proveedorService.crear(form)
      const exito = res.data.mensaje.startsWith('OK')
      setMensaje(res.data.mensaje)
      setMensajeError(!exito)
      if (exito) {
        setModalAbierto(false)
        cargar()
      }
    } catch (error) {
      setMensaje(error.response?.data?.mensaje || 'Error al guardar')
      setMensajeError(true)
    }
  }

  const cambiarEstado = async (id, nuevoEstado) => {
    try {
      const res = await proveedorService.cambiarEstado(id, nuevoEstado)
      setMensaje(res.data.mensaje)
      setMensajeError(false)
      cargar()
    } catch (error) {
      setMensaje(error.response?.data?.mensaje || 'Error al cambiar estado')
      setMensajeError(true)
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold">Proveedores</h1>
        <button onClick={abrirCrear} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          + Nuevo proveedor
        </button>
      </div>

      {mensaje && !modalAbierto && (
        <div className={`mb-4 p-3 rounded text-sm flex justify-between items-center ${mensajeError ? 'bg-red-50 text-red-800' : 'bg-blue-50 text-blue-800'}`}>
          {mensaje}
          <button onClick={() => setMensaje(null)} className="ml-4">✕</button>
        </div>
      )}

      <div className="flex flex-wrap gap-3 mb-4">
        <input
          placeholder="Buscar por nombre"
          value={filtroNombre}
          onChange={e => setFiltroNombre(e.target.value)}
          className="border rounded px-3 py-2 text-sm flex-1 min-w-32"
        />
        <button onClick={cargar} className="bg-gray-200 px-4 py-2 rounded text-sm hover:bg-gray-300">
          Buscar
        </button>
        <button onClick={() => setVerActivos(!verActivos)} className="bg-gray-200 px-4 py-2 rounded text-sm hover:bg-gray-300">
          Ver {verActivos ? 'inactivos' : 'activos'}
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full bg-white rounded shadow text-sm">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="p-3 text-left">ID</th>
              <th className="p-3 text-left">Nombre</th>
              <th className="p-3 text-left">RUC</th>
              <th className="p-3 text-left">Teléfono</th>
              <th className="p-3 text-left">Dirección</th>
              <th className="p-3 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {proveedores.length === 0 ? (
              <tr><td colSpan={6} className="p-3 text-center text-gray-400">Sin resultados</td></tr>
            ) : (
              proveedores.map((p) => (
                <tr key={p.codigo} className="border-t hover:bg-gray-50">
                  <td className="p-3">{p.codigo}</td>
                  <td className="p-3">{p.nombre}</td>
                  <td className="p-3">{p.ruc || '-'}</td>
                  <td className="p-3">{p.telefono || '-'}</td>
                  <td className="p-3">{p.direccion || '-'}</td>
                  <td className="p-3 flex flex-wrap gap-1">
                    <button onClick={() => abrirEditar(p)} className="bg-yellow-400 text-white px-3 py-1 rounded text-xs hover:bg-yellow-500">
                      Editar
                    </button>
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
          <div className="bg-white rounded-lg p-6 w-[440px] shadow-xl">
            <h2 className="text-lg font-semibold mb-4">{editando ? 'Editar proveedor' : 'Nuevo proveedor'}</h2>
            <div className="flex flex-col gap-3">
              <input
                placeholder="Nombre"
                value={form.nombre}
                onChange={e => setForm({ ...form, nombre: e.target.value })}
                className="border rounded px-3 py-2 text-sm"
              />
              <input
                placeholder="RUC"
                value={form.ruc}
                onChange={e => setForm({ ...form, ruc: e.target.value })}
                className="border rounded px-3 py-2 text-sm"
              />
              <input
                placeholder="Teléfono"
                value={form.telefono}
                onChange={e => setForm({ ...form, telefono: e.target.value })}
                className="border rounded px-3 py-2 text-sm"
              />
              <input
                placeholder="Dirección"
                value={form.direccion}
                onChange={e => setForm({ ...form, direccion: e.target.value })}
                className="border rounded px-3 py-2 text-sm"
              />
            </div>

            {mensaje && (
              <div className={`mt-3 p-2 rounded text-xs ${mensajeError ? 'bg-red-50 text-red-800' : 'bg-blue-50 text-blue-800'}`}>
                {mensaje}
              </div>
            )}

            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setModalAbierto(false)} className="px-4 py-2 rounded bg-gray-200 text-sm hover:bg-gray-300">
                Cancelar
              </button>
              <button onClick={guardar} className="px-4 py-2 rounded bg-blue-600 text-white text-sm hover:bg-blue-700">
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Proveedor