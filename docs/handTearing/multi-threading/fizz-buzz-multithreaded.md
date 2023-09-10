编写一个可以从 1 到 n 输出代表这个数字的字符串的程序，但是：
+ 如果这个数字可以被 3 整除，输出 "a"
+ 如果这个数字可以被 5 整除，输出 "b"
+ 如果这个数字可以同时被 3 和 5 整除，输出 "AB"

```java
public class Main {
  private static int n = 17;
  private static volatile int state = 0;

  public static void main(String[] args) {
    new Thread(() -> {
      // 只输出 3 的倍数
      for (int i = 3; i <= n; i += 3) {
        // 15 的倍数不处理
        if (i % 15 == 0) {
          continue;
        }
        while (state != 3) {
          Thread.yield();
        }

        System.out.println("a");
        state = 0;
      }
    }).start();

    new Thread(() -> {
      // 只输出 5 的倍数
      for (int i = 5; i <= n; i += 5) {
        // 15 的倍数不处理
        if (i % 15 == 0) {
          continue;
        }
        while (state != 5) {
          Thread.yield();
        }

        System.out.println("b");
        state = 0;
      }
    }).start();

    new Thread(() -> {
      // 只输出15的倍数
      for (int i = 15; i <= n; i += 15) {
        while (state != 15) {
          Thread.yield();
        }
        System.out.println("AB");
        state = 0;
      }
    }).start();

    new Thread(() -> {
      for (int i = 1; i <= n; i++) {
        while (state != 0) {
          Thread.yield();
        }
        if (i % 3 != 0 && i % 5 != 0) {
          System.out.println(i);
        } else {
          if (i % 15 == 0)
            state = 15;
          else if (i % 5 == 0)
            state = 5;
          else
            state = 3;
        }
      }
    }).start();
  }
}
```

------
[leetcode 1195](https://leetcode.cn/problems/fizz-buzz-multithreaded/)