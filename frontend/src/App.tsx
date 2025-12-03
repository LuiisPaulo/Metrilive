import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Download from './pages/Download'
import View from './pages/View'
import Login from './pages/Login'
import FacebookConnect from './pages/FacebookConnect'
import Users from './pages/Users'
import UserForm from './pages/UserForm'
import { AuthProvider, useAuth } from './contexts/AuthContext'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Home />} />
        <Route path="baixar" element={<Download />} />
        <Route path="visualizar" element={<View />} />
        <Route path="facebook" element={<FacebookConnect />} />
        <Route path="usuarios" element={<Users />} />
        <Route path="usuarios/novo" element={<UserForm />} />
        <Route path="usuarios/editar/:id" element={<UserForm />} />
      </Route>
    </Routes>
  )
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  )
}

export default App


