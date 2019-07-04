<template>
    <div class="song-list">
        <ul>
            <li @click="selectItem(song,index)" class="item" v-for="(song,index) in songs" :key="index">
                <div class="rank">

                </div>
                <div class="content">
                    <h2 class="name">{{song.name}}</h2>
                    <p class="desc">{{getDesc(song)}}</p>
                </div>
            </li>
        </ul>
    </div>
</template>
<script>
    export default {
        props: {
            songs: {
                type:Array,
                default: []
            }
        },
        methods:{
            getDesc(song){
                return `${song.singer} . ${song.album}`
            },
            //给父组件派发一个点击当前歌曲的事件。传入当前歌曲和当前歌曲的索引
            selectItem(item,index) {
                this.$emit('select',item, index)
            }
        }
    }
</script>
<style lang="stylus" scoped>
    @import "~common/stylus/variable"
    @import "~common/stylus/mixin"
    .song-list
        .item
            display: flex
            align-items: center
            box-sizing: border-box
            height: 64px
            font-size: $font-size-medium
            .content
                flex: 1
                line-height: 20px
                overflow: hidden
                .name
                    no-wrap()
                    color: $color-text
                .desc
                    no-wrap()
                    margin-top: 4px
                    color: $color-text-d
</style>
