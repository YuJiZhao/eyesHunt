锁是计算机协调多个进程或线程并发访问某一资源的机制。数据库锁定机制简单的来说，就是数据库为了保证数据的一致性与完整性，而使各种共享资源在被并发访问时变得有序所设计的一种规则。对于任何一种数据库来说都需要有相应的锁机制，所以MySQL也不能例外。
+ 基于锁的属性分类：共享锁、排他锁
+ 基于锁的状态分类：意向共享锁、意向排它锁
+ 基于锁的粒度分类：行级锁（innodb）、表级锁（innodb、myisam）、页级锁（innodb）、记录锁、间隙锁、临键锁
+ 基于锁的思想分类：乐观锁、悲观锁

# 基于属性

共享锁（share lock）：共享锁又称读锁，简称 S 锁；当一个事务为数据加上读锁之后，其他事务只能对该数据加读锁，而不能对数据加写锁，直到所有的读锁释放之后其他事务才能对其进行加持写锁。共享锁的特性主要是为了支持并发的读取数据，读取数据的时候不支持修改，避免出现重复读的问题。

排他锁（exclusive lock）：排他锁又称写锁，简称 X 锁；当一个事务为数据加上写锁时，其他请求将不能再为数据加任何锁，直到该锁释放之后，其他事务才能对数据进行加锁。排他锁的目的是在数据修改时候，不允许其他人同时修改，也不允许其他人读取，避免了出现脏数据和脏读的问题。

# 基于状态

InnoDB 支持多粒度锁（multiple granularity locking），它允许行级锁与表级锁共存，而意向锁就是其中的一种表锁。意向锁是有数据引擎自己维护的，用户无法手动操作意向锁，在为数据行加共享/排他锁之前，InooDB 会先获取该数据行所在在数据表的对应意向锁。
+ 意向共享锁（intention shared lock, IS）：事务在请求 S 锁前，要先获得 IS 锁
+ 意向排它锁（intention exclusive lock, IX）：事务在请求 X 锁前，要先获得 IX 锁

意向锁存在的意义：如果另一个任务试图在该表级别上应用共享或排它锁，则受到由第一个任务控制的表级别意向锁的阻塞。第二个任务在锁定该表前不必检查各个页或行锁，而只需检查表上的意向锁。

这么说可能难以理解，设想有一张 users 表，事务 A 获取了某一行的排他锁，并未提交：

```sql
SELECT * FROM users WHERE id = 6 FOR UPDATE;
```

事务 B 想要获取 users 表的表锁：

```sql
LOCK TABLES users READ;
```

因为共享锁与排他锁互斥，所以事务 B 在试图对 users 表加共享锁的时候，必须保证：
+ 当前没有其他事务持有 users 表的排他锁
+ 当前没有其他事务持有 users 表中任意一行的排他锁

为了检测是否满足第二个条件，事务 B 必须在确保 users 表不存在任何排他锁的前提下，去检测表中的每一行是否存在排他锁。很明显这是一个效率很差的做法，但是有了意向锁之后，情况就不一样了。

首先需要了解意向锁的兼容性，意向锁之间相互兼容，但与表级共享锁/排他锁存在互斥，具体如下（注意，这里的排他/共享锁指的都是表锁，意向锁不会与行级的共享/排他锁互斥）：

|  | 意向共享锁（IS） | 意向排他锁（IX） |
|  ---- | ---- | ---- |
| 共享锁（S） | 兼容 | 互斥 |
| 排他锁（X） | 互斥 | 互斥 |

现在我们回到刚才 users 表的例子，事务 A 获取了某一行的排他锁，并未提交：

```sql
SELECT * FROM users WHERE id = 6 FOR UPDATE;
```

此时 users 表存在两把锁：users 表上的意向排他锁与 id 为 6 的数据行上的排他锁。然后事务 B 想要获取 users 表的共享锁：

```sql
LOCK TABLES users READ;
```

此时事务 B 检测事务 A 持有 users 表的意向排他锁，就可以得知事务 A 必然持有该表中某些数据行的排他锁，那么事务 B 对 users 表的加锁请求就会被排斥（阻塞），而无需去检测表中的每一行数据是否存在排他锁。

# 基于粒度

各类锁简要描述：
+ 表锁：表锁是指上锁的时候锁住的是整个表，当下一个事务访问该表的时候，必须等前一个事务释放了锁才能进行对表进行访问
  + 特点：粒度大，加锁简单，容易冲突
+ 行锁：行锁是指上锁的时候锁住的是表的某一行或多行记录，其他事务访问同一张表时，只有被锁住的记录不能访问，其他的记录可正常访问
  + 特点：粒度小，加锁比表锁麻烦，不容易冲突，相比表锁支持的并发要高
