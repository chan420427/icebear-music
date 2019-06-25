// import {getLyric} from 'api/song'
import {ERR_OK} from '../../api/config'
// import {Base64} from 'js-base64'

export default class Song {
    constructor({id, mid, singer, name, album, duration, image, url}) {
        this.id = id
        this.mid = mid
        this.singer = singer
        this.name = name
        this.album = album
        this.duration = duration
        this.image = image
        this.url = url
    }
}

//创建一个song的对象，这是一个功能方法，不用每次都new一个song对象。
// 不用直接调用song，直接返回一个song实例
export function createSong(musicData) {
    return new Song({
        id: musicData.songid,
        mid: musicData.songmid,
        singer: filterSinger(musicData.singer),
        name: musicData.songname,
        album: musicData.albumname,//专辑名称
        duration: musicData.interval,//播放时间
        image: `https://y.gtimg.cn/music/photo_new/T002R300x300M000${musicData.albummid}.jpg?max_age=2592000`,//图片地址
        url: `http://ws.stream.qqmusic.qq.com/${musicData.songid}.m4a?fromtag=46`//song的地址，可播放的源，这是其中一个
    })
}

//筛选出musicData的歌手，有可能是多个的
function filterSinger(singer) {
    let ret = []
    if (!singer) {
        return ''
    }
    singer.forEach((s) => {
        ret.push(s.name)
    })
    return ret.join('/')
}