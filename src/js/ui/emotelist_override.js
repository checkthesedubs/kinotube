const { EmoteListOverride } = require("../classes/EmoteListOverride");
const { emoteIsFx, addTextToChatline } = require("../utils");

window.EMOTELIST.searchbar.off("keyup");
window.EMOTELIST.sortOption.off("change");
window.EMOTELIST.paginator.elem.remove();
window.EMOTELIST.paginator = null;
window.EMOTELIST = new EmoteListOverride("#em_emotes", function (emote) {
    addTextToChatline(emote.name + " ", true);

	if (!emoteIsFx(emote.name)) {
		window.EMOTELISTMODAL.modal("hide");
		chatline.focus();
	}
})

window.EMOTELIST.handleChange();