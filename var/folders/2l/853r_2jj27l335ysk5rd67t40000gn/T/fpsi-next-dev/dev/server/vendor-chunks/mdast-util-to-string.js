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

eval("\n\nmodule.exports = toString\n\n// Get the text content of a node.\n// Prefer the node’s plain-text fields, otherwise serialize its children,\n// and if the given value is an array, serialize the nodes in it.\nfunction toString(node) {\n  return (\n    (node &&\n      (node.value ||\n        node.alt ||\n        node.title ||\n        ('children' in node && all(node.children)) ||\n        ('length' in node && all(node)))) ||\n    ''\n  )\n}\n\nfunction all(values) {\n  var result = []\n  var index = -1\n\n  while (++index < values.length) {\n    result[index] = toString(values[index])\n  }\n\n  return result.join('')\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi9ub2RlX21vZHVsZXMvbWRhc3QtdXRpbC10by1zdHJpbmcvaW5kZXguanMiLCJtYXBwaW5ncyI6IkFBQVk7O0FBRVo7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0EiLCJzb3VyY2VzIjpbIi9Vc2Vycy9qb3JnZXBzZW5keml1ay9Qcm9qZXRvcy9mcHNpL25vZGVfbW9kdWxlcy9tZGFzdC11dGlsLXRvLXN0cmluZy9pbmRleC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCdcblxubW9kdWxlLmV4cG9ydHMgPSB0b1N0cmluZ1xuXG4vLyBHZXQgdGhlIHRleHQgY29udGVudCBvZiBhIG5vZGUuXG4vLyBQcmVmZXIgdGhlIG5vZGXigJlzIHBsYWluLXRleHQgZmllbGRzLCBvdGhlcndpc2Ugc2VyaWFsaXplIGl0cyBjaGlsZHJlbixcbi8vIGFuZCBpZiB0aGUgZ2l2ZW4gdmFsdWUgaXMgYW4gYXJyYXksIHNlcmlhbGl6ZSB0aGUgbm9kZXMgaW4gaXQuXG5mdW5jdGlvbiB0b1N0cmluZyhub2RlKSB7XG4gIHJldHVybiAoXG4gICAgKG5vZGUgJiZcbiAgICAgIChub2RlLnZhbHVlIHx8XG4gICAgICAgIG5vZGUuYWx0IHx8XG4gICAgICAgIG5vZGUudGl0bGUgfHxcbiAgICAgICAgKCdjaGlsZHJlbicgaW4gbm9kZSAmJiBhbGwobm9kZS5jaGlsZHJlbikpIHx8XG4gICAgICAgICgnbGVuZ3RoJyBpbiBub2RlICYmIGFsbChub2RlKSkpKSB8fFxuICAgICcnXG4gIClcbn1cblxuZnVuY3Rpb24gYWxsKHZhbHVlcykge1xuICB2YXIgcmVzdWx0ID0gW11cbiAgdmFyIGluZGV4ID0gLTFcblxuICB3aGlsZSAoKytpbmRleCA8IHZhbHVlcy5sZW5ndGgpIHtcbiAgICByZXN1bHRbaW5kZXhdID0gdG9TdHJpbmcodmFsdWVzW2luZGV4XSlcbiAgfVxuXG4gIHJldHVybiByZXN1bHQuam9pbignJylcbn1cbiJdLCJuYW1lcyI6W10sImlnbm9yZUxpc3QiOlswXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(ssr)/./node_modules/mdast-util-to-string/index.js\n");

/***/ })

};
;