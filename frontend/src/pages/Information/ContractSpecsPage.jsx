import React from 'react';
import { PageTransition } from '../../components/ui/PageTransition';

const ContractSpecsPage = () => {
  return (
    <PageTransition>
      <div className="min-h-[calc(100vh-80px)] py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-8">Contract Specifications</h1>
          <div className="space-y-6 text-muted">
            <h2 className="text-2xl font-semibold text-white pt-4">Spot Trading</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="py-3 px-4 text-white font-semibold">Asset</th>
                    <th className="py-3 px-4 text-white font-semibold">Min Trade</th>
                    <th className="py-3 px-4 text-white font-semibold">Max Trade</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-white/5">
                    <td className="py-3 px-4">BTC/USDT</td>
                    <td className="py-3 px-4">0.0001 BTC</td>
                    <td className="py-3 px-4">100 BTC</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="py-3 px-4">ETH/USDT</td>
                    <td className="py-3 px-4">0.001 ETH</td>
                    <td className="py-3 px-4">1000 ETH</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="py-3 px-4">SOL/USDT</td>
                    <td className="py-3 px-4">0.01 SOL</td>
                    <td className="py-3 px-4">10000 SOL</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2 className="text-2xl font-semibold text-white pt-8">Futures Trading</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="py-3 px-4 text-white font-semibold">Contract</th>
                    <th className="py-3 px-4 text-white font-semibold">Contract Size</th>
                    <th className="py-3 px-4 text-white font-semibold">Max Leverage</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-white/5">
                    <td className="py-3 px-4">BTC-PERPETUAL</td>
                    <td className="py-3 px-4">0.01 BTC</td>
                    <td className="py-3 px-4">50x</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="py-3 px-4">ETH-PERPETUAL</td>
                    <td className="py-3 px-4">0.1 ETH</td>
                    <td className="py-3 px-4">50x</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2 className="text-2xl font-semibold text-white pt-8">Options Trading</h2>
            <div className="space-y-2">
              <p><strong className="text-white">Contract Types:</strong> Call and Put options</p>
              <p><strong className="text-white">Expiration:</strong> Daily, Weekly, Monthly</p>
              <p><strong className="text-white">Settlement:</strong> Cash settled</p>
              <p><strong className="text-white">Style:</strong> American (exercise anytime before expiry)</p>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default ContractSpecsPage;