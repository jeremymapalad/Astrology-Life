var app = angular.module('astroBackend', ['ngRoute', 'ngAnimate', 'ngSanitize', 'angularModalService']);

app.config(function($routeProvider) {
	$routeProvider
	.when('/:id?', {
		templateUrl : '/modticketing/home',
		controller : 'homeCtrl'
	})
	.when('/ticket/:id', {
		templateUrl : '/modticketing/ticket',
		controller : 'ticketCtrl'
	});
	//.otherwise({ redirectTo: '#/' });
});

app.controller('homeCtrl', function($scope, $routeParams, $http, $timeout, ModalService, tktFact) {
	$scope.id				= $routeParams.id;
	$scope.errorMsg			= '';
	$scope.sortBy			= 'utime';
	$scope.sortDir			= true;
	tktFact.masterCallback	= refreshTickets;

	function refreshTickets() {
		$scope.oTickets			= null;
		$scope.nTickets			= null;
		$scope.aTickets			= null;
		$scope.cTickets			= null;
		$scope.wTickets			= null;
		$scope.oldestTicket		= null;
		$scope.oldTicketAgo		= '';
		$scope.stats			= {};
		$scope.activeTickets	= null;
		$scope.ticketsEnabled	= false;
		$scope.errorMsg			= '';
		tktFact.tickets			= null;
		tktFact.callback		= null;

		$http.get('/modticketing/getStats' + ($scope.id ? '/' + $scope.id : ''))
		.then(function(response) {
			if(response.data.error == 0)
				$scope.stats	= response.data.stats;
			else
				$scope.errorMsg	= response.data.message;
		}, function(response) {
			$scope.errorMsg	= 'An error has occurred. Please try again later.';
		});

		$scope.getOldestTicket(false);
		$scope.getAllTickets();
	}

	function getSortText(st) {
		srt	= '';

		switch(st){
		case 1:
			srt	= 'email';
			break;
		case 2:
			srt	= 'ctime';
			break;
		case 3:
			srt	= 'utime';
			break;
		}

		return srt;
	}

	function changeActiveTickets(col) {
		if($scope.activeTickets == col) return;

		if(col)
			for(i = 0; i < col.length; i++)
				i.checked = false;

		$scope.ticketsEnabled	= false;
		$scope.activeTickets	= null;
		$scope.errorMsg			= 'Loading';
		tktFact.tickets			= null;
		tktFact.callback		= null;

		$timeout(function () {
			$scope.errorMsg			= '';
			$scope.activeTickets	= col;
		}, 1000);
	}

	$scope.changeCheck			= function(x) {
		if(x.checked) $scope.ticketsEnabled	= true;
		else if($scope.activeTickets) {
			$scope.ticketsEnabled	= false;
	
			for(i = 0; i < $scope.activeTickets.length; i++)
				if($scope.activeTickets[i].checked) {
					$scope.ticketsEnabled	= true;
					break;
				}
		}
	};

	$scope.btnColorStatus		= function(x) {
		ts	= parseInt(x.status);

		switch(ts) {
		case 0:
			return 'btn-blue';
		case 1:
			return 'btn-green';
		case 2:
			return 'btn-gray';
		case 3:
			return 'btn-orange';
		}

		return 'btn-green';
	};

	$scope.assignTicketsTo		= function() {
		ret	= [];

		for(i = 0; i < $scope.activeTickets.length; i++)
			if($scope.activeTickets[i].checked)
				ret.push($scope.activeTickets[i].id);

		if(ret.length <= 0) return;
		tktFact.tickets		= ret;

		ModalService.showModal({
			templateUrl : '/modticketing/assignTicketTo',
			controller : 'assignCtrl'
		}).then(function(modal) {
			modal.element.modal();
		});
	};

	$scope.moveTicketsTo		= function() {
		ret	= [];

		for(i = 0; i < $scope.activeTickets.length; i++)
			if($scope.activeTickets[i].checked)
				ret.push($scope.activeTickets[i].id);

		if(ret.length <= 0) return;
		tktFact.tickets		= ret;

		ModalService.showModal({
			templateUrl : '/modticketing/moveTicketTo',
			controller : 'moveCtrl'
		}).then(function(modal) {
			modal.element.modal();
		});
	};

	$scope.deleteTickets		= function() {
		ret	= [];

		for(i = 0; i < $scope.activeTickets.length; i++)
			if($scope.activeTickets[i].checked)
				ret.push($scope.activeTickets[i].id);

		if(ret.length <= 0) return;
		tktFact.tickets		= ret;

		ModalService.showModal({
			templateUrl : '/modticketing/deleteTicket',
			controller : 'deleteCtrl'
		}).then(function(modal) {
			modal.element.modal();
		});
	};

	$scope.changeSort			= function(st) {
		srt	= getSortText(st);

		if($scope.sortBy == srt) {
			$scope.sortDir	= !$scope.sortDir;
			return;
		}

		$scope.sortBy	= srt;
	};

	$scope.sortClassI			= function(st) {
		srt	= getSortText(st);
		return $scope.sortDir ? 'fa-angle-up' : 'fa-angle-down';
	};

	$scope.sortClassA			= function(st) {
		srt	= getSortText(st);
		return $scope.sortBy == srt ? 'filtered ' : '';
	};

	$scope.getOldestTicket		= function(update) {
		if($scope.oldestTicket) {
			if(update) changeActiveTickets($scope.oldestTicket);
			return;
		}

		$http.get('/modticketing/getOldestTicket' + ($scope.id ? '/' + $scope.id : ''))
		.then(function(response) {
			if(response.data.error == 0) {
				if(response.data.count > 0) {
					$scope.oldestTicket		= response.data.tckts;
					$scope.oldTicketAgo		= $scope.oldestTicket[0].ago;
					if(update) changeActiveTickets($scope.oldestTicket);
				}
				else {
					$scope.oldestTicket		= [];
					$scope.oldTicketAgo		= '0h';
					if(update) changeActiveTickets(null);
				}
			}
			else
				$scope.errorMsg	= response.data.message;
		}, function(response) {
			$scope.errorMsg	= 'An error has occurred. Please try again later.';
		});
	};

	$scope.getOpenTickets		= function() {
		if($scope.oTickets) {
			changeActiveTickets($scope.oTickets);
			return;
		}

		$http.get('/modticketing/getOpenTickets' + ($scope.id ? '/' + $scope.id : ''))
		.then(function(response) {
			if(response.data.error == 0) {
				if(response.data.count > 0) {
					$scope.oTickets					= response.data.tckts;
					$scope.stats.openTicketCount	= response.data.count;
					changeActiveTickets($scope.oTickets);
				}
				else {
					$scope.oTickets					= [];
					$scope.stats.openTicketCount	= 0;
					changeActiveTickets(null);
				}
			}
			else
				$scope.errorMsg	= response.data.message;
		}, function(response) {
			$scope.errorMsg	= 'An error has occurred. Please try again later.';
		});
	};

	$scope.getWaitingTickets	= function() {
		if($scope.wTickets) {
			changeActiveTickets($scope.wTickets);
			return;
		}

		$http.get('/modticketing/getWaitTickets' + ($scope.id ? '/' + $scope.id : ''))
		.then(function(response) {
			if(response.data.error == 0) {
				if(response.data.count > 0) {
					$scope.wTickets					= response.data.tckts;
					$scope.stats.waitTicketCount	= response.data.count;
					changeActiveTickets($scope.wTickets);
				}
				else {
					$scope.wTickets					= [];
					$scope.stats.waitTicketCount	= 0;
					changeActiveTickets(null);
				}
			}
			else
				$scope.errorMsg	= response.data.message;
		}, function(response) {
			$scope.errorMsg	= 'An error has occurred. Please try again later.';
		});
	};

	$scope.getNewTickets		= function() {
		if($scope.nTickets) {
			changeActiveTickets($scope.nTickets);
			return;
		}

		$http.get('/modticketing/getNewTickets' + ($scope.id ? '/' + $scope.id : ''))
		.then(function(response) {
			if(response.data.error == 0) {
				if(response.data.count > 0) {
					$scope.nTickets					= response.data.tckts;
					$scope.stats.newTicketCount		= response.data.count;
					changeActiveTickets($scope.nTickets);
				}
				else {
					$scope.nTickets					= [];
					$scope.stats.newTicketCount		= 0;
					changeActiveTickets(null);
				}
			}
			else
				$scope.errorMsg	= response.data.message;
		}, function(response) {
			$scope.errorMsg	= 'An error has occurred. Please try again later.';
		});
	};

	$scope.getAllTickets		= function() {
		if($scope.aTickets) {
			changeActiveTickets($scope.aTickets);
			return;
		}

		$http.get('/modticketing/getAllTickets' + ($scope.id ? '/' + $scope.id : ''))
		.then(function(response) {
			if(response.data.error == 0) {
				if(response.data.count > 0) {
					$scope.aTickets				= response.data.tckts;
					$scope.stats.allTicketCount	= response.data.count;
					changeActiveTickets($scope.aTickets);
				}
				else {
					$scope.aTickets				= [];
					$scope.stats.allTicketCount	= 0;
					changeActiveTickets(null);
				}
			}
			else
				$scope.errorMsg	= response.data.message;
		}, function(response) {
			$scope.errorMsg	= 'An error has occurred. Please try again later.';
		});
	};

	$scope.getCompletedTickets	= function() {
		if($scope.cTickets) {
			changeActiveTickets($scope.cTickets);
			return;
		}

		$http.get('/modticketing/getClosedTickets' + ($scope.id ? '/' + $scope.id : ''))
		.then(function(response) {
			if(response.data.error == 0) {
				if(response.data.count > 0) {
					$scope.cTickets					= response.data.tckts;
					$scope.stats.compTicketCount	= response.data.count;
					changeActiveTickets($scope.cTickets);
				}
				else {
					$scope.cTickets					= [];
					$scope.stats.compTicketCount	= 0;
					changeActiveTickets(null);
				}
			}
			else
				$scope.errorMsg	= response.data.message;
		}, function(response) {
			$scope.errorMsg	= 'An error has occurred. Please try again later.';
		});
	};

	refreshTickets();
});

