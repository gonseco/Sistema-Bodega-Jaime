import { NavLink } from 'react-router-dom'
import { puedeVerModulo } from '../services/sesionService'

function Navbar({ onCerrarSesion }) {
  const linkClass = ({ isActive }) =>
    isActive ? 'bg-gray-600 px-4 py-2 rounded' : 'px-4 py-2 rounded hover:bg-gray-700'

  return (
    <nav className="bg-gray-800 text-white w-48 min-w-48 min-h-screen p-4 flex flex-col gap-2 overflow-y-auto">
      <NavLink to="/" className="text-lg font-medium mb-4 hover:text-gray-300">
        Bodega Jaime
      </NavLink>
      <NavLink to="/marca" className={linkClass}>Marcas</NavLink>
      <NavLink to="/categoria" className={linkClass}>Categorias</NavLink>
      <NavLink to="/producto" className={linkClass}>Productos</NavLink>
      <NavLink to="/unidad-de-medida" className={linkClass}>Unidades de medida</NavLink>
      {puedeVerModulo('registroVenta') && (
        <NavLink to="/venta" className={linkClass}>Registro de venta</NavLink>
      )}
      {puedeVerModulo('historialVenta') && (
        <NavLink to="/historial-venta" className={linkClass}>Historial de ventas</NavLink>
      )}
      <NavLink to="/comprobante" className={linkClass}>Boletas y Facturas</NavLink>
      <NavLink to="/proveedor" className={linkClass}>Proveedores</NavLink>
      <NavLink to="/orden-compra" className={linkClass}>Órdenes de compra</NavLink>
      <NavLink to="/guia-remision" className={linkClass}>Guías de remisión</NavLink>
      {puedeVerModulo('rol') && (
        <NavLink to="/rol" className={linkClass}>Roles</NavLink>
      )}
      {puedeVerModulo('usuario') && (
        <NavLink to="/usuario" className={linkClass}>Usuarios</NavLink>
      )}
      
      <div className="mt-auto pt-4 border-t border-gray-600">
        <button
          onClick={onCerrarSesion}
          className="w-full text-left px-4 py-2 rounded hover:bg-red-700 text-sm text-gray-300 hover:text-white transition-colors"
        >
          Cerrar sesión
        </button>
      </div>
    </nav>
  )
}

export default Navbar