import React from 'react';
import { PageTransition } from '../../components/ui/PageTransition';

const UserGuidePage = () => {
  return (
    <PageTransition>
      <div className="min-h-[calc(100vh-80px)] py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-8">User Guide</h1>
          <div className="space-y-6 text-muted">
            <h2 className="text-2xl font-semibold text-white pt-4">Getting Started</h2>
            <ol className="list-decimal list-inside space-y-2">
              <li>Create an account or sign in</li>
              <li>Navigate to the Dashboard to see your virtual balance</li>
              <li>Start trading in Spot, Futures, or Options markets</li>
            </ol>

            <h2 className="text-2xl font-semibold text-white pt-4">Spot Trading</h2>
            <p>
              Spot trading involves buying and selling cryptocurrencies at current market prices. 
              Go to Trade → Spot to start.
            </p>

            <h2 className="text-2xl font-semibold text-white pt-4">Futures Trading</h2>
            <p>
              Futures allow you to trade with leverage. Go to Trade → Futures. 
              Remember that leverage amplifies both gains and losses.
            </p>

            <h2 className="text-2xl font-semibold text-white pt-4">Options Trading</h2>
            <p>
              Options give you the right to buy (call) or sell (put) an asset at a specific price. 
              Go to Trade → Options to explore strategies.
            </p>

            <h2 className="text-2xl font-semibold text-white pt-4">Managing Your Portfolio</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>View all your holdings on the Dashboard</li>
              <li>Check your order history on the Orders page</li>
              <li>Manage your wallets and transactions</li>
            </ul>

            <h2 className="text-2xl font-semibold text-white pt-4">Tips for Success</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>Start with small positions to understand the mechanics</li>
              <li>Use stop-loss orders to manage risk</li>
              <li>Study technical analysis and market trends</li>
              <li>Keep a trading journal to track your decisions</li>
            </ul>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default UserGuidePage;