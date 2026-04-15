import React from 'react';
import { PageTransition } from '../../components/ui/PageTransition';

const APIDocsPage = () => {
  return (
    <PageTransition>
      <div className="min-h-[calc(100vh-80px)] py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-8">API Documentation</h1>
          <div className="space-y-6 text-muted">
            <p className="text-lg">
              Integrate NexTradeX into your own applications using our REST and WebSocket APIs.
            </p>

            <h2 className="text-2xl font-semibold text-white pt-4">Base URLs</h2>
            <div className="bg-black/30 p-4 rounded-lg font-mono text-sm">
              <p>REST API: https://api.nextradex.sim/v1</p>
              <p>WebSocket: wss://ws.nextradex.sim</p>
            </div>

            <h2 className="text-2xl font-semibold text-white pt-4">Authentication</h2>
            <p>
              All API requests require an API key in the header:
            </p>
            <div className="bg-black/30 p-4 rounded-lg font-mono text-sm">
              Authorization: Bearer YOUR_API_KEY
            </div>

            <h2 className="text-2xl font-semibold text-white pt-4">Rate Limits</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>REST API: 120 requests per minute</li>
              <li>WebSocket: 100 messages per second</li>
            </ul>

            <h2 className="text-2xl font-semibold text-white pt-4">Endpoints</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="py-3 px-4 text-white font-semibold">Endpoint</th>
                    <th className="py-3 px-4 text-white font-semibold">Method</th>
                    <th className="py-3 px-4 text-white font-semibold">Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-white/5">
                    <td className="py-3 px-4 font-mono text-sm">/market/tickers</td>
                    <td className="py-3 px-4">GET</td>
                    <td className="py-3 px-4">Get all tickers</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="py-3 px-4 font-mono text-sm">/trade/order</td>
                    <td className="py-3 px-4">POST</td>
                    <td className="py-3 px-4">Place an order</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="py-3 px-4 font-mono text-sm">/account/balance</td>
                    <td className="py-3 px-4">GET</td>
                    <td className="py-3 px-4">Get account balance</td>
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

export default APIDocsPage;