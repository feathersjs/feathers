<script setup lang="ts">
const pageRoute = useRoute()

// Interface for our TOC structure
interface TocLink {
  id: string
  text: string
  level: number
  children: TocLink[]
}

// Create a reactive reference for our TOC links
const tocLinks = ref<TocLink[]>([])
const pageTitle = ref('Table of Contents')
const activeHeadingIds = ref<string[]>([])
const tocContainerRef = ref<HTMLElement | null>(null)

// Current heading is based on the route hash
const currentHeadingId = computed(() => {
  const hash = pageRoute.hash
  return hash ? hash.slice(1) : null // Remove the leading #
})

// Function to scan the page for headings and build the TOC
function scanHeadings() {
  // Wait for the DOM to be ready
  if (typeof document === 'undefined') {
    return
  }

  // Find all headings (h1-h6) with IDs
  const headings = document.querySelectorAll('h1[id], h2[id], h3[id], h4[id], h5[id], h6[id]')
  const links: TocLink[] = []

  // Get the page title from the first h1
  const h1 = document.querySelector('h1')
  if (h1) {
    pageTitle.value = h1.textContent || 'Table of Contents'
  }

  // If no headings found, it might mean content hasn't loaded yet
  // But also check if we have at least an h1 to ensure page content exists
  if (headings.length === 0 && !h1) {
    return
  }

  // Process each heading
  headings.forEach((heading) => {
    // Skip the first h1 as it's the page title
    if (heading.tagName === 'H1' && heading === h1) {
      return
    }

    const id = heading.id
    const level = Number.parseInt(heading.tagName.substring(1), 10)

    // Create a TOC link
    const link: TocLink = { id, text: heading.textContent || '', level, children: [] }
    links.push(link)
  })

  // Build a robust hierarchical structure in a single pass
  const hierarchicalLinks: TocLink[] = []
  const parents: TocLink[] = []

  for (const link of links) {
    // Always ensure children is initialized
    if (!('children' in link) || !Array.isArray(link.children)) {
      ;(link as TocLink).children = []
    }
    // Find the last parent of lower level
    while (parents.length > 0 && parents[parents.length - 1]!.level >= link.level) {
      parents.pop()
    }
    if (parents.length === 0) {
      hierarchicalLinks.push(link)
    } else {
      parents[parents.length - 1]!.children.push(link)
    }
    parents.push(link)
  }
  tocLinks.value = hierarchicalLinks

  // Set up intersection observer after headings are scanned
  setupScrollObserver()
}

// Scroll handler for section-based highlighting
let scrollHandler: (() => void) | null = null
let headingPositions: { id: string; top: number }[] = []

function setupScrollObserver() {
  // Clean up existing scroll handler
  if (scrollHandler) {
    window.removeEventListener('scroll', scrollHandler)
    scrollHandler = null
  }

  const headings = Array.from(document.querySelectorAll('h2[id], h3[id], h4[id], h5[id], h6[id]'))
  if (headings.length === 0) return

  // Cache heading positions (recalculate on resize)
  function updateHeadingPositions() {
    headingPositions = headings.map((heading) => ({
      id: heading.id,
      top: heading.getBoundingClientRect().top + window.scrollY
    }))
  }

  updateHeadingPositions()
  window.addEventListener('resize', updateHeadingPositions)

  // Calculate which sections are visible based on scroll position
  scrollHandler = () => {
    const viewportTop = window.scrollY + 100 // Account for fixed header
    const viewportBottom = window.scrollY + window.innerHeight

    const visibleIds: string[] = []

    for (let i = 0; i < headingPositions.length; i++) {
      const current = headingPositions[i]!
      const next = headingPositions[i + 1]

      // Section extends from this heading to the next heading (or end of document)
      const sectionTop = current.top
      const sectionBottom = next ? next.top : document.body.scrollHeight

      // Check if this section overlaps with the viewport
      const isVisible = sectionTop < viewportBottom && sectionBottom > viewportTop

      if (isVisible) {
        visibleIds.push(current.id)
      }
    }

    activeHeadingIds.value = visibleIds
  }

  window.addEventListener('scroll', scrollHandler, { passive: true })
  // Initial calculation
  scrollHandler()
}

// Check if we're in the browser
let observer: MutationObserver | null = null

