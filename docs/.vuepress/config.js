const { defaultTheme } = require('vuepress')
const navbar = require('./config/navbar')

module.exports = {
    title: '耶瞳职库',
    description: '耶瞳职库，为了解决本人的失业问题',
    base: '/',
    markdown: {
        code: {
            lineNumbers: false
        }
    },
    theme: defaultTheme({
        navbar,
        sidebar: []
    })
}