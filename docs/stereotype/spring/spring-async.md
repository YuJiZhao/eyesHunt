当我们调用第三方接口或者方法的时候，我们不需要等待方法返回才去执行其它逻辑，这时如果响应时间过长，就会极大的影响程序的执行效率。所以这时就需要使用异步方法来并行执行我们的逻辑。在 SpringBoot 中可以使用`@Async`注解实现异步操作。

# @Async 注解的使用

1.首先在启动类上添加 `@EnableAsync` 注解：

```java
@Configuration
@EnableAsync
public class App {
    public static void main(String[] args) {
        ApplicationContext ctx = new AnnotationConfigApplicationContext(App.class);
        MyAsync service = ctx.getBean(MyAsync.class);
        System.out.println(service.getClass());
        service.async1();
        System.out.println("main thread finish...");
    }
}
```

2.在对应的方法上添加@Async注解：

```java
@Component
public class MyAsync {
    @Async
    public void asyncTest() {
        try {
            TimeUnit.SECONDS.sleep(20);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        System.out.println("asyncTest...");
    }
}
```

使用注意：
+ 默认情况下（即`@EnableAsync`注解的`mode=AdviceMode.PROXY`），同一个类内部没有使用`@Async`注解修饰的方法调用`@Async`注解修饰的方法，是不会异步执行的，这点跟`@Transitional`注解类似，底层都是通过动态代理实现的。如果想实现类内部自调用也可以异步，则需要切换`@EnableAsync`注解的`mode=AdviceMode.ASPECTJ`
+ 任意参数类型都是支持的，但是方法返回值必须是 void 或者 Future 类型。当使用 Future 时，可以使用实现了 Future 接口的 ListenableFuture 接口或者 CompletableFuture 类与异步任务做更好的交互。如果异步方法有返回值，没有使用`Future<V>`类型的话，调用方获取不到返回值

# @Async 注解原理

待定

------
摘自：
+ [@Async注解的原理](https://topjavaer.cn/framework/spring.html#async%E6%B3%A8%E8%A7%A3%E7%9A%84%E5%8E%9F%E7%90%86)
+ [Spring @Async 注解的使用以及原理（一）](https://blog.csdn.net/qq_22076345/article/details/82194482)

站长略有修改