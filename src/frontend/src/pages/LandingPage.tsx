import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import {
  BarChart3,
  Check,
  ChevronRight,
  QrCode,
  Share2,
  Smartphone,
  Users,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

const features = [
  {
    icon: Zap,
    title: "Instant NFC Tap",
    desc: "Write your profile URL to any NFC card. One tap — your contacts see everything.",
  },
  {
    icon: QrCode,
    title: "QR Code Included",
    desc: "Auto-generated QR code for every profile. Perfect for email signatures and print.",
  },
  {
    icon: Users,
    title: "Lead Capture",
    desc: "Visitors can drop their contact info right on your profile page. Never miss a connection.",
  },
  {
    icon: BarChart3,
    title: "Smart Analytics",
    desc: "See who's viewing your card, from where, and how — NFC, QR, or direct link.",
  },
  {
    icon: Smartphone,
    title: "Mobile-First Design",
    desc: "Looks stunning on every device. Fast, lightweight, and built for the phone screen.",
  },
  {
    icon: Share2,
    title: "One Link for Everything",
    desc: "Your phone, email, LinkedIn, website — all in one place. Always up to date.",
  },
];

const benefits = [
  "No app required — opens in any browser",
  "Update your details anytime, instantly",
  "Works with any NFC-enabled card or tag",
  "Export your leads to CSV anytime",
];

export default function LandingPage() {
  const { login, isLoggingIn } = useInternetIdentity();

  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <section className="relative min-h-[88vh] flex items-center">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              "url('/assets/generated/tapcard-hero.dim_1400x700.jpg')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background" />
        <div className="absolute inset-0 bg-grid-pattern opacity-20" />

        <div className="relative container mx-auto px-4 py-24">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 text-sm text-primary font-medium mb-6">
              <Zap className="w-3.5 h-3.5" />
              The smart way to network
            </div>
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight mb-6">
              Your Digital
              <span className="text-gradient block">Business Card,</span>
              Powered by NFC.
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground mb-8 leading-relaxed max-w-xl">
              Create a stunning digital profile. Tap your NFC card or scan a QR
              code to share it instantly. Capture leads, track views, and grow
              your network — all from one link.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                size="lg"
                className="text-base px-8 h-12"
                onClick={login}
                disabled={isLoggingIn}
                data-ocid="landing.cta_button"
              >
                {isLoggingIn ? "Connecting..." : "Create Your Card Free"}
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
              <Link to="/login">
                <Button
                  variant="outline"
                  size="lg"
                  className="text-base h-12 w-full sm:w-auto"
                >
                  Sign In
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Benefits strip */}
      <section className="border-y border-border bg-muted/40 py-5">
        <div className="container mx-auto px-4">
          <ul className="flex flex-col sm:flex-row flex-wrap gap-x-8 gap-y-3 justify-center">
            {benefits.map((b) => (
              <li
                key={b}
                className="flex items-center gap-2 text-sm text-muted-foreground"
              >
                <Check className="w-4 h-4 text-primary shrink-0" />
                {b}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Features */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-4xl sm:text-5xl font-bold mb-4">
              Everything you need to
              <span className="text-gradient"> make an impression</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              A complete platform for modern professionals who understand the
              value of a first impression.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.07 }}
                className="p-6 rounded-xl bg-card card-glow card-glow-hover"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <f.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-lg mb-2">
                  {f.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA banner */}
      <section className="py-20 bg-primary/5 border-y border-primary/10">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">
              Ready to upgrade your networking?
            </h2>
            <p className="text-muted-foreground mb-8 text-lg">
              Join professionals who've already made the switch to smart cards.
            </p>
            <Button
              size="lg"
              className="text-base px-10 h-12"
              onClick={login}
              disabled={isLoggingIn}
              data-ocid="landing.cta_button"
            >
              {isLoggingIn ? "Connecting..." : "Get Started — It's Free"}
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
