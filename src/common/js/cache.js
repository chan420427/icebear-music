import storage from 'good-storage'

const SEARCH_KEY = '__search__'
const SEARCH_MAX_LEN = 15//最大存储空间

const PLAY_KEY = '__play__'
const PLAY_MAX_LEN = 200//最大播放量

const FAVORITE_KEY = '__favorite__'
const FAVORITE_MAX_LEN = 200

function insertArray(arr, val, compare, maxLen) {
    /*先查找array中有没有val这条数据，没有的话就直接插入，
    有并且是在第一个位置就不做操作，不在第一个就删除原来在数据里面的那条数据再插入到第一个位置*/

    //val要存储的值，compare要比较的函数
    const index = arr.findIndex(compare)
    if (index === 0) {
        return
    }
    //有这条数据但不是第一条，就删除原来数据里面的那条数据
    if (index > 0) {
        arr.splice(index, 1)
    }
    //插入到第一个位置
    arr.unshift(val)
    if (maxLen && arr.length > maxLen) {
        arr.pop()
    }
}

function deleteFromArray(arr, compare) {
    const index = arr.findIndex(compare)
    if (index > -1) {
        arr.splice(index, 1)
    }
}

export function saveSearch(query) {
    let searches = storage.get(SEARCH_KEY, [])
    insertArray(searches, query, (item) => {
        return item === query
    }, SEARCH_MAX_LEN)
    storage.set(SEARCH_KEY, searches)
    return searches
}

export function loadSearch() {
    return storage.get(SEARCH_KEY, [])
}


export function deleteSearch(query) {
    let searches = storage.get(SEARCH_KEY, [])
    deleteFromArray(searches, (item) => {
        return item === query
    })
    storage.set(SEARCH_KEY, searches)
    return searches
}

export function clearSearch() {
    //将里面的数组全部清空
    storage.remove(SEARCH_KEY)
    return []
}

//写入
export function savePlay(song) {
    let songs = storage.get(PLAY_KEY, [])
    insertArray(songs, song, (item) => {
        return song.id === item.id
    }, PLAY_MAX_LEN)
    storage.set(PLAY_KEY, songs)
    return songs
}

//读取,给state读取
export function loadPlay() {
    return storage.get(PLAY_KEY, [])
}


export function saveFavorite(song) {
    let songs = storage.get(FAVORITE_KEY, [])
    insertArray(songs, song, (item) => {
        return song.id === item.id
    }, FAVORITE_MAX_LEN)
    storage.set(FAVORITE_KEY, songs)
    return songs
}

export function deleteFavorite(song) {
    let songs = storage.get(FAVORITE_KEY, [])
    deleteFromArray(songs, (item) => {
        return item.id === song.id
    })
    storage.set(FAVORITE_KEY, songs)
    return songs
}

export function loadFavorite() {
    return storage.get(FAVORITE_KEY, [])
}

