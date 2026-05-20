import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent } from "@/components/ui/card";
import { UploadPaymentDialog } from "@/components/UploadPaymentDialog";
import { inr, todayISO } from "@/lib/format";
import { Loader2 } from "lucide-react";
import { NewLoanDialog } from "@/components/NewLoanDialog";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/loans")({ component: () => <AppShell><LoanPage /></AppShell> });

function LoanPage() {
  const { user } = useAuth();
  const [loan, setLoan] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const { data: loans } = await supabase.from("loans").select("*").order("created_at", { ascending: false }).limit(1);
    const l = loans?.[0];
    setLoan(l ?? null);
    if (l) {
      const { data: pays } = await supabase.from("payments").select("*").eq("loan_id", l.id);
      setPayments(pays ?? []);
    }
    setLoading(false);
  };
  useEffect(() => { load(); }, [user]);

  if (loading) return <Loader2 className="size-5 animate-spin" />;
  if (!loan) return (
    <div className="rounded-2xl border border-dashed p-10 text-center">
      <p className="mb-4 text-muted-foreground">No loan yet.</p>
      <NewLoanDialog onCreated={load} trigger={<Button>Add a loan</Button>} />
    </div>
  );

  const paid = payments.reduce((s, p) => s + Number(p.amount), 0);
  const total = Number(loan.total_amount) + Number(loan.interest_amount || 0);
  const remaining = Math.max(0, total - paid);
  const pct = total > 0 ? Math.min(100, (paid / total) * 100) : 0;
  const dailyInst = Number(loan.daily_installment);
  const totalDays = Math.ceil(total / dailyInst);

  // Build calendar of days from start
  const startDate = new Date(loan.start_date);
  const today = new Date(todayISO());
  const paidDates = new Set(payments.map((p) => p.payment_date));

  const days = Array.from({ length: totalDays }, (_, i) => {
    const d = new Date(startDate); d.setDate(d.getDate() + i);
    const iso = d.toISOString().slice(0, 10);
    let status: "paid" | "pending" | "missed" | "future" = "future";
    if (paidDates.has(iso)) status = "paid";
    else if (d < today) status = "missed";
    else if (d.getTime() === today.getTime()) status = "pending";
    return { iso, day: i + 1, status, d };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold md:text-3xl">{loan.title}</h1>
        <p className="text-sm text-muted-foreground">Loan details and daily tracker</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="p-6">
            <h3 className="font-display text-lg font-semibold">Summary</h3>
            <dl className="mt-4 space-y-2 text-sm">
              <Row k="Loan amount" v={inr(Number(loan.total_amount))} />
              <Row k="Interest" v={inr(Number(loan.interest_amount || 0))} />
              <Row k="Total to pay" v={inr(total)} bold />
              <Row k="Daily installment" v={inr(dailyInst)} />
              <Row k="Start date" v={new Date(loan.start_date).toLocaleDateString("en-IN")} />
              <Row k="Days" v={`${totalDays} days`} />
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <div className="relative size-40">
              <svg viewBox="0 0 100 100" className="size-full -rotate-90">
                <circle cx="50" cy="50" r="42" fill="none" stroke="var(--color-secondary)" strokeWidth="10" />
                <circle cx="50" cy="50" r="42" fill="none" stroke="var(--color-accent)" strokeWidth="10"
                  strokeDasharray={`${(pct / 100) * 264} 264`} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-display text-3xl font-bold">{Math.round(pct)}%</span>
                <span className="text-xs text-muted-foreground">complete</span>
              </div>
            </div>
            <div className="mt-4 grid w-full grid-cols-2 gap-3 text-center">
              <div className="rounded-lg bg-success/10 p-3">
                <p className="text-xs text-muted-foreground">Paid</p>
                <p className="font-display font-semibold text-success">{inr(paid)}</p>
              </div>
              <div className="rounded-lg bg-warning/15 p-3">
                <p className="text-xs text-muted-foreground">Remaining</p>
                <p className="font-display font-semibold">{inr(remaining)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-lg font-semibold">Daily tracker</h3>
            <UploadPaymentDialog loanId={loan.id} defaultAmount={dailyInst} onDone={load} />
          </div>
          <Legend />
          <div className="mt-4 grid grid-cols-7 gap-1.5 sm:grid-cols-10 md:grid-cols-14">
            {days.map((d) => {
              const cls = {
                paid: "bg-success text-success-foreground",
                pending: "bg-warning text-warning-foreground ring-2 ring-warning/40",
                missed: "bg-destructive/80 text-destructive-foreground",
                future: "bg-secondary text-muted-foreground",
              }[d.status];
              return (
                <div key={d.iso} title={`${d.iso} — ${d.status}`}
                  className={`aspect-square rounded-md text-[10px] font-medium flex items-center justify-center ${cls}`}>
                  {d.day}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Row({ k, v, bold }: { k: string; v: string; bold?: boolean }) {
  return (
    <div className="flex justify-between border-b border-border/60 pb-2 last:border-0">
      <dt className="text-muted-foreground">{k}</dt>
      <dd className={bold ? "font-display font-semibold" : ""}>{v}</dd>
    </div>
  );
}

function Legend() {
  const items = [
    { c: "bg-success", l: "Paid" },
    { c: "bg-warning", l: "Pending" },
    { c: "bg-destructive/80", l: "Missed" },
    { c: "bg-secondary border border-border", l: "Upcoming" },
  ];
  return (
    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
      {items.map((i) => (
        <div key={i.l} className="flex items-center gap-1.5">
          <span className={`size-3 rounded ${i.c}`} /> {i.l}
        </div>
      ))}
    </div>
  );
}
