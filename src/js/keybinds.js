EMOTELISTMODAL.on("show.bs.modal", ()=>{
	EMOTELISTMODAL[0].querySelector(".tab-pane.active .emotelist-search").focus();
})

$(document).on("keydown", function(e) {
	if (e.ctrlKey) {
		if (e.keyCode === 69) { // ctrl+e - emote menu
			e.preventDefault();
			e.stopPropagation();

			if ($(".modal.in").length <= 0) {
				EMOTELISTMODAL.modal();
			}
		}
		else if (e.keyCode === 83) { // ctrl+s - script settings
			e.preventDefault();
			e.stopPropagation();

			if ($(".modal.in").length <= 0) {
				MODALS["scriptSettings"]?.modal();
			}
		}
	}
})