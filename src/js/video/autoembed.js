function acceptEmbedWarning() {
	if (SETTINGS.autoAcceptEmbed) {
		const trustedUser = window.OnlyAutoAcceptEmbedsFrom || "";
		const button = $("#ytapiplayer .alert button:contains('Embed')");
		const isString = typeof(trustedUser) == 'string';
	
		if (trustedUser && isString && trustedUser.length > 0) {
			const active = $(".queue_active");
			if (active && active.length > 0 && active[0].title.split("Added by: ")[1].toLowerCase() == trustedUser.toLowerCase()) {
				setTimeout(()=>{ button.trigger("click") }, 250);
			}
		} else if (!trustedUser || (isString && trustedUser.trim() == "")) {
			setTimeout(()=>{ button.trigger("click") }, 250);
		}
	}
}

socket.on("changeMedia", function(data) {
	if (data.meta && data.meta.embed) {
		acceptEmbedWarning();
	}
})

acceptEmbedWarning();