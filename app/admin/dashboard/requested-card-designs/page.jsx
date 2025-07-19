"use client"
import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/admin/page-layout'

export default function InstituteCardDesignsPage() {
  const [cards, setCards] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCards = async () => {
      try {
        const res = await fetch('/api/superadmin/institute-card-designs')
        const data = await res.json()
        setCards(data.cards || [])
      } catch (err) {
        console.error('Failed to fetch designs:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchCards()
  }, [])

  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6 text-sky-800">Institute Card Designs</h1>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : cards.length === 0 ? (
          <p className="text-center text-gray-600 text-lg">No designs found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            {cards.map(card => (
              <div key={card.id} className="bg-white rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300 p-4 flex flex-col space-y-3">
                <h2 className="text-xl font-semibold text-sky-700 mb-2">{card.name}</h2>
                <div className="flex flex-col sm:flex-row sm:justify-between text-sm text-gray-600 mb-3">
                  <div><strong>Admin:</strong> {card.admin_name}</div>
                  <div><strong>Phone:</strong> {card.phone}</div>
                </div>
                <p className="text-xs text-gray-400 mb-3">Institution ID: {card.institution_id}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {card.front_img && (
                    <div className="overflow-hidden rounded-lg border border-gray-300 shadow-sm">
                      <img src={card.front_img} alt="Front" className="w-full h-[400px] object-cover hover:scale-105 transition-transform duration-200" />
                    </div>
                  )}
                  {card.back_img && (
                    <div className="overflow-hidden rounded-lg border border-gray-300 shadow-sm">
                      <img src={card.back_img} alt="Back" className="w-full h-[400px] object-cover hover:scale-105 transition-transform duration-200" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
