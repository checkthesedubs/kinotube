// This file is mostly vanilla CyTube functions with a few things added into them.
import { execCommand } from "./classes/ChatCommand";
import { execClientCommand } from "./classes/ClientCommand";
import { EventDataHook } from "./classes/EventDataHook";
import { onChatEmoteClick } from "./ui/ui";
import { addTextToChatline, getAvatar, messageUsesValidCommand, stringToColor } from "./utils";

export const RenameEmoteHook = new EventDataHook(false);
export const FormatChatMsgProcHook = new EventDataHook(true);
//export const FormatChatMsgSafeProcHook = new EventDataHook(false);

const levenshteinDistance = require("js-levenshtein");

function sendChatInput() {
	if (CHATTHROTTLE) {
		return;
	}
	var msg = $("#chatline").val();
	if (msg.trim() != "") {
		if (msg.charAt(0) == "/") {
			let cmdPart = msg.split(" ")[0].toLowerCase();
			if (execClientCommand(cmdPart, msg.substring(cmdPart.length + 1).trim())) {
				CHATHIST.push(msg);
				CHATHISTIDX = CHATHIST.length;
				$("#chatline").val("");
				return;
			}
		}
		var meta = {};
		if (USEROPTS.adminhat && CLIENT.rank >= 255) {
			msg = "/a " + msg;
		} else if (USEROPTS.modhat && CLIENT.rank >= Rank.Moderator) {
			meta.modflair = CLIENT.rank;
		}

		// The /m command no longer exists, so emulate it clientside
		if (CLIENT.rank >= 2 && msg.indexOf("/m ") === 0) {
			meta.modflair = CLIENT.rank;
			msg = msg.substring(3);
		}

		let cmdPart = msg.split(" ")[0].toLowerCase();
		let cmdOutput = execCommand(cmdPart, msg.substring(cmdPart.length + 1).trim());

		socket.emit("chatMsg", {
			msg: msg,
			meta: meta
		});

		if (cmdOutput && cmdOutput !== "") {
			socket.emit("chatMsg", { msg: '🤖 ' + cmdOutput, meta: meta });
		}
		CHATHIST.push($("#chatline").val());
		CHATHISTIDX = CHATHIST.length;
		$("#chatline").val("");
	}
}

$("#chatline").off("keydown");
$("#chatline").on("keydown", function (ev) {
	// Enter/return
	if (ev.keyCode == 13) {
		sendChatInput();
		return;
	}
	else if (ev.keyCode == 9) { // Tab completion
		try {
			chatTabComplete(ev.target);
		} catch (error) {
			console.error(error);
		}
		ev.preventDefault();
		return false;
	}
	else if (ev.keyCode == 38) { // Up arrow (input history)
		if (CHATHISTIDX == CHATHIST.length) {
			CHATHIST.push($("#chatline").val());
		}
		if (CHATHISTIDX > 0) {
			CHATHISTIDX--;
			$("#chatline").val(CHATHIST[CHATHISTIDX]);
		}

		ev.preventDefault();
		return false;
	}
	else if (ev.keyCode == 40) { // Down arrow (input history)
		if (CHATHISTIDX < CHATHIST.length - 1) {
			CHATHISTIDX++;
			$("#chatline").val(CHATHIST[CHATHISTIDX]);
		}

		ev.preventDefault();
		return false;
	}
});

window.highlightsMe = function(message) {
	//return message.match(new RegExp("(^|\\b)" + CLIENT.name + "\:?($|\\b)", "gi"));
	return new RegExp(CLIENT.name, "gi").test(message);
}

window.toggleUserlist = function () {
	const userlist = $("#userlist");
	// var direction = !USEROPTS.layout.match(/synchtube/) ? "glyphicon-chevron-right" : "glyphicon-chevron-left"
	if (userlist[0].style.display === "none") {
		userlist.show();
		//$("#userlisttoggle").removeClass(direction).addClass("glyphicon-chevron-down");
	} else {
		userlist.hide();
		//$("#userlisttoggle").removeClass("glyphicon-chevron-down").addClass(direction);
	}
	scrollChat();
};

