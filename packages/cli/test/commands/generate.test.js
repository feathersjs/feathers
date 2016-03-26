import _ from 'lodash';
import assert from 'assert';
import vorpalBuilder from 'vorpal';
import commands, { env } from '../../src/commands/generate';

describe('feathers-cli', () => {

  const vorpal = vorpalBuilder();
  commands(vorpal);

  describe('generator-feathers registration', () => {
    it('has registered the generator name', () => {
      assert(_.includes(env.getGeneratorNames(), 'feathers'));
    });

    it('registers all namespaces', () => {
      let expected = [
        'feathers:app',
        'feathers:hook',
        'feathers:middleware',
        'feathers:model',
        'feathers:service'
      ];

      assert.equal(_.difference(expected, env.namespaces()).length, 0, `namespaces() is incomplete: ${env.namespaces()}`);
    });
  });
});
