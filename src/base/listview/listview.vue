<template>
    <scroll class="listview"
            :data="data"
            ref="listview"
            :listenScroll = "listenScroll"
            :probeType = "probeType"
            @scroll = "scroll">
        <ul>
            <li v-for="group in data" class="list-group" ref="listGroup">
                <h2 class="list-group-title">{{group.title}}</h2>
                <uL>
                    <li @click="selectItem(item)" v-for="item in group.items" class="list-group-item">
                        <img class="avatar" v-lazy="item.avatar">
                        <span class="name">{{item.name}}</span>
                    </li>
                </uL>
            </li>
        </ul>
        <div class="list-shortcut" @touchstart="onShortcutTouchStart" @touchmove.stop.prevent="onShortcutTouchMove">
            <ul>
                <li v-for="(item, index) in shortcutList" :data-index="index" class="item"
                    :class="{'current':currentIndex===index}">{{item}}

                </li>
            </ul>
        </div>
        <div class="list-fixed" ref="fixed" v-show="fixedTitle">
            <div class="fixed-title">{{fixedTitle}} </div>
        </div>
    </scroll>
</template>

<script type="text/ecmascript-6">
    import Scroll from '../../base/scroll/scroll'
    import {getData} from '../../common/js/dom'

    const ANCHOR_HEIGHT = 18
    const TITLE_HEIGHT = 30

    export default {
        created() {
            this.touch = {}
            this.listenScroll = true
            this.listHeight = []
            this.probeType = 3
        },
        data() {
            return {
                scrollY: -1,
                currentIndex: 0,//标记字母列表当前高亮的锚点
                diff: -1
            }
        },
        props: {
            data: {
                    type: Array,
                    default: []
            }
        },
        computed: {
            //右侧的字母列表
            shortcutList() {
                return this.data.map((group) => {
                    return group.title.substr(0, 1)
                })
            },
            fixedTitle() {
                if (this.scrollY > 0) {
                    return ''
                }
                return this.data[this.currentIndex] ? this.data[this.currentIndex].title : ''
            }
        },
        methods: {
            selectItem(item){
                this.$emit('select',item)
            },
            onShortcutTouchStart(e) {
                let anchorIndex = getData(e.target, 'index')
                //取到第一次触摸的锚点
                let firstTouch = e.touches[0]
                //第一次触摸的锚点的y坐标
                this.touch.y1 = firstTouch.pageY
                this.touch.anchorIndex = anchorIndex

                this._scrollTo(anchorIndex)
            },
            onShortcutTouchMove(e) {
                let firstTouch = e.touches[0]
                this.touch.y2 = firstTouch.pageY
                //计算字母列表的偏移量
                let delta = (this.touch.y2 - this.touch.y1) / ANCHOR_HEIGHT | 0 //相当于向下取整
                //计算当前的锚点
                let anchorIndex = parseInt(this.touch.anchorIndex) + delta

                this._scrollTo(anchorIndex)
            },
            refresh() {
              this.$refs.listview.refresh()
            },
            scroll(pos) {
                //派发的滚动事件实时监听滚动的y值
                this.scrollY = pos.y
            },
            _scrollTo(index) {
                if (!index && index !== 0) {
                    return
                }
                if (index < 0) {
                    index = 0
                } else if (index > this.listHeight.length - 2) {
                    index = this.listHeight.length - 2
                }
                this.scrollY = -this.listHeight[index]
                //歌手列表滑动到对应的位置
                this.$refs.listview.scrollToElement(this.$refs.listGroup[index], 0)
            },
            //计算歌手各个分组的高度
            _calculateHeight() {
                this.listHeight = []
                const list = this.$refs.listGroup
                let height = 0
                this.listHeight.push(height)
                for (let i = 0; i < list.length; i++) {
                    let item = list[i]
                    height += item.clientHeight
                    this.listHeight.push(height)
                }
            }
        },
        watch: {
            //data发生变化，延时计算高度，延时是因为数据改变到dom改变是有延时的，要保证dom已经渲染好
            data() {
                setTimeout(() => {
                    this._calculateHeight()
                },20)
            },
            //实时监听scrollY的值，判断scrollY落在那个区间
            scrollY(newY) {
                const listHeight = this.listHeight
                // 当滚动到顶部，newY>0
                if (newY > 0) {
                    this.currentIndex = 0
                    return
                }
                // 在中间部分滚动
                for (let i = 0; i < listHeight.length - 1; i++) {
                    let height1 = listHeight[i]
                    let height2 = listHeight[i + 1]
                    if (-newY >= height1 && -newY < height2) {
                        this.currentIndex = i
                        this.diff = height2 + newY
                        return
                    }
                }
                // 当滚动到底部，且-newY大于最后一个元素的上限
                this.currentIndex = listHeight.length - 2
            },
            diff(newVal) {
                let fixedTop = (newVal > 0 && newVal < TITLE_HEIGHT) ? newVal - TITLE_HEIGHT : 0
                if (this.fixedTop === fixedTop) {
                    return
                }
                this.fixedTop = fixedTop
                this.$refs.fixed.style.transform = `translate3d(0,${fixedTop}px,0)`
            }
        },
        components: {
            Scroll
        }
    }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
    @import "~common/stylus/variable"

    .listview
        position: relative
        width: 100%
        height: 100%
        overflow: hidden
        background: $color-background
        .list-group
            padding-bottom: 30px
            .list-group-title
                height: 30px
                line-height: 30px
                padding-left: 20px
                font-size: $font-size-small
                color: $color-text-l
                background: $color-highlight-background
            .list-group-item
                display: flex
                align-items: center
                padding: 20px 0 0 30px
                .avatar
                    width: 50px
                    height: 50px
                    border-radius: 50%
                .name
                    margin-left: 20px
                    color: $color-text-l
                    font-size: $font-size-medium
        .list-shortcut
            position: absolute
            z-index: 30
            right: 0
            top: 50%
            transform: translateY(-50%)
            width: 20px
            padding: 20px 0
            border-radius: 10px
            text-align: center
            background: $color-background-d
            font-family: Helvetica
            .item
                padding: 3px
                line-height: 1
                color: $color-text-l
                font-size: $font-size-small
                &.current
                    color: $color-theme
        .list-fixed
            position: absolute
            top: 0
            left: 0
            width: 100%
            .fixed-title
                height: 30px
                line-height: 30px
                padding-left: 20px
                font-size: $font-size-small
                color: $color-text-l
                background: $color-highlight-background
        .loading-container
            position: absolute
            width: 100%
            top: 50%
            transform: translateY(-50%)
</style>