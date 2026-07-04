"use client";

import React, { useState } from "react";
import { Lock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

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
      toast.success("Successfully logged in");
      onLoginSuccess();
    } catch (err: any) {
      toast.error(err.message || "Failed to log in");
    } finally {
      setLoginLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#0E1012] px-6 text-[#e8e5f0]">
      <Card className="w-full max-w-md bg-[#14171a] border-white/10 text-white rounded-none">
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white/15">
            <Lock className="h-6 w-6 text-[#e8e5f0]" />
          </div>
          <CardTitle className="font-serif text-2xl font-bold tracking-wider uppercase">
            Admin Login
          </CardTitle>
          <CardDescription className="text-white/60 font-mono text-[10px] uppercase tracking-widest">
            Stills Photography Portal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="font-mono uppercase tracking-widest text-xs">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@stills.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-black/20 border-white/10 rounded-none h-11 focus-visible:ring-white focus:border-white text-white"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="font-mono uppercase tracking-widest text-xs">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-black/20 border-white/10 rounded-none h-11 focus-visible:ring-white focus:border-white text-white"
                required
              />
            </div>
            <Button
              type="submit"
              disabled={loginLoading}
              className="w-full bg-[#e8e5f0] text-[#0E1012] hover:bg-[#d4d0de] transition-colors h-11 rounded-none font-bold uppercase tracking-widest text-xs"
            >
              {loginLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Authenticate
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
