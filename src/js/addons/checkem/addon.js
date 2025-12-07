import { FormatChatMsgProcHook } from "../../overrides";
import { getRandom, sendMessage } from "../../utils";

window.CLIENT.Nexus.plugins.loaded["checkem"] = true;

//TODO: expose this so users can change which emotes get used
const GETs = {
	2: ["DubsCheck", "Checkem"],
	3: ["DubsHYPER", "HolyDubs", "DubsJam"],
	4: ["HyperChecked", "HolyDubs", "DubsHYPER"],
};

function checkThisGet(data, element) {
	if (!hasPermission("chat")) return;
	if (element.classList.contains("checked-get")) return;

	element.classList.add("checked-get");

	const digits = element.textContent.length;

	let emote = GETs[digits] ? getRandom(GETs[digits]) : "DubsCheck";

	if (digits >= 4 && CHANNEL.emoteMap["fxRainbow"] && Math.random() < 0.70) {
		emote = "fxRainbow " + emote;
	}

	sendMessage(data.username + ": " + emote);
}

function processMessage(message, data) {
	if (CACHE.last_rolls[data.username] && data.time - CACHE.last_rolls[data.username] <= 150 && data.msg.startsWith("\uD83E\uDD16")) {
		let cleanmsg = data.msg.replace(/\<span.+\>(\d+)\<\/span\>/, "$1");

		if (/^\uD83E\uDD16 \d{4,}$/.test(cleanmsg)) {
			let el = $(message[0]).find("span.chatcolor");
			el.addClass("roll-get");

			el.on("click", function () {
				checkThisGet(data, this);
			});
		}
	}
	return message;
}

FormatChatMsgProcHook.registerListener(processMessage);