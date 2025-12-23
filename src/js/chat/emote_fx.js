const { CustomEmoteList } = require("../classes/CustomEmoteList");
const { FXEmoteList } = require("../classes/FXEmoteList");
const { onRenameEmote, onUpdateEmote, onRemoveEmote } = require("../events");
const { RenameEmoteHook } = require("../overrides");
const { KEY_fxSortAlphabetical, KEY_ovSortAlphabetical } = require("../storage");
const { addTabsToModal, blankEmoteTabBody } = require("../ui/ui");
const { addTextToChatline, emoteIsFx } = require("../utils");

//import * as css from "../../css/emote_fx.css";

const reg_fx = /^(fx|ov)[A-Z0-9]/;

function cacheEmoteFX() {

	const fx = getFxEmotes();

	CACHE.emotes_fx = [];
	CACHE.emotes_ov = [];

	for (let i = 0; i < fx.length; i++) {
		if (fx[i].name.charAt(0) == 'f') CACHE.emotes_fx.push(fx[i]);
		else CACHE.emotes_ov.push(fx[i]);
	}
}

function getFxEmotes() {

	const fx = [];

	for (let i = 0; i < CHANNEL.emotes.length; i++) {

		if (emoteIsFx(CHANNEL.emotes[i].name)) {
			fx.push(CHANNEL.emotes[i]);
		}

	}

	return fx;

}

// augment the existing Emote Menu

cacheEmoteFX();
addTabsToModal("emotelist", [
	{
		text: "Effects",
		id: "em-effects",
		body: blankEmoteTabBody
	},
	{
		text: "Overlays",
		id: "em-overlays",
		body: blankEmoteTabBody
	}
], "em_emotes", "Emotes");

const fxmenu = new FXEmoteList("#em-effects", CACHE.emotes_fx, function (emote) {
	addTextToChatline(emote.name + " ", true);
});

const ovmenu = new CustomEmoteList("#em-overlays", CACHE.emotes_ov, function (emote) {
	addTextToChatline(emote.name + " ", true)
});

fxmenu.sortAlphabetical = getOrDefault(KEY_fxSortAlphabetical, false);
ovmenu.sortAlphabetical = getOrDefault(KEY_ovSortAlphabetical, false);

EMOTELISTMODAL.find("#em-effects .emotelist-alphabetical").prop("checked", fxmenu.sortAlphabetical)
	.on("change", function () {
		fxmenu.sortAlphabetical = this.checked;
		setOpt(KEY_fxSortAlphabetical, this.checked);
	});
EMOTELISTMODAL.find("#em-overlays .emotelist-alphabetical").prop("checked", ovmenu.sortAlphabetical)
	.on("change", function () {
		ovmenu.sortAlphabetical = this.checked;
		setOpt(KEY_ovSortAlphabetical, this.checked);
	});

fxmenu.handleChange();
ovmenu.handleChange();

window.EMOTEFXLIST = fxmenu;
window.EMOTEOVLIST = ovmenu;

function renameEmoteListener(data) {
	if (reg_fx.test(data.old)) {

		if (data.old.charAt(0) == 'f') {
			onRenameEmote(data, CACHE.emotes_fx, fxmenu);
		} else {
			onRenameEmote(data, CACHE.emotes_ov, ovmenu);
		}
		
	}
}

socket.on("updateEmote", function(data) {
	if (reg_fx.test(data.name)) {

		if (data.name.charAt(0) == 'f') {
			onUpdateEmote(data, CACHE.emotes_fx, fxmenu);
		} else {
			onUpdateEmote(data, CACHE.emotes_ov, ovmenu);
		}
		
	}
})

socket.on("removeEmote", function(data) {
	if (reg_fx.test(data.name)) {

		if (data.name.charAt(0) == 'f') {
			onRemoveEmote(data, CACHE.emotes_fx, fxmenu);
		} else {
			onRemoveEmote(data, CACHE.emotes_ov, ovmenu);
		}
		
	}
})

RenameEmoteHook.registerListener(renameEmoteListener);

// end emote menu augmentation