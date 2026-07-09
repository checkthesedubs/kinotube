import { ChatCommandAliases, ChatCommands } from "./classes/ChatCommand";

export function clamp(i, min, max) {
	return Math.max(min, Math.min(max, i))
}

export function addTextToChatline(str, focus) {
	if (str.trim() == "") return false;

	let chatline = $("#chatline");
	let val = chatline.val();

	if (val.length > 0 && !/\s/.test(val.substr(-1)))
		val += " ";

	if ((val + str).length > 320) return false;

	chatline.val(val + str);

	if (focus) chatline.focus();

	return true;
}

export function addTextToPMChatline(to_username, str, focus) {
	if (str.trim() == "") return false;
	if (!isValidUserName(to_username)) return false;

	let chatline = $("#pm-" + to_username + " input");
	if (!chatline || chatline.length <= 0) return false;

	let val = chatline.val();

	if (val.length > 0 && !/\s/.test(val.substr(-1)))
		val += " ";

	if ((val + str).length > 320) return false;

	chatline.val(val + str);

	if (focus) chatline.focus();

	return true;
}

export function validateOption(valid_options, value, def) {
	if (!Array.isArray(valid_options)) throw new Error("validateOption: valid_options must be an Array of possible valid values!");
	if (~valid_options.indexOf(value)) return value;
	else if (~valid_options.indexOf(def)) return def;
	else return valid_options[0];
}

export function stringToColor(str) {

	let hash = 0,
		color = "#";
	for (let i = 0; i < str.length; i++) {
	  hash = (str.charCodeAt(i) + SETTINGS.colorSeedOffset + ((hash << 5) - hash)) | 0;
	}

	for (let i = 0; i < 3; i++) {
		color += ('00' + ((hash >> (i * 8)) & 0xFF).toString(16)).substr(-2);
	}

	return color;
}

export function cacheAvatars() {
	if (!SETTINGS.cacheUserAvatars) return;
	$(".userlist_item").each(function () {
		let data = $(this).data();

		if (data.name && data.rank >= 1) {
			let profile = data.profile || { image: "", text: "" };
			CACHE.user_avatars[data.name] = profile.image;
		}
	})
}

export function findUserProfile(username) {
	const empty = { rank: -255, image: "", text: "" };
	if (!isValidUserName(username)) return empty;

	const item = findUserlistItem(username);
	if (!item) return empty;

	const data = item.data();
	return data.profile || empty;
}

export function cacheAvatar(username) {
	if (!SETTINGS.cacheUserAvatars) return;
	const profile = findUserProfile(username);
	if (profile.rank >= 1)
		CACHE.user_avatars[username] = profile.image;
}

export function cacheAvatarRaw(data) {
	if (SETTINGS.cacheUserAvatars && data && data.name && data.profile) {
		if (data.profile.image)
			CACHE.user_avatars[data.name] = data.profile.image;
		else
			CACHE.user_avatars[data.name] = "";
	}
}

export function getAvatar(username) {

	if (!SETTINGS.cacheUserAvatars) {
		if (SETTINGS.sanitizeProfileImg)
			return sanitizeImage(findUserProfile(username).image);
		else
			return findUserProfile(username).image;
	}

	if (!isValidUserName(username)) return "";

	if (!CACHE.user_avatars.hasOwnProperty(username)) {
		cacheAvatar(username);
	}

	if (CACHE.user_avatars[username] && CACHE.user_avatars[username].trim() !== "") {
		if (SETTINGS.sanitizeProfileImg)
			return sanitizeImage(CACHE.user_avatars[username]);
		else
			return CACHE.user_avatars[username];
	}

	return "";
}

export function isValidUserName(name) {
	return name.match(/^[\w-]{1,20}$/);
}

export function sendMessage(msg, addToChatHistory) {
	if (!hasPermission("chat")) return;

	let meta = {};

	if (USEROPTS.modhat && CLIENT.rank >= Rank.Moderator) {
		meta.modflair = CLIENT.rank;
	}

	if (addToChatHistory) {
		addMessageToChatHistory(msg, true);
	}

	socket.emit("chatMsg", {
		msg: msg,
		meta: meta
	});
}

export function toggleFavoriteEmote(emotename) {
	for (let i = SETTINGS.emoteFavorites.length - 1; i >= 0; i--) {
		if (SETTINGS.emoteFavorites[i] == emotename) {
			SETTINGS.emoteFavorites.splice(i, 1);
			EMOTEFAVLIST.handleChange();
			return;
		}
	}
	SETTINGS.emoteFavorites.push(emotename);
	EMOTEFAVLIST.handleChange();
}