app.controller('assignCtrl', function($scope, $http, tktFact) {
	$scope.doAssign	= function() {
		$http({
			method : 'POST',
			url : '/modticketing/doAssign',
			data : { 'user' : $scope.userID, 'tickets' : tktFact.tickets }
		})
		.then(function(response) {
			if(response.data.error == 0)
				tktFact.callback();
			else
				$scope.errorMsg	= response.data.msg;
		}, function(response) {
			$scope.errorMsg		= 'Something went wrong. Please try again later.';
		});
	};
});

app.controller('moveCtrl', function($scope, $http, tktFact) {
	$scope.doMove	= function() {
		$http({
			method : 'POST',
			url : '/modticketing/doMove',
			data : { 'dep' : $scope.depID, 'tickets' : tktFact.tickets }
		})
		.then(function(response) {
			if(response.data.error == 0)
				tktFact.callback();
			else
				$scope.errorMsg	= response.data.msg;
		}, function(response) {
			$scope.errorMsg		= 'Something went wrong. Please try again later.';
		});
	};
});

app.controller('deleteCtrl', function($scope, $http, tktFact) {
	$scope.tickets	= tktFact.tickets;

	$scope.doDelete	= function() {
		$http({
			method : 'POST',
			url : '/modticketing/doDelete',
			data : { 'tickets' : tktFact.tickets }
		})
		.then(function(response) {
			if(response.data.error == 0)
				tktFact.callback();
			else
				$scope.errorMsg	= response.data.msg;
		}, function(response) {
			$scope.errorMsg		= 'Something went wrong. Please try again later.';
		});
	};
});

