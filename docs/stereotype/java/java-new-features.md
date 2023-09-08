# Java 9

**G1 成为默认垃圾回收器**

在 Java 8 的时候，默认垃圾回收器是 `Parallel Scavenge（新生代）+ Parallel Old（老年代）`。到了 Java 9, CMS 垃圾回收器被废弃了，G1（Garbage-First Garbage Collector） 成为了默认垃圾回收器。G1 还是在 Java 7 中被引入的，经过两个版本优异的表现成为成为默认垃圾回收器。

**AOT（提前编译）技术**

JDK9 引入了 AOT 编译(提前编译，Ahead of Time)。这是与 JIT 编译（即时编译，Just in Time）相对立的一个概念。即时编译指的是在程序的运行过程中，将字节码转换为可在硬件上直接运行的机器码，并部署至托管环境中的过程。而 AOT 编译指的则是，在程序运行之前，便将字节码转换为机器码，以便在程序运行时直接使用本地代码。

AOT 的优缺点：
+ 优点：Java 虚拟机加载已经预编译成的二进制库，可以直接执行。不必等待及时编译器的预热，减少 Java 应用给人带来“第一次运行慢” 的不良体验
+ 缺点：Java 语言本身的动态特性给其带来了额外的复杂性，影响了 Java 程序静态编译代码的质量

**String 存储结构优化**

Java 8 及之前的版本，`String` 一直是用 `char[]` 存储。在 Java 9 之后，`String` 的实现改用 `byte[]` 数组存储字符串，节省了空间。

```java
public final class String implements java.io.Serializable,Comparable<String>, CharSequence {
    // @Stable 注解表示变量最多被修改一次，称为“稳定的”。
    @Stable
    private final byte[] value;
}
```

**接口私有方法**

Java 9 允许在接口中使用私有方法。这样的话，接口的使用就更加灵活了，有点像是一个简化版的抽象类。

```java
public interface MyInterface {
    private void methodPrivate(){
    }
}
```

# Java 10

**局部变量类型推断(var)**

由于太多 Java 开发者希望 Java 中引入局部变量推断，于是 Java 10 的时候它来了，也算是众望所归了！

Java 10 提供了 var 关键字声明局部变量。

```java
var id = 0;
var codefx = new URL("https://mp.weixin.qq.com/");
var list = new ArrayList<>();
var list = List.of(1, 2, 3);
var map = new HashMap<String, String>();
var p = Paths.of("src/test/java/Java9FeaturesTest.java");
var numbers = List.of("a", "b", "c");
for (var n : list)
    System.out.print(n+ " ");
```

var 关键字只能用于带有构造器的局部变量和 for 循环中。

```java
var count=null; //❌编译不通过，不能声明为 null
var r = () -> Math.random();//❌编译不通过,不能声明为 Lambda表达式
var array = {1,2,3};//❌编译不通过,不能声明数组
```

var 并不会改变 Java 是一门静态类型语言的事实，编译器负责推断出类型。另外，Scala 和 Kotlin 中已经有了 val 关键字 ( final var 组合关键字)。

# Java 11

**ZGC(可伸缩低延迟垃圾收集器)**

ZGC 即 Z Garbage Collector，是一个可伸缩的、低延迟的垃圾收集器。

ZGC 主要为了满足如下目标进行设计：
+ GC 停顿时间不超过 10ms 
+ 即能处理几百 MB 的小堆，也能处理几个 TB 的大堆
+ 应用吞吐能力不会下降超过 15%（与 G1 回收算法相比）
+ 方便在此基础上引入新的 GC 特性和利用 colored 针以及 Load barriers 优化奠定基础

ZGC 目前 处在实验阶段，只支持 `Linux/x64` 平台。与 CMS 中的 ParNew 和 G1 类似，ZGC 也采用标记-复制算法，不过 ZGC 对该算法做了重大改进。在 ZGC 中出现 Stop The World 的情况会更少！

# Java 19

**虚拟线程**

众所周知当前 Java 线程的实现是每个 Java 线程需要消耗一个操作系统线程。而操作系统线程这种资源是非常稀缺，非常宝贵的。而虚拟线程是`java.lang.Thread`一种用户态的实现，当我们在虚拟线程上使用同步 API 时，是不会阻塞任何操作系统线程，硬件利用率接近最佳。

JDK19 正式引入虚拟线程，意味着许多虚拟线程可以在同一个操作系统线程上运行它们的 Java 代码，从而有效地共享它。值得一提的是，它能做到在几个 G 的 JVM 堆上创建几百万个活动的虚拟线程（这在现在的 JDK 中几乎不可能实现），并且表现出和现在的线程几乎一样的行为。这些协程由 JVM 管理，因此它们也不会增加额外的上下文切换开销，因为它们作为普通 Java 对象存储在 RAM 中。

------
摘自：
+ [Java新特性](https://javaguide.cn/java/new-features/java8-common-new-features.html)
+ [Spring知识点梳理](http://space.eyescode.top/blog/details/263)
+ [JVM详解——执行引擎](http://space.eyescode.top/blog/details/233)

站长略有修改