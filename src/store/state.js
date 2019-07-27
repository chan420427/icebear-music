import {playMode} from 'common/js/config'

const state = {
    singer: {},
    playing: false,
    fullScreen: false,
    playlist: [],
    sequenceList: [],//顺序列表
    mode: playMode.sequence ,//播放模式
    currentIndex: -1,//当前播放索引
    disc: {},
    topList: {}
}

export default state