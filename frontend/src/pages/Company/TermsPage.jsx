import React from 'react';
import { PageTransition } from '../../components/ui/PageTransition';

const TermsPage = () => {
  return (
    <PageTransition>
      <div className="min-h-[calc(100vh-80px)] py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-foreground mb-8">Terms of Service</h1>
          <div className="space-y-6 text-muted">
            <h2 className="text-2xl font-semibold text-foreground pt-4">Acceptance of Terms</h2>
            <p>
              By accessing and using NexTradeX, you accept and agree to be bound by the terms and 
              provision of this agreement.
            </p>
            
            <h2 className="text-2xl font-semibold text-foreground pt-4">Educational Purpose</h2>
            <p>
              NexTradeX is a paper trading simulation platform for educational purposes only. 
              All trades made on this platform are simulated and no real assets are traded. 
              Any virtual funds provided are for practice purposes only and have no real monetary value.
            </p>
            
            <h2 className="text-2xl font-semibold text-foreground pt-4">User Responsibilities</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>Users must be at least 18 years of age</li>
              <li>Users are responsible for maintaining account security</li>
              <li>Users agree not to use the platform for any illegal purposes</li>
              <li>Users understand that past performance does not guarantee future results</li>
            </ul>
            
            <h2 className="text-2xl font-semibold text-foreground pt-4">Disclaimer</h2>
            <p>
              NexTradeX makes no warranties, express or implied, about the accuracy or completeness 
              of any information provided on this platform. Trading financial instruments carries 
              significant risk and may not be suitable for all investors.
            </p>
            
            <h2 className="text-2xl font-semibold text-foreground pt-4">Limitation of Liability</h2>
            <p>
              NexTradeX shall not be liable for any direct, indirect, incidental, or consequential 
              damages arising from the use of this platform.
            </p>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default TermsPage;