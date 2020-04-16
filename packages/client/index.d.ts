import feathers from '@feathersjs/feathers';
import authentication from '@feathersjs/authentication-client';
import errors from '@feathersjs/errors';
import rest from '@feathersjs/rest-client';
import socketio from '@feathersjs/socketio-client';

export as namespace feathers;

declare const feathersClient: FeathersClient;
export = feathersClient;

type Feathers = typeof feathers;
type FeathersAuthenticationClient = typeof authentication;
type FeathersErrors = typeof errors;
type FeathersRestClient = typeof rest;
type FeathersSocketIOClient = typeof socketio;

interface FeathersClient extends Feathers {
    authentication: FeathersAuthenticationClient;
    errors: FeathersErrors;
    rest: FeathersRestClient;
    socketio: FeathersSocketIOClient;
}
