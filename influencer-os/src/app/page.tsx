import { redirect } from 'next/navigation';

export default function RootPage() {
  // Bypass login entirely for testing and go straight to the dashboard
  redirect('/dashboard/creators');
}