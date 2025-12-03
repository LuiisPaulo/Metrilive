import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Layout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true
    if (path !== '/' && location.pathname.startsWith(path)) return true
    return false
  }

  const getButtonClass = (path: string) => {
    const baseClass = 'px-6 py-2 rounded-lg font-medium transition-colors'
    if (isActive(path)) {
      return `${baseClass} bg-blue-600 text-white`
    }
    return `${baseClass} bg-gray-200 text-gray-700 hover:bg-gray-300`
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => navigate('/')}
              className={getButtonClass('/')}
            >
              Início
            </button>
            <button
              onClick={() => navigate('/baixar')}
              className={getButtonClass('/baixar')}
            >
              Baixar
            </button>
            <button
              onClick={() => navigate('/visualizar')}
              className={getButtonClass('/visualizar')}
            >
              Visualizar
            </button>
            <button
              onClick={() => navigate('/facebook')}
              className={getButtonClass('/facebook')}
            >
              Facebook
            </button>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-700">Olá, {user?.username}</span>
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              Sair
            </button>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto p-6">
        <Outlet />
      </main>
    </div>
  )
}


