import assert from 'assert';
import { sorter } from '../src';

describe('@feathersjs/adapter-commons', () => {
  describe('sorter', () => {
    it('simple sorter', () => {
      const array = [{
        name: 'David'
      }, {
        name: 'Eric'
      }];

      const sort = sorter({
        name: -1
      });

      assert.deepStrictEqual(array.sort(sort), [{
        name: 'Eric'
      }, {
        name: 'David'
      }]);
    });

    it('simple sorter with arrays', () => {
      const array = [{
        names: [ 'a', 'b' ]
      }, {
        names: [ 'c', 'd' ]
      }];

      const sort = sorter({
        names: -1
      });

      assert.deepStrictEqual(array.sort(sort), [{
        names: [ 'c', 'd' ]
      }, {
        names: [ 'a', 'b' ]
      }]);
    });

    it('simple sorter with objects', () => {
      const array = [{
        names: {
          first: 'Dave',
          last: 'L'
        }
      }, {
        names: {
          first: 'A',
          last: 'B'
        }
      }];

      const sort = sorter({
        names: 1
      });

      assert.deepStrictEqual(array.sort(sort), [{
        names: {
          first: 'A',
          last: 'B'
        }
      }, {
        names: {
          first: 'Dave',
          last: 'L'
        }
      }]);
    });

    it('two property sorter', () => {
      const array = [{
        name: 'David',
        counter: 0
      }, {
        name: 'Eric',
        counter: 1
      }, {
        name: 'David',
        counter: 1
      }, {
        name: 'Eric',
        counter: 0
      }];

      const sort = sorter({
        name: -1,
        counter: 1
      });

      assert.deepStrictEqual(array.sort(sort), [
        { name: 'Eric', counter: 0 },
        { name: 'Eric', counter: 1 },
        { name: 'David', counter: 0 },
        { name: 'David', counter: 1 }
      ]);
    });

    it('two property sorter with names', () => {
      const array = [{
        name: 'David',
        counter: 0
      }, {
        name: 'Eric',
        counter: 1
      }, {
        name: 'Andrew',
        counter: 1
      }, {
        name: 'David',
        counter: 1
      }, {
        name: 'Andrew',
        counter: 0
      }, {
        name: 'Eric',
        counter: 0
      }];

      const sort = sorter({
        name: -1,
        counter: 1
      });

      assert.deepStrictEqual(array.sort(sort), [
        { name: 'Eric', counter: 0 },
        { name: 'Eric', counter: 1 },
        { name: 'David', counter: 0 },
        { name: 'David', counter: 1 },
        { name: 'Andrew', counter: 0 },
        { name: 'Andrew', counter: 1 }
      ]);
    });

    it('three property sorter with names', () => {
      const array = [{
        name: 'David',
        counter: 0,
        age: 2
      }, {
        name: 'Eric',
        counter: 1,
        age: 2
      }, {
        name: 'David',
        counter: 1,
        age: 1
      }, {
        name: 'Eric',
        counter: 0,
        age: 1
      }, {
        name: 'Andrew',
        counter: 0,
        age: 2
      }, {
        name: 'Andrew',
        counter: 0,
        age: 1
      }];

      const sort = sorter({
        name: -1,
        counter: 1,
        age: -1
      });

      assert.deepStrictEqual(array.sort(sort), [
        { name: 'Eric', counter: 0, age: 1 },
        { name: 'Eric', counter: 1, age: 2 },
        { name: 'David', counter: 0, age: 2 },
        { name: 'David', counter: 1, age: 1 },
        { name: 'Andrew', counter: 0, age: 2 },
        { name: 'Andrew', counter: 0, age: 1 }
      ]);
    });
  });

  describe('sorter mongoDB-like sorting on embedded objects', () => {
    let data: any[] = [];

    beforeEach(() => {
      data = [
        { _id: 1, item: { category: "cake", type: "chiffon" }, amount: 10 },
        { _id: 2, item: { category: "cookies", type: "chocolate chip" }, amount: 50 },
        { _id: 3, item: { category: "cookies", type: "chocolate chip" }, amount: 15 },
        { _id: 4, item: { category: "cake", type: "lemon" }, amount: 30 },
        { _id: 5, item: { category: "cake", type: "carrot" }, amount: 20 },
        { _id: 6, item: { category: "brownies", type: "blondie" }, amount: 10 }
      ];

    });

    it('straight test', () => {
      const sort = sorter({
        amount: -1
      });

      assert.deepStrictEqual(data.sort(sort), [
        { _id: 2, item: { category: "cookies", type: "chocolate chip" }, amount: 50 },
        { _id: 4, item: { category: "cake", type: "lemon" }, amount: 30 },
        { _id: 5, item: { category: "cake", type: "carrot" }, amount: 20 },
        { _id: 3, item: { category: "cookies", type: "chocolate chip" }, amount: 15 },
        { _id: 1, item: { category: "cake", type: "chiffon" }, amount: 10 },
        { _id: 6, item: { category: "brownies", type: "blondie" }, amount: 10 }
      ]);
    });

    it('embedded sort 1', () => {
      const sort = sorter({
        "item.category": 1,
        "item.type": 1,
      });

      assert.deepStrictEqual(data.sort(sort), [
        { _id: 6, item: { category: "brownies", type: "blondie" }, amount: 10 },
        { _id: 5, item: { category: "cake", type: "carrot" }, amount: 20 },
        { _id: 1, item: { category: "cake", type: "chiffon" }, amount: 10 },
        { _id: 4, item: { category: "cake", type: "lemon" }, amount: 30 },
        { _id: 2, item: { category: "cookies", type: "chocolate chip" }, amount: 50 },
        { _id: 3, item: { category: "cookies", type: "chocolate chip" }, amount: 15 }
      ]);
    });

    it('embedded sort 2', () => {
      const sort = sorter({
        "item.category": 1,
        "item.type": 1,
        amount: 1
      });

      assert.deepStrictEqual(data.sort(sort), [
        { _id: 6, item: { category: "brownies", type: "blondie" }, amount: 10 },
        { _id: 5, item: { category: "cake", type: "carrot" }, amount: 20 },
        { _id: 1, item: { category: "cake", type: "chiffon" }, amount: 10 },
        { _id: 4, item: { category: "cake", type: "lemon" }, amount: 30 },
        { _id: 3, item: { category: "cookies", type: "chocolate chip" }, amount: 15 },
        { _id: 2, item: { category: "cookies", type: "chocolate chip" }, amount: 50 }
      ]);
    });
 });

});
