(()=>{
	const oldPollTime = 2e4;


	Callbacks.newPoll = function(data) {

		let previous_vote = -1;

		if (data.timestamp && $('.well.active').length > 0) {
			if ($('#pollwrap .well.active .label').data("timestamp") === data.timestamp) {
				let poll = $('#pollwrap .well.active');
				let options = poll.find(".option");
				for (let i = 0; i < options.length; i++) {
					if (options[i].classList.contains("option-selected")) {
						previous_vote = i;
						break;
					}
				}
				poll.remove();
			}
		}

		const isOldPoll = Date.now() - data.timestamp >= oldPollTime;

		//START (MOSTLY) VANILLA CODE https://github.com/calzoneman/sync/blob/bb5173fd124a6efaa17c60079d12563a507643b7/www/js/callbacks.js#L917-L962
		Callbacks.closePoll();

		let pollMsg = $("<div/>").addClass("poll-notify")
			.html(!isOldPoll ? (data.initiator + " opened a poll: \"" + data.title + "\"")
							 : ('Old poll by ' + data.initiator + " is open: \"" + data.title + "\""))
			.appendTo($("#messagebuffer"));

		if (isOldPoll) pollMsg.addClass("poll-notify-old");

		scrollChat();

		var poll = $("<div/>").addClass("well active").prependTo($("#pollwrap"));
		$("<button/>").addClass("close pull-right").html("&times;")
			.appendTo(poll)
			.on('click', function() { poll.remove(); });
		if(hasPermission("pollctl")) {
			$("<button/>").addClass("btn btn-danger btn-sm pull-right").text("End Poll")
				.appendTo(poll)
				.on('click', function() {
					socket.emit("closePoll");
				});
		}

		$("<h3/>").html(data.title).appendTo(poll);
		for(var i = 0; i < data.options.length; i++) {
			(function(i) {
			var callback = function () {
				socket.emit("vote", {
					option: i
				});
				poll.find(".option button").each(function() {
					$(this).removeClass("active");
					$(this).parent().removeClass("option-selected");
				});
				$(this).addClass("active");
				$(this).parent().addClass("option-selected");
			};
			let btn = $("<button/>").addClass("btn btn-default btn-sm").text(data.counts[i])
				.prependTo($("<div/>").addClass("option").html(data.options[i])
						.appendTo(poll))
				.on('click', callback);

			//Revote if reconnected without leaving the page
			if (i === previous_vote) {
				btn.click();
			}
			})(i);

		}
		$("<span/>").addClass("label label-default pull-right").data('timestamp',data.timestamp).appendTo(poll)
			.text('Poll opened by ' + data.initiator + ' at ' + new Date(data.timestamp).toTimeString().split(" ")[0]).data('initiator',data.initiator);

		poll.find(".btn").attr("disabled", !hasPermission("pollvote"));
		//END MOSTLY VANILLA CODE
	}

	//Code to run when the script is accepted

	let badges = $('#pollwrap .well .label');

	badges.each((i, el) => {
		if (!~el.innerText.indexOf("Polled by")) {
			const time = $(el).data().timestamp;
			const blame = el.title.split(" ")[3];
			el.innerText = "Poll opened by " + blame + " at " + new Date(time).toTimeString().split(" ")[0];
		}
	});

	//Fix weird End Poll button size inconsistency
	$('#pollwrap .well button.btn-danger').addClass("btn-sm");

	if ($('#pollwrap .well.active').length > 0) {
		let notif = $('.poll-notify').last();
		let last_poll_time = $('#pollwrap .well.active .label').data().timestamp;

		let isOldPoll = Date.now() - last_poll_time >= oldPollTime;

		//Modify last poll notification in chat if the poll is older than 20 seconds
		if (notif.length > 0 && isOldPoll) {
			notif.html(notif.html().replace(/^(.+?) opened a poll\: /, 'Old poll by $1 is open: '))
			notif.addClass("poll-notify-old");
		}
	}

})();