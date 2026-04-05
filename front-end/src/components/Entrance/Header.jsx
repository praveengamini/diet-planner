import React, { useState } from 'react';
import { Salad, Menu, Zap, Contact, Star, ChartNoAxesCombined, BrainCircuit } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../../components/ui/sheet';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 w-full bg-white/95 backdrop-blur-md border-b border-orange-200 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">

          {/* Logo */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-400 rounded-xl flex items-center justify-center transform rotate-12 shadow-md shadow-orange-300/40">
                <Salad className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-400 rounded-full animate-pulse"></div>
            </div>
            <div>
              <span className="text-xl font-bold text-gray-900">
                Diet Planner
              </span>
              <div className="text-xs text-orange-500 font-medium">Eat Smart. Live Well.</div>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#demo" className="text-gray-600 hover:text-orange-500 transition-colors duration-200">Try Demo</a>
            <a href="#features" className="text-gray-600 hover:text-orange-500 transition-colors duration-200">AI Features</a>
            <a href="#contact" className="text-gray-600 hover:text-orange-500 transition-colors duration-200">Contact Us</a>
            <button
              className="bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-400 hover:to-orange-300 cursor-pointer text-white font-semibold px-4 py-2 rounded-md transition-all duration-200 shadow-sm shadow-orange-300/40"
              onClick={() => navigate('/auth/login')}
            >
              Login
            </button>
          </nav>

          {/* Mobile Nav */}
          <div className="md:hidden flex items-center space-x-3">
            <button
              className="bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-400 hover:to-orange-300 text-white font-semibold px-3 py-2 rounded-md transition-all duration-200 text-sm shadow-sm shadow-orange-300/40"
              onClick={() => navigate('/auth/login')}
            >
              Login
            </button>

            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <button className="text-gray-900 hover:text-orange-500 transition-colors duration-200 p-2 hover:bg-orange-50 rounded-lg">
                  <Menu className="w-6 h-6" />
                </button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-[320px] sm:w-[400px] bg-white border-l border-orange-300"
              >
                <SheetHeader className="pb-6 border-b border-gray-200">
                  <SheetTitle className="flex items-center space-x-3 justify-start">
                    <div className="relative">
                      <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-300 rounded-xl flex items-center justify-center transform rotate-12 shadow-lg shadow-orange-300/30">
                        <Salad className="w-5 h-5 text-white" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-br from-orange-500 to-orange-400 rounded-full animate-pulse shadow-sm"></div>
                    </div>
                    <div>
                      <span className="text-xl font-bold text-gray-900">Diet Planner</span>
                      <div className="text-xs text-orange-500 font-semibold">Eat Smart. Live Well.</div>
                    </div>
                  </SheetTitle>
                </SheetHeader>

                <nav className="flex flex-col space-y-4 mt-8">
                  <a
                    href="#demo"
                    className="group flex items-center space-x-3 text-gray-700 hover:text-orange-500 transition-all duration-300 text-lg font-medium py-3 px-4 rounded-lg hover:bg-orange-50 hover:translate-x-1"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Zap className="w-5 h-5 text-orange-500 group-hover:text-orange-400 transition-colors duration-300" />
                    <span>Try Demo</span>
                  </a>

                  <a
                    href="#features"
                    className="group flex items-center space-x-3 text-gray-700 hover:text-orange-500 transition-all duration-300 text-lg font-medium py-3 px-4 rounded-lg hover:bg-orange-50 hover:translate-x-1"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <BrainCircuit className="w-5 h-5 text-orange-500 group-hover:text-orange-400 transition-colors duration-300" />
                    <span>AI Features</span>
                  </a>

                  <a
                    href="#contact"
                    className="group flex items-center space-x-3 text-gray-700 hover:text-orange-500 transition-all duration-300 text-lg font-medium py-3 px-4 rounded-lg hover:bg-orange-50 hover:translate-x-1"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Contact className="w-5 h-5 text-orange-500 group-hover:text-orange-400 transition-colors duration-300" />
                    <span>Contact Us</span>
                  </a>
                </nav>
              </SheetContent>
            </Sheet>
          </div>

        </div>
      </div>
    </header>
  );
};

export default Header;