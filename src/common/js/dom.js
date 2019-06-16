export function addClass(el,classNme) {
    if(hasClass(el,classNme)) {
        return
    }
    let newClass = el.className.split(' ')
    newClass.push(classNme)
    el.className = newClass.join(' ')
}

export function hasClass(el,className) {//判断是否有这个class
    let reg = new RegExp('(^|\\s)' + className + '(\\s|$)')//以className开头 或者className前面/后面有空格 或者以className结尾
    return reg.test(el.className)
}