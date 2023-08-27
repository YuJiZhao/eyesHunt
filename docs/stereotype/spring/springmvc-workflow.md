Spring 的 MVC 框架是围绕一个 DispatcherServlet 来设计的，这个 Servlet 会把请求分发给各个处理器，并支持可配置的处理器映射、视图渲染、本地化、时区与主题渲染等，甚至还能支持文件上传。

流程大致如下：

1. 用户发起请求：用户在浏览器中输入URL，点击链接或提交表单，向服务器发起请求。
2. DispatcherServlet接收请求：DispatcherServlet是Spring MVC的核心控制器，它接收所有的请求并将其分发到相应的处理器中。
3. HandlerMapping匹配处理器：HandlerMapping根据请求的URL和其他条件，匹配合适的处理器。
4. HandlerAdapter调用处理器：HandlerAdapter将请求传递给匹配的处理器，并调用处理器的方法来处理请求。
5. 处理器处理请求：处理器根据请求的类型和参数，执行相应的业务逻辑，并返回一个ModelAndView对象。
6. ViewResolver解析视图：ViewResolver根据ModelAndView对象中的视图名称，解析出对应的视图。
7. 视图渲染：视图将ModelAndView对象中的数据渲染成HTML、JSON、XML等格式的响应数据。
8. 响应数据返回：响应数据返回给客户端，客户端浏览器根据响应数据渲染页面或执行其他操作。

![在这里插入图片描述](http://space-cdn.eyescode.top/blog/e9d62abd7fc4a80d50596c74f5127370.png)

在整个过程中，Spring MVC还提供了一些其他的功能，如拦截器、数据绑定、数据验证、异常处理等。这些功能可以帮助开发者更方便地开发Web应用程序。

------
摘自：
+ [java八股系列——SpringMVC从接受请求到完成响应的过程](http://space.eyescode.top/blog/details/244)