+ 页锁：页级锁是 MySQL 中锁定粒度介于行级锁和表级锁中间的一种锁。表级锁速度快，但冲突多，行级冲突少，但速度慢。所以取了折中的页级，一次锁定相邻的一组记录
  + 特点：开销和加锁时间界于表锁和行锁之间，会出现死锁；锁定粒度界于表锁和行锁之间，并发度一般
+ 间隙锁：是属于行锁的一种，间隙锁是在事务加锁后，其锁住的是表记录的某一个区间。间隙锁的存在，主要是为了解决幻读问题。幻读就是指在一个事务内读取某个范围的记录时，另外一个事务在该范围内插入了新的记录，当第一个事务再次读取该范围的记录时，会发现有些原本不存在的记录，这就是幻读。加了间隙锁后，第二个事务就无法插入了，必须等待第一个事务释放锁。
  + 工作的隔离级别：可重复读、序列化
  + 主要适用场景：
    + 防止幻读：间隙锁的主要目的是防止其他事务在已经锁定的范围内插入新的行。这可以避免"幻读"问题，即一个事务在读取某个范围内的所有行时，另一个事务插入了一个新行，当第一个事务再次读取该范围时，会发现有一个"幻影"行
    + 范围查询：在执行范围查询时，如果事务需要对查询结果进行更新或删除，那么间隙锁可以保证在事务执行期间，不会有新的行插入到查询范围中
  + 缺点：
    + 性能影响：间隙锁会阻止其他事务在已经锁定的范围内插入新的行，这可能会影响到数据库的并发性能，尤其在需要大量插入操作的高并发场景下
    + 死锁风险：A、B 事务各锁住一个区间，然后 A、B 各自想访问对方的区间，这种情况下就会导致死锁
    + 复杂性︰理解间隙锁及其对事务的影响可能需要相当深入的数据库知识，尤其是在处理并发问题和调优数据库性能时
    + 锁定范围可能过大：间隙锁锁定的是索引之间的间隙，这可能会比实际需要锁定的行要多。如果一个事务需要锁定的只是表中的一小部分行，但由于间隙锁的存在，可能会锁定更大范围的数据，导致不必要的锁定冲突
+ 记录锁：是属于行锁的一种，只不过记录锁的范围只是表中的某一条记录，记录锁是说事务在加锁后锁住的只是表的某一条记录，加了记录锁之后数据可以避免数据在查询的时候被修改的重复读问题，也避免了在修改的事务未提交前被其他事务读取的脏读问题
  + 记录锁分为共享锁与排他锁
+ 临键锁：是属于行锁的一种，并且它是 INNODB 的行锁默认算法，总结来说它就是记录锁和间隙锁的组合，临键锁会把查询出来的记录锁住，同时也会把该范围查询内的所有间隙空间也会锁住，再之它会把相邻的下一个区间也会锁住


# 基于思想

乐观锁与悲观锁是人们定义出来的概念，是一种思想，是处理并发资源的常用手段。不能把他们与 mysql 中提供的锁机制（表锁，行锁，排他锁，共享锁）混为一谈。
+ 乐观锁：顾名思义，就是对数据的处理持乐观态度，乐观的认为数据一般情况下不会发生冲突，只有提交数据更新时，才会对数据是否冲突进行检测。如果发现冲突了，则返回错误信息给用户，让用户自已决定如何操作。乐观锁的实现不依靠数据库提供的锁机制，需要我们自已实现，实现方式一般是记录数据版本，一种是通过版本号，一种是通过时间戳。给表加一个版本号或时间戳的字段，读取数据时，将版本号一同读出，数据更新时，将版本号加1。当我们提交数据更新时，判断当前的版本号与第一次读取出来的版本号是否相等。如果相等，则予以更新，否则认为数据过期，拒绝更新，让用户重新操作。
+ 悲观锁：顾名思义，就是对于数据的处理持悲观态度，总认为会发生并发冲突，获取和修改数据时，别人会修改数据。所以在整个数据处理过程中，需要将数据锁定。悲观锁的实现，通常依靠数据库提供的锁机制实现，比如排他锁，`select XXX for update` 等来实现悲观锁。

------
摘自：
+ [MySQL锁机制](http://space.eyescode.top/blog/details/123)
+ [详解 MySql InnoDB 中意向锁的作用](https://juejin.cn/post/6844903666332368909)
+ [【史上最全】MySQL各种锁详解：1小时彻底搞懂MySQL的各种锁](https://www.bilibili.com/video/BV1po4y1M7k5)

站长略有修改