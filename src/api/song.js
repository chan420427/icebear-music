import {commonParams} from './config'
import axios from 'axios'

//获取歌词
export function getLyric(id) {
    const url = '/lyric'//代理的地址

    const data = Object.assign({}, commonParams, {
        // songmid: mid,
        // platform: 'yqq',
        // hostUin: 0,
        // needNewCode: 0,
        // g_tk: 67232073,
        // pcachetime: +new Date(),//当前的时间戳
        // format: 'json'
        "nobase64": "1",
        "musicid": id,
        "-": "jsonp1",
        "g_tk": "1599800671",
        "loginUin": "2895800864",
        "hostUin": "0",
        "format": "json",
        "inCharset": "utf8",
        "outCharset": "utf-8",
        "notice": "0",
        "platform": "yqq.json",
        "needNewCode": "0"
    })

    return axios.get(url, {
        params: data
    }).then((res) => {
        return Promise.resolve(res.data)
    })
}