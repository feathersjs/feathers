"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    entity: 'user',
    service: 'users',
    strategies: [],
    jwtOptions: {
        header: { typ: 'access' },
        audience: 'https://yourdomain.com',
        issuer: 'feathers',
        algorithm: 'HS256',
        expiresIn: '1d'
    }
};
//# sourceMappingURL=options.js.map