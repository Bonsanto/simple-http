//todo: include all the media types.
var MEDIA_TYPES = ["application/json", "application/x-www-form-urlencoded", "text/plain", "text/html"];
var ALLOWED_METHODS = ["get", "post", "put", "delete"];
var JSSON = function (json) {
    var sson = json;
    sson.forEach = function (fun, newThis) {
        var self = newThis || sson;
        if (self == null)
            throw new TypeError('this is null or not defined');
        if (typeof fun !== "function")
            throw new TypeError(fun + " is not a function");
        for (var property in self) {
            if (self.hasOwnProperty(property) && typeof self[property] !== "function")
                fun.call(self, self[property], property, self);
        }
    };
    sson.map = function (fun, newThis) {
        var self = newThis || sson, arr = [], temp;
        if (self == null)
            throw new TypeError('this is null or not defined');
        if (typeof fun !== "function")
            throw new TypeError(fun + " is not a function");
        for (var property in self) {
            if (self.hasOwnProperty(property) && typeof self[property] !== "function") {
                temp = fun.call(self, self[property], property, self);
                if (temp !== undefined)
                    arr.push(temp);
            }
        }
        return arr;
    };
    return sson;
};
var XHR = (function () {
    function XHR() {
        //This call receives a object and writes the parameters from it.
        this.buildURL = function (baseURI, params) { return baseURI + "?" + JSSON(params).map(function (value, att) { return att + "=" + (value.constructor === Array ? value.join(",") : value); }).join("&"); };
        var self = this;
        this.xhr = new XMLHttpRequest();
        var executer = function (json) { return self.call(json.method, json.url, json.data, json.headers); };
        executer["call"] = self["call"];
        executer["buildURL"] = self["buildURL"];
        executer["get"] = self["get"];
        executer["post"] = self["post"];
        executer["put"] = self["put"];
        executer["delete"] = self["delete"];
        executer["xhr"] = new XMLHttpRequest();
        //Dirty but powerful.
        return executer;
    }
    XHR.prototype.call = function (method, url, data, dataType, async) {
        var _this = this;
        if (async === void 0) { async = true; }
        var self = this;
        self.xhr.open(method, url, async);
        if (ALLOWED_METHODS.indexOf(method.toLowerCase()) < 0)
            throw TypeError("Method not supported:\n" + "The call " + method + " is not supported");
        //todo: test consistency in the header set by the user.
        if (dataType)
            JSSON(dataType).forEach(function (val, pro) {
                self.xhr.setRequestHeader(pro, val);
            });
        //For a succeeded query.
        return {
            "success": function (successCallback) {
                self.xhr.onreadystatechange = function () {
                    if (self.xhr.status === 200 && self.xhr.readyState === 4) {
                        successCallback.call(_this, self.xhr.response, self.xhr.getAllResponseHeaders());
                    }
                    else if (self.xhr.status !== 200 && self.xhr.readyState === 4) {
                        throw Error("Data not received:\n" + "Details: " + self.xhr.statusText);
                    }
                };
                //If the data passed is a JSON and the dataType is an x-www ... convert the json to a string
                //Todo: needs improvement for arrays, objects and others.
                if (data.constructor.name === "Object" && dataType["Content-Type"] === "application/x-www-form-urlencoded") {
                    data = JSSON(data).map(function (value, key) { return key.concat("=").concat(value); }).join("&");
                }
                else if (data.constructor.name === "Object" && dataType["Content-Type"] === "application/json") {
                    data = JSON.stringify(data);
                }
                //If data was passed send it, some people use get, put, delete to send data...:(
                data ? self.xhr.send(data) : self.xhr.send();
                //If error is present
                return {
                    "error": function (errorCallback) {
                        self.xhr.onreadystatechange = function () {
                            if (self.xhr.status === 200 && self.xhr.readyState === 4) {
                                successCallback.call(_this, self.xhr.response, self.xhr.getAllResponseHeaders());
                            }
                            else if (self.xhr.status !== 200 && self.xhr.readyState === 4) {
                                errorCallback.call(_this, self.xhr.statusText, self.xhr.getAllResponseHeaders());
                            }
                        };
                    }
                };
            }
        };
    };
    XHR.prototype.get = function (url, parameters, data, dataType, async) {
        if (async === void 0) { async = true; }
        return this.call("GET", this.buildURL(url, parameters), data, dataType, async);
    };
    XHR.prototype.post = function (url, data, dataType, async) {
        if (async === void 0) { async = true; }
        var DEFAULT_POST_HEADER = {
            "Content-Type": "application/json"
        };
        return this.call("POST", url, data, dataType || DEFAULT_POST_HEADER, async);
    };
    XHR.prototype.put = function (url, parameters, data, dataType, async) {
        if (async === void 0) { async = true; }
        return this.call("PUT", this.buildURL(url, parameters), data, dataType, async);
    };
    XHR.prototype.delete = function (url, parameters, data, dataType, async) {
        if (async === void 0) { async = true; }
        return this.call("DELETE", this.buildURL(url, parameters), data, dataType, async);
    };
    return XHR;
})();
if (!$http)
    var $http = new XHR();
//# sourceMappingURL=http.js.map