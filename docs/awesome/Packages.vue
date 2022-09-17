<script setup lang="ts">
import { ref } from '@vue/reactivity'
import axios from 'axios'
import PackageCard from './PackageCard.vue'
import { PackageOutput, PackagesInput } from './types'
import { computed } from 'vue'

const makeDate = (obj: Record<string, any>, key: string) => {
  if (obj[key]) {
    obj[key] = new Date(obj[key])
  }
}

const fetchedPackages = ref<PackageOutput[]>([])

async function getPackageStats(): Promise<PackageOutput[]> {
  const cloudflare = await axios
    .get('https://ecosystem.feathershq.workers.dev/')
    .then((result) => result.data)

  cloudflare.forEach((stat: any) => makeDate(stat, 'lastPublish'))

  fetchedPackages.value = cloudflare

  return cloudflare
}

await getPackageStats()

const keyToSortBy = ref<'stars' | 'downloads' | 'lastPublish'>('lastPublish')
const showCore = ref(false)

const searchPackage = ref('')

const filteredPackages = computed(() => {
  let pkgs = [...fetchedPackages.value]

  if (!showCore.value) {
    pkgs = pkgs.filter((pkg) => pkg.ownerName !== 'feathersjs')
  }

  if (searchPackage.value) {
    pkgs = pkgs.filter((pkg) => pkg.name.includes(searchPackage.value))
  }

  return pkgs
})

const packagesToShow = computed(() => {
  const key = keyToSortBy.value
  return filteredPackages.value.sort((a, b) => {
    if (a[key] > b[key]) {
      return -1
    } else if (a[key] < b[key]) {
      return 1
    } else {
      return 0
    }
  })
})
</script>

<template>
  <div>
    <el-input v-model="searchPackage" placeholder="Search package" clearable class="mb-1" />
    <div class="flex justify-between mb-5 flex-col-reverse md:flex-row">
      <el-checkbox v-model="showCore">core</el-checkbox>
      <el-radio-group v-model="keyToSortBy">
        <el-radio label="downloads" size="small" title="Monthly npm downloads">Downloads</el-radio>
        <el-radio label="stars" size="small" title="Github stars">Stars</el-radio>
        <el-radio label="lastPublish" size="small" title="Recently published on npm">Newest</el-radio>
      </el-radio-group>
    </div>
    <div class="font-bold mb-5">{{ packagesToShow.length }}/{{ fetchedPackages.length }} packages:</div>
    <TransitionGroup name="list" tag="div">
      <package-card v-for="pkg in packagesToShow" :key="pkg.name" :stats="pkg" />
    </TransitionGroup>
  </div>
</template>

<style scoped>
.list-move, /* apply transition to moving elements */
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}

.list-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}

.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

/* ensure leaving items are taken out of layout flow so that moving
   animations can be calculated correctly. */
.list-leave-active {
  position: absolute;
}
</style>
