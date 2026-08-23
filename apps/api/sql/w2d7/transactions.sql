-- Transaction 1: create a task, assign it to a user, update the user's task
-- count -- all or nothing. Mirrors runCommittingTransaction() in
-- src/database/scripts/w2d7-transactions.ts.
BEGIN;

INSERT INTO "task" ("title", "description", "status", "userId")
VALUES ('Commit demo task', 'Created inside the succeeding W2D7 transaction', 'todo', 1);

UPDATE "user" SET "taskCount" = "taskCount" + 1 WHERE id = 1;

COMMIT;

-- Transaction 2: same shape, but fails partway through (after the insert,
-- before the counter update) to prove the insert does NOT survive on its own.
-- Mirrors runFailingTransaction() in src/database/scripts/w2d7-transactions.ts.
BEGIN;

INSERT INTO "task" ("title", "description", "status", "userId")
VALUES ('Rollback demo task', 'Should never survive the failing W2D7 transaction', 'todo', 1);

-- <simulated downstream failure happens here, before the UPDATE below runs>

-- UPDATE "user" SET "taskCount" = "taskCount" + 1 WHERE id = 1; -- never reached

ROLLBACK;

-- After ROLLBACK, "Rollback demo task" does not exist and "user".taskCount
-- is unchanged -- the partial insert was undone along with everything else
-- in the transaction.
