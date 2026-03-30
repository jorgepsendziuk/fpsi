/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/mdast-util-gfm-strikethrough";
exports.ids = ["vendor-chunks/mdast-util-gfm-strikethrough"];
exports.modules = {

/***/ "(ssr)/./node_modules/mdast-util-gfm-strikethrough/from-markdown.js":
/*!********************************************************************!*\
  !*** ./node_modules/mdast-util-gfm-strikethrough/from-markdown.js ***!
  \********************************************************************/
/***/ ((__unused_webpack_module, exports) => {

eval("exports.canContainEols = ['delete']\nexports.enter = {strikethrough: enterStrikethrough}\nexports.exit = {strikethrough: exitStrikethrough}\n\nfunction enterStrikethrough(token) {\n  this.enter({type: 'delete', children: []}, token)\n}\n\nfunction exitStrikethrough(token) {\n  this.exit(token)\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi9ub2RlX21vZHVsZXMvbWRhc3QtdXRpbC1nZm0tc3RyaWtldGhyb3VnaC9mcm9tLW1hcmtkb3duLmpzIiwibWFwcGluZ3MiOiJBQUFBLHNCQUFzQjtBQUN0QixhQUFhLElBQUk7QUFDakIsWUFBWSxJQUFJOztBQUVoQjtBQUNBLGNBQWMsNkJBQTZCO0FBQzNDOztBQUVBO0FBQ0E7QUFDQSIsInNvdXJjZXMiOlsiL1VzZXJzL2pvcmdlcHNlbmR6aXVrL0RvY3VtZW50cy9mcHNpL25vZGVfbW9kdWxlcy9tZGFzdC11dGlsLWdmbS1zdHJpa2V0aHJvdWdoL2Zyb20tbWFya2Rvd24uanMiXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0cy5jYW5Db250YWluRW9scyA9IFsnZGVsZXRlJ11cbmV4cG9ydHMuZW50ZXIgPSB7c3RyaWtldGhyb3VnaDogZW50ZXJTdHJpa2V0aHJvdWdofVxuZXhwb3J0cy5leGl0ID0ge3N0cmlrZXRocm91Z2g6IGV4aXRTdHJpa2V0aHJvdWdofVxuXG5mdW5jdGlvbiBlbnRlclN0cmlrZXRocm91Z2godG9rZW4pIHtcbiAgdGhpcy5lbnRlcih7dHlwZTogJ2RlbGV0ZScsIGNoaWxkcmVuOiBbXX0sIHRva2VuKVxufVxuXG5mdW5jdGlvbiBleGl0U3RyaWtldGhyb3VnaCh0b2tlbikge1xuICB0aGlzLmV4aXQodG9rZW4pXG59XG4iXSwibmFtZXMiOltdLCJpZ25vcmVMaXN0IjpbMF0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(ssr)/./node_modules/mdast-util-gfm-strikethrough/from-markdown.js\n");

/***/ }),

/***/ "(ssr)/./node_modules/mdast-util-gfm-strikethrough/to-markdown.js":
/*!******************************************************************!*\
  !*** ./node_modules/mdast-util-gfm-strikethrough/to-markdown.js ***!
  \******************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

eval("var phrasing = __webpack_require__(/*! mdast-util-to-markdown/lib/util/container-phrasing */ \"(ssr)/./node_modules/mdast-util-to-markdown/lib/util/container-phrasing.js\")\n\nexports.unsafe = [{character: '~', inConstruct: 'phrasing'}]\nexports.handlers = {delete: handleDelete}\n\nhandleDelete.peek = peekDelete\n\nfunction handleDelete(node, _, context) {\n  var exit = context.enter('emphasis')\n  var value = phrasing(node, context, {before: '~', after: '~'})\n  exit()\n  return '~~' + value + '~~'\n}\n\nfunction peekDelete() {\n  return '~'\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi9ub2RlX21vZHVsZXMvbWRhc3QtdXRpbC1nZm0tc3RyaWtldGhyb3VnaC90by1tYXJrZG93bi5qcyIsIm1hcHBpbmdzIjoiQUFBQSxlQUFlLG1CQUFPLENBQUMsc0lBQW9EOztBQUUzRSxjQUFjLEtBQUssd0NBQXdDO0FBQzNELGdCQUFnQixJQUFJOztBQUVwQjs7QUFFQTtBQUNBO0FBQ0EsdUNBQXVDLHdCQUF3QjtBQUMvRDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBIiwic291cmNlcyI6WyIvVXNlcnMvam9yZ2Vwc2VuZHppdWsvRG9jdW1lbnRzL2Zwc2kvbm9kZV9tb2R1bGVzL21kYXN0LXV0aWwtZ2ZtLXN0cmlrZXRocm91Z2gvdG8tbWFya2Rvd24uanMiXSwic291cmNlc0NvbnRlbnQiOlsidmFyIHBocmFzaW5nID0gcmVxdWlyZSgnbWRhc3QtdXRpbC10by1tYXJrZG93bi9saWIvdXRpbC9jb250YWluZXItcGhyYXNpbmcnKVxuXG5leHBvcnRzLnVuc2FmZSA9IFt7Y2hhcmFjdGVyOiAnficsIGluQ29uc3RydWN0OiAncGhyYXNpbmcnfV1cbmV4cG9ydHMuaGFuZGxlcnMgPSB7ZGVsZXRlOiBoYW5kbGVEZWxldGV9XG5cbmhhbmRsZURlbGV0ZS5wZWVrID0gcGVla0RlbGV0ZVxuXG5mdW5jdGlvbiBoYW5kbGVEZWxldGUobm9kZSwgXywgY29udGV4dCkge1xuICB2YXIgZXhpdCA9IGNvbnRleHQuZW50ZXIoJ2VtcGhhc2lzJylcbiAgdmFyIHZhbHVlID0gcGhyYXNpbmcobm9kZSwgY29udGV4dCwge2JlZm9yZTogJ34nLCBhZnRlcjogJ34nfSlcbiAgZXhpdCgpXG4gIHJldHVybiAnfn4nICsgdmFsdWUgKyAnfn4nXG59XG5cbmZ1bmN0aW9uIHBlZWtEZWxldGUoKSB7XG4gIHJldHVybiAnfidcbn1cbiJdLCJuYW1lcyI6W10sImlnbm9yZUxpc3QiOlswXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(ssr)/./node_modules/mdast-util-gfm-strikethrough/to-markdown.js\n");

/***/ })

};
;