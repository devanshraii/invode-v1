'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/library/supabase';
import { Button } from '@/components/ui/button';

export default function DocumentGeneratorPage() {
  const params = useParams();
  const router = useRouter();
  const paymentId = params.id as string;

  const [docData, setDocData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (paymentId) fetchDocumentData();
  }, [paymentId]);

  const fetchDocumentData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      if (!userId) return;

      const res = await fetch(`/api/invoices?id=${paymentId}&userId=${userId}`);
      if (!res.ok) throw new Error('Failed to fetch document data');
      
      const data = await res.json();
      setDocData(data.documentData);
    } catch (err) {
      console.error(err);
      alert('Error loading document.');
      router.push('/dashboard/payments');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) return <div className="p-8 text-zinc-500">Generating Document...</div>;
  if (!docData) return null;

  // Generate a clean Invoice Number using the payment ID
  const invoiceNumber = `INV-${docData.id.split('-')[0].toUpperCase()}`;
  const issueDate = new Date().toLocaleDateString();
  const dueDate = docData.due_date ? new Date(docData.due_date).toLocaleDateString() : 'Upon Receipt';

  return (
    <div className="min-h-screen bg-zinc-100 py-8 px-4 print:bg-white print:py-0 print:px-0">
      
      {/* Action Bar - Hidden during printing */}
      <div className="max-w-4xl mx-auto mb-6 flex items-center justify-between print:hidden">
        <Button variant="ghost" onClick={() => router.back()}>← Back to Ledger</Button>
        <div className="space-x-3">
          <Button onClick={handlePrint} className="bg-zinc-900 text-white">
            <span className="mr-2">📄</span> Save as PDF
          </Button>
        </div>
      </div>

      {/* The A4 Document Container */}
      <div className="max-w-4xl mx-auto bg-white border border-zinc-200 shadow-xl print:shadow-none print:border-none p-12 sm:p-20 text-zinc-900 font-sans">
        
        {/* Document Header */}
        <div className="flex justify-between items-start mb-16">
          <div>
            <h1 className="text-4xl font-black tracking-tight mb-1">Invode<span className="text-zinc-400"></span></h1>
            <p className="text-sm text-zinc-500">Influencer Work Order & Invoice</p>
          </div>
          <div className="text-right space-y-1">
            <div className="text-xl font-bold text-zinc-800">{invoiceNumber}</div>
            <div className="text-sm text-zinc-500">Date of Issue: {issueDate}</div>
            <div className="text-sm text-zinc-500">Status: <span className={docData.status === 'Paid' ? 'text-green-600 font-bold' : 'text-amber-600 font-bold'}>{docData.status.toUpperCase()}</span></div>
          </div>
        </div>

        {/* Entity Information */}
        <div className="grid grid-cols-2 gap-12 mb-16">
          <div>
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">Prepared For (Brand)</h3>
            <p className="font-bold text-xl text-zinc-900">
              {docData.campaigns?.client_brand || docData.campaigns?.name}
            </p>
            <p className="font-semibold text-lg">{docData.campaigns?.name}</p>
            <p className="text-sm text-zinc-600 mt-1">Campaign Budget: ₹{(docData.campaigns?.budget || 0).toLocaleString()}</p>
            <p className="text-sm text-zinc-600">Invode Managed Workspace</p>
          </div>
          <div>
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">Contractor (Creator)</h3>
            <p className="font-semibold text-lg">{docData.creators?.name}</p>
            <p className="text-sm text-zinc-600 mt-1">{docData.creators?.email || 'Email not provided'}</p>
            <p className="text-sm text-zinc-600">{docData.creators?.phone_number || 'Phone not provided'}</p>
            <p className="text-sm text-zinc-600">GST Status: {docData.creators?.gst_status ? 'Registered' : 'Unregistered'}</p>
          </div>
        </div>

        {/* Deliverables / Line Items Table */}
        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">Statement of Work & Fees</h3>
        <div className="border border-zinc-200 rounded-lg overflow-hidden mb-8">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 border-b border-zinc-200">
              <tr>
                <th className="py-3 px-4 font-semibold text-zinc-700">Description</th>
                <th className="py-3 px-4 font-semibold text-zinc-700 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              <tr>
                <td className="py-4 px-4 text-zinc-800">
                  <div className="font-medium">Campaign Deliverables Execution</div>
                  <div className="text-zinc-500 mt-1">{docData.notes || 'As per agreed terms for the campaign.'}</div>
                </td>
                <td className="py-4 px-4 text-zinc-900 font-medium text-right">
                  ₹{Number(docData.amount).toLocaleString()}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Totals & Payment Terms */}
        <div className="flex justify-end mb-16">
          <div className="w-1/2">
            <div className="flex justify-between py-2 border-b border-zinc-100 text-sm">
              <span className="text-zinc-500">Agreed Base Fee</span>
              <span className="font-medium text-zinc-900">₹{Number(docData.amount).toLocaleString()}</span>
            </div>
            {/* We remove the '₹0' and replace it with a professional disclaimer */}
            <div className="flex justify-between py-2 border-b border-zinc-100 text-sm">
              <span className="text-zinc-500">Taxes & TDS</span>
              <span className="font-medium text-zinc-500 text-right text-xs">Calculated & settled<br/>directly by Brand</span>
            </div>
            <div className="flex justify-between py-4 text-lg font-bold">
              <span className="text-zinc-900">Gross Total</span>
              <span className="text-zinc-900">₹{Number(docData.amount).toLocaleString()}</span>
            </div>
            <p className="text-right text-xs text-zinc-500 mt-1">Payment Due By: {dueDate}</p>
          </div>
        </div>

        {/* NEW: Terms & Legal Disclaimer */}
        <div className="mb-12 border border-zinc-200 bg-zinc-50 rounded-lg p-6 text-[11px] leading-relaxed text-zinc-500 print:border-zinc-300 print:bg-transparent">
          <h4 className="font-bold text-zinc-700 uppercase tracking-wider mb-2 text-[10px]">Standard Terms & Platform Disclaimer</h4>
          <ol className="list-decimal pl-4 space-y-1.5">
            <li><strong>Independent Agreement:</strong> This document constitutes an independent legal agreement strictly between the listed Brand and the Creator.</li>
            <li><strong>Platform Role:</strong> Invode acts exclusively as a Software-as-a-Service (SaaS) utility to facilitate operational tracking and document generation. Invode is not a party to this agreement.</li>
            <li><strong>No Liability:</strong> Invode assumes no liability, obligation, or responsibility regarding the execution of campaign deliverables, intellectual property disputes, or the processing, collection, or settlement of the financial transactions listed herein.</li>
            <li><strong>Payment Settlement:</strong> All payments are to be settled directly between the Brand and Creator through their mutually agreed-upon financial channels outside of the Invode platform.</li>
          </ol>
        </div>

        {/* Legal Signatures */}
        <div className="grid grid-cols-2 gap-12 pt-16 border-t border-zinc-200">
          <div>
            <div className="h-16 border-b border-zinc-300 mb-2"></div>
            <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Brand Authorization</p>
          </div>
          <div>
            <div className="h-16 border-b border-zinc-300 mb-2"></div>
            <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Creator Acceptance</p>
          </div>
        </div>
        
        <div className="mt-12 text-center text-xs text-zinc-400">
          Generated securely via Invode.
        </div>

      </div>
    </div>
  );
}