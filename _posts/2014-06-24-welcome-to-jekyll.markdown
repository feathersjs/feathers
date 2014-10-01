---
layout: default
title:  "Welcome to Jekyll!"
date:   2014-06-24 13:55:12
categories: jekyll update
---

```js
'use strict';

var Proto = require('uberproto');
var _ = require('lodash');

var mixins = require('./mixins');
var stripSlashes = function (name) {
  return name.replace(/^\/|\/$/g, '');
};

```

You'll find this post in your `_posts` directory - edit this post and re-build (or run with the `-w` switch) to see your changes!
To add new posts, simply add a file in the `_posts` directory that follows the convention: YYYY-MM-DD-name-of-post.ext.

Jekyll also offers powerful support for code snippets:

```js
'use strict';

var Proto = require('uberproto');
var _ = require('lodash');

var mixins = require('./mixins');
var stripSlashes = function (name) {
  return name.replace(/^\/|\/$/g, '');
};

```

Check out the [Jekyll docs][jekyll] for more info on how to get the most out of Jekyll. File all bugs/feature requests at [Jekyll's GitHub repo][jekyll-gh].

[jekyll-gh]: https://github.com/jekyll/jekyll
[jekyll]:    http://jekyllrb.com
