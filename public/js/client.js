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
	.controller('MainCtrl', function($scope, $http, $q){
		var canceler;
		$scope.$watch('srcText', function(n) {
			

			if(canceler && canceler.resolve) {
				canceler.resolve();
			}
			if(n.length === 0) return;
			canceler = $q.defer();
			$http.post('search', {words: ['tax', 'refunds']})
				.then(function(data) {
					console.log(data);
				});
		});
	});