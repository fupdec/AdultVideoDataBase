<template>
  <div>
  <v-dialog v-model="$store.state.Websites.dialogEditWebsite" scrollable persistent width="1200">
    <v-card>
      <v-card-title class="edit-card-title">
        <v-img :src="imgMain" :aspect-ratio="1" max-width="84" height="84" class="mr-6"
          gradient="to right, rgba(0,0,0,.0) 70%, #3d3d3d 100%" position="top"/>
        <div>
          <div class="font-weight-light headline body-1">Editing the website</div>
          <div class="font-weight-bold headline">{{website.name}} 
            <v-tooltip bottom>
              <template v-slot:activator="{ on }">
                <v-icon right @click="copyWebsiteNameToClipboard"
                  size="16" v-on="on" color="grey">mdi-content-copy</v-icon>
              </template>
              <span>Copy name to clipboard</span>
            </v-tooltip>
          </div> 
        </div>
        <v-spacer></v-spacer>
        <div>
          <v-btn @click="close" outlined dark class="mr-6"> Cancel </v-btn>
          <v-btn @click="saveWebsiteInfo" :disabled="!valid" color="primary">
            <v-icon left>mdi-content-save-outline</v-icon>Save</v-btn>
        </div>
      </v-card-title>

      <vuescroll>
        <v-card-text>
          <v-container fluid>
            <v-row>
              <v-col cols="12" md="8" class="pt-3">
                <v-form ref="form" v-model="valid">
                  <v-row>
                    <v-col cols="12" class="py-0 d-flex justify-space-between">
                      <v-chip label outlined class="mr-4">
                        <v-icon left size="20">mdi-calendar-plus</v-icon> Added: {{dateAdded}}
                      </v-chip>
                      <v-chip label outlined>
                        <v-icon left size="20">mdi-eye</v-icon> Views: {{website.views}}
                      </v-chip>
                      <v-chip label outlined>
                        <v-icon left size="20">mdi-calendar-edit</v-icon> Last edit: {{dateEdit}}
                      </v-chip>
                    </v-col>
                    <v-col cols="12" sm="8" align="center" justify="center">
                      <div>Website name</div>
                      <div class="editable-text-field align-start">
                        <v-tooltip bottom v-if="isWebsiteNameEditEnabled">
                          <template v-slot:activator="{ on }">
                            <v-icon v-on="on" @click="isWebsiteNameEditEnabled=!isWebsiteNameEditEnabled" 
                              left class="mt-1">mdi-close</v-icon>
                          </template>
                          <span>Keep the old name</span>
                        </v-tooltip>
                        <v-tooltip bottom v-else>
                          <template v-slot:activator="{ on }">
                            <v-icon v-on="on" @click="isWebsiteNameEditEnabled=!isWebsiteNameEditEnabled" 
                              left class="mt-1">mdi-pencil</v-icon>
                          </template>
                          <span>Edit name</span>
                        </v-tooltip>
                        <v-text-field v-model="websiteName" :disabled="!isWebsiteNameEditEnabled"
                          :rules="[getNameRules]" validate-on-blur class="rename-website-field mt-0 pt-0" 
                          hint='The name may include letters, numbers, symbols: \/%"<>{}[]'/>
                      </div>
                    </v-col>
                    <v-col cols="12" sm="4" align="center" justify="center">
                      <v-btn @click="favorite=!favorite" :color="favorite?'pink':'grey'" x-large outlined block>
                        <v-icon class="mr-2" size="20">mdi-heart</v-icon> Favorite </v-btn>
                    </v-col>
                    <v-col cols="12" sm="6" align="center" justify="center">
                      <div>
                        <span>Alternate website names</span>
                        <v-tooltip bottom>
                          <template v-slot:activator="{ on, attrs }">
                            <v-icon v-bind="attrs" v-on="on" class="ml-2">
                              mdi-help-circle-outline
                            </v-icon>
                          </template>
                          <span>
                            This is useful if the website was known by a different name.
                            <br>Each name must be separated by a comma or semicolon. 
                            <br>e.g. Videos, Favorite; Best
                          </span>
                        </v-tooltip>
                      </div>
                      <div class="editable-text-field">
                        <v-text-field
                          v-model="websiteAlternateNames" 
                          :rules="[getAlternateNamesRules]" validate-on-blur
                          placeholder="e.g. Videos, Favorite; Best"
                        ></v-text-field>
                      </div>
                    </v-col>
                    <v-col cols="12" sm="6" align="center" justify="center">
                      <span>URL (Internet address)</span>
                      <v-text-field v-model="url" placeholder="e.g. https://new.videos.com/" />
                    </v-col>
                    <v-col cols="12" sm="6" align="center" justify="center">
                      <span>Website color</span> 
                      <v-chip class="ml-2" small label outlined :color="color">
                        {{website.name}}
                      </v-chip>
                      <v-color-picker v-model="color" :swatches="swatches"
                        class="color-picker-websites" show-swatches hide-canvas hide-inputs />
                    </v-col>
                    <v-col cols="12" sm="6">
                      <div class="text-center mb-2">Bookmark</div>
                      <v-textarea v-model="$store.state.Bookmarks.bookmarkText" hide-details
                        clearable auto-grow outlined placeholder="Write text here" />
                    </v-col>
                    <v-col cols="12" align="center" justify="center" class="py-0 mt-4">
                      <span>Network</span> 
                    </v-col>
                    <v-col cols="12" class="d-flex align-center">
                      <v-switch v-model="isNetwork" :label="`${isNetwork?'Yes':'No'}`"
                        hide-details inset class="mt-0 pt-0 pr-6"/>
                      <v-autocomplete
                        v-model="childWebsites" :disabled="!isNetwork" clearable
                        :items="childWebsitesList" label="Child websites" 
                        item-text="name" class="mt-0 hidden-close" outlined
                        item-value="name" no-data-text="No more child websites"
                        multiple hide-selected hide-details @blur="sort('childWebsites')"
                      >
                        <template v-slot:selection="data">
                          <v-chip
                            v-bind="data.attrs" small class="mb-1" close
                            :input-value="data.selected" label
                            @click="data.select" outlined
                            @click:close="remove(data.item)"
                            :color="getWebsite(data.item.name).color" 
                          ><span>{{ data.item.name }}</span></v-chip>
                        </template>
                        <template v-slot:item="data">
                          <template>
                            <v-list-item-avatar >
                              <img :src="getImgWebsitesUrl(data.item.id)">
                            </v-list-item-avatar>
                            <v-list-item-content>
                              <v-list-item-title>
                                <v-icon left size="16" :color="data.item.color">mdi-web</v-icon>
                                <span>{{data.item.name}}</span>
                              </v-list-item-title>
                            </v-list-item-content>
                          </template>
                        </template>
                      </v-autocomplete>
                    </v-col>
                  </v-row>
                </v-form>
              </v-col>
              <v-col cols="12" md="4" class="py-0">
                <v-col cols="12" class="mb-6 cropper-wrapper" align="center" justify="center">
                   <div> 
                      <v-tooltip bottom>
                        <template v-slot:activator="{ on }">
                          <v-icon v-on="on" left small>mdi-help-circle-outline</v-icon>
                        </template>
                        <span>Saves separate on click button "Crop/Save"</span>
                      </v-tooltip>
                      <span class="overline">Website image</span>
                    </div>
                    <v-alert v-if="size.width && size.width<500" type="info" text dense class="pa-1">
                      Recomended size 500x500px
                    </v-alert>
                  <img id="clipboard" class="img-clipboard-temporary">
                  <div class="cropper-block">
                    <Cropper :src="images.main.file" ref="main" class="cropper cropper-website" 
                      :stencil-props="{minAspectRatio: 2/2, maxAspectRatio: 3/3 }" :min-height="20"
                      :defaultSize="defaultSize" @change="updateSize"/>
                    <div v-if="size.width && size.height" class="cropper-size">
                      width: {{ size.width }}px <br> height: {{ size.height }}px</div>
                  </div>
                  <v-btn @click="pasteImageFromClipboard('main')" small
                    class="ma-2" :color="images.main.btnColor">
                    <v-icon left>mdi-clipboard-outline</v-icon> Paste
                  </v-btn>
                  <v-btn v-if="images.main.display" 
                    @click="cropImage" class="ma-2" color="primary" small
                    :loading="imgMainLoading" :disabled="imgMainLoading"
                  > <v-icon left>mdi-crop</v-icon> Crop / save
                    <template v-slot:loader>
                      <span class="custom-loader">
                        <v-icon>mdi-cached</v-icon>
                      </span>
                    </template>
                  </v-btn>
                  <v-btn v-if="displayDeleteButton" @click="dialogDeleteImage=true" color="red" icon>
                    <v-icon>mdi-delete-forever</v-icon>
                  </v-btn>
                  <file-pond ref="pond" label-idle="Drop image here or click for upload"
                    :allow-multiple="false" :files="uploadedImage" @addfile="handleFile"
                    accepted-file-types="image/*" :dropValidation="true" class="mt-2"/>
                </v-col>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
      </vuescroll>
    </v-card>
  </v-dialog>
    
    <v-dialog v-model="dialogDeleteImage" max-width="360px" persistent>
      <v-card>
        <v-card-title class="headline red--text px-4 py-1"> Delete image?
          <v-spacer></v-spacer>
          <v-icon color="red">mdi-delete-alert</v-icon>
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text class="text-center red--text pt-8">The image will be permanently deleted!</v-card-text>
        <v-card-actions class="pa-0">
          <v-btn @click="dialogDeleteImage = false" class="ma-4"> No </v-btn>
          <v-spacer/>
          <v-btn @click="deleteImage" class="red ma-4" dark> 
            <v-icon left>mdi-delete-alert</v-icon> Yes </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
