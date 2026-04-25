"use client";

import React, { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { QrCode, RefreshCw, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function WhatsAppPairingPage() {
  const [status, setStatus] = useState<string>("disconnected");
  const [qr, setQr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchStatus = async () => {
    try {
      const res = await fetch("/api/whatsapp/status");
      const data = await res.json();
      setStatus(data.status);
      if (data.status === "connected") setQr(null);
    } catch (e) {
      console.error("Failed to fetch status", e);
    }
  };

  const fetchQR = async () => {
    try {
      const res = await fetch("/api/whatsapp/qr");
      const data = await res.json();
      if (data.qr) setQr(data.qr);
      setStatus(data.status);
    } catch (e) {
      console.error("Failed to fetch QR", e);
    }
  };

  const handleConnect = async () => {
    setLoading(true);
    try {
      await fetch("/api/whatsapp/connect", { method: "POST" });
      setTimeout(fetchQR, 2000);
    } catch (e) {
      console.error("Failed to connect", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(() => {
      if (status !== "connected") fetchQR();
      else fetchStatus();
    }, 5000);
    return () => clearInterval(interval);
  }, [status]);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <header className="mb-12">
        <h1 className="text-4xl font-bold mb-2 font-sketch tracking-tight text-[var(--lp-accent)]">
          WhatsApp Matrix Uplink
        </h1>
        <p className="text-[var(--lp-text-muted)] text-lg">
          Connect your business WhatsApp directly to the AI Studio. No expensive API fees.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="card-premium border-[var(--lp-border)] bg-[var(--lp-bg-card)]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl flex items-center gap-2">
                <QrCode className="w-5 h-5 text-[var(--lp-accent)]" />
                Connection Status
              </CardTitle>
              <Badge 
                variant={status === "connected" ? "default" : "outline"}
                className={status === "connected" ? "bg-green-500/20 text-green-400 border-green-500/30" : "border-[var(--lp-border)]"}
              >
                {status.toUpperCase()}
              </Badge>
            </div>
            <CardDescription>
              Link your device to enable autonomous follow-ups and human approvals.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AnimatePresence mode="wait">
              {status === "connected" ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center gap-4 text-center"
                >
                  <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-10 h-10 text-green-500" />
                  </div>
                  <h3 className="text-2xl font-bold">Uplink Active</h3>
                  <p className="text-[var(--lp-text-muted)]">Your agent is now synchronized with your WhatsApp device.</p>
                </motion.div>
              ) : qr ? (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white p-4 rounded-2xl shadow-2xl"
                >
                  <QRCodeSVG value={qr} size={250} />
                  <p className="text-black text-xs mt-4 text-center font-mono opacity-50 italic">
                    SCAN WITH WHATSAPP DEVICE
                  </p>
                </motion.div>
              ) : (
                <motion.div className="text-center py-8">
                  <div className="w-16 h-16 bg-[var(--lp-glass)] rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertCircle className="w-8 h-8 text-[var(--lp-text-dim)]" />
                  </div>
                  <Button 
                    onClick={handleConnect} 
                    disabled={loading}
                    className="bg-[var(--lp-accent)] hover:bg-[var(--lp-accent-bright)] text-black font-bold px-8 py-6 rounded-xl"
                  >
                    {loading ? <Loader2 className="animate-spin mr-2" /> : <RefreshCw className="mr-2 w-4 h-4" />}
                    INITIALIZE UPLINK
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="card-premium border-[var(--lp-border)] bg-[var(--lp-bg-card)]">
            <CardHeader>
              <CardTitle className="text-lg">Why connect?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-[var(--lp-text-muted)]">
              <div className="flex gap-3">
                <div className="w-2 h-2 rounded-full bg-[var(--lp-accent)] mt-1.5" />
                <p><span className="text-[var(--lp-text)] font-medium">Cost-Effective:</span> Bypass the $0.15/msg fee of official APIs.</p>
              </div>
              <div className="flex gap-3">
                <div className="w-2 h-2 rounded-full bg-[var(--lp-accent)] mt-1.5" />
                <p><span className="text-[var(--lp-text)] font-medium">Human Approvals:</span> Your agent will text you for high-value decisions.</p>
              </div>
              <div className="flex gap-3">
                <div className="w-2 h-2 rounded-full bg-[var(--lp-accent)] mt-1.5" />
                <p><span className="text-[var(--lp-text)] font-medium">Group Support:</span> Your AI can participate in sales group chats.</p>
              </div>
            </CardContent>
          </Card>
          
          <div className="p-6 rounded-2xl border border-yellow-500/10 bg-yellow-500/5">
            <h4 className="font-sketch text-yellow-500 mb-2">Pro Tip</h4>
            <p className="text-xs text-yellow-500/70 leading-relaxed">
              Scan the QR code within 60 seconds. If it expires, click the refresh button to generate a new secure Matrix token.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
