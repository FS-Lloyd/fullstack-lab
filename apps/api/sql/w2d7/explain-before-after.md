# EXPLAIN ANALYZE — before / after indexing

## 1. JOIN + aggregation

**Scan type:** `Seq Scan` on `task` → `Seq Scan` on `task` (unchanged)
**Execution time:** 4.120 ms → 4.283 ms (no change)
**Why:** the query aggregates over _every_ task row, so there's nothing to
skip — an index can't beat reading 100% of the table when 100% is needed.

### Before

```
Sort  (cost=941.99..942.11 rows=50 width=50) (actual time=4.091..4.093 rows=50.00 loops=1)
  Sort Key: (count(*)) DESC
  Sort Method: quicksort  Memory: 28kB
  Buffers: shared hit=282
  ->  HashAggregate  (cost=940.08..940.58 rows=50 width=50) (actual time=4.072..4.076 rows=50.00 loops=1)
        Group Key: u.id
        Batches: 1  Memory Usage: 32kB
        Buffers: shared hit=282
        ->  Hash Join  (cost=2.12..540.08 rows=20000 width=22) (actual time=0.017..2.340 rows=20000.00 loops=1)
              Hash Cond: (t."userId" = u.id)
              Buffers: shared hit=282
              ->  Seq Scan on task t  (cost=0.00..481.00 rows=20000 width=8) (actual time=0.004..0.586 rows=20000.00 loops=1)
                    Buffers: shared hit=281
              ->  Hash  (cost=1.50..1.50 rows=50 width=18) (actual time=0.010..0.011 rows=50.00 loops=1)
                    Buckets: 1024  Batches: 1  Memory Usage: 11kB
                    Buffers: shared hit=1
                    ->  Seq Scan on "user" u  (cost=0.00..1.50 rows=50 width=18) (actual time=0.002..0.005 rows=50.00 loops=1)
                          Buffers: shared hit=1
Planning:
  Buffers: shared hit=4
Planning Time: 0.115 ms
Execution Time: 4.120 ms
```

### After

```
Sort  (cost=942.15..942.27 rows=50 width=50) (actual time=4.249..4.252 rows=50.00 loops=1)
  Sort Key: (count(*)) DESC
  Sort Method: quicksort  Memory: 28kB
  Buffers: shared hit=282
  ->  HashAggregate  (cost=940.24..940.74 rows=50 width=50) (actual time=4.233..4.238 rows=50.00 loops=1)
        Group Key: u.id
        Batches: 1  Memory Usage: 32kB
        Buffers: shared hit=282
        ->  Hash Join  (cost=2.12..540.14 rows=20005 width=22) (actual time=0.033..2.423 rows=20005.00 loops=1)
              Hash Cond: (t."userId" = u.id)
              Buffers: shared hit=282
              ->  Seq Scan on task t  (cost=0.00..481.05 rows=20005 width=8) (actual time=0.004..0.593 rows=20005.00 loops=1)
                    Buffers: shared hit=281
              ->  Hash  (cost=1.50..1.50 rows=50 width=18) (actual time=0.020..0.021 rows=50.00 loops=1)
                    Buckets: 1024  Batches: 1  Memory Usage: 11kB
                    Buffers: shared hit=1
                    ->  Seq Scan on "user" u  (cost=0.00..1.50 rows=50 width=18) (actual time=0.003..0.006 rows=50.00 loops=1)
                          Buffers: shared hit=1
Planning:
  Buffers: shared hit=4
Planning Time: 0.138 ms
Execution Time: 4.283 ms
```

---

## 2. EXISTS subquery

**Scan type:** `Seq Scan` + `Filter` on `task` → `Nested Loop Semi Join` with `Index Scan` on `IDX_b25a43d9925753ce3bf4023459 (userId, dueDate)`
**Execution time:** 1.726 ms → 0.195 ms (**~8.9x faster**)
**Why:** before, Postgres scanned all 20,000 rows and threw away 13,183 that
didn't match the filter. The composite `(userId, dueDate)` index let it look
up each user's overdue rows directly instead of scanning the whole table.

### Before

```
Merge Join  (cost=652.49..653.49 rows=50 width=18) (actual time=1.695..1.707 rows=50.00 loops=1)
  Merge Cond: (u.id = t."userId")
  Buffers: shared hit=282
  ->  Sort  (cost=2.91..3.04 rows=50 width=18) (actual time=0.026..0.028 rows=50.00 loops=1)
        Sort Key: u.id
        Sort Method: quicksort  Memory: 26kB
        Buffers: shared hit=1
        ->  Seq Scan on "user" u  (cost=0.00..1.50 rows=50 width=18) (actual time=0.006..0.009 rows=50.00 loops=1)
              Buffers: shared hit=1
  ->  Sort  (cost=649.58..649.70 rows=50 width=4) (actual time=1.667..1.668 rows=50.00 loops=1)
        Sort Key: t."userId"
        Sort Method: quicksort  Memory: 25kB
        Buffers: shared hit=281
        ->  HashAggregate  (cost=647.66..648.16 rows=50 width=4) (actual time=1.659..1.662 rows=50.00 loops=1)
              Group Key: t."userId"
              Batches: 1  Memory Usage: 32kB
              Buffers: shared hit=281
              ->  Seq Scan on task t  (cost=0.00..631.00 rows=6666 width=4) (actual time=0.003..1.124 rows=6817.00 loops=1)
                    Filter: ((status <> 'done'::task_status_enum) AND ("dueDate" < now()))
                    Rows Removed by Filter: 13183
                    Buffers: shared hit=281
Planning:
  Buffers: shared hit=4
Planning Time: 0.127 ms
Execution Time: 1.726 ms
```

