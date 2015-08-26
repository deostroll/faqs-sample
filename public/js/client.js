angular.module('clientApp', ['ngRoute'])
	.factory('ls', function($window){
		var ls = $window.localStorage;
		var api = {
			available: true
		};
		if(!ls) {
			api.available = false;
			return api;
		}

		var fnGet = function lsGetData(key) {
			return ls.get(key);
		};

		var fnPut = function lsPutData(key, value)  {
			return ls.set(key, value);
		};

		api.get = fnGet;
		api.set = fnPut;

		return api;
	})
	.config(function($routeProvider){
		$routeProvider
			.when('/search', {
				templateUrl: 'views/main.html',
				controller: 'MainCtrl'
			})
			.when('/nosupport', {
				tempalteUrl: 'views/nosupport.html'
			});
	})
	.run(function(ls, $location){
		if(ls.available) {
			$location.path('/search');
		}
	})
	.controller('MainCtrl', function($scope, $http, $q, $document){
		
		function hook() {
			var d = $document[0];
			var inp = d.getElementsByTagName('input')[0];
			angular.element(inp).bind('keyup', function($evt){
				//console.log($evt.keyCode);
				if($evt.keyCode === 13) {
					search();
				}
			});
		}

		function search() {
			var text = $scope.srcText;
			var dto = { words: text.split(' ') };
			$http.post('search', dto)
			.success(function(sr){
				console.log(sr);
			})
			.error(function(err){
				console.log('Error:', err);
			})
		}

		$scope.$on('$routeChangeSuccess', hook);
	});