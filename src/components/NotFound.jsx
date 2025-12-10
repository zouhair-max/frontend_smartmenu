import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, Search, AlertCircle } from 'lucide-react';
import './NotFound.css';

const NotFound = () => {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Floating Particles Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => {
          const size = Math.random() * 60 + 20;
          const left = Math.random() * 100;
          const top = Math.random() * 100;
          const delay = Math.random() * 2;
          const duration = Math.random() * 10 + 10;
          
          return (
            <div
              key={i}
              className="particle"
              style={{
                width: `${size}px`,
                height: `${size}px`,
                left: `${left}%`,
                top: `${top}%`,
                animationDelay: `${delay}s`,
                animationDuration: `${duration}s`,
              }}
            />
          );
        })}
      </div>

      <div className="max-w-2xl w-full text-center relative z-10">
        {/* Animated 404 Text */}
        <div className="relative mb-8">
          <h1
            className={`text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 transition-all duration-1000 float-animation ${
              mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`}
            style={{
              textShadow: '0 0 40px rgba(251, 146, 60, 0.3)',
            }}
          >
            404
          </h1>
        </div>

        {/* Animated Icon */}
        <div
          className={`mb-6 flex justify-center transition-all duration-1000 delay-300 ${
            mounted ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 rotate-45 scale-0'
          }`}
        >
          <div className="relative">
            <AlertCircle className="w-24 h-24 text-orange-500 animate-pulse" />
            <div className="absolute inset-0 rounded-full bg-orange-400 opacity-20 animate-ping" />
          </div>
        </div>

        {/* Error Message */}
        <div
          className={`space-y-4 mb-8 transition-all duration-1000 delay-500 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            Page Not Found
          </h2>
          <p className="text-lg text-gray-600 max-w-md mx-auto">
            Oops! The page you're looking for seems to have wandered off. 
            It might have been moved, deleted, or perhaps it never existed.
          </p>
        </div>

        {/* Action Buttons */}
        <div
          className={`flex flex-col sm:flex-row gap-4 justify-center items-center transition-all duration-1000 delay-700 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <button
            onClick={() => navigate('/')}
            className="group relative px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
              <Home className="w-5 h-5" />
              Go Home
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>

          <button
            onClick={() => navigate(-1)}
            className="group relative px-8 py-4 bg-white text-gray-800 font-semibold rounded-xl border-2 border-gray-300 hover:border-orange-500 shadow-md hover:shadow-xl transform hover:scale-105 transition-all duration-300"
          >
            <span className="flex items-center gap-2">
              <ArrowLeft className="w-5 h-5" />
              Go Back
            </span>
          </button>

          <button
            onClick={() => navigate('/dashboard')}
            className="group relative px-8 py-4 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 shadow-md hover:shadow-xl transform hover:scale-105 transition-all duration-300"
          >
            <span className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Dashboard
            </span>
          </button>
        </div>

        {/* Decorative Elements */}
        <div className="mt-16 flex justify-center gap-2">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="w-3 h-3 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 bounce-dot"
              style={{
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default NotFound;

