<template>
    <transition name="slide">
        <music-list :title="title" :bg-image="bgImage" :songs="songs" :rank="rank"></music-list>
    </transition>
</template>

<script>
    import MusicList from "../music-list/music-list";
    import {mapGetters} from 'vuex'
    import {getMusicList} from "../../api/rank";
    import {ERR_OK} from "../../api/config";
    import {createSong} from "../../common/js/song";
    import {getSongVkey} from '../../api/singer'

    export default {
        computed: {
            title() {
                return this.topList.topTitle
            },
            bgImage() {
                if (this.songs.length) {
                    return this.songs[0].image
                }
                return ''
            },
            ...mapGetters([
                'topList'
            ])
        },
        created() {
            this._getMusicList()
        },
        data() {
          return {
              songs: [],
              rank: true
          }
        },
        methods: {
            _getMusicList() {
                if (!this.topList.id) {
                    this.$router.push('/rank')
                    return
                }
                getMusicList(this.topList.id).then((res) => {
                    if (res.code === ERR_OK) {
                        this.songs = this._normalizeSongs(res.songlist)
                        this.songs.forEach((item) => {
                            getSongVkey(item.mid).then((res) => {

                                let vkey = res.data.items[0].vkey;
                                if (item.id) {
                                    item.url = `http://dl.stream.qqmusic.qq.com/C400${item.mid}.m4a?fromtag=38&guid=5931742855&vkey=${vkey}`
                                }
                            })
                        })
                    }
                })
            },
            _normalizeSongs(list) {
                let ret = []

                list.forEach((item) => {
                    const musicData = item.data
                    if (musicData.songid && musicData.albummid) {
                        ret.push(createSong(musicData))
                    }


                })

                return ret

            }
        },
        components: {
            MusicList
        }
    }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
    .slide-enter-active, .slide-leave-active
        transition: all 0.3s ease

    .slide-enter, .slide-leave-to
        transform: translate3d(100%, 0, 0)
</style>