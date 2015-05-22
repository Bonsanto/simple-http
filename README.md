http
====
<p>$http is a lightweight library that emulates the way how the angular $http object works.</p>
<p>The library was written in TypeScript, this language allows the use of some JS tricks and the incorporation of types and
Lamda syntax for its function declarations.</p>

How it works?
-------------
This library declares a global variable named $http only if it is not declared, so it will be accessible from any part of your code...

```javascript
$http...
```

It allows you to create your own XHR object, which has all the functionalities of $http...

```javascript
var http = new XHR();
```

After that you can execute the requests to the server in two ways.

- Using $http as a function.
```javascript
		$http({
			method: "POST",
			url: "./Bonsanto",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
			},
			data: "name=Alberto&lastname=Bonsanto"
		}).success(function (data) {
			console.log(data);
		}).error(function (data) {
			console.log(data);
		});
```