const querystring = require("querystring");

const methodMap = {
  POST: "create",
  PATCH: "patch",
  PUT: "update",
  DELETE: "remove"
};

function getServiceMethod(httpMethod, id = null) {
  if (httpMethod === "GET") {
    if (id === null) {
      return "find";
    } else {
      return "get";
    }
  }

  return methodMap[httpMethod];
}

function getServiceMethodArguments({
  serviceMethod,
  id,
  queryParams = {},
  body,
  routeParams,
  reqFeathersParams
}) {
  const args = [];

  if (["get", "delete", "update", "patch"].includes(serviceMethod)) {
    args.push(id);
  }

  if (["create", "update", "patch"].includes(serviceMethod)) {
    args.push(body);
  }

  const params = {
    ...reqFeathersParams,
    query: queryParams,
    route: routeParams
  };

  args.push(params);

  return args;
}

/**
 *
 * @param {import("@feathersjs/feathers").Application} app
 */
function rest(app) {
  /**
   *
   * @param {import("http").IncomingMessage} req
   * @param {import("http").ServerResponse} res
   */
  function requestHandler(req, res) {
    // Parse path, urlparams and querystring
    const method = req.method;
    let path = req.url;
    let queryParams = {};

    const queryIndex = req.url.indexOf("?");
    if (queryIndex > -1) {
      path = req.url.slice(0, queryIndex);
      queryParams = querystring.parse(req.url.slice(queryIndex + 1));
    }

    const { service, params: urlParams = {} } = app.lookup(path);
    const { __id: id, ...routeParams } = urlParams;

    const serviceMethod = getServiceMethod(method, id);
    const args = getServiceMethodArguments({
      serviceMethod,
      id,
      queryParams,
      body: req.body,
      routeParams,
      reqFeathersParams: req.feathers
    });

    service[serviceMethod](...args)
      .then(result => {
        const statusCode = serviceMethod === "create" ? 201 : 200;
        const headers = {
          "Content-Type": "application/json"
        };

        res.writeHead(statusCode, headers);
        res.write(JSON.stringify(result));
        res.end();
      })
      .catch(error => {
        console.log(error.message);
        res.statusCode = 500;
        res.write(JSON.stringify(error));
        res.end();
      });
  }

  app.on("request", requestHandler);
}

module.exports = rest;
