import { redirect } from 'next/navigation';

export default function DashboardPage() {
  // Automatically redirect to the primary MVP module
  redirect('/dashboard/creators');
}