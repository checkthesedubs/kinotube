export const SAVEKEY_PFX = "$nexus_";
export const ROOM_PFX = CHANNEL.name.toLowerCase() + "_";

export const KEY_lastVersion		= SAVEKEY_PFX +				"lastVersion";
export const KEY_chatAntifloodExact	= SAVEKEY_PFX +	ROOM_PFX +	"chatAntifloodExact";
export const KEY_chatAntifloodSimilar = SAVEKEY_PFX+ROOM_PFX +	"chatAntifloodSimilar";
export const KEY_chatAvatarSize		= SAVEKEY_PFX +				"chatAvatarSize";
export const KEY_chatTextSize		= SAVEKEY_PFX +				"chatTextSize";
export const KEY_chatWidthSize		= SAVEKEY_PFX +				"chatWidthSize";
export const KEY_chatHeaderSize		= SAVEKEY_PFX +				"chatHeaderSize";
export const KEY_chatFooterSize		= SAVEKEY_PFX +				"chatFooterSize";
export const KEY_chatSmallEmotes	= SAVEKEY_PFX +				"chatSmallEmotes";
export const KEY_navbarSize			= SAVEKEY_PFX +				"navbarSize";
export const KEY_navbarHidden		= SAVEKEY_PFX +				"navbarHidden";
export const KEY_chatSide			= SAVEKEY_PFX +				"chatSide";
export const KEY_dontRollFXEmotes 	= SAVEKEY_PFX +				"dontRollFXEmotes";
export const KEY_emoteFavorites   	= SAVEKEY_PFX + ROOM_PFX + 	"emoteFavs";
export const KEY_colorSeedOffset	= SAVEKEY_PFX + 			"colorSeedOffset";
export const KEY_gifFavorites    	= SAVEKEY_PFX +				"gifFavs";
//export const KEY_gifChatAutoplay	= SAVEKEY_PFX + 			"gifChatAutoplay";
//export const KEY_gifMenuAutoplay	= SAVEKEY_PFX + 			"gifMenuAutoplay";
export const KEY_gifChatEnabled		= SAVEKEY_PFX + 			"gifChatEnabled";
export const KEY_user_avatars	 	= SAVEKEY_PFX +				"cache_avatars";
export const KEY_fxSortAlphabetical	= SAVEKEY_PFX +				"fxlist_sort";
export const KEY_ovSortAlphabetical	= SAVEKEY_PFX +				"ovlist_sort";
export const KEY_emoteFavSortAlpha	= SAVEKEY_PFX +				"emotefav_sort";
export const KEY_cacheUserAvatars	= SAVEKEY_PFX +				"cacheUserAvatars";
export const KEY_saveUserAvatarCache= SAVEKEY_PFX +				"saveUserAvatarCache";
export const KEY_trimUserAvatarCache= SAVEKEY_PFX +				"trimUserAvatarCache";
export const KEY_autoAcceptEmbed    = SAVEKEY_PFX +				"autoAcceptEmbed";
export const KEY_playerVolume	    = SAVEKEY_PFX +				"playerVolume";
export const KEY_theme	   			= SAVEKEY_PFX +	ROOM_PFX + 	"theme";
export const KEY_hideServerMsgs		= SAVEKEY_PFX +				"hideServerMsgs";
export const KEY_hideConnectionMessages = SAVEKEY_PFX +			"hideConnectionMessages";
export const KEY_hideBotMessages	= SAVEKEY_PFX +				"hideBotMessages";
export const KEY_lastForcedTheme	= SAVEKEY_PFX + ROOM_PFX +	"lastForcedTheme";


export function saveall() {
	//Any missing entries here might be self-managed elsewhere, such as plugin settings.
	if (!window.CLIENT.Nexus || !SETTINGS || !CACHE) return console.warn("storage::saveall: CLIENT.Nexus not yet defined, did not save!");

	if (/^\d+\.\d+\.\d+$/.test(window.CLIENT.Nexus._version))
		setOpt(KEY_lastVersion			, window.CLIENT.Nexus._version);
	
	setOpt(KEY_chatAntifloodExact	, SETTINGS.chatAntifloodExact);
	setOpt(KEY_chatAntifloodSimilar	, SETTINGS.chatAntifloodSimilar);
	setOpt(KEY_hideBotMessages		, SETTINGS.hideBotMessages);
	setOpt(KEY_chatAvatarSize		, SETTINGS.chatAvatarSize);
	setOpt(KEY_chatTextSize			, SETTINGS.chatTextSize);
	setOpt(KEY_chatWidthSize		, SETTINGS.chatWidthSize);
	setOpt(KEY_chatHeaderSize		, SETTINGS.chatHeaderSize);
	setOpt(KEY_chatFooterSize		, SETTINGS.chatFooterSize);
	setOpt(KEY_chatSmallEmotes		, SETTINGS.chatSmallEmotes);
	setOpt(KEY_navbarSize			, SETTINGS.navbarSize);
	setOpt(KEY_navbarHidden			, SETTINGS.navbarHidden);
	setOpt(KEY_chatSide				, SETTINGS.chatSide);
	setOpt(KEY_dontRollFXEmotes		, SETTINGS.dontRollFXEmotes);
	setOpt(KEY_emoteFavorites  		, SETTINGS.emoteFavorites);
	setOpt(KEY_gifFavorites    		, SETTINGS.gifFavorites);
	setOpt(KEY_colorSeedOffset 		, SETTINGS.colorSeedOffset);
	//setOpt(KEY_gifChatAutoplay		, SETTINGS.gifChatAutoplay);
	//setOpt(KEY_gifMenuAutoplay 		, SETTINGS.gifMenuAutoplay);
	setOpt(KEY_gifChatEnabled  		, SETTINGS.gifChatEnabled);
	setOpt(KEY_cacheUserAvatars		, SETTINGS.cacheUserAvatars);
	setOpt(KEY_saveUserAvatarCache	, SETTINGS.saveUserAvatarCache);
	setOpt(KEY_trimUserAvatarCache	, SETTINGS.trimUserAvatarCache);
	setOpt(KEY_autoAcceptEmbed		, SETTINGS.autoAcceptEmbed);
	setOpt(KEY_playerVolume			, SETTINGS.playerVolume);
	setOpt(KEY_theme				, SETTINGS.theme);
	setOpt(KEY_hideServerMsgs		, SETTINGS.hideServerMsgs);
	setOpt(KEY_user_avatars    		, SETTINGS.saveUserAvatarCache ? CACHE.user_avatars : {});
	setOpt(KEY_hideConnectionMessages,SETTINGS.hideConnectionMessages);
	setOpt(KEY_lastForcedTheme		, SETTINGS.lastForcedTheme);
}