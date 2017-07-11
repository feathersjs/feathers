'use strict';

module.exports = (app) => (entity) => {
  const authConfig = app.get('auth');
  let idField = app.service(authConfig.service).id;

  if (!idField) {
    console.error(`The adapter for the ${authConfig.service} service does not add an \`id\` property to the service.  It needs to be updated to do so.`);
    idField = entity.hasOwnProperty('id') ? 'id' : '_id';
  }

  const entityId = entity[idField];
  let socketMap;

  if (app.io) {
    socketMap = app.io.sockets.sockets;
  }
  if (app.primus) {
    socketMap = app.primus.connections;
  }

  Object.keys(socketMap).forEach(socketId => {
    const socket = socketMap[socketId];
    const feathers = socket.feathers || socket.request.feathers;
    const socketEntity = feathers && feathers[authConfig.entity];

    if (socketEntity) {
      const socketEntityId = socketEntity[idField];

      if (`${entityId}` === `${socketEntityId}`) {
        // Need to assign because of external references
        Object.assign(socketEntity, entity);

        // Delete any removed entity properties
        const entityProps = new Set(Object.keys(entity));
        Object.keys(socketEntity)
          .filter(prop => !entityProps.has(prop))
          .forEach(prop => delete socketEntity[prop]);
      }
    }
  });
};
