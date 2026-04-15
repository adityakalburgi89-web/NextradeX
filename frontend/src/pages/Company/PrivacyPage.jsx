import React from 'react';
import { PageTransition } from '../../components/ui/PageTransition';

const PrivacyPage = () => {
  return (
    <PageTransition>
      <div className="min-h-[calc(100vh-80px)] py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-8">Privacy Policy</h1>
          <div className="space-y-6 text-muted">
            <h2 className="text-2xl font-semibold text-white pt-4">Information We Collect</h2>
            <p>
              We collect information you provide directly to us, including account information 
              such as username and email when you create an account.
            </p>
            
            <h2 className="text-2xl font-semibold text-white pt-4">How We Use Information</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>To provide and maintain our services</li>
              <li>To improve and personalize your experience</li>
              <li>To communicate with you about updates and support</li>
              <li>To enforce our terms and conditions</li>
            </ul>
            
            <h2 className="text-2xl font-semibold text-white pt-4">Data Security</h2>
            <p>
              We implement appropriate security measures to protect your personal information. 
              However, no method of transmission over the Internet is 100% secure.
            </p>
            
            <h2 className="text-2xl font-semibold text-white pt-4">Cookies</h2>
            <p>
              We use cookies to enhance your experience. You can set your browser to refuse 
              all or some browser cookies, but this may affect your ability to use our services.
            </p>
            
            <h2 className="text-2xl font-semibold text-white pt-4">Third-Party Services</h2>
            <p>
              We may share information with third-party service providers who assist us in 
              operating our platform, subject to appropriate confidentiality obligations.
            </p>
            
            <h2 className="text-2xl font-semibold text-white pt-4">Changes to Policy</h2>
            <p>
              We may update this policy from time to time. We will notify you of any changes 
              by posting the new policy on this page.
            </p>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default PrivacyPage;