import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";

type Props = {
  loanId: string;
  defaultAmount: number;
  trigger?: React.ReactNode;
  onDone?: () => void;
};

export function UploadPaymentDialog({ loanId, defaultAmount, trigger, onDone }: Props) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(defaultAmount);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!amount || amount <= 0) return toast.error("Enter a valid amount");
    setBusy(true);
    let proof_url: string | null = null;
    try {
      if (file) {
        if (file.size > 5 * 1024 * 1024) throw new Error("File too large (max 5 MB)");
        const ext = file.name.split(".").pop();
        const path = `${user.id}/${loanId}/${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage.from("payment-proofs").upload(path, file);
        if (upErr) throw upErr;
        // Store the storage path; generate signed URLs on demand (bucket is private)
        proof_url = path;
      }
      const { error } = await supabase.from("payments").insert({
        loan_id: loanId,
        user_id: user.id,
        amount,
        payment_date: date,
        note: note || null,
        proof_url,
        status: "paid",
      });
      if (error) throw error;
      toast.success("Payment recorded");
      setOpen(false);
      setFile(null); setNote("");
      onDone?.();
    } catch (err: any) {
      toast.error(err.message ?? "Failed to save payment");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? <Button className="rounded-full"><Upload className="mr-2 size-4" /> Upload payment</Button>}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-display">Record payment</DialogTitle>
          <DialogDescription>Log today's installment and attach proof.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <Label htmlFor="amt">Amount (₹)</Label>
            <Input id="amt" type="number" min={1} value={amount} onChange={(e) => setAmount(Number(e.target.value))} required />
          </div>
          <div>
            <Label htmlFor="dt">Payment date</Label>
            <Input id="dt" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="pf">Proof (image or PDF, optional)</Label>
            <Input id="pf" type="file" accept="image/*,.pdf" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          </div>
          <div>
            <Label htmlFor="nt">Note (optional)</Label>
            <Textarea id="nt" maxLength={300} value={note} onChange={(e) => setNote(e.target.value)} placeholder="UPI ref, payment method..." />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={busy} className="w-full">
              {busy && <Loader2 className="mr-2 size-4 animate-spin" />} Save payment
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
