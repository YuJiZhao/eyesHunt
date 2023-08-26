建议先阅读这篇博客 [AQS问题](http://hunt.eyescode.top/stereotype/java/aqs.html) 再阅读下面内容。

CountDownLatch 是 AQS 共享模式的一种实现，其工作流程如下：
+ 默认构造 AQS 的 state 值为 count
+ 当线程使用`countDown`方法时，其实调用了`tryReleaseShared`方法以 CAS 的操作来减少 state，直至 state 为 0
+ 当调用`await`方法的时候，如果 state 不为 0，那就证明任务还没有执行完毕，`await`方法就会一直阻塞，也就是说该方法之后的语句不会被执行。直到count 个线程都调用了`countDown`使 state 值被减为 0，或者调用`await`的线程被中断，该线程才会从阻塞中被唤醒，之后的语句得到执行

接下来通过阅读源码来深入了解。

# 构造方法

首先是构造方法，创建一个值为 count 的计数器

```java
public CountDownLatch(int count) {
    if (count < 0) throw new IllegalArgumentException("count < 0");
    this.sync = new Sync(count);
}

Sync(int count) {
    setState(count);
}

protected final void setState(int newState) {
    state = newState;
}
```

# countDown 方法

接下来是`countDown`方法，该方法会对计数器进行减 1 操作，当计数器递减至 0 时，当前线程会去唤醒阻塞队列里的所有线程：

```java
public void countDown() {
    sync.releaseShared(1);
}

public final boolean releaseShared(int arg) {
    // 调用的是 CountDownLatch 重写的 tryReleaseShared 方法
    if (tryReleaseShared(arg)) {
        doReleaseShared();
        return true;
    }
    return false;
}

protected boolean tryReleaseShared(int releases) {
    for (;;) {
        int c = getState();
        if (c == 0)
            return false;
        int nextc = c-1;
        // 通过 CAS 的方式更新 state 的值
        if (compareAndSetState(c, nextc))
            // 如果更新后 state 为 0，则会去唤醒阻塞队列里的线程，否则不唤醒
            return nextc == 0;
    }
}
```

# await 方法

最后是`await`方法，该方法会阻塞当前线程，将当前线程加入阻塞队列，直到 state = 0：

```java
public void await() throws InterruptedException {
    sync.acquireSharedInterruptibly(1);
}

public final void acquireSharedInterruptibly(int arg)
        throws InterruptedException {
    // 如果当前线程已经中断了，那么抛出异常
    if (Thread.interrupted())
        throw new InterruptedException();
    // 此处调用的是 CountDownLatch 重写的 tryAcquireShared 方法
    if (tryAcquireShared(arg) < 0)
        // 这个方法和 acquireQueued 方法没什么区别，就是线程在等待状态的过程中，
        // 如果线程被中断，线程会抛出异常
        doAcquireSharedInterruptibly(arg);
}

protected int tryAcquireShared(int acquires) {
    return (getState() == 0) ? 1 : -1;
}
```
