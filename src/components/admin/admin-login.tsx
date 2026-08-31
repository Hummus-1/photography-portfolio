"use client";

import React, { useState } from "react";
import { Lock, ShieldCheck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { ThinkingOrb } from "./thinking-orb";

interface AdminLoginProps {
  onLoginSuccess: () => void;
}

export function AdminLogin({ onLoginSuccess }: AdminLoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      toast.success("Successfully authenticated");
      onLoginSuccess();
    } catch (err: any) {
      toast.error(err.message || "Authentication failed");
    } finally {
      setLoginLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center bg-background px-6 text-foreground overflow-hidden">
      {/* Background ambient glowing orbs */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <Card className="relative z-10 w-full max-w-md bg-card/80 backdrop-blur-2xl border-border text-foreground rounded-none shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
        <CardHeader className="space-y-3 text-center pb-2">
          <div className="mx-auto flex items-center justify-center py-2">
            <ThinkingOrb
              state={loginLoading ? "thinking" : "idle"}
              size="lg"
            />
          </div>
          <CardTitle className="font-serif text-2xl font-bold tracking-wider uppercase text-foreground">
            Admin Control Center
          </CardTitle>
          <CardDescription className="text-muted-foreground font-mono text-[10px] uppercase tracking-widest flex items-center justify-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            <span>Supabase RLS & R2 Secured Portal</span>
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-4">
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="font-mono uppercase tracking-widest text-[10px] text-muted-foreground">
                Admin Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@stills.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-background/50 border-border rounded-none h-11 focus-visible:ring-primary focus:border-primary text-foreground font-mono text-xs"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="font-mono uppercase tracking-widest text-[10px] text-muted-foreground">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-background/50 border-border rounded-none h-11 focus-visible:ring-primary focus:border-primary text-foreground font-mono text-xs"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loginLoading}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all h-11 rounded-none font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg"
            >
              <span>{loginLoading ? "Authenticating..." : "Enter Portal"}</span>
              {!loginLoading && <ArrowRight className="h-4 w-4" />}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
