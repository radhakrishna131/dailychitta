import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, Upload, ShieldCheck, TrendingUp, Smartphone } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const Route = createFileRoute("/")({ component: Landing });

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="border-b border-border/60 bg-background/80 backdrop-blur sticky top-0 z-30">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="font-display text-xl font-bold tracking-tight">
            Daily<span className="text-accent">Chitta</span>
          </Link>
          <nav className="hidden gap-8 text-sm text-muted-foreground md:flex">
            <a href="#features" className="hover:text-foreground">Features</a>
            <a href="#how" className="hover:text-foreground">How it works</a>
            <a href="#faq" className="hover:text-foreground">FAQ</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/auth">
              <Button variant="ghost" size="sm">Login</Button>
            </Link>
            <Link to="/auth">
              <Button size="sm">Get started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero — split-screen */}
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-16 md:grid-cols-2 md:py-24">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
            <span className="size-1.5 rounded-full bg-success" /> Trusted by daily savers
          </span>
          <h1 className="mt-6 font-display text-4xl font-bold leading-tight tracking-tight md:text-6xl">
            Your daily loan,<br />tracked transparently.
          </h1>
          <p className="mt-5 max-w-md text-lg text-muted-foreground">
            Log every installment, upload proof in one tap, and always know how much you've paid and what's left.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/auth">
              <Button size="lg" className="rounded-full px-6">Start tracking free</Button>
            </Link>
            <a href="#features">
              <Button size="lg" variant="outline" className="rounded-full px-6">See features</Button>
            </a>
          </div>
          <div className="mt-8 flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2"><ShieldCheck className="size-4" /> Secure login</div>
            <div className="flex items-center gap-2"><Smartphone className="size-4" /> Mobile-first</div>
          </div>
        </div>

        {/* Mock dashboard card */}
        <div className="relative">
          <div className="absolute -inset-6 -z-10 rounded-3xl bg-gradient-to-br from-accent/20 via-primary/10 to-transparent blur-2xl" />
          <div className="rounded-3xl border border-border bg-card p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total loan</p>
                <p className="font-display text-2xl font-bold">₹ 50,000</p>
              </div>
              <span className="rounded-full bg-success/15 px-3 py-1 text-xs font-semibold text-success">
                On track
              </span>
            </div>
            <div className="mt-5">
              <div className="mb-2 flex justify-between text-xs text-muted-foreground">
                <span>Paid ₹ 28,500</span><span>57%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-secondary">
                <div className="h-full w-[57%] rounded-full bg-gradient-to-r from-accent to-primary" />
              </div>
            </div>
            <div className="mt-6 grid grid-cols-7 gap-1.5">
              {[...Array(28)].map((_, i) => {
                const s = i < 19 ? "paid" : i === 19 ? "pending" : i === 22 ? "missed" : "future";
                const cls = {
                  paid: "bg-success/80",
                  pending: "bg-warning/80",
                  missed: "bg-destructive/70",
                  future: "bg-secondary",
                }[s];
                return <div key={i} className={`aspect-square rounded-md ${cls}`} />;
              })}
            </div>
            <div className="mt-5 flex items-center justify-between rounded-2xl bg-secondary/60 p-4">
              <div>
                <p className="text-xs text-muted-foreground">Today's installment</p>
                <p className="font-display text-lg font-semibold">₹ 500</p>
              </div>
              <Button size="sm" className="rounded-full">
                <Upload className="mr-1.5 size-4" /> Upload
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t border-border/60 bg-secondary/30">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="font-display text-3xl font-bold md:text-4xl">Everything for daily payments</h2>
          <p className="mt-3 max-w-xl text-muted-foreground">
            Simple tools built for daily installment customers — no spreadsheets, no confusion.
          </p>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              { icon: CheckCircle2, t: "Daily tracker", d: "Mark today's installment as paid, pending, or missed with one tap." },
              { icon: Upload, t: "Proof uploads", d: "Attach UPI screenshots, receipts, or cash photos so every payment is on record." },
              { icon: TrendingUp, t: "Balance at a glance", d: "Live progress bar, paid amount, and remaining balance always visible." },
              { icon: Clock, t: "Reminders", d: "Never miss a due date with smart daily reminders." },
              { icon: ShieldCheck, t: "Secure & private", d: "Bank-grade encryption. Only you see your loan details." },
              { icon: Smartphone, t: "Mobile-first", d: "Designed for phones. Large buttons, fast loading, works offline-light." },
            ].map((f) => (
              <div key={f.t} className="rounded-2xl border border-border bg-card p-6 transition hover:shadow-md">
                <div className="flex size-11 items-center justify-center rounded-xl bg-accent/10 text-accent">
                  <f.icon className="size-5" />
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold">{f.t}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="font-display text-3xl font-bold md:text-4xl">How it works</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            { n: "01", t: "Create your loan", d: "Enter loan amount, daily installment, and start date." },
            { n: "02", t: "Pay daily", d: "Mark each day's installment and upload your proof." },
            { n: "03", t: "Track till zero", d: "Watch your balance shrink. Download history any time." },
          ].map((s) => (
            <div key={s.n} className="rounded-2xl border border-border p-6">
              <div className="font-display text-3xl font-bold text-accent">{s.n}</div>
              <h3 className="mt-3 font-display text-lg font-semibold">{s.t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="border-t border-border/60 bg-secondary/30">
        <div className="mx-auto max-w-3xl px-6 py-20">
          <h2 className="font-display text-3xl font-bold md:text-4xl">Frequently asked</h2>
          <Accordion type="single" collapsible className="mt-8">
            {[
              { q: "Is Daily Chitta free?", a: "Yes, the core tracker is free forever. Premium plans unlock advanced reports and multi-loan management." },
              { q: "Do I have to upload proof every day?", a: "Proof is optional but recommended — it keeps a transparent history both you and your collector trust." },
              { q: "Can I track more than one loan?", a: "Yes. Add as many loans as you like from your dashboard." },
              { q: "Is my data private?", a: "All data is encrypted and only visible to you. We never share your financial info." },
            ].map((f, i) => (
              <AccordionItem key={i} value={`q${i}`}>
                <AccordionTrigger className="text-left font-medium">{f.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="rounded-3xl bg-primary p-10 text-center text-primary-foreground md:p-16">
          <h2 className="font-display text-3xl font-bold md:text-4xl">Start tracking your loan today</h2>
          <p className="mx-auto mt-3 max-w-lg text-primary-foreground/80">
            Join customers who replaced messy notebooks with a clear daily tracker.
          </p>
          <Link to="/auth">
            <Button size="lg" variant="secondary" className="mt-7 rounded-full px-8">
              Create free account
            </Button>
          </Link>
        </div>
      </section>

      <footer className="border-t border-border/60 py-8">
        <div className="mx-auto max-w-6xl px-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Daily Chitta — Your daily loan tracker.
        </div>
      </footer>
    </div>
  );
}
