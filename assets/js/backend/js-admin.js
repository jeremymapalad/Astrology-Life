RegExp.escape = function(s) {
	return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
};

$.expr[":"].contains = $.expr.createPseudo(function(arg) {
	return function( elem ) {
		return $(elem).text().toUpperCase().indexOf(arg.toUpperCase()) >= 0;
	};
});

$(document).ready(function() {
	$('.cms-explandable').each(function(e) {
		$(this).siblings().hide();
		$(this).addClass('collapsed');

		$(this).click(function(event){
			if($(this).is('.collapsed')) {
				$(this).removeClass('collapsed');
				$(this).siblings().show();
				$(this).children().text('-');
			}
			else {
				$(this).addClass('collapsed');
				$(this).siblings().hide();
				$(this).children().text('+');
			}
		});
	});

	$('.nav.nav-sidebar li a').each(function(e) {
		var url = new RegExp(RegExp.escape($(this).attr('href')));
		var loc = window.location.href;

		if(loc.match(url)) {
			$(this).addClass('mn_selected');
			$(this).parent().parent().siblings('.cms-explandable').click();
			$(this).children().html('&gt;');
		}
	});

	if($('#form_city_id').length > 0) {
		$.expr[':'].textEquals = function (a, i, m) {
			return $(a).text().match("^" + m[3] + "$");
		};

		var parent		= $('#form_city1').parent();
		var country		= $('<select name="country" />');
		var stateSelect	= $('<select name="state" />');
		var countryID	= -1;
		var stateID		= -1;
		var cityVal		= '';
		var cityID		= $('#form_city_id').val();

		country.append('<option value="-1">Choose Country</option>');
		stateSelect.append('<option value="-1">Choose State</option>');
		stateSelect.prop("disabled", true);
		$('#form_city1').prop("disabled", true);

		if(!isNaN(parseInt($('#form_city_id').val()))) {
			var request2 = $.ajax({
				async: false,
				url: "/site/cityInfo",
				data: {city : parseInt($('#form_city_id').val())}
			});

			request2.done(function(response){
				cityInfo	= $.parseJSON(response);

				if(cityInfo.error == 0) {
					cityVal		= cityInfo.name;
					stateID		= cityInfo.state;
					countryID	= cityInfo.country;
				}
			});
		}

		var request = $.ajax({
			async: false,
			url: "/site/countries"
		});

		request.done(function(response){
			states = $.parseJSON(response);
			if (!$.isEmptyObject(states)) {
				if(countryID != -1) {
					found = false;

					for (idx in states) {
						state = states[idx];

						if(state.id == countryID) {
							found = true;
							countryID = state.id;
						}
					}

					if(!found) countryID = states[1].id;	//USA
				}

				for (idx in states) {
					state		= states[idx];
					selected	= countryID != -1 && state.id == countryID ? ' selected="selected"' : '';
					country.append('<option value="' + state.id + '"' + selected + '>' + state.country + '</option>');
				}
			}
		});

		stateSelect.change(function() {
			var id = $(this).val();
			$('#form_city1').prop("disabled", id < 0);
			$('#form_city1').val(stateID == id ? cityVal : '');
			$('#form_city_id').val(stateID == id ? cityID : '');
			stateID = id;
		});

		country.change(function() {
			var cID = $(this).val();
			var states_com = $('[name=state]');

			$('#form_city1').val(countryID == cID ? cityVal : '');
			$('#form_city_id').val(countryID == cID ? cityID : '');
			$('#form_city1').prop("disabled", countryID == -1);
			countryID = cID;

			if (countryID > -1) {
				var request = $.ajax({
					async: false,
					data: {country: cID},
					url: '/site/states'
				});

				request.done(function(response){
					states = $.parseJSON(response);

					if (!$.isEmptyObject(states)) {
						found = false;

						for (idx in states) {
							state = states[idx];

							if(!found && stateID != -1 && state.id == stateID) {
								selected = ' selected="selected"';
								stateID = state.id;
								$('#form_city1').val(cityVal);
								found = true;
							}
							else
								selected = '';

							states_com.append('<option value="' + state.id + '"' + selected + '>' + state.name + '</option>');
						}

						$('#form_city1').prop("disabled", !found);
						states_com.prop("disabled", false);
					} else {
						$('#form_city1').prop("disabled", false);
						states_com.prop("disabled", true);
					}
				});
			}
		});

		parent.prepend(stateSelect);
		parent.prepend(country);
		if(countryID != -1) country.change();
	}

	$('#form_city1').autocomplete({
		source: function(request, response){
			var state_com = $('[name=state]');
			var _country = $('[name=country]').val();
			var _state = state_com.prop('disabled') ? null : state_com.val();

			$.getJSON(
				'/cities/get',
				{ country : _country, state : _state, query : request.term },
				function(data){
					response( $.map( data.suggestion, function( item, index ) {
						return {
							value: item,
							key: index,
						}
					}));
				}
			);
		},
		minLength: 2,
		focus: function( event, ui ) {
			$(this).val( ui.item.value );
			return false;
		},
		select: function( event, ui ) {
			$(this).val( ui.item.value );
			$('#form_city_id').val( ui.item.key );
			return false;
		}
	})

	regexpResult = window.location.href.search(/\/(delete|edit|add)/i);
	if($('#form_submit').length > 0 && regexpResult > 0) {
		var btn = $('<span>').text('Cancel').addClass('btn btn-primary').click(function(e){
			newURL = window.location.href.substring(0, regexpResult);
			setTimeout(function(){ window.location.href = newURL; }, 120);
		});
		$('#form_submit').parent().append(btn);
	}

	showStaticTags = window.location.href.search(/\/static|emcampaignemails/i);
	if($('#form_submit').length > 0 && showStaticTags > 0) {
		var contentTags = '';

		var btn = $('<span>').text('Show Tags').addClass('btn btn-primary').click(function(e){
			if(contentTags == '') {
				var request = $.ajax({
					async: false,
					url: '/free-tags/get'
				});

				request.done(function(response){
					tags = $.parseJSON(response);
					if (!$.isEmptyObject(tags)) {
						for (idx in tags) {
							tag = tags[idx];
							contentTags += '<div><span style="display: inline-block; width: 214px; font-weight:bold">' + idx + '</span> ' + tag + '</div>';
						}
					}
				});
			}

			$('#dialog').attr('title', 'TAGS').html(contentTags).dialog( {width: 'auto'} );
		});

		$('#form_submit').parent().append('&nbsp;').append(btn);
	}

	if($('#form_role_hid').length > 0) {
		val = parseInt($('#form_role_hid').val());
		$('input[name^="role"]').prop('checked', false);

		if(val == 0)
			$('#form_role_0').prop('checked', true);
		else {
			$('input[name^="role"]').each(function(e) {
				val2 = parseInt($(this).val());
				if(parseInt(val & val2) > 0)
					$(this).prop('checked', true);
			});
		}
	}

	addImage = window.location.href.search(/\/tkastrologers\/edit/i);
	if($('#form_picture').length > 0 && addImage > 0 && $('#form_picture').val() != '') {
		$('#form_picture').after(' <img border="0" src="/uploads/' + $('#form_picture').val() + '" />');
	}

	datePick = window.location.href.search(/\/dshnewsfeeds/i);
	if($('#form_start_date').length > 0 && datePick > 0) {
		$('#form_start_date').datepicker({
			dateFormat: "yy-mm-dd",
			altFormat: "yy-mm-dd"
		});
	}

	tktSystem = window.location.href.search(/\/dashticket/i);
	if($('#tk-table').length > 0 && tktSystem > 0) {
		var _sort = 'update';
		var _filter = 'open';
		var _asc = true;

		function tktRequest() {
			var request = $.ajax({
				async: false,
				url: '/dashticket/refresh',
				data: {sort: _sort, filter: _filter, asc: _asc}
			});

			var req = $.ajax({
				async: false,
				url: '/dashticket/ticketCount',
				data: {filter: _filter}
			});

			request.done(function(response) {
				$('#tk-table').html(response);

				$('table.tickets th span').each(function(e) {
					if($(this).data('sort') == _sort)
						$(this).after(_asc ? ' ^' : ' v');
				});

				$('.tk-selector').removeClass('bolden').each(function(e) {
					$(this).unbind('click');

					if($(this).data('type') == _filter)
						$(this).addClass('bolden');
					else {
						$(this).click(function() {
							_filter = $(this).data('type');
							tktRequest();
						});
					}
				});

				$('table.tickets th span').click(function() {
					temp = $(this).data('sort');
					if(temp == _sort) _asc = !_asc;
					_sort = temp;
					tktRequest();
				});

				$('table.tickets > tbody > tr').click(function() {
					var _id = $(this).data('id');
					if(_id) ShowTicket(_id);
				});
			});

			req.done(function(resp) {
				c = $.parseJSON(resp);
				$('#ticket-count').text(c.count);
			});
		}

		function ShowTicket(_id) {
			var req = $.ajax({
				async: false,
				url: '/dashticket/showTicket',
				data: {id: _id},
				error: function() {
					alert('Problem loading ticket. It is likely that this ticket was assigned to some other astrologer. Please refresh dashboard and try again.');
				}
			});

			req.done(function(resp) {
				$('#dialog').html(resp).dialog( {width: 'auto', title: 'Ticket #' + _id} );
				$('.ticket-lower textarea').trumbowyg({fullscreenable: false});
				$('.ticket-buttons span').unbind('click');

				$('#tkreplyclose, #tkreply, #tkclose').click(function() {
					var _ticket = $('.ticket-lower input[type=hidden]').val();
					var _message = $(this).attr('id') == 'tkclose' ? '' : $('.ticket-lower textarea').val();
					var _closed = $(this).attr('id') == 'tkclose' || $(this).attr('id') == 'tkreplyclose' ? 1 : 0;

					$.post(
						'/dashticket/answer',
						{ id: _ticket, message: _message, closeit: _closed },
						function(jsonData) {
							$('#dialog').dialog("close");
							tktRequest();
						},
						'json',
						function(e) {
							alert("We apologize, there was a problem while processing your ticket. Please try again later.");
							$('#dialog').dialog("close");
							tktRequest();
						}
					);
				});

				$('#tkopen').click(function() {
					var _ticket = $('.ticket-lower input[type=hidden]').val();
					$.post(
						'/dashticket/reopen',
						{ id: _ticket },
						function(jsonData) {
							$('#dialog').dialog("close");
							ShowTicket(_ticket);
							_filter = 'open';
							tktRequest();
						},
						'json',
						function(e) {
							alert("We apologize, there was a problem while processing your ticket. Please try again later.");
							$('#dialog').dialog("close");
							tktRequest();
						}
					);
				});

				$('#tkcancel').click(function(){
					$('#dialog').dialog("close");
				});
			});
		}

		tktRequest();
	}
});