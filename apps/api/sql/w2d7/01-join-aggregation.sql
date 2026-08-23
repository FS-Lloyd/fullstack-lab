-- Per-user task counts by status (JOIN + aggregation)
SELECT
  u.id AS "userId",
  u."firstName",
  u."lastName",
  count(*) AS "totalTasks",
  count(*) FILTER (WHERE t.status = 'todo') AS "todoCount",
  count(*) FILTER (WHERE t.status = 'in_progress') AS "inProgressCount",
  count(*) FILTER (WHERE t.status = 'done') AS "doneCount"
FROM "user" u
JOIN "task" t ON t."userId" = u.id
GROUP BY u.id, u."firstName", u."lastName"
ORDER BY "totalTasks" DESC;
