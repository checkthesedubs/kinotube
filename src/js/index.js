if (window.CLIENT.Nexus) throw new Error("Could not load plugin, it's already loaded!");

import { KEY_lastVersion, KEY_autoAcceptEmbed, KEY_cacheUserAvatars, KEY_chatAvatarSize, KEY_chatSide, KEY_chatTextSize, KEY_chatWidthSize, KEY_colorSeedOffset, KEY_dontRollFXEmotes, KEY_emoteFavorites, KEY_hideConnectionMessages, KEY_hideServerMsgs, KEY_navbarSize, KEY_playerVolume, KEY_saveUserAvatarCache, KEY_theme, KEY_trimUserAvatarCache, KEY_user_avatars, KEY_navbarHidden, KEY_chatAntifloodExact, KEY_chatAntifloodSimilar, KEY_hideBotMessages, KEY_chatHeaderSize, KEY_chatSmallEmotes, KEY_chatFooterSize, KEY_lastForcedTheme } from "./storage";
import * as css from "../css/base.scss";
import { validateOption } from "./utils";
import { ChatAvatarSize, ChatFooterSize, ChatHeaderSize, ChatSize, ChatWidthSize, NavbarSize, PageSide } from "./enum";

window.LAST_CONNECT_TIME = Date.now();

window.CLIENT.Nexus = {
	settings: {
		DEBUG: true,
		chatAntifloodExact: getOrDefault(KEY_chatAntifloodExact, (typeof window.EnableExactAntiflood == "boolean" ? window.EnableExactAntiflood : false)),
		chatAntifloodSimilar: getOrDefault(KEY_chatAntifloodSimilar, (typeof window.EnableSimilarAntiflood == "boolean" ? window.EnableSimilarAntiflood : false)),
		chatAvatarSize: validateOption(ChatAvatarSize, getOpt(KEY_chatAvatarSize), "large"),
		chatSide: validateOption(PageSide, getOpt(KEY_chatSide), "right"),
		chatTextSize: validateOption(ChatSize, getOpt(KEY_chatTextSize), "medium"),
		chatWidthSize: validateOption(ChatWidthSize, getOpt(KEY_chatWidthSize), "normal"),
		chatHeaderSize: validateOption(ChatHeaderSize, getOpt(KEY_chatHeaderSize), "normal"),
		chatFooterSize: validateOption(ChatFooterSize, getOpt(KEY_chatFooterSize), "normal"),
		chatSmallEmotes: getOrDefault(KEY_chatSmallEmotes, false),
		navbarSize: validateOption(NavbarSize, getOpt(KEY_navbarSize), "normal"),
		navbarHidden: getOrDefault(KEY_navbarHidden, false),
		dontRollFXEmotes: getOrDefault(KEY_dontRollFXEmotes, true),
		emoteFavorites: getOrDefault(KEY_emoteFavorites, []),
		colorSeedOffset: getOrDefault(KEY_colorSeedOffset, 0),
		cacheUserAvatars: getOrDefault(KEY_cacheUserAvatars, true),
		saveUserAvatarCache: getOrDefault(KEY_saveUserAvatarCache, true),
		trimUserAvatarCache: getOrDefault(KEY_trimUserAvatarCache, false),
		autoAcceptEmbed: getOrDefault(KEY_autoAcceptEmbed, true),
		playerVolume: getOrDefault(KEY_playerVolume, 0.20),
		hideServerMsgs: getOrDefault(KEY_hideServerMsgs, true),
		theme: getOrDefault(KEY_theme, window.DefaultThemeOverride || "custtheme_billtube"),
		hideConnectionMessages: getOrDefault(KEY_hideConnectionMessages, false),
		hideBotMessages: getOrDefault(KEY_hideBotMessages, false),
		lastForcedTheme: getOrDefault(KEY_lastForcedTheme, "none"),
	},
	cache: {
		user_avatars: getOrDefault(KEY_user_avatars, {}),
		emotes_fx: [],
		emotes_ov: [],
		last_rolls: {}
	},
	modals: {},
	plugins: {
		loaded: {}
	},
	fn: {},
	_last_version: getOrDefault(KEY_lastVersion, "0.0.0"),
	_version: "0.0.27"
}

window.CACHE = window.CLIENT.Nexus.cache;
window.SETTINGS = window.CLIENT.Nexus.settings;
window.MODALS = window.CLIENT.Nexus.modals;

if (!SETTINGS.emoteFavorites instanceof Array) SETTINGS.emoteFavorites = [];
if (!CACHE.emotes_fx instanceof Array) CACHE.emotes_fx = [];
if (!CACHE.emotes_ov instanceof Array) CACHE.emotes_ov = [];
if (!CACHE.user_avatars instanceof Object) CACHE.user_avatars = {};
if (!CACHE.last_rolls instanceof Object) CACHE.last_rolls = {};

/*window.debuglog = function(msg) {
	if (SETTINGS.DEBUG) {
		console.log(msg);
	}
}*/

//Disable CyTube's playerjs logging, can leak memory over time depending on the player being used
//No one's gonna use this log anyway
playerjs.log = function(){};
playerjs.log.history = null;

window.MOBILE = /Mobile|iP(hone|od|ad)|Android|BlackBerry|IEMobile|Kindle|NetFront|Silk-Accelerated|(hpw|web)OS|Fennec|Minimo|Opera M(obi|ini)|Blazer|Dolfin|Dolphin|Skyfire|Zune/.test(navigator.userAgent);
