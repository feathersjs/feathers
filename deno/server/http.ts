import { serve } from 'https://deno.land/std/http/server.ts';

// deno run --allow-net --allow-read standard-library.ts
// Docs: https://deno.land/std/http
const s = serve({ port: 8000 })

console.log(`🦕 Deno server running at http://localhost:8000/ 🦕`)

for await (const req of s) {
  req.respond({ body: 'Hello from your first Deno server' })
}

export function rest () {
  return (app: any) => {
    app.listen = async function (port: number) {
      const s = serve({ port: 8000 });

      console.log(`🦕 Deno server running at http://localhost:8000/ 🦕`)
      
      for await (const req of s) {
        req.respond({ body: 'Hello from your first Deno server' })
      }
    }
  }
}
