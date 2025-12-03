import api from './api'

export interface DashboardMetric {
  date: string
  type: string
  totalViews: number
  totalComments: number
  totalShares: number
}

interface DashboardMetricResponse {
  date: string | Date
  type: string
  totalViews: number
  totalComments: number
  totalShares: number
}

class DashboardService {
  async getMetrics(): Promise<DashboardMetric[]> {
    const response = await api.get<DashboardMetricResponse[]>('/dashboard/metrics')
    return response.data.map((metric) => {
      const date = metric.date instanceof Date 
        ? metric.date 
        : new Date(metric.date)
      return {
        ...metric,
        date: date.toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        }),
      }
    })
  }

  async downloadReport(): Promise<void> {
    const response = await api.get('/dashboard/report', {
      responseType: 'blob',
    })
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'relatorio_metricas.csv')
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  }
}

export const dashboardService = new DashboardService()

