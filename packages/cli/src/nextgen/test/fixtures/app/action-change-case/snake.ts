export function render (context: any) {
    const to = `foo/${context.name}/bar`
    const body = context.h.changeCase.snakeCase(context.name);

    return {
      body,
      to
    }
  }