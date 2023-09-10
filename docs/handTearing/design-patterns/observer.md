观察者模式又被称为发布-订阅(Publish/Subscribe)模式，它定义了一种一对多的依赖关系，让多个观察者对象同时监听某一个主题对象。这个主题对象在状态变化时，会通知所有的观察者对象，使他们能够自动更新自己。

在观察者模式中有如下角色：
+ Subject：抽象主题(抽象被观察者)，抽象主题角色把所有观察者对象保存在一个集合里，每个主题都可以有任意数量的观察者，抽象主题提供一个接口，可以增加和删除观察者对象
+ ConcreteSubject：具体主题(具体被观察者)，该角色将有关状态存入具体观察者对象，在具体主题的内部状态发生改变时，给所有注册过的观察者发送通知
+ Observer：抽象观察者，是观察者的抽象类，它定义了一个更新接口，使得在得到主题更改通知时更新自己
+ ConcreteObserver：具体观察者，实现抽象观察者定义的更新接口，以便在得到主题更改通知时更新自身的状态

案例：在使用微信公众号时，大家都会有这样的体验，当你关注的公众号中有新内容更新的话，它就会推送给关注公众号的微信用户端。我们使用观察者模式来模拟这样的场景，微信用户就是观察者，微信公众号是被观察者，有多个的微信用户关注了程序猿这个公众号。

```java
import java.util.ArrayList;
import java.util.List;

public class Main {
  public static void main(String[] args) {
    SubscriptionSubject mSubscriptionSubject = new SubscriptionSubject();
    // 创建微信用户
    WeixinUser user1 = new WeixinUser("孙悟空");
    WeixinUser user2 = new WeixinUser("猪悟能");
    WeixinUser user3 = new WeixinUser("沙悟净");
    // 订阅公众号
    mSubscriptionSubject.attach(user1);
    mSubscriptionSubject.attach(user2);
    mSubscriptionSubject.attach(user3);
    // 公众号更新发出消息给订阅的微信用户
    mSubscriptionSubject.notify("专栏更新了");
  }
}


// 定义抽象观察者接口，里面定义一个更新的方法
interface Observer {
  void update(String message);
}

// 定义具体观察者类，微信用户是观察者，里面实现了更新的方法
class WeixinUser implements Observer {
  // 微信用户名
  private String name;

  public WeixinUser(String name) {
    this.name = name;
  }
  @Override
  public void update(String message) {
    System.out.println(name + "-" + message);
  }
}

// 定义抽象主题接口，提供了attach、detach、notify三个方法
interface Subject {
  //增加订阅者
  void attach(Observer observer);

  //删除订阅者
  void detach(Observer observer);

  //通知订阅者更新消息
  void notify(String message);
}

// 微信公众号是具体主题（具体被观察者），里面存储了订阅该公众号的微信用户，并实现了抽象主题中的方法
class SubscriptionSubject implements Subject {
  //储存订阅公众号的微信用户
  private List<Observer> weixinUserlist = new ArrayList<>();

  @Override
  public void attach(Observer observer) {
    weixinUserlist.add(observer);
  }

  @Override
  public void detach(Observer observer) {
    weixinUserlist.remove(observer);
  }

  @Override
  public void notify(String message) {
    for (Observer observer : weixinUserlist) {
      observer.update(message);
    }
  }
}
```

优点：
+ 降低了目标与观察者之间的耦合关系，两者之间是抽象耦合关系
+ 被观察者发送通知，所有注册的观察者都会收到信息（可以实现广播机制）

缺点：
+ 如果观察者非常多的话，那么所有的观察者收到被观察者发送的通知会耗时
+ 如果被观察者有循环依赖的话，那么被观察者发送通知会使观察者循环调用，会导致系统崩溃

使用场景：
+ 对象间存在一对多关系，一个对象的状态发生改变会影响其他对象
+ 当一个抽象模型有两个方面，其中一个方面依赖于另一方面时

------
摘自：
+ [软件设计与体系结构——行为型模式](http://space.eyescode.top/blog/details/271)

站长略有修改