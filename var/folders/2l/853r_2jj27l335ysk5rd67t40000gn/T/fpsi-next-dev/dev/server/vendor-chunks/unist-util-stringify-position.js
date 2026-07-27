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

eval("\n\nvar own = {}.hasOwnProperty\n\nmodule.exports = stringify\n\nfunction stringify(value) {\n  // Nothing.\n  if (!value || typeof value !== 'object') {\n    return ''\n  }\n\n  // Node.\n  if (own.call(value, 'position') || own.call(value, 'type')) {\n    return position(value.position)\n  }\n\n  // Position.\n  if (own.call(value, 'start') || own.call(value, 'end')) {\n    return position(value)\n  }\n\n  // Point.\n  if (own.call(value, 'line') || own.call(value, 'column')) {\n    return point(value)\n  }\n\n  // ?\n  return ''\n}\n\nfunction point(point) {\n  if (!point || typeof point !== 'object') {\n    point = {}\n  }\n\n  return index(point.line) + ':' + index(point.column)\n}\n\nfunction position(pos) {\n  if (!pos || typeof pos !== 'object') {\n    pos = {}\n  }\n\n  return point(pos.start) + '-' + point(pos.end)\n}\n\nfunction index(value) {\n  return value && typeof value === 'number' ? value : 1\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi9ub2RlX21vZHVsZXMvdW5pc3QtdXRpbC1zdHJpbmdpZnktcG9zaXRpb24vaW5kZXguanMiLCJtYXBwaW5ncyI6IkFBQVk7O0FBRVosWUFBWTs7QUFFWjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBIiwic291cmNlcyI6WyIvVXNlcnMvam9yZ2Vwc2VuZHppdWsvUHJvamV0b3MvZnBzaS9ub2RlX21vZHVsZXMvdW5pc3QtdXRpbC1zdHJpbmdpZnktcG9zaXRpb24vaW5kZXguanMiXSwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnXG5cbnZhciBvd24gPSB7fS5oYXNPd25Qcm9wZXJ0eVxuXG5tb2R1bGUuZXhwb3J0cyA9IHN0cmluZ2lmeVxuXG5mdW5jdGlvbiBzdHJpbmdpZnkodmFsdWUpIHtcbiAgLy8gTm90aGluZy5cbiAgaWYgKCF2YWx1ZSB8fCB0eXBlb2YgdmFsdWUgIT09ICdvYmplY3QnKSB7XG4gICAgcmV0dXJuICcnXG4gIH1cblxuICAvLyBOb2RlLlxuICBpZiAob3duLmNhbGwodmFsdWUsICdwb3NpdGlvbicpIHx8IG93bi5jYWxsKHZhbHVlLCAndHlwZScpKSB7XG4gICAgcmV0dXJuIHBvc2l0aW9uKHZhbHVlLnBvc2l0aW9uKVxuICB9XG5cbiAgLy8gUG9zaXRpb24uXG4gIGlmIChvd24uY2FsbCh2YWx1ZSwgJ3N0YXJ0JykgfHwgb3duLmNhbGwodmFsdWUsICdlbmQnKSkge1xuICAgIHJldHVybiBwb3NpdGlvbih2YWx1ZSlcbiAgfVxuXG4gIC8vIFBvaW50LlxuICBpZiAob3duLmNhbGwodmFsdWUsICdsaW5lJykgfHwgb3duLmNhbGwodmFsdWUsICdjb2x1bW4nKSkge1xuICAgIHJldHVybiBwb2ludCh2YWx1ZSlcbiAgfVxuXG4gIC8vID9cbiAgcmV0dXJuICcnXG59XG5cbmZ1bmN0aW9uIHBvaW50KHBvaW50KSB7XG4gIGlmICghcG9pbnQgfHwgdHlwZW9mIHBvaW50ICE9PSAnb2JqZWN0Jykge1xuICAgIHBvaW50ID0ge31cbiAgfVxuXG4gIHJldHVybiBpbmRleChwb2ludC5saW5lKSArICc6JyArIGluZGV4KHBvaW50LmNvbHVtbilcbn1cblxuZnVuY3Rpb24gcG9zaXRpb24ocG9zKSB7XG4gIGlmICghcG9zIHx8IHR5cGVvZiBwb3MgIT09ICdvYmplY3QnKSB7XG4gICAgcG9zID0ge31cbiAgfVxuXG4gIHJldHVybiBwb2ludChwb3Muc3RhcnQpICsgJy0nICsgcG9pbnQocG9zLmVuZClcbn1cblxuZnVuY3Rpb24gaW5kZXgodmFsdWUpIHtcbiAgcmV0dXJuIHZhbHVlICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicgPyB2YWx1ZSA6IDFcbn1cbiJdLCJuYW1lcyI6W10sImlnbm9yZUxpc3QiOlswXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(ssr)/./node_modules/unist-util-stringify-position/index.js\n");

/***/ })

};
;