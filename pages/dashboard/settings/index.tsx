import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';

interface CompanyProfile {
  name: string;
  logoUrl: string;
  address: string;
  defaultNotes: string;
}

interface InvoiceNumbering {
  prefix: string;
  nextNumber: number;
  padding: number;
}

interface TaxSettings {
  taxLabel: string; // e.g. GST, VAT
  taxRate: number; // percentage
}

interface EmailTemplate {
  subject: string;
  body: string;
}

const Settings: React.FC = () => {
  // Load existing settings from localStorage mock
  const [company, setCompany] = useState<CompanyProfile>({ name: '', logoUrl: '', address: '', defaultNotes: '' });
  const [numbering, setNumbering] = useState<InvoiceNumbering>({ prefix: 'INV-', nextNumber: 1, padding: 4 });
  const [tax, setTax] = useState<TaxSettings>({ taxLabel: 'GST', taxRate: 0 });
  const [emailTmpl, setEmailTmpl] = useState<EmailTemplate>({ subject: 'Invoice {{invoiceNumber}}', body: 'Dear {{customerName}},\nPlease find attached invoice {{invoiceNumber}} with amount {{amount}}.' });

  useEffect(() => {
    const st = JSON.parse(localStorage.getItem('settings') || '{}');
    if (st.company) setCompany(st.company);
    if (st.numbering) setNumbering(st.numbering);
    if (st.tax) setTax(st.tax);
    if (st.emailTmpl) setEmailTmpl(st.emailTmpl);
  }, []);

  const save = () => {
    const payload = { company, numbering, tax, emailTmpl };
    localStorage.setItem('settings', JSON.stringify(payload));
    alert('Settings saved (localStorage mock).');
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Settings</h1>

        {/* Company Profile */}
        <section className="bg-white rounded-xl shadow-md p-6 space-y-4">
          <h2 className="text-lg font-medium text-gray-900">Company Profile</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
              <input type="text" value={company.name} onChange={(e) => setCompany({ ...company, name: e.target.value })} className="w-full border border-gray-300 rounded-lg p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL</label>
              <input type="text" value={company.logoUrl} onChange={(e) => setCompany({ ...company, logoUrl: e.target.value })} className="w-full border border-gray-300 rounded-lg p-2" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <textarea value={company.address} onChange={(e) => setCompany({ ...company, address: e.target.value })} className="w-full border border-gray-300 rounded-lg p-2" rows={3} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Default Invoice Notes</label>
              <textarea value={company.defaultNotes} onChange={(e) => setCompany({ ...company, defaultNotes: e.target.value })} className="w-full border border-gray-300 rounded-lg p-2" rows={3} />
            </div>
          </div>
        </section>

        {/* Invoice Numbering */}
        <section className="bg-white rounded-xl shadow-md p-6 space-y-4">
          <h2 className="text-lg font-medium text-gray-900">Invoice Numbering</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prefix</label>
              <input type="text" value={numbering.prefix} onChange={(e) => setNumbering({ ...numbering, prefix: e.target.value })} className="w-full border border-gray-300 rounded-lg p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Next Number</label>
              <input type="number" value={numbering.nextNumber} min={1} onChange={(e) => setNumbering({ ...numbering, nextNumber: Number(e.target.value) })} className="w-full border border-gray-300 rounded-lg p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Number Padding</label>
              <input type="number" value={numbering.padding} min={0} max={10} onChange={(e) => setNumbering({ ...numbering, padding: Number(e.target.value) })} className="w-full border border-gray-300 rounded-lg p-2" />
            </div>
          </div>
        </section>

        {/* Tax Settings */}
        <section className="bg-white rounded-xl shadow-md p-6 space-y-4">
          <h2 className="text-lg font-medium text-gray-900">Tax Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tax Label</label>
              <input type="text" value={tax.taxLabel} onChange={(e) => setTax({ ...tax, taxLabel: e.target.value })} className="w-full border border-gray-300 rounded-lg p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tax Rate (%)</label>
              <input type="number" value={tax.taxRate} min={0} step="0.01" onChange={(e) => setTax({ ...tax, taxRate: Number(e.target.value) })} className="w-full border border-gray-300 rounded-lg p-2" />
            </div>
          </div>
        </section>

        {/* Email Templates */}
        <section className="bg-white rounded-xl shadow-md p-6 space-y-4">
          <h2 className="text-lg font-medium text-gray-900">Email Templates</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <input type="text" value={emailTmpl.subject} onChange={(e) => setEmailTmpl({ ...emailTmpl, subject: e.target.value })} className="w-full border border-gray-300 rounded-lg p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Body (use {'{{placeholders}}'})</label>
              <textarea value={emailTmpl.body} onChange={(e) => setEmailTmpl({ ...emailTmpl, body: e.target.value })} className="w-full border border-gray-300 rounded-lg p-2" rows={6} />
            </div>
          </div>
        </section>

        {/* Save Button */}
        <div className="flex justify-end pb-10">
          <button onClick={save} className="btn-primary px-6 py-2 rounded-lg text-white">Save Settings</button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
