Spring Bean 的生命周期可以分为以下几个阶段：
1. 实例化（Instantiation）：当 Spring 容器启动时，会根据配置文件或注解等方式创建 Bean 实例
2. 属性赋值（Populate）：在实例化后，Spring 容器会将配置文件或注解中的属性值注入到 Bean 实例中
3. BeanPostProcessor 的前置处理：在 Bean 实例化和属性赋值之后，Spring 容器会调用所有实现了 BeanPostProcessor 接口的类的 postProcessBeforeInitialization 方法，对 Bean 进行前置处理
4. 初始化（Initialization）：在属性赋值完成后，Spring 容器会调用 Bean 的初始化方法，可以通过实现 InitializingBean 接口或在配置文件中指定 init-method 来定义初始化方法
5. BeanPostProcessor 的后置处理：在 Bean 初始化方法执行完成后，Spring 容器会调用所有实现了 BeanPostProcessor 接口的类的 postProcessAfterInitialization 方法，对 Bean 进行后置处理
6. 销毁（Destruction）：当 Spring 容器关闭时，会调用 Bean 的销毁方法，可以通过实现 DisposableBean 接口或在配置文件中指定 destroy-method 来定义销毁方法

需要注意的是，Spring Bean 的生命周期并不是线性的，可能会在某个阶段中断或回到之前的阶段。例如，在初始化阶段中，如果发生异常，则会回到实例化阶段重新创建 Bean 实例。

在这个过程中，可以通过实现接口或在配置文件中指定方法来定义 Bean 的初始化和销毁方法：
+ `@PostConstruct`：用于在 Bean 初始化之后执行一些操作。这个注解可以用在方法上，方法会在 Bean 初始化之后被调用
+ `@PreDestroy`：用于在 Bean 销毁之前执行一些操作。这个注解可以用在方法上，方法会在 Bean 销毁之前被调用

------
摘自：
+ [java八股系列——Spring Bean的作用域与生命周期](http://space.eyescode.top/blog/details/245)