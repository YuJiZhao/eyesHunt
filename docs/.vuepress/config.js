const head = require('./config/head')
const nav = require('./config/navbar')
const sidebar = require('./config/sidebar')
const plugins = require('./config/plugins')

module.exports = {
    title: '耶瞳职库',
    description: '耶瞳职库，再不学就要失业了',
    base: '/',
    port: 9600,
    head,
    plugins,
    themeConfig: {
        nav,
        sidebar,
        search: false,
        lastUpdated: 'Last Updated'
    }
}
