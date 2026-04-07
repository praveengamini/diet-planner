import React from 'react';
import { Salad, Mail, Phone, Globe, Linkedin, Github } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-orange-100" id="contact">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-400 rounded-xl flex items-center justify-center transform rotate-12 shadow-md shadow-orange-300/40">
                  <Salad className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-400 rounded-full animate-pulse"></div>
              </div>
              <div>
                <span className="text-2xl font-bold text-gray-900">
                  Diet Planner
                </span>
                <div className="text-xs text-orange-500 font-medium">Eat Smart. Live Well.</div>
              </div>
            </div>
            <p className="text-gray-600 mb-6 max-w-md leading-relaxed">
              Experience smarter nutrition with AI that understands your body, 
              automatically crafts personalized meal plans, tracks your macros, 
              and helps you achieve your health goals with intelligent diet guidance.
            </p>
          </div>

          <div>
            <h3 className="text-gray-900 font-semibold mb-4 flex items-center">
              <Salad className="w-4 h-4 mr-2 text-orange-500" />
              AI Features
            </h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-600 hover:text-orange-500 transition-colors duration-200">Personalized Meal Plans</a></li>
              <li><a href="#" className="text-gray-600 hover:text-orange-500 transition-colors duration-200">Calorie & Macro Tracking</a></li>
              <li><a href="#" className="text-gray-600 hover:text-orange-500 transition-colors duration-200">Goal-Based Nutrition</a></li>
              <li><a href="#" className="text-gray-600 hover:text-orange-500 transition-colors duration-200">Hydration Tracking</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-gray-900 font-semibold mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-orange-500" />
                <a href="https://mail.google.com/mail/u/0/?to=luckylashya07@gmail.com&fs=1&tf=cm" target="_blank" className="text-gray-600 hover:text-orange-500 transition-colors duration-200">
                  luckylashya07@gmail.com
                </a>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-orange-500" />
                <a href="tel:+9190595 84349" className="text-gray-600 hover:text-orange-500 transition-colors duration-200">
                  +91 90595 84349
                </a>
              </li>
        
        
              <li className="flex items-center space-x-2">
                <Github className="w-4 h-4 text-orange-500" />
                <a href="https://github.com/saranya01-ctrl" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-orange-500 transition-colors duration-200">
                  GitHub
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-orange-100 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm">
              © 2026 LashyaSaranya. All rights reserved.
            </p>
            <div className="flex items-center mt-4 md:mt-0 space-x-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
              <p className="text-orange-500 text-sm font-medium">Available for Collaboration</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;