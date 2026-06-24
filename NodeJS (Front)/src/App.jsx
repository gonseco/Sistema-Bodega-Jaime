import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Inicio from './pages/Inicio'
import Marca from './pages/Marca'
import Categoria from './pages/Categoria'
import UnidadDeMedida from './pages/UnidadDeMedida'
import Producto from './pages/Producto'
import Rol from './pages/Rol'
import Usuario from './pages/Usuario'
import Venta from './pages/Venta'
import HistorialVenta from './pages/HistorialVenta'
import Login from './pages/Login'
import Proveedor from './pages/Proveedor'
import OrdenCompra from './pages/OrdenCompra'
import GuiaRemision from './pages/GuiaRemision'
import Comprobante from './pages/Comprobante'
import { puedeVerModulo } from './services/sesionService'
import loginService from './services/loginService'

function App() {
  const [sesionActiva, setSesionActiva] = useState(
    () => !!localStorage.getItem('usuarioSesion')
  )

  const handleLoginExitoso = () => setSesionActiva(true)

  const handleCerrarSesion = () => {
    loginService.cerrarSesion()
    setSesionActiva(false)
  }

  if (!sesionActiva) {
    return <Login onLoginExitoso={handleLoginExitoso} />
  }

  const rutaPermitida = (modulo, componente) =>
    puedeVerModulo(modulo) ? componente : <Navigate to="/" />

  return (
    <div className="flex">
      <Navbar onCerrarSesion={handleCerrarSesion} />
      <main className="flex-1 p-6 bg-gray-100 min-h-screen">
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/marca" element={<Marca />} />
          <Route path="/categoria" element={<Categoria />} />
          <Route path="/producto" element={<Producto />} />
          <Route path="/unidad-de-medida" element={<UnidadDeMedida />} />
          <Route path="/venta" element={rutaPermitida('registroVenta', <Venta />)} />
          <Route path="/historial-venta" element={rutaPermitida('historialVenta', <HistorialVenta />)} />
          <Route path="/comprobante" element={<Comprobante />} />
          <Route path="/proveedor" element={<Proveedor />} />
          <Route path="/orden-compra" element={<OrdenCompra />} />
          <Route path="/guia-remision" element={<GuiaRemision />} />
          <Route path="/rol" element={rutaPermitida('rol', <Rol />)} />
          <Route path="/usuario" element={rutaPermitida('usuario', <Usuario />)} />
          
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  )
}

export default App