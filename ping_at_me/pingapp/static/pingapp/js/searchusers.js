$(document).ready(function () {
	$('form#searchuserform').submit(function(e) {
		$.ajax({
			type: 'POST',
			url: $('#searchuserform').attr('action'),
			data: $('#searchuserform').serialize(),
			success: addFriendRequests,
		});

		e.preventDefault();
	});

	function addFriendRequests(array) {
		list = $('#makerequestlist');
		list.slideUp(200, function() {
			list.empty();
			for (var i = array.length - 1; i >= 0; i--) {
				// Taking a break from all that jQuery abuse
				var requestbutton = document.createElement('a');
				requestbutton.className = 'tiny button expand userbutton';
				requestbutton.setAttribute('data-csrf-token', $(list).attr('data-csrf-token'))
				requestbutton.setAttribute('data-user-id', array[i].id);
				requestbutton.innerHTML = "<i class=\"fa fa-fw fa-plus\"></i> " + array[i].username;
				list.append(requestbutton);
				$(requestbutton).click(function(e) {
					var thisrequestbutton = this;
					$.ajax({
						type: 'POST',
						url: list.attr('data-ajax-url'),
						data: {'csrfmiddlewaretoken': $(this).attr('data-csrf-token'), 'id': $(this).attr('data-user-id')},
						success: function(data) {
							thisrequestbutton.innerHTML = "<i class=\"fa fa-fw fa-check\"></i> friend request sent";
						},
					});					
				});
			};
			list.slideDown(200);
		});
	}

	$('a.respondrequest').click(function(e) {
		var $this = $(this);
		$.ajax({
			type: 'POST',
			url: $(this).attr('data-ajax-url'),
			data: {'csrfmiddlewaretoken': $(this).attr('data-csrf-token'), 'id': $(this).attr('data-user-id'), 'accept': $(this).attr('data-request-accept')},
			success: function(data) {
				$this.parent().parent().prev('a').html("<i class=\"fa fa-fw fa-reply\"></i> responded");
			},
		});

		e.preventDefault();
	});

	$('a.removefriend').click(function(e) {
		var $this = $(this);
		$.ajax({
			type: 'POST',
			url: $(this).attr('data-ajax-url'),
			data: {'csrfmiddlewaretoken': $(this).attr('data-csrf-token'), 'id': $(this).attr('data-user-id')},
			success: function(data) {
				$this.parent().parent().prev('a').html("<i class=\"fa fa-fw fa-times\"></i> removed");
			},
		});

		e.preventDefault();
	});	
});