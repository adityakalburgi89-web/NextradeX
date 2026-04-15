import React from 'react';
import { PageTransition } from '../../components/ui/PageTransition';

const TradingFeesPage = () => {
  return (
    <PageTransition>
      <div className="min-h-[calc(100vh-80px)] py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-8">Trading Fees</h1>
          <div className="space-y-6 text-muted">
            <p className="text-lg">
              NexTradeX is a paper trading simulation for educational purposes. 
              The following fee structure is simulated for practice purposes.
            </p>

            <h2 className="text-2xl font-semibold text-white pt-4">Spot Trading Fees</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="py-3 px-4 text-white font-semibold">Action</th>
                    <th className="py-3 px-4 text-white font-semibold">Fee Rate</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-white/5">
                    <td className="py-3 px-4">Maker Fee</td>
                    <td className="py-3 px-4">0.1%</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="py-3 px-4">Taker Fee</td>
                    <td className="py-3 px-4">0.2%</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2 className="text-2xl font-semibold text-white pt-8">Futures Trading Fees</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="py-3 px-4 text-white font-semibold">Action</th>
                    <th className="py-3 px-4 text-white font-semibold">Fee Rate</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-white/5">
                    <td className="py-3 px-4">Maker Fee</td>
                    <td className="py-3 px-4">0.02%</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="py-3 px-4">Taker Fee</td>
                    <td className="py-3 px-4">0.05%</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="py-3 px-4">Funding Rate</td>
                    <td className="py-3 px-4">0.01% / 8h (varies)</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2 className="text-2xl font-semibold text-white pt-8">Options Trading Fees</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="py-3 px-4 text-white font-semibold">Action</th>
                    <th className="py-3 px-4 text-white font-semibold">Fee Rate</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-white/5">
                    <td className="py-3 px-4">Opening Order</td>
                    <td className="py-3 px-4">0.03%</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="py-3 px-4">Closing Order</td>
                    <td className="py-3 px-4">0.03%</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="py-3 px-4">Exercise/Assignment</td>
                    <td className="py-3 px-4">0.05%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default TradingFeesPage;