'use client';
import Image from 'next/image';
import Navbar from './navbar';

export default function HeroSection() {
  return (
    <section className=" min-h-screen px-6 md:px-16 py-6">
      {/* Navbar at the top */}
      <Navbar />

      {/* Hero Content */}
      <div className="max-w-7xl mx-auto flex flex-col-reverse md:flex-row items-center gap-16 w-full mt-12">
        {/* Left Content */}
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-800 leading-tight">
            Maheshwari ID <br />
            <span className="text-5xl md:text-6xl">Card's</span>
          </h1>
          <p className="mt-8 text-lg md:text-xl text-gray-700 max-w-xl">
            This is a well-equipped website to issue Identity Cards to Students,
            Organizations, and Employees. This site has hundreds of rich and
            well-designed Identity cards.
          </p>
        </div>

        {/* Right Image Box */}
        <div className="flex-1 flex justify-center">
          <div className="bg-white p-8 rounded-2xl shadow-xl border-2 border-white max-w-md w-full">
            <h2 className="text-xl md:text-2xl font-semibold text-center text-orange-600 mb-6">
              Identity Cards Management System
            </h2>
            <div className="border-4 border-rose-200 p-2 rounded-md">
              <Image
                src="/images/hero.png"
                alt="ID Cards"
                width={500}
                height={350}
                className="rounded-md object-cover w-full h-auto"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
