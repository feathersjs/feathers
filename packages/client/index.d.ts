import feathers from '@feathersjs/feathers';
import authentication from '@feathersjs/authentication-client';
import errors from '@feathersjs/errors';
import primus from '@feathersjs/primus-client';
import rest from '@feathersjs/rest-client';
import socketio from '@feathersjs/socketio-client';

export as namespace feathers;

declare const feathersClient: FeathersClient;
export = feathersClient;

type Feathers = typeof feathers;
type FeathersAuthenticationClient = typeof authentication;
type FeathersErrors = typeof errors;
type FeathersPrimusClient = typeof primus;
type FeathersRestClient = typeof rest;
type FeathersSocketIOClient = typeof socketio;

interface FeathersClient extends Feathers {
    authentication: FeathersAuthenticationClient;
    errors: FeathersErrors;
    primus: FeathersPrimusClient;
    rest: FeathersRestClient;
    socketio: FeathersSocketIOClient;
}
