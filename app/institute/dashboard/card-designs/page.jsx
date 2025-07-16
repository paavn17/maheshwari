'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import DashboardLayout from '@/components/institute/page-layout';

const Page = () => {
  const [cards, setCards] = useState([]);

  useEffect(() => {
    const fetchCards = async () => {
      try {
        const res = await fetch('/api/institute/card-designs');
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

  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-2xl font-semibold mb-6 text-sky-800">ID Card Designs</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-6">
          {cards.map((card) => (
            <div
              key={card.id}
              className="bg-sky-50 rounded-xl shadow hover:shadow-lg transition overflow-hidden border border-gray-200 p-4"
            >
              <div className="flex justify-center gap-4">
                <div className="relative w-[280px] h-[400px] rounded overflow-hidden">
                  <Image
                    src={card.front_url}
                    alt={`${card.name} Front`}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="relative w-[280px] h-[400px] rounded overflow-hidden">
                  <Image
                    src={card.back_url}
                    alt={`${card.name} Back`}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
              <div className="text-center pt-3 text-sm font-medium text-sky-900">
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