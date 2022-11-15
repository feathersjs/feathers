<script setup lang="ts">
import PackageCard from './PackageCard.vue'
import { PackageOutput } from './types'
import { ref, computed, onMounted } from 'vue'
import { uniqBy } from './helpers'
import { useQuery } from './useQuery'

const packageSource = 'https://ecosystem.feathershq.workers.dev/'

const makeDate = (obj: Record<string, any>, key: string) => {
  if (obj[key]) {
    obj[key] = new Date(obj[key])
  }
}
const fetchedPackages = ref<PackageOutput[]>([])
async function getPackageStats(): Promise<PackageOutput[]> {
  const packages = await fetch(packageSource).then((response) => response.json())

  packages.forEach((pkg: any) => {
    makeDate(pkg, 'lastPublish')

    pkg.id = pkg.name || `${pkg.repository?.name}/${pkg.repository?.directory}`

    const hasNPM = !isNaN(pkg.lastPublish.getTime())
    pkg.hasNPM = hasNPM
  })

  const uniq = uniqBy(packages, (pkg) => pkg.id)
  return uniq
}

const categories: CategoryOption[] = [
  { label: 'Authentication', value: ['authentication'] },
  { label: 'Authorization', value: ['authorization'] },
  { label: 'Caching', value: ['caching'] },
  { label: 'Client', value: ['client'] },
  { label: 'Database', value: ['database'] },
  { label: 'APIs', value: ['api', 'apis'] },
  { label: 'Documentation', value: ['documentation', 'docs'] },
  { label: 'Email & SMS', value: ['email', 'mail', 'mailer', 'nodemailer', 'sms'] },
  { label: 'Frontend', value: ['frontend', 'front-end'] },
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

const keyToSortBy = ref<'stars' | 'downloads' | 'lastPublish'>('lastPublish')
const showCore = ref(true)

function filterCore(pkg: PackageOutput) {
  return pkg.ownerName === 'feathersjs'
}
const coreCount = computed(() => {
  return fetchedPackages.value.filter(filterCore).length
})

const packagesAreOldIfOlderThan = 1000 * 60 * 60 * 24 * 365 * 2.9 // 3 years
const showOld = ref(false)

function filterOld(pkg: PackageOutput) {
  return pkg.lastPublish.getTime() < Date.now() - packagesAreOldIfOlderThan
}
const oldCount = computed(() => {
  return fetchedPackages.value.filter(filterOld).length
})
const countByCategory = computed(() => {
  const counts: Record<string, number> = {}
  categories.forEach((category) => {
    counts[category.label] = fetchedPackages.value.filter((pkg) => {
      return category.value.some((value) => {
        return pkg.keywords?.some((keyword) => keyword.toLowerCase().includes(value))
      })
    }).length
  })
  return counts
})

const categoriesToFilter = ref<string[]>([])

const categoriesToShow = computed(() => {
  const cats = categories.filter((category) => {
    return categoriesToFilter.value.includes(category.label)
  })
  return cats
})

type Category = string[]
type CategoryOption = {
  label: string
  value: Category
}

const search = ref('')

const filteredPackages = computed(() => {
  let pkgs = [...fetchedPackages.value]
  if (!showCore.value) {
    pkgs = pkgs.filter((pkg) => !filterCore(pkg))
  }
  if (!showOld.value) {
    pkgs = pkgs.filter((pkg) => !filterOld(pkg))
  }
  if (search.value) {
    const _search = search.value.toLowerCase()
    pkgs = pkgs.filter(
      (pkg) =>
        pkg.id.includes(_search) ||
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
  const result = filteredPackages.value.sort((a, b) => {
    if (key === 'lastPublish' && (!a.hasNPM || !b.hasNPM)) {
      return a.hasNPM ? -1 : 1
    }

    if (a[key] > b[key]) {
      return -1
    } else if (a[key] < b[key]) {
      return 1
    } else {
      return 0
    }
  })
  return result
})

onMounted(async () => {
  fetchedPackages.value = await getPackageStats()

  // sync values with URL
  useQuery(keyToSortBy, 'sort', 'string')
  useQuery(showCore, 'core', 'boolean')
  useQuery(showOld, 'old', 'boolean')
  useQuery(search, 's', 'string')
  useQuery(categoriesToFilter, 'cat', 'string[]')
})
</script>

<template>
  <div>
    <el-input v-model="search" placeholder="Search package" clearable class="mb-1" />
    <div class="flex justify-between mb-2">
      <div>
        <el-checkbox v-model="showCore" size="small" title="packages under '@feathersjs/'"
          >core ({{ coreCount }})</el-checkbox
        >
        <el-checkbox v-model="showOld" size="small" title="older than 3 years"
          >outdated ({{ oldCount }})</el-checkbox
        >
      </div>
      <el-select
        v-model="categoriesToFilter"
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
          :value="option.label"
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
        :key="pkg.id"
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
