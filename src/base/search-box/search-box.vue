<template>
    <div class="search-box">
        <i class="icon-search"></i>
        <input ref="query" class="box" v-model="query" :placeholder="placeholder">
        <i @click="clear" v-show="query" class="icon-dismiss"></i>
    </div>
</template>

<script type="text/ecmascript-6">
    import {debounce} from "../../common/js/util";

    export default {
        props: {
            placeholder: {
                type: String,
                default: '搜索歌曲、歌手'
            }
        },
        data() {
            return {
                query: ''
            }
        },
        methods: {
            clear() {
                this.query = ''
            },
            setQuery(query) {
                this.query = query
            },
            blur() {
                this.$refs.query.blur()
            }
        },
        created() {
            //将query这个搜索值曝光出去，所以通过$emit派发出去外部组件
            /*用了debounce函数，侦测到query变化时不会马上执行，也不会被多次执行，
            不管期间query变化多少次，里面的操作要200ms才执行一次*/
            this.$watch('query',debounce((newQuery) => {
                this.$emit('query',newQuery)
            },200))
        }
    }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
    @import "~common/stylus/variable"

    .search-box
        display: flex
        align-items: center
        box-sizing: border-box
        width: 100%
        padding: 0 6px
        height: 40px
        background: $color-highlight-background
        border-radius: 6px
        .icon-search
            font-size: 24px
            color: $color-background
        .box
            flex: 1
            margin: 0 5px
            line-height: 18px
            background: $color-highlight-background
            color: $color-text
            font-size: $font-size-medium
            &::placeholder
                color: $color-text-d
        .icon-dismiss
            font-size: 16px
            color: $color-background
</style>