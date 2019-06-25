<template>
    <transition>

    </transition>
</template>

<script>
    import {mapGetters} from 'vuex'
    import {getSingerDetail} from "../../api/singer";
    import {ERR_OK} from "../../api/config";
    import {createSong} from "../../common/js/song";

    export default {
        data() {
            return {
                songs: []
            }
        },
        computed: {
            ...mapGetters([
                'singer'
            ])
        },
        created() {
            this._getDetail()
            // console.log(this.songs)
        },
        methods: {
            _getDetail() {
                if (!this.singer.id) {
                    this.$router.push('/singer')
                    return
                }
                getSingerDetail(this.singer.id).then((res) => {
                    if (res.code === ERR_OK) {
                        this.songs = this._normalizeSongs(res.data.list)
                        console.log(this._normalizeSongs(res.data.list))
                    }
                })
            },
            //处理返回的歌手详情数据即歌手的歌的数据
            _normalizeSongs(list) {
                //定义一个返回值
                let ret = []
                //遍历list获得item即每首歌的信息
                list.forEach((item) => {
                    //只关心musicData里面的数据其他不关心，所以用解构赋值
                    let {musicData} = item

                    //createSong这个方法必须传入songid albummid两个参数
                    if (musicData.songid && musicData.albummid) {
                        ret.push(createSong(musicData))
                    }
                })
                return ret
            }

        }
    }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
    .slide-enter-active, .slide-leave-active
        transition: all 0.3s

    .slide-enter, .slide-leave-to
        transform: translate3d(100%, 0, 0)
</style>