window.formatChatMessage = function (data, last) {
	// Backwards compat
	if (!data.meta || data.msgclass) {
		data.meta = {
			addClass: data.msgclass,
			// And the award for "variable name most like Java source code" goes to...
			addClassToNameAndTimestamp: data.msgclass
		};
	}
	// Phase 1: Determine whether to show the username or not
	var skip = data.username === last.name;
	if (data.meta.addClass === "server-whisper")
		skip = true;
	// Prevent impersonation by abuse of the bold filter
	if (data.msg.match(/^\s*<strong>\w+\s*:\s*<\/strong>\s*/))
		skip = false;
	if (data.meta.forceShowName)
		skip = false;

	data.msg = stripImages(data.msg);
	data.msg = execEmotes(data.msg);

	last.name = data.username;
	var div = $("<div/>").addClass("chat-msg");
	/* drink is a special case because the entire container gets the class, not
	   just the message */
	if (data.meta.addClass === "drink") {
		div.addClass("drink");
		data.meta.addClass = "";
	}

	// Add timestamps (unless disabled)
	if (USEROPTS.show_timestamps) {
		var time = $("<span/>").addClass("timestamp").appendTo(div);
		var timestamp = new Date(data.time).toTimeString().split(" ")[0];
		time.text("[" + timestamp + "] ");
		if (data.meta.addClass && data.meta.addClassToNameAndTimestamp) {
			time.addClass(data.meta.addClass);
		}
	}

	// Add username
	var name = $("<span/>")
		.addClass("nametitle");
	if (!skip) {
		name.appendTo(div);
		div.addClass("chat-new");
	}
	let color = stringToColor(data.username);
	let username_el = $("<strong/>").addClass("username").text(data.username + ": ").css("color", color).on("click", function () {
		addTextToChatline(data.username + ": ", true);
	});

	if (SETTINGS.chatAvatarSize !== "none") {

		let avatar = getAvatar(data.username);

		if (avatar.trim() !== "") {
			$("<img/>")
				.attr("src", avatar)
				.attr("title", data.username)
				.addClass("profile-image")
				.prependTo(name);
		} else {
			$("<div/>")
				.addClass("text-avatar")
				.text(data.username.substring(0, 2).toUpperCase())
				.css("background-color", color + "7F")
				.prependTo(name);
		}
	}
	username_el.appendTo(name);
	if (data.meta.modflair) {
		name.addClass(getNameColor(data.meta.modflair));
	}
	if (data.meta.addClass && data.meta.addClassToNameAndTimestamp) {
		name.addClass(data.meta.addClass);
	}
	if (data.meta.superadminflair) {
		name.addClass("label")
			.addClass(data.meta.superadminflair.labelclass);
		$("<span/>").addClass(data.meta.superadminflair.icon)
			.addClass("glyphicon")
			.css("margin-right", "3px")
			.prependTo(name);
	}

	// Add the message itself
	var message = $("<span/>").addClass("message").appendTo(div);
	message[0].innerHTML = data.msg;

	message.find(".channel-emote").on("click", function (e) {
		onChatEmoteClick.call(this, e);
	});

	message = FormatChatMsgProcHook.processListeners(message, data);

	// For /me the username is part of the message
	if (data.meta.action) {
		name.remove();
		message[0].innerHTML = data.username + " " + data.msg;
	}
	if (data.meta.addClass) {
		message.addClass(data.meta.addClass);
	}
	if (data.meta.shadow) {
		div.addClass("chat-shadow");
	}
	return div;
}

window.Callbacks.connect = function() {
	window.LAST_CONNECT_TIME = Date.now();
	HAS_CONNECTED_BEFORE = true;
	SOCKETIO_CONNECT_ERROR_COUNT = 0;
	$("#socketio-connect-error").remove();
	socket.emit("joinChannel", {
		name: CHANNEL.name
	});

	if (CHANNEL.opts.password) {
		socket.emit("channelPassword", CHANNEL.opts.password);
	}

	if (CLIENT.name && CLIENT.guest) {
		socket.emit("login", {
			name: CLIENT.name
		});
	}

	if (!SETTINGS.hideConnectionMessages) {
		$("<div/>").addClass("server-msg-reconnect")
			.text("Connected")
			.appendTo($("#messagebuffer"));
		scrollChat();
	}

	stopQueueSpinner(null);
}

