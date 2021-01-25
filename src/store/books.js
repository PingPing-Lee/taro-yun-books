import { observable } from 'mobx'
import Taro from '@tarojs/taro'

const bookStore = observable({
    todos: ['吃饭', '睡觉', '学习taro'],
    addTodo (item) {
        this.todos.push(item)
    },
    removeTodo(i) {
        Taro.showLoading({
            title: '删除中 ...'
        })
        setTimeout(() => {
            console.log(this)
            this.todos.splice(i, 1)
            Taro.hideLoading()
        }, 1000);
    }
})

export default bookStore