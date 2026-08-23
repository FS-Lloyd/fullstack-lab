-- Rank each user's tasks by due date (window functions RANK / ROW_NUMBER)
SELECT
  t.id,
  t.title,
  t."userId",
  t."dueDate",
  RANK() OVER (PARTITION BY t."userId" ORDER BY t."dueDate" ASC NULLS LAST) AS "dueDateRank",
  ROW_NUMBER() OVER (PARTITION BY t."userId" ORDER BY t."dueDate" ASC NULLS LAST) AS "dueDateRowNumber"
FROM "task" t
WHERE t."userId" IS NOT NULL
ORDER BY t."userId", "dueDateRank";
