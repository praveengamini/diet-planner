import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Salad, Zap, Calendar, Target, CheckCircle, Apple, Flame, Droplets, Scale } from 'lucide-react';
import Header from './Header';
import Footer from './Footer';

const AIDemo = () => {
  const [userInput, setUserInput] = useState("Help me lose 5kg in 2 months with a balanced diet");
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiResponse, setAiResponse] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById('ai-demo');
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [isVisible]);

  const processTask = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setAiResponse({
        breakdown: [
          { meal: "Breakfast – Oats & Fruits", calories: "320 kcal", time: "7:00 AM", tags: ["fiber", "low-fat"] },
          { meal: "Mid-Morning Snack – Nuts & Seeds", calories: "150 kcal", time: "10:30 AM", tags: ["protein", "healthy-fat"] },
          { meal: "Lunch – Grilled Chicken Salad", calories: "480 kcal", time: "1:00 PM", tags: ["high-protein", "greens"] },
          { meal: "Evening Snack – Greek Yogurt", calories: "120 kcal", time: "4:30 PM", tags: ["probiotic", "calcium"] },
          { meal: "Dinner – Steamed Veggies & Lentils", calories: "380 kcal", time: "7:30 PM", tags: ["light", "fiber"] }
        ]
      });
      setIsProcessing(false);
    }, 2000);
  };

  return (
    <div
      id="ai-demo"
      className={`bg-orange-50 rounded-2xl p-8 border border-orange-100 hover:border-orange-400 transition-all duration-300 ${isVisible ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'}`}
    >
      <div className="flex items-center mb-6">
        <Salad className="w-6 h-6 text-orange-500 mr-3" />
        <h3 className="text-xl font-semibold text-gray-900">Demo AI Diet Plan Generator</h3>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-gray-700 text-sm font-medium mb-2">
            Tell AI your health goal:
          </label>
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            className="w-full bg-white border border-orange-200 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-orange-500 focus:outline-none transition-colors duration-200"
            placeholder="e.g., Help me build muscle with a high-protein diet"
            readOnly
          />
        </div>

        <button
          onClick={processTask}
          disabled={isProcessing}
          className="w-full bg-gradient-to-r from-orange-500 to-orange-400 text-white px-6 py-3 rounded-lg font-semibold hover:from-orange-400 hover:to-orange-300 transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 flex items-center justify-center space-x-2 shadow-md shadow-orange-200"
        >
          {isProcessing ? (
            <>
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              <span>AI is crafting your plan...</span>
            </>
          ) : (
            <>
              <Zap className="w-4 h-4" />
              <span>Generate My Diet Plan</span>
            </>
          )}
        </button>

        {aiResponse && (
          <div className="mt-6 space-y-3">
            <h4 className="text-gray-900 font-semibold flex items-center">
              <CheckCircle className="w-4 h-4 text-orange-500 mr-2" />
              AI Generated Meal Plan:
            </h4>
            {aiResponse.breakdown.map((item, index) => (
              <div key={index} className="bg-white rounded-lg p-4 border border-orange-100 hover:border-orange-300 transition-colors duration-200">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-gray-900 font-medium">{item.meal}</span>
                  <span className="px-2 py-1 rounded text-xs font-semibold bg-orange-100 text-orange-600">
                    {item.calories}
                  </span>
                </div>
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center text-gray-500">
                    <Calendar className="w-3 h-3 mr-1" />
                    {item.time}
                  </div>
                  <div className="flex items-center space-x-1">
                    {item.tags.map((tag, tagIndex) => (
                      <span key={tagIndex} className="bg-orange-500/10 text-orange-500 px-2 py-1 rounded text-xs">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const LandingPage = () => {
  const dispatch = useDispatch();

  const [currentFeature, setCurrentFeature] = useState(0);
  const [visibleSections, setVisibleSections] = useState({});

  const aiFeatures = [
    {
      icon: Salad,
      title: "Personalized Meal Plans",
      desc: "AI crafts meal plans tailored to your body type, goals, and food preferences",
      example: '"Lose weight vegetarian" → 7-day balanced meal plan instantly'
    },
    {
      icon: Target,
      title: "Calorie & Macro Tracking",
      desc: "AI auto-calculates calories, proteins, carbs and fats for every meal",
      example: 'Track macros effortlessly with smart food recognition'
    },
    {
      icon: Flame,
      title: "Goal-Based Nutrition",
      desc: "Whether it's weight loss, muscle gain or maintenance — AI adapts your diet",
      example: '"Bulk up" → high-protein plan with calorie surplus schedule'
    },
    {
      icon: Droplets,
      title: "Hydration & Habit Tracking",
      desc: "AI reminds you to stay hydrated and builds healthy eating habits over time",
      example: 'Smart reminders synced to your daily routine and lifestyle'
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % aiFeatures.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const sectionId = entry.target.id;
          if (entry.isIntersecting && !visibleSections[sectionId]) {
            setVisibleSections(prev => ({ ...prev, [sectionId]: true }));
          }
        });
      },
      { threshold: 0.1 }
    );

    const sections = document.querySelectorAll('[data-scroll-animate]');
    sections.forEach((section) => observer.observe(section));
    return () => sections.forEach((section) => observer.unobserve(section));
  }, [visibleSections]);

  return (
    <div className="min-h-screen">
      <style jsx>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInLeft {
          from { opacity: 0; transform: translateX(-30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeInRight {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-fade-in-up { animation: fadeInUp 0.8s ease-out forwards; }
        .animate-fade-in-left { animation: fadeInLeft 0.8s ease-out forwards; }
        .animate-fade-in-right { animation: fadeInRight 0.8s ease-out forwards; }
      `}</style>

      <Header />

      {/* Hero Section */}
      <section className="relative pt-20 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-white to-orange-400/5"></div>
        <div className="absolute top-20 left-20 w-72 h-72 bg-orange-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-orange-300/10 rounded-full blur-3xl animate-pulse delay-1000"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
          <div className="text-center">
            <div className="inline-flex items-center bg-orange-500/10 border border-orange-400/30 rounded-full px-6 py-2 mb-8">
              <Zap className="w-4 h-4 text-orange-500 mr-2" />
              <span className="text-orange-500 font-medium text-sm">Powered by Smart AI Nutrition</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Eat Better.
              <span className="block text-orange-500">
                Feel Stronger.
              </span>
              <span className="block text-gray-900">Live Longer.</span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
              Tell our AI your health goals and get a personalized diet plan in seconds —
              complete with meal timings, calorie counts, macro tracking, and smart hydration reminders.
            </p>

            {/* AI Features Preview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {aiFeatures.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={index}
                    className={`p-6 rounded-2xl border transition-all duration-500 transform hover:scale-105 ${
                      currentFeature === index
                        ? 'bg-orange-500/10 border-orange-400 shadow-lg shadow-orange-300/30'
                        : 'bg-gray-50 border-gray-200 hover:border-orange-300'
                    }`}
                  >
                    <Icon className={`w-8 h-8 mb-4 mx-auto transition-colors duration-300 ${
                      currentFeature === index ? 'text-orange-500' : 'text-gray-400'
                    }`} />
                    <h3 className="text-gray-900 font-semibold mb-2 text-sm">{feature.title}</h3>
                    <p className="text-gray-600 text-xs mb-3">{feature.desc}</p>
                    <div className={`text-xs italic transition-colors duration-300 ${
                      currentFeature === index ? 'text-orange-500' : 'text-gray-400'
                    }`}>
                      {feature.example}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* AI Demo Section */}
      <section id="demo" className="py-20 bg-gradient-to-r from-orange-500/5 to-transparent">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            id="demo-header"
            data-scroll-animate
            className={`text-center mb-12 ${visibleSections['demo-header'] ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'}`}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              See AI Nutrition in Action
            </h2>
            <p className="text-xl text-gray-600">
              Experience how our AI builds your perfect diet plan instantly
            </p>
          </div>
          <AIDemo />
        </div>
      </section>

      {/* AI Features Detail */}
      <section id="features" className="py-20 bg-gradient-to-br from-orange-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            id="features-header"
            data-scroll-animate
            className={`text-center mb-16 ${visibleSections['features-header'] ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'}`}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              AI-Powered Diet Features
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need to eat smart and reach your health goals
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div
              id="features-left"
              data-scroll-animate
              className={`space-y-8 ${visibleSections['features-left'] ? 'animate-fade-in-left' : 'opacity-0 translate-x-[-30px]'}`}
            >
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Salad className="w-6 h-6 text-orange-500" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Personalized Meal Plans</h3>
                  <p className="text-gray-600">
                    Describe your health goal and dietary preferences — AI instantly generates a full weekly meal plan just for you.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Target className="w-6 h-6 text-orange-500" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Calorie & Macro Tracking</h3>
                  <p className="text-gray-600">
                    AI auto-calculates your daily calorie needs and tracks proteins, carbs, and fats to keep you on target.
                  </p>
                </div>
              </div>
            </div>

            <div
              id="features-right"
              data-scroll-animate
              className={`space-y-8 ${visibleSections['features-right'] ? 'animate-fade-in-right' : 'opacity-0 translate-x-[30px]'}`}
            >
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Flame className="w-6 h-6 text-orange-500" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Goal-Based Nutrition</h3>
                  <p className="text-gray-600">
                    Whether you want to lose weight, gain muscle, or maintain — AI adapts your meal plan dynamically to match your progress.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Droplets className="w-6 h-6 text-orange-500" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Hydration & Habit Tracking</h3>
                  <p className="text-gray-600">
                    AI monitors your water intake and builds lasting healthy habits with smart, timely reminders throughout the day.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;