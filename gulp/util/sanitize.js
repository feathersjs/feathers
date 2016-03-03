module.exports = function(options) {
  return function(file) {
    return {
      site: options.site,
      page: file.page,
      content: file.contents.toString()
    };
  };
};