<template>
    <div class="player" v-show="playlist.length>0">
        <transition name="normal"
                    @enter="enter"
                    @after-enter="afterEnter"
                    @leave="leave"
                    @after-leave="afterLeave"
        >
            <div class="normal-player" v-show="fullScreen">
                <div class="background">
                    <img width="100%" height="100%" :src="currentSong.image">
                </div>
                <div class="top">
                    <div class="back" @click="back">
                        <i class="icon-back"></i>
                    </div>
                    <h1 class="title" v-html="currentSong.name"></h1>
                    <h2 class="subtitle" v-html="currentSong.singer"></h2>
                </div>
                <div class="middle"
                     @touchstart.prevent="middleTouchStart"
                     @touchmove.prevent="middleTouchMove"
                     @touchend="middleTouchEnd"
                >
                    <div class="middle-l" ref="middleL">
                        <div class="cd-wrapper" ref="cdWrapper">
                            <div class="cd" :class="cdCls">
                                <img class="image" :src="currentSong.image">
                            </div>
                        </div>
                        <div class="playing-lyric-wrapper">
                            <div class="playing-lyric">{{playingLyric}}</div>
                        </div>
                    </div>
                    <scroll class="middle-r" ref="lyricList" :data="currentLyric && currentLyric.lines">
                        <div class="lyric-wrapper">
                            <div v-if="currentLyric">
                                <p ref="lyricLine"
                                   class="text"
                                   :class="{'current':currentLineNum === index}"
                                   v-for="(line,index) in currentLyric.lines">{{line.txt}}</p>
                            </div>
                        </div>
                    </scroll>
                </div>
                <div class="bottom">
                    <div class="dot-wrapper">
                        <span class="dot" :class="{'active':currentShow==='cd'}"></span>
                        <span class="dot" :class="{'active':currentShow==='lyric'}"></span>
                    </div>
                    <div class="progress-wrapper">
                        <span class="time time-l">{{format(currentTime)}}</span>
                        <div class="progress-bar-wrapper">
                            <progress-bar :percent="percent" @percentChange="onProgressBarChange"></progress-bar>
                        </div>
                        <span class="time time-r">{{format(currentSong.duration)}}</span>
                    </div>
                    <div class="operators">
                        <div class="icon i-left" @click="changeMode">
                            <i :class="iconMode"></i>
                        </div>
                        <div class="icon i-left" :class="disableCls">
                            <i @click="prev" class="icon-prev"></i>
                        </div>
                        <div class="icon i-center" :class="disableCls">
                            <i @click="togglePlaying" :class="playIcon"></i>
                        </div>
                        <div class="icon i-right" :class="disableCls">
                            <i @click="next" class="icon-next"></i>
                        </div>
                        <div class="icon i-right">
                            <i class="icon" @click="toggleFavorite(currentSong)"
                               :class="getFavoriteIcon(currentSong)"></i>
                        </div>
                    </div>
                </div>
            </div>
        </transition>
        <transition name="mini">
            <div class="mini-player" v-show="!fullScreen" @click="open">
                <div class="icon">
                    <img :class="cdCls" width="40" height="40" :src="currentSong.image">
                </div>
                <div class="text">
                    <h2 class="name" v-html="currentSong.name"></h2>
                    <p class="desc" v-html="currentSong.singer"></p>
                </div>
                <div class="control">
                    <progress-circle :radius="radius" :percent="percent">
                        <i @click.stop="togglePlaying" class="icon-mini" :class="miniIcon"></i>
                    </progress-circle>
                </div>
                <div class="control">
                    <i class="icon-playlist" @click.stop="showPlaylist"></i>
                </div>
            </div>
        </transition>
        <playlist ref="playlist"></playlist>
        <audio ref="audio" :src="currentSong.url" @play="ready"
               @error="error" @timeupdate="updateTime" @ended="end"></audio>
    </div>
</template>

