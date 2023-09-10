用三个线程依次打印 A、B、C

```java
import java.util.concurrent.CountDownLatch;

public class Main {
  public static void main(String[] args) {
    CountDownLatch second = new CountDownLatch(1);
    CountDownLatch third = new CountDownLatch(1);

    new Thread(() -> {
      System.out.println("A");
      second.countDown();
    }).start();

    new Thread(() -> {
      try {
        second.await();
      } catch (InterruptedException e) {
        e.printStackTrace();
      }
      System.out.println("B");
      third.countDown();
    }).start();

    new Thread(() -> {
      try {
        third.await();
      } catch (InterruptedException e) {
        e.printStackTrace();
      }
      System.out.println("C");
    }).start();
  }
}
```

------
[leetcode 1114](https://leetcode.cn/problems/print-in-order/)