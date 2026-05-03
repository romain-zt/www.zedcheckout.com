"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "_rsc_packages_email_src___test-double_index_ts";
exports.ids = ["_rsc_packages_email_src___test-double_index_ts"];
exports.modules = {

/***/ "(rsc)/../../packages/email/src/__test-double/index.ts":
/*!*******************************************************!*\
  !*** ../../packages/email/src/__test-double/index.ts ***!
  \*******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   InMemoryEmailSender: () => (/* binding */ InMemoryEmailSender)\n/* harmony export */ });\nclass InMemoryEmailSender {\n    async send(params) {\n        if (this.shouldFail) {\n            return {\n                id: '',\n                success: false\n            };\n        }\n        const id = `email_${++this.counter}`;\n        this.sentEmails.push({\n            ...params,\n            id\n        });\n        return {\n            id,\n            success: true\n        };\n    }\n    reset() {\n        this.sentEmails.length = 0;\n        this.counter = 0;\n        this.shouldFail = false;\n    }\n    constructor(){\n        this.sentEmails = [];\n        this.counter = 0;\n        this.shouldFail = false;\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi4vLi4vcGFja2FnZXMvZW1haWwvc3JjL19fdGVzdC1kb3VibGUvaW5kZXgudHMiLCJtYXBwaW5ncyI6Ijs7OztBQUVPLE1BQU1BO0lBS1gsTUFBTUMsS0FBS0MsTUFBdUIsRUFBNEI7UUFDNUQsSUFBSSxJQUFJLENBQUNDLFVBQVUsRUFBRTtZQUNuQixPQUFPO2dCQUFFQyxJQUFJO2dCQUFJQyxTQUFTO1lBQU07UUFDbEM7UUFFQSxNQUFNRCxLQUFLLENBQUMsTUFBTSxFQUFFLEVBQUUsSUFBSSxDQUFDRSxPQUFPLEVBQUU7UUFDcEMsSUFBSSxDQUFDQyxVQUFVLENBQUNDLElBQUksQ0FBQztZQUFFLEdBQUdOLE1BQU07WUFBRUU7UUFBRztRQUNyQyxPQUFPO1lBQUVBO1lBQUlDLFNBQVM7UUFBSztJQUM3QjtJQUVBSSxRQUFjO1FBQ1osSUFBSSxDQUFDRixVQUFVLENBQUNHLE1BQU0sR0FBRztRQUN6QixJQUFJLENBQUNKLE9BQU8sR0FBRztRQUNmLElBQUksQ0FBQ0gsVUFBVSxHQUFHO0lBQ3BCOzthQWxCU0ksYUFBc0QsRUFBRTthQUN6REQsVUFBVTthQUNsQkgsYUFBYTs7QUFpQmYiLCJzb3VyY2VzIjpbIi9Vc2Vycy9yb21haW5waXZldGVhdS9Qcm9qZWN0cy9aZWRUZWNoL3d3dy56ZWRjaGVja291dC5jb20vcGFja2FnZXMvZW1haWwvc3JjL19fdGVzdC1kb3VibGUvaW5kZXgudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUgeyBFbWFpbFNlbmRlciwgU2VuZEVtYWlsUGFyYW1zLCBTZW5kRW1haWxSZXN1bHQgfSBmcm9tICcuLi9pbmRleCc7XG5cbmV4cG9ydCBjbGFzcyBJbk1lbW9yeUVtYWlsU2VuZGVyIGltcGxlbWVudHMgRW1haWxTZW5kZXIge1xuICByZWFkb25seSBzZW50RW1haWxzOiBBcnJheTxTZW5kRW1haWxQYXJhbXMgJiB7IGlkOiBzdHJpbmcgfT4gPSBbXTtcbiAgcHJpdmF0ZSBjb3VudGVyID0gMDtcbiAgc2hvdWxkRmFpbCA9IGZhbHNlO1xuXG4gIGFzeW5jIHNlbmQocGFyYW1zOiBTZW5kRW1haWxQYXJhbXMpOiBQcm9taXNlPFNlbmRFbWFpbFJlc3VsdD4ge1xuICAgIGlmICh0aGlzLnNob3VsZEZhaWwpIHtcbiAgICAgIHJldHVybiB7IGlkOiAnJywgc3VjY2VzczogZmFsc2UgfTtcbiAgICB9XG5cbiAgICBjb25zdCBpZCA9IGBlbWFpbF8keysrdGhpcy5jb3VudGVyfWA7XG4gICAgdGhpcy5zZW50RW1haWxzLnB1c2goeyAuLi5wYXJhbXMsIGlkIH0pO1xuICAgIHJldHVybiB7IGlkLCBzdWNjZXNzOiB0cnVlIH07XG4gIH1cblxuICByZXNldCgpOiB2b2lkIHtcbiAgICB0aGlzLnNlbnRFbWFpbHMubGVuZ3RoID0gMDtcbiAgICB0aGlzLmNvdW50ZXIgPSAwO1xuICAgIHRoaXMuc2hvdWxkRmFpbCA9IGZhbHNlO1xuICB9XG59XG4iXSwibmFtZXMiOlsiSW5NZW1vcnlFbWFpbFNlbmRlciIsInNlbmQiLCJwYXJhbXMiLCJzaG91bGRGYWlsIiwiaWQiLCJzdWNjZXNzIiwiY291bnRlciIsInNlbnRFbWFpbHMiLCJwdXNoIiwicmVzZXQiLCJsZW5ndGgiXSwiaWdub3JlTGlzdCI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/../../packages/email/src/__test-double/index.ts\n");

/***/ })

};
;