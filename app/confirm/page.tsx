"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BOOTCAMP_CONFIG } from "@/lib/config/bootcamp";

export default function ConfirmationPage() {
  const router = useRouter();

  const handleDone = () => {
    // Clear the active audit session from storage to prepare for next student
    localStorage.removeItem("cnm_kiosk_audit_session");
    router.replace("/");
  };

  return (
    <div className="w-full max-w-xl py-12 flex flex-col items-center justify-center min-h-[80vh] space-y-8 animate-fade-in text-center">
      
      {/* Visual Success Accent Card */}
      <Card variant="glass" className="relative p-8 w-full overflow-hidden shadow-2xl">
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-emerald-500 to-transparent animate-pulse" />
        
        <CardContent className="space-y-8 pt-4">
          
          {/* Main Success Icon */}
          <div className="flex justify-center">
            <div className="h-16 w-16 rounded-full bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 relative">
              <CheckCircle2 className="h-9 w-9" />
              <div className="absolute inset-[-4px] rounded-full border border-dashed border-emerald-500/10 animate-spin" style={{ animationDuration: '12s' }} />
            </div>
          </div>

          {/* Heading Section */}
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight font-sans">
              🎉 Congratulations!
            </h1>
            <p className="text-zinc-400 text-sm font-semibold leading-relaxed">
              Your Study System Reset Bootcamp has been booked successfully.
            </p>
          </div>

          {/* Highlighted Summary Card: Bootcamp Details */}
          <div className="bg-zinc-950/80 border border-border p-6 rounded-2xl text-left space-y-4 shadow-xl">
            <span className="text-xs font-mono text-gold uppercase tracking-wider block border-b border-border/40 pb-2">Bootcamp Details</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-zinc-300 text-xs md:text-sm font-sans font-light">
              <div className="flex items-center gap-2">
                <span className="text-base">📅</span>
                <span>{BOOTCAMP_CONFIG.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-base">🕒</span>
                <span>{BOOTCAMP_CONFIG.time}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-base">📍</span>
                <a
                  href="https://maps.app.goo.gl/Hma99SxdirGofdiD7"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gold transition-colors flex flex-col gap-0.5"
                >
                  <span>{BOOTCAMP_CONFIG.venue}</span>
                  <span className="text-[10px] text-gold/70 font-mono">Click to view on Google Maps</span>
                </a>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-base">👥</span>
                <span>{BOOTCAMP_CONFIG.format}</span>
              </div>
              <div className="flex items-center gap-2 sm:col-span-2">
                <span className="text-base">⏱</span>
                <span>{BOOTCAMP_CONFIG.duration}</span>
              </div>
            </div>
          </div>

          {/* What Happens Next? Info Box */}
          <div className="bg-zinc-950/60 p-6 rounded-2xl border border-border/80 text-left space-y-3">
            <span className="text-xs font-mono text-gold uppercase tracking-wider block">What Happens Next?</span>
            <div className="space-y-2 text-zinc-300 text-xs md:text-sm leading-relaxed font-sans font-light">
              <div className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold shrink-0">✓</span>
                <span>You'll receive a confirmation on WhatsApp.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold shrink-0">✓</span>
                <span>Arrive 10 minutes before your session.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold shrink-0">✓</span>
                <span>Bring your latest mock test (if available).</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold shrink-0">✓</span>
                <span>Our mentor will review your Performance Audit and help create your next study plan.</span>
              </div>
            </div>
          </div>

          {/* Body instructions */}
          <p className="text-zinc-400 text-xs md:text-sm leading-relaxed font-light font-sans">
            Please arrive on time and bring your latest mock test (if available). Our mentor will use your Performance Audit to guide the discussion and create a personalised study improvement plan.
          </p>

          {/* CTA done button to open location */}
          <div className="pt-4 border-t border-border/40">
            <a
              href="https://maps.app.goo.gl/Hma99SxdirGofdiD7"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full"
            >
              <Button
                variant="primary"
                size="lg"
                className="w-full py-4 uppercase font-bold text-sm tracking-wider min-h-[56px] rounded-xl flex items-center justify-center gap-2 group"
              >
                📍 Open Location
                <Sparkles className="h-4 w-4 text-gold group-hover:scale-125 transition-transform" />
              </Button>
            </a>
          </div>

        </CardContent>
      </Card>
      
    </div>
  );
}
