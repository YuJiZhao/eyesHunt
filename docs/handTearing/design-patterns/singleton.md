单例模式有八种：
+ 饿汉式
  + 静态常量
  + 静态代码块
+ 懒汉式
  + 线程不安全
  + 线程安全，同步方法
  + 线程安全，同步代码块
+ 双重检查
+ 静态内部类
+ 枚举

# 饿汉式-静态常量

优点：这种写法比较简单，就是在类装载的时候就完成实例化。避免了线程同步问题。

缺点：在类装载的时候就完成实例化，没有达到`Lazy Loading`的效果。如果从始至终从未使用过这个实例，则会造成内存的浪费

这种方式基于 classloder 机制避免了多线程的同步问题，不过，instance 在类装载时就实例化，在单例模式中大多数都是调用 getInstance 方法，但是导致类装载的原因有很多种，因此不能确定有其他的方式（或者其他的静态方法）导致类装载，这时候初始化 instance 就没有达到`lazy loading`的效果

结论：这种单例模式可用，可能造成内存浪费

```java
class SingletonTest1 {
    // 构造器私有化，不能从外部通过new创建对象
    private SingletonTest1() { }

    // 本类内部创建对象实例
    private final static SingletonTest1 instance = new SingletonTest1();

    // 提供一个公有的静态方法，返回实例对象
    public static SingletonTest1 getInstance() {
        return instance;
    }
}
```

# 饿汉式-静态代码块

优缺点说明：这种方式和静态常量方式类似，只不过将类实例化过程放在了静态代码快中，也是在类装载的时候，就执行静态代码块中的代码，初始化类的实例。优缺点和静态常量方式一样

结论：这种单例模式可用，可能造成内存浪费

```java
class SingletonTest2 {
    private static SingletonTest2 instance;

    static {
        instance = new SingletonTest2();
    }

    private SingletonTest2() {}

    public static SingletonTest2 getInstance() {
        return instance;
    }
}
```

# 懒汉式-线程不安全

优缺点说明：
+ 起到了`Lazy Loading`的效果，即使用时才完成实例化。但只能在单线程下使用
+ 如果在多线程下，一个线程进入了`if(singleton == null)`判断语句块，还未来得及往下执行，另一个线程也通过了这个判断语句，这时便会产生多个实例。所以在多线程环境下不可以使用这种方式

结论：在实际开发中不要使用这种方式

```java
class SingletonTest3 {
    private static SingletonTest3 singleton;

    private SingletonTest3() {}

    public static SingletonTest3 getInstance() {
        if (singleton == null) {
            singleton = new SingletonTest3();
        }
        return singleton;
    }
}
```

# 懒汉式-同步方法

优缺点：
+ 解决了线程不安全问题
+ 效率太低了，每个线程在想获得类的实例时候，执行`getInstance()`方法都要进行同步。而其实这个方法只执行一次实例化代码就够了，后面的想获得该类实例，直接return就行了。方法进行同步效率太低

结论：在实际开发中，不推荐使用这种方式

```java
class SingletonTest4 {
    private static SingletonTest4 singleton;

    private SingletonTest4() {}

    // 加入同步代码，解决线程不安全问题
    public static synchronized SingletonTest4 getInstance() {
        if (singleton == null) {
            singleton = new SingletonTest4();
        }
        return singleton;
    }
}
```

# 懒汉式-同步代码块

这种方式本意是想对第四种实现方式的改进，因为前面同步方法效率太低，改为同步产生实例化的的代码块。但是这种同步并不能起到线程同步的作用。跟第3种实现方式遇到的情形一致，假如一个线程进入了`if (singleton == null)`判断语句块，还未来得及往下执行，另一个线程也通过了这个判断语句，这时便会产生多个实例

结论:在实际开发中，不能使用这种方式


```java
class SingletonTest5 {
    private static SingletonTest5 singleton;

    private SingletonTest5() {}

    public static SingletonTest5 getInstance() {
        if (singleton == null) {
            synchronized(SingletonTest5.class) {
                singleton = new SingletonTest5();
            }
        }
        return singleton;
    }
}
```

# 双重检查

双重检查的概念在多线程开发中常常使用，如代码中所示，我们进行了两次`if (singleton == null)`检查，这样就可以保证线程安全了。并且实例化代码只用执行一次，后面再次访问时，判断`if (singleton == null)`直接return实例化对象，也避免反复进行方法同步

结论：线程安全，延迟加载，效率较高。在实际开发中推荐使用这种单例设计模式

```java
class SingletonTest6 {
    private static volatile SingletonTest6 singleton;

    private SingletonTest6() {}

    public static SingletonTest6 getInstance() {
        if (singleton == null) {
            synchronized(SingletonTest6.class) {
                if (singleton == null) {
                    singleton = new SingletonTest6();
                }
            }
        }
        return singleton;
    }
}
```

# 静态内部类

这种方式采用了类装载的机制来保证初始化实例时只有一个线程。静态内部类方式在Singleton类被装载时并不会立即实例化，而是在需要实例化时，调用getlnstance方法，才会装载SingletonInstance类，从而完成singleton的实例化。

类的静态属性只会在第一次加载类的时候初始化，所以在这里，JVM帮助我们保证了线程的安全性，在类进行初始化时，别的线程是无法进入的。


结论：避免了线程不安全，利用静态内部类特点实现延迟加载，效率高，推荐使用。


```java
class SingletonTest7 {
    private SingletonTest7() {}
    
    private static class SingletonInstance {
        private static final SingletonTest7 INSTANCE = new SingletonTest7();
    }

    public static SingletonTest7 getInstance() {
        return SingletonInstance.INSTANCE;
    }
}
```

# 枚举

这借助JDK1.5中添加的枚举来实现单例模式。不仅能避免多线程同步问题，而且还能防止反序列化重新创建新的对象。这种方式也是Effective Java作者Josh Bloch提倡的方式

结论：推荐使用

```java
public class Singleton8 {
    public static void main(String[] args) {
        SingletonTest8 instance1 = SingletonTest8.INSTANCE;
        SingletonTest8 instance2 = SingletonTest8.INSTANCE;

        System.out.println(instance1.hashCode());
        System.out.println(instance2.hashCode());
    }
}

enum SingletonTest8 {
    INSTANCE;

    public void sayOK() {
        System.out.println("ok");
    }
}
```

------
摘自：
+ [软件设计与体系——创建型模式](http://space.eyescode.top/blog/details/204)

站长略有修改