import { renderTemplate, toFile } from '@featherscloud/pinion'
import { AppGeneratorContext } from '../index.js'

const template = ({ name, description }: AppGeneratorContext) => /* html */ `<!DOCTYPE html>
<html lang="en">
  <head>
    <title>${name}</title>
    <meta name="description" content="${description}">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      html {
        height: 100%;
      }

      body {
        min-height: 100%;
        display: flex;
        align-items: center;
      }

      img.logo {
        display: block;
        margin: auto auto;
        width: 30%;
        max-width: 100%;
        max-height: 100%;
      }
    </style>
  </head>
  <body>
    <img class="logo" src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjUwMCIgaGVpZ2h0PSIyNTAwIiB2aWV3Qm94PSIwIDAgMjU2IDI1NiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBwcmVzZXJ2ZUFzcGVjdFJhdGlvPSJ4TWlkWU1pZCI+PHBhdGggZD0iTTEyOCA5LjEwMmM2NS42NjUgMCAxMTguODk4IDUzLjIzMyAxMTguODk4IDExOC44OTggMCA2NS42NjUtNTMuMjMzIDExOC44OTgtMTE4Ljg5OCAxMTguODk4QzYyLjMzNSAyNDYuODk4IDkuMTAyIDE5My42NjUgOS4xMDIgMTI4IDkuMTAyIDYyLjMzNSA2Mi4zMzUgOS4xMDIgMTI4IDkuMTAyTTEyOCAwQzU3LjQyMSAwIDAgNTcuNDIxIDAgMTI4YzAgNzAuNTc5IDU3LjQyMSAxMjggMTI4IDEyOCA3MC41NzkgMCAxMjgtNTcuNDIxIDEyOC0xMjhDMjU2IDU3LjQyMSAxOTguNTc5IDAgMTI4IDBtMjAuODMgMjUuNTI0Yy0xMC40My0xLjg5Ni0zNS42NTEgMzYuNDA5LTQzLjk5NCA1OS43MzQtLjYzNCAxLjc2OS0yLjA4NiA4LjI0OS0yLjA4NiA5Ljk1NSAwIDAgNi41MzEgMTQuMDU1IDguMzQzIDE3LjM1MS0zLjAzNC0xLjU4LTkuMzIzLTEzLjc1Ni05LjMyMy0xMy43NTYtMy4wMzQgNS43ODQtNS45NDIgMzIuMzQtNC45OTQgMzcuMjcxIDAgMCA2Ljc2MiAxMC4wNjIgOS4zODcgMTIuNTc4LTMuNjAzLTEuMjAxLTkuNjcxLTkuMzU1LTkuNjcxLTkuMzU1LTEuMTM4IDMuNTA4LS45MTYgMTAuODA3LS4zNzkgMTMuMjc0IDQuNTUxIDYuNjM3IDEwLjYxOSA3LjM5NiAxMC42MTkgNy4zOTZzLTYuNjM3IDY2LjE4MSAzLjQxMyA3MS4xMTFjNi4yNTgtMS4zMjcgNy43NzUtNzMuOTU2IDcuNzc1LTczLjk1NnM3LjU4NS41NjkgOS4yOTItMS4zMjdjMy44NTYtMi42NTUgMTIuODI2LTMwLjIyNCAxMi45NTgtMzQuMjAyIDAgMC0xMC40MSAxLjk1Mi0xNS40ODcgMy45MjQgMy44MjYtMy44IDE2LjA0OS02LjM1MiAxNi4wNDktNi4zNTIgMy4zMTUtMy45NzkgMTAuMjkxLTMxLjA0NyAxMC45OTQtMzkuMzkxLjE3Ni0yLjA5My41ODMtNC42NTcuMjY4LTguMzk4IDAgMC05Ljk0MSAyLjE3Ny0xMi4wMTQgMS40MjQgMi4xMDQtLjIzNyAxMi4yNjMtNC4xNCAxMi4yNjMtNC4xNCAxLjgwMS0xNi4yMTMgMi4zNTgtNDIuMDkxLTMuNDEzLTQzLjE0MXptLTM2LjM4IDE3MS42OTFjLS43OTUgMTkuNDk2LTEuMjk0IDI1LjAwNC0yLjExNSAyOS42MDEtLjM3OS44NTctLjc1OC45OTctMS4xMzgtLjA5NS0zLjQ3Ny0xNS45OTItMy4yMjQtMTM2LjQzOCAzNi40MDktMTkxLjI0MS0yMy4wNSA0Mi4wOTItMzMuNTM1IDEyMi44NjEtMzMuMTU2IDE2MS43MzV6IiBmaWxsPSIjMzMzIi8+PC9zdmc+" />
  </body>
</html>

`

export const generate = (ctx: AppGeneratorContext) =>
  Promise.resolve(ctx).then(renderTemplate(template, toFile('public', 'index.html')))
