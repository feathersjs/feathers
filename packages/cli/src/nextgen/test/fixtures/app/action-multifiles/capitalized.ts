export function render (context: any) {
    const to = `foo/${context.name}/bar`
    const body = `
${context.name} and ${context.Name}
  `

    return {
      body,
      to
    }
  }