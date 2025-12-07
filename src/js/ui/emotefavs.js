const { CustomShortEmoteList } = require("../classes/CustomShortEmoteList");
const { KEY_emoteFavSortAlpha } = require("../storage");
const { addTextToChatline, emoteIsFx } = require("../utils");
const { addTabsToModal, blankEmoteTabBody } = require("./ui");

addTabsToModal("emotelist", [
	{
		text: "Favorites",
		id: "em-favs",
		body: blankEmoteTabBody
	},
], "em_emotes", "Emotes");

const emotefavlist = new CustomShortEmoteList("#em-favs", SETTINGS.emoteFavorites, function (emote) {
	addTextToChatline(emote.name + " ", true);

	if (!emoteIsFx(emote.name)) {
		EMOTELISTMODAL.modal("hide");
		$("#chatline").focus();
	}
});

window.EMOTEFAVLIST = emotefavlist;

emotefavlist.sortAlphabetical = getOrDefault(KEY_emoteFavSortAlpha, false);

EMOTELISTMODAL.find("#em-favs .emotelist-alphabetical").prop("checked", emotefavlist.sortAlphabetical)
	.on("change", function () {
		emotefavlist.sortAlphabetical = this.checked;
		setOpt(KEY_emoteFavSortAlpha, this.checked);
	});

emotefavlist.handleChange();

$("#emotelist .modal-footer").addClass("text-info").css("text-align", "center").text("Favorite and unfavorite emotes by clicking on them while holding SHIFT.");