<script type="text/ecmascript-6">
    import {mapGetters, mapMutations, mapActions} from 'vuex'
    import animations from 'create-keyframe-animation'
    import {prefixStyle} from 'common/js/dom'
    import ProgressBar from '../../base/progress-bar/progress-bar'
    import ProgressCircle from '../../base/progress-circle/progress-circle'
    import {playMode} from '../../common/js/config'
    import Lyric from 'lyric-parser'
    import Scroll from '../../base/scroll/scroll'
    import Playlist from '../../components/playlist/playlist'
    import {playerMixin} from "../../common/js/mixin";


    const transform = prefixStyle('transform')
    const transitionDuration = prefixStyle('transitionDuration')

    export default {
        mixins:[playerMixin],
        data() {
            return {
                songReady: false,//标志位
                currentTime: 0,//播放歌曲的当前时间
                radius: 32,//不在视图里直接写radius=“32”是因为会传过去会变成字符串
                currentLyric: null,//当前歌曲歌词
                currentLineNum: 0,//当前歌词所在的行
                currentShow: 'cd',
                playingLyric: '',//当前播放的歌词
            }
        },
        computed: {
            cdCls() {
                return this.playing ? 'play' : 'play pause'
            },
            playIcon() {
                return this.playing ? 'icon-pause' : 'icon-play'
            },
            miniIcon() {
                return this.playing ? 'icon-pause-mini' : 'icon-play-mini'
            },
            disableCls() {
                return this.songReady ? '' : 'disable'
            },
            //进度条百分比
            percent() {
                return this.currentTime / this.currentSong.duration
            },
            ...mapGetters([
                'fullScreen',
                'playing',
                'currentIndex',
            ])
        },
        created() {
            //为什么在create定义 是因为touch不需要get set方法
            this.touch = {}
        },
        methods: {
            back() {
                this.setFullScreen(false)
            },
            open() {
                this.setFullScreen(true)
            },
            enter(el, done) {
                const {x, y, scale} = this._getPosAndScale()

                let animation = {
                    0: {
                        transform: `translate3d(${x}px,${y}px,0) scale(${scale})`
                    },
                    60: {
                        transform: `translate3d(0,0,0) scale(1.1)`
                    },
                    100: {
                        transform: `translate3d(0,0,0) scale(1)`
                    }
                }

                animations.registerAnimation({
                    name: 'move',
                    animation,
                    presets: {
                        duration: 400,//动画间隔
                        easing: 'linear'
                    }
                })

                //运行动画，done函数是回调
                animations.runAnimation(this.$refs.cdWrapper, 'move', done)
            },
            //动画完成之后清空animation
            afterEnter() {
                animations.unregisterAnimation('move')
                this.$refs.cdWrapper.style.animation = ''
            },
            //唱片回到miniplayer的位置
            leave(el, done) {
                this.$refs.cdWrapper.style.transition = 'all 0.4s'
                const {x, y, scale} = this._getPosAndScale()

                this.$refs.cdWrapper.style[transform] = `translate3d(${x}px,${y}px,0) scale(${scale})`
                this.$refs.cdWrapper.addEventListener('transitionend', done)
            },
            afterLeave() {
                this.$refs.cdWrapper.style.transition = ''
                this.$refs.cdWrapper.style[transform] = ''
            },
            //切换歌曲播放或者暂停
            togglePlaying() {
                this.setPlayingState(!this.playing)
                if(this.currentLyric) {
                    this.currentLyric.togglePlay()
                }
            },
            //audio的end事件
            end() {
                if (this.mode === playMode.loop) {
                    this.loop()
                } else {
                    this.next()
                }
            },
            //循环播放
            loop() {
                this.$refs.audio.currentTime = 0
                this.$refs.audio.play()
                if(this.currentLyric) {
                    //循环播放歌词又偏移到最开始的地方
                    this.currentLyric.seek(0)
                }
            },
            next() {
                if (!this.songReady) {
                    return
                }
                //如果歌曲播放列表只有一首歌的这个边界值的处理
                if (this.playlist.length === 1) {
                    this.loop()
                    return
                } else {
                    let index = this.currentIndex + 1
                    if (index === this.playlist.length) {
                        index = 0
                    }
                    this.setCurrentIndex(index)
                    if (!this.playing) {
                        this.togglePlaying()
                    }
                }
                this.songReady = false
            },
            prev() {
                if (!this.songReady) {
                    return
                }
                if (this.playlist.length === 1) {
                    this.loop()
                    return
                } else {
                    let index = this.currentIndex - 1
                    if (index === -1) {
                        index = this.playlist.length - 1
                    }
                    this.setCurrentIndex(index)
                    if (!this.playing) {
                        this.togglePlaying()
                    }
                }
                this.songReady = false
            },
            ready() {
                this.songReady = true
                this.savePlayHistory(this.currentSong)
            },
            error() {
                this.songReady = true
            },
            //audio在歌曲播放的时候会派发这么一个事件,参数是一个event对象
            updateTime(e) {
                this.currentTime = e.target.currentTime
            },
            //获取到的currentTime是一个时间戳，需要变成我们想要的分秒形式
            format(interval) {
                interval = interval | 0//相当于Math.flow向下取整
                const minute = interval / 60 | 0
                const second = this._pad(interval % 60)
                return `${minute}:${second}`
            },
            onProgressBarChange(percent) {
                //拖动进度条让歌曲的进度也到达相应的位置

                const currentTime = this.currentSong.duration * percent
                this.$refs.audio.currentTime = currentTime

                //在拖动进度条后暂停，调用切换暂停和播放方法让歌曲也可以正常播放和暂停
                if (!this.playing) {
                    this.togglePlaying()
                }
                if(this.currentLyric) {
                    this.currentLyric.seek(currentTime * 1000)
                }

            },
            getLyric() {
                this.currentSong.getLyric().then((lyric) => {
                    if (this.currentSong.lyric !== lyric) {
                        return
                    }
                    this.currentLyric = new Lyric(lyric, this.handleLyric)
                    if (this.playing) {
                        this.currentLyric.play()
                    }
                }).catch(() => {
                    this.currentLyric = null
                    this.playingLyric = ''
                    this.currentLineNum = 0
                })
            },
            handleLyric({lineNum, txt}) {
                this.currentLineNum = lineNum
                //让它歌词高亮一直在屏幕中间
                if (lineNum > 5) {
                    //lyricLine是个数组，大于五行，就滚到减去前面五行的位置
                    let lineEl = this.$refs.lyricLine[lineNum - 5]
                    //让歌词滚到哪一行
                    this.$refs.lyricList.scrollToElement(lineEl, 1000)
                } else {
                    this.$refs.lyricList.scrollTo(0, 0, 1000)
                }
                this.playingLyric = txt
            },
            showPlaylist() {
                this.$refs.playlist.show()
            },
            middleTouchStart(e) {
                this.touch.initiated = true
                const touch = e.touches[0]
                this.touch.startX = touch.pageX
                this.touch.startY = touch.pageY
            },
            middleTouchMove(e) {
                if (!this.touch.initiated) {
                    return
                }
                const touch = e.touches[0]
                const deltaX = touch.pageX - this.touch.startX
                const deltaY = touch.pageY - this.touch.startY
                //在纵轴方向滚动的距离大于横轴滚动的距离就认为是纵轴滑动，什么也不做
                if (Math.abs(deltaY) > Math.abs(deltaX)) {
                    return
                }
                const left = this.currentShow === 'cd' ? 0 : -window.innerWidth
                const offsetWidth = Math.min(0, Math.max(-window.innerWidth, left + deltaX))
                //滑动的比列，思想：滑动一定比列后就吧歌词完全展示在屏幕中间
                this.touch.percent = Math.abs(offsetWidth / window.innerWidth)
                //lyricList是一个vue组件，要操作它的dom元素只能通过$el
                this.$refs.lyricList.$el.style[transform] = `translate3d(${offsetWidth}px,0,0)`
                this.$refs.lyricList.$el.style[transitionDuration] = 0
                //歌词页滑过来cd页消失 percent越大。透明度越小
                this.$refs.middleL.style.opacity = 1 - this.touch.percent
                this.$refs.middleL.style[transitionDuration] = 0
            },
            middleTouchEnd() {
                let offsetWidth
                let opacity
                if (this.currentShow === 'cd') {
                    if (this.touch.percent > 0.1) {
                        //最终停的位置
                        offsetWidth = -window.innerWidth
                        opacity = 0
                        this.currentShow = 'lyric'
                    } else {
                        offsetWidth = 0
                        opacity = 1
                    }
                } else {
                    //滑动超过10%就滑动  现在是歌词页滑动到cd页
                    if (this.touch.percent < 0.9) {
                        offsetWidth = 0
                        this.currentShow = 'cd'
                        opacity = 1
                    } else {
                        offsetWidth = -window.innerWidth
                        opacity = 0
                    }
                }
                const time = 300
                this.$refs.lyricList.$el.style[transform] = `translate3d(${offsetWidth}px,0,0)`
                this.$refs.lyricList.$el.style[transitionDuration] = `${time}ms`
                this.$refs.middleL.style.opacity = opacity
                this.$refs.middleL.style[transitionDuration] = `${time}ms`
                //this.touch.initiated = false
            },
            //重新设置当前歌曲,保证切换播放模式时当前的播放歌曲是不发生变化的
            resetCurrentIndex(list) {
                //找到当前歌曲的索引
                let index = list.findIndex((item) => {
                    return item.id === this.currentSong.id
                })
                this.setCurrentIndex(index)
            },
            //给秒数补零，默认两位小数
            _pad(num, n = 2) {
                let len = num.toString().length
                while (len < n) {
                    num = '0' + num
                    len++
                }
                return num
            },
            //计算缩放的位置
            _getPosAndScale() {
                // miniplayer的图片的宽度
                const targetWidth = 40
                //miniplayer的图片的位置
                const paddingLeft = 40
                const paddingBottom = 30
                //顶部离唱片图片的高度
                const paddingTop = 80
                //得到唱片图片的宽度
                const width = window.innerWidth * 0.8
                //初始的缩放比例
                const scale = targetWidth / width
                //初始的x、y坐标
                const x = -(window.innerWidth / 2 - paddingLeft)
                const y = window.innerHeight - paddingTop - width / 2 - paddingBottom
                return {
                    x,
                    y,
                    scale
                }
            },
            ...mapMutations({
                setFullScreen: 'SET_FULL_SCREEN',
            }),
            ...mapActions([
                'savePlayHistory'
            ])
        },
        watch: {
            currentSong(newSong, oldSong) {
                //歌曲播放列表都被删除完毕后，没有当前正在播放的歌曲了，这样就不会报错
                if(!newSong.id) {
                    return
                }
                //在切换播放模式的时候。changeMode方法会改变playlist和currentIndex就会导致监听到currentSong发生变化，但其实id是没有改变的
                if (newSong.id === oldSong.id) {
                    return
                }
                if (this.currentLyric) {
                    //一直按下一首就会出现bug，因为原来每一次都会创建一个歌词对象，没有清除是一个又创建一个
                    this.currentLyric.stop()
                    this.currentTime = 0
                    this.playingLyric = ''
                    this.currentLineNum = 0
                }

                clearTimeout(this.timer)
                this.timer = setTimeout(() => {//延迟 请求播放地址完成后再播放
                    this.$refs.audio.play()
                    this.getLyric()
                },1000)
            },
            playing(newPlaying) {
                const audio = this.$refs.audio
                this.$nextTick(() => {//延迟一下 设置播放状态结束后再执行play()或者pause()
                    newPlaying ? audio.play() : audio.pause()
                })

            }
        },
        components: {
            ProgressBar,
            ProgressCircle,
            Scroll,
            Playlist
        }
    }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
    @import "~common/stylus/variable"
    @import "~common/stylus/mixin"

    .player
        .normal-player
            position: fixed
            left: 0
            right: 0
            top: 0
            bottom: 0
            z-index: 150
            background: $color-background
            .background
                position: absolute
                left: 0
                top: 0
                width: 100%
                height: 100%
                z-index: -1
                opacity: 0.6
                filter: blur(20px)
            .top
                position: relative
                margin-bottom: 25px
                .back
                    position absolute
                    top: 0
                    left: 6px
                    z-index: 50
                    .icon-back
                        display: block
                        padding: 9px
                        font-size: $font-size-large-x
                        color: $color-theme
                        transform: rotate(-90deg)
                .title
                    width: 70%
                    margin: 0 auto
                    line-height: 40px
                    text-align: center
                    no-wrap()
                    font-size: $font-size-large
                    color: $color-text
                .subtitle
                    line-height: 20px
                    text-align: center
                    font-size: $font-size-medium
                    color: $color-text
            .middle
                position: fixed
                width: 100%
                top: 80px
                bottom: 170px
                white-space: nowrap
                font-size: 0
                .middle-l
                    display: inline-block
                    vertical-align: top
                    position: relative
                    width: 100%
                    height: 0
                    padding-top: 80%
                    .cd-wrapper
                        position: absolute
                        left: 10%
                        top: 0
                        width: 80%
                        height: 100%
                        .cd
                            width: 100%
                            height: 100%
                            box-sizing: border-box
                            border: 10px solid rgba(255, 255, 255, 0.1)
                            border-radius: 50%
                            &.play
                                animation: rotate 20s linear infinite
                            &.pause
                                animation-play-state: paused
                            .image
                                position: absolute
                                left: 0
                                top: 0
                                width: 100%
                                height: 100%
                                border-radius: 50%

                    .playing-lyric-wrapper
                        width: 80%
                        margin: 30px auto 0 auto
                        overflow: hidden
                        text-align: center
                        .playing-lyric
                            height: 20px
                            line-height: 20px
                            font-size: $font-size-medium
                            color: $color-text-l
                .middle-r
                    display: inline-block
                    vertical-align: top
                    width: 100%
                    height: 100%
                    overflow: hidden
                    .lyric-wrapper
                        width: 80%
                        margin: 0 auto
                        overflow: hidden
                        text-align: center
                        .text
                            line-height: 32px
                            color: $color-text-l
                            font-size: $font-size-medium
                            &.current
                                color: $color-text
            .bottom
                position: absolute
                bottom: 50px
                width: 100%
                .dot-wrapper
                    text-align: center
                    font-size: 0
                    .dot
                        display: inline-block
                        vertical-align: middle
                        margin: 0 4px
                        width: 8px
                        height: 8px
                        border-radius: 50%
                        background: $color-text-l
                        &.active
                            width: 20px
                            border-radius: 5px
                            background: $color-text-ll
                .progress-wrapper
                    display: flex
                    align-items: center
                    width: 80%
                    margin: 0px auto
                    padding: 10px 0
                    .time
                        color: $color-text
                        font-size: $font-size-small
                        flex: 0 0 30px
                        line-height: 30px
                        width: 30px
                        &.time-l
                            text-align: left
                        &.time-r
                            text-align: right
                    .progress-bar-wrapper
                        flex: 1
                .operators
                    display: flex
                    align-items: center
                    .icon
                        flex: 1
                        color: $color-theme
                        &.disable
                            color: $color-theme-d
                        i
                            font-size: 30px
                    .i-left
                        text-align: right
                    .i-center
                        padding: 0 20px
                        text-align: center
                        i
                            font-size: 40px
                    .i-right
                        text-align: left
                    .icon-favorite
                        color: $color-sub-theme
            &.normal-enter-active, &.normal-leave-active
                transition: all 0.4s
                .top, .bottom
                    transition: all 0.4s cubic-bezier(0.86, 0.18, 0.82, 1.32)
            &.normal-enter, &.normal-leave-to
                opacity: 0
                .top
                    transform: translate3d(0, -100px, 0)
                .bottom
                    transform: translate3d(0, 100px, 0)
        .mini-player
            display: flex
            align-items: center
            position: fixed
            left: 0
            bottom: 0
            z-index: 180
            width: 100%
            height: 60px
            background: $color-highlight-background
            &.mini-enter-active, &.mini-leave-active
                transition: all 0.4s
            &.mini-enter, &.mini-leave-to
                opacity: 0
            .icon
                flex: 0 0 40px
                width: 40px
                padding: 0 10px 0 20px
                img
                    border-radius: 50%
                    &.play
                        animation: rotate 10s linear infinite
                    &.pause
                        animation-play-state: paused
            .text
                display: flex
                flex-direction: column
                justify-content: center
                flex: 1
                line-height: 20px
                overflow: hidden
                .name
                    margin-bottom: 2px
                    no-wrap()
                    font-size: $font-size-medium
                    color: $color-text
                .desc
                    no-wrap()
                    font-size: $font-size-small
                    color: $color-text-d
            .control
                flex: 0 0 30px
                width: 30px
                padding: 0 10px
                .icon-play-mini, .icon-pause-mini, .icon-playlist
                    font-size: 30px
                    color: $color-theme-d
                .icon-mini
                    font-size: 32px
                    position: absolute
                    left: 0
                    top: 0

    @keyframes rotate
        0%
            transform: rotate(0)
        100%
            transform: rotate(360deg)
</style>