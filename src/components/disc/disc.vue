<template>
    <transition name="slide">
        <music-list :title="title" :bg-image="bgImage" :songs="songs"></music-list>
    </transition>
</template>

<script>
    import MusicList from "../music-list/music-list";
    import {getSongList} from "../../api/recommend";
    import {ERR_OK} from "../../api/config";
    import {mapGetters} from 'vuex'
    import {createSong} from "../../common/js/song";
    import {getSongVkey} from "../../api/singer";

    export default {
        computed:{
            title() {
                 return this.disc.dissname
            },
            bgImage() {
                return this.disc.imgurl
            },
            ...mapGetters([
                'disc'
            ])
    },
        data() {
          return {
              songs: []
          }
        },
        created() {
            this._getSongList()
        },
        methods: {
            _getSongList() {
                if (!this.disc.dissid) {
                    this.$router.push('/recommend')
                    return
                }

                getSongList(this.disc.dissid).then((res) => {
                    if (res.code === ERR_OK) {

                        this.songs = this._normalizeSongs(res.cdlist[0].songlist)


                    }
                })
            },
            _normalizeSongs(list) {
                let ret = []
                list.forEach((musicData) => {
                    getSongVkey(musicData.songmid).then((res) => {

                        const vkey = res.data.items[0].vkey;
                        //createSong这个方法必须传入songid albummid两个参数
                        if (musicData.songid && musicData.albummid) {
                            ret.push(createSong(musicData,vkey))
                        }
                    })

                })
                return ret
            }
        },
        components: {MusicList}
    }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
    .slide-enter-active, .slide-leave-active
        transition: all 0.3s

    .slide-enter, .slide-leave-to
        transform: translate3d(100%, 0, 0)
</style>