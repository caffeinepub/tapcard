import { Zap } from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();
  const utm = `utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`;

  return (
    <footer className="border-t border-border bg-background py-8">
      <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <Zap className="w-4 h-4 text-primary" />
          <span className="font-display font-semibold text-foreground">
            TapCard
          </span>
          <span>— Smart NFC Business Cards</span>
        </div>
        <p className="text-muted-foreground text-sm">
          © {year}. Built with ❤️ using{" "}
          <a
            href={`https://caffeine.ai?${utm}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            caffeine.ai
          </a>
        </p>
      </div>
    </footer>
  );
}
