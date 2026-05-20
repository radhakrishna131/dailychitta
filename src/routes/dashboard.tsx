import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Wallet, TrendingDown, Calendar, ArrowRight, Plus, CheckCircle2, Clock } from "lucide-react";
import { inr, todayISO } from "@/lib/format";
import { UploadPaymentDialog } from "@/components/UploadPaymentDialog";
import { NewLoanDialog } from "@/components/NewLoanDialog";

export const Route = createFileRoute("/dashboard")({ component: () => <AppShell><Dashboard /></AppShell> });

type Loan = { id: string; title: string; total_amount: number; daily_installment: number; start_date: string; interest_amount: number; end_date: string | null };
type Payment = { id: string; amount: number; payment_date: string; status: string; loan_id: string; proof_url: string | null };

function Dashboard() {
  const { user } = useAuth();
  const [loan, setLoan] = useState<Loan | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const { data: loans } = await supabase.from("loans").select("*").order("created_at", { ascending: false }).limit(1);
    const l = loans?.[0] ?? null;
    setLoan(l);
    if (l) {
      const { data: pays } = await supabase.from("payments").select("*").eq("loan_id", l.id).order("payment_date", { ascending: false });
      setPayments(pays ?? []);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, [user]);

  if (loading) return <p className="text-muted-foreground">Loading...</p>;

  if (!loan) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
        <Wallet className="mx-auto size-10 text-muted-foreground" />
        <h2 className="mt-4 font-display text-xl font-semibold">No loan yet</h2>
        <p className="mt-1 text-sm text-muted-foreground">Create your first loan to start tracking daily installments.</p>
        <div className="mt-6">
          <NewLoanDialog onCreated={load} trigger={<Button size="lg" className="rounded-full"><Plus className="mr-2 size-4" /> Add a loan</Button>} />
        </div>
      </div>
    );
  }

  const paid = payments.reduce((s, p) => s + Number(p.amount), 0);
  const total = Number(loan.total_amount) + Number(loan.interest_amount || 0);
  const remaining = Math.max(0, total - paid);
  const pct = total > 0 ? Math.min(100, Math.round((paid / total) * 100)) : 0;
  const today = todayISO();
  const paidToday = payments.some((p) => p.payment_date === today);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold md:text-3xl">{loan.title}</h1>
          <p className="text-sm text-muted-foreground">Started {new Date(loan.start_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
        </div>
        <NewLoanDialog onCreated={load} trigger={<Button variant="outline" size="sm" className="rounded-full"><Plus className="mr-1 size-4" />New loan</Button>} />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard icon={Wallet} label="Total loan" value={inr(total)} tone="primary" />
        <StatCard icon={CheckCircle2} label="Paid" value={inr(paid)} tone="success" />
        <StatCard icon={TrendingDown} label="Remaining" value={inr(remaining)} tone="warning" />
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="mb-3 flex justify-between text-sm">
            <span className="font-medium">Payment progress</span>
            <span className="text-muted-foreground">{pct}%</span>
          </div>
          <Progress value={pct} className="h-3" />
          <p className="mt-3 text-xs text-muted-foreground">{inr(paid)} of {inr(total)} paid</p>
        </CardContent>
      </Card>

      <Card className={paidToday ? "border-success/40 bg-success/5" : "border-accent/40 bg-accent/5"}>
        <CardContent className="flex items-center justify-between p-6">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Today's installment</p>
            <p className="mt-1 font-display text-2xl font-bold">{inr(Number(loan.daily_installment))}</p>
            <p className="mt-1 flex items-center gap-1.5 text-sm">
              {paidToday ? (
                <><CheckCircle2 className="size-4 text-success" /><span className="text-success font-medium">Paid for today</span></>
              ) : (
                <><Clock className="size-4 text-warning" /><span className="text-warning font-medium">Pending</span></>
              )}
            </p>
          </div>
          <UploadPaymentDialog loanId={loan.id} defaultAmount={Number(loan.daily_installment)} onDone={load} />
        </CardContent>
      </Card>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">Recent payments</h2>
          <Link to="/history" className="flex items-center gap-1 text-sm text-accent hover:underline">
            View all <ArrowRight className="size-3.5" />
          </Link>
        </div>
        {payments.length === 0 ? (
          <p className="text-sm text-muted-foreground">No payments yet.</p>
        ) : (
          <div className="space-y-2">
            {payments.slice(0, 5).map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-full bg-success/15 text-success">
                    <Calendar className="size-4" />
                  </div>
                  <div>
                    <p className="font-medium">{inr(Number(p.amount))}</p>
                    <p className="text-xs text-muted-foreground">{new Date(p.payment_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</p>
                  </div>
                </div>
                <span className="rounded-full bg-success/15 px-3 py-1 text-xs font-medium text-success capitalize">{p.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, tone }: { icon: any; label: string; value: string; tone: "primary" | "success" | "warning" }) {
  const tones = {
    primary: "bg-primary/10 text-primary",
    success: "bg-success/15 text-success",
    warning: "bg-warning/20 text-warning-foreground",
  };
  return (
    <Card>
      <CardContent className="p-5">
        <div className={`flex size-10 items-center justify-center rounded-xl ${tones[tone]}`}>
          <Icon className="size-5" />
        </div>
        <p className="mt-3 text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="mt-1 font-display text-2xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}
