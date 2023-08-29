# 循环依赖是什么

Bean A 依赖 B，Bean B 依赖 A，这种情况下出现循环依赖：

```
Bean A → Bean B → Bean A
```

更复杂的间接依赖造成的循环依赖如下：

```

Bean A → Bean B → Bean C → Bean D → Bean E → Bean A

```

# 循环依赖会产生什么结果

当 Spring 正在加载所有 Bean 时，Spring 尝试以能正常创建 Bean 的顺序去创建 Bean。例如，有如下依赖:

```
Bean A → Bean B → Bean C
```

Spring 先创建 Bean C，接着创建 Bean B（将 C 注入 B 中），最后创建 Bean A（将 B 注入 A 中）。

但当存在循环依赖时，Spring 将无法决定先创建哪个 Bean。这种情况下，Spring 将产生异常 BeanCurrentlyInCreationException。

# Spring 如何解决依赖循环

Spring 会自动解决部分情况下的依赖循环：
+ 对于构造器注入的循环依赖，Spring 处理不了，会直接抛出 BeanCurrentlylnCreationException 异常
+ 对于属性注入的循环依赖
  + 单例模式：是通过三级缓存处理来循环依赖的
  + 非单例模式：无法处理

因此下面只分析单例模式下属性注入的循环依赖是怎么处理的。

首先，Spring 单例对象的初始化大略分为三步：
+ createBeanInstance：实例化 bean，使用构造方法创建对象，为对象分配内存
+ populateBean：进行依赖注入
+ initializeBean：初始化bean

Spring 为了解决单例的循环依赖问题，使用了三级缓存：
+ singletonObjects：完成了初始化的单例对象 map，`bean name --> bean instanceearly`
+ SingletonObjects：完成实例化未初始化的单例对象 map，`bean name --> bean instance`
+ singletonFactories：单例对象工厂 map，`bean name --> ObjectFactory`，单例对象实例化完成之后会加入 singletonFactories

在调用 createBeanInstance 进行实例化之后，会调用 addSingletonFactory，将单例对象放到 singletonFactories 中。

```java
protected void addSingletonFactory(String beanName, ObjectFactory<?> singletonFactory) {
    Assert.notNull(singletonFactory, "Singleton factory must not be null");
    synchronized (this.singletonObjects) {
        if (!this.singletonObjects.containsKey(beanName)) {
            this.singletonFactories.put(beanName, singletonFactory);
            this.earlySingletonObjects.remove(beanName);
            this.registeredSingletons.add(beanName);
        }
    }
}
```

假如 A 依赖了 B 的实例对象，同时 B 也依赖 A 的实例对象：
1. A 首先完成了实例化，并且将自己添加到 singletonFactories 中
2. 接着进行依赖注入，发现自己依赖对象 B，此时就尝试去`get(B)`
3. 发现 B 还没有被实例化，对 B 进行实例化
4. 然后 B 在初始化的时候发现自己依赖了对象 A，于是尝试`get(A)`，尝试一级缓存 singletonObjects 和二级缓存 earlySingletonObjects 没找到，尝试三级缓存 singletonFactories，由于 A 初始化时将自己添加到了 singletonFactories，所以 B 可以拿到 A 对象，然后将 A 从三级缓存中移到二级缓存中
5. B 拿到 A 对象后顺利完成了初始化，然后将自己放入到一级缓存 singletonObjects 中
6. 此时返回 A 中，A 此时能拿到 B 的对象顺利完成自己的初始化

由此看出，属性注入的循环依赖主要是通过将实例化完成的 bean 添加到 singletonFactories 来实现的。而使用构造器依赖注入的 bean 在实例化的时候会进行依赖注入，不会被添加到 singletonFactories 中。比如 A 和 B 都是通过构造器依赖注入，A 在调用构造器进行实例化的时候，发现自己依赖 B，B 没有被实例化，就会对 B 进行实例化，此时 A 未实例化完成，不会被添加到 singtonFactories。而 B 依赖于 A，B 会去三级缓存寻找 A 对象，发现不存在，于是又会实例化 A， A实例化了两次，从而导致抛异常。

总结：
1. 利用缓存识别已经遍历过的节点
2. 利用 Java 引用，先提前设置对象地址，后完善对象

# 如何解决依赖循环

循环依赖是指两个或更多的组件之间存在着互相依赖的关系。在 SpringBoot 应用程序中，循环依赖通常是由以下几种情况引起的：
+ 构造函数循环依赖： 两个或更多的组件在它们的构造函数中互相依赖
+ 属性循环依赖： 两个或更多的组件在它们的属性中互相依赖
+ 方法循环依赖： 两个或更多的组件在它们的方法中互相依赖

针对这些情况，Spring 提供了一些解决循环依赖的方法：
+ Setter注入： 使用 setter 方法注入依赖项，而不是在构造函数中注入，这样只有当依赖被使用时才进行注入
+ 延迟注入：使用`@Lazy`注解延迟加载依赖项。这样在注入依赖时，先注入代理对象，当首次使用时再创建对象完成注入
+ `@Autowired`注解的 required 属性： 将 required 属性设置为 false，以避免出现循环依赖问题。
+ `@DependsOn`注解：使用`@DependsOn`注解指定依赖项的加载顺序，以避免出现循环依赖问题

------
摘自：
+ [Spring怎么解决循环依赖的问题？](https://topjavaer.cn/framework/spring.html#spring%E6%80%8E%E4%B9%88%E8%A7%A3%E5%86%B3%E5%BE%AA%E7%8E%AF%E4%BE%9D%E8%B5%96%E7%9A%84%E9%97%AE%E9%A2%98)
+ [Springboot循环依赖如何解决](https://blog.csdn.net/qq_18298439/article/details/88818418)
+ [SpringBoot循环依赖，如何解决？](https://zhuanlan.zhihu.com/p/638625895)

站长略有修改