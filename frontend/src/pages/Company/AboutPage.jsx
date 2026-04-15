import React from 'react';
import { PageTransition } from '../../components/ui/PageTransition';

const AboutPage = () => {
  return (
    <PageTransition>
      <div className="min-h-[calc(100vh-80px)] py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-8">About Us</h1>
          <div className="space-y-6 text-muted">
            <p>
              NexTradeX is a cutting-edge paper trading simulation platform designed for educational purposes. 
              We provide a risk-free environment for traders to practice and hone their trading strategies 
              without risking real capital.
            </p>
            <p>
              Our platform offers comprehensive trading experiences across multiple markets including spot, 
              futures, and options trading. We simulate real-market conditions to give users the most 
              authentic trading experience possible.
            </p>
            <h2 className="text-2xl font-semibold text-white pt-4">Our Mission</h2>
            <p>
              To empower traders of all levels with the knowledge and skills needed to navigate financial 
              markets confidently through realistic simulation and education.
            </p>
            <h2 className="text-2xl font-semibold text-white pt-4">Key Features</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>Spot Trading - Trade cryptocurrencies with zero risk</li>
              <li>Futures Trading - Practice leverage and margin trading</li>
              <li>Options Trading - Learn options strategies</li>
              <li>Real-time market simulation</li>
              <li>Portfolio tracking and analytics</li>
            </ul>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default AboutPage;