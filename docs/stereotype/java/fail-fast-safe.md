快速失败（fail—fast）:
+ 在用迭代器遍历一个集合对象时，如果遍历过程中对集合对象的内容进行了修改（增加、删除、修改），则会抛出`Concurrent Modification Exception`。
+ 原理：迭代器在遍历时直接访问集合中的内容，并且在遍历过程中使用一个 modCount 变量。集合在被遍历期间如果内容发生变化，就会改变 modCount 的值。每当迭代器使用`hashNext()/next()`遍历下一个元素之前，都会检测 modCount 变量是否为 expectedmodCount 值，是的话就返回遍历；否则抛出异常，终止遍历。
+ 注意：这里异常的抛出条件是检测到 `modCount!=expectedmodCount` 这个条件。如果集合发生变化时修改 modCount 值刚好又设置为了 expectedmodCount 值，则异常不会抛出。因此，不能依赖于这个异常是否抛出而进行并发操作的编程，这个异常只建议用于检测并发修改的 bug。
+ 场景：`java.util`包下的集合类都是快速失败的，不能在多线程下发生并发修改（迭代过程中被修改），比如 HashMap、ArrayList 这些集合类。

安全失败（fail—safe）:
+ 采用安全失败机制的集合容器，在遍历时不是直接在集合内容上访问的，而是先复制原有集合内容，在拷贝的集合上进行遍历。
+ 原理：由于迭代时是对原集合的拷贝进行遍历，所以在遍历过程中对原集合所作的修改并不能被迭代器检测到，所以不会触发`Concurrent Modification Exception`。
+ 缺点：基于拷贝内容的优点是避免了`Concurrent Modification Exception`，但同样地，迭代器并不能访问到修改后的内容，即：迭代器遍历的是开始遍历那一刻拿到的集合拷贝，在遍历期间原集合发生的修改迭代器是不知道的。
+ 场景：`java.util.concurrent`包下的容器都是安全失败，可以在多线程下并发使用，并发修改，比如：ConcurrentHashMap。

------
原作者：库森

原文链接：[讲一讲快速失败(fail-fast)和安全失败(fail-safe)](https://www.javalearn.cn/#/doc/Java%E9%9B%86%E5%90%88/%E9%9D%A2%E8%AF%95%E9%A2%98?id=_30-%e8%ae%b2%e4%b8%80%e8%ae%b2%e5%bf%ab%e9%80%9f%e5%a4%b1%e8%b4%a5fail-fast%e5%92%8c%e5%ae%89%e5%85%a8%e5%a4%b1%e8%b4%a5fail-safe)