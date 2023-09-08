2022年11月，Spring Framework 6.0 首个 RC 版本正式发布，需要注意的是该版本整个框架代码库现在基于 Java 17 源代码级别，所以如果你想使用需要升级版本到 JDK 17+ 才可以，并且底层依赖的 J2EE 也迁移到了Jakarta EE 9（至少 Tomcat 10 / Jetty 11，为了与 Jakarta EE 9 兼容）

Spring 官方认为 JDK11 仅仅是一个过渡使用的 JDK 版本，而 JDK17 几乎是一个全新的编程语言，增强和完善了 API 和 JVM，这让升级 JDK17 成为更具吸引力的选择。

主要更新内容如下：
+ 为 AOT 引擎设置引入 builder API
+ 支持 Spring 应用程序探索虚拟线程，基于 JDK19
+ 基于 GraalVM 将 Spring 应用程序编译成原生镜像（native image）
+ 将 javax.servlet 迁移到 jakarta.servlet，兼容最新的 web 服务器如：Tomcat 10.1、Jetty 11、Undertow 2.3，最新的持久性框架 Hibernate ORM 5.6.x
+ 。。。

详细变更可以去官网查看：[What's New in Spring Framework 6.x](https://github.com/spring-projects/spring-framework/wiki/What%27s-New-in-Spring-Framework-6.x/)，接下来只重点深入介绍几点影响重大的新功能！

# AOT 提前编译

Ahead-Of-Time，即预先编译，与我们熟知的 Just-In-Time（JIT，即时编译）来说 AOT 带来的好处是：
+ JVM 可以直接加载这些已经预编译成二进制码的类信息，可以直接调用，而无需再将其运行时编译成二进制码。因为 AOT 不占用运行时间，可以做一些较耗时的优化
+ AOT 的方式可以减少 JIT 带来的预热时间，减少 Java 应用长期给人带来的“第一次运行慢”感觉

AOT 的引入，意味着 Spring 生态正式引入了提前编译技术，相比于 JIT 编译，AOT 有助于优化 Spring 框架启动慢、占用内存多、以及垃圾无法被回收等问题。

# 虚拟线程

众所周知当前 Java 线程的实现是每个 Java 线程需要消耗一个操作系统线程。而操作系统线程这种资源是非常稀缺，非常宝贵的。而虚拟线程是`java.lang.Thread`一种用户态的实现，当我们在虚拟线程上使用同步 API 时，是不会阻塞任何操作系统线程，硬件利用率接近最佳。

JDK19 正式引入虚拟线程，意味着许多虚拟线程可以在同一个操作系统线程上运行它们的 Java 代码，从而有效地共享它。值得一提的是，它能做到在几个G的JVM堆上创建几百万个活动的虚拟线程（这在现在的JDK中几乎不可能实现），并且表现出和现在的线程几乎一样的行为。这些协程由 JVM 管理，因此它们也不会增加额外的上下文切换开销，因为它们作为普通 Java 对象存储在 RAM 中。

# Spring Native

在新版本中引入了 Spring Native，有了 Spring Native，Spring 可以不再依赖 Java 虚拟机，而是基于 GraalVM 将 Spring 应用程序编译成原生镜像（native image），提供了一种新的方式来部署 Spring 应用，这种部署 Spring 的方式是云原生友好的。

Spring Native 的优点很明显，编译出来的原生 Spring 应用可以作为一个独立的可执行文件进行部署，而不需要安装 JVM，而且启动时间非常短并且消耗更少的资源，但它的缺点就是构建时长要比JVM更长一些。

Spring Framework 6.0.x 原生镜像支持的 GraalVM 版本是基于 JDK 17-19 的 GraalVM 22.3。请注意，截至 2023 年，GraalVM 与 OpenJDK 发布模型保持一致，每个新的 GraalVM 版本仅支持最新的 Java 级别。因此，Spring Framework 6.x 功能版本可能需要在未来需要具有更高 JDK 基线的新 GraalVM 版本，例如基于 JDK 21 作为下一个 LTS。

------
摘自：
+ [Spring 6.0 正式发布，一文了解新特性](https://juejin.cn/post/7175117867870847037)
+ [JVM详解——执行引擎](http://space.eyescode.top/blog/details/233)

站长略有修改