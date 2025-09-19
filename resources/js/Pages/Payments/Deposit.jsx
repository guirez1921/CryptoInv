import React from 'react';
import { Head, useForm } from '@inertiajs/react';

export default function Deposit({ user }) {
  const { data, setData, post, processing, errors } = useForm({
    amount: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    post(route('payments.deposit'));
  };

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <Head title="Deposit Funds" />
      <div className="max-w-md mx-auto bg-gray-800 p-8 rounded-xl shadow-xl">
        <h1 className="text-2xl font-bold text-white mb-6">Deposit Funds</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-300 mb-2">Amount</label>
            <input
              type="number"
              min="10"
              className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white"
              value={data.amount}
              onChange={e => setData('amount', e.target.value)}
              required
            />
            {errors.amount && <div className="text-red-400 text-sm mt-1">{errors.amount}</div>}
          </div>
          <button type="submit" disabled={processing} className="w-full py-2 bg-cyan-600 text-white rounded-lg font-semibold hover:bg-cyan-700 transition">
            {processing ? 'Processing...' : 'Deposit'}
          </button>
        </form>
      </div>
    </div>
  );
}
