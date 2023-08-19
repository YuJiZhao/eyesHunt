const head = require('./config/head')
const navbar = require('./config/navbar')

module.exports = {
    title: '耶瞳职库',
    description: '耶瞳职库，再不学就要失业了',
    base: '/',
    port: 9600,
    head,
    plugins: [],
    themeConfig: {
        nav: navbar,
        sidebar: {},
        sidebarDepth: 2,
        lastUpdated: 'Last Updated'
    }
}
