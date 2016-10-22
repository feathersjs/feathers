import errors from './index';

export default function () {
  return function (req, res, next) {
    next(new errors.NotFound('Page not found'));
  };
}
