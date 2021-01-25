export default {
    pages: [
        'pages/index/index',

        'pages/me/index',

        'pages/detail/index',
    ],
    window: {
        backgroundTextStyle: 'light',
        navigationBarBackgroundColor: '#fff',
        navigationBarTitleText: 'WeChat',
        navigationBarTextStyle: 'black'
    },
    tabBar: {
        "selectedColor": "#6190E8",
        list: [
        {
            pagePath: "pages/index/index",
            text: "首页",
            iconPath: "images/img/book.png",
            selectedIconPath: "images/img/book-active.png"
        },
        {
            pagePath: "pages/me/index",
            text: "我的",
            iconPath: "images/img/me.png",
            selectedIconPath: "images/img/me-active.png"
        }
        ]
    }
}
