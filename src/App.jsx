import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import SessionNotification from './components/SessionNotification';

// Páginas
import Login from './pages/Login.jsx';
import Recuperar from './pages/Recuperar.jsx';
import Registro from './pages/registro.jsx';
import Home from './pages/Home.jsx';
import Descripcion from './pages/descripcion.jsx';
import Detalle from './pages/detalle.jsx';
import Error404 from './pages/Error404.jsx';

// Dashboards
import DashboardPropietario from './pages/dashboard/DashboardPropietario';
import DashboardGestor from './pages/dashboard/DashboardGestor';
import DashboardAdmin from './pages/dashboard/DashboardAdmin';
import PropiedadesPropietario from './pages/dashboard/PropiedadesPropietario';

// Componentes de Admin
import AdminUsuarios from './pages/dashboard/AdminUsuarios';
import AdminPropiedades from './pages/dashboard/AdminPropiedades';
import AdminPropiedadForm from './pages/dashboard/AdminPropiedadForm';
import NuevaPropiedad from './pages/dashboard/NuevaPropiedad';
import GestionarPropiedadMejorado from './pages/dashboard/GestionarPropiedadMejorado';
import NuevoUsuario from './pages/dashboard/NuevoUsuario';
import EditarUsuario from './pages/dashboard/EditarUsuario';

// Componente de protección de rutas
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.tipoUsuario)) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

// Componente principal de la aplicación
const AppContent = () => {
  const { user } = useAuth();

  return (
    <Router>
      <SessionNotification />
      <Routes>
        {/* Rutas públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/recuperar" element={<Recuperar />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/" element={<Home />} />
        <Route path="/descripcion/:id" element={<Descripcion />} />
        <Route path="/detalle/:id" element={<Detalle />} />
        
        {/* Rutas protegidas - Propietario */}
        <Route 
          path="/dashboard/propietario" 
          element={
            <ProtectedRoute allowedRoles={['propietario', 'admin']}>
              <DashboardPropietario />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard/propietario/propiedades/nueva" 
          element={
            <ProtectedRoute allowedRoles={['propietario', 'admin']}>
              <NuevaPropiedad />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard/propietario/propiedades/editar/:id" 
          element={
            <ProtectedRoute allowedRoles={['propietario', 'admin']}>
              <GestionarPropiedadMejorado />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard/propietario/propiedades" 
          element={
            <ProtectedRoute allowedRoles={['propietario', 'admin']}>
              <PropiedadesPropietario />
            </ProtectedRoute>
          } 
        />
        
        {/* Rutas protegidas - Gestor */}
        <Route 
          path="/dashboard/gestor" 
          element={
            <ProtectedRoute allowedRoles={['gestor', 'admin']}>
              <DashboardGestor />
            </ProtectedRoute>
          } 
        />
        
        {/* Rutas protegidas - Admin */}
        <Route 
          path="/dashboard/admin" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <DashboardAdmin />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard/admin/usuarios" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminUsuarios />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard/admin/propiedades" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminPropiedades />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard/admin/propiedades/nueva" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminPropiedadForm />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard/admin/propiedades/editar/:id" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <GestionarPropiedadMejorado />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard/admin/propiedades/nueva-propiedad" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <NuevaPropiedad />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard/admin/propiedades/gestionar/:id" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <GestionarPropiedadMejorado />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard/admin/usuarios/nuevo" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <NuevoUsuario />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard/admin/usuarios/editar/:id" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <EditarUsuario />
            </ProtectedRoute>
          } 
        />
        
        {/* Redirección por defecto según tipo de usuario */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              {user?.tipoUsuario === 'admin' && <Navigate to="/dashboard/admin" replace />}
              {user?.tipoUsuario === 'gestor' && <Navigate to="/dashboard/gestor" replace />}
              {user?.tipoUsuario === 'propietario' && <Navigate to="/dashboard/propietario" replace />}
              <Navigate to="/" replace />
            </ProtectedRoute>
          } 
        />
        
        {/* Ruta 404 */}
        <Route path="*" element={<Error404 />} />
      </Routes>
    </Router>
  );
};

// Componente principal con providers
const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App; 