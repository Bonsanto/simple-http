http
====
`http` is a lightweight library that emulates the way how the famous angular `$http` object works.

The library was written in TypeScript, because this language allows the use of some JS tricks and the incorporation of types and
Lamda syntax for its function declarations.</p>

How it works?
-------------
This library declares a global variable named `$http` only if it is not declared, so it will be accessible from any part of your code...

```javascript
if(!$http)
	var $http = new XHR();
```

It allows you to create your own XHR object, which has all the functionalities of $http...

```javascript
var http = new XHR();
```

After that you can make the requests `(GET, POST, DELETE or UPDATE)` to the server in two ways.

- Using `$http` as a function.
```javascript
$http({
	method: "POST",
	url: "./Bonsanto",
	headers: {
		"Content-Type": "application/x-www-form-urlencoded",
	},
	data: "name=Dakota&lastname=Bonsanto"
}).success(function (data) {
	console.log(data);
}).error(function (data) {
	console.log(data);
});
```
- Using the embedded `$http` methods.
```javascript
$http.get("./Bonsanto", {
	"name": "Dakota",
	"lastName": "Bonsanto",
	"age": 3
}).success(function (e) {
	document.body.innerHTML += e;
}).error(function (e) {
	console.log(e);
});
```