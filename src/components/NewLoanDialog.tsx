import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export function NewLoanDialog({ onCreated, trigger }: { onCreated?: () => void; trigger: React.ReactNode }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("My Loan");
  const [total, setTotal] = useState<number>(0);
  const [interest, setInterest] = useState<number>(0);
  const [daily, setDaily] = useState<number>(0);
  const [start, setStart] = useState(new Date().toISOString().slice(0, 10));
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (total <= 0 || daily <= 0) return toast.error("Enter valid amounts");
    setBusy(true);
    const { error } = await supabase.from("loans").insert({
      user_id: user.id, title, total_amount: total, interest_amount: interest, daily_installment: daily, start_date: start,
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Loan created");
    setOpen(false);
    onCreated?.();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-display">New loan</DialogTitle>
          <DialogDescription>Enter your loan details to start tracking.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <Label htmlFor="ttl">Title</Label>
            <Input id="ttl" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={80} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="ta">Total amount (₹)</Label>
              <Input id="ta" type="number" min={1} value={total || ""} onChange={(e) => setTotal(Number(e.target.value))} required />
            </div>
            <div>
              <Label htmlFor="ia">Interest (₹)</Label>
              <Input id="ia" type="number" min={0} value={interest || ""} onChange={(e) => setInterest(Number(e.target.value))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="di">Daily installment (₹)</Label>
              <Input id="di" type="number" min={1} value={daily || ""} onChange={(e) => setDaily(Number(e.target.value))} required />
            </div>
            <div>
              <Label htmlFor="sd">Start date</Label>
              <Input id="sd" type="date" value={start} onChange={(e) => setStart(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={busy} className="w-full">
              {busy && <Loader2 className="mr-2 size-4 animate-spin" />} Create loan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
