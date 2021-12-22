export function render (context: any) {
    const to = `foo/${context.name}/bar`
    const body = `


This is the html email template.
Find me at <i>app/mailers/hello/html.ejs</i>

<br/> 
<br/> 

You owe ${context.bill}
  `

    return {
      body,
      to
    }
  }