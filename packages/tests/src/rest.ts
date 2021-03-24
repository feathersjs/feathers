import assert from 'assert';
import axios from 'axios';

import { verify } from './fixture';

export function restTests (description: string, name: string, port: number) {
  describe(description, () => {
    it('GET .find', () => {
      return axios.get(`http://localhost:${port}/${name}`)
        .then(res => {
          assert.ok(res.status === 200, 'Got OK status code');
          verify.find(res.data);
        });
    });

    it('GET .get', () => {
      return axios.get(`http://localhost:${port}/${name}/dishes`)
        .then(res => {
          assert.ok(res.status === 200, 'Got OK status code');
          verify.get('dishes', res.data);
        });
    });

    it('POST .create', () => {
      const original = {
        description: 'POST .create'
      };

      return axios.post(`http://localhost:${port}/${name}`, original)
        .then(res => {
          assert.ok(res.status === 201, 'Got CREATED status code');
          verify.create(original, res.data);
        });
    });

    it('PUT .update', () => {
      const original = {
        description: 'PUT .update'
      };

      return axios.put(`http://localhost:${port}/${name}/544`, original)
        .then(res => {
          assert.ok(res.status === 200, 'Got OK status code');
          verify.update('544', original, res.data);
        });
    });

    it('PUT .update many', () => {
      const original = {
        description: 'PUT .update',
        many: true
      };

      return axios.put(`http://localhost:${port}/${name}`, original)
        .then(res => {
          const { data } = res;
          assert.ok(res.status === 200, 'Got OK status code');
          verify.update(null, original, data);
        });
    });

    it('PATCH .patch', () => {
      const original = {
        description: 'PATCH .patch'
      };

      return axios.patch(`http://localhost:${port}/${name}/544`, original)
        .then(res => {
          assert.ok(res.status === 200, 'Got OK status code');
          verify.patch('544', original, res.data);
        });
    });

    it('PATCH .patch many', () => {
      const original = {
        description: 'PATCH .patch',
        many: true
      };

      return axios.patch(`http://localhost:${port}/${name}`, original)
        .then(res => {
          assert.ok(res.status === 200, 'Got OK status code');
          verify.patch(null, original, res.data);
        });
    });

    it('DELETE .remove', () => {
      return axios.delete(`http://localhost:${port}/${name}/233`)
        .then(res => {
          assert.ok(res.status === 200, 'Got OK status code');
          verify.remove('233', res.data);
        });
    });

    it('DELETE .remove many', () => {
      return axios.delete(`http://localhost:${port}/${name}`)
        .then(res => {
          assert.ok(res.status === 200, 'Got OK status code');
          verify.remove(null, res.data);
        });
    });
  });
}
