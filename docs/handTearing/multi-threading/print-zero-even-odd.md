给你类 ZeroEvenOdd 的一个实例，该类中有三个函数：zero、even 和 odd 。ZeroEvenOdd 的相同实例将会传递给三个不同线程：
+ 线程 A：调用 `zero()`，只输出 0
+ 线程 B：调用 `even()`，只输出偶数
+ 线程 C：调用 `odd()`，只输出奇数

修改给出的类，以输出序列 "010203040506..." ，其中序列的长度必须为 2n。

实现 ZeroEvenOdd 类：
+ ZeroEvenOdd(int n) 用数字 n 初始化对象，表示需要输出的数
+ void zero(printNumber) 调用 printNumber 以输出一个 0
+ void even(printNumber) 调用printNumber 以输出偶数
+ void odd(printNumber) 调用 printNumber 以输出奇数


```java
class ZeroEvenOdd {
    private int n;
    
    public ZeroEvenOdd(int n) {
        this.n = n;
    }

    // printNumber.accept(x) outputs "x", where x is an integer.
    public void zero() throws InterruptedException {
        
    }

    public void even() throws InterruptedException {
        
    }

    public void odd() throws InterruptedException {
        
    }
}
```

答案：

```java
class ZeroEvenOdd {
  private int n;
  private static volatile int tSwitch = 0;

  public ZeroEvenOdd(int n) {
    this.n = n;
  }

  public void zero() {
    for (int i = 0; i < n; i++) {
      while (tSwitch != 0) {
        Thread.yield();
      }
      System.out.println(0);
      if (i % 2 == 0) {
        tSwitch = 1;
      } else {
        tSwitch = 2;
      }
    }
  }

  public void even() {
    for (int i = 1; i <= n; i += 2) {
      while (tSwitch != 1) {
        Thread.yield();
      }
      System.out.println(i);
      tSwitch = 0;
    }
  }

  public void odd() {
    for (int i = 2; i <= n; i += 2) {
      while (tSwitch != 2) {
        Thread.yield();
      }
      System.out.println(i);
      tSwitch = 0;
    }
  }
}

public class Main {
  public static void main(String[] args) {
    ZeroEvenOdd zeroEvenOdd = new ZeroEvenOdd(10);

    new Thread(zeroEvenOdd::zero).start();
    new Thread(zeroEvenOdd::even).start();
    new Thread(zeroEvenOdd::odd).start();
  }
}
```

------
[leetcode 1116](https://leetcode.cn/problems/print-zero-even-odd/)