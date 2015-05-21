//todo: include all the media types.
var MEDIA_TYPES = ["application/json", "application/x-www-form-urlencoded", "text/plain", "text/html"];
var ALLOWED_METHODS = ["get", "post", "put", "delete"];

var JSSON = json => {
	var sson = json;

	sson.forEach = function (fun, newThis) {
		var self = newThis || this;

		if (this == null)
			throw new TypeError('this is null or not defined');
		if (typeof fun !== "function")
			throw new TypeError(fun + " is not a function");
		for (var property in self) {
			if (self.hasOwnProperty(property) && typeof self[property] !== "function")
				fun.call(self, self[property], property, self);
		}
	};

	sson.map = function (fun, newThis) {
		var self = newThis || this, arr = [], temp;

		if (this == null)
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

class XHR {
	private xhr:XMLHttpRequest;

	constructor() {
		this.xhr = new XMLHttpRequest();
	}

	private method(method:string, url:string, data?:any, dataType?:Object, async:boolean = true):any {
		var self = this;
		self.xhr.open(method, url, async);

		//todo: improve the exception implementation.
		if (ALLOWED_METHODS.indexOf(method.toLowerCase()) < 0)
			throw TypeError("Method not supported:\n" + "The method " + method + " is not supported");

		//todo: test consistency in the header set by the user.
		if (dataType) JSSON(dataType).forEach((val, pro) => {
			self.xhr.setRequestHeader(pro, val);
		});

		//For a succeeded query.
		return {
			"success": (successCallback:Function) => {

				self.xhr.onreadystatechange = () => {
					if (self.xhr.status === 200 && self.xhr.readyState === 4) {
						successCallback.call(this, self.xhr.response, self.xhr.getAllResponseHeaders());
					} else if (self.xhr.status !== 200 && self.xhr.readyState === 4) {
						throw Error("Data not received:\n" + "Details: " + self.xhr.statusText);
					}
				};

				//If data was passed send it, some people use get, put, delete to send data...:(.
				data ? self.xhr.send(data) : self.xhr.send();

				//If error is present
				return {
					"error": (errorCallback:Function) => {
						self.xhr.onreadystatechange = () => {
							if (self.xhr.status === 200 && self.xhr.readyState === 4) {
								successCallback.call(this, self.xhr.response, self.xhr.getAllResponseHeaders());
							} else if (self.xhr.status !== 200 && self.xhr.readyState === 4) {
								errorCallback.call(this, self.xhr.statusText, self.xhr.getAllResponseHeaders())
							}
						};
					}
				};
			}
		};
	}

	public get(url:string, parameters:Object, data?:any, dataType?:Object, async:boolean = true):Function {
		return this.method("GET", this.buildURL(url, parameters), data, dataType, async);
	}

	public post(url:string, data?:any, dataType?:Object, async:boolean = true):Function {
		var DEFAULT_POST_HEADER:Object = {
			"Content-Type": "application/json"
		};

		return this.method("POST", url, data, dataType || DEFAULT_POST_HEADER, async);
	}

	public put(url:string, parameters:Object, data?:any, dataType?:Object, async:boolean = true):Function {
		return this.method("PUT", this.buildURL(url, parameters), data, dataType, async);
	}

	public delete(url:string, parameters:Object, data?:any, dataType?:Object, async:boolean = true):Function {
		return this.method("DELETE", this.buildURL(url, parameters), data, dataType, async);
	}

	//This method receives a object and writes the parameters from it.
	private buildURL = (baseURI:string, params:Object):string => baseURI + "?" + JSSON(params).map((value, att) => att + "=" + (value.constructor === Array ? value.join(",") : value)).join("&")

}

if (!$http) $http = new XHR();