//辅助函数，返回min和max之间的随机数
function getRandomInt(min,max) {
    //+1是为了取到max的上限值。+min是为了取到max和min之间的值。Math.floor是为了让Math.random出来的小数向下取值
    return Math.floor(Math.random() * (max - min + 1) + min)
}

//洗牌函数，打乱播放顺序
export function shuffle(arr) {
    //直接改变arr会对arr原本这个数组发生副作用，arr就不是原来的arr了，这样就会导致list用了这个函数之后会改变原来的list
    let _arr = arr.slice()
    for (let i=0;i<_arr.length;i++) {
        let j = getRandomInt(0,i)
        let t = _arr[i]
        _arr[i] = _arr[j]
        _arr[j] = t
    }
    return _arr
}

//截流函数，优化搜索，不是每次退格都请求一次资源，延迟一下，请求慢一点
export function debounce(func, delay) {
    let timer

    return function (...args) {
        if (timer) {
            clearTimeout(timer)
        }
        timer = setTimeout(() => {
            func.apply(this, args)
        }, delay)
    }
}