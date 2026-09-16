import React from "react";
import { PageTransition } from "../../components/ui/PageTransition";
import { Download, Mail } from "lucide-react";

export default function PressMediaPage() {
  const PRESS_RELEASES = [
    {
      title: "NexTradeX Upgrades High-Speed Trading Engine",
      summary: "NexTradeX enhances platform execution speed and real-time streaming notifications for spot, margin, and futures traders.",
    },
    {
      title: "NexTradeX Expands Open-Source Practice Trading Tools",
      summary: "Our open-source paper trading architecture reaches a historic usage milestone across global user communities.",
    },
    {
      title: "NexTradeX Enhances Account Protection & System Security",
      summary: "Upgraded rate limiting and login security standards safeguard public API endpoints and live data feeds.",
    },
  ];

  return (
    <PageTransition>
      <div className="min-h-screen py-16 sm:py-24 px-6 sm:px-10 lg:px-16 bg-background text-foreground">
        <div className="max-w-6xl mx-auto space-y-16 sm:space-y-24">
          
          {/* Header */}
          <div className="text-center space-y-6 max-w-4xl mx-auto pt-4 sm:pt-8 mb-12 sm:mb-16">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight font-heading leading-[1.15] text-foreground">
              Press & Brand Assets
            </h1>
            <p className="text-foreground/80 text-base sm:text-xl leading-relaxed max-w-3xl mx-auto font-medium">
              Read official NexTradeX announcements, download vector brand assets, or get in touch with our media relations team.
            </p>
          </div>

          {/* Press Releases List */}
          <div className="space-y-8">
            <h2 className="text-3xl font-bold font-heading text-foreground">Recent Announcements</h2>
            <div className="grid grid-cols-1 gap-8">
              {PRESS_RELEASES.map((pr, idx) => (
                <div key={idx} className="p-8 sm:p-10 rounded-[32px] border border-border bg-card space-y-3 shadow-xs hover:border-primary/50 transition-all">
                  <h3 className="text-xl sm:text-2xl font-bold font-heading text-foreground">{pr.title}</h3>
                  <p className="text-xs sm:text-sm text-foreground/75 leading-relaxed">{pr.summary}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Media Kit & Contact */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10 pt-6">
            <div className="p-10 sm:p-12 rounded-[36px] bg-card border border-border space-y-6 shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                <Download size={26} />
              </div>
              <h3 className="text-2xl font-bold font-heading text-foreground">Download Media Kit</h3>
              <p className="text-xs sm:text-sm text-foreground/75 leading-relaxed">
                Get high-resolution PNG & SVG vector logos, brand color guidelines, and media resources.
              </p>
              <button
                onClick={() => alert("Media kit package prepared.")}
                className="px-6 py-3.5 rounded-2xl bg-primary text-white text-xs sm:text-sm font-bold hover:opacity-90 transition-opacity inline-flex items-center gap-2 shadow-xs"
              >
                <Download size={16} className="text-white" /> Download Package (.ZIP)
              </button>
            </div>

            <div className="p-10 sm:p-12 rounded-[36px] bg-card border border-border space-y-6 shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <Mail size={26} />
              </div>
              <h3 className="text-2xl font-bold font-heading text-foreground">Media Contact</h3>
              <p className="text-xs sm:text-sm text-foreground/75 leading-relaxed">
                For press inquiries, interview requests, or general media questions:
              </p>
              <a href="mailto:press@nextradex.io" className="text-primary font-bold text-sm sm:text-base underline block pt-2">
                press@nextradex.io
              </a>
            </div>
          </div>

        </div>
      </div>
    </PageTransition>
  );
}
