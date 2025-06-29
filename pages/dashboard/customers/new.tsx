import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useRouter } from 'next/router';
import DashboardLayout from '@/components/layout/DashboardLayout';

const NewCustomer: React.FC = () => {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [gstin, setGstin] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!name.trim()) {
      alert('Name is required');
      return;
    }

    const newCustomer = {
      id: uuidv4(),
      name,
      email,
      phone,
      address,
      gstin,
      notes,
      createdAt: new Date().toISOString(),
    };

    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone }),
      });
      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error || 'Failed to save');
      }
      alert('Customer saved');
      router.push('/dashboard/customers');
    } catch (err) {
      console.error(err);
      alert('Failed to save customer');
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md p-8">
        <h1 className="text-2xl font-bold mb-6 text-gray-900">Add Customer</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="customer-name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              id="customer-name"
              name="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
              autoComplete="name"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="customer-email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                id="customer-email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                autoComplete="email"
              />
            </div>
            <div>
              <label htmlFor="customer-phone" className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                id="customer-phone"
                name="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                autoComplete="tel"
              />
            </div>
          </div>
          <div>
            <label htmlFor="customer-address" className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <textarea
              id="customer-address"
              name="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows={3}
              autoComplete="street-address"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="customer-gstin" className="block text-sm font-medium text-gray-700 mb-1">GSTIN</label>
              <input
                id="customer-gstin"
                name="gstin"
                type="text"
                value={gstin}
                onChange={(e) => setGstin(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                autoComplete="off"
              />
            </div>
          </div>
          <div>
            <label htmlFor="customer-notes" className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              id="customer-notes"
              name="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows={4}
              autoComplete="off"
            />
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary px-4 py-2 rounded-lg text-white">
              Save Customer
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default NewCustomer;
