import { it, assertEquals } from '../../commons/src/index.ts'
import { select } from '../src/index.ts';

it('adapter-commons: select', () => {
  const selector = select({
    query: { $select: ['name', 'age'] }
  });

  return Promise.resolve({
    name: 'David',
    age: 3,
    test: 'me'
  }).then(selector).then(result => assertEquals(result, {
    name: 'David',
    age: 3
  }));
});

it('adapter-commons: select with arrays', () => {
  const selector = select({
    query: { $select: ['name', 'age'] }
  });

  return Promise.resolve([{
    name: 'David',
    age: 3,
    test: 'me'
  }, {
    name: 'D',
    age: 4,
    test: 'you'
  }]).then(selector).then(result => assertEquals(result, [{
    name: 'David',
    age: 3
  }, {
    name: 'D',
    age: 4
  }]));
});

it('adapter-commons: select with no query', () => {
  const selector = select({});
  const data = {
    name: 'David'
  };

  return Promise.resolve(data).then(selector).then(result =>
    assertEquals(result, data)
  );
});

it('adapter-commons: select with other fields', () => {
  const selector = select({
    query: { $select: [ 'name' ] }
  }, 'id');
  const data = {
    id: 'me',
    name: 'David',
    age: 10
  };

  return Promise.resolve(data)
    .then(selector)
    .then(result => assertEquals(result, {
      id: 'me',
      name: 'David'
    }));
});
