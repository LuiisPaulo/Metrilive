import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { createUser, updateUser, getUserById } from '../services/userService'
import { facebookService, FacebookPage } from '../services/facebookService'

export default function UserForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'EQUIPE_DE_PRODUCAO',
    authorizedPageIds: [] as string[],
  })
  const [availablePages, setAvailablePages] = useState<FacebookPage[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    loadPages()
    if (isEdit) {
      loadUser(Number(id))
    }
  }, [id])

  const loadPages = async () => {
    try {
      const pages = await facebookService.getAllStoredPages()
      setAvailablePages(pages)
    } catch (err) {
      console.error('Error loading pages:', err)
      setError('Erro ao carregar páginas do Facebook. Certifique-se de que o Admin conectou uma conta.')
    }
  }

  const loadUser = async (userId: number) => {
    try {
      setLoading(true)
      const user = await getUserById(userId)
      setFormData({
        username: user.username,
        email: user.email,
        password: '',
        role: user.role,
        authorizedPageIds: user.authorizedPages ? user.authorizedPages.map(p => p.id) : [],
      })
    } catch (err) {
      console.error(err)
      setError('Erro ao carregar usuário')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (formData.role !== 'ADMIN' && formData.authorizedPageIds.length === 0) {
      setError('Selecione pelo menos uma página do Facebook para este usuário.')
      return
    }

    setLoading(true)

    try {
      if (isEdit) {
        await updateUser(Number(id), formData)
      } else {
        await createUser(formData)
      }
      navigate('/usuarios')
    } catch (err) {
      console.error(err)
      setError('Erro ao salvar usuário')
    } finally {
      setLoading(false)
    }
  }

  const handlePageToggle = (pageId: string) => {
    setFormData(prev => {
      const current = prev.authorizedPageIds || []
      if (current.includes(pageId)) {
        return { ...prev, authorizedPageIds: current.filter(id => id !== pageId) }
      } else {
        return { ...prev, authorizedPageIds: [...current, pageId] }
      }
    })
  }

  const isSaveDisabled = loading || (formData.role !== 'ADMIN' && formData.authorizedPageIds.length === 0)

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-6">{isEdit ? 'Editar Usuário' : 'Novo Usuário'}</h1>
      
      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nome de Usuário</label>
              <input
                type="text"
                required
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Senha {isEdit && <span className="text-gray-500 text-xs">(Deixe em branco para manter a atual)</span>}
              </label>
              <input
                type="password"
                required={!isEdit}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Perfil</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
              >
                <option value="ADMIN">Administrador</option>
                <option value="GESTOR_DE_LIVES">Gestor de Lives</option>
                <option value="EQUIPE_DE_PRODUCAO">Equipe de Produção</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Páginas do Facebook Associadas</label>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 h-80 overflow-y-auto">
              {availablePages.length === 0 ? (
                <p className="text-gray-500 italic text-sm">
                    Nenhuma página encontrada. Conecte o Facebook com uma conta Admin primeiro.
                </p>
              ) : (
                <div className="space-y-2">
                  {availablePages.map(page => (
                    <label key={page.id} className="flex items-center space-x-3 p-2 hover:bg-white rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.authorizedPageIds.includes(page.id)}
                        onChange={() => handlePageToggle(page.id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        disabled={formData.role === 'ADMIN'}
                      />
                      <span className={`text-gray-700 ${formData.role === 'ADMIN' ? 'opacity-50' : ''}`}>
                        {page.name} (ID: {page.id})
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500">
              {formData.role === 'ADMIN' 
                ? '* Administradores têm acesso a todas as páginas automaticamente.' 
                : '* Selecione as páginas que este usuário poderá acessar.'}
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <button
            type="button"
            onClick={() => navigate('/usuarios')}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSaveDisabled}
            title={isSaveDisabled ? "Selecione pelo menos uma página" : ""}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </form>
    </div>
  )
}
