import React, { useState, useEffect } from 'react';
import { ChevronDown, MapPin, Compass, Camera, Plane } from 'lucide-react';

export default function Landing() {
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    setIsVisible(true);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = () => {
    const heroSection = document.getElementById('hero-section');
    heroSection?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="w-full bg-slate-950 text-white overflow-hidden">
      {/* SECTION 1: Gallery Section */}
      <section className="min-h-screen bg-gradient-to-b from-teal-900 via-slate-800 to-slate-900 pt-20 pb-16 px-6 lg:px-12">
        <div className={`max-w-7xl mx-auto transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {/* Header */}
          <div className="mb-16">
            <h1 className="text-5xl lg:text-7xl font-light tracking-wider mb-6 text-balance">
              GALLERY
            </h1>
            <p className="text-gray-300 text-lg max-w-2xl leading-relaxed">
              Explore our curated collection of extraordinary travel moments and hidden gems from around the world. Discover the enchanting beauty and captivating allure.
            </p>
          </div>

          {/* Gallery Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {/* Large image */}
            <div className="md:col-span-1 md:row-span-2 group cursor-pointer">
              <div className="h-96 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-lg overflow-hidden relative shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-105">
                <div className="absolute inset-0 bg-black/20 hover:bg-black/10 transition-colors duration-300"></div>
                <div className="absolute inset-0 flex items-center justify-center text-white text-sm font-medium">
                  UNDERWATER WORLD
                </div>
              </div>
            </div>

            {/* Grid items */}
            {[
              { title: 'BEACH VIBES', size: 'h-44' },
              { title: 'TROPICAL FOOD', size: 'h-44' },
              { title: 'ISLAND LIFE', size: 'h-44' },
              { title: 'WATER SPORTS', size: 'h-44' },
              { title: 'RESORT VIEW', size: 'h-44' },
            ].map((item, idx) => (
              <div key={idx} className="group cursor-pointer">
                <div className={`${item.size} bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg overflow-hidden relative shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-105`}>
                  <div className="absolute inset-0 bg-black/20 hover:bg-black/10 transition-colors duration-300"></div>
                  <div className="absolute inset-0 flex items-center justify-center text-white text-sm font-medium text-center px-2">
                    {item.title}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Discover Story Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-12">
            <div>
              <h2 className="text-3xl lg:text-5xl font-light tracking-wide mb-6 text-balance">
                DISCOVER WINGLY STORY
              </h2>
              <p className="text-gray-300 text-base leading-relaxed mb-8">
                Simply a sensory island where the Pacific. A famous tourism hub for pristine tropical surroundings, silky beaches, vibrant nightlife, and fascinating cuisine.
              </p>
              <button className="px-8 py-3 border border-cyan-400 text-cyan-300 hover:bg-cyan-400 hover:text-slate-900 transition-all duration-300 font-medium tracking-wider">
                EXPLORE MORE
              </button>
            </div>
            <div className="h-80 bg-gradient-to-br from-cyan-300 to-emerald-400 rounded-lg shadow-2xl"></div>
          </div>
        </div>
      </section>

      {/* SECTION 2: Hero Divider */}
      <section className="relative h-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-teal-800" style={{ transform: `translateY(${scrollY * 0.5}px)` }}></div>
        <div className="relative h-full flex items-center justify-center">
          <ChevronDown className="w-8 h-8 text-cyan-300 animate-bounce" />
        </div>
      </section>

      {/* SECTION 3: Hero Section */}
      <section id="hero-section" className="min-h-screen bg-gradient-to-b from-teal-800 via-teal-700 to-slate-800 pt-20 pb-20 px-6 lg:px-12 relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-10 w-96 h-96 bg-cyan-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
          <div className="absolute bottom-20 left-10 w-96 h-96 bg-teal-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
            {/* Left Content */}
            <div className={`transition-all duration-1000 ${scrollY > 400 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-20'}`}>
              <div className="mb-4 text-cyan-300 text-sm tracking-widest uppercase">OUR TOUR</div>
              <h2 className="text-6xl lg:text-7xl font-light tracking-wide mb-8 text-balance leading-tight">
                FIND PEACE, STAY FOR WONDER.
              </h2>
              <p className="text-gray-200 text-lg leading-relaxed mb-8 max-w-lg">
                Escape to a tropical island where serenity meets breathtaking beauty and extraordinary adventure unfolds around every horizon.
              </p>
              <button className="px-8 py-3 border border-white text-white hover:bg-white hover:text-teal-700 transition-all duration-300 font-medium tracking-wider">
                BOOK NOW
              </button>
            </div>

            {/* Right Visual - Airplane */}
            <div className={`relative h-96 lg:h-full min-h-96 transition-all duration-1000 ${scrollY > 400 ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-20'}`}>
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-200 via-teal-200 to-blue-300 rounded-3xl shadow-2xl flex items-center justify-center overflow-hidden">
                {/* Airplane Icon Animation */}
                <div className="relative w-full h-full flex items-center justify-center">
                  <Plane className="w-32 h-32 text-teal-700 animate-pulse" style={{ transform: `rotate(-45deg)` }} />
                  <div className="absolute inset-0 bg-gradient-to-t from-teal-700/20 to-transparent"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Beauty Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-20 border-t border-teal-600/30">
            {/* Left Visual */}
            <div className={`h-80 bg-gradient-to-br from-emerald-300 to-cyan-300 rounded-2xl shadow-xl transition-all duration-1000 ${scrollY > 800 ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}></div>

            {/* Right Content */}
            <div className={`transition-all duration-1000 ${scrollY > 800 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <h3 className="text-5xl lg:text-6xl font-light tracking-wide mb-8 text-balance">
                BEAUTY
              </h3>
              <p className="text-gray-200 text-lg leading-relaxed mb-8">
                Discover pristine beaches, lush tropical landscapes, and crystalline waters that create an unforgettable paradise for every traveler.
              </p>
              <div className="flex gap-4">
                <button className="px-6 py-2 bg-cyan-400 text-slate-900 hover:bg-cyan-300 transition-colors duration-300 font-medium tracking-wider">
                  EXPLORE
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: Features Section */}
      <section className="min-h-screen bg-gradient-to-b from-slate-800 via-slate-900 to-slate-950 py-20 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-6xl lg:text-7xl font-light tracking-wider mb-20 text-center text-balance">
            EXPERIENCE THE BEAUTY OF ISLAND WINGLY SHORES
          </h2>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                icon: MapPin,
                title: 'DESTINATIONS',
                description: 'Choose from 50+ handpicked tropical destinations across the Pacific',
              },
              {
                icon: Camera,
                title: 'MOMENTS',
                description: 'Capture unforgettable memories with world-class travel photography experiences',
              },
              {
                icon: Compass,
                title: 'ADVENTURES',
                description: 'Embark on thrilling activities from snorkeling to island hopping',
              },
              {
                icon: Plane,
                title: 'TRANSPORTATION',
                description: 'Seamless travel arrangements with luxury accommodations and transfers included',
              },
            ].map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div
                  key={idx}
                  className={`p-8 bg-gradient-to-br from-teal-900/40 to-cyan-900/40 border border-teal-600/30 rounded-lg hover:border-cyan-400/60 hover:shadow-lg hover:shadow-cyan-400/20 transition-all duration-500 group cursor-pointer transform hover:scale-105 ${
                    scrollY > 1200 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                  }`}
                  style={{ transitionDelay: `${idx * 100}ms` }}
                >
                  <Icon className="w-12 h-12 text-cyan-400 mb-4 group-hover:scale-110 transition-transform duration-300" />
                  <h3 className="text-xl font-semibold tracking-wide mb-3 text-white">{feature.title}</h3>
                  <p className="text-gray-300 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 5: Call to Action */}
      <section className="py-20 px-6 lg:px-12 bg-gradient-to-t from-slate-950 to-slate-800">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl lg:text-6xl font-light tracking-wide mb-8 text-balance">
            Ready to start your adventure?
          </h2>
          <p className="text-gray-300 text-lg mb-12 leading-relaxed">
            Book your dream vacation today and experience the magic of tropical paradise.
          </p>
          <button className="px-12 py-4 bg-gradient-to-r from-cyan-400 to-teal-400 text-slate-900 hover:from-cyan-300 hover:to-teal-300 transition-all duration-300 font-bold tracking-wider text-lg shadow-lg hover:shadow-2xl hover:shadow-cyan-400/50 transform hover:scale-105">
            BOOK YOUR TRIP
          </button>
        </div>
      </section>

      {/* Scroll indicator */}
      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
}
