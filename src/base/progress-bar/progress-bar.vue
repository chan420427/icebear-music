<template>
    <div class="progress-bar" ref="progressBar" @click="progressClick">
        <div class="bar-inner">
            <div class="progress" ref="progress"></div>
            <div class="progress-btn-wrapper" ref="progressBtn"
                 @touchstart.prevent="progressTouchStart"
                 @touchmove.prevent="progressTouchMove"
                 @touchend="progressTouchEnd"
            >
                <div class="progress-btn" ></div>
            </div>
        </div>
    </div>
</template>

<script>
    import {prefixStyle} from "../../common/js/dom";

    const progressBtnWidth = 16 //拖动条按钮的宽度
    const transform = prefixStyle('transform')
    export default {
        props: {
            percent: {//进度条
                type: Number,
                default: 0
            }
        },
        created() {
           this.touch = {}// 为了让touch对象可以在不同的函数之间通信共享
        },
        methods: {
            progressTouchStart(e) {
                this.touch.initiated = true//设置一个标志位
                this.touch.startX = e.touches[0].pageX//点击的开始位置，e.touches[0]取到你触摸的横向坐标
                this.touch.left = this.$refs.progress.clientWidth//在点击按钮时当前的进度条偏移量
            },
            progressTouchMove(e) {
                if (!this.touch.initiated) {
                    return
                }
                const deltaX = e.touches[0].pageX - this.touch.startX//拖动的偏移量
                //Math.max是拖动的偏移量不能小于零，Math.min是拖动的偏移量不能大于进度条的长度
                const offsetWidth = Math.min(this.$refs.progressBar.clientWidth - progressBtnWidth, Math.max(0, this.touch.left + deltaX))
                this._offset(offsetWidth)
            },
            progressTouchEnd() {
                this.touch.initiated = false
                this._triggerPercent()
            },
            progressClick(e) {
                //getBoundingClientRect获取得到原来的坐标
                const rect = this.$refs.progressBar.getBoundingClientRect()
                const offsetWidth = e.pageX - rect.left
                this._offset(offsetWidth)
                // 这里当我们点击 progressBtn 的时候，e.offsetX 获取不对
                // this._offset(e.offsetX)
                this._triggerPercent()
            },
            _triggerPercent() {
                const barWidth = this.$refs.progressBar.clientWidth - progressBtnWidth
                const percent = this.$refs.progress.clientWidth / barWidth
                //将进度条拖动歌曲进度也要改变事件派发出去
                this.$emit('percentChange', percent)
            },
            //函数封装，避免大量重复代码  进度条的进度条上的按钮的偏移量
            _offset(offsetWidth) {
                this.$refs.progress.style.width = `${offsetWidth}px`
                this.$refs.progressBtn.style[transform] = `translate3d(${offsetWidth}px,0,0)`
            }
        },
        watch: {
            percent(newPercent) {
                 if(newPercent >= 0 && !this.touch.initiated) {
                     const barWidth = this.$refs.progressBar.clientWidth - progressBtnWidth
                     const offsetWidth = newPercent * barWidth
                     this._offset(offsetWidth)
                 }
            }
        }
    }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
    @import "~common/stylus/variable"

    .progress-bar
        height: 30px
        .bar-inner
            position: relative
            top: 13px
            height: 4px
            background: rgba(0, 0, 0, 0.3)
            .progress
                position: absolute
                height: 100%
                background: $color-theme
            .progress-btn-wrapper
                position: absolute
                left: -8px
                top: -13px
                width: 30px
                height: 30px
                .progress-btn
                    position: relative
                    top: 7px
                    left: 7px
                    box-sizing: border-box
                    width: 16px
                    height: 16px
                    border: 3px solid $color-text
                    border-radius: 50%
                    background: $color-theme
</style>