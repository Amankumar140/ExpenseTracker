import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Home = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();

  const features = [
    {
      icon: <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
      title: 'Smart OCR Scanning',
      desc: 'Simply snap a photo of your receipt. Our AI extracts all details instantly with 99% accuracy.',
      gradient: 'from-blue-600 to-indigo-600',
      border: isDark ? 'from-blue-900/20 to-indigo-900/20 border-indigo-800/50' : 'from-blue-50 to-indigo-50 border-indigo-100',
    },
    {
      icon: <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>,
      title: 'Auto Categorization',
      desc: 'Intelligent keyword matching automatically sorts expenses into 12 categories. No manual work needed.',
      gradient: 'from-purple-600 to-pink-600',
      border: isDark ? 'from-purple-900/20 to-pink-900/20 border-purple-800/50' : 'from-purple-50 to-pink-50 border-purple-100',
    },
    {
      icon: <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
      title: 'Visual Analytics',
      desc: 'Beautiful charts and insights help you understand spending patterns and make smarter decisions.',
      gradient: 'from-green-600 to-emerald-600',
      border: isDark ? 'from-green-900/20 to-emerald-900/20 border-green-800/50' : 'from-green-50 to-emerald-50 border-green-100',
    },
    {
      icon: <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
      title: 'Real-time Tracking',
      desc: 'Monitor your expenses as they happen. Year-wise filtering and monthly breakdowns at your fingertips.',
      gradient: 'from-orange-600 to-red-600',
      border: isDark ? 'from-orange-900/20 to-red-900/20 border-orange-800/50' : 'from-orange-50 to-red-50 border-orange-100',
    },
    {
      icon: <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
      title: 'CSV Export',
      desc: 'Download your financial data anytime. Perfect for tax season or detailed analysis in Excel.',
      gradient: 'from-cyan-600 to-blue-600',
      border: isDark ? 'from-cyan-900/20 to-blue-900/20 border-cyan-800/50' : 'from-cyan-50 to-blue-50 border-cyan-100',
    },
    {
      icon: <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
      title: 'Secure & Private',
      desc: 'Bank-level encryption protects your data. Your financial information is safe with us.',
      gradient: 'from-violet-600 to-purple-600',
      border: isDark ? 'from-violet-900/20 to-purple-900/20 border-violet-800/50' : 'from-violet-50 to-purple-50 border-violet-100',
    },
  ];

  return (
    <div className={`min-h-screen transition-colors ${isDark ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50'}`}>
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 sm:pt-24 pb-20 sm:pb-32">
        {/* Gradient Orbs */}
        <div className={`absolute top-0 left-1/4 w-72 sm:w-96 h-72 sm:h-96 rounded-full filter blur-3xl opacity-20 animate-blob ${isDark ? 'bg-purple-900 mix-blend-lighten' : 'bg-purple-300 mix-blend-multiply'}`}></div>
        <div className={`absolute top-0 right-1/4 w-72 sm:w-96 h-72 sm:h-96 rounded-full filter blur-3xl opacity-20 animate-blob animation-delay-2000 ${isDark ? 'bg-blue-900 mix-blend-lighten' : 'bg-blue-300 mix-blend-multiply'}`}></div>
        <div className={`absolute -bottom-32 left-1/3 w-72 sm:w-96 h-72 sm:h-96 rounded-full filter blur-3xl opacity-20 animate-blob animation-delay-4000 ${isDark ? 'bg-indigo-900 mix-blend-lighten' : 'bg-indigo-300 mix-blend-multiply'}`}></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center animate-slide-up">
            {/* Badge */}
            <div className={`inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r border mb-8 backdrop-blur-sm ${isDark ? 'from-indigo-500/20 to-purple-500/20 border-indigo-700' : 'from-indigo-500/10 to-purple-500/10 border-indigo-200'}`}>
              <span className={`text-sm font-semibold bg-gradient-to-r bg-clip-text text-transparent ${isDark ? 'from-indigo-400 to-purple-400' : 'from-indigo-600 to-purple-600'}`}>
                ✨ Smart Expense Management
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight px-4">
              <span className={`bg-gradient-to-r bg-clip-text text-transparent ${isDark ? 'from-slate-100 via-indigo-200 to-purple-200' : 'from-slate-900 via-indigo-900 to-purple-900'}`}>
                Track Expenses
              </span>
              <br />
              <span className={`bg-gradient-to-r bg-clip-text text-transparent ${isDark ? 'from-indigo-400 via-purple-400 to-pink-400' : 'from-indigo-600 via-purple-600 to-pink-600'}`}>
                Effortlessly Smart
              </span>
            </h1>

            {/* Subheadline */}
            <p className={`text-lg sm:text-xl md:text-2xl mb-12 max-w-3xl mx-auto leading-relaxed px-4 animate-slide-up animation-delay-200 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              Transform your receipts into insights with AI-powered OCR. 
              <span className={`font-semibold ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}> Categorize automatically</span>, 
              analyze spending patterns, and take control of your finances.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-slide-up animation-delay-300">
              {user ? (
                <Link
                  to="/dashboard"
                  className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-indigo-500/25 hover:scale-105"
                >
                  Go to Dashboard
                  <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              ) : (
                <>
                  <Link
                    to="/signup"
                    className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-indigo-500/25 hover:scale-105"
                  >
                    Get Started Free
                    <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                  <Link
                    to="/login"
                    className={`inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-300 shadow-md hover:shadow-lg border-2 ${isDark ? 'text-indigo-400 bg-slate-800/50 hover:bg-slate-700/50 border-indigo-800' : 'text-indigo-600 bg-white/80 hover:bg-white border-indigo-100'}`}
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 sm:gap-8 max-w-2xl mx-auto px-4 animate-slide-up animation-delay-400">
              {[
                { value: '99%', label: 'Accuracy Rate' },
                { value: '10k+', label: 'Active Users' },
                { value: '2.5s', label: 'Avg. Processing' },
              ].map(stat => (
                <div key={stat.label} className="text-center">
                  <div className={`text-2xl sm:text-3xl font-bold bg-gradient-to-r bg-clip-text text-transparent ${isDark ? 'from-indigo-400 to-purple-400' : 'from-indigo-600 to-purple-600'}`}>{stat.value}</div>
                  <div className={`text-xs sm:text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={`py-16 sm:py-20 transition-colors ${isDark ? 'bg-slate-800/50' : 'bg-white/50'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className={`text-3xl sm:text-4xl font-bold mb-4 px-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Powerful Features for Smart Tracking
            </h2>
            <p className={`text-lg sm:text-xl max-w-2xl mx-auto px-4 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              Everything you need to manage expenses efficiently and gain financial insights
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {features.map((feature, i) => (
              <div
                key={feature.title}
                className={`group relative bg-gradient-to-br rounded-2xl p-6 sm:p-8 hover:shadow-2xl transition-all duration-300 border hover-tilt animate-slide-up ${feature.border}`}
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className={`w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r ${feature.gradient} rounded-xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 group-hover:shadow-lg transition-all duration-300`}>
                  {feature.icon}
                </div>
                <h3 className={`text-lg sm:text-xl font-bold mb-2 sm:mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>{feature.title}</h3>
                <p className={`text-sm sm:text-base ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className={`py-12 ${isDark ? '' : ''}`}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className={`text-sm font-semibold uppercase tracking-widest mb-6 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Trusted by leading organizations</p>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 opacity-50">
            {['TechCorp', 'FinFlow', 'DataPrime', 'CloudSync', 'SmartBiz'].map(brand => (
              <div key={brand} className={`text-lg sm:text-xl font-bold tracking-wider ${isDark ? 'text-slate-600' : 'text-slate-300'}`}>
                {brand}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={`py-16 sm:py-20 relative overflow-hidden ${isDark ? 'bg-gradient-to-r from-indigo-950 via-purple-950 to-pink-950' : 'bg-gradient-to-r from-indigo-200 via-purple-100 to-pink-200'}`}>
        {/* Decorative shapes */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl animate-float animation-delay-2000"></div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className={`text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Ready to Take Control of Your Expenses?
          </h2>
          <p className={`text-lg sm:text-xl mb-8 sm:mb-10 ${isDark ? 'text-indigo-200' : 'text-slate-700'}`}>
            Join thousands of users who've simplified their expense tracking
          </p>
          {!user && (
            <Link
              to="/signup"
              className={`inline-flex items-center justify-center px-8 sm:px-10 py-4 sm:py-5 text-base sm:text-lg font-semibold rounded-xl transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 ${isDark ? 'text-indigo-900 bg-white hover:bg-indigo-50' : 'text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'}`}
            >
              Start Free Today
              <svg className="ml-2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