window.Callbacks.disconnect = function () {
	if(KICKED)
    	return;

	if (!SETTINGS.hideConnectionMessages) {
		$("<div/>")
			.addClass("server-msg-disconnect")
			.text("Disconnected from server.")
			.appendTo($("#messagebuffer"));
		scrollChat();
	}
}

window.Callbacks.renameEmote = function (data) {
	var badBefore = /\s/g.test(data.old);
	var badAfter = /\s/g.test(data.name);
	var oldName = data.old;
	delete data.old;

	data.regex = new RegExp(data.source, "gi");

	for (var i = 0; i < CHANNEL.emotes.length; i++) {
		if (CHANNEL.emotes[i].name === oldName) {
			CHANNEL.emotes[i] = data;
			break;
		}
	}

	// Now bad
	if(badAfter){
		// But wasn't bad before: Add it to bad list
		if(!badBefore){
			CHANNEL.badEmotes.push(data);
			delete CHANNEL.emoteMap[oldName];
		// Was bad before too: Update
		} else {
			for (let i = 0; i < CHANNEL.badEmotes.length; i++) {
				if (CHANNEL.badEmotes[i].name === oldName) {
					CHANNEL.badEmotes[i] = data;
					break;
				}
			}
		}
	// Not bad now
	} else {
		// But was bad before: Drop from list
		if(badBefore){
			for (let i = 0; i < CHANNEL.badEmotes.length; i++) {
				if (CHANNEL.badEmotes[i].name === oldName) {
					CHANNEL.badEmotes.splice(i, 1);
					break;
				}
			}
		} else {
			delete CHANNEL.emoteMap[oldName];
		}
		CHANNEL.emoteMap[data.name] = data;
	}

	EMOTELIST.handleChange();
	CSEMOTELIST.handleChange();

	RenameEmoteHook.processListeners({
		image: data.image,
		name: data.name,
		regex: data.regex,
		source: data.source,
		old: oldName
	});
	
}

window.Callbacks.usercount = function (count) {
	CHANNEL.usercount = count;
	$("#usercount").text(count);
}

$("#chatbtn").off("click").on("click", sendChatInput);

window.INITCHATMAXSIZE = /*window.CHATMAXSIZE || */100;

$("#messagebuffer").unbind('scroll');
$("#messagebuffer").scroll(function (ev) {
    if (IGNORE_SCROLL_EVENT) {
        // Skip event, this was triggered by scrollChat() and not by a user action.
        // Reset for next event.
        IGNORE_SCROLL_EVENT = false;
        return;
    }

    var m = $("#messagebuffer");
    var lastChildHeight = 0;
    var messages = m.children();
    if (messages.length > 0) {
        lastChildHeight = $(messages[messages.length - 1]).outerHeight() || 0;
    }

    var isCaughtUp = m.height() + m.scrollTop() >= m.prop("scrollHeight") - lastChildHeight - 128.0;
    if (isCaughtUp) {
        SCROLLCHAT = true;
        window.CHATMAXSIZE = window.INITCHATMAXSIZE || 100;
        $("#newmessages-indicator").remove();
    } else {
        SCROLLCHAT = false;
    }
});

window.LASTCHAT["msg"] = "";
window.lastUserChat = {};

