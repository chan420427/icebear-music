import * as types from './mutation-types'
import {playMode} from "../common/js/config";
import {shuffle} from "../common/js/util";
import {saveSearch,deleteSearch,clearSearch,savePlay,saveFavorite,deleteFavorite} from '../common/js/cache'

export const selectPlay = function ({commit, state}, {list, index}) {
    commit(types.SET_SEQUENCE_LIST, list)
    if (state.mode === playMode.random) {
        let randomList = shuffle(list)
        commit(types.SET_PLAYLIST, randomList)
        //顺序列表的这首歌的索引对应随机列表的哪首歌的索引
        index = findIndex(randomList, list[index])
    } else {
        commit(types.SET_PLAYLIST, list)
    }
    commit(types.SET_CURRENT_INDEX, index)
    commit(types.SET_FULL_SCREEN, true)
    commit(types.SET_PLAYING_STATE, true)
}

function findIndex(list, song) {
    //返回顺序列表的这首歌的索引对应随机列表的哪首歌的索引
    return list.findIndex((item) => {
        return item.id === song.id
    })
}

export const randomPlay = function ({commit}, {list}) {
    commit(types.SET_PLAY_MODE, playMode.random)
    commit(types.SET_SEQUENCE_LIST, list)
    let randomList = shuffle(list)
    commit(types.SET_PLAYLIST, randomList)
    commit(types.SET_CURRENT_INDEX, 0)//从第一个播放
    commit(types.SET_FULL_SCREEN, true)
    commit(types.SET_PLAYING_STATE, true)
}

export const insertSong = function ({commit, state}, song) {
    //slice()相当于是state.playlist的一个副本而不是直接操作state的playlist，在mutation之外修改vuex的状态是会报错的
    let playlist = state.playlist.slice()
    let sequenceList = state.sequenceList.slice()
    let currentIndex = state.currentIndex
    // 记录当前歌曲
    let currentSong = playlist[currentIndex]
    // 查找当前列表中是否有待插入的歌曲并返回其索引，返回的是要插入的歌曲是否原来已经存在且它的索引
    let fpIndex = findIndex(playlist, song)
    // 因为是插入歌曲，所以索引+1
    currentIndex++
    // 插入这首歌到当前索引位置
    playlist.splice(currentIndex, 0, song)
    // 如果已经包含了这首歌
    if (fpIndex > -1) {
        // 如果当前插入的序号大于列表中的序号
        // 例子：[1,2,3,4] [1,2,3,4,2]要插入2并且当前插入2的序号是4大于原本在数组里面2的序号，就删除原本在数组里面的2
        if (currentIndex > fpIndex) {
            playlist.splice(fpIndex, 1)
            currentIndex--
        } else {
            //[1,3,4,2] [1,2,3,4,2]要插入2并且当前插入2的序号是1小于原本在数组里面2的序号，就删除原本在列表里面的2即最后一个2[1,2,3,4]
            //为什么是删除fpIndex + 1，因为在它之前已经插入了一个，它的索引已经往后推了一个
            playlist.splice(fpIndex + 1, 1)
        }
    }

    //当前sequenceList的索引，要插入的song的位置
    let currentSIndex = findIndex(sequenceList, currentSong) + 1

    //当前sequenceList有没有包含我们要插入的song
    let fsIndex = findIndex(sequenceList, song)

    //插入一首歌
    sequenceList.splice(currentSIndex, 0, song)

    if (fsIndex > -1) {
        if (currentSIndex > fsIndex) {
            sequenceList.splice(fsIndex, 1)
        } else {
            sequenceList.splice(fsIndex + 1, 1)
        }
    }

    commit(types.SET_PLAYLIST, playlist)
    commit(types.SET_SEQUENCE_LIST, sequenceList)
    commit(types.SET_CURRENT_INDEX, currentIndex)
    commit(types.SET_FULL_SCREEN, true)
    commit(types.SET_PLAYING_STATE, true)
}

export const saveSearchHistory = function ({commit}, query) {
    commit(types.SET_SEARCH_HISTORY, saveSearch(query))
}

export const deleteSearchHistory = function ({commit}, query) {
    commit(types.SET_SEARCH_HISTORY, deleteSearch(query))
}

export const clearSearchHistory = function ({commit}) {
    commit(types.SET_SEARCH_HISTORY, clearSearch())
}

export const deleteSong = function ({commit, state}, song) {
    let playlist = state.playlist.slice()
    let sequenceList = state.sequenceList.slice()
    let currentIndex = state.currentIndex
    let pIndex = findIndex(playlist, song)
    playlist.splice(pIndex, 1)
    let sIndex = findIndex(sequenceList, song)
    sequenceList.splice(sIndex, 1)
    //currentIndex === playlist.length删除的是最后一首歌
    if (currentIndex > pIndex || currentIndex === playlist.length) {
        currentIndex--
    }

    commit(types.SET_PLAYLIST, playlist)
    commit(types.SET_SEQUENCE_LIST, sequenceList)
    commit(types.SET_CURRENT_INDEX, currentIndex)

    //整个列表删完了。是空的的时候
    if (!playlist.length) {
        commit(types.SET_PLAYING_STATE, false)
    } else {
        commit(types.SET_PLAYING_STATE, true)
    }
}

export const deleteSongList = function ({commit}) {
    commit(types.SET_CURRENT_INDEX, -1)
    commit(types.SET_PLAYLIST, [])
    commit(types.SET_SEQUENCE_LIST, [])
    commit(types.SET_PLAYING_STATE, false)
}

export const savePlayHistory = function ({commit}, song) {
    commit(types.SET_PLAY_HISTORY, savePlay(song))
}

export const saveFavoriteList = function ({commit}, song) {
    commit(types.SET_FAVORITE_LIST, saveFavorite(song))
}

export const deleteFavoriteList = function ({commit}, song) {
    commit(types.SET_FAVORITE_LIST, deleteFavorite(song))
}
