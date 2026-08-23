-- Users who have at least one overdue task (subquery with EXISTS)
SELECT u.id, u."firstName", u."lastName"
FROM "user" u
WHERE EXISTS (
  SELECT 1
  FROM "task" t
  WHERE t."userId" = u.id
    AND t."dueDate" < now()
    AND t.status <> 'done'
)
ORDER BY u.id;
