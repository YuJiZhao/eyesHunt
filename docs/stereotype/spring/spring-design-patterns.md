# 单例模式

Spring 创建 Bean 实例时，如果是 Singleton 作用域，那么就是以单例模式创建的。

# 原型模式

Spring 创建 Bean 实例时，如果是 Prototype 作用域，那么就是以原型模式创建的。

# 简单工厂模式

BeanFactory 就是简单工厂模式的体现，根据传入一个唯一标识来获得 Bean 对象。

```java
@Override
public Object getBean(String name) throws BeansException {
    assertBeanFactoryActive();
    return getBeanFactory().getBean(name);
}
```

# 工厂方法模式

FactoryBean 就是典型的工厂方法模式。Spring 在使用`getBean()`调用获得该 Bean 时，会自动调用该 Bean 的`getObject()`方法。每个 Bean 都会对应一个 FactoryBean，如 SqlSessionFactory 对应 SqlSessionFactoryBean。

# 适配器模式

SpringMVC 中的适配器 HandlerAdatper。

由于应用会有多个 Controller 实现，如果需要直接调用 Controller 方法，那么需要先判断是由哪一个 Controller 处理请求，然后调用相应的方法。当增加新的 Controller，需要修改原来的逻辑，违反了开闭原则（对修改关闭，对扩展开放）。

为此，Spring 提供了一个适配器接口，每一种 Controller 对应一种 HandlerAdapter 实现类，当请求过来，SpringMVC 会调用 `getHandler()` 获取相应的 Controller，然后获取该 Controller 对应的 HandlerAdapter，最后调用`HandlerAdapter的handle()`方法处理请求，实际上调用的是 Controller 的 `handleRequest()`。每次添加新的 Controller 时，只需要增加一个适配器类就可以，无需修改原有的逻辑。

常用的处理器适配器：SimpleControllerHandlerAdapter，HttpRequestHandlerAdapter，AnnotationMethodHandlerAdapter。

# 代理模式

spring 的 aop 使用了动态代理，有两种方式 JdkDynamicAopProxy 和 Cglib2AopProxy。

# 观察者模式

spring 中 observer 模式常用的地方是 listener 的实现，如 ApplicationListener。

# 模板模式

Spring 中 jdbcTemplate、hibernateTemplate 等，就使用到了模板模式。

------
摘自：
+ [Spring 用到了哪些设计模式？](https://topjavaer.cn/framework/spring.html#spring-%E7%94%A8%E5%88%B0%E4%BA%86%E5%93%AA%E4%BA%9B%E8%AE%BE%E8%AE%A1%E6%A8%A1%E5%BC%8F)

站长略有修改