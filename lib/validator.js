'use strict';

var validator = require('validator');

// Why? Basically, if validator is deprecated for some reason, I'd be able to rewrite the parts that I need in this
// module. Other modules will just require this one. It keeps the whole thing nicely encapsulated.
module.exports = validator;