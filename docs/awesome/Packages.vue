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
const showCore = ref(true)
const showOld = ref(true)

const packagesAreOldIfOlderThan = 1000 * 60 * 60 * 24 * 365 * 2.9 // 3 years

function filterCore(pkg: PackageOutput) {
  return pkg.ownerName !== 'feathersjs'
}

function filterOld(pkg: PackageOutput) {
  return pkg.lastPublish.getTime() > Date.now() - packagesAreOldIfOlderThan
}

const coreCount = computed(() => {
  return fetchedPackages.value.filter((pkg) => !filterCore(pkg)).length
})

const oldCount = computed(() => {
  return fetchedPackages.value.filter((pkg) => !filterOld(pkg)).length
})

const categoriesToShow = ref<CategoryOption[]>([])

type Category = string[]

type CategoryOption = {
  label: string
  value: Category
}

const categories: CategoryOption[] = [
  { label: 'Authentication', value: ['authentication'] },
  { label: 'Authorization', value: ['authorization'] },
  { label: 'Caching', value: ['caching'] },
  { label: 'Database', value: ['database'] },
  { label: 'APIs', value: ['api', 'apis'] },
  { label: 'Documentation', value: ['documentation', 'docs'] },
  { label: 'Email & SMS', value: ['email', 'mail', 'mailer', 'nodemailer', 'sms'] },
  { label: 'Google', value: ['google'] },
  { label: 'Hooks', value: ['hook', 'hooks'] },
  { label: 'Images', value: ['image', 'images'] },
  { label: 'Payments', value: ['payment', 'payments'] },
  { label: 'Scaling', value: ['scale', 'scaling'] },
  { label: 'Search', value: ['search'] },
  { label: 'Social Media', value: ['social media', 'social-media', 'socialmedia'] },
  { label: 'Testing', value: ['test', 'testing'] },
  { label: 'Logging', value: ['log', 'logs', 'logging'] },
  { label: 'Transports', value: ['transport', 'transports'] },
  { label: 'Utilities', value: ['utility', 'utilities'] },
  { label: 'Validation', value: ['validation', 'validator', 'validators'] }
]

const countByCategory = computed(() => {
  const counts: Record<string, number> = {}

  categories.forEach((category) => {
    counts[category.label] = fetchedPackages.value.filter((pkg) => {
      return category.value.some((value) => {
        return pkg.keywords?.some((keyword) => keyword.toLowerCase().includes(value))
      })
    }).length
  })

  console.log(counts)

  return counts
})

// const countByCategory = computed(() => {
//   const counts: Record<string, number> = {}

//   categories.forEach((category) => {
//     counts[category.toLowerCase()] = 0
//   })

//   fetchedPackages.value.forEach((pkg) => {
//     if (pkg.keywords) {
//       pkg.keywords.forEach((keyword) => {
//         if (!categories.some((category) => category.toLowerCase() === keyword.toLowerCase())) {
//           return
//         }

//         counts[keyword]++
//       })
//     }
//   })

//   return counts
// })

const search = ref('')

const filteredPackages = computed(() => {
  let pkgs = [...fetchedPackages.value]

  if (!showCore.value) {
    pkgs = pkgs.filter(filterCore)
  }

  if (!showOld.value) {
    pkgs = pkgs.filter(filterOld)
  }

  if (search.value) {
    const _search = search.value.toLowerCase()
    pkgs = pkgs.filter(
      (pkg) =>
        pkg.name.includes(_search) ||
        pkg.description?.includes(_search) ||
        pkg.keywords?.some((keyword) => keyword.includes(_search))
    )
  }

  if (categoriesToShow.value.length) {
    pkgs = pkgs.filter((pkg) => {
      return pkg.keywords?.some((keyword) => {
        return categoriesToShow.value.some((category) => {
          return category.value.some((value) => {
            return keyword.toLowerCase().includes(value)
          })
        })
      })
    })
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
    <el-input v-model="search" placeholder="Search package" clearable class="mb-1" />
    <div class="flex justify-between mb-2">
      <div>
        <el-checkbox v-model="showCore" size="small">core ({{ coreCount }})</el-checkbox>
        <el-checkbox v-model="showOld" size="small">outdated ({{ oldCount }})</el-checkbox>
      </div>
      <el-select
        v-model="categoriesToShow"
        multiple
        collapse-tags
        collapse-tags-tooltip
        placeholder="Filter by category"
        style="width: 240px"
        value-key="label"
        clearable
      >
        <el-option
          v-for="option in categories"
          :key="option.label"
          :label="option.label"
          :value="option"
          :title="option.value.join(', ')"
        >
          {{ option.label }} ({{ countByCategory[option.label] }})
        </el-option>
      </el-select>
    </div>
    <div class="flex justify-end mb-3">
      <el-radio-group v-model="keyToSortBy">
        <el-radio label="downloads" size="small" title="Monthly npm downloads">Downloads</el-radio>
        <el-radio label="stars" size="small" title="Github stars">Stars</el-radio>
        <el-radio label="lastPublish" size="small" title="Recently published on npm">Newest</el-radio>
      </el-radio-group>
    </div>

    <div class="font-bold mb-5">{{ packagesToShow.length }}/{{ fetchedPackages.length }} packages:</div>
    <TransitionGroup name="list" tag="div">
      <package-card
        v-for="pkg in packagesToShow"
        :key="pkg.name"
        :stats="pkg"
        :is-old="pkg.lastPublish.getTime() < Date.now() - packagesAreOldIfOlderThan"
      />
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
