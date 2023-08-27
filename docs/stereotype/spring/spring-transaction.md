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

------
摘自：
+ [java八股系列——spring事务失效场景](http://space.eyescode.top/blog/details/243)