import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { PageTransition } from '../components/ui/PageTransition';

const CareersPage = () => {
  return (
    <PageTransition>
      <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center px-4 py-12">
        <motion.div 
          className="relative z-10 flex flex-col items-center text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="relative text-[8rem] md:text-[12rem] font-black leading-none tracking-tighter text-white">
            <span className="animate-pulse opacity-10 absolute -inset-1 blur-lg text-primary">404</span>
            <span style={{ textShadow: '2px 0 red, -2px 0 blue' }}>404</span>
          </h1>

          <div className="space-y-4 max-w-md">
            <h2 className="text-2xl md:text-3xl font-semibold text-white tracking-tight">
              Careers Coming Soon
            </h2>
            <p className="text-muted text-lg leading-relaxed">
              We are not currently hiring, but check back soon! 
              Follow us for updates on future opportunities.
            </p>
          </div>

          <div className="mt-12">
            <a 
              href="/" 
              className="group flex items-center gap-2 text-muted hover:text-white transition-colors"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm font-medium border-b border-transparent group-hover:border-white transition-all">Go Home</span>
            </a>
          </div>
        </motion.div>
      </div>
    </PageTransition>
  );
};

export default CareersPage;