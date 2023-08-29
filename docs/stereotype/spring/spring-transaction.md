# Spring 事务原理

这里说的是声明式事务。

`@Transaction`是通过 AOP 实现的。AOP 其实就是生成 bean 对象的代理对象。在 bean 进行创建初始化时， 如果是有事务注解的方法，就会被进行增强，最终形成代理类。而在 spring 中，有两种动态代理的方式：
+ JDK 动态代理：将原始对象放入代理对象内部，通过调用内含的原始对象来实现原始的业务逻辑，这是一种装饰器模式。private、protected、final 方法肯定不能被代理，因为接口就不支持。另外也不支持static方法
+ CGLIB 动态代理：它是通过生成原始对象的子类，子类复写父类的方法，从而实现对父类的增强
  + private 方法肯定是不能被代理的，因为子类和其它类都不能访问一个类的私有方法
  + protected 方法可以被代理，但是 CGLIB 是基于继承关系来实现的，生成的代理类中对于 protected 的代理方法，也是 protected 的，访问范围受限制
  + final 修饰的方法不能被代理，因为 final 修饰的方法不能被子类重写。final 修饰的类也不能被代理，因为 final 修饰的类不能被继承
  + 静态方法不能被代理

具体可见这篇博客：[AOP问题](http://hunt.eyescode.top/stereotype/spring/spring-aop.html)

# Spring 事务失效场景

结合事务实现原理可知，在以下场景下 Spring 事务会失效：
+ 方法为 final 方法或非 public 方法：Spring 要求被代理方法必须是 public 的，且不是 final 修饰的，因为 AOP 不支持
+ 方法内部调用：方法拥有事务的能力是因为 AOP 生成代理了对象，但是方法内部调用的话不走代理对象，所以不会有事务
+ 未被 Spring 管理：没有被 Spring 管理自然也不会被 AOP 增强
+ 未开启事务：需要在入口类使用注解`@EnableTransactionManagement`开启事务
+ 表不支持事务：MySQL5.5 之前默认的存储引擎是 Myisam，而 Myisam 是不支持事务的，如果使用的数据库不支持事务，那么自然无法使用事务功能
+ 方法的事务传播类型不支持事务：如果内部方法的事务传播类型为不支持事务的传播类型，则内部方法的事务同样会在 Spring 中失效，如`@Transactional(propagation = Propagation.NOT_SUPPORTED)`
+ 错误的标注异常类型：如果在`@Transactional`注解中标注了错误的异常类型，则 Spring 事务的回滚会失效。Spring 中对于默认回滚的事务异常类型为 RuntimeException，如果代码抛出的是 Exception 异常，则事务无法捕获。当然可以手动设置 rollbackFor 属性去捕获指定异常
+ 不正确的捕获异常：如果方法内异常在方法内被 try-catch 捕获处理的话，异常就不会向上传递，也不会触发事务
+ 多线程调用问题：如果方法内，启用新线程执行 sql 操作，则不会回滚。Spring 的事务是通过 ThreadLocal 来保证线程安全的，事务和当前线程绑定，多个线程自然会让事务失效

# Spring 事务传播行为

```java
public enum Propagation {

	/**
   * required
   * 
   * 如果没有事务则开启一个新的事务
	 * 如果存在一个事务，则加入当前事务
   * 如果嵌套调用的两个方法都加了事务注解
   *   1. 如果运行在同一个线程中，则这两个方法融入一个事务中
   *   2. 如果运行在不同线程中，则会开启新的事务
	 */
	REQUIRED(TransactionDefinition.PROPAGATION_REQUIRED),

	/**
   * supports
   * 
	 * 如果当前存在事务，则融入当前事务
   * 如果当前没有事务，则以非事务形式执行
	 */
	SUPPORTS(TransactionDefinition.PROPAGATION_SUPPORTS),

	/**
   * mandatory
   * 
	 * 如果当前存在事务，则融入当前事务
   * 如果当前不存在事务，则抛出异常
	 */
	MANDATORY(TransactionDefinition.PROPAGATION_MANDATORY),

	/**
   * requires new
   * 
	 * 总是开启一个新的事务
   * 需要使用 JtaTransactionManager 作为事务管理器
	 */
	REQUIRES_NEW(TransactionDefinition.PROPAGATION_REQUIRES_NEW),

	/**
   * not supports
   * 
	 * 总是非事务地执行，并挂起任何存在的事务
   * 需要使用 JtaTransactionManager 作为事务管理器
	 */
	NOT_SUPPORTED(TransactionDefinition.PROPAGATION_NOT_SUPPORTED),

	/**
   * never
   * 
	 * 总是非事务地执行，如果存在一个活动事务，则抛出异常
	 */
	NEVER(TransactionDefinition.PROPAGATION_NEVER),

	/**
   * nested
   * 
	 * 如果一个活动的事务存在，则运行在一个嵌套的事务中
   * 如果没有活动事务, 则按 REQUIRED 属性执行
	 */
	NESTED(TransactionDefinition.PROPAGATION_NESTED);


	private final int value;


	Propagation(int value) {
		this.value = value;
	}

	public int value() {
		return this.value;
	}
}
```

PROPAGATION_NESTED 与 PROPAGATION_REQUIRES_NEW 的区别:
+ 使用 PROPAGATION_REQUIRES_NEW 时，内层事务与外层事务是两个独立的事务。一旦内层事务进行了提交后，外层事务不能对其进行回滚。两个事务互不影响
+ 使用 PROPAGATION_NESTED 时，外层事务的回滚可以引起内层事务的回滚。而内层事务的异常并不会导致外层事务的回滚，它是一个真正的嵌套事务

------
摘自：
+ [java八股系列——spring事务失效场景](http://space.eyescode.top/blog/details/243)
+ [有哪些事务传播行为？](https://topjavaer.cn/framework/spring.html#%E6%9C%89%E5%93%AA%E4%BA%9B%E4%BA%8B%E5%8A%A1%E4%BC%A0%E6%92%AD%E8%A1%8C%E4%B8%BA)

站长略有修改

推荐：
+ [一个视频教会你spring的事务传播行为](https://www.bilibili.com/video/BV1R8411c7m2)
+ [带你读懂Spring 事务——事务的传播机制](https://zhuanlan.zhihu.com/p/148504094)