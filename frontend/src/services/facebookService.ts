import api from './api'

export interface FacebookPage {
  id: string
  name: string
  category?: string
  link?: string
}

export interface LiveVideo {
  id: string
  title?: string
  description?: string
  status?: string
  creationTime?: string
  embedHtml?: string
}

export interface FacebookComment {
  id: string
  message: string
  createdTime: string
  from?: {
    id: string
    name: string
  }
}

class FacebookService {
  async setToken(accessToken: string): Promise<void> {
    await api.post('/facebook/token', { accessToken })
  }

  async processUrl(url: string): Promise<void> {
    await api.post('/facebook/process-url', { url })
  }

  async getPages(): Promise<FacebookPage[]> {
    const response = await api.get<FacebookPage[]>('/facebook/pages')
    return response.data
  }

  async getLiveVideos(pageId: string): Promise<LiveVideo[]> {
    const response = await api.get<LiveVideo[]>(`/facebook/pages/${pageId}/lives`)
    return response.data
  }

  async getComments(liveVideoId: string): Promise<FacebookComment[]> {
    const response = await api.get<FacebookComment[]>(`/facebook/lives/${liveVideoId}/comments`)
    return response.data
  }
}

export const facebookService = new FacebookService()
