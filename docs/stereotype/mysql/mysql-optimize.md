# 服务器硬件的优化

提升硬件设备，例如选择尽量高频率的内存（频率不能高于主板的支持）、提升网络带宽、使用 SSD 高速磁盘、提升 CPU 性能等。

CPU 的选择（CPU 有两个关键因素：核数、主频）：
+ CPU 密集型：计算比较多，频繁执行复杂 SQL 的场景，此时 CPU 的频率越高越好
+ IO 密集型：并发比较高的场景，此时 CPU 的数量比频率重要

内存的选择：
+ OLAP 类型数据库，需要更多内存，和数据获取量级有关
+ OLTP 类型数据一般内存是 cpu 核心数量的 2 倍到 4 倍，没有最佳实践

存储方面：
+ 根据存储数据种类的不同，选择不同的存储设备
+ 配置合理的 RAID 级别（raid5、raid10、热备盘）
+ 对与操作系统来讲，不需要太特殊的选择，最好做好冗余（raid1）（ssd、sas 、sata）

raid卡：
+ 实现操作系统磁盘的冗余（raid1）
+ 平衡内存和磁盘资源
+ 随机的 I/O 和顺序的 I/O
+ 主机 RAID 卡的 BBU(Battery Backup Unit) 要关闭。

网络设备方面：
+ 使用流量支持更高的网络设备（交换机、路由器、网线、网卡、HBA卡）

# 结构优化

+ 垂直分表，降低单表的复杂度
+ 水平分表，降低单表数据量
+ 主从复制，读写分离
+ 对于历史数据，如果不再使用，可以同步到 Hive 离线存储，然后删掉
+ 冷热分离

# MySQL数据库配置优化

+ innodb_buffer_pool_size：表示缓冲池字节大小。推荐值为物理内存的 50%~80%
+ innodb_flush_log_at_trx_commit：用来控制 redo log 刷新到磁盘的策略
+ sync_binlog：每提交 n 次事务就同步写到磁盘中
+ innodb_max_dirty_pages_pct：脏页占到该比例时，触发刷脏页到磁盘。推荐值为 25%~50%。
+ innodb_io_capacity：后台进程最大 IO 性能指标。默认200，如果是 SSD 磁盘，可以调整为 5000~20000
+ innodb_data_file_path：指定innodb共享表空间文件的大小
+ long_qurey_time：慢查询日志的阈值设置，单位秒
+ binlog_format=row：mysql 复制的形式，row 为 MySQL8.0 的默认形式
+ max_connections：最大连接数，调高该参数则应降低 interactive_timeout、wait_timeout 的值
+ innodb_log_file_size：过大，实例恢复时间长；过小，造成日志切换频繁
+ general_log：是否开启全量日志，默认关闭

# 存储引擎的选择

+ Myisam：适合并发量不大，读多写少，而且都能很好的用到索引，且sql语句比较简单的应用，比如，数据仓库。
+ Innodb：适合并发访问大，写操作比较多，有外键、事务等需求的应用，系统内存较大。

# 索引优化

+ 遵守最左前缀规则
+ 避免模糊查询不能利用索引的情况，比如避免`like '%XX'或者like '%XX%'`
+ 不要过多创建索引
+ 索引长度尽量短
+ 索引更新不能频繁
+ 索引列不能参与计算

# 查询时优化

+ 小表驱动大表
+ 避免全表扫描
+ 利用覆盖索引，少使用 `select *`
+ order by 排序应该遵循最佳左前缀查询
+ 谨慎使用 for update

------
摘自：
+ [一文搞定MySQL性能调优](https://cloud.tencent.com/developer/article/1807455)
+ [超详细MySQL高性能优化实战总结！](https://zhuanlan.zhihu.com/p/46647057)
+ [面试官问我MySQL调优，我真的是](https://www.cnblogs.com/Java3y/p/15396099.html)

站长略有修改