app.service('bckcommon', function() {
	this.setFavicon		= function($scope, int) {
		$scope.favIcon	= '/favicon.gif';

		int(function () {
			$scope.favIcon	= '/favicon.png';
		}, 5000);
	};

	this.setMenu		= function($scope) {
		$scope.menuItems		= [];
		$scope.midMenuItems		= [];

		$scope.genMenu			= function(i, j) {
			for(e = 0; e < i; e++) $scope.midMenuItems.push('');
			for(e = 0; e < j; e++) $scope.menuItems.push('');
		}

		$scope.midMenuItemClick	= function(i) {
			$scope.midMenuItems[i]	= $scope.midMenuItems[i] == 'active' ? '' : 'active';
		}

		$scope.menuItemClick	= function(i) {
			for(e = 0; e < $scope.menuItems.length; e++) $scope.menuItems[e]	= '';
			$scope.menuItems[i]	= 'current-menu-item';
		}
	};
});

app.controller('modalCtrl', function($scope) { });