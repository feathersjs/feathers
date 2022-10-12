import { generator, when, toFile } from '@feathershq/pinion'
import { getDatabaseAdapter, renderSource } from '../../commons'
import { AuthenticationGeneratorContext } from '../index'

const migrationTemplate = ({
  kebabPath,
  authStrategies
}: AuthenticationGeneratorContext) => /* ts */ `import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('${kebabPath}', function (table) {
    table.dropColumn('text')${authStrategies
      .map((name) =>
        name === 'local'
          ? `    
    table.string('email').unique()
    table.string('password')`
          : `    
    table.string('${name}Id')`
      )
      .join('\n')}
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('${kebabPath}', function (table) {
    table.string('text')${authStrategies
      .map((name) =>
        name === 'local'
          ? `    
    table.dropColumn('email')
    table.dropColumn('password')`
          : `    
    table.dropColumn('${name}Id')
    `
      )
      .join('\n')}
  })
}
`

export const generate = (ctx: AuthenticationGeneratorContext) =>
  generator(ctx).then(
    when(
      (ctx) => getDatabaseAdapter(ctx.feathers?.database) === 'knex',
      renderSource(
        migrationTemplate,
        toFile(
          toFile<AuthenticationGeneratorContext>('migrations', () => {
            // Probably not great but it works to align with the Knex migration file format
            // We add 2 seconds so that the migrations run in the correct order
            const migrationDate = new Date(Date.now() + 2000)
              .toISOString()
              .replace(/\D/g, '')
              .substring(0, 14)

            return `${migrationDate}_authentication`
          })
        )
      )
    )
  )
