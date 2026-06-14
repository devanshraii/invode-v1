'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/library/supabase';

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();
  
  // Data States
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [creators, setCreators] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 1. Listen for Cmd+K or Ctrl+K globally
 useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    const handleCustomOpen = () => setIsOpen(true);

    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('open-command-palette', handleCustomOpen);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('open-command-palette', handleCustomOpen);
    };
  }, []);

  // 2. Fetch searchable data only when the palette is opened
  useEffect(() => {
    if (isOpen && campaigns.length === 0) {
      const fetchSearchData = async () => {
        setIsLoading(true);
        try {
          const { data: { session } } = await supabase.auth.getSession();
          const userId = session?.user?.id;
          if (!userId) return;

          const [campRes, createRes] = await Promise.all([
            fetch(`/api/campaigns?userId=${userId}`),
            fetch(`/api/creators?userId=${userId}`)
          ]);

          if (campRes.ok) setCampaigns((await campRes.json()).campaigns || []);
          if (createRes.ok) setCreators((await createRes.json()).creators || []);
        } catch (err) {
          console.error('Error fetching search data', err);
        } finally {
          setIsLoading(false);
        }
      };
      fetchSearchData();
    }
  }, [isOpen]);

  // 3. Close palette and navigate
  const handleSelect = (href: string) => {
    setIsOpen(false);
    setSearchTerm('');
    router.push(href);
  };

  if (!isOpen) return null;

  // --- Filtering Logic ---
  const searchLower = searchTerm.toLowerCase();
  
  const filteredCampaigns = campaigns.filter(c => 
    c.name.toLowerCase().includes(searchLower) || c.client_brand?.toLowerCase().includes(searchLower)
  );
  
  const filteredCreators = creators.filter(c => 
    c.name.toLowerCase().includes(searchLower) || c.niche_category?.toLowerCase().includes(searchLower)
  );

  const quickActions = [
    { name: 'Add New Creator', href: '/dashboard/creators', icon: '👥' },
    { name: 'Log a Payment', href: '/dashboard/payments', icon: '💳' },
    { name: 'View Pending Approvals', href: '/dashboard/approvals', icon: '✅' },
  ].filter(a => a.name.toLowerCase().includes(searchLower));

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm z-[100] transition-opacity"
        onClick={() => setIsOpen(false)}
      />

      {/* Modal */}
      <div className="fixed top-[15%] left-1/2 -translate-x-1/2 w-full max-w-2xl bg-white rounded-xl shadow-2xl z-[101] overflow-hidden border border-zinc-200 flex flex-col max-h-[70vh]">
        
        {/* Search Input */}
        <div className="flex items-center px-4 border-b border-zinc-100 shrink-0">
          <svg className="w-5 h-5 text-zinc-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input 
            type="text"
            className="w-full py-5 text-lg outline-none text-zinc-900 placeholder:text-zinc-400 bg-transparent"
            placeholder="Search campaigns, creators, or actions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
          />
          <div className="text-xs font-medium text-zinc-400 bg-zinc-100 px-2 py-1 rounded border border-zinc-200">ESC</div>
        </div>

        {/* Results Area */}
        <div className="flex-1 overflow-y-auto p-2">
          {isLoading ? (
            <div className="p-4 text-sm text-zinc-500 text-center">Loading workspace data...</div>
          ) : (
            <>
              {/* Quick Actions */}
              {quickActions.length > 0 && (
                <div className="mb-4">
                  <div className="px-3 py-2 text-xs font-bold text-zinc-400 uppercase tracking-wider">Quick Actions</div>
                  {quickActions.map(action => (
                    <button 
                      key={action.name}
                      onClick={() => handleSelect(action.href)}
                      className="w-full flex items-center px-3 py-2.5 hover:bg-zinc-100 rounded-lg transition-colors text-left group"
                    >
                      <span className="mr-3 text-lg opacity-70 group-hover:opacity-100">{action.icon}</span>
                      <span className="text-sm font-medium text-zinc-900">{action.name}</span>
                      <svg className="w-4 h-4 ml-auto text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </button>
                  ))}
                </div>
              )}

              {/* Campaigns */}
              {filteredCampaigns.length > 0 && (
                <div className="mb-4">
                  <div className="px-3 py-2 text-xs font-bold text-zinc-400 uppercase tracking-wider">Campaigns</div>
                  {filteredCampaigns.map(campaign => (
                    <button 
                      key={campaign.id}
                      onClick={() => handleSelect(`/dashboard/campaigns/${campaign.id}`)}
                      className="w-full flex items-center px-3 py-2.5 hover:bg-zinc-100 rounded-lg transition-colors text-left group"
                    >
                      <div className="w-6 h-6 rounded bg-blue-100 text-blue-600 flex items-center justify-center mr-3 shrink-0 text-xs">📊</div>
                      <div>
                        <div className="text-sm font-medium text-zinc-900">{campaign.name}</div>
                        <div className="text-xs text-zinc-500">{campaign.client_brand || 'Brand Workspace'}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Creators */}
              {filteredCreators.length > 0 && (
                <div className="mb-2">
                  <div className="px-3 py-2 text-xs font-bold text-zinc-400 uppercase tracking-wider">Talent Network</div>
                  {filteredCreators.map(creator => (
                    <button 
                      key={creator.id}
                      onClick={() => handleSelect(`/dashboard/creators/${creator.id}`)} // Assumes you have a profile page, otherwise route to /dashboard/creators
                      className="w-full flex items-center px-3 py-2.5 hover:bg-zinc-100 rounded-lg transition-colors text-left group"
                    >
                      <div className="w-8 h-8 rounded-full bg-zinc-200 text-zinc-500 flex items-center justify-center mr-3 shrink-0 font-medium text-xs">
                        {creator.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-zinc-900">{creator.name}</div>
                        <div className="text-xs text-zinc-500">{creator.niche_category || 'Creator'} • ₹{(creator.pricing || 0).toLocaleString()}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* No Results */}
              {searchTerm && filteredCampaigns.length === 0 && filteredCreators.length === 0 && quickActions.length === 0 && (
                <div className="p-8 text-center text-sm text-zinc-500">
                  No results found for "<span className="text-zinc-900 font-medium">{searchTerm}</span>"
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}