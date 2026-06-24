/* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react'
import rolService from '../services/rolService'

function Rol() {
  const [roles, setRoles] = useState([])
  const [verActivos, setVerActivos] = useState(true)
  const [filtroNombre, setFiltroNombre] = useState('')
  const [filtroDescripcion, setFiltroDescripcion] = useState('')
  const [mensaje, setMensaje] = useState(null)
  const [mensajeError, setMensajeError] = useState(false)

  const [modalAbierto, setModalAbierto] = useState(false)
  const [editando, setEditando] = useState(null)
  const [form, setForm] = useState({ nombre: '', descripcion: '' })

  const cargar = async () => {
    try {
      const res = verActivos
        ? await rolService.buscarActivos(filtroNombre || null, filtroDescripcion || null)
        : await rolService.buscarInactivos(filtroNombre || null, filtroDescripcion || null)
      setRoles(res.data)
    } catch {
      setMensaje('Error al cargar roles')
      setMensajeError(true)
    }
  }

  useEffect(() => { cargar() }, [verActivos])

  const abrirCrear = () => {
    setEditando(null)
    setForm({ nombre: '', descripcion: '' })
    setMensaje(null)
    setModalAbierto(true)
  }

  const abrirEditar = (rol) => {
    setEditando(rol)
    setForm({ nombre: rol[1], descripcion: rol[2] })
    setMensaje(null)
    setModalAbierto(true)
  }

  const guardar = async () => {
    try {
      const res = editando
        ? await rolService.editar(editando[0], form)
        : await rolService.crear(form)
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
      const res = await rolService.cambiarEstado(id, nuevoEstado)
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
        <h1 className="text-xl font-semibold">Roles</h1>
        <button
          onClick={abrirCrear}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Nuevo rol
        </button>
      </div>

      {mensaje && !modalAbierto && (
        <div className={`mb-4 p-3 rounded text-sm flex justify-between items-center ${mensajeError ? 'bg-red-50 text-red-800' : 'bg-blue-50 text-blue-800'}`}>
          {mensaje}
          <button onClick={() => setMensaje(null)} className="ml-4">x</button>
        </div>
      )}

      <div className="flex flex-wrap gap-3 mb-4">
        <input
          placeholder="Buscar por nombre"
          value={filtroNombre}
          onChange={e => setFiltroNombre(e.target.value)}
          className="border rounded px-3 py-2 text-sm flex-1 min-w-32"
        />
        <input
          placeholder="Buscar por descripcion"
          value={filtroDescripcion}
          onChange={e => setFiltroDescripcion(e.target.value)}
          className="border rounded px-3 py-2 text-sm flex-1 min-w-32"
        />
        <button
          onClick={cargar}
          className="bg-gray-200 px-4 py-2 rounded text-sm hover:bg-gray-300"
        >
          Buscar
        </button>
        <button
          onClick={() => setVerActivos(!verActivos)}
          className="bg-gray-200 px-4 py-2 rounded text-sm hover:bg-gray-300"
        >
          Ver {verActivos ? 'inactivos' : 'activos'}
        </button>
      </div>

      <table className="w-full bg-white rounded shadow text-sm">
        <thead className="bg-gray-100 text-gray-600">
          <tr>
            <th className="p-3 text-left">ID</th>
            <th className="p-3 text-left">Nombre</th>
            <th className="p-3 text-left">Descripcion</th>
            <th className="p-3 text-left">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {roles.length === 0 ? (
            <tr><td colSpan={4} className="p-3 text-center text-gray-400">Sin resultados</td></tr>
          ) : (
            roles.map((r) => (
              <tr key={r[0]} className="border-t hover:bg-gray-50">
                <td className="p-3">{r[0]}</td>
                <td className="p-3">{r[1]}</td>
                <td className="p-3">{r[2]}</td>
                <td className="p-3 flex flex-wrap gap-1">
                  <button
                    onClick={() => abrirEditar(r)}
                    className="bg-yellow-400 text-white px-3 py-1 rounded text-xs hover:bg-yellow-500"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => cambiarEstado(r[0], verActivos ? 0 : 1)}
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

      {modalAbierto && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 shadow-xl">
            <h2 className="text-lg font-semibold mb-4">{editando ? 'Editar rol' : 'Nuevo rol'}</h2>
            <div className="flex flex-col gap-3">
              <input
                placeholder="Nombre"
                value={form.nombre}
                onChange={e => setForm({ ...form, nombre: e.target.value })}
                className="border rounded px-3 py-2 text-sm"
              />
              <textarea
                placeholder="Descripcion"
                value={form.descripcion}
                onChange={e => setForm({ ...form, descripcion: e.target.value })}
                className="border rounded px-3 py-2 text-sm resize-none"
                rows={3}
              />
            </div>
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

export default Rol
