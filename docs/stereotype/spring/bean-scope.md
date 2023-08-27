Spring Bean作用域是指在Spring容器中管理的Bean对象的生命周期和可见范围。Spring框架提供了五种Bean作用域：
+ Singleton(单例)：单例模式，Spring IOC容器中只会存在一个共享的Bean实例，无论有多少个Bean引用它，始终指向同一对象。该模式在多线程下是不安全的。Singleton作用域是Spring中的缺省作用域，也可以显示地将 Bean定义为singleton模式
+ Prototype(原型)：原型模式，每次通过Spring容器获取Prototype定义的bean时，容器都将创建一个新的Bean实例，每个Bean实例都有自己的属性和状态，而Singleton全局只有一个对象。根据经验，对有状态的bean使用Prototype作用域，而对无状态的bean使用Singleton作用域。需要注意的是，Spring在创建好交给使用者之后则不会再管理后续的生命周期。
+ Request(请求)：在一次Http请求中，容器会返回该Bean的同一实例。而对不同的Http请求则会产生新的Bean，而且该bean仅在当前Http Request内有效，当前Http请求结束，该bean实例也将会被销毁。该作用域仅适用于WebApplicationContext环境。
+ Session(会话)：在一次Http Session中，容器会返回该Bean的同一实例。而对不同的Session请求则会创建新的实例，该bean实例仅在当前Session内有效。同Http请求相同，每一次session请求创建新的实例，而不同的实例之间不共享属性，且实例仅在自己的 session 请求内有效，请求结束，则实例将被销毁。该作用域仅适用于WebApplicationContext环境。
+ GlobalSession(全局会话)：在一个全局的HTTP会话中，每个Bean实例都会被创建一次，该作用域仅适用于WebApplicationContext环境。在一个全局的Http Session中，容器会返回该Bean的同一个实例，仅在使用 portlet context时有效。

通过配置Bean的作用域，可以控制Bean的生命周期和可见范围，从而更好地管理和利用Bean对象。

注：Global Session是指在整个应用程序中都可以访问和使用的会话对象。关键在于"整个应用程序"，因为一个应用可能是部署在多台机器上的，而Global Session是多台机器共享的Session。Global Session可以通过不同的方式实现，例如使用数据库、缓存或分布式存储等。在Java中，可以使用Servlet API中的HttpSession来实现全局会话。需要注意的是，全局会话可能会带来一些安全风险，例如会话劫持和会话固定攻击等。因此，在实现全局会话时，需要采取一些安全措施，例如使用安全的会话ID、定期更新会话ID等。

------
摘自：
+ [java八股系列——Spring Bean的作用域与生命周期](http://space.eyescode.top/blog/details/245)