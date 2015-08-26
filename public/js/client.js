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
			return ls.getItem(key);
		};

		var fnPut = function lsPutData(key, value)  {
			return ls.setItem(key, value);
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
			})
			.when('/show/:id', {
				templateUrl: 'views/show.html',
				controller:'ShowCtrl'
			});
	})
	.run(function(ls, $location, $faqs){
		if(ls.available) {			
			$faqs.update().then(function(){
				$location.path('/search');
			}, function(){
				$location.path('/noconnect');
			})
		}
	})
	.controller('MainCtrl', function($scope, $faqs, $document){
		
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
			$scope.results = [];
			var text = $scope.srcText;
			text = text.replace(/^\s+/g, '').replace(/\s+$/g, '');

			var dto = { words: [] };

			if(text.indexOf(' ') > -1) {
				dto.words = text.split(' ');
			}
			else {
				dto.words = [text];
			}

			$faqs.search(dto.words)
				.then(function(results){
					console.log(results);
					$scope.results = results;
				});
			
		}

		$scope.$on('$routeChangeSuccess', hook);
	})
	.controller('ShowCtrl', function($scope, $http, $routeParams){
		console.log($routeParams);
		$http({url:'faqs', params: {id: $routeParams.id}})
			.success(function(faq){
				$scope.faq = faq;
			});
	})
	.factory('$faqs', function($http, ls, $q) {
		var api = {};
		var fnGet = function() {
			if(!fnGet.faqs) {
				fnGet.faqs = JSON.parse(ls.get('faqs'));
			}

			return fnGet.faqs;
		};

		var fnGetIndex = function() {
			if(!fnGetIndex.index) {
				fnGetIndex.index = { 
					main: JSON.parse(ls.get('index')),
					keywords: null
				};
				fnGetIndex.index.keywords = Object.keys(fnGetIndex.index.main);
			}
			return fnGetIndex.index;
		};

		var getFaq = function(idx) {
			var d = $q.defer();

			$http({
				url: 'faqs',
				params: {id: idx}
			})
			.success(function(faq){
				d.resolve(faq);
			})
			.error(function() {
				var faqs = fnGet();
				d.resolve(faqs[idx]);
			});

			return d.promise;
		};	

		api.get = getFaq;

		var search = function(list) {
			var d = $q.defer();
			$http({
				url: 'search', 
				method: 'POST', 
				data: {words: list}})
			.success(function(results){
				d.resolve(results);
			})
			.error(function() {
				var results = [];
				list.forEach(function(word){
					var faqs = localSearch(word);
					faqs.forEach(function(faq) {
						if(results.indexOf(faq) === -1) {
							results.push(faq);
						}
					})
				});
				results.local = true;
				d.resolve(results);
			});

			return d.promise;

			function localSearch(kw) {
				var list = [];
				var index = fnGetIndex();
				var faqs = fnGet();
				var filtered = index.keywords.filter(function(x) {
					return x.indexOf(kw) > -1;
				});
				filtered.forEach(function(kw) {
					var hits = index.main[kw];
					hits.forEach(function(idx){
						var faq = faqs[idx];
						if( !(list.indexOf(faq) > -1) ) {
							list.push(faq);
						}
					});
				});
				return list;
			}


		};

		api.search = search;

		var update = function() {
			var d = $q.defer();
			var version = ls.get('version');
			if(version) {
				$http({
					url: '/gist'
				})
				.success(function(gist){
					console.log(gist);
					if(gist.version !== version) {
						ls.set('version', gist.version);
						ls.set('faqs', JSON.stringify(gist.faqs));
						ls.set('index', JSON.stringify(gist.index));
						console.log('updated');
					}
					else {
						console.log('no udpate');
					}
					d.resolve();
				})
				.error(function(){
					d.resolve();
				});
			}
			else {
				$http({
					url: '/gist'
				})
				.success(function(gist){
					ls.set('version', gist.version);
					ls.set('faqs', JSON.stringify(gist.faq));
					ls.set('index', JSON.stringify(gist.index));
					console.log('init');
					d.resolve();
				})
				.error(function(){
					d.reject();
				});				
			}
			return d.promise;
		};

		api.update = update;

		return api;
	});