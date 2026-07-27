"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/unist-builder";
exports.ids = ["vendor-chunks/unist-builder"];
exports.modules = {

/***/ "(ssr)/./node_modules/unist-builder/index.js":
/*!*********************************************!*\
  !*** ./node_modules/unist-builder/index.js ***!
  \*********************************************/
/***/ ((module) => {

eval("\n\nmodule.exports = u\n\nfunction u(type, props, value) {\n  var node\n\n  if (\n    (value === null || value === undefined) &&\n    (typeof props !== 'object' || Array.isArray(props))\n  ) {\n    value = props\n    props = {}\n  }\n\n  node = Object.assign({type: String(type)}, props)\n\n  if (Array.isArray(value)) {\n    node.children = value\n  } else if (value !== null && value !== undefined) {\n    node.value = String(value)\n  }\n\n  return node\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi9ub2RlX21vZHVsZXMvdW5pc3QtYnVpbGRlci9pbmRleC5qcyIsIm1hcHBpbmdzIjoiQUFBWTs7QUFFWjs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLHdCQUF3QixtQkFBbUI7O0FBRTNDO0FBQ0E7QUFDQSxJQUFJO0FBQ0o7QUFDQTs7QUFFQTtBQUNBIiwic291cmNlcyI6WyIvVXNlcnMvam9yZ2Vwc2VuZHppdWsvUHJvamV0b3MvZnBzaS9ub2RlX21vZHVsZXMvdW5pc3QtYnVpbGRlci9pbmRleC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCdcblxubW9kdWxlLmV4cG9ydHMgPSB1XG5cbmZ1bmN0aW9uIHUodHlwZSwgcHJvcHMsIHZhbHVlKSB7XG4gIHZhciBub2RlXG5cbiAgaWYgKFxuICAgICh2YWx1ZSA9PT0gbnVsbCB8fCB2YWx1ZSA9PT0gdW5kZWZpbmVkKSAmJlxuICAgICh0eXBlb2YgcHJvcHMgIT09ICdvYmplY3QnIHx8IEFycmF5LmlzQXJyYXkocHJvcHMpKVxuICApIHtcbiAgICB2YWx1ZSA9IHByb3BzXG4gICAgcHJvcHMgPSB7fVxuICB9XG5cbiAgbm9kZSA9IE9iamVjdC5hc3NpZ24oe3R5cGU6IFN0cmluZyh0eXBlKX0sIHByb3BzKVxuXG4gIGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSkge1xuICAgIG5vZGUuY2hpbGRyZW4gPSB2YWx1ZVxuICB9IGVsc2UgaWYgKHZhbHVlICE9PSBudWxsICYmIHZhbHVlICE9PSB1bmRlZmluZWQpIHtcbiAgICBub2RlLnZhbHVlID0gU3RyaW5nKHZhbHVlKVxuICB9XG5cbiAgcmV0dXJuIG5vZGVcbn1cbiJdLCJuYW1lcyI6W10sImlnbm9yZUxpc3QiOlswXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(ssr)/./node_modules/unist-builder/index.js\n");

/***/ })

};
;