import { useState } from 'react';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { Mail, MessageSquare, MapPin, Send, CheckCircle2 } from 'lucide-react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 3500);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Hero Section - Poster Treatment */}
      <section className="pt-28 sm:pt-36 pb-16 bg-gray-900 text-white relative overflow-hidden">
        <div className="absolute top-10 -right-16 w-80 h-80 rounded-full bg-emerald-500/15 pointer-events-none"></div>
        <div className="absolute -bottom-16 left-10 w-64 h-64 rounded-md rotate-12 bg-blue-500/15 pointer-events-none"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block px-3.5 py-1 rounded-full bg-emerald-500 text-white font-extrabold text-xs uppercase tracking-wider mb-4">
            Support & Inquiries
          </span>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6">
            Get in Touch
          </h1>
          <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Have questions regarding OCR accuracy, custom deployment, or team accounts? Our engineering team is ready to help.
          </p>
        </div>
      </section>

      {/* Main Form & Contact Information - Alternating Background */}
      <section className="py-20 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-10 sm:gap-12 items-start">
            
            {/* Contact Form Card */}
            <Card color="white" padding="default" className="border-2 border-gray-900 shadow-none">
              <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight mb-6">
                Send a Message
              </h2>

              {submitted ? (
                <div className="p-8 rounded-md bg-emerald-50 border-2 border-emerald-500 text-center">
                  <div className="w-14 h-14 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 size={30} strokeWidth={2.5} />
                  </div>
                  <h3 className="text-xl font-extrabold text-emerald-900 mb-1">Message Sent!</h3>
                  <p className="text-sm font-semibold text-emerald-800">
                    Thank you. A member of our team will get back to you shortly.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input
                    label="Your Name"
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Alex Morgan"
                  />

                  <Input
                    label="Email Address"
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="alex@company.com"
                  />

                  <Input
                    label="Subject"
                    id="subject"
                    name="subject"
                    type="text"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="Inquiry about OCR parsing"
                  />

                  <div>
                    <label htmlFor="message" className="block text-sm font-semibold text-gray-900 mb-1.5">
                      Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows="4"
                      required
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Describe your inquiry in detail..."
                      className="w-full rounded-md text-sm text-gray-900 bg-gray-100 border-2 border-transparent focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 outline-none p-4 resize-none transition-colors duration-200"
                    ></textarea>
                  </div>

                  <div className="pt-2">
                    <Button
                      type="submit"
                      variant="primary"
                      size="md"
                      className="w-full h-12"
                    >
                      <Send size={16} strokeWidth={2.5} className="mr-2" />
                      Send Message
                    </Button>
                  </div>
                </form>
              )}
            </Card>

            {/* Direct Contact Cards */}
            <div className="space-y-6">
              <Card color="blue" padding="default" className="border-l-8 border-blue-500">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-500 text-white rounded-md flex items-center justify-center flex-shrink-0">
                    <Mail size={22} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-gray-900">Email Support</h3>
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mt-0.5">Response within 24 hours</p>
                    <a
                      href="mailto:support@expensetrack.com"
                      className="text-sm font-extrabold text-blue-600 hover:text-blue-700 underline mt-2 block"
                    >
                      support@expensetrack.com
                    </a>
                  </div>
                </div>
              </Card>

              <Card color="emerald" padding="default" className="border-l-8 border-emerald-500">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-emerald-500 text-white rounded-md flex items-center justify-center flex-shrink-0">
                    <MessageSquare size={22} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-gray-900">Live Community</h3>
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mt-0.5">Available for active subscribers</p>
                    <p className="text-sm text-gray-700 mt-1 font-medium">
                      Direct access to core contributors and release roadmaps.
                    </p>
                  </div>
                </div>
              </Card>

              <Card color="amber" padding="default" className="border-l-8 border-amber-500">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-amber-500 text-gray-900 rounded-md flex items-center justify-center flex-shrink-0">
                    <MapPin size={22} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-gray-900">Headquarters</h3>
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mt-0.5">Global Operations</p>
                    <p className="text-sm text-gray-700 mt-1 font-medium">
                      Financial District, Suite 400<br />
                      San Francisco, CA 94105
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
