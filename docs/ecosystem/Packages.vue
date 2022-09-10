<script setup lang="ts">
import { ref } from '@vue/reactivity'
import axios from 'axios'
import PackageCard from './PackageCard.vue'
import { PackageOutput, PackagesInput } from './types'
import { ElRadioGroup, ElRadioButton } from 'element-plus'
import { computed } from '@vue/runtime-core'

const packages: PackagesInput = {
  'feathers-stripe': {
    npm: 'feathers-stripe',
    repo: 'feathersjs-ecosystem/feathers-stripe'
  },
  '@feathersjs/feathers': {
    npm: '@feathersjs/feathers',
    repo: 'feathersjs/feathers'
  },
  'feathers-casl': {
    npm: 'feathers-casl',
    repo: 'fratzinger/feathers-casl'
  },
  'feathers-sequelize': {
    npm: 'feathers-sequelize',
    repo: 'feathersjs-ecosystem/feathers-sequelize'
  },
  'feathers-vuex': {
    npm: 'feathers-vuex',
    repo: 'feathersjs-ecosystem/feathers-vuex'
  },
  'feathers-pinia': {
    npm: 'feathers-pinia',
    repo: 'marshallswain/feathers-pinia'
  },
  'feathers-knex': {
    npm: 'feathers-knex',
    repo: 'feathersjs-ecosystem/feathers-knex'
  },
  'feathers-mongoose': {
    npm: 'feathers-mongoose',
    repo: 'feathersjs-ecosystem/feathers-mongoose'
  },
  'feathers-mongodb': {
    npm: 'feathers-mongodb',
    repo: 'feathersjs-ecosystem/feathers-mongodb'
  },
  'feathers-objection': {
    npm: 'feathers-objection',
    repo: 'feathersjs-ecosystem/feathers-objection'
  },
  'feathers-memory': {
    npm: 'feathers-memory',
    repo: 'feathersjs-ecosystem/feathers-memory'
  },
  'feathers-mailer': {
    npm: 'feathers-mailer',
    repo: 'feathersjs-ecosystem/feathers-mailer'
  },
  'feathers-blob': {
    npm: 'feathers-blob',
    repo: 'feathersjs-ecosystem/feathers-blob'
  },
  'feathers-hooks-common': {
    npm: 'feathers-hooks-common',
    repo: 'feathersjs-ecosystem/feathers-hooks-common'
  },
  'feathers-trigger': {
    npm: 'feathers-trigger',
    repo: 'fratzinger/feathers-trigger'
  },
  'feathers-graph-populate': {
    npm: 'feathers-graph-populate',
    repo: 'marshallswain/feathers-graph-populate'
  },
  'feathers-fletching': {
    npm: 'feathers-fletching',
    repo: 'daddywarbucks/feathers-fletching'
  },
  'feathers-permissions': {
    npm: 'feathers-permissions',
    repo: 'feathersjs-ecosystem/feathers-permissions'
  },
  'feathers-sync': {
    npm: 'feathers-sync',
    repo: 'feathersjs-ecosystem/feathers-sync'
  },
  'feathers-batch': {
    npm: 'feathers-batch',
    repo: 'feathersjs-ecosystem/feathers-batch'
  },
  'feathers-algolia': {
    npm: 'feathers-algolia',
    repo: 'johnayoung/feathers-algolia'
  },
  'feathers-splunk': {
    npm: 'feathers-splunk',
    repo: 'senthiljruby/feathers-splunk'
  }
}

const getGHApiUrl = function (repo) {
  return `https://api.github.com/repos/${repo}`
}

const getGHLink = function (repo) {
  return `https://github.com/${repo}`
}

const getPackageLink = function (npm) {
  return `https://www.npmjs.com/package/${npm}`
}

const getNPMApiUrl = function (npm) {
  npm = npm.replace('@', '%40').replace('/', '%2F')
  return `https://api.npms.io/v2/package/${npm}`
}

async function getPackageStats(): Promise<PackageOutput[]> {
  const pkgs = Object.values(packages)

  const cloudflare = await axios
    .get('https://ecosystem.feathershq.workers.dev/')
    .then((result) => result.data)

  cloudflare.forEach((stat: any) => makeDate(stat, 'lastPublish'))

  console.log(cloudflare)

  const result = await Promise.all(
    pkgs.map(async (pkg) => {
      const ghLink = getGHLink(pkg.repo)
      const npmLink = getPackageLink(pkg.npm)

      const ghApiUrl = getGHApiUrl(pkg.repo)
      const npmApiUrl = getNPMApiUrl(pkg.npm)

      const [githubResult, npmResult] = await Promise.all([
        axios.get(ghApiUrl).then((result) => result.data),
        axios.get(npmApiUrl).then((result) => result.data)
      ])

      const npmVersion = npmResult.collected.metadata.version
      const npmLicense = npmResult.collected.metadata.license
      const npmDescription = npmResult.collected.metadata.description
      const npmKeywords = npmResult.collected.metadata.keywords
      const npmMonthlyDownloads = npmResult.collected.npm.downloads[2].count
      const npmLastPublish = new Date(npmResult.collected.metadata.date)

      const githubStars = githubResult.stargazers_count
      const githubIssues = githubResult.open_issues_count
      const githubCreatedAt = new Date(githubResult.created_at)
      const githubOwnerName = githubResult.owner.login
      const githubOwnerAvatar = githubResult.owner.avatar_url

      return {
        name: pkg.repo,
        description: npmDescription,
        keywords: npmKeywords,
        license: npmLicense,
        version: npmVersion,
        downloads: npmMonthlyDownloads,
        lastPublish: npmLastPublish,
        lastPublishUnix: npmLastPublish.getTime(),
        stars: githubStars,
        issues: githubIssues,
        createdAt: githubCreatedAt,
        ownerName: githubOwnerName,
        ownerAvatar: githubOwnerAvatar,
        ghLink,
        npmLink
      }
    })
  )

  return cloudflare
}

const keyToSortBy = ref<'stars' | 'downloads' | 'lastPublish'>('downloads')

const fetchedPackages = ref<PackageOutput[]>([])

const sortedPackages = computed(() => {
  const key = keyToSortBy.value
  return fetchedPackages.value.sort((a, b) => {
    if (a[key] > b[key]) {
      return -1
    } else if (a[key] < b[key]) {
      return 1
    } else {
      return 0
    }
  })
})

const makeDate = (obj: Record<string, any>, key: string) => {
  if (obj[key]) {
    obj[key] = new Date(obj[key])
  }
}

getPackageStats().then((result) => {
  fetchedPackages.value = result
})

getPackageStats()
</script>

<template>
  <div>
    <el-radio-group v-model="keyToSortBy">
      <el-radio-button label="downloads">Downloads</el-radio-button>
      <el-radio-button label="stars">Stars</el-radio-button>
      <el-radio-button label="lastPublish">Newest</el-radio-button>
    </el-radio-group>
    <package-card v-for="pkg in sortedPackages" :key="pkg.name" :stats="pkg" />
  </div>
</template>

<style scoped></style>
