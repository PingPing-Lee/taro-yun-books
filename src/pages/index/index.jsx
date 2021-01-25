import React, { Component } from 'react'

import Taro from '@tarojs/taro'
import { View, Image, Swiper, SwiperItem  } from '@tarojs/components'
import { observer, inject } from 'mobx-react'
import { AtCard, AtRate } from 'taro-ui'
import './index.scss'

const db = Taro.cloud.database()

@inject('store')
@observer
class Index extends Component {
    state = {
        userInfo: Taro.getStorageSync('userInfo') || {},
        swiperList: [],
        booksList: [],
        pageNum: 0,
        pageSize: 6,
        isMore: true
    }
    componentDidMount(){
        this.getBooksList(true)
        this.getSwiperList()
    }
    // 下拉刷新
    onPullDownRefresh() {
        this.getBooksList(true)
    }
    // 上啦加载更多
    onReachBottom() {
        const { pageNum, isMore } = this.state
        if(isMore){
            this.setState({
                pageNum: pageNum + 1
            }, () => {
                this.getBooksList()
            })
        }
    }
    // 获取图书详情
    getBooksList(init){
        Taro.showLoading({
            title: '加载中...',
        })
        if(init){ // 初始化第一页数据
            this.setState({
                pageNum: 0,
                isMore: true
            })
        }
        const { pageNum, pageSize, booksList: currList } = this.state
        let result = db.collection('books').orderBy('time', 'desc')
        let booksList = []
        if(!init){ // 下一页数据
            result = result.skip(pageNum * pageSize)
        }
        // 
        result.limit(pageSize).get().then(res => {
            if(init){ // 初始化第一页数据
                booksList = [ ...res.data ]
            }else{ // 下一页数据
                booksList = [ ...currList, ...res.data ]
            }

            // 判断是否加载完成
            let isMore = true
            if(res.data.length < pageSize && pageNum > 0){ // 没有更多页了
                isMore = false
            }

            this.setState({ booksList, isMore }, () => {
                Taro.hideLoading()
                Taro.stopPullDownRefresh()
            })
        })
    }
    // 获取 Swiper 数据
    getSwiperList(){
        db.collection('books').orderBy('count', 'desc').limit(9).get().then(res => {
            this.setState({
                swiperList: [res.data.slice(0, 3), res.data.slice(3, 6), res.data.slice(6)]
            })
        })
    }
    // 去图书的详情
    toDetail(id) {
        Taro.navigateTo({
            url: '/pages/detail/index?id=' + id
        })
    }
   
    render () {
        const { swiperList, booksList } = this.state 
        return (
            <View class="container">
                <Swiper className='test-h' indicatorColor='#999' indicatorActiveColor='#333' circular indicatorDots autoplay>
                    {
                        swiperList.map(item => {
                            return  <SwiperItem>
                                        {
                                            item.map(res => {
                                                return <Image src={res.cover_url} mode="aspectFit" class='slide-image' onClick={() => {this.toDetail(res._id)}}></Image>
                                            })
                                        }
                                    </SwiperItem>
                        })
                    }
                </Swiper>
                {
                    booksList.map(item => {
                        return  <AtCard title={item.title} thumb={item.userInfo.avatarUrl} onClick={() => {this.toDetail(item._id)}}>
                                    <View class="flex" >
                                        <Image src={item.cover_url} class="cover_url " mode="widthFix" ></Image>
                                        <View class="ellipsis mar-left card-body">
                                            <View >{item.author} 著</View>
                                            <View class="label">{item.publisher}</View>
                                            <view class="price"><text>¥ </text><text>{item.price}</text></view>
                                        </View>
                                    </View>
                                    <View class="flex card-footer at-card__content-note">
                                        <View >浏览量 {item.rating.count || 0}</View>
                                        <View class="card__header-extra">
                                            {
                                                item.rating.star_count ? <AtRate value={item.rating.star_count} size="14"/> : <View>{item.rating.rating_info}</View>
                                            }
                                        </View>
                                    </View>
                                </AtCard>
                    })
                }
            </View>
        )
    }
}

export default Index