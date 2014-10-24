$(document).ready(function () {
	$('#searchuserform').submit(function(e) {
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
						url: list.attr('data-add-friend-request-ajax-url'),
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
});