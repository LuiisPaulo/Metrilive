import { useState, useEffect } from 'react'
import { commentService, Comment } from '../services/commentService'
import { dashboardService, DashboardMetric } from '../services/dashboardService'

export default function View() {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadComments()
  }, [])

  const loadComments = async () => {
    setLoading(true)
    try {
      // Por enquanto, vamos simular comentários baseados nas métricas
      // Em produção, você precisaria passar o liveVideoId correto
      const metrics = await dashboardService.getMetrics()
      
      // Simulando comentários baseados nas métricas
      const mockComments: Comment[] = []
      metrics.forEach((metric, index) => {
        for (let i = 0; i < Math.min(metric.totalComments, 3); i++) {
          mockComments.push({
            id: `${index}-${i}`,
            message: 'Gostei muito da rádio.',
            fromName: index % 2 === 0 ? 'Leonardo David' : 'Vinicius Itakura',
            fromId: `${index}-${i}`,
            createdTime: metric.date,
          })
        }
      })
      
      setComments(mockComments)
    } catch (error) {
      console.error('Erro ao carregar comentários:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredComments = comments.filter((comment) =>
    comment.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
    comment.fromName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getAvatarColor = (name: string) => {
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
            placeholder="Hinted search text"
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
              Nenhum comentário encontrado
            </div>
          ) : (
            filteredComments.map((comment) => (
              <div
                key={comment.id}
                className="bg-gray-200 rounded-lg p-4 flex gap-4"
              >
                <div
                  className={`w-12 h-12 rounded-full ${getAvatarColor(
                    comment.fromName
                  )} flex items-center justify-center text-white font-bold flex-shrink-0`}
                >
                  {getInitials(comment.fromName)}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800 mb-1">
                    {comment.fromName}
                  </h3>
                  <p className="text-gray-700 mb-2">{comment.message}</p>
                  <div className="flex gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <svg
                        className="w-4 h-4 text-yellow-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.834a1 1 0 001.8.6l2.7-3.6-2.7-3.6a1 1 0 00-1.8.6zM15.5 10a1.5 1.5 0 011.5 1.5v5a1.5 1.5 0 01-3 0v-5a1.5 1.5 0 011.5-1.5z" />
                      </svg>
                      <span>12</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                      </svg>
                      <span>12</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                        />
                      </svg>
                      <span>12</span>
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


