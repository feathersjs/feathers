<template>
  <div class="home-industry-partners text-center py-16">
    <div class="max-w-7xl mx-auto">
      <h2 class="text-xl mb-8 font-bold">Our Industry Partners</h2>

      <p class="text-sm mb-12" md="text-lg px-32">
        Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh
        euismod tincidunt ut laoreet dolore magna aliquam erat volutpat.
      </p>

      <div class="grid grid-cols-3 lg:grid-cols-5 px-12 gap-4">
        <div
          v-for="id in 5"
          :key="id"
          class="max-h-16 flex flex-row items-center justify-center"
        >
          <img :src="`/img/partners/${id}.jpg`" alt="" class="h-full" />
        </div>
      </div>
    </div>
  </div>
</template>
