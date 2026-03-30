/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/micromark-extension-gfm";
exports.ids = ["vendor-chunks/micromark-extension-gfm"];
exports.modules = {

/***/ "(ssr)/./node_modules/micromark-extension-gfm/index.js":
/*!*******************************************************!*\
  !*** ./node_modules/micromark-extension-gfm/index.js ***!
  \*******************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

eval("module.exports = __webpack_require__(/*! ./syntax */ \"(ssr)/./node_modules/micromark-extension-gfm/syntax.js\")\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi9ub2RlX21vZHVsZXMvbWljcm9tYXJrLWV4dGVuc2lvbi1nZm0vaW5kZXguanMiLCJtYXBwaW5ncyI6IkFBQUEsOEdBQW9DIiwic291cmNlcyI6WyIvVXNlcnMvam9yZ2Vwc2VuZHppdWsvRG9jdW1lbnRzL2Zwc2kvbm9kZV9tb2R1bGVzL21pY3JvbWFyay1leHRlbnNpb24tZ2ZtL2luZGV4LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9zeW50YXgnKVxuIl0sIm5hbWVzIjpbXSwiaWdub3JlTGlzdCI6WzBdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(ssr)/./node_modules/micromark-extension-gfm/index.js\n");

/***/ }),

/***/ "(ssr)/./node_modules/micromark-extension-gfm/syntax.js":
/*!********************************************************!*\
  !*** ./node_modules/micromark-extension-gfm/syntax.js ***!
  \********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

eval("var combine = __webpack_require__(/*! micromark/dist/util/combine-extensions */ \"(ssr)/./node_modules/micromark/dist/util/combine-extensions.js\")\nvar autolink = __webpack_require__(/*! micromark-extension-gfm-autolink-literal */ \"(ssr)/./node_modules/micromark-extension-gfm-autolink-literal/index.js\")\nvar strikethrough = __webpack_require__(/*! micromark-extension-gfm-strikethrough */ \"(ssr)/./node_modules/micromark-extension-gfm-strikethrough/index.js\")\nvar table = __webpack_require__(/*! micromark-extension-gfm-table */ \"(ssr)/./node_modules/micromark-extension-gfm-table/index.js\")\nvar tasklist = __webpack_require__(/*! micromark-extension-gfm-task-list-item */ \"(ssr)/./node_modules/micromark-extension-gfm-task-list-item/index.js\")\n\nmodule.exports = create\n\nfunction create(options) {\n  return combine([autolink, strikethrough(options), table, tasklist])\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi9ub2RlX21vZHVsZXMvbWljcm9tYXJrLWV4dGVuc2lvbi1nZm0vc3ludGF4LmpzIiwibWFwcGluZ3MiOiJBQUFBLGNBQWMsbUJBQU8sQ0FBQyw4R0FBd0M7QUFDOUQsZUFBZSxtQkFBTyxDQUFDLHdIQUEwQztBQUNqRSxvQkFBb0IsbUJBQU8sQ0FBQyxrSEFBdUM7QUFDbkUsWUFBWSxtQkFBTyxDQUFDLGtHQUErQjtBQUNuRCxlQUFlLG1CQUFPLENBQUMsb0hBQXdDOztBQUUvRDs7QUFFQTtBQUNBO0FBQ0EiLCJzb3VyY2VzIjpbIi9Vc2Vycy9qb3JnZXBzZW5keml1ay9Eb2N1bWVudHMvZnBzaS9ub2RlX21vZHVsZXMvbWljcm9tYXJrLWV4dGVuc2lvbi1nZm0vc3ludGF4LmpzIl0sInNvdXJjZXNDb250ZW50IjpbInZhciBjb21iaW5lID0gcmVxdWlyZSgnbWljcm9tYXJrL2Rpc3QvdXRpbC9jb21iaW5lLWV4dGVuc2lvbnMnKVxudmFyIGF1dG9saW5rID0gcmVxdWlyZSgnbWljcm9tYXJrLWV4dGVuc2lvbi1nZm0tYXV0b2xpbmstbGl0ZXJhbCcpXG52YXIgc3RyaWtldGhyb3VnaCA9IHJlcXVpcmUoJ21pY3JvbWFyay1leHRlbnNpb24tZ2ZtLXN0cmlrZXRocm91Z2gnKVxudmFyIHRhYmxlID0gcmVxdWlyZSgnbWljcm9tYXJrLWV4dGVuc2lvbi1nZm0tdGFibGUnKVxudmFyIHRhc2tsaXN0ID0gcmVxdWlyZSgnbWljcm9tYXJrLWV4dGVuc2lvbi1nZm0tdGFzay1saXN0LWl0ZW0nKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNyZWF0ZVxuXG5mdW5jdGlvbiBjcmVhdGUob3B0aW9ucykge1xuICByZXR1cm4gY29tYmluZShbYXV0b2xpbmssIHN0cmlrZXRocm91Z2gob3B0aW9ucyksIHRhYmxlLCB0YXNrbGlzdF0pXG59XG4iXSwibmFtZXMiOltdLCJpZ25vcmVMaXN0IjpbMF0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(ssr)/./node_modules/micromark-extension-gfm/syntax.js\n");

/***/ })

};
;