window.addChatMessage = function(data) {
    if(IGNORED.indexOf(data.username) !== -1) {
        return;
    }
    if (data.meta.shadow && !USEROPTS.show_shadowchat) {
        return;
    }
	if (SETTINGS.hideServerMsgs && data.username.charAt(0) == "[") {
		return;
	}
    // This is so we discard repeated messages
    // which become annoying when the user is experiencing repeated socketio reconnects
    if (data.time < LASTCHAT.time || (data.time == LASTCHAT.time && data.msg == LASTCHAT.msg)) {
        return;
    } else {
        LASTCHAT.time = data.time;
		LASTCHAT.msg = data.msg;
    }

	let selfflood = false;

	if (SETTINGS.hideBotMessages) {
		if ((data.msg.startsWith("\uD83E\uDD16") && messageUsesValidCommand(lastUserChat[data.username].msg)) || messageUsesValidCommand(data.msg)) {
			if (CLIENT.name == data.username) {
				selfflood = true;
			} else return;
		}
	}

	if (SETTINGS.chatAntifloodExact && lastUserChat[data.username] && lastUserChat[data.username].msg == data.msg) {
		if (data.time - lastUserChat[data.username].time < (window.ExactAntifloodCooldown || 10000)) {
			if (CLIENT.name == data.username) {
				selfflood = true;
			} else return;
		}
	}

    if (SETTINGS.chatAntifloodSimilar
		&& lastUserChat[data.username] != undefined
		&& data.time - lastUserChat[data.username].time < (window.SimilarAntifloodCooldown || 10000)
		&& levenshteinDistance(lastUserChat[data.username].msg, data.msg) <= 2) {
		if (CLIENT.name == data.username) {
			selfflood = true;
		} else return;
    }

	if (!selfflood) {
		lastUserChat[data.username] = {
			msg: data.msg,
			time: data.time
		}
	}

    var msgBuf = document.getElementById("messagebuffer");
    var div = formatChatMessage(data, LASTCHAT);
    // Incoming: a bunch of crap for the feature where if you hover over
    // a message, it highlights messages from that user
    var safeUsername = data.username.replace(/[^\w-]/g, '\\$');
	if (selfflood) div.addClass("self-flood");
    div.addClass("chat-msg-" + safeUsername);
    div.appendTo(msgBuf);
    div.on('mouseover', function() {
        $(".chat-msg-" + safeUsername).addClass("nick-hover");
    });
    div.on('mouseleave', function() {
        $(".nick-hover").removeClass("nick-hover");
    });
    //var oldHeight = msgBuf.prop("scrollHeight");
    //var numRemoved = trimChatBuffer();
    if (SCROLLCHAT) {
        scrollChat();
        trimChatBuffer();
    } else {
        if (window.CHATMAXSIZE < 2000) { ++window.CHATMAXSIZE; }
        var newMessageDiv = $("#newmessages-indicator");
        if (!newMessageDiv.length) {
            newMessageDiv = $("<div/>").attr("id", "newmessages-indicator")
                    .insertBefore($("#chatline"));
            var bgHack = $("<span/>").attr("id", "newmessages-indicator-bghack")
                    .appendTo(newMessageDiv);

            $("<span/>").addClass("glyphicon glyphicon-chevron-down")
                    .appendTo(bgHack);
            $("<span/>").text("New Messages Below").appendTo(bgHack);
            $("<span/>").addClass("glyphicon glyphicon-chevron-down")
                    .appendTo(bgHack);
            newMessageDiv.on('click', function () {
                SCROLLCHAT = true;
                scrollChat();
                trimChatBuffer();
            });
        }

        /*if (numRemoved > 0) {
            IGNORE_SCROLL_EVENT = true;
            var diff = oldHeight - msgBuf.prop("scrollHeight");
            scrollAndIgnoreEvent(msgBuf.scrollTop() - diff);
        }*/
    }

    div.find("img").load(function () {
        if (SCROLLCHAT) {
            scrollChat();
            trimChatBuffer();
        }
    });

    var isHighlight = false;
    if (CLIENT.name && data.username != CLIENT.name) {
        if (highlightsMe(data.msg)) {
            div.addClass("nick-highlight");
            isHighlight = true;
        }
    }

    pingMessage(isHighlight, data.username, $(div.children()[2]).text());
}

