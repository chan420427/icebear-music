<template>
    <div class="singer">
        <list-view @select="selectSinger" :data="singers"></list-view>
        <router-view></router-view>
    </div>
</template>

<script type="text/ecmascript-6">
    import {getSingerList} from "../../api/singer";
    import {ERR_OK} from "../../api/config";
    import Singer from "../../common/js/singer"
    import ListView from '../../base/listview/listview'
    import {mapMutations} from 'vuex'

    const HOT_SINGER_LEN = 10
    const HOT_NAME = '热门'

    export default {
        data() {
            return {
                singers: []
            }
        },
        created() {
            this._getSingerList()
        },
        methods: {
            selectSinger(singer) {
                this.$router.push({
                    path: `/singer/${singer.id}`
                })
                this.setSinger(singer)
            },
            _getSingerList() {
                getSingerList().then((res => {
                    if (res.code === ERR_OK) {
                        this.singers = this._normalizeSinger(res.data.list)
                        console.log(this.singers)
                    }
                }))
            },
            _normalizeSinger(list) {
                //声明一个歌手集合
                let map = {
                    hot: {
                        title: HOT_NAME,
                        items: []
                    }
                }
                //循环歌手列表，取出前十条的为热门的歌手
                list.forEach((item, index) => {
                    if (index < HOT_SINGER_LEN) {
                        //由constructor构造器Singer对象，直接引用singer.js
                        map.hot.items.push(new Singer({
                            name: item.Fsinger_name,
                            id: item.Fsinger_mid
                        }))
                    }
                    //给list以字母分类
                    const key = item.Findex
                    //没有当前字母的就创建
                    if (!map[key]) {
                        map[key] = {
                            title: key,
                            items: []
                        }
                    }
                    //将相同的字母的归类在一起
                    map[key].items.push(new Singer({
                        name: item.Fsinger_name,
                        id: item.Fsinger_mid
                    }))
                })
                // 为了得到有序列表，我们需要处理 map
                let ret = []
                let hot = []
                for (let key in map) {
                    let val = map[key]

                    if (val.title.match(/[a-zA-Z]/)) {
                        ret.push(val)
                    } else if (val.title === HOT_NAME) {
                        hot.push(val)
                    }
                }
                //将字母升序排序好
                ret.sort((a, b) => {
                    return a.title.charCodeAt(0) - b.title.charCodeAt(0)
                })
                return hot.concat(ret)
            },
            ...mapMutations({
                setSinger: 'SET_SINGER'
            })
        },
        components: {
            ListView
        }
    }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
    .singer
        position: fixed
        top: 88px
        bottom: 0
        width: 100%
</style>