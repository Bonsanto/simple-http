//todo: include all the media types.
var MEDIA_TYPES:string[] = ["application/json", "application/x-www-form-urlencoded", "text/plain", "text/html"];
var ALLOWED_METHODS:string[] = ["get", "post", "put", "delete"];

var JSSON:Function = json => {
	var sson = json;

	sson.forEach = (fun, newThis?:Object) => {
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

	sson.map = (fun, newThis?:Object):Array<any> => {
		var self = newThis || sson,
			arr:Array<any> = [],
			temp;

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

class XHR {
	private xhr:XMLHttpRequest;

	constructor() {
		var self = this;
		this.xhr = new XMLHttpRequest();

		var executer = (json) => self.call(json.method, json.url, json.data, json.headers);

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

	private call(method:string, url:string, data?:any, dataType?:Object, async:boolean = true):Object {
		var self = this;
		self.xhr.open(method, url, async);

		if (ALLOWED_METHODS.indexOf(method.toLowerCase()) < 0)
			throw TypeError("Method not supported:\n" + "The call " + method + " is not supported");

		//todo: test consistency in the header set by the user.
		if (dataType) JSSON(dataType).forEach((val, pro) => {
			self.xhr.setRequestHeader(pro, val);
		});

		//For a succeeded query.
		return {
			"success": (successCallback:Function):Object => {

				self.xhr.onreadystatechange = () => {
					if (self.xhr.status === 200 && self.xhr.readyState === 4) {
						successCallback.call(this, self.xhr.response, self.xhr.getAllResponseHeaders());
					} else if (self.xhr.status !== 200 && self.xhr.readyState === 4) {
						throw Error("Data not received:\n" + "Details: " + self.xhr.statusText);
					}
				};

				//If the data passed is a JSON and the dataType is an x-www ... convert the json to a string
				//Todo: needs improvement for arrays, objects and others.
				if (data.constructor.name === "Object" &&
					dataType["Content-Type"] === "application/x-www-form-urlencoded") {
					data = JSSON(data)
						.map((value:any, key:string) =>
							key.concat("=").concat(value))
						.join("&");
				}

				//If data was passed send it, some people use get, put, delete to send data...:(
				data ? self.xhr.send(data) : self.xhr.send();

				//If error is present
				return {
					"error": (errorCallback:Function):void => {
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

	public get(url:string, parameters:Object, data?:any, dataType?:Object, async:boolean = true):Object {
		return this.call("GET", this.buildURL(url, parameters), data, dataType, async);
	}

	public post(url:string, data?:any, dataType?:Object, async:boolean = true):Object {
		var DEFAULT_POST_HEADER:Object = {
			"Content-Type": "application/json"
		};

		return this.call("POST", url, data, dataType || DEFAULT_POST_HEADER, async);
	}

	public put(url:string, parameters:Object, data?:any, dataType?:Object, async:boolean = true):Object {
		return this.call("PUT", this.buildURL(url, parameters), data, dataType, async);
	}

	public delete(url:string, parameters:Object, data?:any, dataType?:Object, async:boolean = true):Object {
		return this.call("DELETE", this.buildURL(url, parameters), data, dataType, async);
	}

	//This call receives a object and writes the parameters from it.
	private buildURL = (baseURI:string, params:Object):string => baseURI + "?" + JSSON(params).map((value, att) => att + "=" + (value.constructor === Array ? value.join(",") : value)).join("&")

}

if (!$http)
	var $http = new XHR();