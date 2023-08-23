一般来说，大公司都会有自己的监控平台，会自动检查慢 SQL 并报警，但如果是面试，还是得老老实实靠自己。

# 启用慢查询日志

mysql 中的 slow log 是用来记录执行时间较长(超过 long_query_time 秒)的 sql 的一种日志工具。

如需启用，可以修改配置文件 my.ini，在[mysqld]段落中加入如下参数：

```
[mysqld]
log_output='FILE,TABLE'
slow_query_log='ON'
long_query_time=1   # 慢查询时间阈值
```

然后重启 MySQL 服务即可。

# 获取慢SQL

因为 mysql 慢查询日志相当于是一个流水账，并没有汇总统计的功能，所以我们需要用一些工具来辅助分析，常用开源工具如下：
+ mysqldumpslow（官方提供的慢查询日志分析工具）
+ mysqlsla
+ pt-query-digest

具体使用我就不说了，可以参考底部摘抄的文章。

# 耗时排查

拿到慢 SQL 后还需要进一步排查它耗时长的原因。因此需要知道该 SQL 的执行计划，比如是全表扫描，还是索引扫描，这些都需要通过 explain 去完成。

explain结果示例：

```sql
mysql> explain select * from staff;
+----+-------------+-------+------+---------------+------+---------+------+------+-------+
| id | select_type | table | type | possible_keys | key  | key_len | ref  | rows | Extra |
+----+-------------+-------+------+---------------+------+---------+------+------+-------+
|  1 | SIMPLE      | staff | ALL  | NULL          | NULL | NULL    | NULL |    2 | NULL  |
+----+-------------+-------+------+---------------+------+---------+------+------+-------+
1 row in set
```

各个字段的说明如下：

| Column | 含义 |
|  ----  | ----  |
| id | 查询序号 |
| select_type | 查询类型 |
| table | 表名 |
| partitions | 匹配的分区 |
| type | join类型 |
| prossible_keys | 可能会选择的索引 |
| key | 实际选择的索引 |
| key_len | 索引的长度 |
| ref | 与索引作比较的列 |
| rows | 要检索的行数(估算值) |
| filtered | 查询条件过滤的行数的百分比 |
| Extra | 额外信息 |

SQL 慢大概率是这几种原因：
+ 应该走索引，但没有建索引
+ 应该走索引，建了索引，但没走索引

