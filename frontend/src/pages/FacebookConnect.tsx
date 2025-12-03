import { useState } from 'react'
import { facebookService, FacebookPage, LiveVideo, FacebookComment } from '../services/facebookService'
import { useAuth } from '../contexts/AuthContext'

export default function FacebookConnect() {
  const { user } = useAuth()
  const [accessToken, setAccessToken] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [pages, setPages] = useState<FacebookPage[]>([])
  const [selectedPage, setSelectedPage] = useState<FacebookPage | null>(null)
  const [videos, setVideos] = useState<LiveVideo[]>([])
  const [selectedVideo, setSelectedVideo] = useState<LiveVideo | null>(null)
  const [comments, setComments] = useState<FacebookComment[]>([])
  
  const [loadingToken, setLoadingToken] = useState(false)
  const [loadingUrl, setLoadingUrl] = useState(false)
  const [loadingPages, setLoadingPages] = useState(false)
  const [loadingVideos, setLoadingVideos] = useState(false)
  const [loadingComments, setLoadingComments] = useState(false)

  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  const handleSetToken = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoadingToken(true)
    setMessage(null)
    try {
      await facebookService.setToken(accessToken)
      setMessage({ text: 'Token salvo com sucesso!', type: 'success' })
      setAccessToken('')
    } catch (error) {
      setMessage({ text: 'Erro ao salvar token.', type: 'error' })
    } finally {
      setLoadingToken(false)
    }
  }

  const handleProcessUrl = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoadingUrl(true)
    setMessage(null)
    try {
      await facebookService.processUrl(videoUrl)
      setMessage({ text: 'URL enviada para processamento!', type: 'success' })
      setVideoUrl('')
    } catch (error) {
      setMessage({ text: 'Erro ao processar URL.', type: 'error' })
    } finally {
      setLoadingUrl(false)
    }
  }

  const loadPages = async () => {
    setLoadingPages(true)
    setMessage(null)
    try {
      const data = await facebookService.getPages()
      setPages(data)
      setSelectedPage(null)
      setVideos([])
      setSelectedVideo(null)
      setComments([])
    } catch (error) {
      setMessage({ text: 'Erro ao carregar páginas. Verifique se o token está válido.', type: 'error' })
    } finally {
      setLoadingPages(false)
    }
  }

  const handlePageSelect = async (page: FacebookPage) => {
    setSelectedPage(page)
    setLoadingVideos(true)
    setVideos([])
    setSelectedVideo(null)
    setComments([])
    try {
      const data = await facebookService.getLiveVideos(page.id)
      setVideos(data)
    } catch (error) {
      setMessage({ text: `Erro ao carregar vídeos da página ${page.name}.`, type: 'error' })
    } finally {
      setLoadingVideos(false)
    }
  }

  const handleVideoSelect = async (video: LiveVideo) => {
    setSelectedVideo(video)
    setLoadingComments(true)
    setComments([])
    try {
      const data = await facebookService.getComments(video.id)
      setComments(data)
    } catch (error) {
      setMessage({ text: 'Erro ao carregar comentários.', type: 'error' })
    } finally {
      setLoadingComments(false)
    }
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-800">Integração com Facebook</h1>

      {message && (
        <div className={`p-4 rounded-md ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {user?.role === 'ADMIN' && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Configurar Token de Acesso</h2>
            <form onSubmit={handleSetToken} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Access Token</label>
                <input
                  type="text"
                  value={accessToken}
                  onChange={(e) => setAccessToken(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Cole seu token aqui..."
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loadingToken}
                className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loadingToken ? 'Salvando...' : 'Salvar Token'}
              </button>
            </form>
          </div>
        )}

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Processar URL de Vídeo</h2>
          <form onSubmit={handleProcessUrl} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">URL do Vídeo</label>
              <input
                type="text"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="https://www.facebook.com/..."
                required
              />
            </div>
            <button
              type="submit"
              disabled={loadingUrl}
              className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {loadingUrl ? 'Processando...' : 'Processar URL'}
            </button>
          </form>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Minhas Páginas</h2>
          <button
            onClick={loadPages}
            disabled={loadingPages}
            className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900 disabled:opacity-50"
          >
            {loadingPages ? 'Carregando...' : 'Carregar Páginas'}
          </button>
        </div>

        {pages.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {pages.map((page) => (
              <div
                key={page.id}
                onClick={() => handlePageSelect(page)}
                className={`cursor-pointer p-4 border rounded-lg transition-colors ${
                  selectedPage?.id === page.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <h3 className="font-bold text-lg">{page.name}</h3>
                <p className="text-sm text-gray-500">ID: {page.id}</p>
                {page.category && <p className="text-xs text-gray-400">{page.category}</p>}
              </div>
            ))}
          </div>
        ) : (
          !loadingPages && <p className="text-gray-500 text-center py-4">Nenhuma página carregada. Configure o token e clique em "Carregar Páginas".</p>
        )}

        {selectedPage && (
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">
              Vídeos de <span className="text-blue-600">{selectedPage.name}</span>
            </h3>
            
            {loadingVideos ? (
              <p className="text-gray-500">Carregando vídeos...</p>
            ) : videos.length > 0 ? (
              <div className="space-y-4">
                {videos.map((video) => (
                  <div key={video.id} className="border rounded-md p-4 bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold">{video.title || 'Sem título'}</h4>
                        <p className="text-sm text-gray-600 line-clamp-2">{video.description}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          Criado em: {video.creationTime ? new Date(video.creationTime).toLocaleString() : 'N/A'} | Status: {video.status}
                        </p>
                      </div>
                      <button
                        onClick={() => handleVideoSelect(video)}
                        className="ml-4 px-3 py-1 text-sm border border-blue-600 text-blue-600 rounded hover:bg-blue-50"
                      >
                        Ver Comentários
                      </button>
                    </div>

                    {selectedVideo?.id === video.id && (
                      <div className="mt-4 pl-4 border-l-4 border-blue-200">
                        <h5 className="font-semibold text-sm mb-2">Comentários Recentes</h5>
                        {loadingComments ? (
                          <p className="text-sm text-gray-500">Carregando comentários...</p>
                        ) : comments.length > 0 ? (
                          <ul className="space-y-2">
                            {comments.map((comment) => (
                              <li key={comment.id} className="text-sm bg-white p-2 rounded border">
                                <span className="font-bold text-gray-800">{comment.from?.name || 'Usuário'}: </span>
                                <span className="text-gray-700">{comment.message}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-gray-500">Nenhum comentário encontrado.</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">Nenhum vídeo encontrado nesta página.</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
