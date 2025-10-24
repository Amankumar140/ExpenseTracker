import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';

const Contact = () => {
  const { isDark } = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send the form data to your backend
    console.log('Form submitted:', formData);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 3000);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className={`min-h-screen transition-colors ${isDark ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50'}`}>
      {/* Hero Section */}
      <section className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-extrabold mb-6">
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Get in Touch
              </span>
            </h1>
            <p className={`text-xl max-w-2xl mx-auto leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              Have a question or feedback? We'd love to hear from you. Our team is here to help!
            </p>
          </div>
        </div>
      </section>

      {/* Contact Form & Info Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className={`rounded-2xl shadow-xl p-6 sm:p-8 transition-colors ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
              <h2 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>Send us a Message</h2>
              
              {submitted ? (
                <div className={`border rounded-xl p-6 text-center ${isDark ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200'}`}>
                  <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className={`text-lg font-bold mb-2 ${isDark ? 'text-green-400' : 'text-green-900'}`}>Message Sent!</h3>
                  <p className={isDark ? 'text-green-500' : 'text-green-700'}>We'll get back to you as soon as possible.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className={`block text-sm font-semibold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Your Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${isDark ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-500' : 'border-slate-300 placeholder-slate-400'}`}
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className={`block text-sm font-semibold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${isDark ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-500' : 'border-slate-300 placeholder-slate-400'}`}
                      placeholder="john@example.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="subject" className={`block text-sm font-semibold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Subject
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${isDark ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-500' : 'border-slate-300 placeholder-slate-400'}`}
                      placeholder="How can we help?"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className={`block text-sm font-semibold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows="5"
                      className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none ${isDark ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-500' : 'border-slate-300 placeholder-slate-400'}`}
                      placeholder="Tell us more about your inquiry..."
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 px-6 text-lg font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02]"
                  >
                    Send Message
                  </button>
                </form>
              )}
            </div>

            {/* Contact Information */}
            <div className="space-y-8">
              {/* Contact Cards */}
              <div className={`rounded-2xl p-6 border transition-colors ${isDark ? 'bg-gradient-to-br from-blue-900/20 to-indigo-900/20 border-indigo-800' : 'bg-gradient-to-br from-blue-50 to-indigo-50 border-indigo-100'}`}>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className={`font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>Email Us</h3>
                    <p className={`text-sm mb-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Our team is here to help</p>
                    <a href="mailto:support@expensetrack.com" className="text-indigo-600 hover:text-indigo-700 font-semibold">
                      support@expensetrack.com
                    </a>
                  </div>
                </div>
              </div>

              <div className={`rounded-2xl p-6 border transition-colors ${isDark ? 'bg-gradient-to-br from-purple-900/20 to-pink-900/20 border-purple-800' : 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-100'}`}>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className={`font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>Live Chat</h3>
                    <p className={`text-sm mb-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Available 24/7 for support</p>
                    <button className="text-purple-600 hover:text-purple-700 font-semibold">
                      Start a Conversation →
                    </button>
                  </div>
                </div>
              </div>

              <div className={`rounded-2xl p-6 border transition-colors ${isDark ? 'bg-gradient-to-br from-green-900/20 to-emerald-900/20 border-green-800' : 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-100'}`}>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className={`font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>Visit Us</h3>
                    <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      123 Finance Street<br />
                      San Francisco, CA 94105<br />
                      United States
                    </p>
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <div className={`rounded-2xl p-6 shadow-md transition-colors ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
                <h3 className={`font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>Follow Us</h3>
                <div className="flex gap-4">
                  <a
                    href="https://twitter.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center hover:scale-110 transition-transform"
                  >
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                    </svg>
                  </a>
                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl flex items-center justify-center hover:scale-110 transition-transform"
                  >
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </a>
                  <a
                    href="https://linkedin.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 bg-gradient-to-r from-blue-700 to-blue-800 rounded-xl flex items-center justify-center hover:scale-110 transition-transform"
                  >
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                  </a>
                  <a
                    href="https://github.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 bg-gradient-to-r from-gray-700 to-gray-900 rounded-xl flex items-center justify-center hover:scale-110 transition-transform"
                  >
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Preview */}
      <section className={`py-16 transition-colors ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className={`text-3xl font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>Quick Answers</h2>
            <p className={`text-lg ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              Looking for something specific? Check out our most common questions
            </p>
          </div>

          <div className="space-y-4">
            <details className={`group rounded-xl p-6 cursor-pointer transition-colors ${isDark ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-50 hover:bg-slate-100'}`}>
              <summary className={`font-semibold flex justify-between items-center ${isDark ? 'text-white' : 'text-slate-900'}`}>
                How accurate is the OCR technology?
                <svg className="w-5 h-5 transform group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <p className={`mt-4 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                Our OCR technology achieves 99% accuracy on most receipts. We use advanced AI models trained on millions of receipt images.
              </p>
            </details>

            <details className={`group rounded-xl p-6 cursor-pointer transition-colors ${isDark ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-50 hover:bg-slate-100'}`}>
              <summary className={`font-semibold flex justify-between items-center ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Is my financial data secure?
                <svg className="w-5 h-5 transform group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <p className={`mt-4 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                Yes! We use bank-level encryption (AES-256) to protect your data. All communication is encrypted via HTTPS, and we never sell your information.
              </p>
            </details>

            <details className={`group rounded-xl p-6 cursor-pointer transition-colors ${isDark ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-50 hover:bg-slate-100'}`}>
              <summary className={`font-semibold flex justify-between items-center ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Can I export my expense data?
                <svg className="w-5 h-5 transform group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <p className={`mt-4 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                Absolutely! You can export all your expenses to CSV format anytime. You can also filter by year before exporting.
              </p>
            </details>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
