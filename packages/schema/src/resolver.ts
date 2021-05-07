import toposort from "toposort";

// A simplified Schema just to keep this as an
// example of the resovler only. PS, I am bad
// at Typscript, please disregard any oddities
// that you may see. I was just appeasing the
// overlords.
class Schema {
  resolvers: Record<string, Promise<any>>;

  constructor(resolvers: Record<string, Promise<any>>) {
    this.resolvers = { ...resolvers };
  }

  async resolve(values: any, context?: any) {
    const resolverCache: Record<string, Promise<any>> = {};
    const resolverEdges: Array<[string, string]> = [];
    const result = { ...values };
    const resolvers = { ...this.resolvers };

    // Lazily resolve resolvers. This is fundamental
    // to the ref() method. Note we do not actually
    // use toposort to sort resolvers into a legal
    // execution order. That is handled by this
    // resolverCache.
    function resolve(key: string) {
      if (resolverCache[key]) {
        return resolverCache[key];
      }

      resolverCache[key] = resolvers[key].call(
        new Resolver(key),
        values[key],
        values,
        context
      );

      return resolverCache[key];
    }

    // We may want to add this as an option to the
    // parent Schema, so a user could pass in there
    // own Resolver class with their own methods. Or
    // maybe instead of Resolver class, we use
    // a new instance of the Schema class with
    // this.ref method attached/scoped to this resolve.
    function Resolver(parentKey: string) {
      // Await another resolver to finish and use its
      // value in this resolver. toposort ensures
      // no cyclical deps. We don't actually sort
      // anything or try to execute in any order.
      this.ref = async (key: string) => {
        resolverEdges.push([parentKey, key]);

        try {
          toposort(resolverEdges);
        } catch (error) {
          // TODO: Use a feathers error
          throw new Error(error.message);
        }

        return resolve(key);
      };

      this.loader = (serviceName: string) => {
        return context.loader(serviceName);
        // I guess we could attach a loader here as well? Then
        // the user could call this.loader(serviceName) instead
        // of context.loader(serviceName). I think the
        // context.loader() could/should still exist outside
        // this schema, but being attached here for convenience
        // could be nice.
      };

      this.validateAt = async (key: string, data: any) => {
        // Validate this field or other fields? Maybe
        // the user needs to cast/validate another field
        // before working with it in this resolver. Ajv does
        // not support "partial validation", but I have seen
        // some github issues with viable solutions.
      };

      this.someOtherHelper = () => {};
    }

    await Promise.all(
      Object.keys(resolvers).map(async (key) => {
        const resolved = await resolve(key);

        if (resolved === undefined) {
          delete result[key];
        } else {
          result[key] = resolved;
        }
      })
    );

    return result;
  }
}

const data = {
  id: "123",
  userId: "456",
};

const messageSchema = new Schema({
  user: async function (value, data, context) {
    // Ensure userId exists on the payload and is
    // valid before calling a service with the id.
    const userId = await this.validateAt("userId", data.userId);
    return this.loader("users").load(userId);
  },
  userBio: async function (value, data, context) {
    const user = await this.ref("user");
    if (user && user.bioId) {
      // context.app
      //   .service("user-bios")
      //   .getOptions().schema
      //   .validateAt("bioId", user.bioId);
      return this.loader("user-bios").load(user.bioId);
    }
  },
});

messageSchema.resolve(data, {}).then(console.log).catch(console.error);
