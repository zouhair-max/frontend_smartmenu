import React, { useState } from 'react';
import { Utensils, QrCode, Smartphone, TrendingUp, Users, Clock, CheckCircle, Menu, X, ChevronRight, Star, Zap, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const features = [
    {
      icon: <QrCode className="w-8 h-8" />,
      title: "QR Code Menu",
      description: "Customers scan and browse your menu instantly on their phones"
    },
    {
      icon: <Smartphone className="w-8 h-8" />,
      title: "Mobile Optimized",
      description: "Perfect viewing experience on any device, anywhere"
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Real-time Updates",
      description: "Update prices and items instantly across all menus"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Customer Insights",
      description: "Track popular items and customer preferences"
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: "Save Time",
      description: "No more printing costs or outdated paper menus"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Secure & Reliable",
      description: "Your data is protected with enterprise-grade security"
    }
  ];

  const benefits = [
    "Eliminate printing costs",
    "Update menu in seconds",
    "Eco-friendly solution",
    "Multi-language support",
    "Beautiful menu designs",
    "24/7 customer access"
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      restaurant: "Bella Italia",
      rating: 5,
      text: "Digital Menu transformed our customer experience. Updates are instant and our customers love the convenience!"
    },
    {
      name: "Marcus Chen",
      restaurant: "Fusion Bistro",
      rating: 5,
      text: "We've saved thousands in printing costs and can change our menu seasonally with just a few clicks."
    },
    {
      name: "Elena Rodriguez",
      restaurant: "Casa Tapas",
      rating: 5,
      text: "The QR code system is so easy. Our staff loves it and customers find it modern and professional."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                  <Utensils className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-800">Digital Menu</span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-orange-500 transition-colors">Features</a>
              <a href="#benefits" className="text-gray-600 hover:text-orange-500 transition-colors">Benefits</a>
              <a href="#testimonials" className="text-gray-600 hover:text-orange-500 transition-colors">Testimonials</a>
              <a href="#pricing" className="text-gray-600 hover:text-orange-500 transition-colors">Pricing</a>
            </div>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              <Link
                to="/login"
                className="text-gray-700 hover:text-orange-500 font-medium transition-colors"
              >
                Se connecter
              </Link>
              <Link
                to="/signup"
                className="bg-orange-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-orange-600 transition-all"
              >
                S'inscrire
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-gray-600"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <div className="px-4 py-4 space-y-3">
              <a href="#features" className="block text-gray-600 hover:text-orange-500 py-2">Features</a>
              <a href="#benefits" className="block text-gray-600 hover:text-orange-500 py-2">Benefits</a>
              <a href="#testimonials" className="block text-gray-600 hover:text-orange-500 py-2">Testimonials</a>
              <a href="#pricing" className="block text-gray-600 hover:text-orange-500 py-2">Pricing</a>
              <div className="pt-4 border-t border-gray-200 space-y-2">
                <Link to="/login" className="block text-center bg-gray-100 text-gray-700 px-6 py-2 rounded-lg font-medium">
                  Se connecter
                </Link>
                <aLink to="/signup" className="block text-center bg-orange-500 text-white px-6 py-2 rounded-lg font-medium">
                  S'inscrire
                </aLink>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-orange-50 via-white to-amber-50 py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div>
              <div className="inline-flex items-center bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Zap className="w-4 h-4 mr-2" />
                Modern Restaurant Solution
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Welcome to the Future of
                <span className="text-orange-500"> Digital Dining</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Transform your restaurant with QR code menus. Eliminate printing costs, update instantly, and provide a seamless dining experience.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="/auth/signup"
                  className="inline-flex items-center justify-center bg-orange-500 text-white px-8 py-4 rounded-lg font-medium text-lg hover:bg-orange-600 transition-all shadow-lg hover:shadow-xl"
                >
                  Start Free Trial
                  <ChevronRight className="w-5 h-5 ml-2" />
                </a>
                <a
                  href="#features"
                  className="inline-flex items-center justify-center bg-white text-gray-700 px-8 py-4 rounded-lg font-medium text-lg hover:bg-gray-50 transition-all border-2 border-gray-200"
                >
                  Learn More
                </a>
              </div>
              <div className="mt-8 flex items-center space-x-8">
                <div>
                  <div className="text-3xl font-bold text-gray-900">500+</div>
                  <div className="text-sm text-gray-600">Restaurants</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900">50K+</div>
                  <div className="text-sm text-gray-600">Daily Scans</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900">4.9★</div>
                  <div className="text-sm text-gray-600">Rating</div>
                </div>
              </div>
            </div>

            {/* Right Content - Visual */}
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-8">
                <div className="bg-gradient-to-br from-orange-100 to-amber-100 rounded-xl p-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                        <Utensils className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="font-bold text-gray-800">Restaurant Demo</div>
                        <div className="text-sm text-gray-600">View Menu</div>
                      </div>
                    </div>
                    <QrCode className="w-16 h-16 text-orange-500" />
                  </div>
                  <div className="bg-white rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-800">Margherita Pizza</span>
                      <span className="text-orange-500 font-bold">$12.99</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-800">Caesar Salad</span>
                      <span className="text-orange-500 font-bold">$8.99</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-800">Pasta Carbonara</span>
                      <span className="text-orange-500 font-bold">$14.99</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">100%</div>
                    <div className="text-sm text-gray-600">Digital</div>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">24/7</div>
                    <div className="text-sm text-gray-600">Available</div>
                  </div>
                </div>
              </div>
              {/* Floating badges */}
              <div className="absolute -top-4 -left-4 bg-white rounded-lg shadow-lg p-3 hidden lg:block">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-sm font-medium">Easy Setup</span>
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 bg-white rounded-lg shadow-lg p-3 hidden lg:block">
                <div className="flex items-center space-x-2">
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  <span className="text-sm font-medium">Loved by Chefs</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Powerful Features</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to modernize your restaurant menu
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-gradient-to-br from-orange-50 to-white p-8 rounded-xl border border-orange-100 hover:shadow-lg transition-all">
                <div className="w-16 h-16 bg-orange-100 rounded-lg flex items-center justify-center text-orange-500 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 px-4 bg-gradient-to-br from-orange-50 to-amber-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Why Choose Digital Menu?</h2>
              <p className="text-xl text-gray-600 mb-8">
                Join hundreds of restaurants already saving time and money with our digital solution.
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="space-y-6">
                <div className="border-l-4 border-orange-500 pl-4">
                  <div className="text-3xl font-bold text-gray-900 mb-1">90%</div>
                  <div className="text-gray-600">Reduction in menu printing costs</div>
                </div>
                <div className="border-l-4 border-orange-500 pl-4">
                  <div className="text-3xl font-bold text-gray-900 mb-1">5 min</div>
                  <div className="text-gray-600">Average setup time</div>
                </div>
                <div className="border-l-4 border-orange-500 pl-4">
                  <div className="text-3xl font-bold text-gray-900 mb-1">Instant</div>
                  <div className="text-gray-600">Menu updates across all tables</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Loved by Restaurants</h2>
            <p className="text-xl text-gray-600">See what our customers have to say</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white border-2 border-gray-100 rounded-xl p-6 hover:border-orange-200 hover:shadow-lg transition-all">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">"{testimonial.text}"</p>
                <div className="border-t border-gray-100 pt-4">
                  <div className="font-bold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-600">{testimonial.restaurant}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-orange-500 to-amber-500">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Restaurant?
          </h2>
          <p className="text-xl text-orange-100 mb-8">
            Join 500+ restaurants already using Digital Menu. Start your free trial today!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/auth/signup"
              className="inline-flex items-center justify-center bg-white text-orange-500 px-8 py-4 rounded-lg font-medium text-lg hover:bg-gray-50 transition-all shadow-lg"
            >
              Start Free Trial
              <ChevronRight className="w-5 h-5 ml-2" />
            </a>
            <a
              href="/auth/login"
              className="inline-flex items-center justify-center bg-transparent text-white border-2 border-white px-8 py-4 rounded-lg font-medium text-lg hover:bg-white hover:text-orange-500 transition-all"
            >
              Sign In
            </a>
          </div>
          <p className="text-orange-100 text-sm mt-6">No credit card required • Free 14-day trial</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                  <Utensils className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold">Digital Menu</span>
              </div>
              <p className="text-gray-400">
                Simplifying restaurant experiences, one QR code at a time.
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-orange-400">Features</a></li>
                <li><a href="#pricing" className="hover:text-orange-400">Pricing</a></li>
                <li><a href="#" className="hover:text-orange-400">Demo</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-orange-400">About Us</a></li>
                <li><a href="#" className="hover:text-orange-400">Contact</a></li>
                <li><a href="#" className="hover:text-orange-400">Blog</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Legal</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-orange-400">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-orange-400">Terms of Service</a></li>
                <li><a href="#" className="hover:text-orange-400">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>© 2024 Digital Menu. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}