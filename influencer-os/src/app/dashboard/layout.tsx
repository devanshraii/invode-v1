'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/library/supabase';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  // THE VAULT DOOR: Check if the user is logged in before showing ANY dashboard page
  useEffect(() => {
    const verifyUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // If no active session, kick them immediately to the login page
        router.push('/login'); 
      } else {
        // If logged in, unlock the vault and render the page
        setIsCheckingAuth(false); 
      }
    };
    
    verifyUser();
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  // Full Navigation Map
  const navigation = [
    { name: 'Campaigns', href: '/dashboard/campaigns', icon: '📊' },
    { name: 'Creator CRM', href: '/dashboard/creators', icon: '👥' },
    { name: 'Approvals', href: '/dashboard/approvals', icon: '✅' },
    { name: 'Payments', href: '/dashboard/payments', icon: '💳' },
    { name: 'Reports', href: '/dashboard/reports', icon: '📈' },
  ];

  // Show a blank loading screen while verifying to prevent a flash of protected data
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="text-zinc-500 font-medium">Verifying access...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col md:flex-row">
      
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between bg-zinc-900 text-white p-4 sticky top-0 z-50 shadow-md">
        <div className="font-bold text-lg tracking-tight">Campaign<span className="text-zinc-400">OS</span></div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 focus:outline-none"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isMobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Sidebar Navigation */}
      <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} md:block w-full md:w-64 bg-zinc-900 text-zinc-300 md:shrink-0 md:sticky md:top-0 md:h-screen z-40 flex flex-col transition-all shadow-xl`}>
        <div className="p-6 hidden md:block border-b border-zinc-800">
          <div className="text-2xl font-bold text-white tracking-tight">Campaign<span className="text-zinc-500">OS</span></div>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname.includes(item.href);
            return (
              <Link 
                key={item.name} 
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)} 
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-zinc-800 text-white font-medium shadow-sm' 
                    : 'hover:bg-zinc-800 hover:text-white'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-zinc-800">
          <button 
            onClick={handleSignOut}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-zinc-800 hover:text-red-400 transition-colors"
          >
            <span className="text-lg">🚪</span>
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 overflow-x-hidden p-4 md:p-8 bg-zinc-50">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>

    </div>
  );
}