export function addFavoriteEmote(emotename) {
	if (!SETTINGS.emoteFavorites.includes(emotename)) {
		SETTINGS.emoteFavorites.push(emotename);
		EMOTEFAVLIST.handleChange();
	}
}

export function arrayRemove(arr, item) {
	for (let i = arr.length; i >= 0; i--) {
		if (arr[i] == item) return arr.splice(i, 1);
	}
	return null;
}

export function escapeHTML(s) {
	return s.replaceAll("&", "&amp;")
			.replaceAll("<", "&lt;")
			.replaceAll(">", "&gt;")
			.replaceAll("\"", "&quot;")
			.replaceAll("'", "&#039;")
}

export function getRandom(arr) {
	return arr[Math.floor(Math.random() * arr.length)];
}

export function getLast(arr) {
	return arr[arr.length - 1];
}

export function emoteIsFx(name) {
	const code = name.charCodeAt(2);

	//turns out this weird abomination is pretty fast compared to regex
	//equivalent to the pattern /^(fx|ov)[A-Z0-9]/
	if (((name.charAt(0) == 'f' && name.charAt(1) == 'x') ||
		(name.charAt(0) == 'o' && name.charAt(1) == 'v')) &&
		(code >= 48 && code <= 57 || code >= 65 && code <= 90)) {
		return true;
	}
	return false;
}

export function flipMap(map) {
	const flipped = {}
	const _keys = Object.keys(map);
	for (let i = 0; i < _keys.length; i++) {
		if (!flipped[map[_keys[i]]]) flipped[map[_keys[i]]] = [_keys[i]]
		else flipped[map[_keys[i]]].push(_keys[i]);
	}
	return flipped;
}

export function messageUsesValidCommand(msg) {
	if (msg.charAt(0) == '!') {
		const cmd = msg.split(" ")[0].toLowerCase();
		return (ChatCommandAliases[cmd] ? ChatCommands[ChatCommandAliases[cmd]] : (ChatCommands[cmd] || null)) != null;
	}
	return false;
}

export const safeHosts = [
	"catbox.moe",
	"ibb.co",
	"imgchest.com",
	"tenor.com",
	"klipy.com",
	"redd.it",
	"imgur.com",
	"postimg.cc",
	"pinimg.com",
	"giphy.com",
	//"twimg.com",
	//"gstatic.com",
	"wikimedia.org",
	"derpicdn.net",
	"ytimg.com",
	//"wikia.nocookie.net",
	"tumblr.com",
	"gyazo.com",
	"kym-cdn.com",
	"lain.la",
	"sndcdn.com",
	"desu-usergeneratedcontent.xyz"
];
//\.(jpe?g|png|webp|gifv?)(?:\?[\w\d=%&;]+)?$
export function sanitizeImage(url) {

	if (!url) return "";

	url = url.replace("http://", "https://");
	const link_match = /^https\:\/\/(.+?)\/.+?(\.(?:jpe?g|png|webp|gifv?))?(?:\?[\w\d=%&;]+)?$/i;

	const matches = url.match(link_match);
	if (!matches || matches.length < 2) return "";

	const split = matches[1].toLowerCase().split(".");
	if (split.length < 2) return "";

	const domain = split[split.length-2] + "." + split[split.length-1];

	if (~safeHosts.indexOf(domain) && matches.length >= 3 && matches[2]) {
		return url;
	}

	//special cases
	if (!~safeHosts.indexOf(domain)) {
		if (split.length > 2) {
			const domain_sub = split[split.length-3] + "." + domain;
			if (domain_sub == "wikia.nocookie.net" || domain_sub == "pbs.twimg.com") {
				return url;
			} else if (domain == "gstatic.com" && split[split.length-3].indexOf("encrypted-tbn") == 0) {
				return url;
			}
		}

		if (domain == "gstatic.com" || domain == "twimg.com") {
			return url;
		}
	}

	return "";
}

export function addMessageToChatHistory(msg, resetIndex) {

	if (CHATHIST[CHATHIST.length-1] != msg)
		CHATHIST.push(msg);

	if (resetIndex)
		CHATHISTIDX = CHATHIST.length;
}

export function compareVersionStrings(a,b) {
	const ver_reg = /^(\d+)\.(\d+)\.(\d+)([A-Za-z]*)/
	let match_a = a.match(ver_reg);
	let match_b = b.match(ver_reg);
	if (!a || !b) return 0;
	for (let i = 1; i <= 4; i++) {
		if (match_a[i] > match_b[i]) return -1;
		if (match_a[i] < match_b[i]) return 1;
	}
	return 0;
}