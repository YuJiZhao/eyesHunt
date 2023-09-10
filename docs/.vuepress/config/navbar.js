module.exports = [
    { text: '主页', link: '/' },
    { text: '简历', link: '/vitae/' },
    { 
        text: '八股', 
        items: [
            { text: 'Java', link: '/stereotype/java/' },
            { text: 'Spring', link: '/stereotype/spring/' },
            { text: 'MySQL', link: '/stereotype/mysql/' },
            { text: 'Redis', link: '/stereotype/redis/' },
            { text: '消息队列', link: '/stereotype/mq/' },
            { text: '操作系统', link: '/stereotype/operating-system/' },
            { text: '计算机网络', link: '/stereotype/network/' },
            { text: 'Linux', link: '/stereotype/linux/' },
            { text: '其他', link: '/stereotype/other/' },
        ]
    },
    { 
        text: '手撕', 
        items: [
            { text: '面试算法', link: '/handTearing/algorithm-interview/' },
            { text: '笔试算法', link: '/handTearing/algorithm-written-test/' },
            { text: '智力题', link: '/handTearing/brain-teaser/' },
            { text: '多线程', link: '/handTearing/multi-threading/' },
            { text: '设计模式', link: '/handTearing/design-patterns/' },
        ]
    },
    { text: '系统设计', link: '/design/' },
    { text: '项目', link: '/project/' },
    { text: '工作', link: '/work/' },
    { 
        text: '面经',
        items: [
            { text: '阿里巴巴', link: '/interview/alibaba/' },
            { text: '腾讯', link: '/interview/tencent/' },
            { text: '字节跳动', link: '/interview/bytedance/' },
            { text: '百度', link: '/interview/baidu/' },
            { text: '美团', link: '/interview/meituan/' },
            { text: '快手', link: '/interview/kuaishou/' },
            { text: '华为', link: '/interview/huawei/' },
            { text: '其他', link: '/interview/other/' },
        ]
    },
    { text: '杂言', link: '/miscellany/' },
    { text: 'Github', link: 'https://github.com/YuJiZhao/eyesHunt' },
    {
        text: '其他',
        items: [
            { text: '耶瞳空间', link: 'http://space.eyescode.top' },
            { text: '耶瞳星空', link: 'http://stars.eyescode.top' },
        ]
    }
]