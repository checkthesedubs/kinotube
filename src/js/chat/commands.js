import { ChatCommand } from "../classes/ChatCommand";
import { clamp, getRandom } from "../utils";

const reg_dice = /^(\d+)?d(\d+)?(?:(\+|\-)(\d+))?/i;

//!roll
new ChatCommand(
	"!roll",
	"Generates a random number between 0 and 9999.",
	function () {
		let n = Math.floor(Math.random() * 10000),
			color = '',
			seq = 1;

		if (n == 8008) {
			return 'col:red:80085';
		}

		n = '0'.repeat(4 - (n + '').length) + n;

		for (let i = n.length - 2; i >= 0; --i) {
			if (n[i] == n[n.length - 1])
				seq++;
			else break;
		}

		if (seq >= 4)
			color = 'col:gold:';
		else if (seq == 3)
			color = 'col:dodgerblue:';
		else if (seq == 2)
			color = 'col:limegreen:';
		return n.substr(0, n.length - seq) + color + n.substr(-seq);
	},
	"chat"
);

//!dice
new ChatCommand(
	"!dice",
	"Throw some dice!"+
	"\nAccepts basic dice notation, which is optional. Example: !dice 3d6+5 will roll a 6-sided die 3 times and add 5 to the end result."+
	"\nThe default roll is 1d6. Maximum values are 6d128+999.",
	function (message) {
		const die_part = message.split(" ")[0];

		const match = die_part.match(reg_dice) || ["", "1", "6", null, null];

		const dice_amount = match[1] ? clamp(match[1], 1, 6) : 1;
		const sides = match[2] ? clamp(match[2], 2, 128) : 6;
		const sign  = (match[3]||"+") == "+" ? 1 : -1
		const bonus = clamp((match[4]||0), -999, 999);

		let result = 0;
		const rolls = [];
		
		for (let i = 0; i < dice_amount; i++) {
			const roll = Math.floor((Math.random() * sides) + 1);
			result += roll;
			rolls.push(roll);
		}

		result += (sign * bonus);

		if (dice_amount == 1 && sides == 6) return result+"";

		//let output = dice_amount + "d" + sides + (bonus != 0 ? (sign == 1 ? "+" : "-") + bonus : "") + " => " + result;
		//if (dice_amount > 1) output += " ["+rolls.join(", ")+"]";

		let output = "";
		if ((match[1] && match[1] != dice_amount) || match[2] != sides || (match[4] && match[4] != bonus))
			output += dice_amount + "d" + sides + (bonus != 0 ? (sign == 1 ? "+" : "-") + bonus : "") + " => ";
		output += result;
		if (dice_amount > 1) output += " ["+rolls.join(", ")+"]";

		return output;
	},
	"chat"
);

//!emote
new ChatCommand(
	"!emote",
	"Picks a random emote to send in chat.",
	function () {
		if (CHANNEL.emotes.length <= 0) return "";

		let emote = getRandom(CHANNEL.emotes).name;

		if (SETTINGS.dontRollFXEmotes) {
			let breakout = 0;
			while (/^(fx|ov)[A-Z0-9]/.test(emote) && breakout < 15) {
				emote = getRandom(CHANNEL.emotes).name;
				breakout++;
			}
		}

		return emote;
	},
	"chat"
);

//!pick
new ChatCommand(
	"!pick",
	"Chooses a random option from a given list of options. Each option must be separated by a comma (,).\nExample: !pick ranch, cool ranch",
	function (message) {
		if (!message) {
			//alert(this.description + "\n(This alert window is temporary)");
			return null;
		}

		const options = message.split(",");

		if (options.length <= 1) {
			//alert(this.description + "\n(This alert window is temporary)");
			return null;
		}

		return getRandom(options).trim();
	},
	"chat"
);

//!8ball
new ChatCommand(
	"!8ball",
	"Ask the Magic 8 Ball an important question.",
	function () {

		const responses = [
			"Absolutely",
			"It is decidedly so",
			"Without a doubt",
			"Yes, definitely",
			"Outlook good",
			"As I see it, yes",
			"Most likely",
			"100%",
			"Yes",
			"Signs point to yes",
			"Of course!",

			"Maybe",
			"Better not tell you now",
			"Cirno is busy",
			
			"Don't count on it",
			"My reply is no",
			"My sources say no",
			"Outlook not so good",
			"Very doubtful",
			"Hell no",
			"Impossible",
			"Never"
		];

		return getRandom(responses);
	},
	"chat"
);

//!now
new ChatCommand(
	"!now",
	"Displays what is currently playing.",
	function () {
		const title = $(".queue_active .qe_title");
		return "now playing: " + (title ? title[0].textContent : "nothing!");
	},
	"chat"
);

//!skip
new ChatCommand(
	"!skip",
	"Votes to skip the current video, if the channel allows it and you have the permissions to do so.",
	function () {
		if (CHANNEL.opts.allow_voteskip)
			socket.emit("voteskip");
		return null;
	},
	"voteskip"
);

//!time
new ChatCommand(
	"!time",
	"Shows your current local time to other users in chat.",
	function () {
		const d = new Date();
		return "current time: " + ('0' + d.getHours()).substr(-2) + ":" + ('0' + d.getMinutes()).substr(-2);
	},
	"chat"
);
