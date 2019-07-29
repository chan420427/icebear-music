import {getLyric} from '../../api/song'
import {ERR_OK} from '../../api/config'
import {Base64} from 'js-base64'

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

    getLyric() {
        if (this.lyric) {
            return Promise.resolve(this.lyric)
        }

        return new Promise((resolve, reject) => {
            getLyric(this.id).then((res) => {
                if (res.retcode === ERR_OK) {
                    //给song这个对象一个属性
                    let t = res.lyric


                    let str =t.replace(/&#\d+?;/g,(a)=> {
                        let ret = a.slice(2,a.length-1)
                        ret = String.fromCharCode(ret)
                        return  ret
                    })
                    this.lyric = str
                    resolve(this.lyric)

                } else {
                    reject('no lyric')
                }
            })

        })
    }
}

//创建一个song的对象，这是一个功能方法，不用每次都new一个song对象。
// 不用直接调用song，直接返回一个song实例
export function createSong(musicData,vkey) {
    return new Song({
        id: musicData.songid,
        mid: musicData.songmid,
        singer: filterSinger(musicData.singer),
        name: musicData.songname,
        album: musicData.albumname,//专辑名称
        duration: musicData.interval,//播放时间
        image: `https://y.gtimg.cn/music/photo_new/T002R300x300M000${musicData.albummid}.jpg?max_age=2592000`,//图片地址
        url: `http://dl.stream.qqmusic.qq.com/C400${musicData.songmid}.m4a?fromtag=38&guid=5931742855&vkey=${vkey}`//song的地址，可播放的源，这是其中一个
    })
}

//筛选出musicData的歌手，有可能是多个的
export function filterSinger(singer) {
    let ret = []
    if (!singer) {
        return ''
    }
    singer.forEach((s) => {
        ret.push(s.name)
    })
    return ret.join('/')
}