### After

```
Sort  (cost=26.88..27.00 rows=50 width=18) (actual time=0.181..0.182 rows=50.00 loops=1)
  Sort Key: u.id
  Sort Method: quicksort  Memory: 26kB
  Buffers: shared hit=167
  ->  Nested Loop Semi Join  (cost=0.29..25.47 rows=50 width=18) (actual time=0.012..0.174 rows=50.00 loops=1)
        Buffers: shared hit=167
        ->  Seq Scan on "user" u  (cost=0.00..1.50 rows=50 width=18) (actual time=0.004..0.007 rows=50.00 loops=1)
              Buffers: shared hit=1
        ->  Index Scan using "IDX_b25a43d9925753ce3bf4023459" on task t  (cost=0.29..11.68 rows=133 width=4) (actual time=0.003..0.003 rows=1.00 loops=50)
              Index Cond: (("userId" = u.id) AND ("dueDate" < now()))
              Filter: (status <> 'done'::task_status_enum)
              Rows Removed by Filter: 0
              Index Searches: 50
              Buffers: shared hit=166
Planning:
  Buffers: shared hit=4
Planning Time: 0.119 ms
Execution Time: 0.195 ms
```

---

## 3. Window RANK/ROW_NUMBER

**Scan type:** `Seq Scan` + explicit `Sort` → `Index Scan` on `IDX_b25a43d9925753ce3bf4023459 (userId, dueDate)` (Sort node eliminated)
**Execution time:** 12.757 ms → 14.367 ms (**~13% slower, despite the "better" plan**)
**Why:** the index removed the explicit `Sort` step (rows already arrive in
`userId, dueDate` order), but the query still needs almost every row in the
table, and reading them through a non-clustered index means random-order
page access — buffer hits jumped from 281 to 19,922. Sequential I/O beat
"optimized" index access here. Lesson: fewer plan nodes ≠ automatically
faster wall-clock time.

### Before

```
Incremental Sort  (cost=1936.08..3475.16 rows=20000 width=43) (actual time=5.771..12.221 rows=20000.00 loops=1)
  Sort Key: "userId", (rank() OVER w1)
  Presorted Key: "userId"
  Full-sort Groups: 50  Sort Method: quicksort  Average Memory: 29kB  Peak Memory: 29kB
  Pre-sorted Groups: 50  Sort Method: quicksort  Average Memory: 49kB  Peak Memory: 49kB
  Buffers: shared hit=281
  ->  WindowAgg  (cost=1909.79..2359.77 rows=20000 width=43) (actual time=5.649..9.822 rows=20000.00 loops=1)
        Window: w1 AS (PARTITION BY "userId" ORDER BY "dueDate" ROWS UNBOUNDED PRECEDING)
        Storage: Memory  Maximum Storage: 17kB
        Buffers: shared hit=281
        ->  Sort  (cost=1909.77..1959.77 rows=20000 width=27) (actual time=5.643..6.203 rows=20000.00 loops=1)
              Sort Key: "userId", "dueDate"
              Sort Method: quicksort  Memory: 1706kB
              Buffers: shared hit=281
              ->  Seq Scan on task t  (cost=0.00..481.00 rows=20000 width=27) (actual time=0.011..1.350 rows=20000.00 loops=1)
                    Filter: ("userId" IS NOT NULL)
                    Buffers: shared hit=281
Planning Time: 0.063 ms
Execution Time: 12.757 ms
```

### After

```
Incremental Sort  (cost=39.61..2214.87 rows=20005 width=43) (actual time=0.374..13.844 rows=20005.00 loops=1)
  Sort Key: "userId", (rank() OVER w1)
  Presorted Key: "userId"
  Full-sort Groups: 50  Sort Method: quicksort  Average Memory: 29kB  Peak Memory: 29kB
  Pre-sorted Groups: 50  Sort Method: quicksort  Average Memory: 49kB  Peak Memory: 49kB
  Buffers: shared hit=19922
  ->  WindowAgg  (cost=0.34..1099.17 rows=20005 width=43) (actual time=0.032..10.768 rows=20005.00 loops=1)
        Window: w1 AS (PARTITION BY "userId" ORDER BY "dueDate" ROWS UNBOUNDED PRECEDING)
        Storage: Memory  Maximum Storage: 17kB
        Buffers: shared hit=19922
        ->  Index Scan using "IDX_b25a43d9925753ce3bf4023459" on task t  (cost=0.29..699.07 rows=20005 width=27) (actual time=0.017..4.913 rows=20005.00 loops=1)
              Index Cond: ("userId" IS NOT NULL)
              Index Searches: 1
              Buffers: shared hit=19922
Planning Time: 0.074 ms
Execution Time: 14.367 ms
```

