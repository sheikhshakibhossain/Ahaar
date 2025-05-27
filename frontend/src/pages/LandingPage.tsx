import React, { useState, useEffect } from 'react';

export const LandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const stats = [
    { number: '50K+', label: 'Meals Saved', icon: '❤️' },
    { number: '12K+', label: 'Active Users', icon: '👥' },
    { number: '95%', label: 'Success Rate', icon: '🏆' },
    { number: '24/7', label: 'Availability', icon: '🕐' }
  ];

  const features = [
    {
      icon: '⚡',
      title: 'Instant Matching',
      description: 'AI-powered system connects donors with recipients in real-time',
      color: 'from-yellow-400 to-orange-500'
    },
    {
      icon: '📍',
      title: 'Location-Based',
      description: 'Find donations and recipients within your neighborhood',
      color: 'from-blue-400 to-purple-500'
    },
    {
      icon: '🛡️',
      title: 'Safe & Secure',
      description: 'Verified users and secure platform for worry-free donations',
      color: 'from-green-400 to-teal-500'
    },
    {
      icon: '🌍',
      title: 'Global Impact',
      description: 'Join a worldwide movement to reduce food waste',
      color: 'from-pink-400 to-red-500'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Restaurant Owner',
      content: 'This platform has helped us donate over 1000 meals instead of throwing them away. Amazing impact!',
      rating: 5
    },
    {
      name: 'Marcus Johnson',
      role: 'Community Leader',
      content: 'Easy to use and incredibly effective. Our community center receives regular donations now.',
      rating: 5
    },
    {
      name: 'Elena Rodriguez',
      role: 'Home Baker',
      content: 'I love being able to share my extra baked goods with families who need them most.',
      rating: 5
    }
  ];

  return (
    <div className="bg-gray-950 text-white overflow-hidden">
      {/* Navigation */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${
        scrollY > 50 ? 'bg-gray-900/95 backdrop-blur-lg border-b border-gray-800' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-lg flex items-center justify-center">
                <span className="text-lg">🌱</span>
              </div>
              <span className="text-xl font-bold">FoodShare</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-300 hover:text-white transition-colors">Features</a>
              <a href="#impact" className="text-gray-300 hover:text-white transition-colors">Impact</a>
              <a href="#testimonials" className="text-gray-300 hover:text-white transition-colors">Stories</a>
              <button className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-2 rounded-full hover:shadow-lg hover:shadow-emerald-500/25 transition-all duration-300">
                Get Started
              </button>
            </div>

            <button 
              className="md:hidden text-2xl"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-40 bg-gray-900/95 backdrop-blur-lg md:hidden">
          <div className="flex flex-col items-center justify-center h-full space-y-8 text-xl">
            <a href="#features" onClick={() => setIsMenuOpen(false)}>Features</a>
            <a href="#impact" onClick={() => setIsMenuOpen(false)}>Impact</a>
            <a href="#testimonials" onClick={() => setIsMenuOpen(false)}>Stories</a>
            <button className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-8 py-3 rounded-full">
              Get Started
            </button>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-16">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-pink-400/10 to-orange-400/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-full mb-8 backdrop-blur-sm">
            <span className="text-emerald-400 text-sm font-medium">🌱 Join 50,000+ Food Heroes</span>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-8 leading-tight">
            <span className="block text-white">Turn Food Waste</span>
            <span className="block bg-gradient-to-r from-emerald-400 via-teal-400 to-blue-400 bg-clip-text text-transparent animate-pulse">
              Into Hope
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            Connect surplus food with hungry communities. Every donation creates a ripple of positive impact 
            in your neighborhood and beyond.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
            <button className="group bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-2xl hover:shadow-emerald-500/25 transition-all duration-300 flex items-center gap-3 hover:scale-105">
              Start Donating
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </button>
            <button className="group border-2 border-gray-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:border-emerald-400 hover:bg-emerald-400/10 transition-all duration-300 flex items-center gap-3">
              Find Donations
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group cursor-pointer">
                <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 hover:border-emerald-500/50 transition-all duration-300 hover:scale-105">
                  <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">{stat.icon}</div>
                  <div className="text-3xl font-bold text-white mb-1">{stat.number}</div>
                  <div className="text-gray-400 text-sm">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Why Choose FoodShare?
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Advanced technology meets compassionate community action
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group relative">
                <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/80 backdrop-blur-sm border border-gray-700/50 rounded-3xl p-8 hover:border-gray-600 transition-all duration-500 hover:scale-105 hover:shadow-2xl">
                  <div className={`w-14 h-14 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <span className="text-2xl">{feature.icon}</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">{feature.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{feature.description}</p>
                </div>
                <div className={`absolute -inset-0.5 bg-gradient-to-r ${feature.color} rounded-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 -z-10`}></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section id="impact" className="py-24 bg-gradient-to-br from-emerald-900/20 to-teal-900/20 relative">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-emerald-500/5 via-transparent to-teal-500/5"></div>
          <div className="absolute top-10 left-10 w-2 h-2 bg-emerald-400/20 rounded-full"></div>
          <div className="absolute top-20 right-20 w-1 h-1 bg-teal-400/20 rounded-full"></div>
          <div className="absolute bottom-20 left-20 w-1 h-1 bg-emerald-400/20 rounded-full"></div>
          <div className="absolute bottom-10 right-10 w-2 h-2 bg-teal-400/20 rounded-full"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-bold mb-8">
              <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                Real Impact, Real Stories
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gradient-to-br from-gray-800/40 to-gray-900/60 backdrop-blur-sm border border-gray-700/50 rounded-3xl p-8 hover:border-emerald-500/30 transition-all duration-300 hover:scale-105">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="text-yellow-400 text-xl">⭐</span>
                  ))}
                </div>
                <p className="text-gray-300 mb-6 leading-relaxed">"{testimonial.content}"</p>
                <div>
                  <div className="font-semibold text-white">{testimonial.name}</div>
                  <div className="text-emerald-400 text-sm">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <div className="inline-flex items-center gap-4 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-full px-8 py-4 backdrop-blur-sm">
              <span className="text-2xl">❤️</span>
              <span className="text-lg font-medium">1,000,000+ meals saved from waste</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/10 via-teal-600/10 to-blue-600/10"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-gray-900"></div>
        
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative z-10">
          <h2 className="text-5xl md:text-7xl font-black mb-8">
            <span className="bg-gradient-to-r from-white via-emerald-200 to-teal-200 bg-clip-text text-transparent">
              Ready to Change Lives?
            </span>
          </h2>
          <p className="text-xl md:text-2xl text-gray-300 mb-12 leading-relaxed">
            Join thousands of food heroes making a difference every day. Your next meal could feed a family.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <button className="group bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-10 py-5 rounded-full text-xl font-bold hover:shadow-2xl hover:shadow-emerald-500/25 transition-all duration-300 hover:scale-105 flex items-center justify-center gap-3">
              Donate Food
              <span className="text-2xl group-hover:scale-110 transition-transform">❤️</span>
            </button>
            <button className="group bg-gradient-to-r from-purple-500 to-pink-500 text-white px-10 py-5 rounded-full text-xl font-bold hover:shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 hover:scale-105 flex items-center justify-center gap-3">
              Receive Help
              <span className="text-2xl group-hover:scale-110 transition-transform">👥</span>
            </button>
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-400 text-sm">
              🔒 Safe, secure, and completely free to use
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-lg flex items-center justify-center">
                <span className="text-lg">🌱</span>
              </div>
              <span className="text-xl font-bold">FoodShare</span>
            </div>
            <div className="text-gray-400 text-sm">
              © 2025 FoodShare. Making the world a better place, one meal at a time.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

// export default LandingPage;