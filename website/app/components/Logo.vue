<template>
  <div class="logo-container">
    <NuxtLink to="/">
      <img src="/img/logo-feathers-dark.svg" alt="FeathersJS" class="h-12 logo-dark" />
      <img src="/img/logo-feathers-white.svg" alt="FeathersJS" class="h-12 logo-light" />
    </NuxtLink>
  </div>
</template>

<style>
/* Default: show dark logo for light backgrounds */
.logo-dark {
  display: block;
}
.logo-light {
  display: none;
}

/* When any ancestor has text-primary-content (light text = dark background), show white logo */
.text-primary-content .logo-dark {
  display: none;
}
.text-primary-content .logo-light {
  display: block;
}

/* In dark theme, show white logo */
[data-theme='feathers-dark'] .logo-dark {
  display: none;
}
[data-theme='feathers-dark'] .logo-light {
  display: block;
}
</style>
