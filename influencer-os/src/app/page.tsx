'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function LandingPage() {
  const [formStatus, setFormStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus('submitting');
    // Simulate network request. Later, point this to a Supabase 'leads' table!
    setTimeout(() => {
      setFormStatus('success');
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans selection:bg-zinc-200">
      
      {/* Navigation Bar */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto sticky top-0 z-50 bg-zinc-50/80 backdrop-blur-md border-b border-zinc-200/50">
        <div className="text-2xl font-black tracking-tighter"><span className="text-zinc-400 font-medium">Invode</span></div>
        <div className="space-x-3 flex items-center">
          <Link href="/login" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors hidden sm:block mr-4">
            Brand Login
          </Link>
          <a href="#contact" className="hidden sm:inline-flex">
            <Button variant="outline" className="rounded-full border-zinc-300">Contact Sales</Button>
          </a>
          <Link href="/login">
            <Button className="bg-zinc-900 hover:bg-zinc-800 text-white rounded-full px-6 shadow-md shadow-zinc-200">
              Open Dashboard
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative overflow-hidden">
        {/* Background Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] opacity-20 bg-gradient-to-b from-zinc-400 to-transparent blur-3xl -z-10 rounded-full"></div>
        
        <div className="max-w-7xl mx-auto px-6 pt-24 pb-20 text-center sm:pt-32 sm:pb-24">
          <div className="inline-flex items-center rounded-full border border-zinc-200/80 bg-white/50 backdrop-blur-sm px-4 py-1.5 text-sm font-semibold mb-8 text-zinc-700 shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
            Campaign OS v1.0 is now live for Brands
          </div>
          
          <h1 className="mx-auto max-w-5xl text-5xl font-black tracking-tight text-zinc-900 sm:text-7xl leading-[1.1]">
            Stop managing influencers on <span className="line-through text-zinc-400 decoration-red-400/50">spreadsheets.</span><br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-900 via-zinc-600 to-zinc-900">
              Scale your brand with Invode.
            </span>
          </h1>
          
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-zinc-600 font-medium">
            The ultimate operating system built exclusively for brands. Consolidate your CRM, automate your pipeline, track ROI, and approve content effortlessly in one unified dashboard.
          </p>
          
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/login">
              <Button size="lg" className="w-full sm:w-auto bg-zinc-900 hover:bg-zinc-800 text-white rounded-full px-8 h-14 text-lg font-semibold shadow-xl shadow-zinc-300/50 hover:scale-105 transition-all">
                Unlock Your Workspace
              </Button>
            </Link>
            <a href="#contact">
              <Button size="lg" variant="outline" className="w-full sm:w-auto rounded-full px-8 h-14 text-lg font-semibold bg-white border-zinc-200 hover:bg-zinc-50 transition-all">
                Book a Demo
              </Button>
            </a>
          </div>
        </div>
      </main>

      {/* Browser Mockup / Pipeline Image */}
      <div className="max-w-6xl mx-auto px-6 pb-24 relative z-10">
        <div className="rounded-2xl border border-zinc-200/60 bg-white/40 shadow-2xl p-2 backdrop-blur-xl">
          {/* Mac Window Header */}
          <div className="bg-zinc-100 rounded-t-xl border-b border-zinc-200/80 px-4 py-3 flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-400"></div>
            <div className="w-3 h-3 rounded-full bg-amber-400"></div>
            <div className="w-3 h-3 rounded-full bg-green-400"></div>
            <div className="ml-4 text-xs font-medium text-zinc-400 flex-1 text-center pr-12">invode.com/dashboard</div>
          </div>
          {/* Image Container */}
          <div className="bg-zinc-50 rounded-b-xl overflow-hidden flex items-center justify-center relative">
            <Image 
              src="/Gemini_Generated_Image_s3f8d4s3f8d4s3f8.png" 
              alt="Invode Pipeline Board Preview" 
              width={1920}
              height={1080}
              className="w-full h-auto object-cover"
              priority
            />
          </div>
        </div>
      </div>

      {/* Comprehensive Features Grid */}
      <section id="features" className="bg-white py-24 sm:py-32 border-t border-zinc-100 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mx-auto max-w-2xl text-center mb-20">
            <h2 className="text-sm font-bold tracking-widest uppercase text-zinc-400 mb-3">The Invode Arsenal</h2>
            <p className="text-3xl font-black tracking-tight text-zinc-900 sm:text-5xl">End-to-end campaign control.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* Feature 1 */}
            <div className="bg-zinc-50 rounded-2xl p-8 border border-zinc-200/60 hover:shadow-lg transition-shadow">
              <div className="text-3xl mb-4">👥</div>
              <h3 className="text-xl font-bold text-zinc-900 mb-3">Brand-Owned CRM</h3>
              <p className="text-zinc-600 leading-relaxed text-sm">A centralized database for your influencers. Track niches, engagement metrics, historical pricing, and internal notes across your entire marketing team.</p>
            </div>

            {/* Feature 2 */}
            <div className="bg-zinc-50 rounded-2xl p-8 border border-zinc-200/60 hover:shadow-lg transition-shadow">
              <div className="text-3xl mb-4">📊</div>
              <h3 className="text-xl font-bold text-zinc-900 mb-3">9-Stage Kanban Pipeline</h3>
              <p className="text-zinc-600 leading-relaxed text-sm">Visualize campaign health instantly. Move creators seamlessly from "Shortlisted" to "Product Sent" to "Completed" with zero friction.</p>
            </div>

            {/* Feature 3 */}
            <div className="bg-zinc-50 rounded-2xl p-8 border border-zinc-200/60 hover:shadow-lg transition-shadow">
              <div className="text-3xl mb-4">✅</div>
              <h3 className="text-xl font-bold text-zinc-900 mb-3">Content Approvals</h3>
              <p className="text-zinc-600 leading-relaxed text-sm">Stop digging through WhatsApp. Review Google Drive links, request edits, and approve content directly inside the campaign workspace.</p>
            </div>

            {/* Feature 4 */}
            <div className="bg-zinc-50 rounded-2xl p-8 border border-zinc-200/60 hover:shadow-lg transition-shadow">
              <div className="text-3xl mb-4">💳</div>
              <h3 className="text-xl font-bold text-zinc-900 mb-3">Financial Ledger</h3>
              <p className="text-zinc-600 leading-relaxed text-sm">Never miss a payout. Track outstanding liabilities, mark invoices as paid, and maintain a perfect financial record of your influencer spend.</p>
            </div>

            {/* Feature 5 */}
            <div className="bg-zinc-50 rounded-2xl p-8 border border-zinc-200/60 hover:shadow-lg transition-shadow">
              <div className="text-3xl mb-4">📈</div>
              <h3 className="text-xl font-bold text-zinc-900 mb-3">Real-Time ROI Analytics</h3>
              <p className="text-zinc-600 leading-relaxed text-sm">Live dashboards calculating your total managed budget, disbursed funds, and campaign-level profit & loss margins automatically.</p>
            </div>

            {/* Feature 6 - COMING SOON */}
            <div className="bg-zinc-50 rounded-2xl p-8 border border-zinc-200/60 hover:shadow-lg transition-shadow">
              {/* <div className="absolute top-4 right-4 bg-zinc-800 text-zinc-300 text-xs font-bold px-3 py-1 rounded-full border border-zinc-700">
                ⚡ Coming Soon
              </div> */}
              <div className="text-3xl mb-4">📄</div>
              <h3 className="text-xl font-bold text-zinc-900 mb-3">Smart Contracts & Invoices</h3>
              <p className="text-zinc-600 leading-relaxed text-sm">Auto-generate legal PDF contracts and payment invoices pre-filled with CRM data and campaign deliverables with a single click.</p>
            </div>

          </div>
        </div>
      </section>

      {/* High-Converting Lead Gen Form (Dark Section) */}
      <section id="contact" className="bg-zinc-950 py-24 sm:py-32 relative overflow-hidden">
        {/* Subtle background texture */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
        
        <div className="max-w-3xl mx-auto px-6 relative z-10 text-center">
          <h2 className="text-3xl font-black tracking-tight text-white sm:text-5xl mb-4">Ready to upgrade your brand?</h2>
          <p className="text-zinc-400 mb-12 text-lg">Request an invite code to access the Invode OS workspace, or schedule a personalized demo with our team.</p>
          
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 sm:p-10 text-left shadow-2xl">
            {formStatus === 'success' ? (
              <div className="text-center py-12 animate-in fade-in zoom-in duration-500">
                <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Request Received!</h3>
                <p className="text-zinc-400">Our team will contact you shortly with your exclusive access code.</p>
                <Button onClick={() => setFormStatus('idle')} variant="outline" className="mt-8 border-zinc-700 text-zinc-300 hover:bg-zinc-800">Submit Another</Button>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-zinc-300">Your Name</Label>
                    <Input required className="bg-zinc-950 border-zinc-800 text-white focus:ring-zinc-700" placeholder="Jane Doe" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-zinc-300">Brand / Company Name</Label>
                    <Input required className="bg-zinc-950 border-zinc-800 text-white focus:ring-zinc-700" placeholder="Acme Corp" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-300">Work Email</Label>
                  <Input type="email" required className="bg-zinc-950 border-zinc-800 text-white focus:ring-zinc-700" placeholder="jane@brand.com" />
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-300">Estimated Monthly Influencer Spend (Optional)</Label>
                  <select className="w-full bg-zinc-950 border border-zinc-800 rounded-md p-2.5 text-sm text-white focus:ring-zinc-700 focus:border-zinc-700">
                    <option value="" disabled selected>Select an option...</option>
                    <option value="under-1L">Under ₹1 Lakh</option>
                    <option value="1L-5L">₹1 Lakh - ₹5 Lakhs</option>
                    <option value="5L-20L">₹5 Lakhs - ₹20 Lakhs</option>
                    <option value="20L+">₹20 Lakhs+</option>
                  </select>
                </div>
                <Button type="submit" disabled={formStatus === 'submitting'} className="w-full h-12 text-base font-bold bg-white text-zinc-900 hover:bg-zinc-200 transition-colors mt-4">
                  {formStatus === 'submitting' ? 'Sending Request...' : 'Request Access / Demo'}
                </Button>
                <p className="text-xs text-center text-zinc-500 mt-4">No credit card required. We respect your privacy.</p>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200 bg-white py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-sm text-zinc-500 font-medium">
          <div className="flex items-center gap-2">
            <span className="text-zinc-900 font-bold text-lg">Invode</span>
            <span>© {new Date().getFullYear()} All Rights Reserved.</span>
          </div>
          <div className="mt-4 md:mt-0 space-x-8">
            <a href="#" className="hover:text-zinc-900 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-zinc-900 transition-colors">Terms of Service</a>
            <a href="mailto:hello@invode.com" className="hover:text-zinc-900 transition-colors">Contact Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}