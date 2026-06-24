/* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react'
import ventaService from '../services/ventaService'
import usuarioService from '../services/usuarioService'

function HistorialVenta() {
  const [usuarios, setUsuarios] = useState([])
  const [historial, setHistorial] = useState([])
  const [idUsuario, setIdUsuario] = useState('')
  const [historialUsuario, setHistorialUsuario] = useState('')
  const [fechaInicio, setFechaInicio] = useState('')
  const [fechaFin, setFechaFin] = useState('')
  const [estadoHistorial, setEstadoHistorial] = useState('')
  const [mensaje, setMensaje] = useState(null)
  const [mensajeError, setMensajeError] = useState(false)

  const inputClass = 'border border-slate-200 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500'
  const buttonPrimary = 'bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700'
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

  const cargarHistorial = async () => {
    try {
      const res = await ventaService.buscarHistorial(
        historialUsuario || null,
        fechaInicio || null,
        fechaFin || null,
        estadoHistorial === '' ? null : Number(estadoHistorial)
      )
      setHistorial(res.data)
    } catch {
      setMensaje('Error al cargar historial de ventas')
      setMensajeError(true)
    }
  }

  useEffect(() => {
    cargarUsuarios()
    cargarHistorial()
  }, [])

  const limpiarFiltros = async () => {
    setHistorialUsuario('')
    setFechaInicio('')
    setFechaFin('')
    setEstadoHistorial('')

    try {
      const res = await ventaService.buscarHistorial(null, null, null, null)
      setHistorial(res.data)
    } catch {
      setMensaje('Error al cargar historial de ventas')
      setMensajeError(true)
    }
  }

  const fechaSoloDia = (fecha) => {
    if (!fecha) return 'Sin fecha'
    return String(fecha).split('T')[0].split(' ')[0]
  }

  const ventasActivas = historial.filter(v => Number(v.estado) === 1)
  const ventasAnuladas = historial.filter(v => Number(v.estado) === 0)
  const ingresosTotales = ventasActivas.reduce((total, v) => total + Number(v.total || 0), 0)
  const ticketPromedio = ventasActivas.length > 0 ? ingresosTotales / ventasActivas.length : 0
  const ventaMasAlta = ventasActivas.reduce((mayor, v) => Math.max(mayor, Number(v.total || 0)), 0)

  const ventasPorDia = historial.reduce((acc, venta) => {
    const dia = fechaSoloDia(venta.fecha)
    acc[dia] = (acc[dia] || 0) + 1
    return acc
  }, {})

  const ingresosPorDia = ventasActivas.reduce((acc, venta) => {
    const dia = fechaSoloDia(venta.fecha)
    acc[dia] = (acc[dia] || 0) + Number(venta.total || 0)
    return acc
  }, {})

  const diasReporte = Object.entries(ventasPorDia).sort(([a], [b]) => a.localeCompare(b))
  const maxVentasDia = Math.max(1, ...diasReporte.map(([, cantidad]) => cantidad))
  const diasIngresos = Object.entries(ingresosPorDia).sort(([a], [b]) => a.localeCompare(b))
  const maxIngresosDia = Math.max(1, ...diasIngresos.map(([, total]) => total))
  const mejorDiaIngresos = diasIngresos.reduce(
    (mejor, [dia, total]) => total > mejor.total ? { dia, total } : mejor,
    { dia: '-', total: 0 }
  )

  const estadoBadge = (estado) =>
    Number(estado) === 1
      ? 'bg-green-50 text-green-700 border-green-100'
      : 'bg-red-50 text-red-700 border-red-100'

  const anularVenta = async (idVenta) => {
    if (!idUsuario) {
      setMensaje('Selecciona un usuario administrador para anular')
      setMensajeError(true)
      return
    }

    try {
      const res = await ventaService.anular(idVenta, Number(idUsuario))
      const exito = res.data.mensaje.startsWith('OK')
      setMensaje(res.data.mensaje)
      setMensajeError(!exito)
      if (exito) {
        cargarHistorial()
      }
    } catch (error) {
      setMensaje(error.response?.data?.mensaje || 'Error al anular venta')
      setMensajeError(true)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Historial de ventas</h1>
        <p className="text-sm text-slate-500">Reporte y anulacion de ventas</p>
      </div>

      {mensaje && (
        <div className={`border-l-4 p-3 rounded text-sm flex justify-between items-center shadow-sm ${mensajeError ? 'bg-red-50 text-red-800 border-red-500' : 'bg-green-50 text-green-800 border-green-500'}`}>
          <span>{mensaje}</span>
          <button onClick={() => setMensaje(null)} className="ml-4 text-base leading-none hover:opacity-70">x</button>
        </div>
      )}

      <div className="bg-white rounded-md border border-slate-200 shadow-sm">
        <div className="flex justify-between items-center gap-3 border-b border-slate-100 px-4 py-3">
          <h2 className="text-base font-semibold text-slate-900">Reporte de ventas</h2>
          <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs">{historial.length} registro(s)</span>
        </div>

        <div className="p-4">
          <div className="flex flex-wrap gap-3 items-end mb-4">
            <div className="flex flex-col gap-1 flex-1 min-w-60">
              <label className="text-xs font-medium text-slate-500">Usuario administrador para anular</label>
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
          </div>

          <div className="flex flex-wrap gap-3 mb-4">
            <input
              placeholder="Buscar usuario o correo"
              value={historialUsuario}
              onChange={e => setHistorialUsuario(e.target.value)}
              className={`${inputClass} flex-1 min-w-40`}
            />
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-500">Fecha inicio</label>
              <input
                type="date"
                value={fechaInicio}
                onChange={e => setFechaInicio(e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-500">Fecha fin</label>
              <input
                type="date"
                value={fechaFin}
                onChange={e => setFechaFin(e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-500">Estado</label>
              <select
                value={estadoHistorial}
                onChange={e => setEstadoHistorial(e.target.value)}
                className={inputClass}
              >
                <option value="">Todos</option>
                <option value="1">Activas</option>
                <option value="0">Anuladas</option>
              </select>
            </div>
            <button onClick={cargarHistorial} className={buttonPrimary}>
              Buscar
            </button>
            <button onClick={limpiarFiltros} className={buttonSecondary}>
              Limpiar
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
            <div className="border border-slate-200 rounded-md p-4 bg-slate-50">
              <p className="text-xs font-medium text-slate-500">Ventas realizadas</p>
              <p className="text-2xl font-semibold text-slate-900">{historial.length}</p>
            </div>
            <div className="border border-blue-100 rounded-md p-4 bg-blue-50">
              <p className="text-xs font-medium text-blue-700">Ingresos activos</p>
              <p className="text-2xl font-semibold text-blue-950">S/ {ingresosTotales.toFixed(2)}</p>
            </div>
            <div className="border border-green-100 rounded-md p-4 bg-green-50">
              <p className="text-xs font-medium text-green-700">Ventas activas</p>
              <p className="text-2xl font-semibold text-green-950">{ventasActivas.length}</p>
            </div>
            <div className="border border-red-100 rounded-md p-4 bg-red-50">
              <p className="text-xs font-medium text-red-700">Ventas anuladas</p>
              <p className="text-2xl font-semibold text-red-950">{ventasAnuladas.length}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <div className="border border-slate-200 rounded-md p-4 bg-white">
              <p className="text-xs font-medium text-slate-500">Ticket promedio</p>
              <p className="text-xl font-semibold text-slate-900">S/ {ticketPromedio.toFixed(2)}</p>
            </div>
            <div className="border border-slate-200 rounded-md p-4 bg-white">
              <p className="text-xs font-medium text-slate-500">Venta mas alta</p>
              <p className="text-xl font-semibold text-slate-900">S/ {ventaMasAlta.toFixed(2)}</p>
            </div>
            <div className="border border-slate-200 rounded-md p-4 bg-white">
              <p className="text-xs font-medium text-slate-500">Dia con mas ingresos</p>
              <p className="text-xl font-semibold text-slate-900">S/ {mejorDiaIngresos.total.toFixed(2)}</p>
              <p className="text-xs text-slate-500">{mejorDiaIngresos.dia}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-4">
            <div className="border border-slate-200 rounded-md p-4">
              <h3 className="text-sm font-semibold text-slate-900 mb-3">Grafico de ventas por dia</h3>
              {diasReporte.length === 0 ? (
                <p className="text-sm text-slate-400">Sin datos para graficar</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {diasReporte.map(([dia, cantidad]) => (
                    <div key={dia} className="flex items-center gap-3">
                      <span className="text-xs text-slate-500 w-24">{dia}</span>
                      <div className="flex-1 bg-slate-100 rounded h-7 overflow-hidden">
                        <div
                          className="bg-blue-600 h-7 text-white text-xs flex items-center px-2"
                          style={{ width: `${Math.max(8, (cantidad / maxVentasDia) * 100)}%` }}
                        >
                          {cantidad}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border border-slate-200 rounded-md p-4">
              <h3 className="text-sm font-semibold text-slate-900 mb-3">Grafico de ingresos por dia</h3>
              {diasIngresos.length === 0 ? (
                <p className="text-sm text-slate-400">Sin ingresos para graficar</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {diasIngresos.map(([dia, total]) => (
                    <div key={dia} className="flex items-center gap-3">
                      <span className="text-xs text-slate-500 w-24">{dia}</span>
                      <div className="flex-1 bg-slate-100 rounded h-7 overflow-hidden">
                        <div
                          className="bg-green-600 h-7 text-white text-xs flex items-center px-2"
                          style={{ width: `${Math.max(12, (total / maxIngresosDia) * 100)}%` }}
                        >
                          S/ {Number(total).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-100 rounded-md">
            <table className="w-full min-w-[920px] text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="p-3 text-left font-semibold uppercase text-xs">ID</th>
                  <th className="p-3 text-left font-semibold uppercase text-xs">Fecha</th>
                  <th className="p-3 text-left font-semibold uppercase text-xs">Usuario</th>
                  <th className="p-3 text-left font-semibold uppercase text-xs">Correo</th>
                  <th className="p-3 text-left font-semibold uppercase text-xs">Rol</th>
                  <th className="p-3 text-left font-semibold uppercase text-xs">Total</th>
                  <th className="p-3 text-left font-semibold uppercase text-xs">Estado</th>
                  <th className="p-3 text-left font-semibold uppercase text-xs">Accion</th>
                </tr>
              </thead>
              <tbody>
                {historial.length === 0 ? (
                  <tr><td colSpan={8} className="p-6 text-center text-slate-400">Sin ventas registradas</td></tr>
                ) : (
                  historial.map(v => (
                    <tr key={v.codigo} className="border-t border-slate-100 hover:bg-blue-50/40">
                      <td className="p-3 text-slate-500">{v.codigo}</td>
                      <td className="p-3 text-slate-600">{v.fecha}</td>
                      <td className="p-3 font-medium text-slate-900">{v.usuario}</td>
                      <td className="p-3 text-slate-600">{v.correo}</td>
                      <td className="p-3 text-slate-600">{v.rol}</td>
                      <td className="p-3 font-semibold text-slate-900">S/ {Number(v.total).toFixed(2)}</td>
                      <td className="p-3">
                        <span className={`inline-flex border px-2 py-1 rounded text-xs font-medium ${estadoBadge(v.estado)}`}>
                          {v.estado === 1 ? 'Activa' : 'Anulada'}
                        </span>
                      </td>
                      <td className="p-3">
                        {v.estado === 1 ? (
                          <button onClick={() => anularVenta(v.codigo)} className={buttonDanger}>
                            Anular
                          </button>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HistorialVenta
