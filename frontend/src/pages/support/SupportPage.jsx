import React from 'react';
import { PageTransition } from '../../components/ui/PageTransition';

const SupportPage = () => {
  return (
    <PageTransition>
      <div className="min-h-[calc(100vh-80px)] py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-8">Support Center</h1>
          <div className="space-y-6 text-muted">
            <p className="text-lg">
              Need help? We're here to assist you with any questions or issues.
            </p>

            <h2 className="text-2xl font-semibold text-white pt-4">Contact Us</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>Email: support@nextradex.sim</li>
              <li>Response time: Within 24-48 hours</li>
            </ul>

            <h2 className="text-2xl font-semibold text-white pt-4">Common Issues</h2>
            <div className="space-y-4">
              <div className="bg-white/5 p-4 rounded-lg">
                <h3 className="text-white font-semibold mb-2">Can't log in?</h3>
                <p>Try resetting your password or contact support for account recovery assistance.</p>
              </div>
              <div className="bg-white/5 p-4 rounded-lg">
                <h3 className="text-white font-semibold mb-2">Virtual balance not updating?</h3>
                <p>Refresh the page or clear your browser cache. If the issue persists, contact support.</p>
              </div>
              <div className="bg-white/5 p-4 rounded-lg">
                <h3 className="text-white font-semibold mb-2">Order not executing?</h3>
                <p>Check your available balance and ensure the price is within acceptable range.</p>
              </div>
            </div>

            <h2 className="text-2xl font-semibold text-white pt-4">FAQ</h2>
            <details className="bg-white/5 p-4 rounded-lg cursor-pointer">
              <summary className="text-white font-semibold">Is this a real trading platform?</summary>
              <p className="mt-2">No, NexTradeX is a paper trading simulation for educational purposes only. No real money is involved.</p>
            </details>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default SupportPage;