Knuth-Morris-Pratt 算法，简称 KMP 算法，由 Donald Knuth、James H. Morris 和 Vaughan Pratt 三人于 1977 年联合发表。

Knuth-Morris-Pratt 算法的核心为前缀函数，记作 `π(i)`，其定义如下：对于长度为 m 的字符串 s，其前缀函数 `π(i)(0≤i<m)` 表示 s 的子串 `s[0:i]` 的最长的相等的真前缀与真后缀的长度。特别地，如果不存在符合条件的前后缀，那么 `π(i)=0`。其中真前缀与真后缀的定义为不等于自身的的前缀与后缀。

我们举个例子说明：字符串 aabaaab 的前缀函数值依次为 0,1,0,1,2,2,3
+ `π(0)=0`，因为 a 没有真前缀和真后缀，根据规定为 0（可以发现对于任意字符串 `π(0)=0` 必定成立）
+ `π(1)=1`，因为 aa 最长的一对相等的真前后缀为 a，长度为 1
+ `π(2)=0`，因为 aab 没有对应真前缀和真后缀，根据规定为 0
+ `π(3)=1`，因为 aaba 最长的一对相等的真前后缀为 a，长度为 1
+ `π(4)=2`，因为 aabaa 最长的一对相等的真前后缀为 aa，长度为 2
+ `π(5)=2`，因为 aabaaa 最长的一对相等的真前后缀为 aa，长度为 2
+ `π(6)=3`，因为 aabaaab 最长的一对相等的真前后缀为 aab，长度为 3

有了前缀函数，我们就可以快速地计算出模式串在主串中的每一次出现。

```java
class Solution {
    public int strStr(String haystack, String needle) {
        int n = haystack.length(), m = needle.length();
        if (m == 0) {
            return 0;
        }
        int[] pi = new int[m];
        for (int i = 1, j = 0; i < m; i++) {
            while (j > 0 && needle.charAt(i) != needle.charAt(j)) {
                j = pi[j - 1];
            }
            if (needle.charAt(i) == needle.charAt(j)) {
                j++;
            }
            pi[i] = j;
        }
        for (int i = 0, j = 0; i < n; i++) {
            while (j > 0 && haystack.charAt(i) != needle.charAt(j)) {
                j = pi[j - 1];
            }
            if (haystack.charAt(i) == needle.charAt(j)) {
                j++;
            }
            if (j == m) {
                return i - m + 1;
            }
        }
        return -1;
    }
}
```

------
摘自：
+ [力扣官方题解](https://leetcode.cn/problems/find-the-index-of-the-first-occurrence-in-a-string/solutions/732236/shi-xian-strstr-by-leetcode-solution-ds6y/)

站长略有修改

------
推荐资源：
+ [最浅显易懂的 KMP 算法讲解](https://www.bilibili.com/video/BV1AY4y157yL)