onMounted(() => {
  // Initial scan with a small delay to ensure content is rendered
  setTimeout(() => {
    scanHeadings()
  }, 100)

  // Scroll the TOC to show the current item if there's a hash in the URL
  setTimeout(() => {
    if (pageRoute.hash) {
      const tocContainer = (tocContainerRef.value as any)?.$el || tocContainerRef.value
      const activeItem = tocContainer?.querySelector('.menu-active') as HTMLElement | null
      if (tocContainer && activeItem) {
        const containerRect = tocContainer.getBoundingClientRect()
        const itemRect = activeItem.getBoundingClientRect()
        const scrollTop =
          itemRect.top -
          containerRect.top +
          tocContainer.scrollTop -
          containerRect.height / 2 +
          itemRect.height / 2
        tocContainer.scrollTo({ top: scrollTop, behavior: 'smooth' })
      }
    }
  }, 500)

  // Re-scan when route changes (for SPA navigation)
  watch(
    () => pageRoute.path,
    () => {
      // Clear current TOC immediately when route changes
      tocLinks.value = []
      pageTitle.value = 'Table of Contents'
      activeHeadingIds.value = []

      // Use multiple strategies to ensure content is fully loaded
      nextTick(() => {
        // First attempt after nextTick
        scanHeadings()

        // Second attempt with a delay to handle slow rendering
        setTimeout(() => {
          scanHeadings()
        }, 200)

        // Third attempt with a longer delay as fallback
        setTimeout(() => {
          scanHeadings()
        }, 500)
      })
    }
  )

  // Also watch for hash changes to update active states
  watch(
    () => pageRoute.hash,
    () => {
      // No need to rescan, just update active states
    }
  )

  // Watch for DOM mutations affecting headings
  observer = new MutationObserver((mutations) => {
    let shouldRescan = false
    for (const mutation of mutations) {
      if (
        Array.from(mutation.addedNodes).some(isHeadingNode) ||
        Array.from(mutation.removedNodes).some(isHeadingNode) ||
        (mutation.type === 'attributes' && isHeadingNode(mutation.target))
      ) {
        shouldRescan = true
        break
      }
    }
    if (shouldRescan) {
      // Add a small delay to allow DOM to stabilize
      setTimeout(() => {
        scanHeadings()
      }, 50)
    }
  })
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['id']
  })
})

onBeforeUnmount(() => {
  if (observer) {
    observer.disconnect()
    observer = null
  }
  if (scrollHandler) {
    window.removeEventListener('scroll', scrollHandler)
    scrollHandler = null
  }
})

function isHeadingNode(node: Node | EventTarget): boolean {
  if (!(node instanceof HTMLElement)) {
    return false
  }
  return /^H[1-6]$/.test(node.tagName)
}

function checkActive(id: string) {
  return activeHeadingIds.value.includes(id) ? 'active' : null
}

function toTop() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
  activeHeadingIds.value = []
  setTimeout(() => {
    window.location.hash = ''
  }, 600)
}

function toBottom() {
  window.scrollTo({
    top: document.body.scrollHeight,
    behavior: 'smooth'
  })
}

const router = useRouter()

function scrollToHeading(id: string) {
  const el = document.getElementById(id)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    // Update the hash using router to trigger reactivity
    router.replace({ hash: `#${id}` })
  }
}
</script>

<template>
  <Flex ref="tocContainerRef" col class="max-h-[calc(100vh-5rem)] overflow-y-auto">
    <Menu v-if="tocLinks.length" class="md:menu-sm xl:menu-md w-full">
      <MenuItem class="text-base-content cursor-pointer">
        <a
          class="flex flex-row items-center justify-between font-semibold bg-neutral/30"
          :class="activeHeadingIds.length === 0 ? 'active' : ''"
          @click="toTop"
        >
          {{ pageTitle }}
          <Icon name="feather:arrow-up" class="text-base" />
        </a>
      </MenuItem>

      <TocTree
        :links="tocLinks"
        :check-active="checkActive"
        :scroll-to-heading="scrollToHeading"
        :current-id="currentHeadingId"
      />

      <MenuItem>
        <a class="flex flex-row items-center justify-between hover:bg-accent/25 mt-6" @click="toBottom">
          scroll to bottom
          <Icon name="feather:arrow-down" class="text-base" />
        </a>
      </MenuItem>
    </Menu>
  </Flex>
</template>
