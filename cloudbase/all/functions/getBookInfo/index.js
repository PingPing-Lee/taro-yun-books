// 云函数入口文件
const axios = require('axios')
const doubanbook = require('doubanbook')
const cheerio = require('cheerio')

const cloud = require('wx-server-sdk')

cloud.init()
async function searchBookInfo(isbn){
    const url = "https://book.douban.com/subject_search?search_text="+isbn
    const searchInfo = await axios.get(url)
    let reg = /window\.__DATA__ = "(.*)"/
    if(reg.test(searchInfo.data)){
        // 数据解密
        let searchData = doubanbook(RegExp.$1)[0]
        return searchData
    } 
}
async function getBookInfo(isbn){
    let detailInfo = await searchBookInfo(isbn)
    const { url, rating, title, cover_url, id } = detailInfo 
    const detailPage = await axios.get(url) 
    const $ = cheerio.load(detailPage.data) 
    const info = $('#info').text().split('\n').map(v => v.trim()).filter(v=>v)
    let publisher, publisherYear, price
    info.map(res => {
        const temp = res.split(':')
        
        switch (temp[0]) {
        case '出版社':
            publisher = temp[1]
            break;
        case '出版年':
            publisherYear = temp[1]
            break;
        case '定价':
            price = temp[1]
            break;
        default:
            break;
        }
    })

    const author = info[1]

    // 图书的标签
    let tags = []
    $('#db-tags-section a.tag').each((i, dom) => {
        tags.push({
        text: $(dom).text()
        })
    })
    
    // 图书的简介
    let intro = [], dom = []
    if($('#link-report .intro span').hasClass('all')){
        dom = $('#link-report .intro .all p')
    }else{
        dom = $('#link-report .intro p')
    }
    dom.each((i, dom) => {
        intro.push({
        text: $(dom).text()
        })
    })

    // 图书的评价
    let comments = []
    $('#comment-list-wrapper .comment').each((i,v)=>{
        comments.push({
            author:$(v).find('.comment-info a').text(),
            content:$(v).find('.comment-content').text(),
            date:$(v).find('.comment-info span').eq(1).text()
        })
    }) 
    
    return {
        time: new Date().getTime(),
        url, title, cover_url, author, publisher, publisherYear, price, rating, tags,
        intro, comments
    }
}
// 云函数入口函数
// 所谓的云函数就是一个 node 函数，对外暴露 export
exports.main = async (event, context) => {
  // 云函数逻辑
  const { isbn } = event
  return getBookInfo(isbn)
}