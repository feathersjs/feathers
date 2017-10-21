const assert = require('assert');
const axios = require('axios');
const { verify } = require('@feathersjs/commons/lib/test/fixture');

module.exports = function crud (description, name) {
  describe(description, () => {
    it('GET .find', () => {
      return axios.get(`http://localhost:4777/${name}`)
        .then(res => {
          assert.ok(res.status === 200, 'Got OK status code');
          verify.find(res.data);
        });
    });

    it('GET .get', () => {
      return axios.get('http://localhost:4777/todo/dishes')
        .then(res => {
          assert.ok(res.status === 200, 'Got OK status code');
          verify.get('dishes', res.data);
        });
    });

    it('POST .create', () => {
      let original = {
        description: 'POST .create'
      };

      return axios.post(`http://localhost:4777/${name}`, original)
        .then(res => {
          assert.ok(res.status === 201, 'Got CREATED status code');
          verify.create(original, res.data);
        });
    });

    it('PUT .update', () => {
      let original = {
        description: 'PUT .update'
      };

      return axios.put('http://localhost:4777/todo/544', original)
        .then(res => {
          assert.ok(res.status === 200, 'Got OK status code');
          verify.update(544, original, res.data);
        });
    });

    it('PUT .update many', () => {
      let original = {
        description: 'PUT .update',
        many: true
      };

      return axios.put(`http://localhost:4777/${name}`, original)
        .then(res => {
          const { data } = res;
          assert.ok(res.status === 200, 'Got OK status code');
          verify.update(null, original, data);
        });
    });

    it('PATCH .patch', () => {
      let original = {
        description: 'PATCH .patch'
      };

      return axios.patch('http://localhost:4777/todo/544', original)
        .then(res => {
          assert.ok(res.status === 200, 'Got OK status code');
          verify.patch(544, original, res.data);
        });
    });

    it('PATCH .patch many', () => {
      let original = {
        description: 'PATCH .patch',
        many: true
      };

      return axios.patch(`http://localhost:4777/${name}`, original)
        .then(res => {
          assert.ok(res.status === 200, 'Got OK status code');
          verify.patch(null, original, res.data);
        });
    });

    it('DELETE .remove', () => {
      return axios.delete('http://localhost:4777/tasks/233')
        .then(res => {
          assert.ok(res.status === 200, 'Got OK status code');
          verify.remove(233, res.data);
        });
    });

    it('DELETE .remove many', () => {
      return axios.delete('http://localhost:4777/tasks')
        .then(res => {
          assert.ok(res.status === 200, 'Got OK status code');
          verify.remove(null, res.data);
        });
    });
  });
};
