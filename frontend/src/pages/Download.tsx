import { useState, useEffect } from 'react'
import { dashboardService, DashboardMetric } from '../services/dashboardService'

export default function Download() {
  const [date, setDate] = useState('')
  const [metrics, setMetrics] = useState<DashboardMetric[]>([])
  const [loading, setLoading] = useState(false)
  const [filteredMetrics, setFilteredMetrics] = useState<DashboardMetric[]>([])

  useEffect(() => {
    loadMetrics()
  }, [])

  useEffect(() => {
    if (date) {
      const filtered = metrics.filter((m) => m.date === date)
      setFilteredMetrics(filtered)
    } else {
      setFilteredMetrics(metrics)
    }
  }, [date, metrics])

  const loadMetrics = async () => {
    setLoading(true)
    try {
      const data = await dashboardService.getMetrics()
      setMetrics(data)
      setFilteredMetrics(data)
    } catch (error) {
      console.error('Erro ao carregar métricas:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async () => {
    try {
      await dashboardService.downloadReport()
    } catch (error) {
      console.error('Erro ao baixar relatório:', error)
    }
  }

  const formatDateForInput = (dateStr: string) => {
    // Converte DD/MM/YYYY para YYYY-MM-DD
    const parts = dateStr.split('/')
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`
    }
    return ''
  }

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value) {
      // Converte YYYY-MM-DD para DD/MM/YYYY
      const parts = value.split('-')
      if (parts.length === 3) {
        setDate(`${parts[2]}/${parts[1]}/${parts[0]}`)
      }
    } else {
      setDate('')
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Selecione a data
        </h2>
        <div className="flex justify-center items-center gap-2">
          <input
            type="date"
            value={date ? formatDateForInput(date) : ''}
            onChange={handleDateChange}
            className="px-4 py-2 bg-purple-100 rounded-lg border border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="DD/MM/AAAA"
          />
          <button
            onClick={() => {
              const input = document.querySelector('input[type="date"]') as HTMLInputElement
              if (input) input.value = ''
              setDate('')
            }}
            className="p-2 text-gray-600 hover:text-gray-800"
          >
            <svg
              className="w-6 h-6"
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
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">Carregando...</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    Data
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
                        d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                      />
                    </svg>
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    Visualizações
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
                        d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                      />
                    </svg>
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    Descrição
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
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMetrics.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                    Nenhuma métrica encontrada
                  </td>
                </tr>
              ) : (
                filteredMetrics.map((metric, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {metric.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {metric.totalViews.toLocaleString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {metric.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={handleDownload}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                      >
                        Baixar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}


