'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/admin/page-layout';

export default function InstituteCardDesignsPage() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCards = async () => {
      try {
        const res = await fetch('/api/superadmin/institute-card-designs');
        const data = await res.json();
        setCards(data.cards || []);
      } catch (err) {
        console.error('Failed to fetch designs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCards();
  }, []);

  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Institute Card Designs</h1>

        {loading ? (
          <p>Loading...</p>
        ) : cards.length === 0 ? (
          <p>No designs found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cards.map(card => (
              <div key={card.id} className="border p-4 rounded shadow bg-white">
                <h2 className="font-semibold text-lg">{card.name}</h2>
                <p className="text-sm text-gray-600">Admin: {card.admin_name}</p>
                <p className="text-sm text-gray-600">Phone: {card.phone}</p>
                <p className="text-sm text-gray-600">Institution ID: {card.institution_id}</p>
                <div className="mt-2">
                  {card.front_img && (
                    <img src={card.front_img} alt="Front" className="w-full h-48 object-contain mb-2 rounded" />
                  )}
                  {card.back_img && (
                    <img src={card.back_img} alt="Back" className="w-full h-48 object-contain rounded" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
