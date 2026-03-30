"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/mdast-util-to-string";
exports.ids = ["vendor-chunks/mdast-util-to-string"];
exports.modules = {

/***/ "(ssr)/./node_modules/mdast-util-to-string/index.js":
/*!****************************************************!*\
  !*** ./node_modules/mdast-util-to-string/index.js ***!
  \****************************************************/
/***/ ((module) => {

eval("\n\nmodule.exports = toString\n\n// Get the text content of a node.\n// Prefer the node’s plain-text fields, otherwise serialize its children,\n// and if the given value is an array, serialize the nodes in it.\nfunction toString(node) {\n  return (\n    (node &&\n      (node.value ||\n        node.alt ||\n        node.title ||\n        ('children' in node && all(node.children)) ||\n        ('length' in node && all(node)))) ||\n    ''\n  )\n}\n\nfunction all(values) {\n  var result = []\n  var index = -1\n\n  while (++index < values.length) {\n    result[index] = toString(values[index])\n  }\n\n  return result.join('')\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi9ub2RlX21vZHVsZXMvbWRhc3QtdXRpbC10by1zdHJpbmcvaW5kZXguanMiLCJtYXBwaW5ncyI6IkFBQVk7O0FBRVo7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0EiLCJzb3VyY2VzIjpbIi9Vc2Vycy9qb3JnZXBzZW5keml1ay9Eb2N1bWVudHMvZnBzaS9ub2RlX21vZHVsZXMvbWRhc3QtdXRpbC10by1zdHJpbmcvaW5kZXguanMiXSwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnXG5cbm1vZHVsZS5leHBvcnRzID0gdG9TdHJpbmdcblxuLy8gR2V0IHRoZSB0ZXh0IGNvbnRlbnQgb2YgYSBub2RlLlxuLy8gUHJlZmVyIHRoZSBub2Rl4oCZcyBwbGFpbi10ZXh0IGZpZWxkcywgb3RoZXJ3aXNlIHNlcmlhbGl6ZSBpdHMgY2hpbGRyZW4sXG4vLyBhbmQgaWYgdGhlIGdpdmVuIHZhbHVlIGlzIGFuIGFycmF5LCBzZXJpYWxpemUgdGhlIG5vZGVzIGluIGl0LlxuZnVuY3Rpb24gdG9TdHJpbmcobm9kZSkge1xuICByZXR1cm4gKFxuICAgIChub2RlICYmXG4gICAgICAobm9kZS52YWx1ZSB8fFxuICAgICAgICBub2RlLmFsdCB8fFxuICAgICAgICBub2RlLnRpdGxlIHx8XG4gICAgICAgICgnY2hpbGRyZW4nIGluIG5vZGUgJiYgYWxsKG5vZGUuY2hpbGRyZW4pKSB8fFxuICAgICAgICAoJ2xlbmd0aCcgaW4gbm9kZSAmJiBhbGwobm9kZSkpKSkgfHxcbiAgICAnJ1xuICApXG59XG5cbmZ1bmN0aW9uIGFsbCh2YWx1ZXMpIHtcbiAgdmFyIHJlc3VsdCA9IFtdXG4gIHZhciBpbmRleCA9IC0xXG5cbiAgd2hpbGUgKCsraW5kZXggPCB2YWx1ZXMubGVuZ3RoKSB7XG4gICAgcmVzdWx0W2luZGV4XSA9IHRvU3RyaW5nKHZhbHVlc1tpbmRleF0pXG4gIH1cblxuICByZXR1cm4gcmVzdWx0LmpvaW4oJycpXG59XG4iXSwibmFtZXMiOltdLCJpZ25vcmVMaXN0IjpbMF0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(ssr)/./node_modules/mdast-util-to-string/index.js\n");

/***/ })

};
;