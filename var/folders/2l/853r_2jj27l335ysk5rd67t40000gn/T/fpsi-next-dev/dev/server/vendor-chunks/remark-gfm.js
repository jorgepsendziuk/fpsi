"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/remark-gfm";
exports.ids = ["vendor-chunks/remark-gfm"];
exports.modules = {

/***/ "(ssr)/./node_modules/remark-gfm/index.js":
/*!******************************************!*\
  !*** ./node_modules/remark-gfm/index.js ***!
  \******************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

eval("\n\nvar syntax = __webpack_require__(/*! micromark-extension-gfm */ \"(ssr)/./node_modules/micromark-extension-gfm/index.js\")\nvar fromMarkdown = __webpack_require__(/*! mdast-util-gfm/from-markdown */ \"(ssr)/./node_modules/mdast-util-gfm/from-markdown.js\")\nvar toMarkdown = __webpack_require__(/*! mdast-util-gfm/to-markdown */ \"(ssr)/./node_modules/mdast-util-gfm/to-markdown.js\")\n\nvar warningIssued\n\nmodule.exports = gfm\n\nfunction gfm(options) {\n  var data = this.data()\n\n  /* istanbul ignore next - old remark. */\n  if (\n    !warningIssued &&\n    ((this.Parser &&\n      this.Parser.prototype &&\n      this.Parser.prototype.blockTokenizers) ||\n      (this.Compiler &&\n        this.Compiler.prototype &&\n        this.Compiler.prototype.visitors))\n  ) {\n    warningIssued = true\n    console.warn(\n      '[remark-gfm] Warning: please upgrade to remark 13 to use this plugin'\n    )\n  }\n\n  add('micromarkExtensions', syntax(options))\n  add('fromMarkdownExtensions', fromMarkdown)\n  add('toMarkdownExtensions', toMarkdown(options))\n\n  function add(field, value) {\n    /* istanbul ignore if - other extensions. */\n    if (data[field]) data[field].push(value)\n    else data[field] = [value]\n  }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi9ub2RlX21vZHVsZXMvcmVtYXJrLWdmbS9pbmRleC5qcyIsIm1hcHBpbmdzIjoiQUFBWTs7QUFFWixhQUFhLG1CQUFPLENBQUMsc0ZBQXlCO0FBQzlDLG1CQUFtQixtQkFBTyxDQUFDLDBGQUE4QjtBQUN6RCxpQkFBaUIsbUJBQU8sQ0FBQyxzRkFBNEI7O0FBRXJEOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJzb3VyY2VzIjpbIi9Vc2Vycy9qb3JnZXBzZW5keml1ay9Qcm9qZXRvcy9mcHNpL25vZGVfbW9kdWxlcy9yZW1hcmstZ2ZtL2luZGV4LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0J1xuXG52YXIgc3ludGF4ID0gcmVxdWlyZSgnbWljcm9tYXJrLWV4dGVuc2lvbi1nZm0nKVxudmFyIGZyb21NYXJrZG93biA9IHJlcXVpcmUoJ21kYXN0LXV0aWwtZ2ZtL2Zyb20tbWFya2Rvd24nKVxudmFyIHRvTWFya2Rvd24gPSByZXF1aXJlKCdtZGFzdC11dGlsLWdmbS90by1tYXJrZG93bicpXG5cbnZhciB3YXJuaW5nSXNzdWVkXG5cbm1vZHVsZS5leHBvcnRzID0gZ2ZtXG5cbmZ1bmN0aW9uIGdmbShvcHRpb25zKSB7XG4gIHZhciBkYXRhID0gdGhpcy5kYXRhKClcblxuICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAtIG9sZCByZW1hcmsuICovXG4gIGlmIChcbiAgICAhd2FybmluZ0lzc3VlZCAmJlxuICAgICgodGhpcy5QYXJzZXIgJiZcbiAgICAgIHRoaXMuUGFyc2VyLnByb3RvdHlwZSAmJlxuICAgICAgdGhpcy5QYXJzZXIucHJvdG90eXBlLmJsb2NrVG9rZW5pemVycykgfHxcbiAgICAgICh0aGlzLkNvbXBpbGVyICYmXG4gICAgICAgIHRoaXMuQ29tcGlsZXIucHJvdG90eXBlICYmXG4gICAgICAgIHRoaXMuQ29tcGlsZXIucHJvdG90eXBlLnZpc2l0b3JzKSlcbiAgKSB7XG4gICAgd2FybmluZ0lzc3VlZCA9IHRydWVcbiAgICBjb25zb2xlLndhcm4oXG4gICAgICAnW3JlbWFyay1nZm1dIFdhcm5pbmc6IHBsZWFzZSB1cGdyYWRlIHRvIHJlbWFyayAxMyB0byB1c2UgdGhpcyBwbHVnaW4nXG4gICAgKVxuICB9XG5cbiAgYWRkKCdtaWNyb21hcmtFeHRlbnNpb25zJywgc3ludGF4KG9wdGlvbnMpKVxuICBhZGQoJ2Zyb21NYXJrZG93bkV4dGVuc2lvbnMnLCBmcm9tTWFya2Rvd24pXG4gIGFkZCgndG9NYXJrZG93bkV4dGVuc2lvbnMnLCB0b01hcmtkb3duKG9wdGlvbnMpKVxuXG4gIGZ1bmN0aW9uIGFkZChmaWVsZCwgdmFsdWUpIHtcbiAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgLSBvdGhlciBleHRlbnNpb25zLiAqL1xuICAgIGlmIChkYXRhW2ZpZWxkXSkgZGF0YVtmaWVsZF0ucHVzaCh2YWx1ZSlcbiAgICBlbHNlIGRhdGFbZmllbGRdID0gW3ZhbHVlXVxuICB9XG59XG4iXSwibmFtZXMiOltdLCJpZ25vcmVMaXN0IjpbMF0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(ssr)/./node_modules/remark-gfm/index.js\n");

/***/ })

};
;