这些原因我就不详细说了，如果想了解可以看这篇：[MySQL调优](http://hunt.eyescode.top/stereotype/mysql/mysql-optimize.html)

但还有些特殊情况，MySQL 有个优化器，它会制定 SQL 的执行计划，所以可能有这两种情况：
+ 存在索引，优化器认为走索引更快，于是走了索引，但实际上全表扫描更快。比如 100 条数据，查其中 99 条的时候，走索引会多了回表的开销，还不如全表扫描。
+ 存在索引，但优化器认为全表扫描更快，于是没走索引，但实际上走索引更快。上面那个例子反着来就是这个了。

当然我举的例子不一定对，但大概是那个意思。遇到这种情况，就需要开发人员介入，强制指定 SQL 执行方式了。

# 调优常用语句

1.查看当前应用连接，连接数突增排查

```sql
SELECT USER,
	SUBSTRING_INDEX( HOST, ':', 1 ) AS ip,
	count(*) AS count,
	db 
FROM
	information_schema.PROCESSLIST 
WHERE
	HOST NOT IN ( 'localhost' ) 
	AND USER NOT IN ( 'replicater' ) 
GROUP BY
	ip 
ORDER BY
	count;
```

2.当前有没有锁

```sql
select * from information_schema.innodb_locks;
```

3.查看哪些sql执行最多

```sql
SELECT
	SCHEMA_NAME,
	DIGEST_TEXT,
	COUNT_STAR,
	SUM_ROWS_SENT,
	SUM_ROWS_EXAMINED,
	FIRST_SEEN,
	LAST_SEEN 
FROM
	PERFORMANCE_SCHEMA.events_statements_summary_by_digest 
WHERE
	SCHEMA_NAME IS NOT NULL 
	AND SCHEMA_NAME != 'information_schema' 
ORDER BY
	COUNT_STAR DESC 
	LIMIT 1;
```

4.哪个SQL扫描的行数最多(IO消耗)

```sql
SELECT
	SCHEMA_NAME,
	DIGEST_TEXT,
	COUNT_STAR,
	AVG_TIMER_WAIT,
	SUM_ROWS_SENT,
	SUM_ROWS_EXAMINED,
	FIRST_SEEN,
	LAST_SEEN 
FROM
	PERFORMANCE_SCHEMA.events_statements_summary_by_digest 
WHERE
	SCHEMA_NAME IS NOT NULL 
	AND SCHEMA_NAME != 'information_schema' 
ORDER BY
	SUM_ROWS_EXAMINED DESC 
	LIMIT 1 \G
```

5.哪个SQL使用的临时表最多

```sql
SELECT
	SCHEMA_NAME,
	DIGEST_TEXT,
	SUM_CREATED_TMP_DISK_TABLES,
	SUM_CREATED_TMP_TABLES,
	FIRST_SEEN,
	LAST_SEEN 
FROM
	PERFORMANCE_SCHEMA.events_statements_summary_by_digest 
WHERE
	SCHEMA_NAME IS NOT NULL 
	AND SCHEMA_NAME != 'information_schema' 
ORDER BY
	SUM_CREATED_TMP_DISK_TABLES DESC 
	LIMIT 1 \G
```

6.哪个SQL排序数最多(CPU消耗)

```sql
SELECT
	SCHEMA_NAME,
	DIGEST_TEXT,
	COUNT_STAR,
	SUM_ROWS_SENT,
	SUM_SORT_ROWS,
	FIRST_SEEN,
	LAST_SEEN 
FROM
	PERFORMANCE_SCHEMA.events_statements_summary_by_digest 
WHERE
	SCHEMA_NAME IS NOT NULL 
	AND SCHEMA_NAME != 'information_schema' 
ORDER BY
	SUM_SORT_ROWS DESC 
	LIMIT 1 \G
```

7.哪个索引使用最多

```sql
SELECT
	OBJECT_NAME,
	INDEX_NAME,
	COUNT_FETCH,
	COUNT_INSERT,
	COUNT_UPDATE,
	COUNT_DELETE 
FROM
	PERFORMANCE_SCHEMA.table_io_waits_summary_by_index_usage 
ORDER BY
	SUM_TIMER_WAIT DESC 
	LIMIT 1;
```

8.哪个索引没有使用过

```sql
SELECT
	OBJECT_SCHEMA,
	OBJECT_NAME,
	INDEX_NAME 
FROM
	PERFORMANCE_SCHEMA.table_io_waits_summary_by_index_usage 
WHERE
	INDEX_NAME IS NOT NULL 
	AND COUNT_STAR = 0 
	AND OBJECT_SCHEMA <> 'mysql' 
ORDER BY
	OBJECT_SCHEMA,
	OBJECT_NAME;
```

9.哪个表、文件逻辑IO最多（热数据）

```sql
SELECT
	FILE_NAME,
	EVENT_NAME,
	COUNT_READ,
	SUM_NUMBER_OF_BYTES_READ,
	COUNT_WRITE,
	SUM_NUMBER_OF_BYTES_WRITE 
FROM
	PERFORMANCE_SCHEMA.file_summary_by_instance 
ORDER BY
	SUM_NUMBER_OF_BYTES_READ + SUM_NUMBER_OF_BYTES_WRITE DESC 
	LIMIT 2 \G
```

10.查看某条sql各阶段执行时间，可开启profiling功能

```sql
set global profiling=on;
```

------
摘自：
+ [一款超级强大的慢SQL排查工具！](https://cloud.tencent.com/developer/article/1807455)
+ [mysql slow log分析工具的比较](https://cloud.tencent.com/developer/article/1114351)
+ [explain结果每个字段的含义说明](https://www.jianshu.com/p/8fab76bbf448)
+ [MySQL诊断调优常用SQL语](https://cloud.tencent.com/developer/article/1438819)

站长略有修改
