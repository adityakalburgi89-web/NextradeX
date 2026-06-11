import React from 'react';
import { PageTransition } from '../../components/ui/PageTransition';

const SettlementPricesPage = () => {
  return (
    <PageTransition>
      <div className="min-h-[calc(100vh-80px)] py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-foreground mb-8">Settlement Prices</h1>
          <div className="space-y-6 text-muted">
            <p>
              Settlement prices are used for position marking, profit/loss calculation, 
              and liquidation on futures and options contracts.
            </p>

            <h2 className="text-2xl font-semibold text-foreground pt-4">How Settlement Prices are Calculated</h2>
            <p>
              Settlement prices are calculated as the volume-weighted average price (VWAP) 
              of the last 15 minutes of trading before market close.
            </p>

            <h2 className="text-2xl font-semibold text-foreground pt-4">Settlement Sources</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>Spot Markets: Major exchange spot prices</li>
              <li>Futures: Aggregated price feed from major futures exchanges</li>
              <li>Options: Theoretical pricing model based on underlying</li>
            </ul>

            <h2 className="text-2xl font-semibold text-foreground pt-4">Update Frequency</h2>
            <p>
              Settlement prices are updated every 5 seconds during market hours. 
              Final settlement occurs at 08:00 UTC daily.
            </p>

            <h2 className="text-2xl font-semibold text-foreground pt-4">Dispute Resolution</h2>
            <p>
              If you believe there is an error in the settlement price, please contact 
              support within 24 hours of the settlement time with your concerns.
            </p>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default SettlementPricesPage;