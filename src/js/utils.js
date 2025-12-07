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

		if (data.name) {
			let profile = data.profile || { image: "", text: "" };
			CACHE.user_avatars[data.name] = profile.image;
		}
	})
}

export function findUserProfile(username) {
	const empty = { image: "", text: "" };
	if (!isValidUserName(username)) return empty;

	const item = findUserlistItem(username);
	if (!item) return empty;

	const data = item.data();
	return data.profile || empty;
}

export function cacheAvatar(username) {
	if (!SETTINGS.cacheUserAvatars) return;
	CACHE.user_avatars[username] = findUserProfile(username).image;
}

export function cacheAvatarRaw(data) {
	if (SETTINGS.cacheUserAvatars && data && data.name && data.profile && data.profile.hasOwnProperty("image")) {
		CACHE.user_avatars[data.name] = data.profile.image;
	}
}

export function getAvatar(username) {

	if (!SETTINGS.cacheUserAvatars) {
		return findUserProfile(username).image;
	}

	if (!isValidUserName(username)) return "";

	if (!CACHE.user_avatars.hasOwnProperty(username)) {
		cacheAvatar(username);
	}

	if (CACHE.user_avatars[username] && CACHE.user_avatars[username].trim() !== "")
		return CACHE.user_avatars[username];

	return "";
}

export function isValidUserName(name) {
	return name.match(/^[\w-]{1,20}$/);
}

export function sendMessage(msg) {
	if (!hasPermission("chat")) return;

	let meta = {};

	if (USEROPTS.modhat && CLIENT.rank >= Rank.Moderator) {
		meta.modflair = CLIENT.rank;
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