import { useState, useEffect } from 'react'
import unidadDeMedidaService from '../services/unidadDeMedidaService'

function UnidadDeMedida() {
  const [unidades, setUnidades] = useState([])
  const [verActivas, setVerActivas] = useState(true)
  const [filtroNombre, setFiltroNombre] = useState('')
  const [filtroAbreviacion, setFiltroAbreviacion] = useState('')
  const [mensaje, setMensaje] = useState(null)
  const [mensajeError, setMensajeError] = useState(false)

  // Modal
  const [modalAbierto, setModalAbierto] = useState(false)
  const [editando, setEditando] = useState(null)
  const [form, setForm] = useState({ nombre: '', abreviacion: '', descripcion: '' })

  const cargar = async () => {
    try {
      const res = verActivas
        ? await unidadDeMedidaService.buscarActivas(filtroNombre || null, filtroAbreviacion || null)
        : await unidadDeMedidaService.buscarInactivas(filtroNombre || null, filtroAbreviacion || null)
      setUnidades(res.data)
    } catch {
      setMensaje('Error al cargar unidades de medida')
      setMensajeError(true)
    }
  }

  useEffect(() => { cargar() }, [verActivas])

  const abrirCrear = () => {
    setEditando(null)
    setForm({ nombre: '', abreviacion: '', descripcion: '' })
    setModalAbierto(true)
  }

  const abrirEditar = (unidad) => {
    setEditando(unidad)
    setForm({ nombre: unidad[1], abreviacion: unidad[2], descripcion: unidad[3] })
    setModalAbierto(true)
  }

  const guardar = async () => {
    try {
      const res = editando
        ? await unidadDeMedidaService.editar(editando[0], form)
        : await unidadDeMedidaService.crear(form)
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
      const res = await unidadDeMedidaService.cambiarEstado(id, nuevoEstado)
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
        <h1 className="text-xl font-semibold">Unidades de medida</h1>
        <button
          onClick={abrirCrear}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Nueva unidad
        </button>
      </div>

      {/* Mensaje */}
      {mensaje && !modalAbierto && (
        <div className={`mb-4 p-3 rounded text-sm flex justify-between items-center ${mensajeError ? 'bg-red-50 text-red-800' : 'bg-blue-50 text-blue-800'}`}>
          {mensaje}
          <button onClick={() => setMensaje(null)} className="ml-4">✕</button>
        </div>
      )}

      {/* Filtros */}
      <div className="flex flex-wrap gap-3 mb-4">
        <input
          placeholder="Buscar por nombre"
          value={filtroNombre}
          onChange={e => setFiltroNombre(e.target.value)}
          className="border rounded px-3 py-2 text-sm flex-1 min-w-32"
        />
        <input
          placeholder="Buscar por abreviación"
          value={filtroAbreviacion}
          onChange={e => setFiltroAbreviacion(e.target.value)}
          className="border rounded px-3 py-2 text-sm flex-1 min-w-32"
        />
        <button
          onClick={cargar}
          className="bg-gray-200 px-4 py-2 rounded text-sm hover:bg-gray-300"
        >
          Buscar
        </button>
        <button
          onClick={() => setVerActivas(!verActivas)}
          className="bg-gray-200 px-4 py-2 rounded text-sm hover:bg-gray-300"
        >
          Ver {verActivas ? 'inactivas' : 'activas'}
        </button>
      </div>

      {/* Tabla */}
      <table className="w-full bg-white rounded shadow text-sm">
        <thead className="bg-gray-100 text-gray-600">
          <tr>
            <th className="p-3 text-left">ID</th>
            <th className="p-3 text-left">Nombre</th>
            <th className="p-3 text-left">Abreviación</th>
            <th className="p-3 text-left">Descripción</th>
            <th className="p-3 text-left">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {unidades.length === 0 ? (
            <tr><td colSpan={5} className="p-3 text-center text-gray-400">Sin resultados</td></tr>
          ) : (
            unidades.map((u) => (
              <tr key={u[0]} className="border-t hover:bg-gray-50">
                <td className="p-3">{u[0]}</td>
                <td className="p-3">{u[1]}</td>
                <td className="p-3">{u[2]}</td>
                <td className="p-3">{u[3]}</td>
                <td className="p-3 flex flex-wrap gap-1">
                  <button
                    onClick={() => abrirEditar(u)}
                    className="bg-yellow-400 text-white px-3 py-1 rounded text-xs hover:bg-yellow-500"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => cambiarEstado(u[0], verActivas ? 0 : 1)}
                    className={`px-3 py-1 rounded text-xs text-white ${verActivas ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
                  >
                    {verActivas ? 'Desactivar' : 'Activar'}
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Modal */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 shadow-xl">
            <h2 className="text-lg font-semibold mb-4">{editando ? 'Editar unidad' : 'Nueva unidad'}</h2>
            <div className="flex flex-col gap-3">
              <input
                placeholder="Nombre"
                value={form.nombre}
                onChange={e => setForm({ ...form, nombre: e.target.value })}
                className="border rounded px-3 py-2 text-sm"
              />
              <input
                placeholder="Abreviación"
                value={form.abreviacion}
                onChange={e => setForm({ ...form, abreviacion: e.target.value })}
                className="border rounded px-3 py-2 text-sm"
              />
              <input
                placeholder="Descripción"
                value={form.descripcion}
                onChange={e => setForm({ ...form, descripcion: e.target.value })}
                className="border rounded px-3 py-2 text-sm"
              />
            </div>
            {/* Mensaje dentro del modal */}
            {mensaje && (
              <div className={`mt-3 p-2 rounded text-xs ${mensajeError ? 'bg-red-50 text-red-800' : 'bg-blue-50 text-blue-800'}`}>
                {mensaje}
              </div>
            )}
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setModalAbierto(false)}
                className="px-4 py-2 rounded bg-gray-200 text-sm hover:bg-gray-300"
              >
                Cancelar
              </button>
              <button
                onClick={guardar}
                className="px-4 py-2 rounded bg-blue-600 text-white text-sm hover:bg-blue-700"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UnidadDeMedida