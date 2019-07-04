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

//封装获取data-属性的方法，例如获取data-index的值 name为ata-index的index
export function getData(el, name, val) {
    const prefix = 'data-'

    //有val的话可以设置属性
    if (val) {
        return el.setAttribute(prefix + name, val)
    }
    // 获取到data-index的值
    return el.getAttribute(prefix + name)
}

let elementStyle = document.createElement('div').style

let vendor = (() => {
    let transformNames = {
        webkit: 'webkitTransform',
        Moz: 'MozTransform',
        O: 'OTransform',
        ms: 'msTransform',
        standard: 'transform'
    }

    for (let key in transformNames) {
        if (elementStyle[transformNames[key]] !== undefined) {
            return key
        }
    }

    return false
})()

export function prefixStyle(style) {
    if (vendor === false) {
        return false
    }

    if (vendor === 'standard') {
        return style
    }

    return vendor + style.charAt(0).toUpperCase() + style.substr(1)
}