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

eval("\n\nvar syntax = __webpack_require__(/*! micromark-extension-gfm */ \"(ssr)/./node_modules/micromark-extension-gfm/index.js\")\nvar fromMarkdown = __webpack_require__(/*! mdast-util-gfm/from-markdown */ \"(ssr)/./node_modules/mdast-util-gfm/from-markdown.js\")\nvar toMarkdown = __webpack_require__(/*! mdast-util-gfm/to-markdown */ \"(ssr)/./node_modules/mdast-util-gfm/to-markdown.js\")\n\nvar warningIssued\n\nmodule.exports = gfm\n\nfunction gfm(options) {\n  var data = this.data()\n\n  /* istanbul ignore next - old remark. */\n  if (\n    !warningIssued &&\n    ((this.Parser &&\n      this.Parser.prototype &&\n      this.Parser.prototype.blockTokenizers) ||\n      (this.Compiler &&\n        this.Compiler.prototype &&\n        this.Compiler.prototype.visitors))\n  ) {\n    warningIssued = true\n    console.warn(\n      '[remark-gfm] Warning: please upgrade to remark 13 to use this plugin'\n    )\n  }\n\n  add('micromarkExtensions', syntax(options))\n  add('fromMarkdownExtensions', fromMarkdown)\n  add('toMarkdownExtensions', toMarkdown(options))\n\n  function add(field, value) {\n    /* istanbul ignore if - other extensions. */\n    if (data[field]) data[field].push(value)\n    else data[field] = [value]\n  }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi9ub2RlX21vZHVsZXMvcmVtYXJrLWdmbS9pbmRleC5qcyIsIm1hcHBpbmdzIjoiQUFBWTs7QUFFWixhQUFhLG1CQUFPLENBQUMsc0ZBQXlCO0FBQzlDLG1CQUFtQixtQkFBTyxDQUFDLDBGQUE4QjtBQUN6RCxpQkFBaUIsbUJBQU8sQ0FBQyxzRkFBNEI7O0FBRXJEOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJzb3VyY2VzIjpbIi9Vc2Vycy9qb3JnZXBzZW5keml1ay9Eb2N1bWVudHMvZnBzaS9ub2RlX21vZHVsZXMvcmVtYXJrLWdmbS9pbmRleC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCdcblxudmFyIHN5bnRheCA9IHJlcXVpcmUoJ21pY3JvbWFyay1leHRlbnNpb24tZ2ZtJylcbnZhciBmcm9tTWFya2Rvd24gPSByZXF1aXJlKCdtZGFzdC11dGlsLWdmbS9mcm9tLW1hcmtkb3duJylcbnZhciB0b01hcmtkb3duID0gcmVxdWlyZSgnbWRhc3QtdXRpbC1nZm0vdG8tbWFya2Rvd24nKVxuXG52YXIgd2FybmluZ0lzc3VlZFxuXG5tb2R1bGUuZXhwb3J0cyA9IGdmbVxuXG5mdW5jdGlvbiBnZm0ob3B0aW9ucykge1xuICB2YXIgZGF0YSA9IHRoaXMuZGF0YSgpXG5cbiAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgLSBvbGQgcmVtYXJrLiAqL1xuICBpZiAoXG4gICAgIXdhcm5pbmdJc3N1ZWQgJiZcbiAgICAoKHRoaXMuUGFyc2VyICYmXG4gICAgICB0aGlzLlBhcnNlci5wcm90b3R5cGUgJiZcbiAgICAgIHRoaXMuUGFyc2VyLnByb3RvdHlwZS5ibG9ja1Rva2VuaXplcnMpIHx8XG4gICAgICAodGhpcy5Db21waWxlciAmJlxuICAgICAgICB0aGlzLkNvbXBpbGVyLnByb3RvdHlwZSAmJlxuICAgICAgICB0aGlzLkNvbXBpbGVyLnByb3RvdHlwZS52aXNpdG9ycykpXG4gICkge1xuICAgIHdhcm5pbmdJc3N1ZWQgPSB0cnVlXG4gICAgY29uc29sZS53YXJuKFxuICAgICAgJ1tyZW1hcmstZ2ZtXSBXYXJuaW5nOiBwbGVhc2UgdXBncmFkZSB0byByZW1hcmsgMTMgdG8gdXNlIHRoaXMgcGx1Z2luJ1xuICAgIClcbiAgfVxuXG4gIGFkZCgnbWljcm9tYXJrRXh0ZW5zaW9ucycsIHN5bnRheChvcHRpb25zKSlcbiAgYWRkKCdmcm9tTWFya2Rvd25FeHRlbnNpb25zJywgZnJvbU1hcmtkb3duKVxuICBhZGQoJ3RvTWFya2Rvd25FeHRlbnNpb25zJywgdG9NYXJrZG93bihvcHRpb25zKSlcblxuICBmdW5jdGlvbiBhZGQoZmllbGQsIHZhbHVlKSB7XG4gICAgLyogaXN0YW5idWwgaWdub3JlIGlmIC0gb3RoZXIgZXh0ZW5zaW9ucy4gKi9cbiAgICBpZiAoZGF0YVtmaWVsZF0pIGRhdGFbZmllbGRdLnB1c2godmFsdWUpXG4gICAgZWxzZSBkYXRhW2ZpZWxkXSA9IFt2YWx1ZV1cbiAgfVxufVxuIl0sIm5hbWVzIjpbXSwiaWdub3JlTGlzdCI6WzBdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(ssr)/./node_modules/remark-gfm/index.js\n");

/***/ })

};
;