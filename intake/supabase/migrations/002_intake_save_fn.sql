-- Atomic "save one answer and the current step" for the intake app.
-- Creates the response row on first save. Does nothing once the response is submitted.
-- Returns true if something was saved, false if the response was already submitted.
-- Only the service role can run it.

create function public.intake_save_answer(
  p_client_id uuid,
  p_qid text,
  p_answer jsonb,
  p_step int
) returns boolean
language sql
security invoker
set search_path = ''
as $$
  with up as (
    insert into public.intake_responses as r (client_id, answers, current_step)
    values (
      p_client_id,
      case when p_qid is null or p_answer is null then '{}'::jsonb else jsonb_build_object(p_qid, p_answer) end,
      p_step
    )
    on conflict (client_id) do update
      set answers = case
            when p_qid is null or p_answer is null then r.answers
            else r.answers || jsonb_build_object(p_qid, p_answer)
          end,
          current_step = p_step,
          updated_at = now()
      where r.submitted_at is null
    returning 1
  )
  select exists (select 1 from up);
$$;

revoke all on function public.intake_save_answer(uuid, text, jsonb, int) from public, anon, authenticated;
grant execute on function public.intake_save_answer(uuid, text, jsonb, int) to service_role;
