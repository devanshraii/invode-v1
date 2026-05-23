'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/library/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accessCode, setAccessCode] = useState(''); // New state for the secret code
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // The secret code you will give to paying clients
  // In a real app, put this in your .env.local file, but hardcoding is fine for MVP testing
  const SECRET_INVITE_CODE = process.env.NEXT_PUBLIC_INVITE_CODE || 'INVODE-VIP-2026';

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      if (isLogin) {
        // --- LOG IN FLOW ---
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
        
        router.push('/dashboard/campaigns');
      } else {
        // --- SIGN UP FLOW (WITH BOUNCER) ---
        
        // 1. Check the access code before doing anything
        if (accessCode !== SECRET_INVITE_CODE) {
          throw new Error('Invalid or expired Workspace Invite Code.');
        }

        // 2. If code is correct, create the account
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { brand_name: 'Invode' } 
          }
        });
        if (signUpError) throw signUpError;
        
        setSuccessMessage('Workspace created! You can now sign in with these credentials.');
        setIsLogin(true); 
        setPassword(''); 
        setAccessCode('');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4 selection:bg-zinc-200">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-zinc-200 p-8">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
            Invode<span className="text-zinc-500"></span>
          </h1>
          <p className="text-sm text-zinc-500 mt-2">
            {isLogin ? 'Log in to your workspace.' : 'Create your brand workspace.'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md border border-red-200 text-sm mb-4">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="bg-green-50 text-green-700 p-3 rounded-md border border-green-200 text-sm mb-4">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email">Team Email</Label>
            <Input 
              id="email" 
              type="email" 
              required 
              placeholder="team@yourbrand.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input 
              id="password" 
              type="password" 
              required 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* ONLY SHOW THIS FIELD DURING SIGN UP */}
          {!isLogin && (
            <div className="space-y-2 p-4 bg-zinc-50 rounded-lg border border-zinc-200">
              <Label htmlFor="accessCode" className="text-zinc-700">Workspace Invite Code</Label>
              <Input 
                id="accessCode" 
                type="text" 
                required 
                placeholder="Enter code provided after payment"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                className="bg-white"
              />
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full bg-zinc-900 hover:bg-zinc-800 text-white rounded-md h-11 text-base font-medium transition-colors"
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Workspace'}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-zinc-600">
          {isLogin ? "Ready to join? " : "Already have an account? "}
          <button 
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
              setSuccessMessage('');
            }}
            className="font-semibold text-zinc-900 hover:underline focus:outline-none"
          >
            {isLogin ? 'Contact Sales' : 'Sign In'}
          </button>
        </div>
        
      </div>
    </div>
  );
}