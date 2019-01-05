/* eslint-disable no-unused-expressions */
const feathers = require('@feathersjs/feathers');
const expressify = require('@feathersjs/express');
const authentication = require('@feathersjs/authentication');

const { Verifier } = require('../lib');

const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

const { expect } = chai;

chai.use(sinonChai);

describe('Verifier', () => {
  let service;
  let app;
  let options;
  let verifier;
  let user;

  beforeEach(() => {
    user = { id: 'test', email: 'admin@feathersjs.com' };
    service = {
      id: 'id',
      find: sinon.stub().returns(Promise.resolve([user])),
      create: sinon.stub().returns(Promise.resolve(user)),
      patch: sinon.stub().returns(Promise.resolve(user))
    };

    app = expressify(feathers());
    app.use('users', service)
      .configure(authentication({ secret: 'supersecret' }));

    options = app.get('authentication');
    options.name = 'twitter';
    options.idField = 'twitterId';

    verifier = new Verifier(app, options);
  });

  it('is CommonJS compatible', () => {
    expect(typeof require('../lib/verifier')).to.equal('function');
  });

  it('exposes the Verifier class', () => {
    expect(typeof Verifier).to.equal('function');
  });

  describe('constructor', () => {
    it('retains an app reference', () => {
      expect(verifier.app).to.deep.equal(app);
    });

    it('sets options', () => {
      expect(verifier.options).to.deep.equal(options);
    });

    it('sets service using service path', () => {
      expect(verifier.service).to.deep.equal(app.service('users'));
    });

    it('sets a passed in service instance', () => {
      options.service = service;
      expect(new Verifier(app, options).service).to.deep.equal(service);
    });

    describe('when service is undefined', () => {
      it('throws an error', () => {
        expect(() => {
          new Verifier(app, {}); // eslint-disable-line
        }).to.throw();
      });
    });
  });

  describe('_updateEntity', () => {
    let entity;
    let data;
    let args;

    beforeEach(() => {
      entity = { id: 1, name: 'Admin' };
      data = {
        accessToken: 'access',
        refreshToken: 'refresh',
        profile: {
          id: 1234,
          name: 'Admin'
        }
      };
      return verifier._updateEntity(entity, data).then(() => {
        args = service.patch.getCall(0).args;
      });
    });

    it('calls patch on passed in service', () => {
      expect(service.patch).to.have.been.calledOnce;
    });

    it('passes id', () => {
      expect(args[0]).to.equal(entity.id);
    });

    it('passes patch data', () => {
      expect(args[1].twitterId).to.equal(data.profile.id);
      expect(args[1].twitter).to.deep.equal(data);
    });

    it('passes oauth provider via params', () => {
      expect(args[2]).to.deep.equal({ oauth: { provider: 'twitter' } });
    });
  });

  describe('_createEntity', () => {
    let data;
    let args;

    beforeEach(() => {
      data = {
        accessToken: 'access',
        refreshToken: 'refresh',
        profile: {
          id: 1234,
          name: 'Admin'
        }
      };
      return verifier._createEntity(data).then(() => {
        args = service.create.getCall(0).args;
      });
    });

    it('calls create on passed in service', () => {
      expect(service.create).to.have.been.calledOnce;
    });

    it('passes entity', () => {
      expect(args[0].twitterId).to.equal(data.profile.id);
      expect(args[0].twitter).to.deep.equal(data);
    });

    it('passes oauth provider via params', () => {
      expect(args[1]).to.deep.equal({ oauth: { provider: 'twitter' } });
    });
  });

  describe('_normalizeResult', () => {
    describe('when has results', () => {
      it('returns entity when paginated', () => {
        return verifier._normalizeResult({ data: [user] }).then(result => {
          expect(result).to.deep.equal(user);
        });
      });

      it('returns entity when not paginated', () => {
        return verifier._normalizeResult([user]).then(result => {
          expect(result).to.deep.equal(user);
        });
      });

      it('calls toObject on entity when present', () => {
        user.toObject = sinon.spy();
        return verifier._normalizeResult({ data: [user] }).then(() => {
          expect(user.toObject).to.have.been.calledOnce;
        });
      });

      it('calls toJSON on entity when present', () => {
        user.toJSON = sinon.spy();
        return verifier._normalizeResult({ data: [user] }).then(() => {
          expect(user.toJSON).to.have.been.calledOnce;
        });
      });
    });

    describe('when no results', () => {
      it('rejects with false when paginated', () => {
        return verifier._normalizeResult({ data: [] }).catch(error => {
          expect(error).to.equal(false);
        });
      });

      it('rejects with false when not paginated', () => {
        return verifier._normalizeResult([]).catch(error => {
          expect(error).to.equal(false);
        });
      });
    });
  });

  describe('verify', () => {
    it('calls find on the provided service', done => {
      verifier.verify({}, 'access', 'refresh', { id: 1234 }, () => {
        const query = { twitterId: 1234, $limit: 1 };
        expect(service.find).to.have.been.calledOnce;
        expect(service.find).to.have.been.calledWith({ query });
        done();
      });
    });

    it('calls with query from makeQuery', done => {
      options = { ...options, makeQuery: sinon.stub().returns({ key: 'value' }) };
      verifier = new Verifier(app, options);
      verifier.verify({}, 'access', 'refresh', { id: 1234 }, () => {
        const query = { key: 'value', $limit: 1 };
        expect(options.makeQuery).to.have.been.calledOnce;
        expect(service.find).to.have.been.calledWith({ query });
        done();
      });
    });

    it('calls _normalizeResult', done => {
      sinon.spy(verifier, '_normalizeResult');
      verifier.verify({}, 'access', 'refresh', { id: 1234 }, () => {
        expect(verifier._normalizeResult).to.have.been.calledOnce;
        verifier._normalizeResult.restore();
        done();
      });
    });

    describe('when entity exists on request object', () => {
      it('calls _updateEntity', done => {
        sinon.spy(verifier, '_updateEntity');
        const req = { 'user': { name: 'Admin' } };
        verifier.verify(req, 'access', 'refresh', { id: 1234 }, () => {
          expect(verifier._updateEntity).to.have.been.calledOnce;
          verifier._updateEntity.restore();
          done();
        });
      });
    });

    describe('when entity exists on request.params object', () => {
      it('calls _updateEntity', done => {
        sinon.spy(verifier, '_updateEntity');
        const req = {
          params: {
            'user': { name: 'Admin' }
          }
        };
        verifier.verify(req, 'access', 'refresh', { id: 1234 }, () => {
          expect(verifier._updateEntity).to.have.been.calledOnce;
          verifier._updateEntity.restore();
          done();
        });
      });
    });

    it('calls _createEntity when entity not found', done => {
      sinon.spy(verifier, '_createEntity');
      verifier._normalizeResult = () => Promise.resolve(null);
      verifier.verify({}, 'access', 'refresh', { id: 1234 }, () => {
        expect(verifier._createEntity).to.have.been.calledOnce;
        verifier._createEntity.restore();
        done();
      });
    });

    it('calls _updateEntity when entity is found', done => {
      sinon.spy(verifier, '_updateEntity');
      verifier.verify({}, 'access', 'refresh', { id: 1234 }, () => {
        expect(verifier._updateEntity).to.have.been.calledOnce;
        verifier._updateEntity.restore();
        done();
      });
    });

    it('returns the entity', done => {
      verifier.verify({}, 'access', 'refresh', { id: 1234 }, (error, entity) => {
        expect(error).to.equal(null);
        expect(entity).to.deep.equal(user);
        done();
      });
    });

    it('handles false rejections in promise chain', done => {
      verifier._updateEntity = () => Promise.reject(false); // eslint-disable-line
      verifier.verify({}, 'access', 'refresh', { id: 1234 }, (error, entity) => {
        expect(error).to.equal(null);
        expect(entity).to.equal(false);
        done();
      });
    });

    it('returns errors', done => {
      const authError = new Error('An error');
      verifier._normalizeResult = () => Promise.reject(authError);
      verifier.verify({}, 'access', 'refresh', { id: 1234 }, (error, entity) => {
        expect(error).to.equal(authError);
        expect(entity).to.equal(undefined);
        done();
      });
    });
  });
});

describe('Verifier without service.id', function () {
  let service;
  let app;
  let options;
  let verifier;
  let user;

  beforeEach(() => {
    user = { id: 1, email: 'admin@feathersjs.com' };
    service = {
      find: sinon.stub().returns(Promise.resolve([user])),
      create: sinon.stub().returns(Promise.resolve(user)),
      patch: sinon.stub().returns(Promise.resolve(user))
    };

    app = expressify(feathers());
    app.use('users', service)
      .configure(authentication({ secret: 'supersecret' }));

    options = app.get('authentication');
    options.name = 'twitter';
    options.idField = 'twitterId';

    verifier = new Verifier(app, options);
  });

  it('throws an error when service.id is not set', done => {
    verifier.verify({}, 'access', 'refresh', { id: 1234 }, (error, entity) => {
      expect(error.message.includes('the `id` property must be set')).to.equal(true);
      expect(entity).to.equal(undefined);
      done();
    });
  });
});
