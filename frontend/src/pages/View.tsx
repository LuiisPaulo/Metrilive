import { useState, useEffect } from 'react'
import { commentService, Comment } from '../services/commentService'
import api from '../services/api'

interface LiveVideo {
  id: string
  title: string
  description: string
  creationTime: string
}

export default function View() {
  const [comments, setComments] = useState<Comment[]>([])
  const [videos, setVideos] = useState<LiveVideo[]>([])
  const [selectedVideoId, setSelectedVideoId] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [loadingVideos, setLoadingVideos] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadVideos()
  }, [])

  useEffect(() => {
    if (selectedVideoId) {
      loadComments(selectedVideoId)
    } else {
        setComments([])
    }
  }, [selectedVideoId])

  const loadVideos = async () => {
    setLoadingVideos(true)
    try {
        const response = await api.get<LiveVideo[]>('/facebook/videos')
        setVideos(response.data)
        if (response.data.length > 0) {
            setSelectedVideoId(response.data[0].id)
        }
    } catch (error) {
        console.error('Erro ao carregar vídeos:', error)
    } finally {
        setLoadingVideos(false)
    }
  }

  const loadComments = async (videoId: string) => {
    setLoading(true)
    try {
      const data = await commentService.getComments(videoId)
      setComments(data)
    } catch (error) {
      console.error('Erro ao carregar comentários:', error)
      setComments([])
    } finally {
      setLoading(false)
    }
  }

  const filteredComments = comments.filter((comment) =>
    (comment.message && comment.message.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (comment.fromName && comment.fromName.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const getInitials = (name: string) => {
    if (!name) return '?'
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getAvatarColor = (name: string) => {
    if (!name) return 'bg-gray-500'
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
    ]
    const index = name.charCodeAt(0) % colors.length
    return colors[index]
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-lg shadow-sm">
          <label htmlFor="video-select" className="block text-sm font-medium text-gray-700 mb-2">Selecione o Vídeo:</label>
          {loadingVideos ? (
              <p>Carregando vídeos...</p>
          ) : (
              <select
                  id="video-select"
                  value={selectedVideoId}
                  onChange={(e) => setSelectedVideoId(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
              >
                  <option value="" disabled>Selecione um vídeo...</option>
                  {videos.map(video => (
                      <option key={video.id} value={video.id}>
                          {video.title || 'Vídeo sem título'} - {new Date(video.creationTime).toLocaleDateString('pt-BR')}
                      </option>
                  ))}
              </select>
          )}
      </div>

      <div className="flex justify-center">
        <div className="relative w-full max-w-md">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar comentários..."
            className="w-full pl-10 pr-10 py-3 bg-purple-100 rounded-lg border border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">Carregando comentários...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredComments.length === 0 ? (
            <div className="col-span-2 text-center text-gray-500 py-8">
              Nenhum comentário encontrado para este vídeo.
            </div>
          ) : (
            filteredComments.map((comment) => (
              <div
                key={comment.id}
                className="bg-gray-200 rounded-lg p-4 flex gap-4"
              >
                <div
                  className={`w-12 h-12 rounded-full ${getAvatarColor(
                    comment.fromName || 'A'
                  )} flex items-center justify-center text-white font-bold flex-shrink-0`}
                >
                  {getInitials(comment.fromName || 'Anônimo')}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800 mb-1">
                    {comment.fromName || 'Usuário do Facebook'}
                  </h3>
                  <p className="text-gray-700 mb-2">{comment.message}</p>
                  <div className="flex gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">

                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}


