<script setup lang="ts">
const $emit = defineEmits(['close'])
const route = useRoute()

// Determine which menu to load based on the current route
function getMenuName(path: string) {
  if (path.startsWith('/guides')) return 'guides'
  if (path.startsWith('/api')) return 'api'
  if (path.startsWith('/cookbook')) return 'cookbook'
  if (path.startsWith('/help')) return 'help'
  return 'guides' // default
}

const menuName = computed(() => getMenuName(route.path))

// Load all menus at once to avoid hydration issues
const { data: guidesMenu } = await useAsyncData('menu-guides', () =>
  queryCollection('menus').where('stem', '==', 'menus/guides').first()
)
const { data: apiMenu } = await useAsyncData('menu-api', () =>
  queryCollection('menus').where('stem', '==', 'menus/api').first()
)
const { data: cookbookMenu } = await useAsyncData('menu-cookbook', () =>
  queryCollection('menus').where('stem', '==', 'menus/cookbook').first()
)
const { data: helpMenu } = await useAsyncData('menu-help', () =>
  queryCollection('menus').where('stem', '==', 'menus/help').first()
)

const currentMenu = computed(() => {
  switch (menuName.value) {
    case 'api':
      return apiMenu.value
    case 'cookbook':
      return cookbookMenu.value
    case 'help':
      return helpMenu.value
    default:
      return guidesMenu.value
  }
})
</script>

<template>
  <div class="relative menu w-60 bg-base-200 text-base-content h-full overflow-y-auto">
    <div class="relative z-10">
      <Flex justify-end class="absolute right-2 lg:hidden z-20 top-4">
        <Button square ghost @click="$emit('close')">
          <Icon name="feather:x" size="24" />
        </Button>
      </Flex>

      <Flex col class="pb-12 pl-2">
        <div class="px-2 pb-4 pt-2">
          <DocsSearch />
        </div>

        <template v-for="link in currentMenu?.items" :key="link.path">
          <template v-if="link.children">
            <SidebarMenuSection :section="link" />
          </template>
          <template v-else>
            <MenuItem class="ml-2">
              <NuxtLink :to="link.path" exact-active-class="menu-active" class="flex flex-row items-center">
                <Icon v-if="link.icon" :name="link.icon" class="w-5 h-5 mr-1" />
                <Text class="grow">
                  {{ link.title }}
                </Text>
                <Badge v-if="link.meta?.new" sm accent class="ml-2"> new </Badge>
              </NuxtLink>
            </MenuItem>
          </template>
        </template>
      </Flex>
    </div>
  </div>
</template>
