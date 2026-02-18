"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Zap, Loader2, Eye, EyeOff, CheckCircle2 } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (username.length < 3) {
      setError("Le pseudo doit contenir au moins 3 caractères.");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      setLoading(false);
      return;
    }

    const supabase = createClient();

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    // Profile is auto-created by database trigger (handle_new_user)

    // If email confirmation is enabled, show success
    if (data.user && !data.session) {
      setSuccess(true);
      setLoading(false);
      return;
    }

    // If auto-confirmed, redirect
    router.push("/dashboard");
    router.refresh();
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-sm space-y-6 text-center">
          <div className="flex justify-center">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500">
              <CheckCircle2 className="w-7 h-7" />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-bold">Vérifiez votre email</h1>
            <p className="text-sm text-muted-foreground">
              Un lien de confirmation a été envoyé à <strong>{email}</strong>.
              Cliquez dessus pour activer votre compte.
            </p>
          </div>
          <Link
            href="/login"
            className="text-sm text-primary hover:underline font-medium"
          >
            Retour à la connexion
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
              <Zap className="w-7 h-7" />
            </div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Biproductive</h1>
          <p className="text-sm text-muted-foreground">
            Créez votre compte et commencez dès aujourd'hui
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSignup} className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-6 space-y-4 shadow-sm">
            <div className="space-y-2">
              <Label htmlFor="username">Pseudo</Label>
              <Input
                id="username"
                type="text"
                placeholder="votre-pseudo"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="vous@exemple.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">Minimum 6 caractères</p>
            </div>

            {error && (
              <div className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Créer mon compte"
              )}
            </Button>
          </div>
        </form>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground">
          Déjà un compte ?{" "}
          <Link
            href="/login"
            className="text-primary hover:underline font-medium"
          >
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
