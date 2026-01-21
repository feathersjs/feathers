<script setup lang="ts">
const { openSearch } = useGlobalSearch()
</script>

<template>
  <Flex col class="relative">
    <Logo class="sm:hidden mt-3 max-w-8/12 pl-4" />

    <Navbar class="pt-0 sm:pt-3">
      <NavbarStart>
        <Logo class="hidden sm:block" />
      </NavbarStart>

      <NavbarCenter>
        <Flex row items-center class="gap-6 rounded-box bg-base-100/10 p-3 sm:px-12">
          <NuxtLink to="/guides">Guides</NuxtLink>
          <NuxtLink to="/api">API</NuxtLink>
          <NuxtLink to="/cookbook">Cookbook</NuxtLink>
          <NuxtLink to="/help">Help</NuxtLink>
        </Flex>
      </NavbarCenter>

      <NavbarEnd class="gap-2">
        <Button ghost class="gap-2 font-normal" @click="openSearch">
          <Icon name="heroicons:magnifying-glass" class="w-5 h-5" />
          <span class="hidden lg:inline">Search</span>
        </Button>
        <ThemeToggle />
        <Button
          ghost
          circle
          is="NuxtLink"
          href="https://github.com/feathersjs/feathers"
          target="_blank"
          aria-label="GitHub"
        >
          <Icon name="mdi:github" size="24" />
        </Button>
      </NavbarEnd>
    </Navbar>
  </Flex>
</template>
