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

eval("\n\nmodule.exports = u\n\nfunction u(type, props, value) {\n  var node\n\n  if (\n    (value === null || value === undefined) &&\n    (typeof props !== 'object' || Array.isArray(props))\n  ) {\n    value = props\n    props = {}\n  }\n\n  node = Object.assign({type: String(type)}, props)\n\n  if (Array.isArray(value)) {\n    node.children = value\n  } else if (value !== null && value !== undefined) {\n    node.value = String(value)\n  }\n\n  return node\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi9ub2RlX21vZHVsZXMvdW5pc3QtYnVpbGRlci9pbmRleC5qcyIsIm1hcHBpbmdzIjoiQUFBWTs7QUFFWjs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLHdCQUF3QixtQkFBbUI7O0FBRTNDO0FBQ0E7QUFDQSxJQUFJO0FBQ0o7QUFDQTs7QUFFQTtBQUNBIiwic291cmNlcyI6WyIvVXNlcnMvam9yZ2Vwc2VuZHppdWsvRG9jdW1lbnRzL2Zwc2kvbm9kZV9tb2R1bGVzL3VuaXN0LWJ1aWxkZXIvaW5kZXguanMiXSwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnXG5cbm1vZHVsZS5leHBvcnRzID0gdVxuXG5mdW5jdGlvbiB1KHR5cGUsIHByb3BzLCB2YWx1ZSkge1xuICB2YXIgbm9kZVxuXG4gIGlmIChcbiAgICAodmFsdWUgPT09IG51bGwgfHwgdmFsdWUgPT09IHVuZGVmaW5lZCkgJiZcbiAgICAodHlwZW9mIHByb3BzICE9PSAnb2JqZWN0JyB8fCBBcnJheS5pc0FycmF5KHByb3BzKSlcbiAgKSB7XG4gICAgdmFsdWUgPSBwcm9wc1xuICAgIHByb3BzID0ge31cbiAgfVxuXG4gIG5vZGUgPSBPYmplY3QuYXNzaWduKHt0eXBlOiBTdHJpbmcodHlwZSl9LCBwcm9wcylcblxuICBpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHtcbiAgICBub2RlLmNoaWxkcmVuID0gdmFsdWVcbiAgfSBlbHNlIGlmICh2YWx1ZSAhPT0gbnVsbCAmJiB2YWx1ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgbm9kZS52YWx1ZSA9IFN0cmluZyh2YWx1ZSlcbiAgfVxuXG4gIHJldHVybiBub2RlXG59XG4iXSwibmFtZXMiOltdLCJpZ25vcmVMaXN0IjpbMF0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(ssr)/./node_modules/unist-builder/index.js\n");

/***/ })

};
;