
drop policy if exists "Anyone can view proofs" on storage.objects;
create policy "Users list own proofs" on storage.objects for select
  using (bucket_id = 'payment-proofs' and auth.uid()::text = (storage.foldername(name))[1]);

revoke execute on function public.handle_new_user() from public, anon, authenticated;
