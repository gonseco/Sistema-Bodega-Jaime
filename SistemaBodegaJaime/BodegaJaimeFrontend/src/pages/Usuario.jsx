/* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react'
import usuarioService from '../services/usuarioService'
import rolService from '../services/rolService'

function Usuario() {
  const [usuarios, setUsuarios] = useState([])
  const [roles, setRoles] = useState([])
  const [verActivos, setVerActivos] = useState(true)
  const [filtroNombre, setFiltroNombre] = useState('')
  const [filtroCorreo, setFiltroCorreo] = useState('')
  const [filtroRol, setFiltroRol] = useState('')
  const [mensaje, setMensaje] = useState(null)
  const [mensajeError, setMensajeError] = useState(false)

  const [modalAbierto, setModalAbierto] = useState(false)
  const [editando, setEditando] = useState(null)
  const [form, setForm] = useState({ idRol: '', nombre: '', correo: '', password: '' })

  const cargar = async () => {
    try {
      const res = verActivos
        ? await usuarioService.buscarActivos(filtroNombre || null, filtroCorreo || null, filtroRol || null)
        : await usuarioService.buscarInactivos(filtroNombre || null, filtroCorreo || null, filtroRol || null)
      setUsuarios(res.data)
    } catch {
      setMensaje('Error al cargar usuarios')
      setMensajeError(true)
    }
  }

  const cargarRoles = async () => {
    try {
      const res = await rolService.buscarActivos()
      setRoles(res.data)
      return res.data
    } catch {
      setMensaje('Error al cargar roles')
      setMensajeError(true)
      return []
    }
  }

  useEffect(() => { cargar() }, [verActivos])

  const abrirCrear = async () => {
    await cargarRoles()
    setEditando(null)
    setForm({ idRol: '', nombre: '', correo: '', password: '' })
    setMensaje(null)
    setModalAbierto(true)
  }

  const abrirEditar = async (usuario) => {
    const rolesActivos = await cargarRoles()
    const rolActual = rolesActivos.find(r => r[1] === usuario[3])
    setEditando(usuario)
    setForm({
      idRol: rolActual ? rolActual[0] : '',
      nombre: usuario[1],
      correo: usuario[2],
      password: ''
    })
    setMensaje(null)
    setModalAbierto(true)
  }

  const buildPayload = () => ({
    idRol: form.idRol ? Number(form.idRol) : null,
    nombre: form.nombre,
    correo: form.correo,
    password: form.password
  })

  const guardar = async () => {
    try {
      const payload = buildPayload()
      const res = editando
        ? await usuarioService.editar(editando[0], payload)
        : await usuarioService.crear(payload)
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
      const res = await usuarioService.cambiarEstado(id, nuevoEstado)
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
        <h1 className="text-xl font-semibold">Usuarios</h1>
        <button
          onClick={abrirCrear}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Nuevo usuario
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
          placeholder="Buscar por correo"
          value={filtroCorreo}
          onChange={e => setFiltroCorreo(e.target.value)}
          className="border rounded px-3 py-2 text-sm flex-1 min-w-32"
        />
        <input
          placeholder="Buscar por rol"
          value={filtroRol}
          onChange={e => setFiltroRol(e.target.value)}
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
            <th className="p-3 text-left">Correo</th>
            <th className="p-3 text-left">Rol</th>
            <th className="p-3 text-left">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.length === 0 ? (
            <tr><td colSpan={5} className="p-3 text-center text-gray-400">Sin resultados</td></tr>
          ) : (
            usuarios.map((u) => (
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
                    onClick={() => cambiarEstado(u[0], verActivos ? 0 : 1)}
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
            <h2 className="text-lg font-semibold mb-4">{editando ? 'Editar usuario' : 'Nuevo usuario'}</h2>
            <div className="flex flex-col gap-3">
              <select
                value={form.idRol}
                onChange={e => setForm({ ...form, idRol: e.target.value })}
                className="border rounded px-3 py-2 text-sm"
              >
                <option value="">-- Selecciona un rol --</option>
                {roles.map(r => (
                  <option key={r[0]} value={r[0]}>{r[1]}</option>
                ))}
              </select>
              <input
                placeholder="Nombre"
                value={form.nombre}
                onChange={e => setForm({ ...form, nombre: e.target.value })}
                className="border rounded px-3 py-2 text-sm"
              />
              <input
                placeholder="Correo"
                type="email"
                value={form.correo}
                onChange={e => setForm({ ...form, correo: e.target.value })}
                className="border rounded px-3 py-2 text-sm"
              />
              <input
                placeholder={editando ? 'Nuevo password (opcional)' : 'Password'}
                type="password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                className="border rounded px-3 py-2 text-sm"
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

export default Usuario
