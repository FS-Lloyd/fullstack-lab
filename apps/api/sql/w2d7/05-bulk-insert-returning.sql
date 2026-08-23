-- Bulk insert with RETURNING (small, illustrative batch)
INSERT INTO "task" ("title", "description", "status", "userId")
VALUES
  ('Write onboarding doc', 'Draft the new-hire onboarding checklist', 'todo', 1),
  ('Review PR #5', 'Review the PostgreSQL deep-dive PR', 'todo', 1),
  ('Fix flaky test', 'Investigate the intermittent tasks.service.spec failure', 'in_progress', 2),
  ('Deploy staging', 'Ship the latest migration to staging', 'todo', 2),
  ('Update README', 'Document the new db:*:w2d7 scripts', 'done', 3)
RETURNING id, title, status;
