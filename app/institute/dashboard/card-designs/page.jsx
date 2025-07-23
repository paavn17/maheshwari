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
      <div className="p-6  min-h-screen">
        <h1 className="text-3xl font-bold text-orange-700 mb-8 text-center">ID Card Designs</h1>

        {cards.length === 0 ? (
          <p className="text-orange-600 text-sm text-center">No card designs found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-8">
            {cards.map((card) => (
              <div
                key={card.id}
                className="bg-white border border-orange-200 rounded-xl shadow hover:shadow-lg transition duration-200 p-4"
              >
                <div className="grid grid-cols-2 gap-4 justify-items-center">
                  <div className="relative w-[280px] h-[400px] rounded-md overflow-hidden shadow ">
                    <Image
                      src={card.front_url}
                      alt={`${card.name} Front`}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="relative w-[280px] h-[400px] rounded-md overflow-hidden shadow ">
                    <Image
                      src={card.back_url}
                      alt={`${card.name} Back`}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
                <div className="mt-4 text-center text-sm font-semibold text-orange-800 tracking-wide">
                  {card.name}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Page;