app.controller('ticketCtrl', function($scope, $routeParams, $http, ModalService, tktFact) {
	$scope.ticketID		= $routeParams.id;
	$scope.prioToggle	= false;
	$scope.errorMsg		= '';
	$scope.showChat		= true;
	$scope.notesEnabled	= false;
	$scope.privateNote	= '';

	function blank() { };
	function back() { window.history.back(); };

	function refreshChat() {
		$scope.chats	= null;

		$http.get('/modticketing/getMsgChats/' + $scope.ticketID)
		.then(function(response) {
			if(response.data.error == 0) {
				$scope.chats	= response.data.msgs;
				$scope.errorMsg		= '';
			}
			else
				$scope.errorMsg	= response.data.message;
		}, function(response) {
			$scope.errorMsg	= 'An error has occurred. Please try again later.';
		});
	}

	$http.get('/modticketing/getTicket/' + $scope.ticketID)
	.then(function(response) {
		if(response.data.error == 0) {
			$scope.errorMsg		= '';
			$scope.tkt	= response.data.tkt;
			refreshChat();
		}
		else
			$scope.errorMsg	= response.data.message;
	}, function(response) {
		$scope.errorMsg	= 'An error has occurred. Please try again later.';
	});

	$scope.statusColor		= function() {
		if(!$scope.tkt) return;
		ts	= parseInt($scope.tkt.status);
		st	= '';

		switch(ts) {
		case 0:
			st	= 'btn-blue';
			break;
		case 1:
			st	= 'btn-green';
			break;
		case 2:
			st	= 'btn-gray';
			break;
		case 3:
			st	= 'btn-orange';
		}

		return st;
	};

	$scope.priorityText		= function() {
		if(!$scope.tkt) return;
		pr	= parseInt($scope.tkt.priority);

		switch(pr){
		case 1: return 'High Priority';
		case 2: return 'Normal';
		case 3: return 'Low Priority';
		}

		return '';
	};

	$scope.assignTicketTo	= function() {
		ret					= [$scope.tkt.id];
		tktFact.tickets		= ret;
		tktFact.callback	= blank;

		ModalService.showModal({
			templateUrl : '/modticketing/assignTicketTo',
			controller : 'assignCtrl'
		}).then(function(modal) {
			modal.element.modal();
		});
	};

	$scope.tktPriorityClass	= function() {
		cls	= '';
		if(!$scope.tkt) return;
		pr	= parseInt($scope.tkt.priority);

		switch(pr){
		case 1:
			cls	= 'higprio';
			break;
		case 2:
			cls	= 'norprio';
			break;
		case 3:
			cls	= 'lowprio';
			break;
		}

		return cls + ($scope.prioToggle ? ' active' : '');
	};

	$scope.replySubmit		= function() {
		$http({
			method : 'POST',
			url : '/modticketing/postChat',
			data : { 'id' : $scope.tkt.id, 'message' : $scope.replyTxt }
		})
		.then(function(response) {
			if(response.data.error == 0) {
				$scope.replyTxt		= null;
				$scope.tkt.status	= response.data.newSt;
				$scope.tkt.statusT	= response.data.newStT;
				refreshChat();
			}
			else
				$scope.errorMsg	= response.data.msg;
		}, function(response) {
			$scope.errorMsg		= 'Something went wrong. Please try again later.';
		});
	};

	$scope.setPriority		= function(p) {
		if($scope.tkt.priority == p) return;
		$scope.tkt.priority	= p;

		$http({
			method : 'POST',
			url : '/modticketing/changePriority',
			data : { 'id' : $scope.tkt.id, 'p' : $scope.tkt.priority }
		})
		.then(function(response) {
		}, function(response) {
			$scope.errorMsg		= 'Something went wrong. Please try again later.';
		});
	};

	$scope.deleteTicket		= function() {
		tktFact.tickets		= [$scope.tkt.id];
		tktFact.callback	= back;

		ModalService.showModal({
			templateUrl : '/modticketing/deleteTicket',
			controller : 'deleteCtrl'
		}).then(function(modal) {
			modal.element.modal();
		});
	};

	$scope.subTicketShow	= function() {
		tktFact.tickets		= [$scope.tkt.id];
		tktFact.callback	= back;

		ModalService.showModal({
			templateUrl : '/modticketing/subTicket',
			controller : 'subCtrl'
		}).then(function(modal) {
			modal.element.modal();
		});
	};

	$scope.enableNotes		= function() {
		if($scope.notesEnabled) return;

		nowDate				= new Date();
		day					= nowDate.getUTCDate();
		month				= nowDate.getMonth() + 1;
		year				= nowDate.getFullYear();
		min					= nowDate.getMinutes();
		hour				= nowDate.getHours();

		mer					= hour >= 12 ? 'PM' : 'AM';
		day					= day < 10 ? '0' + day : day;
		month				= month < 10 ? '0' + month : month;
		min					= min < 10 ? '0' + min : min;
		hour				= hour < 10 ? '0' + hour : hour;

		$scope.noteDate		= month + '/' + day + '/' + year + ' ' + hour + ':' + min + ' ' + mer;
		$scope.notesEnabled	= true;
	};

	$scope.disableNotes		= function() {
		if(!$scope.notesEnabled) return;

		$scope.notesEnabled	= false;
		$scope.privateNote	= '';
	};

	$scope.postNotes		= function() {
		if($scope.privateNote == '') return;

		$http({
			method : 'POST',
			url : '/modticketing/postNote',
			data : { 'id' : $scope.tkt.id, 'n' : $scope.privateNote }
		})
		.then(function(response) {
			if(response.data.error == 0) {
				$scope.notesEnabled	= false;
				$scope.privateNote	= '';
				$scope.tkt.note		= response.data.note;
			}
			else
				$scope.errorMsg	= response.data.msg;
		}, function(response) {
			$scope.errorMsg		= 'Something went wrong. Please try again later.';
		});
	};

	$scope.closeTicket		= function() {
		$http({
			method : 'POST',
			url : '/modticketing/closeTicket',
			data : { 'id' : $scope.tkt.id }
		})
		.then(function(response) {
			if(response.data.error == 0) {
				$scope.tkt.status	= response.data.newSt;
				$scope.tkt.statusT	= response.data.newStTxt;
				tktFact.masterCallback();
				window.history.back();
			}
			else
				$scope.errorMsg	= response.data.msg;
		}, function(response) {
			$scope.errorMsg		= 'Something went wrong. Please try again later.';
		});
	};
});

app.controller('subCtrl', function($scope, $http, tktFact) {
	$scope.tktID		= tktFact.tickets[0];

	$scope.subSubmit	= function() {
		$http({
			method : 'POST',
			url : '/modticketing/postSubTicket',
			data : { 'id' : $scope.tktID, 'desc' : $scope.description, 'dept' : $scope.department, 'assg' : $scope.assign, 'prio' : $scope.priority }
		})
		.then(function(response) {
			tktFact.callback();
		}, function(response) {
			$scope.errorMsg		= 'Something went wrong. Please try again later.';
		});
	};
});

app.filter('timeFilter', function() {
	return function(x, num) {
		if(!x || !num || num == 0)
			return x;

		ret	= [];
		num	= num * 60 * 60;

		for(i = 0; i < x.length; i++) {
			utm	= x[i].diff;
			if(num >= utm) ret.push(x[i]);
		}

		return ret;
	};
});

app.factory('tktFact', function() {
	return { tickets : null, callback : null, masterCallback : null };
});

app.controller('mainCtrl', function($scope, $timeout, bckcommon, ModalService) {
	bckcommon.setFavicon($scope, $timeout);
	bckcommon.setMenu($scope);
});