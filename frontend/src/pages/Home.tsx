import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

export default function Home() {
  const { user } = useAuth()
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  const faqs = [
    {
      question: 'Como posso baixar as planilhas?',
      answer:
        'Para baixar as planilhas, você pode clicar no menu superior na aba "Baixar" e selecionar a data. Após buscar, clique no botão direito para realizar o download',
    },
    {
      question: 'Como posso visualizar os comentários de forma detalhada?',
      answer:
        'Na aba "Visualizar", você pode ver todos os comentários das lives de forma detalhada, com informações sobre quem comentou e quando.',
    },
    {
      question: 'Em quanto tempo é atualizado?',
      answer:
        'As métricas são atualizadas em tempo real conforme os dados são coletados do Facebook.',
    },
    {
      question:
        'Qual a diferença de baixar o excel e visualizar os comentários individuais?',
      answer:
        'Ao baixar o Excel, você obtém um relatório completo com todas as métricas agregadas. Ao visualizar os comentários individuais, você vê cada comentário separadamente com mais detalhes.',
    },
  ]

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-bold text-center text-gray-800">
        Bem-vindo {user?.username}
      </h1>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 flex items-center gap-4">
        <svg
          className="w-8 h-8 text-yellow-500"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
        <p className="text-gray-700 text-lg">
          Este aplicativo foi desenvolvido para facilitar a busca de métricas.
        </p>
        <svg
          className="w-8 h-8 text-yellow-500"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
      </div>

      <div className="space-y-2">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="bg-gray-200 rounded-lg overflow-hidden cursor-pointer"
            onClick={() => toggleFaq(index)}
          >
            <div className="p-4 flex justify-between items-center">
              <h3 className="font-medium text-gray-800">{faq.question}</h3>
              <svg
                className={`w-5 h-5 text-gray-600 transition-transform ${
                  openFaq === index ? 'rotate-180' : ''
                }`}
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
            {openFaq === index && (
              <div className="px-4 pb-4 text-gray-700">{faq.answer}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}


