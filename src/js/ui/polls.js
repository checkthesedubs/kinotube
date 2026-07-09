import { clamp } from "../utils";

const oldPollTime = 2e4;

function resetMetaOptions() {
	CACHE.poll_meta_opts = {
		highlight: 1
	}
}

function setMetaOptions(title) {

	resetMetaOptions();

	if (title) {
		const hmatch = title.match(/\[h(\d+)\]/i);
		if (hmatch) {
			CACHE.poll_meta_opts.highlight = clamp(hmatch[1], 1, 50);
		}
	}
}

Callbacks.newPoll = function(data) {

	setMetaOptions(data.title);

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

	$("<button/>").addClass("close minimize pull-right").html("&#65293;")
		.appendTo(poll)
		.on('click', function() { poll.toggleClass("minimized"); });

	if(hasPermission("pollctl")) {
		$("<button/>").addClass("btn btn-danger btn-sm pull-right").text("End Poll")
			.appendTo(poll)
			.on('click', function() {
				socket.emit("closePoll");
			});
	}

	const poll_content = $("<div/>").addClass("poll-content");

	$("<h3/>").html(data.title).appendTo(poll_content);
	for(var i = 0; i < data.options.length; i++) {
		(function(i) {
		var callback = function () {
			socket.emit("vote", {
				option: i
			});
			poll_content.find(".option button").each(function() {
				$(this).removeClass("active");
				$(this).parent().removeClass("option-selected");
			});
			$(this).addClass("active");
			$(this).parent().addClass("option-selected");
		};
		let btn = $("<button/>").addClass("btn btn-default btn-sm").text(data.counts[i])
			.prependTo($("<div/>").addClass("option").html(data.options[i])
					.appendTo(poll_content))
			.on('click', callback);

		//Revote if reconnected without leaving the page
		if (i === previous_vote) {
			btn.click();
		}
		})(i);

	}
	$("<span/>").addClass("label label-default pull-right").data('timestamp',data.timestamp).appendTo(poll_content)
		.text('Poll opened by ' + data.initiator + ' at ' + new Date(data.timestamp).toTimeString().split(" ")[0]).data('initiator',data.initiator);

	poll_content.find(".btn").attr("disabled", !hasPermission("pollvote"));
	poll_content.appendTo(poll);
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

	if ($('#pollwrap .well.active .close').length == 1) {
		const poll = $("#pollwrap .well.active");
		$("<button/>").addClass("close minimize pull-right").html("&#65293;")
			.insertAfter(poll.find(".close").eq(0))
			.on('click', function() { poll.toggleClass("minimized"); });
	}

	if ($('#pollwrap .well.active .poll-content').length <= 0) {
		const poll_content = $("<div/>").addClass("poll-content");
		$("#pollwrap .well.active > h3").appendTo(poll_content);
		$("#pollwrap .well.active > .option").appendTo(poll_content);
		$("#pollwrap .well.active > .label").appendTo(poll_content);
		poll_content.appendTo("#pollwrap .well.active");
	}

	setMetaOptions(document.querySelector("#pollwrap .well.active h3").textContent);
}