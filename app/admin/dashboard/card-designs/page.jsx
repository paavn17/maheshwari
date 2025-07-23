'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import DashboardLayout from '@/components/admin/page-layout';
import { Trash2 } from 'lucide-react';

const Page = () => {
  const [cards, setCards] = useState([]);

  useEffect(() => {
    const fetchCards = async () => {
      try {
        const res = await fetch('/api/superadmin/card-designs');
        const data = await res.json();
        if (data.cards) {
          setCards(data.cards);
        } else {
          console.error('Failed to load cards:', data.error);
        }
      } catch (err) {
        console.error('Error fetching card designs:', err);
      }
    };

    fetchCards();
  }, []);

  const handleDelete = async (id) => {
    const confirmed = confirm('Are you sure you want to delete this card design?');
    if (!confirmed) return;

    try {
      const res = await fetch('/api/superadmin/card-designs/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Delete failed');

      setCards((prev) => prev.filter((card) => card.id !== id));
    } catch (err) {
      console.error('Delete failed:', err);
      alert('❌ Failed to delete design. Check console.');
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-2xl font-semibold mb-6 text-orange-700">ID Card Designs</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-6">
          {cards.map((card) => (
            <div
              key={card.id}
              className="relative rounded-xl shadow hover:shadow-lg transition overflow-hidden border border-gray-200 p-4 pt-12"
            >
              {/* Delete Button */}
              <button
                onClick={() => handleDelete(card.id)}
                className="absolute top-2 right-2 z-10 p-1 bg-white rounded-full shadow-md text-red-600 hover:text-red-800 transition"
                title="Delete"
              >
                <Trash2 size={18} />
              </button>

              {/* Images */}
              <div className="flex justify-center gap-4">
                <div className="relative w-[280px] h-[400px] rounded overflow-hidden border border-gray-300">
                  <Image
                    src={card.front_url}
                    alt={`${card.name} Front`}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="relative w-[280px] h-[400px] rounded overflow-hidden border border-gray-300">
                  <Image
                    src={card.back_url}
                    alt={`${card.name} Back`}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>

              {/* Card Name */}
              <div className="text-center pt-3 text-sm font-medium text-orange-800">
                {card.name}
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Page;
