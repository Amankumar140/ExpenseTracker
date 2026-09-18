import Card from '../components/ui/Card';
import {
  Zap,
  ShieldCheck,
  Target,
  Sparkles,
  Users,
  Compass,
  CheckCircle2
} from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Hero Section - Poster Treatment */}
      <section className="pt-28 sm:pt-36 pb-16 bg-gray-900 text-white relative overflow-hidden">
        <div className="absolute top-10 right-10 w-80 h-80 rounded-full bg-blue-500/15 pointer-events-none"></div>
        <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-md rotate-45 bg-emerald-500/15 pointer-events-none"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block px-3.5 py-1 rounded-full bg-blue-500 text-white font-extrabold text-xs uppercase tracking-wider mb-4">
            Our Purpose
          </span>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6">
            About ExpenseTrack
          </h1>
          <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Empowering individuals and teams to master financial workflows through purposeful automation, zero clutter, and pure digital clarity.
          </p>
        </div>
      </section>

      {/* Mission Section - Alternating Color Block */}
      <section className="py-20 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-blue-600 block mb-2">
                Why We Exist
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-6">
                Manual Data Entry is Broken. We Rebuilt It from First Principles.
              </h2>
              <p className="text-base sm:text-lg text-gray-700 leading-relaxed mb-4">
                We believe managing expenses should never be a slow, manual chore. ExpenseTrack takes the friction out of tracking by pairing industrial-grade OCR with ML-driven classification.
              </p>
              <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
                No gimmicky 3D effects or hidden data. You get crisp, accessible numbers that make budget reviews direct and dependable.
              </p>
            </div>

            <div className="space-y-4">
              <Card color="blue" padding="default" className="border-l-8 border-blue-500">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-500 text-white rounded-md flex items-center justify-center flex-shrink-0">
                    <Zap size={22} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-gray-900 text-lg">Instant Ingestion</h3>
                    <p className="text-sm text-gray-700 mt-1">Receipts parsed in under 3 seconds with near-zero latency.</p>
                  </div>
                </div>
              </Card>

              <Card color="emerald" padding="default" className="border-l-8 border-emerald-500">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-emerald-500 text-white rounded-md flex items-center justify-center flex-shrink-0">
                    <Target size={22} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-gray-900 text-lg">99% OCR Accuracy</h3>
                    <p className="text-sm text-gray-700 mt-1">Extracts clean merchant names, dates, amounts, and taxes.</p>
                  </div>
                </div>
              </Card>

              <Card color="amber" padding="default" className="border-l-8 border-amber-500">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-amber-500 text-gray-900 rounded-md flex items-center justify-center flex-shrink-0">
                    <ShieldCheck size={22} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-gray-900 text-lg">Strict Data Privacy</h3>
                    <p className="text-sm text-gray-700 mt-1">Your personal receipts and finances remain encrypted and private.</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values Section - White */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              Our Core Design Values
            </h2>
            <p className="text-base sm:text-lg text-gray-600 mt-2">
              The foundational principles driving our architecture and interface.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Zero Artificial Depth', desc: 'No false drop shadows or skeuomorphic textures. Structure through pure color and grid.', icon: Compass, color: 'border-blue-500' },
              { title: 'Typography as Interface', desc: 'High contrast geometric typography provides clear visual hierarchy at a glance.', icon: Sparkles, color: 'border-emerald-500' },
              { title: 'Deterministic Precision', desc: 'Accurate data extraction with manual override and full confidence tracking.', icon: Target, color: 'border-amber-500' },
              { title: 'Security First', desc: 'Rigorous token authentication protecting every financial transaction.', icon: ShieldCheck, color: 'border-red-500' },
            ].map((v) => {
              const Icon = v.icon;
              return (
                <div key={v.title} className={`p-6 rounded-lg bg-gray-100 border-t-8 ${v.color}`}>
                  <div className="w-12 h-12 bg-white rounded-md flex items-center justify-center text-gray-900 mb-4">
                    <Icon size={24} strokeWidth={2.5} />
                  </div>
                  <h3 className="text-lg font-extrabold text-gray-900 mb-2">{v.title}</h3>
                  <p className="text-sm text-gray-700 leading-relaxed">{v.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Metrics Section - Multi-Color Stat Numbers */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl sm:text-5xl font-black text-blue-400">10K+</div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mt-2">Active Users</p>
            </div>
            <div>
              <div className="text-4xl sm:text-5xl font-black text-emerald-400">500K+</div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mt-2">Receipts Ingested</p>
            </div>
            <div>
              <div className="text-4xl sm:text-5xl font-black text-amber-400">99.8%</div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mt-2">Uptime Reliability</p>
            </div>
            <div>
              <div className="text-4xl sm:text-5xl font-black text-purple-400">4.9/5</div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mt-2">User Rating</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
