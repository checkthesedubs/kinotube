import { KEY_playerVolume } from "../storage";
import { clamp } from "../utils";

const interval = setInterval(function() {
	if (!PLAYER) return;
	PLAYER.getVolume(function(vol) {
	  SETTINGS.playerVolume = vol;
	})
}, 2000);

socket.on("changeMedia", function() {
	setTimeout(function() {
		if (!PLAYER) return;
		PLAYER.setVolume(clamp(SETTINGS.playerVolume, 0.0, 1.0));
	}, 1800)
})

if (PLAYER) {
	setTimeout(function() {
		if (!PLAYER) return;
		PLAYER.setVolume(clamp(SETTINGS.playerVolume, 0.0, 1.0));
	}, 1800)
}

$(window).unload(function() {
	PLAYER.getVolume(function(v) {
		setOpt(KEY_playerVolume, v);
	})
})