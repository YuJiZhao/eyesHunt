建议先阅读这篇博客 [AQS问题](http://hunt.eyescode.top/stereotype/java/aqs.html) 再阅读下面内容。

CyclicBarrier 的字面意思是可循环使用（Cyclic）的屏障（Barrier）。它要做的事情是：让一组线程到达一个屏障（也可以叫同步点）时被阻塞，直到最后一个线程到达屏障时，屏障才会开门，所有被屏障拦截的线程才会继续干活。

从描述上看，CyclicBarrier 和 CountDownLatch 非常类似，它也可以实现线程间的技术等待，但是它们还是有很多不同点的：
+ CountDownLatch 的实现是基于 AQS 的，而 CycliBarrier 是基于 ReentrantLock（当然 ReentrantLock 也属于 AQS 同步器）和 Condition 的
+ CountDownLatch 的计数器只能使用一次，而 CyclicBarrier 的计数器可以使用`reset()`方法重置，可以使用多次，所以 CyclicBarrier 能够处理更为复杂的场景
+ CyclicBarrier 还提供了一些其他有用的方法，比如`getNumberWaiting()`方法可以获得 CyclicBarrier 阻塞的线程数量，`isBroken()`方法用来了解阻塞的线程是否被中断
+ CountDownLatch 允许一个或多个线程等待一组事件的产生，而 CyclicBarrier 用于等待其他线程运行到栅栏位置

具体来说，CyclicBarrier 可以使一定数量的线程反复地在栅栏位置处汇集。当线程到达栅栏位置时将调用 await 方法，这个方法将阻塞直到所有线程都到达栅栏位置。如果所有线程都到达栅栏位置，那么栅栏将打开，此时所有的线程都将被释放，而栅栏将被重置以便下次使用。

可以举个例子：
+ 长途汽车站提供长途客运服务
+ 当等待坐车的乘客到达 20 人时，汽车站就会发出一辆长途汽车，让这 20 个乘客上车走人
+ 等到下次等待的乘客又到达 20 人时，汽车站就会又发出一辆长途汽车

接下来介绍 CyclicBarrier 核心的两个方法：
+ `CyclicBarrier`：构造方法，主要用于设置参与线程数
+ `await`：表示当前线程已执行到达栅栏，开始阻塞，直到所有线程都到

# 构造方法

```java
// parties 是参与线程的个数，每个线程使用 await() 方法告诉 CyclicBarrier 我已经到达了屏障，然后当前线程被阻塞
public CyclicBarrier(int parties) {
    this(parties, null);
}

// barrierAction 这个参数的意思是，线程到达屏障时，优先执行 barrierAction，方便处理更复杂的业务场景。
public CyclicBarrier(int parties, Runnable barrierAction) {
    if (parties <= 0) throw new IllegalArgumentException();
    this.parties = parties;
    this.count = parties;
    this.barrierCommand = barrierAction;
}
```

# await方法

```java
// 非定时等待
public int await() throws InterruptedException, BrokenBarrierException {
  try {
    return dowait(false, 0L);
  } catch (TimeoutException toe) {
    throw new Error(toe);
  }
}
 
// 定时等待
public int await(long timeout, TimeUnit unit) throws InterruptedException, BrokenBarrierException, TimeoutException {
  return dowait(true, unit.toNanos(timeout));
}
```

我们可以看到，核心方法是 dowait:

```java
private int dowait(boolean timed, long nanos) throws InterruptedException, BrokenBarrierException, TimeoutException {
  final ReentrantLock lock = this.lock;
  lock.lock();
  try {
    final Generation g = generation;
    // 检查当前栅栏是否被打翻
    if (g.broken) {
      throw new BrokenBarrierException();
    }
    // 检查当前线程是否被中断
    if (Thread.interrupted()) {
      // 如果当前线程被中断会做以下三件事
      // 1. 打翻当前栅栏
      // 2. 唤醒拦截的所有线程
      // 3. 抛出中断异常
      breakBarrier();
      throw new InterruptedException();
    }
    // 每次都将计数器的值减 1
    int index = --count;
    // 计数器的值减为 0 则需唤醒所有线程并转换到下一代
    if (index == 0) {
      boolean ranAction = false;
      try {
        // 唤醒所有线程前先执行指定的任务
        final Runnable command = barrierCommand;
        if (command != null) {
          command.run();
        }
        ranAction = true;
        // 唤醒所有线程并转到下一代
        nextGeneration();
        return 0;
      } finally {
        // 确保在任务未成功执行时能将所有线程唤醒
        if (!ranAction) {
          breakBarrier();
        }
      }
    }
 
    // 如果计数器不为0则执行此循环
    for (;;) {
      try {
        // 根据传入的参数来决定是定时等待还是非定时等待
        if (!timed) {
          trip.await();
        }else if (nanos > 0L) {
          nanos = trip.awaitNanos(nanos);
        }
      } catch (InterruptedException ie) {
        // 若当前线程在等待期间被中断则打翻栅栏唤醒其他线程
        if (g == generation && ! g.broken) {
          breakBarrier();
          throw ie;
        } else {
          // 若在捕获中断异常前已经完成在栅栏上的等待, 则直接调用中断操作
          Thread.currentThread().interrupt();
        }
      }
      // 如果线程因为打翻栅栏操作而被唤醒则抛出异常
      if (g.broken) {
        throw new BrokenBarrierException();
      }
      // 如果线程因为换代操作而被唤醒则返回计数器的值
      if (g != generation) {
        return index;
      }
      // 如果线程因为时间到了而被唤醒则打翻栅栏并抛出异常
      if (timed && nanos <= 0L) {
        breakBarrier();
        throw new TimeoutException();
      }
    }
  } finally {
    lock.unlock();
  }
}
```

以下是个五点餐的例子，需要人到齐了才能点菜:

```java
public class CyclicBarrierTest {

    public static void main(String[] args) {
        ExecutorService service = Executors.newCachedThreadPool();
        CyclicBarrier barrier = new CyclicBarrier(5, new Runnable() {
            @Override
            public void run() {
                System.out.println("全部到达"+Thread.currentThread().getName()+"呼叫服务员开始点餐！");
                service.shutdown();

            }
        });
        for (int j = 0; j < 5; j++) {
            service.execute(new Runnable() {
                @Override
                public void run() {
                    try {
                        Thread.sleep(1000);
                        System.out.println(Thread.currentThread().getName() + "同学到达");
                        barrier.await();
                        System.out.println(Thread.currentThread().getName()+"同学点餐");
                    } catch (InterruptedException e) {
                        e.printStackTrace();
                    } catch (BrokenBarrierException e) {
                        e.printStackTrace();
                    }
                }

            });
        }
        service.shutdown();
    }
}
```

------
摘自：
+ [CyclicBarrier 的原理是什么？](https://javaguide.cn/java/concurrent/java-concurrent-questions-03.html#cyclicbarrier-%E7%9A%84%E5%8E%9F%E7%90%86%E6%98%AF%E4%BB%80%E4%B9%88)
+ [Java多线程实战｜CyclicBarrier原理介绍及使用场景](https://juejin.cn/post/6977549754217529358)
+ [Java并发32:CyclicBarrier的基本方法和应用场景实例](https://blog.csdn.net/hanchao5272/article/details/79779639)

站长略有修改