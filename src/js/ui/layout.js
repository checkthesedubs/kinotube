import { cacheAvatars } from "../utils";
import { createChatButton, createChatTextButton, repaintChat, setChatlinePlaceholder, SpawnCommandModal, updateAccountButton, updateLayoutSettings, wrapSelectedChatText } from "./ui";
import img_discord from "../../img/disc64.png";
import mobile_css from "../../css/mobile.css?raw";

const ttopt = {container: "body"};

//Apply mobile CSS if the script determines the device is a phone or whatever (see index.js)
if (MOBILE) {
	const css_element = document.createElement("style");
	css_element.classList.add("mobile-css");
	css_element.innerHTML = mobile_css;
	document.getElementsByTagName("head")[0].appendChild(css_element);
}

//Removes the "Currently Playing: " text from the video title
export function fixVidTitle(data) {
	if (data) {
		$("#currenttitle").text(data.title).attr("title", data.title);
	} else {
		let title = $('#currenttitle').text().split("Currently Playing: ").pop();
		$("#currenttitle").text(title).attr("title", title);
	}
}

//Replaces the user count text with just the number of users connected
export function fixUserCount() {
	let users = /^(\d+)/.exec($("#usercount").text());
	$("#usercount").text(users ? users[1] : "---")
}

function setNavbarVisibility(visible) {
	SETTINGS.navbarHidden = !SETTINGS.navbarHidden;

	const body = document.getElementsByTagName("body")[0];

	if (SETTINGS.navbarHidden) {
		body.classList.add("navbar-disabled");
	} else {
		body.classList.remove("navbar-disabled");
	}
	
	scrollChat();
}

//Removes all classes from the body element, and clears the static height set for the userlist/chat area
document.getElementsByTagName("body")[0].classList = [];
document.getElementById("userlist").style.height = '';
document.getElementById("messagebuffer").style.height = '';

//Remove the button that deletes your account (why does this even exist here l0l)
$("a[href='/account/delete']").remove();

const _container = $("#mainpage > div").eq(0);

//Force fluid rules
_container.attr("class", "container-fluid");

//Put stuff into the container, which pretty much sets up the non-chat scrollable side of the page
$("#main").prependTo(_container);
$("#footer").appendTo(_container);

//Create the chat footer, and also add chat size classes based on client settings
$("<div/>").attr("id", "chat-footer")
		   .insertAfter($("#messagebuffer").addClass("chat-size-" + SETTINGS.chatTextSize + " chat-avatars-" + SETTINGS.chatAvatarSize))
		   .append(
				$("<div/>").attr("id", "chat-footer-container")
					.append($("#chatwrap > form").append('<div id="chat-buttons-inline"></div>').css("position", "relative"))
					.append($("<div/>").attr("id", "chat-buttons")
						.append($("<div/>").attr("id", "chat-buttons-left"))
						.append($("<div/>").attr("id", "chat-buttons-right"))
					)
		    )

const chatline = $("#chatline");

chatline.addClass("input-sm");

//Create a ResizeObserver which keeps the size of the text input small enough so that it doesn't run into the buttons that lay inside that area
const chatInlineObserver = new ResizeObserver((entries) => {
	chatline[0].style["padding-right"] = (entries[0].contentRect.width + 8) + "px"
});
chatInlineObserver.observe(document.getElementById("chat-buttons-inline"));

setChatlinePlaceholder();

//Move the whole chat area after the container; this sets up the chat side of the page
$("#chatwrap").attr("class", "").insertAfter(_container);
$("#announcements").prependTo("#chatwrap").removeClass("row");

$("#leftpane").removeAttr("class").insertAfter("#playlistrow");
$("#pollwrap").insertAfter("#videowrap");
$("#rightpane").removeAttr("class");
$("nav.navbar").addClass("navbar-right");

$("#currenttitle").prependTo("#chatheader").before('<i class="fa fa-play"></i>');

$("#usercount").off().on("click", toggleUserlist).attr("title", "Show/Hide Userlist")
			   .insertAfter($("#userlisttoggle").off().on("click", toggleUserlist).attr("class", "fa fa-users pointer"));

$("#chat-buttons-left").append(createChatButton("emotebtn", "Emote Menu", "smile-o", () => { EMOTELISTMODAL.modal(); }, null));
$("#chat-buttons-right").append(createChatButton("navtogglebtn", "Toggle Top Bar", "window-maximize", () => { setNavbarVisibility(); }, null))
						.append(createChatTextButton("afktoggle", "Toggle AFK", "AFK", () => { socket.emit("chatMsg", { msg: "/afk" }) }, null));
						

