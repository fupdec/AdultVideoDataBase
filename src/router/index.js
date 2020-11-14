import Vue from 'vue'
import VueRouter from 'vue-router'
const Home = () => import('../views/HomePage.vue')
const HomeAppbar = () => import('../components/pages/home/HomeAppbar.vue')
const Video = () => import('../views/VideoPage.vue')
const VideoAppbar = () => import('../components/pages/video/VideoAppbar.vue')
const Videos = () => import('../views/VideosPage.vue')
const VideosAppbar = () => import('../components/pages/videos/VideosAppbar.vue')
const Performer = () => import('../views/PerformerPage.vue')
const PerformerAppbar = () => import('../components/pages/performer/PerformerAppbar.vue')
const Performers = () => import('../views/PerformersPage.vue')
const PerformersAppbar = () => import('../components/pages/performers/PerformersAppbar.vue')
const Tag = () => import('../views/TagPage.vue')
const TagAppbar = () => import('../components/pages/tag/TagAppbar.vue')
const Tags = () => import('../views/TagsPage.vue')
const TagsAppbar = () => import('../components/pages/tags/TagsAppbar.vue')
const Website = () => import('../views/WebsitePage.vue')
const WebsiteAppbar = () => import('../components/pages/website/WebsiteAppbar.vue')
const Websites = () => import('../views/WebsitesPage.vue')
const WebsitesAppbar = () => import('../components/pages/websites/WebsitesAppbar.vue')
const Settings = () => import('../views/SettingsPage.vue')
const SettingsAppbar = () => import('../components/pages/settings/SettingsAppbar.vue')

Vue.use(VueRouter)

  const routes = [
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/home',
    name: 'Home',
    components: {
      default: Home,
      appbar: HomeAppbar,
    }
  },
  {
    path: '/video/:id',
    name: 'Video',
    components: {
      default: Video,
      appbar: VideoAppbar,
    }
  },
  {
    path: '/videos/:id?',
    name: 'Videos',
    components: {
      default: Videos,
      appbar: VideosAppbar,
    }
  },
  {
    path: '/performer/:id',
    name: 'Performer',
    components: {
      default: Performer,
      appbar: PerformerAppbar,
    }
  },
  {
    path: '/performers/:id?',
    name: 'Performers',
    components: {
      default: Performers,
      appbar: PerformersAppbar,
    }
  },
  {
    path: '/tag/:id',
    name: 'Tag',
    components: {
      default: Tag,
      appbar: TagAppbar,
    }
  },
  {
    path: '/tags/:id?',
    name: 'Tags',
    components: {
      default: Tags,
      appbar: TagsAppbar,
    }
  },
  {
    path: '/website/:id',
    name: 'Website',
    components: {
      default: Website,
      appbar: WebsiteAppbar,
    }
  },
  {
    path: '/websites/:id?',
    name: 'Websites',
    components: {
      default: Websites,
      appbar: WebsitesAppbar,
    }
  },
  {
    path: '/settings',
    name: 'Settings',
    components: {
      default: Settings,
      appbar: SettingsAppbar,
    }
  },
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router