import {playMode} from 'common/js/config'
import {loadSearch,loadPlay} from "../common/js/cache";

const state = {
    singer: {},
    playing: false,
    fullScreen: false,
    playlist: [],
    sequenceList: [],//顺序列表
    mode: playMode.sequence ,//播放模式
    currentIndex: -1,//当前播放索引
    disc: {},
    topList: {},
    searchHistory: loadSearch(),//搜索历史,从本地存储读取
    playHistory: loadPlay(),//播放历史
    favoriteList: [],//收藏列表

}

export default state