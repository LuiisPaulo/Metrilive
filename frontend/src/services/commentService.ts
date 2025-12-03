import api from './api'

export interface Comment {
  id: string
  message: string
  fromName: string
  fromId: string
  createdTime: string
}

class CommentService {
  async getComments(liveVideoId: string): Promise<Comment[]> {
    const response = await api.get<Comment[]>(`/facebook/lives/${liveVideoId}/comments`)
    return response.data.map((comment) => ({
      ...comment,
      createdTime: new Date(comment.createdTime).toLocaleString('pt-BR'),
    }))
  }
}

export const commentService = new CommentService()


