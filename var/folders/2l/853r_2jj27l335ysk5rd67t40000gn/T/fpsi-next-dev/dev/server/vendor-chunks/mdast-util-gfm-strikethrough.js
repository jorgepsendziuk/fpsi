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

eval("exports.canContainEols = ['delete']\nexports.enter = {strikethrough: enterStrikethrough}\nexports.exit = {strikethrough: exitStrikethrough}\n\nfunction enterStrikethrough(token) {\n  this.enter({type: 'delete', children: []}, token)\n}\n\nfunction exitStrikethrough(token) {\n  this.exit(token)\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi9ub2RlX21vZHVsZXMvbWRhc3QtdXRpbC1nZm0tc3RyaWtldGhyb3VnaC9mcm9tLW1hcmtkb3duLmpzIiwibWFwcGluZ3MiOiJBQUFBLHNCQUFzQjtBQUN0QixhQUFhLElBQUk7QUFDakIsWUFBWSxJQUFJOztBQUVoQjtBQUNBLGNBQWMsNkJBQTZCO0FBQzNDOztBQUVBO0FBQ0E7QUFDQSIsInNvdXJjZXMiOlsiL1VzZXJzL2pvcmdlcHNlbmR6aXVrL1Byb2pldG9zL2Zwc2kvbm9kZV9tb2R1bGVzL21kYXN0LXV0aWwtZ2ZtLXN0cmlrZXRocm91Z2gvZnJvbS1tYXJrZG93bi5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnRzLmNhbkNvbnRhaW5Fb2xzID0gWydkZWxldGUnXVxuZXhwb3J0cy5lbnRlciA9IHtzdHJpa2V0aHJvdWdoOiBlbnRlclN0cmlrZXRocm91Z2h9XG5leHBvcnRzLmV4aXQgPSB7c3RyaWtldGhyb3VnaDogZXhpdFN0cmlrZXRocm91Z2h9XG5cbmZ1bmN0aW9uIGVudGVyU3RyaWtldGhyb3VnaCh0b2tlbikge1xuICB0aGlzLmVudGVyKHt0eXBlOiAnZGVsZXRlJywgY2hpbGRyZW46IFtdfSwgdG9rZW4pXG59XG5cbmZ1bmN0aW9uIGV4aXRTdHJpa2V0aHJvdWdoKHRva2VuKSB7XG4gIHRoaXMuZXhpdCh0b2tlbilcbn1cbiJdLCJuYW1lcyI6W10sImlnbm9yZUxpc3QiOlswXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(ssr)/./node_modules/mdast-util-gfm-strikethrough/from-markdown.js\n");

/***/ }),

/***/ "(ssr)/./node_modules/mdast-util-gfm-strikethrough/to-markdown.js":
/*!******************************************************************!*\
  !*** ./node_modules/mdast-util-gfm-strikethrough/to-markdown.js ***!
  \******************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

eval("var phrasing = __webpack_require__(/*! mdast-util-to-markdown/lib/util/container-phrasing */ \"(ssr)/./node_modules/mdast-util-to-markdown/lib/util/container-phrasing.js\")\n\nexports.unsafe = [{character: '~', inConstruct: 'phrasing'}]\nexports.handlers = {delete: handleDelete}\n\nhandleDelete.peek = peekDelete\n\nfunction handleDelete(node, _, context) {\n  var exit = context.enter('emphasis')\n  var value = phrasing(node, context, {before: '~', after: '~'})\n  exit()\n  return '~~' + value + '~~'\n}\n\nfunction peekDelete() {\n  return '~'\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi9ub2RlX21vZHVsZXMvbWRhc3QtdXRpbC1nZm0tc3RyaWtldGhyb3VnaC90by1tYXJrZG93bi5qcyIsIm1hcHBpbmdzIjoiQUFBQSxlQUFlLG1CQUFPLENBQUMsc0lBQW9EOztBQUUzRSxjQUFjLEtBQUssd0NBQXdDO0FBQzNELGdCQUFnQixJQUFJOztBQUVwQjs7QUFFQTtBQUNBO0FBQ0EsdUNBQXVDLHdCQUF3QjtBQUMvRDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBIiwic291cmNlcyI6WyIvVXNlcnMvam9yZ2Vwc2VuZHppdWsvUHJvamV0b3MvZnBzaS9ub2RlX21vZHVsZXMvbWRhc3QtdXRpbC1nZm0tc3RyaWtldGhyb3VnaC90by1tYXJrZG93bi5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgcGhyYXNpbmcgPSByZXF1aXJlKCdtZGFzdC11dGlsLXRvLW1hcmtkb3duL2xpYi91dGlsL2NvbnRhaW5lci1waHJhc2luZycpXG5cbmV4cG9ydHMudW5zYWZlID0gW3tjaGFyYWN0ZXI6ICd+JywgaW5Db25zdHJ1Y3Q6ICdwaHJhc2luZyd9XVxuZXhwb3J0cy5oYW5kbGVycyA9IHtkZWxldGU6IGhhbmRsZURlbGV0ZX1cblxuaGFuZGxlRGVsZXRlLnBlZWsgPSBwZWVrRGVsZXRlXG5cbmZ1bmN0aW9uIGhhbmRsZURlbGV0ZShub2RlLCBfLCBjb250ZXh0KSB7XG4gIHZhciBleGl0ID0gY29udGV4dC5lbnRlcignZW1waGFzaXMnKVxuICB2YXIgdmFsdWUgPSBwaHJhc2luZyhub2RlLCBjb250ZXh0LCB7YmVmb3JlOiAnficsIGFmdGVyOiAnfid9KVxuICBleGl0KClcbiAgcmV0dXJuICd+ficgKyB2YWx1ZSArICd+fidcbn1cblxuZnVuY3Rpb24gcGVla0RlbGV0ZSgpIHtcbiAgcmV0dXJuICd+J1xufVxuIl0sIm5hbWVzIjpbXSwiaWdub3JlTGlzdCI6WzBdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(ssr)/./node_modules/mdast-util-gfm-strikethrough/to-markdown.js\n");

/***/ })

};
;