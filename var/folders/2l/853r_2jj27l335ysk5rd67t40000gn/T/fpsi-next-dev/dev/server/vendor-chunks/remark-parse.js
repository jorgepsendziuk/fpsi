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

eval("\n\nmodule.exports = parse\n\nvar fromMarkdown = __webpack_require__(/*! mdast-util-from-markdown */ \"(ssr)/./node_modules/mdast-util-from-markdown/index.js\")\n\nfunction parse(options) {\n  var self = this\n\n  this.Parser = parse\n\n  function parse(doc) {\n    return fromMarkdown(\n      doc,\n      Object.assign({}, self.data('settings'), options, {\n        // Note: these options are not in the readme.\n        // The goal is for them to be set by plugins on `data` instead of being\n        // passed by users.\n        extensions: self.data('micromarkExtensions') || [],\n        mdastExtensions: self.data('fromMarkdownExtensions') || []\n      })\n    )\n  }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi9ub2RlX21vZHVsZXMvcmVtYXJrLXBhcnNlL2luZGV4LmpzIiwibWFwcGluZ3MiOiJBQUFZOztBQUVaOztBQUVBLG1CQUFtQixtQkFBTyxDQUFDLHdGQUEwQjs7QUFFckQ7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxzQkFBc0I7QUFDdEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0EiLCJzb3VyY2VzIjpbIi9Vc2Vycy9qb3JnZXBzZW5keml1ay9Qcm9qZXRvcy9mcHNpL25vZGVfbW9kdWxlcy9yZW1hcmstcGFyc2UvaW5kZXguanMiXSwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnXG5cbm1vZHVsZS5leHBvcnRzID0gcGFyc2VcblxudmFyIGZyb21NYXJrZG93biA9IHJlcXVpcmUoJ21kYXN0LXV0aWwtZnJvbS1tYXJrZG93bicpXG5cbmZ1bmN0aW9uIHBhcnNlKG9wdGlvbnMpIHtcbiAgdmFyIHNlbGYgPSB0aGlzXG5cbiAgdGhpcy5QYXJzZXIgPSBwYXJzZVxuXG4gIGZ1bmN0aW9uIHBhcnNlKGRvYykge1xuICAgIHJldHVybiBmcm9tTWFya2Rvd24oXG4gICAgICBkb2MsXG4gICAgICBPYmplY3QuYXNzaWduKHt9LCBzZWxmLmRhdGEoJ3NldHRpbmdzJyksIG9wdGlvbnMsIHtcbiAgICAgICAgLy8gTm90ZTogdGhlc2Ugb3B0aW9ucyBhcmUgbm90IGluIHRoZSByZWFkbWUuXG4gICAgICAgIC8vIFRoZSBnb2FsIGlzIGZvciB0aGVtIHRvIGJlIHNldCBieSBwbHVnaW5zIG9uIGBkYXRhYCBpbnN0ZWFkIG9mIGJlaW5nXG4gICAgICAgIC8vIHBhc3NlZCBieSB1c2Vycy5cbiAgICAgICAgZXh0ZW5zaW9uczogc2VsZi5kYXRhKCdtaWNyb21hcmtFeHRlbnNpb25zJykgfHwgW10sXG4gICAgICAgIG1kYXN0RXh0ZW5zaW9uczogc2VsZi5kYXRhKCdmcm9tTWFya2Rvd25FeHRlbnNpb25zJykgfHwgW11cbiAgICAgIH0pXG4gICAgKVxuICB9XG59XG4iXSwibmFtZXMiOltdLCJpZ25vcmVMaXN0IjpbMF0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(ssr)/./node_modules/remark-parse/index.js\n");

/***/ })

};
;