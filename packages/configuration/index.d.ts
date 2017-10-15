// Type definitions for feathers-configuration 0.4.1
// Project: https://github.com/feathersjs/feathers-configuration
// Definitions by: Johannes Choo <jhanschoo@gmail.com>
/// <reference types="config" />

import * as config from "config";

// execution of the callback returned by configuration() returns nothing
// but sets properties on `this` object if it is a method on an app, but
// returns a node-config object otherwise.
type configIfAppContext = () => config.IConfig | void;
declare function configuration(): configIfAppContext;

export = configuration;
