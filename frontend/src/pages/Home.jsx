import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import {
  ScanLine,
  Tag,
  BarChart3,
  Clock,
  Download,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';

const Home = () => {
  const { user } = useAuth();

  const features = [
    {
      icon: ScanLine,
      title: 'Smart OCR Scanning',
      desc: 'Simply snap or upload a photo of your paper receipt. Optical Character Recognition extracts merchants, dates, and amounts in seconds.',
      color: 'blue',
      iconBg: 'bg-blue-500 text-white',
    },
    {
      icon: Tag,
      title: 'Auto Categorization',
      desc: 'ML models and heuristic rules automatically sort transactions into 12 distinct categories. No tedious manual data entry.',
      color: 'emerald',
      iconBg: 'bg-emerald-500 text-white',
    },
    {
      icon: BarChart3,
      title: 'Visual Analytics',
      desc: 'High-contrast category breakdowns and monthly spending charts reveal your financial patterns with total clarity.',
      color: 'amber',
      iconBg: 'bg-amber-500 text-gray-900',
    },
    {
      icon: Clock,
      title: 'Real-time Tracking',
      desc: 'Monitor day-to-day cash outflows, filter by year, and identify pending expense reviews immediately.',
      color: 'rose',
      iconBg: 'bg-red-500 text-white',
    },
    {
      icon: Download,
      title: 'One-Click CSV Export',
      desc: 'Download your structured financial records whenever you need them. Formatted for spreadsheets and tax filings.',
      color: 'blue',
      iconBg: 'bg-blue-600 text-white',
    },
    {
      icon: ShieldCheck,
      title: 'Private & Secure',
      desc: 'Modern token authentication and isolated storage keep your confidential receipts and financial data protected.',
      color: 'emerald',
      iconBg: 'bg-emerald-600 text-white',
    },
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900">
      
      {/* =========================================================
          HERO SECTION - BOLD POSTER AESTHETIC (Rule 6, Rule 10)
          ========================================================= */}
      <section className="relative overflow-hidden pt-28 sm:pt-36 pb-20 sm:pb-28 bg-gray-900 text-white">
        {/* Large Geometric Poster Shapes in Background */}
        <div className="absolute top-10 -right-20 w-96 h-96 rounded-full bg-blue-500/15 pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-20 w-80 h-80 rounded-md rotate-12 bg-emerald-500/15 pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/4 w-40 h-40 rounded-full bg-amber-500/10 pointer-events-none"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/20 text-blue-400 font-extrabold text-xs uppercase tracking-wider mb-8 border border-blue-500/30">
            <Sparkles size={14} strokeWidth={2.5} />
            <span>AI-Driven Financial Intelligence</span>
          </div>

          {/* Main Headline: Bold Geometry */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white mb-6 leading-tight max-w-5xl mx-auto">
            Track Expenses with <br />
            <span className="text-blue-400">Pure Form</span> &{' '}
            <span className="text-emerald-400">Zero Friction</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
            Turn receipts into actionable financial clarity. Instant OCR extraction, automated classification, and crisp visual analytics.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            {user ? (
              <Link to="/dashboard">
                <Button variant="primary" size="cta" className="min-w-[220px]">
                  <span>Open Dashboard</span>
                  <ArrowRight size={20} strokeWidth={2.5} className="ml-2" />
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/signup">
                  <Button variant="primary" size="cta" className="min-w-[220px]">
                    <span>Get Started Free</span>
                    <ArrowRight size={20} strokeWidth={2.5} className="ml-2" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="secondary" size="cta" className="min-w-[180px] bg-white text-gray-900 hover:bg-gray-100">
                    Sign In
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Multi-Color Stat Numbers - Design System Principle */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto pt-8 border-t border-gray-800">
            <div className="bg-gray-800/80 p-5 rounded-lg border-b-4 border-blue-500">
              <div className="text-3xl sm:text-4xl font-black text-blue-400">99.2%</div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mt-1">OCR Accuracy Rate</p>
            </div>
            <div className="bg-gray-800/80 p-5 rounded-lg border-b-4 border-emerald-500">
              <div className="text-3xl sm:text-4xl font-black text-emerald-400">&lt; 2.5s</div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mt-1">Processing Speed</p>
            </div>
            <div className="bg-gray-800/80 p-5 rounded-lg border-b-4 border-amber-500">
              <div className="text-3xl sm:text-4xl font-black text-amber-400">12 Types</div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mt-1">Smart Categories</p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          FEATURES SECTION - ALTERNATING BACKGROUND (GRAY 100)
          ========================================================= */}
      <section className="py-20 sm:py-28 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-extrabold uppercase tracking-wider text-blue-600 block mb-2">
              Engineered for Speed
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">
              Confident, Purpose-Built Features
            </h2>
            <p className="text-base sm:text-lg text-gray-600 mt-4">
              Zero clutter, no artificial gimmicks. Everything in ExpenseTrack exists to make receipt tracking fast and reliable.
            </p>
          </div>

          {/* Color-Block Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={feature.title}
                  color={feature.color}
                  interactive={true}
                  padding="default"
                  className="flex flex-col justify-between"
                >
                  <div>
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-6 ${feature.iconBg}`}>
                      <Icon size={26} strokeWidth={2.5} />
                    </div>
                    <h3 className="text-xl font-extrabold text-gray-900 tracking-tight mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-gray-700 leading-relaxed font-normal">
                      {feature.desc}
                    </p>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================
          HOW IT WORKS - SOLID COLOR BLOCKS (WHITE)
          ========================================================= */}
      <section className="py-20 sm:py-24 bg-white border-t-2 border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-600 block mb-2">
              Direct Workflow
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              From Paper Receipt to Clear Insight
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-lg bg-gray-100 border-l-8 border-blue-500">
              <span className="text-4xl font-black text-blue-500 block mb-3">01</span>
              <h3 className="text-xl font-extrabold text-gray-900 mb-2">Upload Receipt</h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                Take a quick photo or drag-and-drop any standard PNG or JPG file into the dashboard.
              </p>
            </div>

            <div className="p-8 rounded-lg bg-gray-100 border-l-8 border-emerald-500">
              <span className="text-4xl font-black text-emerald-500 block mb-3">02</span>
              <h3 className="text-xl font-extrabold text-gray-900 mb-2">AI Extraction</h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                OCR parses merchant name, dates, subtotal, and tax, while the classification model tags the category.
              </p>
            </div>

            <div className="p-8 rounded-lg bg-gray-100 border-l-8 border-amber-500">
              <span className="text-4xl font-black text-amber-500 block mb-3">03</span>
              <h3 className="text-xl font-extrabold text-gray-900 mb-2">Actionable Reports</h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                Review your spending trends, export CSV spreadsheets, and optimize your monthly budget.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          BOLD CTA SECTION - SOLID PRIMARY BLUE BLOCK
          ========================================================= */}
      <section className="relative overflow-hidden py-16 sm:py-24 bg-blue-500 text-white">
        {/* Large Decorative Geometric Circles */}
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-white/10 pointer-events-none"></div>
        <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-md rotate-45 bg-white/10 pointer-events-none"></div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4 text-white">
            Ready for Confident Expense Management?
          </h2>
          <p className="text-lg sm:text-xl text-blue-100 mb-8 max-w-2xl mx-auto font-normal">
            Join thousands tracking smarter with zero clutter, high contrast, and digital clarity.
          </p>
          {!user && (
            <Link to="/signup">
              <Button
                variant="secondary"
                size="cta"
                className="bg-gray-900 text-white hover:bg-black font-extrabold"
              >
                Start Free Today
                <ArrowRight size={20} strokeWidth={2.5} className="ml-2" />
              </Button>
            </Link>
          )}
        </div>
      </section>

      {/* =========================================================
          FOOTER - SOLID FOREGROUND DARK BLOCK (#111827)
          ========================================================= */}
      <footer className="bg-gray-900 text-white py-12 border-t-2 border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <span className="text-lg font-extrabold text-white tracking-tight">ExpenseTrack</span>
            <p className="text-xs text-gray-400 mt-1">Smart expense management with flat digital precision.</p>
          </div>
          <div className="flex gap-6 text-sm font-bold text-gray-400">
            <Link to="/about" className="hover:text-white transition-colors">About</Link>
            <Link to="/contact" className="hover:text-white transition-colors">Contact</Link>
            <Link to="/login" className="hover:text-white transition-colors">Sign In</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
