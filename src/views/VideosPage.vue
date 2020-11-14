<template>
  <vuescroll ref="mainContainer" @handle-scroll="handleScroll">

    <div class="headline text-h3 text-center my-6">Videos</div>

    <!-- TODO: TREE VIEW (FOLDERS) FOR VIDEOS LIKE IT IN EAZYFLIXPIX -->
    <v-container fluid v-if="!$store.state.Videos.filteredEmpty" class="pagination-container my-6">
      <v-overflow-btn 
        :items="videosPerPagePreset" dense height="36" solo
        @change="changeItemsPerPage()" disable-lookup hide-no-data
        v-model="videosPerPage" hint="items per page" persistent-hint
        class="items-per-page-dropdown"
      ></v-overflow-btn>
      <v-spacer></v-spacer>
      <v-pagination 
        v-model="videosCurrentPage"
        :length="videosPagesSum"
        :total-visible="getNumberOfPagesLimit"
      ></v-pagination>
      <v-spacer></v-spacer>
      <v-overflow-btn v-if="videosPagesSum > 5"
        v-model="videosCurrentPage" :items="pages" dense height="36" solo
        class="items-per-page-dropdown jump-to-page-menu"
        disable-lookup hint="jump to page" persistent-hint hide-no-data
        :menu-props="{ 
          auto:true, 
          contentClass:'jump-to-page-menu',
          nudgeBottom: -110,
          origin:'center center', 
          transition:'scale-transition'
        }"
      ></v-overflow-btn>
      <div v-else style="min-width:80px;"></div>
    </v-container>
    
    <div v-if="$store.state.Videos.filteredEmpty" class="text-center"> 
      <div><v-icon size="100" class="ma-10">mdi-close</v-icon></div>
      There are no matching videos for the selected filters.
    </div>

    <v-container fluid class="videos-grid" :class="cardSize">
      <!-- Video Blocks parsing -->
      <VideoCard v-for="(video) in videosOnPage" :key="video.id" :video="video"/>
    </v-container>

    <v-pagination
      v-if="!$store.state.Videos.filteredEmpty" class="my-10"
      v-model="videosCurrentPage"
      :length="videosPagesSum"
      :total-visible="getNumberOfPagesLimit"
    ></v-pagination>
    
    <v-btn v-if="$store.getters.getSelectedVideos.length>1"
      @click="$store.state.Videos.dialogEditVideoInfo=true"
      fixed fab color="primary" class="add-tag-btn-floating" 
    ><v-icon>mdi-movie-edit-outline</v-icon>
    </v-btn>
    
    <div v-show="$store.getters.navigationSide=='0'" class="py-6"></div>

    <v-btn @click="scrollToTop" v-show="isScrollToTopVisible" 
      class="scroll-to-top" fixed fab color="primary">
      <v-icon>mdi-chevron-up</v-icon>
    </v-btn>
  </vuescroll>
</template>


<script>
import VideosGrid from '@/mixins/VideosGrid'
import vuescroll from 'vuescroll'

export default {
  name: 'Videos',
  components: {
    vuescroll,
  },
  mixins: [VideosGrid],
  mounted() {
    this.$nextTick(function () {
      this.$store.dispatch('filterVideos')
    })
  },
  data: () => ({
    isScrollToTopVisible: false,
  }),
  computed: {
    cardSize() {
      return `card-size-${this.$store.state.Settings.videoCardSize}`
    },
  },
  methods: {
    scrollToTop() {
      this.$refs.mainContainer.scrollTo({y: 0},500,"easeInQuad")
    },
    handleScroll(vertical) {
      if (vertical.scrollTop > 150) {
        this.isScrollToTopVisible = true
      } else this.isScrollToTopVisible = false
    },
  },
  watch: {
    $route(newRoute) {
      if (!this.$route.path.includes('/videos/:')) return
      let id = newRoute.params.id.replace(':', '')
      let tab = this.$store.getters.tabsDb.find({id}).value()
      this.$store.state.Videos.filters =  _.cloneDeep(tab.filters)
      this.$store.dispatch('filterVideos')
    },
  }
}
</script>