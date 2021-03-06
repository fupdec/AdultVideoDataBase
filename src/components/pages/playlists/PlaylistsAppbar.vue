<template>
	<div class="app-bar-container">
		<div>
      <v-menu offset-y nudge-bottom="10" :close-on-content-click="false">
        <template #activator="{ on: onMenu }">
          <v-tooltip bottom>
            <template #activator="{ on: onTooltip }">
              <v-btn v-on="{ ...onMenu, ...onTooltip }" icon tile>
                <v-icon>mdi-playlist-plus</v-icon>
              </v-btn>
            </template>
            <span>Add New Playlist</span>
          </v-tooltip>
        </template>
        <v-card width="500">
          <v-toolbar color="primary">
            <span class="headline">Add New Playlist</span>
            <v-spacer></v-spacer>
            <v-btn @click="addNewPlaylist" :disabled="!validPlaylistName" outlined>
              <v-icon left>mdi-plus</v-icon>Add</v-btn>
          </v-toolbar>
          <v-card-text>
            <v-form ref="form" v-model="validPlaylistName">
              <v-textarea v-model="playlistName" label="Names" outlined required :rules="nameRules"
                hint="Write a name on a new line to add several playlists at once" no-resize autofocus/>
              <v-alert v-model="alertDuplicatePlaylists" border="left" text dismissible class="mt-6"
                icon="mdi-plus-circle-multiple-outline" close-text="Close" type="warning"> 
                Already in the database: {{duplicatePlaylists}} </v-alert>
              <v-alert v-model="alertAddNewPlaylists" border="left" text icon="mdi-plus-circle"
                close-text="Close" type="success" dismissible class="mt-6"> 
                Added: {{newPlaylists}} </v-alert>
            </v-form>
          </v-card-text>
        </v-card>
      </v-menu>

      <v-tooltip bottom>
        <template v-slot:activator="{ on }">
          <v-btn @click="$store.state.Playlists.dialogFilterPlaylists=true" v-on="on" icon tile>
          <v-badge :value="filtersNumber!=0" :content="filtersNumber" overlap bottom style="z-index: 5;"> 
          <v-icon>mdi-filter</v-icon> </v-badge>
          </v-btn>
        </template>
        <span>Filter Playlists</span>
      </v-tooltip>
    
      <v-menu offset-y nudge-bottom="10" :close-on-content-click="false">
        <template #activator="{ on: onMenu }">
          <v-tooltip bottom>
            <template #activator="{ on: onTooltip }">
              <v-badge :value="searchStringComputed" icon="mdi-format-letter-case" overlap offset-x="23" offset-y="44">
                <v-btn v-on="{ ...onMenu, ...onTooltip }" icon tile>
                  <v-icon>mdi-magnify</v-icon>
                </v-btn>
              </v-badge>
            </template>
            <span>Search by Name</span>
          </v-tooltip>
        </template>
        <v-card width="350">
          <div class="pa-2 d-flex">
            <v-text-field :value="searchStringComputed" @input="changeSearchString($event)" autofocus
              @click:clear="clearSearch" @keypress.enter="search" outlined dense hide-details clearable class="pt-0"/>
            <v-btn @click="search" class="ml-2" color="primary" depressed height="40">
              <v-icon>mdi-magnify</v-icon>
            </v-btn>
          </div>
        </v-card>
      </v-menu>
      
      <v-tooltip bottom>
        <template v-slot:activator="{ on }">
          <v-btn @click="toggleFavorites" v-on="on" icon tile>
            <v-icon v-if="favoritesFilterExist">mdi-heart</v-icon>
            <v-icon v-else>mdi-heart-outline</v-icon>
          </v-btn>
        </template>
        <span>Toggle Favorites</span>
      </v-tooltip>

      <v-menu offset-y nudge-bottom="10" :close-on-content-click="false">
        <template #activator="{ on: onMenu }">
          <v-tooltip bottom>
            <template #activator="{ on: onTooltip }">
              <v-badge :icon="sortIcon" overlap offset-x="23" offset-y="44" class="badge-sort">
                <v-btn v-on="{ ...onMenu, ...onTooltip }" icon tile>
                  <v-icon>mdi-sort-variant</v-icon>
                  <v-icon v-if="sortDirection=='desc'" size="16" class="badge-sort-icon">mdi-arrow-up-thick</v-icon>
                  <v-icon v-else size="16" class="badge-sort-icon">mdi-arrow-down-thick</v-icon>
                </v-btn>
              </v-badge>
            </template>
            <span>Sort Playlists</span>
          </v-tooltip>
        </template>
        <v-card>
          <v-btn-toggle v-model="sortButtons" mandatory class="group-buttons-sort" color="primary">
            <v-tooltip bottom>
              <template v-slot:activator="{ on }">
                <v-btn outlined @click="toggleSortDirection" value="name" v-on="on">
                  <v-icon>mdi-alphabetical-variant</v-icon>
                  <v-icon right size="14" v-if="sortButtons=='name' && sortDirection=='desc'">
                    mdi-arrow-up-thick
                  </v-icon>
                  <v-icon right size="14" v-if="sortButtons=='name' && sortDirection=='asc'">
                    mdi-arrow-down-thick
                  </v-icon>
                </v-btn>
              </template>
              <span>Sort by Name</span>
            </v-tooltip>
            <v-tooltip bottom>
              <template v-slot:activator="{ on }">
                <v-btn outlined @click="toggleSortDirection" value="date" v-on="on">
                  <v-icon>mdi-calendar-plus</v-icon>
                  <v-icon right size="14" v-if="sortButtons=='date' && sortDirection=='desc'">
                    mdi-arrow-up-thick
                  </v-icon>
                  <v-icon right size="14" v-if="sortButtons=='date' && sortDirection=='asc'">
                    mdi-arrow-down-thick
                  </v-icon>
                </v-btn>
              </template>
              <span>Sort by Date Added</span>
            </v-tooltip>
            <v-tooltip bottom>
              <template v-slot:activator="{ on }">
                <v-btn outlined @click="toggleSortDirection" value="edit" v-on="on">
                  <v-icon>mdi-calendar-edit</v-icon>
                  <v-icon right size="14" v-if="sortButtons=='edit' && sortDirection=='desc'">
                    mdi-arrow-up-thick
                  </v-icon>
                  <v-icon right size="14" v-if="sortButtons=='edit' && sortDirection=='asc'">
                    mdi-arrow-down-thick
                  </v-icon>
                </v-btn>
              </template>
              <span>Sort by Date of Editing</span>
            </v-tooltip>
            <v-tooltip bottom>
              <template v-slot:activator="{ on }">
                <v-btn outlined @click="toggleSortDirection" value="videos" v-on="on">
                  <v-icon>mdi-video-outline</v-icon>
                  <v-icon right size="14" v-if="sortButtons=='videos' && sortDirection=='desc'">
                    mdi-arrow-up-thick
                  </v-icon>
                  <v-icon right size="14" v-if="sortButtons=='videos' && sortDirection=='asc'">
                    mdi-arrow-down-thick
                  </v-icon>
                </v-btn>
              </template>
              <span>Sort by Number of Videos</span>
            </v-tooltip>
          </v-btn-toggle>
        </v-card>
      </v-menu>

      <v-tooltip bottom>
        <template v-slot:activator="{ on }">
          <v-btn icon tile @click="selectAllPlaylists" v-on="on">
            <v-icon>mdi-select-all</v-icon>
          </v-btn>
        </template>
        <span>Select All Playlists</span>
      </v-tooltip>

      <v-tooltip bottom>
        <template v-slot:activator="{ on }">
          <v-btn @click="addNewTab" icon tile v-on="on">
            <v-icon>mdi-tab-plus</v-icon>
          </v-btn>
        </template>
        <span>Add New Tab</span>
      </v-tooltip>
	  </div>
    <DialogFilterPlaylists v-if="$store.state.Playlists.dialogFilterPlaylists"/>
	</div>
