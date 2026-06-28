import { useState, useEffect } from 'react'
import marcaService from '../services/marcaService'

function Marca() {
  const [marcas, setMarcas] = useState([])
  const [verActivas, setVerActivas] = useState(true)
  const [filtroNombre, setFiltroNombre] = useState('')
  const [filtroEmpresa, setFiltroEmpresa] = useState('')
  const [mensaje, setMensaje] = useState(null)
  const [mensajeError, setMensajeError] = useState(false)

  // Modal

  const [modalAbierto, setModalAbierto] = useState(false)
  const [editando, setEditando] = useState(null)
  const [form, setForm] = useState({ nombre: '', empresa: '' })

  const cargar = async () => {
    try {
      const res = verActivas
        ? await marcaService.buscarActivas(filtroNombre || null, filtroEmpresa || null)
        : await marcaService.buscarInactivas(filtroNombre || null, filtroEmpresa || null)
      setMarcas(res.data)
    } catch {
      setMensaje('Error al cargar marcas')
      setMensajeError(true)
    }
  }

  useEffect(() => { cargar() }, [verActivas])

  const abrirCrear = () => {
    setEditando(null)
    setForm({ nombre: '', empresa: '' })
    setModalAbierto(true)
  }

  const abrirEditar = (marca) => {
    setEditando(marca)
    setForm({ nombre: marca[1], empresa: marca[2] })
    setModalAbierto(true)
  }

  const guardar = async () => {
    try {
      const res = editando
        ? await marcaService.editar(editando[0], form)
        : await marcaService.crear(form)
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
      const res = await marcaService.cambiarEstado(id, nuevoEstado)
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
        <h1 className="text-xl font-semibold">Marcas</h1>
        <button
          onClick={abrirCrear}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Nueva marca
        </button>
      </div>

      {/* Mensaje */}
      {mensaje && (
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
          placeholder="Buscar por empresa"
          value={filtroEmpresa}
          onChange={e => setFiltroEmpresa(e.target.value)}
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
            <th className="p-3 text-left">Empresa</th>
            <th className="p-3 text-left">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {marcas.length === 0 ? (
            <tr><td colSpan={4} className="p-3 text-center text-gray-400">Sin resultados</td></tr>
          ) : (
            marcas.map((m) => (
              <tr key={m[0]} className="border-t hover:bg-gray-50">
                <td className="p-3">{m[0]}</td>
                <td className="p-3">{m[1]}</td>
                <td className="p-3">{m[2]}</td>
                <td className="p-3 flex flex-wrap gap-1">
                  <button
                    onClick={() => abrirEditar(m)}
                    className="bg-yellow-400 text-white px-3 py-1 rounded text-xs hover:bg-yellow-500"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => cambiarEstado(m[0], verActivas ? 0 : 1)}
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
            <h2 className="text-lg font-semibold mb-4">{editando ? 'Editar marca' : 'Nueva marca'}</h2>
            <div className="flex flex-col gap-3">
              <input
                placeholder="Nombre"
                value={form.nombre}
                onChange={e => setForm({ ...form, nombre: e.target.value })}
                className="border rounded px-3 py-2 text-sm"
              />
              <input
                placeholder="Empresa"
                value={form.empresa}
                onChange={e => setForm({ ...form, empresa: e.target.value })}
                className="border rounded px-3 py-2 text-sm"
              />
            </div>
            {/* Mensaje dentro del modal */}
            {mensaje && modalAbierto && (
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

export default Marca