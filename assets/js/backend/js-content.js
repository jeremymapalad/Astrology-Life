var app = angular.module('astroBackend', ['ngRoute', 'ngAnimate', 'ngSanitize', 'angularModalService']);

app.config(function($routeProvider) {
	$routeProvider
	.when('/:id?', {
		templateUrl : '/modcontent/home',
		controller : 'mainCtrl'
	});
	//.otherwise({ redirectTo: '#/' });
});

app.controller('mainCtrl', function($scope, $timeout, bckcommon, ModalService) {
	bckcommon.setFavicon($scope, $timeout);
	bckcommon.setMenu($scope);
});