const { clipboard } = require('electron')
const fs = require("fs")
const path = require("path")
const shortid = require('shortid')

import vueFilePond from 'vue-filepond'
import 'filepond/dist/filepond.min.css'
import FilePondPluginFileEncode from 'filepond-plugin-file-encode'
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type'
const FilePond = vueFilePond(FilePondPluginFileEncode, FilePondPluginFileValidateType)

import CropImage from '@/mixins/CropImage'
import vuescroll from 'vuescroll'

export default {
  name: "DialogEditWebsite",
  components: {
    FilePond,
    vuescroll,
	},
  mixins: [CropImage],
  created() {
    this.$set(this.images, 'main', this.getImageObject())
  },
  mounted () {
    this.$nextTick(function () {
      this.checkImageExist(this.getImagePath('website',''), 'main')
      this.imgMain = this.getImgUrl()
      this.websiteName = this.website.name
      this.favorite = this.website.favorite
      this.websiteAlternateNames = this.website.altNames.join(', ')
      this.url = this.website.url
      this.color = this.website.color
      if (this.website.network !== undefined) {
        this.isNetwork = this.website.network 
      }
      if (this.website.bookmark) {
        let text = this.$store.getters.bookmarks.get('websites')
                    .find({itemId:this.website.id}).value().text
        this.$store.state.Bookmarks.bookmarkText = text
      }
    })
  },
  updated() {
    this.validate()
  },
  data: () => ({
    isWebsiteNameEditEnabled: false,
    imgMain: '',
    imgMainLoading: null,
    websiteName: '',
    websiteAlternateNames: '',
    url: '',
    favorite: null,
    color: '',
    valid: false,
    isNetwork: false,
    uploadedImage: null,
    swatches: [
      ["#cc0e00"], // red
      ["#ff5722"], // orange
      ["#ff9800"], // yellow
      ["#8bc34a"], // dark green
      ["#2ac530"], // green
      ["#009688"], // dark cyan
      ["#00bcd4"], // cyan
      ["#2196f3"], // light blue
      ["#2041f7"], // blue
      ["#ae0eff"], // purple
      ["#e8004f"], // pink 
      ["#795548"], // brown
      ["#9b9b9b"], // grey
    ],
    size: {
      width: null,
      height: null,
    },
    dialogDeleteImage: false,
    isImageEdited: false,
  }),
  computed: {
    website() {
      let ids = this.$store.getters.getSelectedWebsites
      let websites = this.$store.getters.websites
      if (this.$route.path.includes('/website/:')) {
        let websiteId = this.$router.currentRoute.params.id.substring(1)
        return websites.find({ id: websiteId }).value()
      } else if (ids.length>0) {
        return websites.find({id:ids[0]}).value()
      } else {
        return websites.find('id').value()
      }
    },
    childWebsitesList() {
      return this.$store.getters.websites.filter(website=>(
        website.id != this.website.id && website.network != true
      )).sortBy('name').value()
    },
    childWebsites: {
      get(){
        return this.website.childWebsites
      },
      set(childWebsites){
        this.website.childWebsites = childWebsites
      },
    },
    pathToUserData() {
      return this.$store.getters.getPathToUserData
    },
    dateAdded() {
      let date = new Date(this.website.date)
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
    },
    dateEdit() {
      let date = new Date(this.website.edit)
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
    },
    displayDeleteButton() {
      if (this.images.main.display) {
        if (this.images.main.file.includes('blob:')) {
          return false
        } else return true
      }
    },
  },
  methods: {
    handleFile(imgType) {
      let imgBase64 = this.$refs.pond.getFiles()[0].getFileEncodeDataURL()
      this.images.main.display = true
      this.images.main.file = imgBase64
    },
    close() {
      this.$store.state.Websites.dialogEditWebsite = false
      this.$store.state.Bookmarks.bookmarkText = ''
      if (this.isImageEdited) this.$store.commit('updateWebsites', [this.website.id])
    },
    getWebsite(websiteName){
      return this.$store.getters.websites.find({name:websiteName}).value()
    },
    validate() {
      this.$refs.form.validate()
    },
    getNameRules(name) {
      let duplicate = this.$store.getters.websites.find({name:name}).value()
      if (name.length > 45) {
        return 'Name must be less than 45 characters'
      } else if (name.length < 2 && name.length > 0) {
        return 'Name must be more than 1 characters'
      } else if (name.length===0) {
        return 'Name is required'
      } else if (/[\\\/\%"?<>{}\[\]]/g.test(name)) {
        return 'Name must not content \\/\%\"<>{}\[\]'
      } else if (duplicate!==undefined && duplicate.id!==this.website.id) {
        return 'Website with that name already exists'
      } else {
        return true
      }
    },
    getAlternateNamesRules(names) {
      if (names.length > 300) {
        return 'Names must be less than 300 characters'
      } else if (/[\\\/\%"?<>{}\[\]]/g.test(names)) {
        return 'Names must not content \\/\%\"<>{}\[\]'
      } else if (this.parseStringToArray(names).filter((x,i,a)=>a.indexOf(x)===i).length
          !== this.parseStringToArray(names).length) {
        return 'Duplicates in names'
      } else if (this.parseStringToArray(names).includes(this.websiteName)) {
        return 'Names must not include a website name'
      } else {
        return true
      }
    },
    parseStringToArray(string) {
      string = string.trim()
      string = string.replace(/[\\\/\%"<>{}\[\]]/g, '')
      string = string.replace(/ +(?= )/g,'') // remove multiple spaces
      string = string.split(/[,;]/)
      string = string.filter((el)=>(el != '' && el != ' '))
      string = string.map(s => s.trim())
      return string
    },
    saveWebsiteInfo () {
      this.validate()
      if (this.websiteName) {
        this.websiteName = this.websiteName.trim()
        this.websiteName = this.websiteName.replace(/[\\\/\%"<>{}\[\]]/g, '')
      }
      if (this.isWebsiteNameEditEnabled) {
        // rename website in videos
        this.$store.getters.videos.filter({websites: [this.website.name]})
          .each(video=>{
            let index = video.websites.indexOf(this.website.name)
            if (index !== -1) video.websites.splice(index, 1, this.websiteName)
          }).write()
        // rename website in performers
        this.$store.getters.performers.filter({websites: [this.website.name]})
          .each(performer=>{
            let index = performer.websites.indexOf(this.website.name)
            if (index !== -1) performer.websites.splice(index, 1, this.websiteName)
          }).write()
        // rename website in child websites 
        this.$store.getters.websites.filter(website => {
          return website.childWebsites.includes(this.website.name)
        }).each(website => {
          let index = website.childWebsites.indexOf(this.website.name)
          if (index !== -1) website.childWebsites.splice(index, 1, this.websiteName)
        }).write()
      }
      
      let altNames = JSON.stringify(this.websiteAlternateNames)
      if (altNames !== '' && typeof altNames === 'string') {
        altNames = this.parseStringToArray(altNames)
      }

      let isNetwork = this.isNetwork
      let childWebsites
      if (isNetwork) {
        childWebsites = this.childWebsites
      } else childWebsites = []
      
      let newBookmark
      if (this.$store.state.Bookmarks.bookmarkText) {
        let bookmark = this.$store.getters.bookmarks.get('websites')
                        .find({itemId:this.website.id})
        newBookmark = true
        if (bookmark.value()) {
          bookmark.assign({ 
            text: this.$store.state.Bookmarks.bookmarkText,
            date: Date.now(),
          }).write()
        } else {
          this.$store.getters.bookmarks.get('websites').push({
            id: shortid.generate(),
            itemId: this.website.id,
            text: this.$store.state.Bookmarks.bookmarkText,
            date: Date.now(),
          }).write()
        }
      } else {
        this.$store.getters.bookmarks.get('websites')
          .remove({itemId:this.website.id}).write()
        newBookmark = false
      }

      this.$store.getters.websites
        .find({ id: this.website.id })
        .assign({
          name: this.websiteName,
          favorite: this.favorite,
          color: this.color,
          network: isNetwork,
          childWebsites: childWebsites,
          bookmark: newBookmark,
          edit: Date.now(),
          altNames: altNames,
          url: this.url,
        }).write()

      this.$store.commit('updateWebsites', [this.website.id])
      this.$store.state.Websites.dialogEditWebsite = false
      this.$store.state.Bookmarks.bookmarkText = ''
      this.$store.commit('addLog', {type:'info',text:`🌐 Website "${this.websiteName}" has been edited ✏️`})
    },
    getImgUrl() {
      let imgPath = path.join(this.pathToUserData, `/media/websites/${this.website.id}_.jpg`)
      return 'file://' + this.checkWebsiteImageExist(imgPath)
    },
    checkWebsiteImageExist(imgPath) {
      if (fs.existsSync(imgPath)) {
        return imgPath
      } else {
        return path.join(this.pathToUserData, '/img/templates/website.png')
      }
    },
    copyWebsiteNameToClipboard() {
      clipboard.writeText(this.website.name)
    },
    getImgWebsitesUrl(websiteId) {
      let imgPath = this.getImgUrl(websiteId + '_.jpg')
      return 'file://' + this.checkWebsiteImageExist(imgPath)
    },
    sort(items) {
      this[items] = this[items].sort((a, b) => a.localeCompare(b))
    },
    remove(item) { 
      const index = this.childWebsites.indexOf(item.name)
      if (index >= 0) this.childWebsites.splice(index, 1)
    },
    defaultSize({ imageSize, visibleArea }) {
			return {
				width: (visibleArea || imageSize).width,
				height: (visibleArea || imageSize).height,
			}
		},
    updateSize({ coordinates }) {
			this.size.width = Math.round(coordinates.width);
			this.size.height = Math.round(coordinates.height);
		},
    cropImage() {
      let imagePath = this.getImagePath('website','')
      this.crop(imagePath, 'main', 500)
      this.loader='imgMainLoading'
      this.imgMain = path.join('file://', this.pathToUserData, '/img/templates/website.png')
      setTimeout(() => {
        this.images.main.file = imagePath
        this.images.main.display = true
        this.imgMain = imagePath
      }, 1000)
      this.isImageEdited = true
    },
    deleteImage() {
      fs.unlink(this.getImagePath('website',''), (err) => {
        if (err) {
          this.$store.commit('addLog', {type: 'error',text: "failed to delete local image:"+err})
          // console.log("failed to delete local image:"+err)
        } else {
          // console.log('successfully deleted local image')
          this.$store.commit('addLog', {
            type:'info', 
            text:`Deleted image for website "${this.website.name}"`
          })
        }
      })
      this.images.main.file = ''
      this.images.main.display = false
      this.imgMain = path.join('file://', this.pathToUserData, '/img/templates/website.png')
      this.dialogDeleteImage = false
      this.isImageEdited = true
    },
  },
}
</script>

<style lang="less">
.color-picker-websites {
  max-width: none !important;
  .v-color-picker__controls {
    display: none;
  }
  .v-color-picker__swatches {
    max-height: none !important;
  }
}
.img-clipboard-temporary {
  display: none;
}
.edit-website-dialog-title {
  display: flex;
  flex-wrap: wrap;
}
.edit-website-dialog-title .headline {
  margin-right: 50px;
}
.cropper.cropper-website {
  max-height: 400px;
}
.alert-clipboard {
  max-width: 350px;
  text-align: center;
  display: none;
  margin-top: 10px;
  padding: 2px 8px;
  .v-alert__wrapper {
    width: 100%;
    font-size: 14px;
  }
}
</style>