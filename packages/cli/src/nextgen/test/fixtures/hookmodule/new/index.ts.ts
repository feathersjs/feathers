export function render (context: any) {
    const to: any = null
    const body = `
${context.greeting} ${context.name} (${context.email})
`

    return {
      body,
      to
    }
  }