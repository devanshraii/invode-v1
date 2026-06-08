'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/library/supabase';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const verifyUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/login'); 
      } else {
        setIsCheckingAuth(false); 
      }
    };
    
    verifyUser();
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const navigation = [
    { 
      name: 'Campaigns', 
      href: '/dashboard/campaigns', 
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
        </svg>
      )
    },
    { 
      name: 'Talent Network', 
      href: '/dashboard/creators', 
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      )
    },
    { 
      name: 'Approvals', 
      href: '/dashboard/approvals', 
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M15 2H9a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1Z"/><path d="m9 14 2 2 4-4"/>
        </svg>
      )
    },
    { 
      name: 'Payments', 
      href: '/dashboard/payments', 
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/>
        </svg>
      )
    },
    { 
      name: 'Reports', 
      href: '/dashboard/reports', 
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" x2="18" y1="20" y2="10"/><line x1="12" x2="12" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="14"/>
        </svg>
      )
    },
  ];

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="text-zinc-500 font-medium">Verifying access...</div>
      </div>
    );
  }

  return (
    // FIX 1: Changed min-h-screen to exactly h-screen
    <div className="h-screen w-full bg-zinc-50 flex flex-col md:flex-row overflow-hidden">
      
      {/* Mobile Top Bar */}
      {/* FIX 2: Added shrink-0 so it never collapses vertically */}
      <div className="md:hidden flex items-center justify-between bg-zinc-900 text-white p-4 z-50 shadow-md shrink-0">
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

      {/* Collapsible Sidebar Navigation */}
      <div className={`
        ${isMobileMenuOpen ? 'block w-full' : 'hidden'} 
        md:flex flex-col bg-zinc-900 text-zinc-300 z-40 transition-all duration-300 ease-in-out shadow-xl shrink-0
        ${isCollapsed ? 'md:w-20' : 'md:w-64'}
      `}>
        
        {/* Sidebar Header & Toggle */}
        <div className={`p-6 hidden md:flex items-center border-b border-zinc-800 transition-all duration-300 ${isCollapsed ? 'justify-center px-4' : 'justify-between'}`}>
          {!isCollapsed ? (
            <div className="text-2xl font-bold text-white tracking-tight truncate">Campaign<span className="text-zinc-500">OS</span></div>
          ) : (
            <div className="text-2xl font-bold text-white tracking-tight">C<span className="text-zinc-500">O</span></div>
          )}
          
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:block text-zinc-500 hover:text-white transition-colors focus:outline-none shrink-0"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isCollapsed ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              )}
            </svg>
          </button>
        </div>
        
        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto overflow-x-hidden">
          {navigation.map((item) => {
            const isActive = pathname.includes(item.href);
            return (
              <Link 
                key={item.name} 
                href={item.href}
                title={isCollapsed ? item.name : ""} 
                onClick={() => setIsMobileMenuOpen(false)} 
                className={`flex items-center py-3 rounded-lg transition-all duration-200 ${
                  isCollapsed ? 'justify-center px-0' : 'space-x-3 px-4'
                } ${
                  isActive 
                    ? 'bg-zinc-800 text-white font-medium shadow-sm' 
                    : 'hover:bg-zinc-800 hover:text-white'
                }`}
              >
                <span className="shrink-0">{item.icon}</span>
                {!isCollapsed && <span className="truncate text-sm font-medium">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Footer / Sign Out */}
        <div className="p-4 border-t border-zinc-800 shrink-0">
          <button 
            onClick={handleSignOut}
            title={isCollapsed ? "Sign Out" : ""}
            className={`w-full flex items-center py-3 rounded-lg hover:bg-zinc-800 hover:text-red-400 transition-all duration-200 ${
              isCollapsed ? 'justify-center px-0 text-red-500' : 'space-x-3 px-4'
            }`}
          >
            <span className="shrink-0">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/>
              </svg>
            </span>
            {!isCollapsed && <span className="truncate text-sm font-medium">Sign Out</span>}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {/* FIX 3: Added overflow-y-auto directly to the main canvas */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8 bg-zinc-50 relative">
        <div className="max-w-[1600px] mx-auto h-full">
          {children}
        </div>
      </main>

    </div>
  );
}