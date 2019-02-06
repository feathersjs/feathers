module.exports = class JWTStrategy {
  setAuthentication (auth) {
    this.authentication = auth;
  }

  setApplication (app) {
    this.app = app;
  }

  authenticate (params) {
    const { accessToken, strategy } = params;

    if (!accessToken || (strategy && strategy !== 'jwt')) {

    }

    return this.authentication.verifyJwt(accessToken).then(decoded => {
      const entityId = decoded.sub;
    });
  }

  parse (req, res) {

  }
}
