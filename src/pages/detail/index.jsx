import React, { Component  } from 'react'

import Taro from '@tarojs/taro'
import { View, Image, Text } from '@tarojs/components'
import { observer, inject } from 'mobx-react'
import { AtAccordion, AtIcon, AtRate, AtCard, AtTextarea, AtButton } from 'taro-ui'
import dayjs from 'dayjs'

import './index.scss'

let db = wx.cloud.database()

@inject('store')
@observer
class Detail extends Component {
    
    state = {
        userInfo: Taro.getStorageSync('userInfo') || {},
        _id: '',
        bookInfo: {},
        activeNames: '',
        comment: '',
        submitLoading: false
    }
    // 获取图书详情
    getBookInfo(){
        Taro.showLoading({
            title: '加载中...',
        })
        const { id } = Taro.Current.router.params
        db.collection('books').doc(id).get().then(res => {
            console.log('getBookInfo', res.data)
            this.setState({ bookInfo: res.data }, () => {
                Taro.setNavigationBarTitle({
                    title:res.data.title
                })
                Taro.hideLoading()
            })
        })
    }
    componentDidMount(){
        // 图书的唯一标识
        const { id } = Taro.Current.router.params
        // 1. 图书的count +1 
        db.collection('books').doc(id).update({
            data:{
                count: db.command.inc(1)
            }
        })
        this.getBookInfo()
    }
    // 展开简介
    onChange(value) {
        const { activeNames } = this.state
        this.setState({
          activeNames: !activeNames
        });
    }
    // 输入评论
    handleChange= value =>{
        this.setState({
            comment: value
        })
    }
    // 评价图书
    comment = ()=>{
        const { userInfo, comment, submitLoading } = this.state 
        if(!comment){
            Taro.showToast({
                icon: 'none',
                title: '请输入有效评价'
            })
            return false;
        }
        if(!submitLoading){
            this.setState({
                submitLoading: true
            })
            const _ = db.command
            const { id } = Taro.Current.router.params
            const currComments = {
                author: userInfo.nickName,
                avatarUrl: userInfo.avatarUrl,
                content: comment,
                date: dayjs().format('YYYY-MM-DD HH:mm:ss')
            }
            db.collection('books').doc(id).update({
                data:{
                    comments: _.push([currComments])
                }
            }).then(res => {
                const { bookInfo } = this.state
                let { comments=[] } = bookInfo
                comments.push(currComments)
                this.setState({
                    comment: '',
                    bookInfo: { ...bookInfo, comments },
                    submitLoading: false
                })
            })
        }else{
            Taro.showToast({
                icon: 'none',
                title: '正在提交...'
            })
        }
        
        
    }
    render () {
        const { userInfo, bookInfo, activeNames, submitLoading } = this.state 
        return (
            <View >
                <View className='thumb'>
                    <Image className="back" src={bookInfo.cover_url} ></Image>
                    <Image className="img " src={bookInfo.cover_url} mode="aspectFit"></Image>
                </View>
                <View class="book-info container">
                    <View class="book-name">{bookInfo.title}</View>
                    <View class="label">{bookInfo.author} / {bookInfo.publisher} / {bookInfo.publisherYear}出版</View>
                    <View class="price"><Text>¥ </Text><Text>{bookInfo.price}</Text></View>
                </View>
                {
                    ( bookInfo.intro && bookInfo.intro.length > 0) && <View>
                        <View class="divider"></View>
                        <View class="container">
                            <View class="label-md" >简介</View>
                            <AtAccordion open={activeNames} onClick={this.onChange.bind(this)} title={bookInfo.intro[0].text} hasBorder={false}> 
                                {
                                    bookInfo.intro.map((res, index) => {
                                        return index > 0 ?  <View class="intro">{res.text}</View> : ''
                                    })
                                }
                            </AtAccordion>
                            {
                                (bookInfo.intro && bookInfo.intro.length > 1) && <View class="expand" onClick={this.onChange.bind(this)}>
                                        { activeNames ? '收起' : '展开' }
                                        <AtIcon value={activeNames ? 'chevron-up' : 'chevron-down'} size="13"/>
                                    </View>
                            }
                        </View>
                    </View>
                }
                {
                    ( bookInfo.tags && bookInfo.tags.length > 0) && <View>
                        <View class="divider"></View>
                        <View class="container " >
                            <View class="label-md">标签</View>
                            <View>
                                {
                                    bookInfo.tags.map(res => {
                                        return <Text class="tag">{res.text}</Text>
                                    }) 
                                }
                            </View>
                        </View>
                    </View>
                }
                {
                    bookInfo.rating && bookInfo.rating.value && <View>
                        <View class="divider"></View>
                        <View class="container ">
                            <View class="label-md">豆瓣评分</View>
                            <View class="flex">
                                <View class="rate">{ bookInfo.rating.value }</View>
                                <View>
                                    <AtRate value={ bookInfo.rating.star_count }/>
                                    <View class="label mar-left">{ bookInfo.rating.count }人评分</View>
                                </View>
                            </View>
                        </View>
                    </View>
                }
                {
                    ( bookInfo.comments && bookInfo.comments.length > 0) && <View>
                        <View class="divider"></View>
                        <View class="container ">
                            <View class="label-md">评论</View>
                            <View>
                                {
                                    bookInfo.comments.map(c=>{
                                        let image = c.avatarUrl ? c.avatarUrl : '../../images/img/unlogin.png'
                                        const date = c.date.substr(0, 10)
                                        return <View>
                                            <AtCard title={c.author} extra={date} thumb={image} > {c.content} </AtCard>
                                        </View>
                                    })
                                }
                            </View>
                        </View>
                    </View>
                }
                {
                    userInfo.openid && <View>
                        <View class="divider"></View>
                        <View class="container ">
                            <View class="label-md">我来说两句</View>
                            <AtTextarea value={this.state.comment} onChange = {this.handleChange} > </AtTextarea>
                            <AtButton loading={submitLoading} type='primary' onClick={this.comment} className="mar-top">提交</AtButton>
                        </View>
                        
                    </View>
                }
            </View>
        )
    }
}


export default Detail
