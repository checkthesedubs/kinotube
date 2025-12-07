let emoteListReady = true;

EMOTELISTMODAL.on("hidden.bs.modal", ()=>{
	emoteListReady = true;
})
EMOTELISTMODAL.on("hide.bs.modal", ()=>{
	emoteListReady = false;
})
EMOTELISTMODAL.on("show.bs.modal", ()=>{
	emoteListReady = false;
})
EMOTELISTMODAL.on("shown.bs.modal", ()=>{
	emoteListReady = true;
})

$(document).on("keydown", function(e) {
	if (e.keyCode === 69 && e.ctrlKey) {
		e.preventDefault();
		e.stopPropagation();

		if (emoteListReady && ($(".modal.in").length <= 0 || EMOTELISTMODAL.hasClass("in"))) {
			EMOTELISTMODAL.modal();
		}
	}
})