import React from 'react';
import { PageTransition } from '../../components/ui/PageTransition';

const ReferralPage = () => {
  return (
    <PageTransition>
      <div className="min-h-[calc(100vh-80px)] py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-8">Referral Program</h1>
          <div className="space-y-6 text-muted">
            <p className="text-lg">
              Invite friends to join NexTradeX and earn virtual credits! 
              Share your referral link and earn when they start trading.
            </p>

            <h2 className="text-2xl font-semibold text-white pt-4">How It Works</h2>
            <ol className="list-decimal list-inside space-y-2">
              <li>Share your unique referral link with friends</li>
              <li>Your friend signs up and completes their first trade</li>
              <li>You both receive 500 virtual USDT bonus</li>
            </ol>

            <h2 className="text-2xl font-semibold text-white pt-4">Rewards</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="py-3 px-4 text-white font-semibold">Action</th>
                    <th className="py-3 px-4 text-white font-semibold">Reward</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-white/5">
                    <td className="py-3 px-4">Friend signs up</td>
                    <td className="py-3 px-4">100 USDT</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="py-3 px-4">First trade completed</td>
                    <td className="py-3 px-4">+400 USDT</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="py-3 px-4">Referrer bonus</td>
                    <td className="py-3 px-4">500 USDT</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2 className="text-2xl font-semibold text-white pt-4">Terms</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>Referral must be a new user to NexTradeX</li>
              <li>Both parties must complete identity verification</li>
              <li>Minimum 10 trades required to unlock rewards</li>
              <li>Maximum 20 referrals per month</li>
            </ul>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default ReferralPage;