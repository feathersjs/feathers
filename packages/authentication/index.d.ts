// TODO:  don't have the defs from the hooks PR yet, fix later
type Hook = (hookProps: any) => (Promise<any> | void);

declare function auth (config?: auth.Options): () => void;

declare namespace auth{
  export const hooks: DefaultHooks;

  interface Options {
      path?: string;
      header?: string;
      entity?: string;
      service?: string;
      passReqToCallback?: boolean;
      session?: boolean;
      cookie?: {
        enabled?: boolean;
        name?: string;
        httpOnly?: boolean;
        secure?: boolean;
      };
      jwt?: {
        /**
         * By default is an access token but can be any type
         */
        header?: Object;

        /**
         * The resource server where the token is processed
         */
        audience?: string;

        /**
         * Typically the entity id associated with the JWT
         */
        subject?: string;

        /**
         * The issuing server, application or resource
         */
        issuer?: string;
        algorithm?: string;
        expiresIn?: string;
      }
  }
  interface HashPassOptions{
    passwordField: string;
  }

  //TODO: move this for hook project
  interface DefaultHooks {
    authenticate(strategies: string[] | string): Hook;
    /**
     * The `verifyToken` hook will attempt to verify a token.
     * If the token is missing or is invalid it returns an error.
     * If the token is valid it adds the decrypted payload to hook.params.payload which contains the user id.
     * It is intended to be used as a before hook on any of the service methods.
     *
     * @returns {Function}
     */
    verifyToken(options?:any): Hook;
    /**
     * The populateUser hook is for populating a user based on an id.
     * It can be used on any service method as either a before or after hook.
     * It is called internally after a token is created.
     *
     * @returns {Function}
     */
    populateUser(options?:any): Hook;

    /**
     * The `restrictToAuthenticated` hook throws an error if there isn't a logged-in user by checking for the `hook.params.user` object.
     * It can be used on any service method and is intended to be used as a before hook.
     * It doesn't take any arguments.
     *
     * @returns {Function}
     */
    restrictToAuthenticated(): Hook;
    /**
     * `restrictToOwner` is meant to be used as a before hook.
     * It only allows the user to retrieve resources that are owned by them.
     * It will return a *Forbidden* error without the proper permissions.
     * It can be used on `get`, `create`, `update`, `patch` or `remove` methods.
     *
     * @param {RestrictOptions} [options]
     * @returns {Function}
     */
    restrictToOwner(options?: RestrictOptions): Hook;

    /**
     * The `hashPassword` hook will automatically hash the data coming in on the provided passwordField.
     * It is intended to be used as a before hook on the user service for the create, update, or patch methods.
     *
     * @param {HashPassOptions} [options] - The field you use to denote the password on your user object.
     * @returns {Function}
     */
    hashPassword(options?: HashPassOptions): Hook;
  }

  interface RestrictOptions{
    ownerField: string;
    idField: string;
  }

}

export = auth;
