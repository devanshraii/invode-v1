// import { redirect } from 'next/navigation';

// export default function RootPage() {
//   // Bypass login entirely for testing and go straight to the dashboard
//   redirect('/dashboard/creators');
// }



import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans selection:bg-zinc-200">
      
      {/* Navigation Bar */}
      <nav className="flex items-center justify-between px-8 py-4 max-w-7xl mx-auto">
        <div className="text-xl font-bold tracking-tight">Campaign<span className="text-zinc-500">OS</span></div>
        <div className="space-x-4">
          <Link href="/dashboard/campaigns">
            <Button variant="ghost" className="hidden sm:inline-flex">Sign In</Button>
          </Link>
          <Link href="/dashboard/campaigns">
            <Button className="bg-zinc-900 hover:bg-zinc-800 text-white rounded-full px-6">
              Go to Dashboard
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-8 pt-20 pb-24 text-center sm:pt-32 sm:pb-32">
        <div className="inline-flex items-center rounded-full border border-zinc-200 bg-white px-3 py-1 text-sm font-medium mb-8 text-zinc-600 shadow-sm">
          <span className="flex h-2 w-2 rounded-full bg-green-500 mr-2"></span>
          MVP v1.0 is now live
        </div>
        
        <h1 className="mx-auto max-w-4xl text-5xl font-extrabold tracking-tight text-zinc-900 sm:text-7xl">
          The spreadsheet killer for <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-500 to-zinc-900">
            Influencer Marketing.
          </span>
        </h1>
        
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-zinc-600">
          Stop losing creator deliverables in WhatsApp groups. CampaignOS gives your agency a central CRM, a 9-stage operational pipeline, and one-click content approvals.
        </p>
        
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Link href="/dashboard/campaigns">
            <Button size="lg" className="bg-zinc-900 hover:bg-zinc-800 text-white rounded-full px-8 h-14 text-lg">
              Open Workspace
            </Button>
          </Link>
          <a href="#features" className="text-sm font-semibold leading-6 text-zinc-900 hover:text-zinc-600 transition-colors">
            See how it works <span aria-hidden="true">→</span>
          </a>
        </div>
      </main>

      {/* Product Screenshot / Mockup Placeholder */}
      <div className="max-w-6xl mx-auto px-8 pb-24">
        <div className="rounded-2xl border border-zinc-200/50 bg-white shadow-2xl p-2 sm:p-4 bg-zinc-50/50 backdrop-blur-sm">
          <div className="rounded-xl overflow-hidden border border-zinc-100 bg-zinc-50 aspect-[16/9] flex items-center justify-center relative">
            {/* You can replace this div with an actual <img> tag of your dashboard later */}
            <div className="absolute inset-0 bg-gradient-to-br from-zinc-100 to-white flex flex-col items-center justify-center text-zinc-400">
              <svg className="w-16 h-16 mb-4 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
              </svg>
              <p className="font-medium">Interactive Pipeline Board Mockup</p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section id="features" className="bg-white py-24 sm:py-32 border-t border-zinc-200">
        <div className="max-w-7xl mx-auto px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-base font-semibold leading-7 text-zinc-500">Built for speed</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">Everything you need, nothing you don't.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Feature 1 */}
            <div className="flex flex-col">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-zinc-100 border border-zinc-200 mb-6">
                <svg className="h-6 w-6 text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-zinc-900 mb-2">Creator CRM</h3>
              <p className="text-zinc-600 leading-relaxed flex-1">
                A centralized database for all your influencers. Track contact info, niches, followers, pricing, and WhatsApp numbers in one unified view.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="flex flex-col">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-zinc-100 border border-zinc-200 mb-6">
                <svg className="h-6 w-6 text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-zinc-900 mb-2">9-Stage Pipeline</h3>
              <p className="text-zinc-600 leading-relaxed flex-1">
                Visual Kanban boards to track where every creator is in your campaign. From 'Shortlisted' to 'Product Sent' to 'Posted', updated instantly.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="flex flex-col">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-zinc-100 border border-zinc-200 mb-6">
                <svg className="h-6 w-6 text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-zinc-900 mb-2">WhatsApp Approvals</h3>
              <p className="text-zinc-600 leading-relaxed flex-1">
                Review Google Drive assets natively, then auto-generate pre-filled WhatsApp messages to request changes or send approvals with one click.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200 bg-zinc-50 py-12">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center text-sm text-zinc-500">
          <div>© {new Date().getFullYear()} CampaignOS. All rights reserved.</div>
          <div className="mt-4 md:mt-0 space-x-6">
            <a href="#" className="hover:text-zinc-900 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-zinc-900 transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}