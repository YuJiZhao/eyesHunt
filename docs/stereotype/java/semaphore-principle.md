建议先阅读这篇博客 [AQS问题](http://hunt.eyescode.top/stereotype/java/aqs.html) 再阅读下面内容。

synchronized 和 ReentrantLock 都是一次只允许一个线程访问某个资源，而 Semaphore（信号量）可以用来控制同时访问特定资源的线程数量。可以猜到，Semaphore 是 AQS 共享模式的一种实现，所以重写了`tryAcquireShared-tryReleaseShared`两个方法。

Semaphore 的使用简单，我们这里假设有 N（N>5） 个线程来获取 Semaphore 中的共享资源，下面的代码表示同一时刻 N 个线程中只有 5 个线程能获取到共享资源，其他线程都会阻塞，只有获取到共享资源的线程才能执行。等到有线程释放了共享资源，其他阻塞的线程才能获取到。

Semaphore 主要方法有如下三个：
+ 构造方法`Semaphore()`：用于设置最大共享资源，以及设置采用公平/非公平模式
+ 获取锁`acquire()`：此线程会一直阻塞，直到获得到锁，或者被中断（抛出InterruptedException异常）
+ 释放锁`release()`

# 构造方法

Semaphore 有两个构造方法：

```java
// 设置共享资源数，此时默认是非公平模式
public Semaphore(int permits) {
    sync = new NonfairSync(permits);
}

// 设置共享资源数，以及设置采用公平/非公平模式
public Semaphore(int permits, boolean fair) {
    sync = fair ? new FairSync(permits) : new NonfairSync(permits);
}
```

# 获取锁

**非公平锁**

```java
public void acquire() throws InterruptedException {
    sync.acquireSharedInterruptibly(1);
}

public final void acquireSharedInterruptibly(int arg)
        throws InterruptedException {
    // 如果线程被打断，则抛出异常
    if (Thread.interrupted())
        throw new InterruptedException();
    // 此处调用的是 Semaphore 重写后的 tryAcquireShared 方法
    if (tryAcquireShared(arg) < 0)
        doAcquireSharedInterruptibly(arg);
}

protected int tryAcquireShared(int acquires) {
    // 虽然非公平模式下使用的是 NonfairSync 内部类，
    // 但加锁的实现逻辑还是写在 Sync 里
    return nonfairTryAcquireShared(acquires);
}

final int nonfairTryAcquireShared(int acquires) {
    for (;;) {
        // 获取当前 state
        int available = getState();
        int remaining = available - acquires;
        // 如果资源不足，则返回负数，代表失败
        // 如果资源充足，则 CAS 获取锁
        // 这里就体现出了非公平性，如果资源充足，会自旋而非进入同步队列
        if (remaining < 0 ||
            compareAndSetState(available, remaining))
            return remaining;
    }
}
```

**公平锁**

```java
public void acquire() throws InterruptedException {
    sync.acquireSharedInterruptibly(1);
}

public final void acquireSharedInterruptibly(int arg)
        throws InterruptedException {
    // 如果线程被打断，则抛出异常
    if (Thread.interrupted())
        throw new InterruptedException();
    // 此处调用的是 Semaphore 重写后的 tryAcquireShared 方法
    if (tryAcquireShared(arg) < 0)
        doAcquireSharedInterruptibly(arg);
}

protected int tryAcquireShared(int acquires) {
    for (;;) {
        // 如果同步队列存在线程，则直接返回获取失败，
        // 进入同步队列等待
        // 这里就体现出了公平性，如果队列存在，就直接去排队，不能参与抢锁
        if (hasQueuedPredecessors())
            return -1;
        // 如果同步队列不存在线程，则 CAS 的方式争抢锁
        int available = getState();
        int remaining = available - acquires;
        if (remaining < 0 ||
            compareAndSetState(available, remaining))
            return remaining;
    }
}
```

# 释放锁

Semaphore 公平与非公平主要体现在加锁上，他们的解锁逻辑其实是一样的。

```java
public void release() {
    sync.releaseShared(1);
}

public final boolean releaseShared(int arg) {
    // 此处调用的是 Semaphore 重写之后的 tryReleaseShared 方法
    if (tryReleaseShared(arg)) {
        doReleaseShared();
        return true;
    }
    return false;
}

protected final boolean tryReleaseShared(int releases) {
    for (;;) {
        int current = getState();
        int next = current + releases;
        if (next < current) // overflow
            throw new Error("Maximum permit count exceeded");
        // CAS 的方式更新 state 的值
        if (compareAndSetState(current, next))
            return true;
    }
}
```