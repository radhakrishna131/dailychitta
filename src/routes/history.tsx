import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { inr } from "@/lib/format";
import { Calendar, FileText, ExternalLink, Loader2 } from "lucide-react";

export const Route = createFileRoute("/history")({ component: () => <AppShell><History /></AppShell> });

function History() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<any[]>([]);
  const [filter, setFilter] = useState<"all" | "month" | "week">("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (!user) return;
      const { data } = await supabase.from("payments").select("*").order("payment_date", { ascending: false });
      setPayments(data ?? []);
      setLoading(false);
    })();
  }, [user]);

  const now = new Date();
  const filtered = payments.filter((p) => {
    const d = new Date(p.payment_date);
    if (filter === "month") return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    if (filter === "week") {
      const wk = new Date(now); wk.setDate(now.getDate() - 7);
      return d >= wk;
    }
    return true;
  });

  if (loading) return <Loader2 className="size-5 animate-spin" />;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold md:text-3xl">Payment history</h1>
        <p className="text-sm text-muted-foreground">All your installments in one place</p>
      </div>

      <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="month">This month</TabsTrigger>
          <TabsTrigger value="week">Last 7 days</TabsTrigger>
        </TabsList>
      </Tabs>

      {filtered.length === 0 ? (
        <Card><CardContent className="p-10 text-center text-muted-foreground">No payments found.</CardContent></Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((p) => (
            <Card key={p.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-11 items-center justify-center rounded-full bg-success/15 text-success">
                    <Calendar className="size-4" />
                  </div>
                  <div>
                    <p className="font-display font-semibold">{inr(Number(p.amount))}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(p.payment_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      {p.note && <> · {p.note}</>}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {p.proof_url && (
                    <button
                      type="button"
                      onClick={async () => {
                        let path = p.proof_url as string;
                        const marker = "/payment-proofs/";
                        const idx = path.indexOf(marker);
                        if (idx !== -1) path = path.slice(idx + marker.length);
                        const { data, error } = await supabase.storage
                          .from("payment-proofs")
                          .createSignedUrl(path, 60);
                        if (error || !data?.signedUrl) return;
                        window.open(data.signedUrl, "_blank", "noopener,noreferrer");
                      }}
                      className="flex items-center gap-1 text-xs text-accent hover:underline"
                    >
                      <FileText className="size-3.5" /> Proof <ExternalLink className="size-3" />
                    </button>
                  )}
                  <span className="rounded-full bg-success/15 px-3 py-1 text-xs font-medium text-success capitalize">{p.status}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
