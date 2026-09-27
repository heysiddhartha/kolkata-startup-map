create policy "admins can write audit" on public.audit_log
  for insert with check (public.is_admin());
