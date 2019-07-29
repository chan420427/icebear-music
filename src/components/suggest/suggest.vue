<template>
    <scroll class="suggest"
            :data="result"
            :pullup="pullup"
            @scrollToEnd="searchMore"
            ref="suggest"
    >
        <ul class="suggest-list">
            <li @click="selectItem(item)" class="suggest-item" v-for="item in result">
                <div class="icon">
                    <i :class="getIconCls(item)"></i>
                </div>
                <div class="name">
                    <p class="text" v-html="getDisplayName(item)"></p>
                </div>
            </li>
            <loading v-show="hasMore" title=""></loading>
        </ul>
    </scroll>
</template>

<script type="text/ecmascript-6">
    import {search} from "../../api/search";
    import {ERR_OK} from "../../api/config";
    import {createSong} from "../../common/js/song";
    import {getSongVkey} from "../../api/singer";
    import Scroll from '../../base/scroll/scroll'
    import Loading from '../../base/loading/loading'
    import Singer from '../../common/js/singer'
    import {mapMutations,mapActions} from 'vuex'

    const TYPE_SINGER = 'singer'
    const perpage = 20//每一页返回的个数

    export default {
        props:{
            query: {
                type: String,
                 default: ''
            },
            showSinger: {
                type: Boolean,
                default: true

            }

        },
        data() {
          return {
              page: 1,
              result: [],
              pullup: true,
              hasMore: true,//判断搜索回来的结果有没有加载完的一个标记位
              searchList: []

          }
        },
        methods: {
            //请求服务端，抓取检索的数据，渲染到列表里
            search() {
                //this.page = 1 this.$refs.suggest.scrollTo(0,0) query发生变化时，就重置，展示第一页，并滚动到顶部
                this.page = 1
                this.hasMore = true
                this.$refs.suggest.scrollTo(0,0)

                search(this.query, this.page, this.showSinger,perpage).then((res) => {

                    if (res.code === ERR_OK) {
                        this.result = this._genResult(res.data)
                        this._checkMore(res.data)
                    }


                })
            },
            searchMore() {
                if(!this.hasMore) {
                    return
                }
                this.page++
                search(this.query, this.page, this.showSinger,perpage).then((res) => {
                    if (res.code === ERR_OK) {
                        this.result =this.result.concat(this._genResult(res.data))
                        this._checkMore(res.data)
                    }
                })
            },
            getIconCls(item) {
                if(item.type === TYPE_SINGER) {
                    return 'icon-mine'
                } else {
                    return 'icon-music'
                }

            },
            getDisplayName(item) {
              if(item.type === TYPE_SINGER) {
                  return item.singername
              }  else {
                  return `${item.name}-${item.singer}`
              }
            },
            selectItem(item) {
                if(item.type === TYPE_SINGER) {
                    const singer = new Singer({
                        id: item.singermid,
                        name: item.singername
                    })
                    this.$router.push({
                        path: `/search/${singer.id}`
                    })
                    this.setSinger(singer)
                }else {
                    this.insertSong(item)
                }
            },
            _checkMore(data) {
                const song = data.song

                if(!song.list.length || (song.curnum + song.curpage * perpage) >= song.totalnum) {
                    this.hasMore = false
                }
            },
            _genResult(data) {
                let ret = []

                if (data.zhida && data.zhida.singerid) {
                    ret.push({...data.zhida, ...{type: TYPE_SINGER}})
                }
                if (data.song) {
                    ret = ret.concat(this._normalizeSongs(data.song.list))

                    ret.forEach((item) => {
                        if (item.type !== TYPE_SINGER){
                            getSongVkey(item.mid).then((res) => {

                                let vkey = res.data.items[0].vkey;
                                if (item.id) {
                                    item.url = `http://dl.stream.qqmusic.qq.com/C400${item.mid}.m4a?fromtag=38&guid=5931742855&vkey=${vkey}`
                                }
                            })
                        }
                    })
                }

                return ret
            },
            _normalizeSongs(list) {
                let ret = []

                list.forEach((musicData) => {
                    if (musicData.songid && musicData.albummid) {
                        ret.push(createSong(musicData))
                    }

                })


                return ret
            },
            ...mapMutations({
                setSinger: 'SET_SINGER'
            }),
            ...mapActions([
                'insertSong'
            ])
        },
        watch: {
            query(){
                this.search()
            }
        },
        components: {
            Scroll,
            Loading
        }
    }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
    @import "~common/stylus/variable"
    @import "~common/stylus/mixin"

    .suggest
        height: 100%
        overflow: hidden
        .suggest-list
            padding: 0 30px
            .suggest-item
                display: flex
                align-items: center
                padding-bottom: 20px
            .icon
                flex: 0 0 30px
                width: 30px
                [class^="icon-"]
                    font-size: 14px
                    color: $color-text-d
            .name
                flex: 1
                font-size: $font-size-medium
                color: $color-text-d
                overflow: hidden
                .text
                    no-wrap()
        .no-result-wrapper
            position: absolute
            width: 100%
            top: 50%
            transform: translateY(-50%)
</style>