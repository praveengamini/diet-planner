import React, { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Salad, CheckCircle, Target, Calendar, Clock, Zap, Users, TrendingUp, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const AuthLayout = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  return (
    <div className="min-h-screen bg-white">
      {/* Top Nav Bar */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-white border-b-2 border-orange-400 py-3">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => navigate('/')}
                className="p-2 hover:bg-orange-50 rounded-lg transition-colors duration-200 group -ml-4"
                aria-label="Go back to homepage"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 group-hover:text-orange-500 transition-colors duration-200" />
              </button>

              <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
                <div className="p-2 bg-gradient-to-br from-orange-500 to-orange-400 rounded-lg shadow-md shadow-orange-200">
                  <Salad className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Diet Planner</h1>
                  <p className="text-sm text-orange-500 font-medium">Eat Smart. Live Well.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex min-h-screen pt-[80px]">
        {/* Left Panel */}
        <div className="hidden md:flex md:w-1/2 xl:w-3/5 bg-gradient-to-br from-orange-50 to-orange-100 p-6 lg:p-12 flex-col justify-center">
          <div className="max-w-lg mx-auto">
            <div className="mb-6 lg:mb-8">
              <h2 className="text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900 mb-3 lg:mb-4">
                Achieve Your Health Goals with AI
              </h2>
              <p className="text-base lg:text-lg xl:text-xl text-gray-700 leading-relaxed">
                Let AI craft your perfect meal plan, track your macros, and guide you every step of the way.
              </p>
            </div>

            <div className="space-y-4 lg:space-y-6">
              <div className="flex items-start space-x-3 lg:space-x-4">
                <div className="p-2.5 lg:p-3 bg-gradient-to-br from-orange-500 to-orange-400 rounded-lg flex-shrink-0 shadow-sm shadow-orange-200">
                  <CheckCircle className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1 text-sm lg:text-base">Personalized Meal Plans</h3>
                  <p className="text-gray-600 text-xs lg:text-sm leading-relaxed">
                    Describe your health goal in plain language and AI builds a full weekly meal plan for you instantly
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 lg:space-x-4">
                <div className="p-2.5 lg:p-3 bg-gradient-to-br from-orange-500 to-orange-400 rounded-lg flex-shrink-0 shadow-sm shadow-orange-200">
                  <Target className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1 text-sm lg:text-base">Calorie & Macro Tracking</h3>
                  <p className="text-gray-600 text-xs lg:text-sm leading-relaxed">
                    AI auto-calculates proteins, carbs, and fats for every meal to keep you on track effortlessly
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 lg:space-x-4">
                <div className="p-2.5 lg:p-3 bg-gradient-to-br from-orange-500 to-orange-400 rounded-lg flex-shrink-0 shadow-sm shadow-orange-200">
                  <Calendar className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1 text-sm lg:text-base">Goal-Based Nutrition</h3>
                  <p className="text-gray-600 text-xs lg:text-sm leading-relaxed">
                    Whether losing weight, building muscle, or maintaining — AI adapts your diet plan to match your progress
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 lg:space-x-4">
                <div className="p-2.5 lg:p-3 bg-gradient-to-br from-orange-500 to-orange-400 rounded-lg flex-shrink-0 shadow-sm shadow-orange-200">
                  <Clock className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1 text-sm lg:text-base">Hydration & Habit Tracking</h3>
                  <p className="text-gray-600 text-xs lg:text-sm leading-relaxed">
                    AI reminds you to stay hydrated and builds lasting healthy eating habits synced to your daily routine
                  </p>
                </div>
              </div>
            </div>

            {/* Example Box */}
            <div className="mt-6 lg:mt-8 p-4 lg:p-6 bg-white rounded-lg border-2 border-orange-200 shadow-sm">
              <div className="flex items-center space-x-2 mb-3">
                <Zap className="w-4 h-4 lg:w-5 lg:h-5 text-orange-500" />
                <span className="font-semibold text-gray-900 text-sm lg:text-base">Example in Action</span>
              </div>
              <div className="space-y-2 text-xs lg:text-sm">
                <div className="p-2.5 lg:p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-900">You type:</span>
                  <p className="text-orange-500 italic">"Help me lose 5kg in 2 months with a vegetarian diet"</p>
                </div>
                <div className="text-center text-gray-400">↓</div>
                <div className="p-2.5 lg:p-3 bg-orange-50 rounded-lg">
                  <span className="font-medium text-gray-900">AI creates:</span>
                  <ul className="mt-2 space-y-1 text-gray-700">
                    <li>• Breakfast: Oats & Banana (320 kcal)</li>
                    <li>• Lunch: Chickpea Salad (480 kcal)</li>
                    <li>• Snack: Greek Yogurt (120 kcal)</li>
                    <li>• Dinner: Lentil Soup & Roti (400 kcal)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Auth Form */}
        <div className="w-full md:w-1/2 xl:w-2/5 flex items-center justify-center px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="w-full max-w-sm lg:max-w-md xl:max-w-lg">
            <Outlet />
          </div>
        </div>
      </div>

      {/* Bottom Footer Bar */}
      <div className="bg-orange-50 border-t border-orange-100 py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-6">
              <span className="text-sm text-gray-600 text-center sm:text-left">© 2025 Diet Planner. All rights reserved.</span>
              <div className="flex items-center space-x-4">
                <a
                  onClick={() => navigate('/privacy-policy')}
                  className="text-sm text-orange-500 hover:text-orange-600 cursor-pointer"
                >
                  Privacy Policy
                </a>
                <a
                  onClick={() => navigate('/terms-service')}
                  className="text-sm text-orange-500 hover:text-orange-600 cursor-pointer"
                >
                  Terms of Service
                </a>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>Powered by</span>
              <Salad className="w-4 h-4 text-orange-500" />
              <span className="text-orange-500 font-medium">Smart AI Nutrition</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuthLayout