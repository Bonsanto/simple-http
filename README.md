#simple-http

**simple-http** is a lightweight library that emulates the way how the famous angular `$http` object works.

The library was written in TypeScript, because this language allows the use of some JS tricks and the incorporation of types and
Lamda syntax for its function declarations.</p>

##Setup & install simple-http

This library is really easy to install just execute the next command:

```
bower install simple-http
```

After this you iwll be able to include the ```http.js``` in yout client project.

```html
<script src="bower_components/simple-http/dist/http.json"></script>"
```

##How it works?

This library declares a global variable named `$http` only if it was not declared before, so it will be accessible from any part of your code.

```javascript
if(!$http)
	var $http = new XHR();
```

It allows you to create your own XHR object, which has all the functionalities of `$http`.

```javascript
var http = new XHR();
```

After that you can make the requests `(GET, POST, DELETE or UPDATE)` to the server in three ways.


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

- Using the embedded `$http` methods. If the header is not passed as argument, then the library supposes that a **JSON** will be sent.  

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
- If ```error(...)``` is not necessary.

```javascript
$http.get("./Bonsanto", {
	"name": "Alberto", 
	"lastName": "Dakota", 
	"age": 24
}).success(function (e) {
	document.body.innerHTML += e;
});
```