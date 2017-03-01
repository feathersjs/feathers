
declare function auth (config?: auth.Options): () => void;

declare namespace auth{
  export const hooks: DefaultHooks;

  interface Options {
      path: '/authentication';
      header: 'Authorization';
      entity: 'user';
      service: 'users';
      passReqToCallback: true;
      session: false;
      cookie: {
        enabled: false;
        name: 'feathers-jwt';
        httpOnly: false;
        secure: true;
      };
      jwt: {
        /**
         * By default is an access token but can be any type
         */
        header: { typ: 'access' };

        /**
         * The resource server where the token is processed
         */
        audience: 'https://yourdomain.com';

        /**
         * Typically the entity id associated with the JWT
         */
        subject: 'anonymous';

        /**
         * The issuing server, application or resource
         */
        issuer: 'feathers';
        algorithm: 'HS256';
        expiresIn: '1d'
      }
  }
  interface HashPassOptions{
    passwordField: string;
  }

  //TODO: move this for hook project
  interface DefaultHooks {
    /**
     * The `verifyToken` hook will attempt to verify a token.
     * If the token is missing or is invalid it returns an error.
     * If the token is valid it adds the decrypted payload to hook.params.payload which contains the user id.
     * It is intended to be used as a before hook on any of the service methods.
     *
     * @returns {Function}
     */
    verifyToken(options?): Function;
    /**
     * The populateUser hook is for populating a user based on an id.
     * It can be used on any service method as either a before or after hook.
     * It is called internally after a token is created.
     *
     * @returns {Function}
     */
    populateUser(options?): Function;

    /**
     * The `restrictToAuthenticated` hook throws an error if there isn't a logged-in user by checking for the `hook.params.user` object.
     * It can be used on any service method and is intended to be used as a before hook.
     * It doesn't take any arguments.
     *
     * @returns {Function}
     */
    restrictToAuthenticated(): Function;
    /**
     * `restrictToOwner` is meant to be used as a before hook.
     * It only allows the user to retrieve resources that are owned by them.
     * It will return a *Forbidden* error without the proper permissions.
     * It can be used on `get`, `create`, `update`, `patch` or `remove` methods.
     *
     * @param {RestrictOptions} [options]
     * @returns {Function}
     */
    restrictToOwner(options?: RestrictOptions): Function;

    /**
     * The `hashPassword` hook will automatically hash the data coming in on the provided passwordField.
     * It is intended to be used as a before hook on the user service for the create, update, or patch methods.
     *
     * @param {HashPassOptions} [options] - The field you use to denote the password on your user object.
     * @returns {Function}
     */
    hashPassword(options?: HashPassOptions): Function;
  }

  interface RestrictOptions{
    ownerField: string;
    idField: string;
  }

}

export = auth;
