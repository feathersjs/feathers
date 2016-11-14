import feathers from 'feathers';
import authentication from 'feathers-authentication';
import { Verifier } from '../src';
import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

chai.use(sinonChai);

describe('Verifier', () => {
  let service;
  let app;
  let options;
  let verifier;
  let user;

  beforeEach(() => {
    user = { email: 'admin@feathersjs.com' };
    service = {
      id: 'id',
      find: sinon.stub().returns(Promise.resolve([user])),
      create: sinon.stub().returns(Promise.resolve(user)),
      update: sinon.stub().returns(Promise.resolve(user))
    };

    app = feathers();
    app.use('users', service)
      .configure(authentication({ secret: 'supersecret' }));

    options = app.get('auth');
    options.name = 'github';
    options.idField = 'githubId';

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

  describe('updateEntity', () => {
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
      return verifier.updateEntity(entity, data).then(() => {
        args = service.update.getCall(0).args;
      });
    });

    it('calls update on passed in service', () => {
      expect(service.update).to.have.been.calledOnce;
    });

    it('passes id', () => {
      expect(args[0]).to.equal(entity.id);
    });

    it('passes merged entity', () => {
      expect(args[1].id).to.equal(entity.id);
      expect(args[1].name).to.equal(entity.name);
      expect(args[1].githubId).to.equal(data.profile.id);
      expect(args[1].github).to.deep.equal(data);
    });

    it('passes oauth provider via params', () => {
      expect(args[2]).to.deep.equal({ oauth: { provider: 'github' } });
    });
  });

  describe('createEntity', () => {
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
      return verifier.createEntity(data).then(() => {
        args = service.create.getCall(0).args;
      });
    });

    it('calls create on passed in service', () => {
      expect(service.create).to.have.been.calledOnce;
    });

    it('passes entity', () => {
      expect(args[0].githubId).to.equal(data.profile.id);
      expect(args[0].github).to.deep.equal(data);
    });

    it('passes oauth provider via params', () => {
      expect(args[1]).to.deep.equal({ oauth: { provider: 'github' } });
    });
  });

  describe('normalizeResult', () => {
    describe('when has results', () => {
      it('returns entity when paginated', () => {
        return verifier.normalizeResult({ data: [user] }).then(result => {
          expect(result).to.deep.equal(user);
        });
      });

      it('returns entity when not paginated', () => {
        return verifier.normalizeResult([user]).then(result => {
          expect(result).to.deep.equal(user);
        });
      });

      it('calls toObject on entity when present', () => {
        user.toObject = sinon.spy();
        return verifier.normalizeResult({ data: [user] }).then(() => {
          expect(user.toObject).to.have.been.calledOnce;
        });
      });

      it('calls toJSON on entity when present', () => {
        user.toJSON = sinon.spy();
        return verifier.normalizeResult({ data: [user] }).then(() => {
          expect(user.toJSON).to.have.been.calledOnce;
        });
      });
    });

    describe('when no results', () => {
      it('rejects with false when paginated', () => {
        return verifier.normalizeResult({ data: [] }).catch(error => {
          expect(error).to.equal(false);
        });
      });

      it('rejects with false when not paginated', () => {
        return verifier.normalizeResult([]).catch(error => {
          expect(error).to.equal(false);
        });
      });
    });
  });

  describe('verify', () => {
    it('calls find on the provided service', done => {
      verifier.verify({}, 'access', 'refresh', { id: 1234 }, () => {
        const query = { githubId: 1234, $limit: 1 };
        expect(service.find).to.have.been.calledOnce;
        expect(service.find).to.have.been.calledWith({ query });
        done();
      });
    });

    it('calls normalizeResult', done => {
      sinon.spy(verifier, 'normalizeResult');
      verifier.verify({}, 'access', 'refresh', { id: 1234 }, () => {
        expect(verifier.normalizeResult).to.have.been.calledOnce;
        verifier.normalizeResult.restore();
        done();
      });
    });

    describe('when entity exists on request object', () => {
      it('calls updateEntity', done => {
        sinon.spy(verifier, 'updateEntity');
        const req = { 'user': { name: 'Admin' } };
        verifier.verify(req, 'access', 'refresh', { id: 1234 }, () => {
          expect(verifier.updateEntity).to.have.been.calledOnce;
          verifier.updateEntity.restore();
          done();
        });
      });
    });

    describe('when entity exists on request.params object', () => {
      it('calls updateEntity', done => {
        sinon.spy(verifier, 'updateEntity');
        const req = {
          params: {
            'user': { name: 'Admin' }
          }
        };
        verifier.verify(req, 'access', 'refresh', { id: 1234 }, () => {
          expect(verifier.updateEntity).to.have.been.calledOnce;
          verifier.updateEntity.restore();
          done();
        });
      });
    });

    it('calls createEntity when entity not found', done => {
      sinon.spy(verifier, 'createEntity');
      verifier.normalizeResult = () => Promise.resolve(null);
      verifier.verify({}, 'access', 'refresh', { id: 1234 }, () => {
        expect(verifier.createEntity).to.have.been.calledOnce;
        verifier.createEntity.restore();
        done();
      });
    });

    it('calls updateEntity when entity is found', done => {
      sinon.spy(verifier, 'updateEntity');
      verifier.verify({}, 'access', 'refresh', { id: 1234 }, () => {
        expect(verifier.updateEntity).to.have.been.calledOnce;
        verifier.updateEntity.restore();
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
      verifier.updateEntity = () => Promise.reject(false);
      verifier.verify({}, 'access', 'refresh', { id: 1234 }, (error, entity) => {
        expect(error).to.equal(null);
        expect(entity).to.equal(false);
        done();
      });
    });

    it('returns errors', done => {
      const authError = new Error('An error');
      verifier.normalizeResult = () => Promise.reject(authError);
      verifier.verify({}, 'access', 'refresh', { id: 1234 }, (error, entity) => {
        expect(error).to.equal(authError);
        expect(entity).to.equal(undefined);
        done();
      });
    });
  });
});
