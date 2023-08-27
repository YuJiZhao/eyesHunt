Atomic 翻译成中文是原子的意思。在化学上，我们知道原子是构成一般物质的最小单位，在化学反应中是不可分割的。在我们这里 Atomic 是指一个操作是不可中断的。即使是在多个线程一起执行的时候，一个操作一旦开始，就不会被其他线程干扰。所以，所谓原子类说简单点就是具有原子/原子操作特征的类。

根据操作的数据类型，可以将 JUC 包中的原子类分为 4 类：
+ 基本类型，使用原子的方式更新基本类型
+ 数组类型，使用原子的方式更新数组里的某个元素
+ 引用类型
+ 对象的属性修改类型

# 基本类型原子类

使用原子的方式更新基本类型：
+ AtomicInteger：整型原子类
+ AtomicLong：长整型原子类
+ AtomicBoolean：布尔型原子类

上面三个类提供的方法几乎相同，所以我们这里以 AtomicInteger 为例子来介绍。

```java
// 获取当前的值
public final int get() 

// 获取当前的值，并设置新的值
public final int getAndSet(int newValue)

// 获取当前的值，并自增
public final int getAndIncrement()

// 获取当前的值，并自减
public final int getAndDecrement() 

// 获取当前的值，并加上预期的值
public final int getAndAdd(int delta) 

// 如果输入的数值等于预期值，则以原子方式将该值设置为输入值（update）
boolean compareAndSet(int expect, int update) 

// 最终设置为newValue,使用 lazySet 设置之后可能导致其他线程在之后的一小段时间内还是可以读到旧的值
public final void lazySet(int newValue)
```

AtomicInteger 类主要利用 `CAS (compare and swap) + volatile` 和 native 方法来保证原子操作，从而避免 synchronized 的高开销，执行效率大为提升。部分源码如下：

```java
// 更新操作时提供“比较并替换”的作用
private static final Unsafe unsafe = Unsafe.getUnsafe();
private static final long valueOffset;

static {
    try {
        // objectFieldOffset 是一个本地方法，这个方法是用来拿到“原来的值”的内存地址
        valueOffset = unsafe.objectFieldOffset
            (AtomicInteger.class.getDeclaredField("value"));
    } catch (Exception ex) { throw new Error(ex); }
}

// volatile 变量，在内存中可见，因此 JVM 可以保证任何时刻任何线程总能拿到该变量的最新值。
private volatile int value;
```

# 数组类型原子类

使用原子的方式更新数组里的某个元素：
+ AtomicIntegerArray：整形数组原子类
+ AtomicLongArray：长整形数组原子类
+ AtomicReferenceArray：引用类型数组原子类

上面三个类提供的方法几乎相同，所以我们这里以 AtomicIntegerArray 为例子来介绍。AtomicIntegerArray 类常用方法：

```java
// 获取 index=i 位置元素的值
public final int get(int i)

// 返回 index=i 位置的当前的值，并将其设置为新值：newValue
public final int getAndSet(int i, int newValue)

// 获取 index=i 位置元素的值，并让该位置的元素自增
public final int getAndIncrement(int i)

// 获取 index=i 位置元素的值，并让该位置的元素自减
public final int getAndDecrement(int i)

// 获取 index=i 位置元素的值，并加上预期的值
public final int getAndAdd(int i, int delta)

// 如果输入的数值等于预期值，则以原子方式将 index=i 位置的元素值设置为输入值（update）
boolean compareAndSet(int i, int expect, int update) 

// 最终会将 index=i 位置的元素设置为newValue，使用 lazySet 设置之后可能其他线程在之后的一小段时间内还是可以读到旧的值
public final void lazySet(int i, int newValue)
```

# 引用类型原子类

基本类型原子类只能更新一个变量，如果需要原子更新多个变量，需要使用引用类型原子类：
+ AtomicReference：引用类型原子类
+ AtomicStampedReference：原子更新带有版本号的引用类型。该类将整数值与引用关联起来，可用于解决原子的更新数据和数据的版本号
+ AtomicMarkableReference：原子更新带有标记的引用类型。该类将 boolean 标记与引用关联起来，也可以解决使用 CAS 进行原子更新时可能出现的 ABA 问题

AtomicReference 类使用示例 :

```java
public class AtomicReferenceTest {
    public static void main(String[] args) {
        AtomicReference<Person> ar = new AtomicReference<>();
        Person person = new Person("SnailClimb", 22);
        ar.set(person);
        Person updatePerson = new Person("Daisy", 20);
        ar.compareAndSet(person, updatePerson);
        
        System.out.println(ar.get().getName());  // Daisy
        System.out.println(ar.get().getAge());  // 20
    }
}

@Data
class Person {
    private String name;
    private int age;

    public Person(String name, int age) {
        super();
        this.name = name;
        this.age = age;
    }
}
```

AtomicStampedReference 类使用示例 :

