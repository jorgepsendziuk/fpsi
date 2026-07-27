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

eval("module.exports = __webpack_require__(/*! ./syntax */ \"(ssr)/./node_modules/micromark-extension-gfm/syntax.js\")\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi9ub2RlX21vZHVsZXMvbWljcm9tYXJrLWV4dGVuc2lvbi1nZm0vaW5kZXguanMiLCJtYXBwaW5ncyI6IkFBQUEsOEdBQW9DIiwic291cmNlcyI6WyIvVXNlcnMvam9yZ2Vwc2VuZHppdWsvUHJvamV0b3MvZnBzaS9ub2RlX21vZHVsZXMvbWljcm9tYXJrLWV4dGVuc2lvbi1nZm0vaW5kZXguanMiXSwic291cmNlc0NvbnRlbnQiOlsibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL3N5bnRheCcpXG4iXSwibmFtZXMiOltdLCJpZ25vcmVMaXN0IjpbMF0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(ssr)/./node_modules/micromark-extension-gfm/index.js\n");

/***/ }),

/***/ "(ssr)/./node_modules/micromark-extension-gfm/syntax.js":
/*!********************************************************!*\
  !*** ./node_modules/micromark-extension-gfm/syntax.js ***!
  \********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

eval("var combine = __webpack_require__(/*! micromark/dist/util/combine-extensions */ \"(ssr)/./node_modules/micromark/dist/util/combine-extensions.js\")\nvar autolink = __webpack_require__(/*! micromark-extension-gfm-autolink-literal */ \"(ssr)/./node_modules/micromark-extension-gfm-autolink-literal/index.js\")\nvar strikethrough = __webpack_require__(/*! micromark-extension-gfm-strikethrough */ \"(ssr)/./node_modules/micromark-extension-gfm-strikethrough/index.js\")\nvar table = __webpack_require__(/*! micromark-extension-gfm-table */ \"(ssr)/./node_modules/micromark-extension-gfm-table/index.js\")\nvar tasklist = __webpack_require__(/*! micromark-extension-gfm-task-list-item */ \"(ssr)/./node_modules/micromark-extension-gfm-task-list-item/index.js\")\n\nmodule.exports = create\n\nfunction create(options) {\n  return combine([autolink, strikethrough(options), table, tasklist])\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi9ub2RlX21vZHVsZXMvbWljcm9tYXJrLWV4dGVuc2lvbi1nZm0vc3ludGF4LmpzIiwibWFwcGluZ3MiOiJBQUFBLGNBQWMsbUJBQU8sQ0FBQyw4R0FBd0M7QUFDOUQsZUFBZSxtQkFBTyxDQUFDLHdIQUEwQztBQUNqRSxvQkFBb0IsbUJBQU8sQ0FBQyxrSEFBdUM7QUFDbkUsWUFBWSxtQkFBTyxDQUFDLGtHQUErQjtBQUNuRCxlQUFlLG1CQUFPLENBQUMsb0hBQXdDOztBQUUvRDs7QUFFQTtBQUNBO0FBQ0EiLCJzb3VyY2VzIjpbIi9Vc2Vycy9qb3JnZXBzZW5keml1ay9Qcm9qZXRvcy9mcHNpL25vZGVfbW9kdWxlcy9taWNyb21hcmstZXh0ZW5zaW9uLWdmbS9zeW50YXguanMiXSwic291cmNlc0NvbnRlbnQiOlsidmFyIGNvbWJpbmUgPSByZXF1aXJlKCdtaWNyb21hcmsvZGlzdC91dGlsL2NvbWJpbmUtZXh0ZW5zaW9ucycpXG52YXIgYXV0b2xpbmsgPSByZXF1aXJlKCdtaWNyb21hcmstZXh0ZW5zaW9uLWdmbS1hdXRvbGluay1saXRlcmFsJylcbnZhciBzdHJpa2V0aHJvdWdoID0gcmVxdWlyZSgnbWljcm9tYXJrLWV4dGVuc2lvbi1nZm0tc3RyaWtldGhyb3VnaCcpXG52YXIgdGFibGUgPSByZXF1aXJlKCdtaWNyb21hcmstZXh0ZW5zaW9uLWdmbS10YWJsZScpXG52YXIgdGFza2xpc3QgPSByZXF1aXJlKCdtaWNyb21hcmstZXh0ZW5zaW9uLWdmbS10YXNrLWxpc3QtaXRlbScpXG5cbm1vZHVsZS5leHBvcnRzID0gY3JlYXRlXG5cbmZ1bmN0aW9uIGNyZWF0ZShvcHRpb25zKSB7XG4gIHJldHVybiBjb21iaW5lKFthdXRvbGluaywgc3RyaWtldGhyb3VnaChvcHRpb25zKSwgdGFibGUsIHRhc2tsaXN0XSlcbn1cbiJdLCJuYW1lcyI6W10sImlnbm9yZUxpc3QiOlswXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(ssr)/./node_modules/micromark-extension-gfm/syntax.js\n");

/***/ })

};
;