import { themes } from "./classes/Theme";
import { RenameEmoteHook } from "./overrides";
import { saveall } from "./storage";
import { applyTheme, applyThemeOverride, updateExternalThemes } from "./ui/themes";
import { setChatlinePlaceholder, updateAccountButton } from "./ui/ui";

const { fixVidTitle } = require("./ui/layout");
const { sanitizeImage, cacheAvatarRaw } = require("./utils");

export function onUpdateEmote(data, list, emotelist) {
	for (let i = 0; i < list.length; i++) {
		if (list[i].name == data.name) {
			list[i] = data;
			return;
		}
	}
	list.push(data);
	if (emotelist)
		emotelist.handleChange();
}

export function onRemoveEmote(data, list, emotelist) {
	for (let i = list.length-1; i >= 0; i--) {
		if (list[i].name == data.name) {
			list.splice(i, 1);
			if (emotelist)
				emotelist.handleChange();
			return;
		}
	}
}

export function onRenameEmote(data, list, emotelist) {
	for (let i = 0; i < list.length; i++) {
		if (list[i].name == data.old) {
			list[i].name = data.name;
			if (emotelist)
				emotelist.handleChange();
			return;
		}
	}
}

socket.on("setAFK", function (data) {
	if (CLIENT.name !== "" && data.name === CLIENT.name) {
		if (data.afk)
			$("#afktoggle").addClass("afkactive");
		else
			$("#afktoggle").removeClass("afkactive");
	}
})

socket.on("addUser", function (data) {
  if (data.rank >= 1) cacheAvatarRaw(data);
})

socket.on("changeMedia", fixVidTitle);

socket.on("chatMsg", function(data) {
	if (data.msg.charAt(0) == '!') {
		const cmd = data.msg.split(" ")[0].toLowerCase();
		if (cmd == '!roll') {
			CACHE.last_rolls[data.username] = data.time;
		}
	}
})

socket.on("channelOpts", function(opts) {
	setChatlinePlaceholder();
})

socket.on("setPermissions", function(perms) {
	setChatlinePlaceholder();
});

socket.on("login", function(data) {
	updateAccountButton(data);
})

socket.on("userLeave", function (data) {
  if (SETTINGS.trimUserAvatarCache)
    delete CACHE.user_avatars[data.name];
})

socket.on("setUserProfile", function (data) {
	cacheAvatarRaw(data);
  if (data.name == CLIENT.name) {
    let pfp = data.profile.image;
    if (SETTINGS.sanitizeProfileImg) {
      pfp = sanitizeImage(pfp);
    }
    if (pfp == "") pfp = "//:0";
    $("nav.navbar .dropdown .profile-image-small").attr("src", pfp);
  }
})

RenameEmoteHook.registerListener(function (data) {
	onRenameEmote(data, SETTINGS.emoteFavorites[i], EMOTEFAVLIST);
});

export function onScriptAccept() {
  updateExternalThemes();
  if (!applyThemeOverride() && !themes[SETTINGS.theme]) {
    applyTheme(window.DefaultThemeOverride || "custtheme_billtube", true);
  }

  const channelNameText = document.getElementsByClassName("navbar-brand");
  if (channelNameText.length > 0) channelNameText[0].textContent = (window.ChannelName && typeof(window.ChannelName) == 'string') ? window.ChannelName : window.CHANNEL.name;

  if (null != window.Background_Image && typeof(window.Background_Image) == 'string' && /^(https\:\/\/|data\:image\/png\;base64\,)/i.test(window.Background_Image)) {
    $("#wrap").css("background-image", "url('"+Background_Image+"')")
  } else {
    $("#wrap").css("background-image", "url('')")
  }
}

$(window).unload(function () {
	saveall();
});