</template>


<script>
const shortid = require('shortid')

export default {
  name: 'PlaylistsAppbar',
  components: {
    DialogFilterPlaylists: () => import('@/components/pages/playlists/DialogFilterPlaylists.vue'),
  },
  mounted() {
    this.$nextTick(function () {
    })
  },
  data: () => ({
    validPlaylistName: false,
    nameRules: [
      v => !!v || 'Name is required',
      v => v.length > 1 || 'Name must be more than 1 characters',
      v => !/[\/\%"?<>{}\[\]]/g.test(v) || 'Name must not content \/%\"?<>{}\[\]',
    ],
    alertDuplicatePlaylists: false,
    alertAddNewPlaylists: false,
    duplicatePlaylists: '',
    newPlaylists: '',
    playlistName: '',
    searchString: '',
  }),
  computed: {
    filtersNumber() {
      let filters = _.cloneDeep(this.$store.state.Settings.playlistFilters)
      if (!filters.length) return 0
      filters = _.filter(filters, f => {
        if (f.type == null) return false 
        if (f.type=='number'||f.type=='string'||f.type=='date'||f.type=='select'||f.type=='array') {
          if (f.val.length) return true 
          else return false
        } 
        if (f.type == 'boolean') return true
      })
      return filters.length
    },
    sortIcon() {
      if (this.sortButtons=='name') return 'mdi-alphabetical-variant'
      if (this.sortButtons=='date') return 'mdi-calendar-plus'
      if (this.sortButtons=='edit') return 'mdi-calendar-edit'
      if (this.sortButtons=='videos') return 'mdi-video-outline'
      return 'mdi-help'
    },
    sortButtons: {
      get() { return this.$store.state.Settings.playlistSortBy },
      set(value) { this.$store.state.Settings.playlistSortBy = value },
    },
    sortDirection() { return this.$store.state.Settings.playlistSortDirection },
    searchStringComputed() {
      let filters = this.$store.state.Settings.playlistFilters
      let search = _.find(filters, {by: 'name', appbar: true})
      if (search) return search.val
      else return ''
    },
    favoritesFilterExist() {
      let favorite = {by:'favorite',cond:'yes',val:'',type:'boolean',flag:null,appbar:true,lock:false}
      let filters = this.$store.state.Settings.playlistFilters
      let index = _.findIndex(filters, favorite)
      return index > -1
    },
  },
  methods: {
    search() {
      if (this.searchString == null || this.searchString.length == 0) return
      let filters = this.$store.state.Settings.playlistFilters
      let index = _.findIndex(filters, {by: 'name', appbar: true})
      if (index > -1) filters.splice(index, 1)
      this.$store.state.Settings.playlistFilters.push({
        by: 'name', cond: 'includes', val: this.searchString, 
        type: 'string', flag: null, appbar: true, lock: false
      })
      this.$store.dispatch('filterPlaylists')
    },
    clearSearch() {
      let filters = this.$store.state.Settings.playlistFilters
      let index = _.findIndex(filters, {by: 'name', appbar: true})
      if (index > -1) filters.splice(index, 1)
      else return
      this.$store.dispatch('filterPlaylists')
    },
    toggleFavorites() {
      let filters = this.$store.state.Settings.playlistFilters
      let favorite = {by:'favorite',cond:'yes',val:'',type:'boolean',flag:null,appbar:true,lock:false}
      let index = _.findIndex(filters, favorite)
      if (index > -1) filters.splice(index, 1)
      else this.$store.state.Settings.playlistFilters.push(favorite)
      this.$store.dispatch('filterPlaylists')
    },
    changeSearchString(e) { this.searchString = e },
    addNewPlaylist() {
      let playlistsArray = this.playlistName.trim()
      playlistsArray = playlistsArray.replace(/[\/\%"?<>{}\[\]]/g, '')
      playlistsArray = playlistsArray.split(/\r?\n/)
      playlistsArray = playlistsArray.filter((el)=>(el != ""))
      playlistsArray = playlistsArray.map(s => s.trim())
      console.log(`start:::${playlistsArray.join(', ')}:::end`)
      const playlistsDb = this.$store.getters.playlists
      let dups = []
      let newPlaylists = []
      let vm = this

      async function addPlaylistInDb() {
        for (const playlist of playlistsArray) {

          // check for duplicate name of playlist
          let duplicate = playlistsDb.find(w=>(w.name.toLowerCase()===playlist.toLowerCase())).value()
          if (duplicate) {
            // console.warn(`playlist ${JSON.stringify(duplicate.name)} already in DB`)
            dups.push(duplicate.name)
            continue
          }

          vm.$store.dispatch('addPlaylist', { id: shortid.generate(), name: playlist })
          newPlaylists.push(playlist)
          // console.log(`added: playlist ${JSON.stringify(playlistInfo.name)}`)
        }
      }
      addPlaylistInDb().then(()=>{
        this.duplicatePlaylists = dups.join(", ")
        if(this.duplicatePlaylists) {
          this.alertDuplicatePlaylists = true
        } else { this.alertDuplicatePlaylists = false }
        this.newPlaylists = newPlaylists.join(", ")
        if(this.newPlaylists) {
          this.alertAddNewPlaylists = true
        } else { this.alertAddNewPlaylists = false }
        this.playlistName = '',
        this.$store.commit('updatePlaylists')
        this.$store.dispatch('filterPlaylists', true)
      })
    },
    toggleSortDirection() {
      this.$store.state.Settings.playlistSortDirection = this.sortDirection=='asc' ? 'desc':'asc'
      setTimeout(()=>{
        this.$store.dispatch('filterPlaylists')
      },200)
    },
    selectAllPlaylists() {
      this.$store.state.Playlists.selection.clearSelection()
      let selected = this.$store.state.Playlists.selection.select('.playlist-card')
      this.$store.state.Playlists.selection.keepSelection()
      this.getSelectedPlaylists(selected)
      for (let i=0;i<selected.length;++i) {
        selected[i].classList.add("selected")
      }
    },
    getSelectedPlaylists(selectedPlaylists){
      let ids = selectedPlaylists.map(item => (item.dataset.id))
      this.$store.commit('updateSelectedPlaylists', ids)
    },
    addNewTab() {
      let tabId = Date.now()
      let tab = {
        name: this.$store.getters.playlistFiltersForTabName, 
        link: `/playlists/:${tabId}?tabId=${tabId}`,
        id: tabId,
        filters: _.cloneDeep(this.$store.state.Settings.playlistFilters),
        sortBy: this.$store.state.Settings.playlistSortBy,
        sortDirection: this.$store.state.Settings.playlistSortDirection,
        page: 1,
        icon: 'format-list-bulleted'
      }
      this.$store.dispatch('addNewTab', tab)
      this.$store.state.Playlists.dialogFilterPlaylists = false
      this.$router.push(tab.link)
    },
  },
  watch: {
  },
}
</script>