---

## 4. Recursive CTE

**Scan type:** `Hash Join` with `Seq Scan` on `task` (per recursion level) → `Nested Loop` with `Index Scan` on `IDX_8bf6d736c49d48d91691ea0dfe (parentTaskId)`
**Execution time:** 2.937 ms → 0.042 ms (**~70x faster**)
**Why:** the biggest win of the four. Before, every recursion level re-scanned
the entire `task` table to find matching children (buffers: 565). After, the
`parentTaskId` index let each level do a direct index lookup for "children of
this row" (buffers: 8) — exactly the access pattern indexes are built for.

### Before

```
Sort  (cost=5574.23..5574.51 rows=111 width=44) (actual time=2.917..2.919 rows=2.00 loops=1)
  Sort Key: subtask_tree.depth, subtask_tree.id
  Sort Method: quicksort  Memory: 25kB
  Buffers: shared hit=565
  CTE subtask_tree
    ->  Recursive Union  (cost=0.29..5568.24 rows=111 width=27) (actual time=0.009..2.912 rows=2.00 loops=1)
          Storage: Memory  Maximum Storage: 33kB
          Buffers: shared hit=565
          ->  Index Scan using "PK_fb213f79ee45060ba925ecd576e" on task  (cost=0.29..2.51 rows=1 width=27) (actual time=0.008..0.009 rows=1.00 loops=1)
                Index Cond: (id = 790)
                Index Searches: 1
                Buffers: shared hit=3
          ->  Hash Join  (cost=0.33..556.46 rows=11 width=27) (actual time=1.362..1.448 rows=0.50 loops=2)
                Hash Cond: (t."parentTaskId" = st.id)
                Buffers: shared hit=562
                ->  Seq Scan on task t  (cost=0.00..481.00 rows=20000 width=23) (actual time=0.002..0.572 rows=20000.00 loops=2)
                      Buffers: shared hit=562
                ->  Hash  (cost=0.20..0.20 rows=10 width=8) (actual time=0.005..0.005 rows=1.00 loops=2)
                      Buckets: 1024  Batches: 1  Memory Usage: 9kB
                      ->  WorkTable Scan on subtask_tree st  (cost=0.00..0.20 rows=10 width=8) (actual time=0.001..0.001 rows=1.00 loops=2)
  ->  CTE Scan on subtask_tree  (cost=0.00..2.22 rows=111 width=44) (actual time=0.010..2.914 rows=2.00 loops=1)
        Storage: Memory  Maximum Storage: 17kB
        Buffers: shared hit=565
Planning Time: 0.076 ms
Execution Time: 2.937 ms
```

### After

```
Sort  (cost=252.38..252.66 rows=111 width=44) (actual time=0.028..0.029 rows=2.00 loops=1)
  Sort Key: subtask_tree.depth, subtask_tree.id
  Sort Method: quicksort  Memory: 25kB
  Buffers: shared hit=8
  CTE subtask_tree
    ->  Recursive Union  (cost=0.29..246.39 rows=111 width=27) (actual time=0.008..0.025 rows=2.00 loops=1)
          Storage: Memory  Maximum Storage: 33kB
          Buffers: shared hit=8
          ->  Index Scan using "PK_fb213f79ee45060ba925ecd576e" on task  (cost=0.29..2.51 rows=1 width=27) (actual time=0.007..0.008 rows=1.00 loops=1)
                Index Cond: (id = 9)
                Index Searches: 1
                Buffers: shared hit=3
          ->  Nested Loop  (cost=0.29..24.28 rows=11 width=27) (actual time=0.008..0.008 rows=0.50 loops=2)
                Buffers: shared hit=5
                ->  WorkTable Scan on subtask_tree st  (cost=0.00..0.20 rows=10 width=8) (actual time=0.000..0.000 rows=1.00 loops=2)
                ->  Index Scan using "IDX_8bf6d736c49d48d91691ea0dfe" on task t  (cost=0.29..2.40 rows=1 width=23) (actual time=0.006..0.006 rows=0.50 loops=2)
                      Index Cond: ("parentTaskId" = st.id)
                      Index Searches: 2
                      Buffers: shared hit=5
  ->  CTE Scan on subtask_tree  (cost=0.00..2.22 rows=111 width=44) (actual time=0.009..0.026 rows=2.00 loops=1)
        Storage: Memory  Maximum Storage: 17kB
        Buffers: shared hit=8
Planning Time: 0.084 ms
Execution Time: 0.042 ms
```
