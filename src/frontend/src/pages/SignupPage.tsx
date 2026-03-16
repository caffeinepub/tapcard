import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "@tanstack/react-router";
import { Check, Loader2, ShieldCheck, Zap } from "lucide-react";
import { motion } from "motion/react";
import { useEffect } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

const steps = [
  "Sign in with Internet Identity",
  "Set up your digital profile",
  "Get your unique card link + QR code",
  "Write the link to your NFC card",
];

export default function SignupPage() {
  const { login, identity, isLoggingIn, loginStatus } = useInternetIdentity();
  const navigate = useNavigate();

  useEffect(() => {
    if (identity) {
      navigate({ to: "/dashboard" });
    }
  }, [identity, navigate]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-8 items-center">
        {/* Left */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Zap className="w-4 h-4 text-primary" />
            </div>
            <span className="font-display font-bold text-xl">TapCard</span>
          </div>
          <h1 className="font-display text-4xl font-bold mb-4 leading-tight">
            Your digital identity,
            <span className="text-gradient block">always in your pocket.</span>
          </h1>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            Create your free account in seconds. No credit card, no setup fees.
          </p>
          <ol className="space-y-4">
            {steps.map((s, i) => (
              <li key={s} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-primary">
                    {i + 1}
                  </span>
                </div>
                <span className="text-sm text-muted-foreground">{s}</span>
              </li>
            ))}
          </ol>
        </motion.div>

        {/* Right */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className="rounded-2xl bg-card card-glow p-8">
            <h2 className="font-display text-2xl font-bold mb-2">
              Create your account
            </h2>
            <p className="text-muted-foreground text-sm mb-8">
              Free forever. No email or password needed.
            </p>

            <div className="space-y-3 mb-6">
              {[
                "No passwords to remember",
                "Privacy-preserving authentication",
                "Works across devices",
              ].map((b) => (
                <div
                  key={b}
                  className="flex items-center gap-2 text-sm text-muted-foreground"
                >
                  <Check className="w-4 h-4 text-primary" />
                  {b}
                </div>
              ))}
            </div>

            <Button
              className="w-full h-12 text-base"
              onClick={login}
              disabled={isLoggingIn || loginStatus === "initializing"}
              data-ocid="auth.submit_button"
            >
              {isLoggingIn || loginStatus === "initializing" ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 mr-2" />
                  Continue with Internet Identity
                </>
              )}
            </Button>

            <p className="text-center text-sm text-muted-foreground mt-4">
              Already have an account?{" "}
              <Link to="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
