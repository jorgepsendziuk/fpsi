"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/unist-util-stringify-position";
exports.ids = ["vendor-chunks/unist-util-stringify-position"];
exports.modules = {

/***/ "(ssr)/./node_modules/unist-util-stringify-position/index.js":
/*!*************************************************************!*\
  !*** ./node_modules/unist-util-stringify-position/index.js ***!
  \*************************************************************/
/***/ ((module) => {

eval("\n\nvar own = {}.hasOwnProperty\n\nmodule.exports = stringify\n\nfunction stringify(value) {\n  // Nothing.\n  if (!value || typeof value !== 'object') {\n    return ''\n  }\n\n  // Node.\n  if (own.call(value, 'position') || own.call(value, 'type')) {\n    return position(value.position)\n  }\n\n  // Position.\n  if (own.call(value, 'start') || own.call(value, 'end')) {\n    return position(value)\n  }\n\n  // Point.\n  if (own.call(value, 'line') || own.call(value, 'column')) {\n    return point(value)\n  }\n\n  // ?\n  return ''\n}\n\nfunction point(point) {\n  if (!point || typeof point !== 'object') {\n    point = {}\n  }\n\n  return index(point.line) + ':' + index(point.column)\n}\n\nfunction position(pos) {\n  if (!pos || typeof pos !== 'object') {\n    pos = {}\n  }\n\n  return point(pos.start) + '-' + point(pos.end)\n}\n\nfunction index(value) {\n  return value && typeof value === 'number' ? value : 1\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi9ub2RlX21vZHVsZXMvdW5pc3QtdXRpbC1zdHJpbmdpZnktcG9zaXRpb24vaW5kZXguanMiLCJtYXBwaW5ncyI6IkFBQVk7O0FBRVosWUFBWTs7QUFFWjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBIiwic291cmNlcyI6WyIvVXNlcnMvam9yZ2Vwc2VuZHppdWsvRG9jdW1lbnRzL2Zwc2kvbm9kZV9tb2R1bGVzL3VuaXN0LXV0aWwtc3RyaW5naWZ5LXBvc2l0aW9uL2luZGV4LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0J1xuXG52YXIgb3duID0ge30uaGFzT3duUHJvcGVydHlcblxubW9kdWxlLmV4cG9ydHMgPSBzdHJpbmdpZnlcblxuZnVuY3Rpb24gc3RyaW5naWZ5KHZhbHVlKSB7XG4gIC8vIE5vdGhpbmcuXG4gIGlmICghdmFsdWUgfHwgdHlwZW9mIHZhbHVlICE9PSAnb2JqZWN0Jykge1xuICAgIHJldHVybiAnJ1xuICB9XG5cbiAgLy8gTm9kZS5cbiAgaWYgKG93bi5jYWxsKHZhbHVlLCAncG9zaXRpb24nKSB8fCBvd24uY2FsbCh2YWx1ZSwgJ3R5cGUnKSkge1xuICAgIHJldHVybiBwb3NpdGlvbih2YWx1ZS5wb3NpdGlvbilcbiAgfVxuXG4gIC8vIFBvc2l0aW9uLlxuICBpZiAob3duLmNhbGwodmFsdWUsICdzdGFydCcpIHx8IG93bi5jYWxsKHZhbHVlLCAnZW5kJykpIHtcbiAgICByZXR1cm4gcG9zaXRpb24odmFsdWUpXG4gIH1cblxuICAvLyBQb2ludC5cbiAgaWYgKG93bi5jYWxsKHZhbHVlLCAnbGluZScpIHx8IG93bi5jYWxsKHZhbHVlLCAnY29sdW1uJykpIHtcbiAgICByZXR1cm4gcG9pbnQodmFsdWUpXG4gIH1cblxuICAvLyA/XG4gIHJldHVybiAnJ1xufVxuXG5mdW5jdGlvbiBwb2ludChwb2ludCkge1xuICBpZiAoIXBvaW50IHx8IHR5cGVvZiBwb2ludCAhPT0gJ29iamVjdCcpIHtcbiAgICBwb2ludCA9IHt9XG4gIH1cblxuICByZXR1cm4gaW5kZXgocG9pbnQubGluZSkgKyAnOicgKyBpbmRleChwb2ludC5jb2x1bW4pXG59XG5cbmZ1bmN0aW9uIHBvc2l0aW9uKHBvcykge1xuICBpZiAoIXBvcyB8fCB0eXBlb2YgcG9zICE9PSAnb2JqZWN0Jykge1xuICAgIHBvcyA9IHt9XG4gIH1cblxuICByZXR1cm4gcG9pbnQocG9zLnN0YXJ0KSArICctJyArIHBvaW50KHBvcy5lbmQpXG59XG5cbmZ1bmN0aW9uIGluZGV4KHZhbHVlKSB7XG4gIHJldHVybiB2YWx1ZSAmJiB0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInID8gdmFsdWUgOiAxXG59XG4iXSwibmFtZXMiOltdLCJpZ25vcmVMaXN0IjpbMF0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(ssr)/./node_modules/unist-util-stringify-position/index.js\n");

/***/ })

};
;