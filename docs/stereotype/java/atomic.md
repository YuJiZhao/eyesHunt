Atomic 翻译成中文是原子的意思。在化学上，我们知道原子是构成一般物质的最小单位，在化学反应中是不可分割的。在我们这里 Atomic 是指一个操作是不可中断的。即使是在多个线程一起执行的时候，一个操作一旦开始，就不会被其他线程干扰。所以，所谓原子类说简单点就是具有原子/原子操作特征的类。

根据操作的数据类型，可以将 JUC 包中的原子类分为 4 类：
+ 基本类型，使用原子的方式更新基本类型
  + AtomicInteger：整型原子类
  + AtomicLong：长整型原子类
  + AtomicBoolean：布尔型原子类
+ 数组类型，使用原子的方式更新数组里的某个元素
  + AtomicIntegerArray：整型数组原子类
  + AtomicLongArray：长整型数组原子类
  + AtomicReferenceArray：引用类型数组原子类
+ 引用类型
  + AtomicReference：引用类型原子类
  + AtomicMarkableReference：原子更新带有标记的引用类型
  + AtomicStampedReference：原子更新带有版本号的引用类型。该类将整数值与引用关联起来，可用于解决原子的更新数据和数据的版本号，可以解决使用 CAS 进行原子更新时可能出现的 ABA 问题
+ 对象的属性修改类型
  + AtomicIntegerFieldUpdater：原子更新整型字段的更新器
  + AtomicLongFieldUpdater：原子更新长整型字段的更新器
  + AtomicReferenceFieldUpdater：原子更新引用类型里的字段

# 基本类型原子类

使用原子的方式更新基本类型：
+ AtomicInteger：整型原子类
+ AtomicLong：长整型原子类
+ AtomicBoolean：布尔型原子类

上面三个类提供的方法几乎相同，所以我们这里以 AtomicInteger 为例子来介绍。

```java
// 获取当前的值
public final int get() 

// 获取当前的值，并设置新的值
public final int getAndSet(int newValue)

// 获取当前的值，并自增
public final int getAndIncrement()

// 获取当前的值，并自减
public final int getAndDecrement() 

// 获取当前的值，并加上预期的值
public final int getAndAdd(int delta) 

// 如果输入的数值等于预期值，则以原子方式将该值设置为输入值（update）
boolean compareAndSet(int expect, int update) 

// 最终设置为newValue,使用 lazySet 设置之后可能导致其他线程在之后的一小段时间内还是可以读到旧的值
public final void lazySet(int newValue)
```

# 数组类型原子类

# 引用类型原子类

# 对象的属性修改类型原子类

------
摘自
+ [Atomic 原子类总结](https://javaguide.cn/java/concurrent/atomic-classes.html)


站长略有修改
