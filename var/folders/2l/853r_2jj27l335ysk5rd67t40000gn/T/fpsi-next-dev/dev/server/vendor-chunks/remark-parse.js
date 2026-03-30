"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/remark-parse";
exports.ids = ["vendor-chunks/remark-parse"];
exports.modules = {

/***/ "(ssr)/./node_modules/remark-parse/index.js":
/*!********************************************!*\
  !*** ./node_modules/remark-parse/index.js ***!
  \********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

eval("\n\nmodule.exports = parse\n\nvar fromMarkdown = __webpack_require__(/*! mdast-util-from-markdown */ \"(ssr)/./node_modules/mdast-util-from-markdown/index.js\")\n\nfunction parse(options) {\n  var self = this\n\n  this.Parser = parse\n\n  function parse(doc) {\n    return fromMarkdown(\n      doc,\n      Object.assign({}, self.data('settings'), options, {\n        // Note: these options are not in the readme.\n        // The goal is for them to be set by plugins on `data` instead of being\n        // passed by users.\n        extensions: self.data('micromarkExtensions') || [],\n        mdastExtensions: self.data('fromMarkdownExtensions') || []\n      })\n    )\n  }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi9ub2RlX21vZHVsZXMvcmVtYXJrLXBhcnNlL2luZGV4LmpzIiwibWFwcGluZ3MiOiJBQUFZOztBQUVaOztBQUVBLG1CQUFtQixtQkFBTyxDQUFDLHdGQUEwQjs7QUFFckQ7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxzQkFBc0I7QUFDdEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0EiLCJzb3VyY2VzIjpbIi9Vc2Vycy9qb3JnZXBzZW5keml1ay9Eb2N1bWVudHMvZnBzaS9ub2RlX21vZHVsZXMvcmVtYXJrLXBhcnNlL2luZGV4LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0J1xuXG5tb2R1bGUuZXhwb3J0cyA9IHBhcnNlXG5cbnZhciBmcm9tTWFya2Rvd24gPSByZXF1aXJlKCdtZGFzdC11dGlsLWZyb20tbWFya2Rvd24nKVxuXG5mdW5jdGlvbiBwYXJzZShvcHRpb25zKSB7XG4gIHZhciBzZWxmID0gdGhpc1xuXG4gIHRoaXMuUGFyc2VyID0gcGFyc2VcblxuICBmdW5jdGlvbiBwYXJzZShkb2MpIHtcbiAgICByZXR1cm4gZnJvbU1hcmtkb3duKFxuICAgICAgZG9jLFxuICAgICAgT2JqZWN0LmFzc2lnbih7fSwgc2VsZi5kYXRhKCdzZXR0aW5ncycpLCBvcHRpb25zLCB7XG4gICAgICAgIC8vIE5vdGU6IHRoZXNlIG9wdGlvbnMgYXJlIG5vdCBpbiB0aGUgcmVhZG1lLlxuICAgICAgICAvLyBUaGUgZ29hbCBpcyBmb3IgdGhlbSB0byBiZSBzZXQgYnkgcGx1Z2lucyBvbiBgZGF0YWAgaW5zdGVhZCBvZiBiZWluZ1xuICAgICAgICAvLyBwYXNzZWQgYnkgdXNlcnMuXG4gICAgICAgIGV4dGVuc2lvbnM6IHNlbGYuZGF0YSgnbWljcm9tYXJrRXh0ZW5zaW9ucycpIHx8IFtdLFxuICAgICAgICBtZGFzdEV4dGVuc2lvbnM6IHNlbGYuZGF0YSgnZnJvbU1hcmtkb3duRXh0ZW5zaW9ucycpIHx8IFtdXG4gICAgICB9KVxuICAgIClcbiAgfVxufVxuIl0sIm5hbWVzIjpbXSwiaWdub3JlTGlzdCI6WzBdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(ssr)/./node_modules/remark-parse/index.js\n");

/***/ })

};
;