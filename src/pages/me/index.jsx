import React, { Component } from 'react'

import Taro from '@tarojs/taro'
import { View, Button, Text } from '@tarojs/components'
import { observer, inject } from 'mobx-react'
import { AtButton } from 'taro-ui'
import './index.scss'

const db = Taro.cloud.database()

@inject('store')
@observer
class Me extends Component {
    state = {
        userInfo: Taro.getStorageSync('userInfo') || {},
        getUserInfoLoading: false
    }
    // 请登录
    onGetUserInfo = ({detail}) => {
        const { getUserInfoLoading } = this.state 
        if(!getUserInfoLoading){
            this.setState({
                getUserInfoLoading: true
            })
            let { userInfo } = detail
            // 需要调用云函数，获取用户的openid
            Taro.cloud.callFunction({
                name: 'login',
                complete: res => {
                    userInfo.openid = res.result.openid
                    this.setState({
                        userInfo,
                        getUserInfoLoading: false
                    })

                    // 写入本地缓存
                    Taro.setStorageSync('userInfo', userInfo)
                }
            })
        }else{
            Taro.showToast({
                title: '请稍等...'
            })
        }
        
    }
    // 扫码添加
    scanCode = (e) => {
        Taro.scanCode({
            success:res=>{
                Taro.showLoading({
                    title: '添加中...',
                })
                // 图书的isbn号，去豆瓣获取详情
                this.addBook(res.result)
            },
            fail: (err) => {
                Taro.showToast({
                    icon: 'none',
                    title: '扫描失败！',
                })
            }
        })
    }
    // 调用云函数，添加图书
    addBook(isbn){
        Taro.cloud.callFunction({
            name: 'getBookInfo',
            data: { isbn },
            complete: ({result}) => {
                result.isbn = isbn
                result.userInfo = this.state.userInfo

                let isHave
                db.collection('books').where({ isbn }).get().then(res => {
                    console.log('isHave', res)
                    if(res.data.length > 0){
                        Taro.showToast({
                            icon: 'none',
                            title: '本书已存在',
                        })
                    }else{
                        db.collection('books').add({
                            data: result,
                        }).then(res => {
                            Taro.hideLoading()
                            if(res._id){
                                Taro.showModal({
                                  title:"添加成功",
                                  content:`《${result.title}》添加成功`
                                })
                            }
                        }).catch(err => {
                            Taro.hideLoading()
                        })
                    }
                })
                
            }
        })
    }
    render () {
        const { userInfo, getUserInfoLoading } = this.state 
        return (
            <View class="user-container container">
                {
                    userInfo.openid ? <View>
                        <image class='avatar' src={userInfo.avatarUrl} ></image>
                        <view>欢迎您，{userInfo.nickName}</view>
                        <view class="footer"> 
                            <AtButton type='primary' onClick={this.scanCode}>添加图书</AtButton>
                            <AtButton openType="contact" type="secondary">客服</AtButton>
                        </view>
                    </View> : <View>
                        <image class='avatar' src={require('../../images/img/unlogin.png')} ></image>
                        <view class="footer"> 
                            <AtButton type='primary' loading={getUserInfoLoading}  size="small" onGetUserInfo={this.onGetUserInfo} openType="getUserInfo">请登录</AtButton>
                            <AtButton openType="contact" type="secondary" className="mar-top">客服</AtButton>
                        </view>
                    </View>
                }
            </View>
        )
    }
}

export default Me
