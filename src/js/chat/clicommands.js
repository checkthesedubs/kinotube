import { ClientCommand } from "../classes/ClientCommand";
//import { resizeChat } from "../ui/chat_resize";
import { clamp } from "../utils";

// /chatwidth
/*new ClientCommand(
	"/chatwidth",
	"Adjusts the width of the chat area to a specific number of pixels.",
	function (msg) {
		let px = parseFloat(msg.split(" ")[0]);
		if (isNaN(px)) {
			return;
		}
    resizeChat(px);
	},
	null
);*/

// /volume
new ClientCommand(
	"/volume",
	"Changes the volume of the video to a precise number between 0 and 1.\nUnfortunately, this cannot work on some embed types, including custom embeds.",
	function (msg) {
		if (!PLAYER) return;
		let vol = parseFloat(msg.split(" ")[0]);
		if (isNaN(vol) || vol > 1.0) {
			return;
		}
		vol = clamp(vol, 0.0, 1.0);
		PLAYER.setVolume(vol);
		SETTINGS.playerVolume = vol;
	},
	null
);
