//WARNING! Overrides the page's updatePoll callback

window.CLIENT.Nexus.plugins.loaded["poll_bet"] = true;

function updateOptions(data) {
	const buttons = $("#pollwrap .active .option button");

	//vanilla updatePoll behavior
	/*if (!window.UsePollBetPlugin) {
		for (let i = 0; i < buttons.length; i++) {
			buttons[i].textContent = data.counts[i];
		}
		return;
	}*/

	const multiplier = window.UsePollBetPlugin ? Math.floor(Math.max(1.0, window.PollBetMultiplier || 10)) : 1;
	let highest = 0;
	let all_highest = [];
	let value = 0;
	let counts = [];
	for (let i = 0; i < buttons.length; i++) {
		buttons[i].parentElement.classList.remove("poll-highest", "poll-highest-tie");

		//if coming from newPoll or updatePoll where we have actual option data
		if (data) {
			counts = data.counts;
			value = data.counts[i];
		}
		//...or from anywhere else
		else {
			const text = buttons[i].textContent;

			if (text.charAt(0) != "$") {
				value = parseInt(text);
			} else {
				value = parseInt(text.substring(1)) / multiplier;
			}
		}

		counts[i] = value;

		if (window.UsePollBetPlugin)
			buttons[i].textContent = "$" + (value * multiplier);
		else
			buttons[i].textContent = value;
		
		if (CACHE.poll_meta_opts.highlight <= 1) {
			if (value > highest) {
				highest = value;
				all_highest = [i];
			} else if (value == highest) {
				all_highest.push(i);
			}
		} else {
			all_highest.push(i);
		}

	}

	if (CACHE.poll_meta_opts.highlight <= 1) {
		if (highest > 0) {
			for (let i = 0; i < all_highest.length; i++) {
				buttons[all_highest[i]].parentElement.classList.add("poll-highest");
			}
		}
	} else {
		//Sort each button index by their vote count, highest to lowest
		all_highest.sort(function(a,b) {
			return counts[b] > counts[a];
		})

		//Keep track of used vote counts so ties can be shown
		let highest_values = {};
		let highlight_max = CACHE.poll_meta_opts.highlight;

		//Iterate over a SORTED list...
		for (let i = 0; i < highlight_max && i < all_highest.length; i++) {
			//If this hits 0 counts, completely stop.
			if (counts[all_highest[i]] <= 0) return;

			//If the next button has the same vote count as this one, this is in a "tie" section
			//Increment the soft amount of highlights, because whole tie sections should count as one highlight
			if (i < all_highest.length-1 && counts[all_highest[i]] == counts[all_highest[i+1]]) {
				buttons[all_highest[i]].parentElement.classList.add("poll-highest-tie");
				highlight_max++;
			}
			//If this button's vote count has already been seen, this button is in a "tie" section
			//If the previous block wasn't hit, this is probably because it's the last one in the section
			else if (highest_values[counts[all_highest[i]]]) {
				buttons[all_highest[i]].parentElement.classList.add("poll-highest-tie");
			} else {
				buttons[all_highest[i]].parentElement.classList.add("poll-highest");
			}

			highest_values[counts[all_highest[i]]] = true;

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