$("#chat-buttons-inline").append($("#chatbtn"))
					     .append($("<button/>", {id: "textfxbtn", type: "button", class: "btn btn-default btn-chat", title: "Text Effects"}).append($("<i/>", {class: "fa fa-font"})).on("click", ()=>{$("#text-fx-menu").toggle();}).tooltip(ttopt))
					     .append($("<button/>", {id: "cmdbtn", type: "button", class: "btn btn-default btn-chat", title: "Chat Commands"}).append($("<i/>", {class: "fa fa-terminal"})).on("click", SpawnCommandModal).tooltip(ttopt));

$("#modflair").remove();
$("#videowrap-header").remove();
$("#userlist").hide();

$("#newpollbtn").appendTo("#pollwrap");
$("#emotelistbtn").remove();

$(".row > div").removeClass("col-lg-5 col-lg-7 col-lg-12 col-md-5 col-md-7 col-md-12");


fixVidTitle();
fixUserCount();
cacheAvatars();
repaintChat();
updateAccountButton();
updateLayoutSettings();
scrollChat();

EMOTELISTMODAL.on("hidden.bs.modal", function() {
	chatline.focus();
})

$(`<div id="pluginfooter" class="row" style="padding: 5px 20px;text-align: center;background: #440404db"><div>&nbsp;· kinotube · <span style="color:red;">work in progress</span> · v` + window.CLIENT.Nexus._version + ` ·&nbsp;</div></div>`).insertBefore($("footer"));

document.getElementsByClassName("navbar-brand")[0].textContent = (window.ChannelName && typeof(window.ChannelName) == 'string') ? window.ChannelName : window.CHANNEL.name;
document.getElementsByClassName("navbar-brand")[0].href = window.location.protocol + "//" + window.location.host + "/r/" + CHANNEL.name;

if (null != window.Background_Image && typeof(window.Background_Image) == 'string' && /^(https\:\/\/|data\:image\/png\;base64\,)/i.test(window.Background_Image)) {
	$("#wrap").css("background-image", "url('"+Background_Image+"')")
}

if (null != window.Discord_URL && typeof(window.Discord_URL) == 'string' && /^https\:\/\/discord\.gg\//i.test(window.Discord_URL)) {
	$("<li/>", {style: "float:right;"}).append(
		$("<a/>", {"data-placement": "bottom", class:"navbar-brand navbar-icon", id:"discord", title: "Discord", 'aria-hidden':'true', href: "javascript:void(0)"}).tooltip(ttopt)
			.append($("<img/>", {src:img_discord, style:"height:2em;"}))).appendTo($(".navbar .navbar-nav"));

	$("#discord").on("click", function() {
		if (null != window.Discord_URL && typeof(window.Discord_URL) == 'string' && /^https\:\/\/discord\.gg\//i.test(window.Discord_URL)) {
			if (window.confirm("This button is taking you to a Discord server:\n\n"+Discord_URL+"\n\nContinue?"))
				window.open(Discord_URL, '_blank');
		}
	})
}

if (null != window.Favicon_URL) {
	if (window.Favicon_URL != "") {
		if (typeof(window.Favicon_URL) == 'string' && /^https\:\/\//i.test(window.Favicon_URL)) {
			$("<link/>", {
				"id": "favicon",
				"rel": "shortcut icon",
				"href": window.Favicon_URL
			}).appendTo('head');
		} else {
			console.error("ERROR: did not change favicon! Favicon URL must be a string, and must begin with https://");
		}
	}
}

$("#us-general form.form-horizontal").prepend('<div class="col-sm-4"></div><div class="col-sm-8"><p class="text-danger" style="font-weight: bold;">These are vanilla CyTube options and should stay set to Slate and Fluid.</p></div>');

/*

		begin Video Overlay section
		(the buttons that appear when hovering over the video)

*/

let vidOverlay = $("<div/>", {
	id: "videoOverlay"
}).prependTo("#videowrap");

$("<button/>", {
	class: "btn btn-sm btn-default",
	text: "Reload Video"
}).on("click", function() {
  //vanilla cytube mediarefresh behavior
  PLAYER.mediaType = "";
  PLAYER.mediaId = "";
  socket.emit("playerReady");
}).appendTo(vidOverlay);

const vidcontrol_voteskip = $("<button/>", {
	class: "btn btn-sm btn-default",
	text: "Voteskip"
}).on("click", function() {
	if (CHANNEL.opts.allow_voteskip && hasPermission("voteskip")) {
		socket.emit("voteskip");
		$("#voteskip").attr("disabled", true);
	}
}).appendTo(vidOverlay);

