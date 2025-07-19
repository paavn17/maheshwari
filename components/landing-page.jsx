'use client';
import Image from 'next/image';
import Navbar from './navbar';

export default function HeroSection() {
  return (
    <section className="min-h-screen bg-gradient-to-br from-orange-50 to-white px-6 md:px-16 py-6">
      {/* Navbar at the top */}
      <Navbar />
      
      {/* Hero Content */}
      <div className="max-w-7xl mx-auto flex flex-col-reverse lg:flex-row items-center gap-16 w-full mt-12">
        {/* Left Content */}
        <div className="flex-1 text-center md:text-left space-y-8">
          <div className="inline-flex items-center px-4 py-2 bg-orange-100 text-orange-800 rounded-full text-sm font-medium mb-6">
            🆔 Professional ID Solutions
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 leading-tight">
            Maheshwari ID
            <br />
            <span className="text-orange-400">Card's</span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl leading-relaxed">
            Transform your organization with our premium ID card solutions. 
            Create professional identity cards for students, employees, and organizations 
            with <span className="text-orange-600 font-semibold">hundreds of beautifully designed templates</span>.
          </p>
          
          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 pt-8">
            <div className="text-center sm:text-left">
              <div className="text-3xl font-bold text-orange-400">500+</div>
              <div className="text-gray-500 text-sm font-medium">ID Templates</div>
            </div>
            <div className="text-center sm:text-left">
              <div className="text-3xl font-bold text-orange-400">10K+</div>
              <div className="text-gray-500 text-sm font-medium">Happy Clients</div>
            </div>
            <div className="text-center sm:text-left">
              <div className="text-3xl font-bold text-orange-400">24/7</div>
              <div className="text-gray-500 text-sm font-medium">Support</div>
            </div>
          </div>
        </div>
        
        {/* Right Image Box */}
        <div className="flex-1 flex justify-end">
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 max-w-md w-full">
            {/* Header with icon */}
            <div className="flex items-center justify-center mb-6">
              <div className="bg-orange-400 p-3 rounded-xl">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V4a2 2 0 114 0v2m-4 0a2 2 0 104 0m-4 0v2m4-2v2"></path>
                </svg>
              </div>
            </div>
            
            <h2 className="text-xl md:text-2xl font-bold text-center text-gray-800 mb-8">
              Identity Cards Management System
            </h2>
            
            {/* Image container */}
            <div className="border-4 border-orange-200 p-3 rounded-xl bg-orange-50">
              <Image
                src="/images/hero.png"
                alt="Professional ID Cards Collection"
                width={500}
                height={400}
                className="rounded-lg object-cover"
              />
            </div>
            
            {/* Feature badges */}
            <div className="flex flex-wrap gap-2 mt-6 justify-center">
              <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
                Professional Design
              </span>
              <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
                Quick Delivery
              </span>
              <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
                Secure
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}