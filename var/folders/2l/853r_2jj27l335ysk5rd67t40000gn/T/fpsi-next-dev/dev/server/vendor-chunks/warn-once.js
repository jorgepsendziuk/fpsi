/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/warn-once";
exports.ids = ["vendor-chunks/warn-once"];
exports.modules = {

/***/ "(ssr)/./node_modules/warn-once/index.js":
/*!*****************************************!*\
  !*** ./node_modules/warn-once/index.js ***!
  \*****************************************/
/***/ ((module) => {

eval("const DEV = \"development\" !== \"production\";\n\nconst warnings = new Set();\n\nfunction warnOnce(condition, ...rest) {\n  if (DEV && condition) {\n    const key = rest.join(\" \");\n\n    if (warnings.has(key)) {\n      return;\n    }\n\n    warnings.add(key);\n    console.warn(...rest);\n  }\n}\n\nmodule.exports = warnOnce;\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi9ub2RlX21vZHVsZXMvd2Fybi1vbmNlL2luZGV4LmpzIiwibWFwcGluZ3MiOiJBQUFBLFlBQVksYUFBb0I7O0FBRWhDOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUEiLCJzb3VyY2VzIjpbIi9Vc2Vycy9qb3JnZXBzZW5keml1ay9Qcm9qZXRvcy9mcHNpL25vZGVfbW9kdWxlcy93YXJuLW9uY2UvaW5kZXguanMiXSwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgREVWID0gcHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09IFwicHJvZHVjdGlvblwiO1xuXG5jb25zdCB3YXJuaW5ncyA9IG5ldyBTZXQoKTtcblxuZnVuY3Rpb24gd2Fybk9uY2UoY29uZGl0aW9uLCAuLi5yZXN0KSB7XG4gIGlmIChERVYgJiYgY29uZGl0aW9uKSB7XG4gICAgY29uc3Qga2V5ID0gcmVzdC5qb2luKFwiIFwiKTtcblxuICAgIGlmICh3YXJuaW5ncy5oYXMoa2V5KSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHdhcm5pbmdzLmFkZChrZXkpO1xuICAgIGNvbnNvbGUud2FybiguLi5yZXN0KTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHdhcm5PbmNlO1xuIl0sIm5hbWVzIjpbXSwiaWdub3JlTGlzdCI6WzBdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(ssr)/./node_modules/warn-once/index.js\n");

/***/ })

};
;