$("<button/>", {
	class: "btn btn-sm btn-default",
	text: "Fullscreen"
}).on("click", function() {
  $("#fullscreenbtn").trigger("click");
}).appendTo(vidOverlay);

let overlay_timeout = null;

$("#videowrap").on("mouseenter", function() {
	if (CHANNEL.opts.allow_voteskip && hasPermission("voteskip")) {
		vidcontrol_voteskip.show();
	} else {
		vidcontrol_voteskip.hide();
	}
	clearTimeout(overlay_timeout);
	overlay_timeout = setTimeout(function() {
		vidOverlay.hide();
	}, 4000);
	vidOverlay.show();
})

/*$("#videowrap").on("mousemove", function() {
	clearTimeout(overlay_timeout);
	vidOverlay.show();
	overlay_timeout = setTimeout(function() {
		vidOverlay.hide();
	}, 4000);
})*/

$("#videowrap").on("mouseleave", function() {
	clearTimeout(overlay_timeout);
	vidOverlay.hide();
})

$("#videoOverlay").on("mouseover", function() {
	clearTimeout(overlay_timeout);
})

$("#videoOverlay").on("mouseout", function() {
	overlay_timeout = setTimeout(function() {
		vidOverlay.hide();
	}, 4000);
})

/*

		end Video Overlay section

*/


const text_colors_wrap = $("<div/>", {id: "text-colors-wrap"});

$("<div/>", {
	id: "text-fx-menu"
})
.append($("<button/>", {class: "btn btn-default btn-sm", title: "Bold", style: "font-weight: bold;", text: "B"}).on("click", ()=>{wrapSelectedChatText("*", "*", true);}).tooltip(ttopt))
.append($("<div/>", {id: "text-colors"}).append(text_colors_wrap))
.append($("<button/>", {class: "btn btn-default btn-sm", title: "Italics",  style: "font-style: italic;", text: "I"}).on("click", ()=>{wrapSelectedChatText("_", "_");}).tooltip(ttopt))
.append($("<button/>", {class: "btn btn-default btn-sm", title: "Strikethrough",  html: "<s>&nbsp;S&nbsp;<s>"}).on("click", ()=>{wrapSelectedChatText("~~", "~~");}).tooltip(ttopt))
.append($("<button/>", {class: "btn btn-default btn-sm", title: "Spoiler",  text: "Sp"}).on("click", ()=>{wrapSelectedChatText("[sp]", "[/sp]");}).tooltip(ttopt))
.append($("<button/>", {class: "btn btn-default btn-sm", title: "Code Block",  html: "<code>code</code>"}).on("click", ()=>{wrapSelectedChatText("`", "`");}).tooltip(ttopt))
.append($("<button/>", {class: "btn btn-default btn-sm", title: "Text Colors",  text: "Colors"}).on("click", ()=>{$("#text-colors").toggle();}).tooltip(ttopt))
.prependTo("#chat-footer-container");

const colors = ["white", "black", "dimgray", "gray", "slategray", "mistyrose", "lightcoral", "red", "firebrick", "darkred",
				"linen", "lightsalmon", "coral", "orangered", "saddlebrown", "antiquewhite", "peachpuff", "sandybrown",
				"darkorange", "papayawhip", "navajowhite", "gold", "orange", "beige", "yellow", "olive", "honeydew",
				"lightgreen", "palegreen", "chartreuse", "greenyellow", "olivedrab", "mediumspringgreen", "lime", "green",
				"aquamarine", "aqua", "turquoise", "seagreen", "lightblue", "teal", "lightskyblue", "deepskyblue",
				"dodgerblue", "blue", "navy", "blueviolet", "slateblue", "violet", "magenta", "darkviolet", "indigo",
				"pink", "hotpink", "deeppink", "crimson"];

for (let i = 0; i < colors.length; i++) {
	const span = $("<span/>", {style: "background: " + colors[i] + ";", title: colors[i]});
	span.on("click", ()=>{wrapSelectedChatText("col:"+colors[i]+":", "")});
	text_colors_wrap.append(span);
}

$("<label/>", {class: "btn btn-sm btn-info", for: "color-picker", text: "Pick custom color..."})
	.append($("<input/>", {id: "color-picker", type: "color"}).on("change", function(e) {
		if (!e.originalEvent.isTrusted) return;
		wrapSelectedChatText("col:"+e.target.value+":", "");
		this.value = "#000000";
	})).appendTo(text_colors_wrap);