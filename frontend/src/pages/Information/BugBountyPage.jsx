import React from 'react';
import { PageTransition } from '../../components/ui/PageTransition';

const BugBountyPage = () => {
  return (
    <PageTransition>
      <div className="min-h-[calc(100vh-80px)] py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-8">Bug Bounty Program</h1>
          <div className="space-y-6 text-muted">
            <p className="text-lg">
              Help us improve NexTradeX by reporting security vulnerabilities. 
              We appreciate your efforts to keep our platform secure.
            </p>

            <h2 className="text-2xl font-semibold text-white pt-4">Scope</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>Web application vulnerabilities</li>
              <li>API security issues</li>
              <li>Authentication and authorization flaws</li>
              <li>Data protection concerns</li>
            </ul>

            <h2 className="text-2xl font-semibold text-white pt-4">Out of Scope</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>Social engineering attacks</li>
              <li>Physical security vulnerabilities</li>
              <li>Denial of service attacks</li>
              <li>Issues in third-party services</li>
            </ul>

            <h2 className="text-2xl font-semibold text-white pt-4">Rewards</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="py-3 px-4 text-white font-semibold">Severity</th>
                    <th className="py-3 px-4 text-white font-semibold">Reward (Virtual USD)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-white/5">
                    <td className="py-3 px-4">Critical</td>
                    <td className="py-3 px-4">$5,000 - $10,000</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="py-3 px-4">High</td>
                    <td className="py-3 px-4">$1,000 - $5,000</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="py-3 px-4">Medium</td>
                    <td className="py-3 px-4">$250 - $1,000</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="py-3 px-4">Low</td>
                    <td className="py-3 px-4">$50 - $250</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2 className="text-2xl font-semibold text-white pt-4">How to Report</h2>
            <p>
              Email your findings to security@nextradex.sim with detailed steps to reproduce 
              the vulnerability and potential impact.
            </p>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default BugBountyPage;