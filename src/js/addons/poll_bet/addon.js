//WARNING! Overrides the page's updatePoll callback

window.CLIENT.Nexus.plugins.loaded["poll_bet"] = true;

function updateOptions(data) {
	if (!window.UsePollBetPlugin) return;
	const buttons = $("#pollwrap .active .option button");
	const multiplier = Math.floor(Math.max(1.0, window.PollBetMultiplier || 10));
	let highest = 0;
	let all_highest = [];
	let value = 0;

	for (let i = 0; i < buttons.length; i++) {
		buttons[i].parentElement.classList.remove("poll-highest");

		//if coming from newPoll or updatePoll where we have actual option data
		if (data)
			value = data.counts[i];
		//...or from anywhere else
		else {
			const text = buttons[i].textContent;

			if (text.charAt(0) != "$") {
				value = parseInt(text);
			} else {
				value = parseInt(text.substring(1)) / multiplier;
			}
		}

		buttons[i].textContent = "$" + (value * multiplier);

		if (value > highest) {
			highest = value;
			all_highest = [i];
		} else if (value == highest) {
			all_highest.push(i);
		}

	}

	if (highest > 0) {
		for (let i = 0; i < all_highest.length; i++) {
			buttons[all_highest[i]].parentElement.classList.add("poll-highest");
		}
	}

}

socket.on("newPoll", function(data) {
	updateOptions(data);
})

window.Callbacks.updatePoll = function(data) {
	updateOptions(data);
}

updateOptions();