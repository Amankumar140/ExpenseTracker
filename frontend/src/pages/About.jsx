import { useTheme } from '../context/ThemeContext';

const About = () => {
  const { isDark } = useTheme();
  
  return (
    <div className={`min-h-screen transition-colors ${isDark ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50'}`}>
      {/* Hero Section */}
      <section className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-extrabold mb-6">
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                About ExpenseTrack
              </span>
            </h1>
            <p className={`text-xl max-w-3xl mx-auto leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              Empowering individuals and businesses to make smarter financial decisions through intelligent automation and beautiful insights.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className={`py-16 transition-colors ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className={`text-3xl font-bold mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>Our Mission</h2>
              <p className={`text-lg mb-4 leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                We believe managing expenses shouldn't be a chore. That's why we built ExpenseTrack - to transform the tedious task of expense tracking into a seamless, intelligent experience.
              </p>
              <p className={`text-lg leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                Our AI-powered platform combines cutting-edge OCR technology with smart categorization to save you time and provide insights that matter.
              </p>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur-2xl opacity-20"></div>
              <div className={`relative rounded-2xl p-8 border transition-colors ${isDark ? 'bg-gradient-to-br from-indigo-900/30 to-purple-900/30 border-indigo-800' : 'bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-100'}`}>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className={`font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>Lightning Fast</h3>
                      <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Process receipts in under 3 seconds</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className={`font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>99% Accurate</h3>
                      <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Industry-leading OCR accuracy</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-pink-600 to-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className={`font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>Bank-level Security</h3>
                      <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Your data is encrypted and protected</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className={`text-3xl font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>Our Core Values</h2>
            <p className={`text-lg max-w-2xl mx-auto ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <h3 className={`font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>Simplicity</h3>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Intuitive design that anyone can use</p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className={`font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>Innovation</h3>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Always improving with latest technology</p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className={`font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>Community</h3>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Building together with user feedback</p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className={`font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>Security</h3>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Your privacy is our top priority</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className={`py-16 transition-colors ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className={`text-3xl font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>By the Numbers</h2>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                10K+
              </div>
              <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>Active Users</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                500K+
              </div>
              <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>Receipts Processed</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                99.8%
              </div>
              <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>Uptime</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                4.9★
              </div>
              <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>User Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className={`text-3xl font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>Built by Innovators</h2>
            <p className={`text-lg max-w-2xl mx-auto ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              A passionate team dedicated to simplifying expense management for everyone
            </p>
          </div>

          <div className={`max-w-4xl mx-auto rounded-2xl p-8 border text-center transition-colors ${isDark ? 'bg-gradient-to-br from-indigo-900/30 to-purple-900/30 border-indigo-800' : 'bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-100'}`}>
            <p className={`text-lg leading-relaxed mb-6 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              "We started ExpenseTrack because we experienced the pain of manual expense tracking firsthand. Our mission is to give time back to people so they can focus on what matters most."
            </p>
            <div className="flex items-center justify-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                ET
              </div>
              <div className="text-left">
                <div className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>The ExpenseTrack Team</div>
                <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Building the future of expense management</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
