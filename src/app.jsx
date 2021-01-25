import React, { Component } from 'react'
import Taro from '@tarojs/taro'

import { Provider } from 'mobx-react'

import counterStore from './store/counter'
import bookStore from './store/books'

import 'taro-ui/dist/style/index.scss' // 全局引入一次即可
import './app.scss'


const store = {
  counterStore,
  bookStore
}
if(process.env.TARO_ENV == 'weapp'){
    Taro.cloud.init({
        // 此处请填入环境 ID, 环境 ID 可打开云控制台查看
      env: 'yunbooks-1glzqsy3199bcf62',
      traceUser: true,
    })
}
class App extends Component {
  componentDidMount () {}

  componentDidShow () {}

  componentDidHide () {}

  componentDidCatchError () {}

  // this.props.children 就是要渲染的页面
  render () {
    return (
      <Provider store={store}>
        {this.props.children}
      </Provider>
    )
  }
}

export default App