//Weird way to override only part of applyOpts to redirect the chatbtn
const old_applyOpts = window.applyOpts;
window.applyOpts = function() {

  const old_chatbtn_opt = USEROPTS.chatbtn;
  const old_layout_opt = USEROPTS.layout;
  USEROPTS.chatbtn = false;
  USEROPTS.layout = "fluid";

  old_applyOpts();

  USEROPTS.chatbtn = old_chatbtn_opt;
  USEROPTS.layout = old_layout_opt;

  $("#chatbtn").remove();
  if(USEROPTS.chatbtn) {
    var btn = $("<button/>").addClass("btn btn-default btn-block")
    .text("Send")
    .attr("id", "chatbtn")
    .prependTo($("#chat-buttons-inline"));
    btn.on('click', function() {
      sendChatInput();
    });
  }
  
	if (SETTINGS.hideConnectionMessages) {
		$(".server-msg-reconnect").remove();
		$(".server-msg-disconnect").remove();
	}

}

window.formatUserlistItem = function(div) {
    var data = {
        name: div.data("name") || "",
        rank: div.data("rank"),
        profile: div.data("profile") || { image: "", text: ""},
        leader: div.data("leader") || false,
        icon: div.data("icon") || false,
    };
    var name = $(div.children()[1]);
    name.removeClass();
    name.css("font-style", "");
    name.addClass(getNameColor(data.rank));
    div.find(".profile-box").remove();

    var meta = div.data().meta || {}; // Not sure how this could happen.
    if (meta.afk) {
        div.addClass("userlist_afk");
    } else {
        div.removeClass("userlist_afk");
    }

    if (meta.muted) {
        div.addClass("userlist_muted");
    } else {
        div.removeClass("userlist_muted");
    }

    if (meta.smuted) {
        div.addClass("userlist_smuted");
    } else {
        div.removeClass("userlist_smuted");
    }

    var profile = null;
    /*
     * 2015-10-19
     * Prevent rendering unnecessary duplicates of the profile box when
     * a user's status changes.
     */
    name.unbind("mouseenter");
    name.unbind("mousemove");
    name.unbind("mouseleave");
    div.unbind("mouseenter");
    div.unbind("mousemove");
    div.unbind("mouseleave");

    div.on('mouseenter', function(ev) {
        if (profile)
            profile.remove();

        var top = ev.clientY + 5;
        var horiz = ev.clientX;
        profile = $("<div/>")
            .addClass("profile-box linewrap")
            .css("top", top + "px")
            .appendTo(div);

        if(data.profile.image) {
            $("<img/>").addClass("profile-image")
                .attr("src", data.profile.image)
                .appendTo(profile);
        }
        $("<strong/>").text(data.name).appendTo(profile);

        var meta = div.data("meta") || {};
        if (meta.ip && USEROPTS.show_ip_in_tooltip) {
            $("<br/>").appendTo(profile);
            $("<em/>").text(meta.ip).appendTo(profile);
        }
        if (meta.aliases) {
            $("<br/>").appendTo(profile);
            $("<em/>").text("aliases: " + meta.aliases.join(", ")).appendTo(profile);
        }
        $("<hr/>").css("margin-top", "5px").css("margin-bottom", "5px").appendTo(profile);
        $("<p/>").text(data.profile.text).appendTo(profile);

        if (!$("body").hasClass("chat-side-left")) horiz -= profile.outerWidth();
        profile.css("left", horiz + "px")
    });
    div.on('mousemove', function(ev) {
        var top = ev.clientY + 5;
        var horiz = ev.clientX;

        if (!$("body").hasClass("chat-side-left")) horiz -= profile.outerWidth();
        profile.css("left", horiz + "px")
            .css("top", top + "px");
    });
    div.on('mouseleave', function() {
        profile.remove();
    });
    var icon = div.children()[0];
    icon.innerHTML = "";
    // denote current leader with a star
    if(data.leader) {
        $("<span/>").addClass("glyphicon glyphicon-star-empty").appendTo(icon);
    }
    if(div.data().meta.afk) {
        name.css("font-style", "italic");
        $("<span/>").addClass("glyphicon glyphicon-time").appendTo(icon);
    }
    if (data.icon) {
        $("<span/>").addClass("glyphicon " + data.icon).prependTo(icon);
    }
}

let useritems = $(".userlist_item");
for (let i = 0; i < useritems.length; i++) {formatUserlistItem(useritems.eq(i));}
useritems = null;