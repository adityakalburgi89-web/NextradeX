import React from "react";
import { PageTransition } from "../../components/ui/PageTransition";
import { CheckCircle2, Activity, Server, Radio, Database } from "lucide-react";

export default function SystemStatusPage() {
  const services = [
    { name: "Trading API Services", status: "Operational", icon: Server },
    { name: "Live Market Price Streaming", status: "Operational", icon: Radio },
    { name: "Order Processing Engine", status: "Operational", icon: Activity },
    { name: "Notification & Alert Services", status: "Operational", icon: Database },
    { name: "Account & Login Security", status: "Operational", icon: CheckCircle2 },
  ];

  return (
    <PageTransition>
      <div className="min-h-screen py-16 sm:py-24 px-6 sm:px-10 lg:px-16 bg-background text-foreground">
        <div className="max-w-5xl mx-auto space-y-16 sm:space-y-24">
          
          {/* Header */}
          <div className="space-y-6 pt-4 sm:pt-8 mb-12 sm:mb-16 text-center sm:text-left">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight font-heading leading-[1.15] text-foreground">
              NexTradeX System Status
            </h1>
            <p className="text-foreground/80 text-base sm:text-xl leading-relaxed max-w-2xl font-medium">
              Live status and health updates for all NexTradeX services.
            </p>
          </div>

          {/* System Services Status */}
          <div className="rounded-[32px] border border-border bg-card overflow-hidden divide-y divide-border shadow-xs">
            {services.map((srv, idx) => {
              const Icon = srv.icon;
              return (
                <div key={idx} className="p-7 sm:p-8 flex items-center justify-between hover:bg-card/80 transition-colors">
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                      <Icon size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-base text-foreground">{srv.name}</h4>
                      <p className="text-xs text-foreground/60 pt-1">Status: Operational</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                    <CheckCircle2 size={14} /> {srv.status}
                  </span>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </PageTransition>
  );
}
