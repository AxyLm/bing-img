let http = require('https')
let cheerio = require('cheerio')
let async = require('async')
let request = require('request')
let fs = require('fs')

let url='https://bing.ioliu.cn/ranking' //bing 下载排行
let home = 'https://bing.ioliu.cn'   //bing 主页
let page = '4'  //设置开始页码
let maxPage = '119'  //设置结束页码
let urls = home + '?p=' + page
let timeSET = {
    pageTime:'2500',   //每页延迟      s
    picTime:'600'      //每张图片延迟  s
}

let files = ['./image','./image/home','./image/page','./image/all']

mdfile(files)


bingPic(home ,page,maxPage)
console.log('开始运行;图片延时:'+timeSET.picTime+';每页延时:'+timeSET.pageTime,)
function bingPic(url,page,maxPage){
    let imgList = []
    console.log( page > maxPage)
    if( !page < maxPage ){
        let urls = url + '?p=' + page
        console.log('开始请求:'+urls)
        http.get( urls ,(res)=>{
            let rawData=''
            res.on('data',(chunk)=>{
                rawData+=chunk.toString('utf8')
            })
            res.on('end',()=>{
                // 将请求的数据保存到本地
                // fs.writeFileSync('./bibi.html',rawData)
               //通过cheerio 分析
               let $=cheerio.load(rawData)// 将请求的网页数据进行转化
            //    $('img').each((index,el)=>{
            //     console.log( $(el).attr('src') )
            //    })
            console.log('网站请求完成,开始分析')
               $('.item .card .options .download').each((index,el)=>{
                    imgList.push( 'http://h1.ioliu.cn/bing/'+ $(el).attr('href').split('/photo/')[1].split('?')[0] +'_1920x1080.jpg' )
               })
            //    console.log(imgList)
            console.log('网站分析完成,开始下载')

               asdl(imgList)
            })
        })
    }else{
        console.log(urls+';当前页码'+page,';已到达最大'+maxPage,';程序终止')
    }
}


function asdl(list){
    async.mapSeries(list,function(item, callback){
        setTimeout(function(){
            downloadPic(item, './image/all/'+ (new Date()).getTime()+'_p'+page +'.jpg');
            callback(null, item);
        },timeSET.picTime);
    }, function(err, results){
        console.log(urls+';当前页码'+page,';未到达最大'+maxPage,';程序继续')
        setTimeout(function(){
            page++
            bingPic( home ,page , maxPage )
        },timeSET.pageTime)
    });
}

function downloadPic(src, dest){
    request(src).pipe(fs.createWriteStream(dest)).on('close',function(){
        console.log('pic end!;;'+src)
    })
}

function mdfile(arr){
    arr.forEach(item => {
        fs.exists(item,(err)=>{
            if(!err){
                console.log(item+'不存在;开始创建')
                fs.mkdir(item,(err)=>{
                    if(!err){
                        console.log(item+':创建完成')
                    }else{
                        console.log(item+':创建失败')
                    }
                })
            }else{
                console.log(item+'跳过')
            }
        })
    });
}