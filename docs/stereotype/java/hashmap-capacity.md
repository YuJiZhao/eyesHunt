# HashMap容量为什么必须是2的n次方

当向 HashMap 中添加一个元素的时候，需要根据 key 的 hash 值，去确定其在数组中的具体位置。HashMap 为了存取高效，减少碰撞，就是要尽量把数据分配均匀，每个链表长度大致相同，这个实现的关键就在把数据存到哪个链表中的算法。

这个算法实际就是取模，`hash % length`，计算机中直接求余效率不如位移运算。所以源码中做了优化，使用 `hash & (length - 1)`，而实际上 `hash % length` 等于 `hash & ( length - 1)` 的前提是 length 是 2 的 n 次方。

同时这样也能使元素均匀分布减少碰撞。2 的 n 次方实际就是 1 后面 n 个 0，2 的 `n 次方 - 1` 实际就是 n 个 1。如果不是这样，那可能数组的一些位置永远不会插入数据，浪费数组的空间，加大 hash 冲突。

总结：
+ 求余运算性能不如与运算，容量是2的n次方时可将取余运算转为与运算
+ 使数据均匀分布，减少hash冲突

# 如果输入值不是2的n次方会怎样

如果创建 HashMap 对象时，输入的数组长度是 10，不是 2 的幂，HashMap 通过一通位移运算和或运算得到的肯定是 2 的幂次数，并且是离那个数最近的数字。

hashmap利用构造函数自定义初始容量：

```java
    /**
     * Constructs an empty <tt>HashMap</tt> with the specified initial
     * capacity and load factor.
     *
     * @param  initialCapacity the initial capacity
     * @param  loadFactor      the load factor
     * @throws IllegalArgumentException if the initial capacity is negative
     *         or the load factor is nonpositive
     */
    public HashMap(int initialCapacity, float loadFactor) {
        if (initialCapacity < 0)
            throw new IllegalArgumentException("Illegal initial capacity: " +
                                               initialCapacity);
        if (initialCapacity > MAXIMUM_CAPACITY)
            initialCapacity = MAXIMUM_CAPACITY;
        if (loadFactor <= 0 || Float.isNaN(loadFactor))
            throw new IllegalArgumentException("Illegal load factor: " +
                                               loadFactor);
        this.loadFactor = loadFactor;
        this.threshold = tableSizeFor(initialCapacity);
    }
```

转化为 2 的幂的函数：

```java
    /**
     * Returns a power of two size for the given target capacity.
     */
    static final int tableSizeFor(int cap) {
        int n = cap - 1;
        n |= n >>> 1;
        n |= n >>> 2;
        n |= n >>> 4;
        n |= n >>> 8;
        n |= n >>> 16;
        return (n < 0) ? 1 : (n >= MAXIMUM_CAPACITY) ? MAXIMUM_CAPACITY : n + 1;
    }
```

------
参考文章：
+ [HashMap源码分析及常见面试题](http://space.eyescode.top/blog/details/143)