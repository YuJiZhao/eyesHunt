两个线程交替打印 A 和 B

```java
public class Main {
  private static volatile boolean finish = true;

  public static void main(String[] args) {
    // 打印 n 轮
    int n = 5;

    new Thread(() -> {
      for (int i = 0; i < n; i++) {
        while (!finish) {
          Thread.yield();
        }
        System.out.println("A");
        finish = false;
      }
    }).start();

    new Thread(() -> {
      for (int i = 0; i < n; i++) {
        while (finish) {
          Thread.yield();
        }
        System.out.println("B");
        finish = true;
      }
    }).start();
  }
}
```

------
[leetcode 1115](https://leetcode.cn/problems/print-foobar-alternately/)