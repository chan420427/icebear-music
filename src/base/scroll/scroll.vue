<template>
    <div ref="wrapper">
        <slot></slot>
    </div>
</template>

<script>
    import BScroll from 'better-scroll'
    export default {
        props: {
            //怎样派发 scroll 事件
            probeType: {
                type: Number,
                default: 1
            },
            // 点击列表是否派发click事件
            click: {
                type: Boolean,
                default: true
            },
            // 列表的数据
            data: {
                type: Array,
                default: null
            },
            // 当数据更新后，刷新scroll的延时。
            refreshDelay: {
                type: Number,
                default: 20
            }
        },
        mounted() {
            // 保证在DOM渲染完毕后初始化better-scroll
            setTimeout(() => {
                this._initScroll()
            }, 20)
        },
        methods: {
            _initScroll() {
                if (!this.$refs.wrapper) {
                    return
                }
                // better-scroll的初始化
                this.scroll = new BScroll(this.$refs.wrapper, {
                    probeType: this.probeType,
                    click: this.click
                })

            },
            disable() {
                this.scroll && this.scroll.disable()
            },
            //代理better-scroll的enable方法
            enable() {
                this.scroll && this.scroll.enable()
            },
            refresh() {
                this.scroll && this.scroll.refresh()
            },
        },
        watch: {
            // 监听数据的变化，延时refreshDelay时间后调用refresh方法重新计算，保证滚动效果正常
            data() {
                setTimeout(() => {
                    this.refresh()
                }, this.refreshDelay)
            }
        }
    }
</script>

<style scoped>

</style>