```java
public class AtomicStampedReferenceDemo {
    public static void main(String[] args) {
        // 实例化、取当前值和 stamp 值
        final Integer initialRef = 0, initialStamp = 0;
        final AtomicStampedReference<Integer> asr = new AtomicStampedReference<>(initialRef, initialStamp);
        // currentValue=0, currentStamp=0
        System.out.println("currentValue=" + asr.getReference() + ", currentStamp=" + asr.getStamp());

        // compare and set
        final Integer newReference = 666, newStamp = 999;
        final boolean casResult = asr.compareAndSet(initialRef, newReference, initialStamp, newStamp);
        // currentValue=666, currentStamp=999, casResult=true
        System.out.println("currentValue=" + asr.getReference()
                + ", currentStamp=" + asr.getStamp()
                + ", casResult=" + casResult);

        // 获取当前的值和当前的 stamp 值
        int[] arr = new int[1];
        final Integer currentValue = asr.get(arr);
        final int currentStamp = arr[0];
        // currentValue=666, currentStamp=999
        System.out.println("currentValue=" + currentValue + ", currentStamp=" + currentStamp);

        // 单独设置 stamp 值
        final boolean attemptStampResult = asr.attemptStamp(newReference, 88);
        // currentValue=666, currentStamp=88, attemptStampResult=true
        System.out.println("currentValue=" + asr.getReference()
                + ", currentStamp=" + asr.getStamp()
                + ", attemptStampResult=" + attemptStampResult);

        // 重新设置当前值和 stamp 值
        asr.set(initialRef, initialStamp);
        // currentValue=0, currentStamp=0
        System.out.println("currentValue=" + asr.getReference() + ", currentStamp=" + asr.getStamp());

        // [不推荐使用，除非搞清楚注释的意思了] weak compare and set
        // 困惑！weakCompareAndSet 这个方法最终还是调用 compareAndSet 方法。[版本: jdk-8u191]
        // 但是注释上写着 "May fail spuriously and does not provide ordering guarantees,
        // so is only rarely an appropriate alternative to compareAndSet."
        // todo 感觉有可能是 jvm 通过方法名在 native 方法里面做了转发
        final boolean wCasResult = asr.weakCompareAndSet(initialRef, newReference, initialStamp, newStamp);
        // currentValue=666, currentStamp=999, wCasResult=true
        System.out.println("currentValue=" + asr.getReference()
                + ", currentStamp=" + asr.getStamp()
                + ", wCasResult=" + wCasResult);
    }
}
```

AtomicMarkableReference 类使用示例:

```java
public class AtomicMarkableReferenceDemo {
    public static void main(String[] args) {
        // 实例化、取当前值和 mark 值
        final Boolean initialRef = null, initialMark = false;
        final AtomicMarkableReference<Boolean> amr = new AtomicMarkableReference<>(initialRef, initialMark);
        // currentValue=null, currentMark=false
        System.out.println("currentValue=" + amr.getReference() + ", currentMark=" + amr.isMarked());

        // compare and set
        final Boolean newReference1 = true, newMark1 = true;
        final boolean casResult = amr.compareAndSet(initialRef, newReference1, initialMark, newMark1);
        // currentValue=true, currentMark=true, casResult=true
        System.out.println("currentValue=" + amr.getReference()
                + ", currentMark=" + amr.isMarked()
                + ", casResult=" + casResult);

        // 获取当前的值和当前的 mark 值
        boolean[] arr = new boolean[1];
        final Boolean currentValue = amr.get(arr);
        final boolean currentMark = arr[0];
        // currentValue=true, currentMark=true
        System.out.println("currentValue=" + currentValue + ", currentMark=" + currentMark);

        // 单独设置 mark 值
        final boolean attemptMarkResult = amr.attemptMark(newReference1, false);
        // currentValue=true, currentMark=false, attemptMarkResult=true
        System.out.println("currentValue=" + amr.getReference()
                + ", currentMark=" + amr.isMarked()
                + ", attemptMarkResult=" + attemptMarkResult);

        // 重新设置当前值和 mark 值
        amr.set(initialRef, initialMark);
        // currentValue=null, currentMark=false
        System.out.println("currentValue=" + amr.getReference() + ", currentMark=" + amr.isMarked());

        // [不推荐使用，除非搞清楚注释的意思了] weak compare and set
        // 困惑！weakCompareAndSet 这个方法最终还是调用 compareAndSet 方法。[版本: jdk-8u191]
        // 但是注释上写着 "May fail spuriously and does not provide ordering guarantees,
        // so is only rarely an appropriate alternative to compareAndSet."
        // todo 感觉有可能是 jvm 通过方法名在 native 方法里面做了转发
        final boolean wCasResult = amr.weakCompareAndSet(initialRef, newReference1, initialMark, newMark1);
        // currentValue=true, currentMark=true, wCasResult=true
        System.out.println("currentValue=" + amr.getReference()
                + ", currentMark=" + amr.isMarked()
                + ", wCasResult=" + wCasResult);
    }
}
```

# 对象的属性修改类型原子类

如果需要原子更新某个类里的某个字段时，需要用到对象的属性修改类型原子类。
+ AtomicIntegerFieldUpdater：原子更新整形字段的更新器
+ AtomicLongFieldUpdater：原子更新长整形字段的更新器
+ AtomicReferenceFieldUpdater：原子更新引用类型里的字段的更新器

要想原子地更新对象的属性需要两步：
+ 第一步，因为对象的属性修改类型原子类都是抽象类，所以每次使用都必须使用静态方法`newUpdater()`创建一个更新器，并且需要设置想要更新的类和属性
+ 第二步，更新的对象属性必须使用 public volatile 修饰符
  
上面三个类提供的方法几乎相同，所以我们这里以 AtomicIntegerFieldUpdater为例子来介绍。AtomicIntegerFieldUpdater 类使用示例 :

```java
public class AtomicIntegerFieldUpdaterTest {
	public static void main(String[] args) {
		AtomicIntegerFieldUpdater<User> a = AtomicIntegerFieldUpdater.newUpdater(User.class, "age");

		User user = new User("Java", 22);
		System.out.println(a.getAndIncrement(user)); // 22
		System.out.println(a.get(user)); // 23
	}
}

@Data
class User {
	private String name;
	public volatile int age;

	public User(String name, int age) {
		super();
		this.name = name;
		this.age = age;
	}
}
```

------
原文作者：JavaGuide

原文链接：[Atomic 原子类总结](https://javaguide.cn/java/concurrent/atomic-classes.html)

站长略有修改
