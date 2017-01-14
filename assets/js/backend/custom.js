$(document).ready(function() {

	//Custom Boostrap-4 tab fix - parent must have [role="tablist"]
	$('a[data-toggle="tab"]').click(function() {
		if ( !$(this).hasClass('active') ) {
			$(this).closest('[role="tablist"]').find('a[data-toggle="tab"].active').removeClass('active');

			//Makes the parent of the tab has active (for li, etc.)
			$(this).parent().siblings().removeClass('active');
			$(this).parent().addClass('active');
		}
		else {
			// Custom Code: Make Tabs Deactivateable - Reusable 
			// <div class="default-tab active"><a class="default-tab active" href="#insert-id" data-toggle="tab" role="tab"></a></div>
			if ( $(this).closest('[role="tablist"]').hasClass('has-deactivate') ) {
				$(this).closest('[role="tablist"]').find('.default-tab[data-toggle="tab"]').trigger('click');
				return false;
			}
		}
	});


	//Bootstrap script for overlay double modal	
	$(document).on('show.bs.modal', '.modal', function () {
	    var zIndex = 1040 + (10 * $('.modal:visible').length);
	    $(this).css('z-index', zIndex);
	    setTimeout(function() {
	        $('.modal-backdrop').not('.modal-stack').css('z-index', zIndex - 1).addClass('modal-stack');
	    }, 0);
    });

	//For Elements that has an active version onclick - Reusable
	$('.has-active').click(function() {
		$(this).toggleClass('active');
	});

	//Custom Dropdown for AstrologyLife - Reusable
	$('.custom-dropdown li[data-value]').click(function() {
		var dataValue = $(this).attr('data-value');
		var textValue = $(this).text();

		$(this).closest('ul.custom-dropdown[data-active]').attr('data-active', dataValue);
		$(this).closest('ul.custom-dropdown[data-active]').find('.custom-dropdown-dynamic').text(textValue);
	});

/*----------------------------------
# @Ticketing Module
----------------------------------*/
	$(".ticket-module input[type=checkbox]").change(function() {
		//Add active class to .ticketing-module
		$(this).closest('.ticket-module').toggleClass('active');

		//Check if the current table has a checked checkbox
		if( $(this).closest('.ticket-list').find('.ticket-module.active').length > 0 ) {
			$('#action-ticket .btn-action').addClass('active');
		}
		else {
			$('#action-ticket .btn-action').removeClass('active');
		}
	});

	//Checks if the new active tab has checked checkbox
	$('.stat-box a[role="tab"]').click(function() {
			if( $('.default-tab').hasClass('active') ) {
				var table = $(this).attr('href');
				if ( $( '#all-tickets .ticket-module.active' ).length < 1 ) {
					$('#action-ticket .btn-action').removeClass('active');
				}
				else {
					$('#action-ticket .btn-action').addClass('active');
				}
			}
			else {
				var table = $(this).attr('href');

				if ( $( table + ' .ticket-module.active' ).length < 1 ) {
					$('#action-ticket .btn-action').removeClass('active');
				}
				else {
					$('#action-ticket .btn-action').addClass('active');
				}
			}

	});

	//Cell Filter
	$('.cell-filter a').click(function() {
		if ( !$(this).hasClass('filtered') ) {
			$('.cell-filter a').removeClass('filtered');
			$(this).addClass('filtered');
		}
	});

/*----------------------------------
# @Email Center Module
----------------------------------*/
/***** New Functions  *****/
$(document).on('click', '.remove-on-click', function() {
	$(this).remove();
});

/*** Sub Table Toggle Display ***/
$(document).on('click', '.btn-expand', function() {
	$(this).closest('tr').toggleClass('active');
});

$('.clock-alt').hover(function() {
	$(this).trigger('click');
});

$('.sort-row').mouseleave(function() {
	$(this).find('.sort-by.active').removeClass('active');
});

/** Hover Subtable, parent no active border **/
$('div.sub-campaign').hover(function() {
	$(this).closest('.campaign').toggleClass('gray-border');
	$(this).removeClass('gray-border');
	return false;
});

$('div.campaign-email').hover(function() {
	if ( $(this).closest('div.campaign').hasClass('has-subcampaign') ) {
		$(this).closest('.sub-campaign').toggleClass('gray-border');
	}
	else {
		$(this).closest('.campaign').toggleClass('gray-border');
	}
	$(this).removeClass('gray-border');
	return false;
});

/*** Email Row ***/
$(document).on('click', '.has-link', function() {
	var goTo = $(this).attr('link');
	window.location.href = goTo;
});

$(document).on('click', '.campaign-email td > *', function() { 
	return false;
});

$('.btn-toggle').click(function() {
	$(this).toggleClass('btn-toggle-off');
	$(this).closest('.has-disable').toggleClass('inactive');
});

/* 'More' Button Function */
$(document).on('click', '.btn-more', function() {
	$(this).siblings('.btn-more-options').toggleClass('popup-show');
});
$('td.cell-buttons').mouseleave(function() {
	$(this).find('.btn-more-options.has-popup').removeClass('popup-show');
});

/* Create Campaign */
$('.btn-submit').click(function() {
	//Validations can be inserted here
	if ( $(this).closest('form').hasClass('create-campaign') ) {
		var dataCreated = "Campaign";
		var dataName = $(this).closest('form').find('.new-campaign-name').val();
		var newCampaign = '<div class="campaign"><table><tr class="row-campaign"><td class="cell cell-expand btn-expand"><img src="../img/backend/icons/icon-plus.png" class="icon-expand"><img src="../img/backend/icons/icon-minus.png" class="icon-collapse"></td><td class="cell cell-info"><span class="campaign-id">Campaign #1</span><span class="campaign-name">' + dataName + '</span><span class="campaign-date-info">Edited on July 31, 2016 3:15 pm by you</span></td><td class="cell cell-buttons"><div class="btn btn-no-fill btn-more-options has-popup"><span class="btn-more-arrow"><img src="../img/backend/icons/icon-circled-arrow-down.png"></span><div class="popup popup-more"><a href="#">Duplicate</a><a href="#" data-toggle="modal" data-target="#deleteModal1">Delete</a></div></div><a href="#" class="btn btn-no-fill btn-more"><span>More</span></a> <a href="#" class="btn btn-no-fill btn-schedule"><img src="../img/backend/icons/icon-clock-2.png"><img src="../img/backend/icons/icon-clock-2-alt.png" class="clock-alt"><span>Schedule</span></a> <a href="#" class="btn btn-no-fill btn-new-email"><span>New Email</span></a> <div href="#" class="btn btn-no-fill btn-new-sub has-popup create-campaign"><span>New Sub-Campaign</span><div class="popup popup-create-campaign prevent-parent"><p class="smaller new-campaign-id">Campaign #6</p><p class="bold normal-size">New Campaign</p><form class="create-subcampaign"><input type="text" class="new-campaign-name"><p class="align-center option-buttons new-campaign-buttons"><button class="option-1 popup-close">Cancel</button> <button class="option-2 btn-blue btn-submit">Save</button></p></form></div></div> <a href="#" class="btn-campaign-arrow"><i class="fa fa-angle-right bigger status-arrow"></i></a></td></tr><tr class="row-sub-campaign-list row-hidden"><td colspan="3"></td></tr> </table></div>';
	}
	else if ( $(this).closest('form').hasClass('create-subcampaign') ) {
		var dataCreated = "Sub-Campaign";
	}

	if( !dataName ) {

	}
	else {
		$('#campaigns').append( newCampaign );
		$('.notice-message .campaign-created').remove();
		$('.notice-message').append('<div class="campaign-created remove-on-click"><img src="../img/backend/icons/icon-check.png" style="margin-right: 5px;"> <span>New ' + dataCreated + ' Created</span></div>');
		$(this).closest('.has-popup').removeClass('popup-show');
	}

	return false;//
});

/**** Popovers Scripts ****/
$(document).on('click', '.has-popup', function() {
	$(this).toggleClass('popup-show');
});

//$(document).on('click', '.popup-close', function() {
$('.popup-close').click(function() {
	$(this).closest('.has-popup').removeClass('popup-show');
	return false;
});

$(".has-popup .popup.prevent-parent").click(function(e) {
    e.stopPropagation(); //Prevent trigerring parent
});

$('.popup-create-campaign').mouseleave(function() {
	$(this).closest('.has-popup').removeClass('popup-show');
});
$('.mouseleave-hide').mouseleave(function() {
	$(this).closest('.has-popup').removeClass('popup-show');
});

/*
**
** Custom rename function for editing fields
**
*/

/*
$(document).on('click', '.campaign-rename-icon', function() {
	let parent = $(this).parent();
	let value = $(this).prev().text();
	$(parent).hide();
	$(parent).next().removeClass('hide');
	$(parent).next().children('.campaign-edit').val(value);
});

$(document).on('click', '.campaign-save-icon', function() {
	let parent = $(this).parent();
	let input = $(this).prev().val();
	let value = $(parent).prev().children('.campaign-name').text(input);
	$(parent).addClass('hide');
	$(parent).prev().show();
});*/

$(document).on('click', '.campaign-name-info', function() {
	let parent = $(this);
	let value = $(this).children('.campaign-name').text();

	//1 Edit at a time
	$('.campaign-edit-info:not(.hide)').prev().show();
	$('.campaign-edit-info').addClass('hide');


	$(this).hide();
	$(this).next().removeClass('hide');
	$(this).next().children('.campaign-edit').val(value);
	$(this).next().children('.campaign-edit').focus();
});

$(document).on('click', '.campaign-save-icon', function() {
	let parent = $(this).parent();
	let input = $(this).prev().val();
	let value = $(parent).prev().children('.campaign-name').text(input);
	$(parent).addClass('hide');
	$(parent).prev().show();
});

$('.campaign-edit').on("keypress", function(e) {
        if (e.keyCode == 13) {
        	$(this).siblings('.campaign-save-icon').trigger('click');
        }
});

}); //Custom.js END

