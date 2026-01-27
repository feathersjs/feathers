<template>
  <section class="max-w-328 mx-auto mt-12 p-6 lg:p-12">
    <Flex wrap justify-center class="gap-6">
      <Hover3D>
        <Card class="bg-base-100 shadow-xl w-72">
          <CardBody class="space-y-4">
            <Flex justify-center>
              <NuxtImg src="/img/feature-icons/Fast_Icon.svg" alt="" class="w-42 h-42" />
            </Flex>
            <CardTitle>Fast</CardTitle>
            <Text class="opacity-70">
              Leveraging a unique architecture, Feathers lets you focus on building your APIs and real-time
              applications quickly. You automatically get scalable HTTP and real-time APIs and stay prepared
              for whatever else the future might bring.
            </Text>
          </CardBody>
        </Card>
      </Hover3D>
      <Hover3D>
        <Card class="bg-base-100 shadow-xl w-72">
          <CardBody class="space-y-4">
            <Flex justify-center>
              <NuxtImg src="/img/feature-icons/Universal_Icon.svg" alt="" class="w-42 h-42" />
            </Flex>
            <CardTitle>Universal</CardTitle>
            <Text class="opacity-70">
              Feathers can be used with NodeJS, in the browser, with React Native or with any other API
              client. You can use any database with
              <Link is="NuxtLink" to="/api/databases/adapters.html">many supported out of the box</Link> and
              connect your API seamlessly to any frontend framework.
            </Text>
          </CardBody>
        </Card>
      </Hover3D>
      <Hover3D>
        <Card class="bg-base-100 shadow-xl w-72">
          <CardBody class="space-y-4">
            <Flex justify-center>
              <NuxtImg src="/img/feature-icons/Flexible_Icon.svg" alt="" class="w-42 h-42" />
            </Flex>
            <CardTitle>Flexible</CardTitle>
            <Text class="opacity-70">
              Built for TypeScript, Feathers provides the structure to create complex applications but is
              flexible enough to not be in the way. With
              <Link is="NuxtLink" to="/ecosystem/">a large ecosystem of plugins</Link> you can include exactly
              what you need. No more, no less.
            </Text>
          </CardBody>
        </Card>
      </Hover3D>
    </Flex>
  </section>
</template>
