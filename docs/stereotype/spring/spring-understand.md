# Spring 的优点

+ 通过控制反转和依赖注入实现松耦合
+ 支持面向切面的编程，并且把应用业务逻辑和系统服务分开
+ 通过切面和模板减少样板式代码
+ 声明式事务的支持。可以从单调繁冗的事务管理代码中解脱出来，通过声明式方式灵活地进行事务的管理，提高开发效率和质量
+ 方便集成各种优秀框架。内部提供了对各种优秀框架的直接支持（如：Hessian、Quartz、MyBatis等）
+ 方便程序的测试。Spring支持Junit4，添加注解便可以测试Spring程序

# Springboot 的优点

+ 内置 servlet 容器，不需要在服务器部署 tomcat。只需要将项目打成 jar 包，使用`java -jar xxx.jar`一键式启动项目
+ SpringBoot 提供了 starter，把常用库聚合在一起，简化复杂的环境配置，快速搭建 spring 应用环境
+ 可以快速创建独立运行的 spring 项目，集成主流框架
+ 准生产环境的运行应用监控

------
摘自：
+ [Spring的优点](https://www.topjavaer.cn/framework/spring.html)
+ [Springboot的优点](https://www.topjavaer.cn/framework/springboot.html)