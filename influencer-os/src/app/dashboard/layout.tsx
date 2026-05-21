'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/library/supabase';

// The 5 Core MVP Modules from the Founder Bible
const navigation = [
  { name: 'Creator CRM', href: '/dashboard/creators' },
  { name: 'Campaigns', href: '/dashboard/campaigns' },
  { name: 'Approvals', href: '/dashboard/approvals' },
  { name: 'Payments', href: '/dashboard/payments' },
  { name: 'Reports', href: '/dashboard/reports' },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div className="flex min-h-screen bg-zinc-50">
      {/* Sidebar */}
      <div className="w-64 border-r border-zinc-200 bg-white flex flex-col">
        <div className="flex h-16 shrink-0 items-center px-6 border-b border-zinc-200">
          <span className="text-lg font-bold text-zinc-900">Campaign OS</span>
        </div>
        
        <nav className="flex flex-1 flex-col px-4 py-4 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive
                    ? 'bg-zinc-100 text-zinc-900'
                    : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-zinc-200">
          <button
            onClick={handleSignOut}
            className="w-full px-3 py-2 text-sm font-medium text-left text-zinc-600 rounded-md hover:bg-zinc-50 hover:text-zinc-900"
          >
            Sign out
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}