-- Full subtask tree for a given root task (recursive CTE over parentTaskId)
-- $1 / the literal below is the root task id to start from.
WITH RECURSIVE subtask_tree AS (
  SELECT id, title, "parentTaskId", 0 AS depth
  FROM "task"
  WHERE id = 1 -- root task id

  UNION ALL

  SELECT t.id, t.title, t."parentTaskId", st.depth + 1
  FROM "task" t
  JOIN subtask_tree st ON t."parentTaskId" = st.id
)
SELECT * FROM subtask_tree
ORDER BY depth, id;
