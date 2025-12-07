import { apiCall_tenor } from "../../api";
import { VideoList } from "./VideoList";
import { FormatChatMsgProcHook } from "../../overrides";
import { SAVEKEY_PFX } from "../../storage";
import { createChatButton, createCheckbox, createModal, doesModalExist } from "../../ui/ui";
import { addTextToChatline, arrayRemove, escapeHTML, /*getLast,*/ sendMessage } from "../../utils";

import * as css from "./style.css";

const id = "gif-modal";
const key = "GIFSEARCH";
const cache = [];

const KEY_gifFavorites    	 = SAVEKEY_PFX + "gifFavs";
//const KEY_gifChatAutoplay	 = SAVEKEY_PFX + "gifChatAutoplay";
//const KEY_gifMenuAutoplay	 = SAVEKEY_PFX + "gifMenuAutoplay";
const KEY_gifChatEnabled	 = SAVEKEY_PFX + "gifChatEnabled";
const KEY_gifSearchResultNum = SAVEKEY_PFX + "gifSearchResultNum";
const KEY_gifAutoSend		 = SAVEKEY_PFX + "gifAutoSend";

SETTINGS.gifFavorites 		= getOrDefault(KEY_gifFavorites, []);
//SETTINGS.gifChatAutoplay 	= getOrDefault(KEY_gifChatAutoplay, true);
//SETTINGS.gifMenuAutoplay 	= getOrDefault(KEY_gifMenuAutoplay, true);
SETTINGS.gifChatEnabled 	= getOrDefault(KEY_gifChatEnabled, true);
SETTINGS.gifSearchResultNum = getOrDefault(KEY_gifSearchResultNum, 20);
SETTINGS.gifAutoSend 		= getOrDefault(KEY_gifAutoSend, true);

$(window).unload(function() {
	setOpt(KEY_gifFavorites			, SETTINGS.gifFavorites);
	//setOpt(KEY_gifChatAutoplay  	, SETTINGS.gifChatAutoplay);
	//setOpt(KEY_gifMenuAutoplay    	, SETTINGS.gifMenuAutoplay);
	setOpt(KEY_gifChatEnabled 		, SETTINGS.gifChatEnabled);
	setOpt(KEY_gifSearchResultNum	, SETTINGS.gifSearchResultNum);
	setOpt(KEY_gifAutoSend			, SETTINGS.gifAutoSend);
})

let can_autosend = true;
let last_repost = 0;

window.CLIENT.Nexus.plugins.loaded["gif_search"] = true;

//const reg_tenor = /^https\:\/\/media\.tenor\.com\/[\w\-]+\/[\w\-]+\.(webm|mp4)$/;
const reg_tenor = /^https\:\/\/media\.tenor\.com\/[\w\-]+\/[\%\w\-]+\.(webp|gif)$/;

function onFavClick(el, URL, icon) {
	if (!addGifToFavorites(URL)) {
		removeGifFromFavorites(URL);
		el.classList.add("fav-btn-add");
		el.classList.remove("fav-btn-del");
		icon.removeClass("fa-trash-o").addClass("fa-star-o");
		return false;
	} else {
		el.classList.add("fav-btn-del");
		el.classList.remove("fav-btn-add");
		icon.removeClass("fa-star-o").addClass("fa-trash-o");
	}
	return true;
}

function addGifToFavorites(gif_url) {
	if (gif_url.match(reg_tenor) && !SETTINGS.gifFavorites.includes(gif_url)) {
		SETTINGS.gifFavorites.push(gif_url);
		setOpt(KEY_gifFavorites, SETTINGS.gifFavorites);
		return true;
	}
	return false;
}

function removeGifFromFavorites(gif_url) {
	if (arrayRemove(SETTINGS.gifFavorites, gif_url)) {
		setOpt(KEY_gifFavorites, SETTINGS.gifFavorites);
		return true;
	}
	return false;
}

function onStandardClick(URL) {
	
	if (!SETTINGS.gifChatEnabled) return;
							
	if (SETTINGS.gifAutoSend && !can_autosend) return;

	if (SETTINGS.gifAutoSend) {
		can_autosend = false;
		sendMessage(URL);
	} else
		addTextToChatline(URL + " ");

	MODALS[key].modal("hide");
	$("#chatline").focus();

}

function onCheckboxChange(e, key) {
	if (!e.originalEvent.isTrusted) return;
	SETTINGS[key] = this.checked;
}


function buildGifSearch() {

	if (doesModalExist(id, key)) return;

	const searchbar = $("<input/>", {
		class: "form-control input-sm",
		type: "text",
		placeholder: "Search Tenor"
	});

	const clearbtn = $("<button/>", {
		class: "btn btn-danger btn-sm",
		text: "Clear"
	});

	const searchbtn = $("<button/>", {
		class: "btn btn-primary btn-sm",
		text: "Search"
	});

	const inputgrpbtn = document.createElement("div");
	inputgrpbtn.classList.add("input-group-btn");
	inputgrpbtn.appendChild(searchbtn[0]);
	inputgrpbtn.appendChild(clearbtn[0]);

	const inputgrp = document.createElement("div");
	inputgrp.classList.add("input-group");
	inputgrp.appendChild(searchbar[0]);
	inputgrp.appendChild(inputgrpbtn);

	const columns = [];
	const COLUMN_NUM = 4;
	const container = $('<div class="tenor-container"></div>');

	for (let i = 0; i < COLUMN_NUM; i++) {
		const column = $("<div class='tenor-column'></div>");
		columns.push(column);
		container.append(column);
	}

	clearbtn.on("click", function (e) {
		$("#gf-search .tenor-column").empty();
		searchbar.val("");
	})

	searchbtn.on("click", function (e) {
		search(searchbar.val().trim());
	})

	searchbar.on("keydown", function (e) {
		if (e.keyCode == 13) {
			searchbtn.trigger("click");
		}
	})

	function search(term) {

		if (!SETTINGS.gifChatEnabled) return;

		apiCall_tenor({term: term, limit: document.getElementById("gf-in-resultnum").value}, function (ok, data) {
			if (ok && data && data.results) {

				$("#gf-search .tenor-column").empty();

				const r = data.results;
				let c = 0;

				//console.log(r);

				for (let i = 0; i < r.length; i++) {

					const URL = r[i].media_formats["tinywebp"].url;

					$("<div/>", {
						class: "tenor-wrap"
					}).append(
						createImageEmbed(URL, "tenor-embed", false, ()=>{onStandardClick(URL)})
						//createVideoEmbed(URL, "webm", SETTINGS.gifMenuAutoplay, "tenor-embed", ()=>{onStandardClick(URL)})
					).append(createFavButton(URL))
						.appendTo(columns[c])

					if (++c >= COLUMN_NUM) c = 0;

				}
			}/* else if (!ok && SETTINGS.DEBUG) {
				window.debuglog(data);
			}*/

		})
	}
	
	const settings_body = $("<div/>");

	MODALS[key] = createModal({
		id: id,
		header: "GIF Search",
		tabs: [
			{
				text: "Search",
				id: "gf-search",
				body: $(inputgrp).add(container)
			},
			{
				text: "Favorites",
				id: "gf-favorites",
				body: $('<div class="emotelist-paginator-container"></div>').add(container.clone()),
				body_title: "Favorites"
			},
			{
				text: "Settings",
				id: "gf-settings",
				body: settings_body,
				body_title: "GIF Settings"
			},
		],
		buttons: [],
		nonfluid: 1,
		backdrop: true
	}).on("shown.bs.modal", function () {
		searchbar.focus();
		can_autosend = true;
	})

	for (let i = SETTINGS.gifFavorites.length-1; i > 0; i--) {
		if (!reg_tenor.test(SETTINGS.gifFavorites[i])) {
			SETTINGS.gifFavorites.splice(i, 1);
		}
	}

	window.videofavlist = new VideoList("#gf-favorites", SETTINGS.gifFavorites, COLUMN_NUM, onStandardClick)
	videofavlist.handleChange();

	$("li a[href='#gf-favorites']").on("click", function(e) {
		videofavlist.handleChange();
	})
	
	$('<div class="form-group form-inline">'+
		'<div style="display: inline-block;float: right;" class="checkbox input-sm">'+
			'<label for="gf-in-resultnum"> Show '+
			'<select id="gf-in-resultnum" name="gf-in-resultnum">'+
				'<option value="5">5</option>'+
				'<option value="10">10</option>'+
				'<option value="15">15</option>'+
				'<option selected value="20">20</option>'+
				'<option value="30">30</option>'+
				'<option value="40">40</option>'+
				'<option value="50">50</option>'+
  			'</select> results '+
			'</label>'+
		'</div></div>'+
	'</div>').insertAfter(inputgrp);
		/*<div style="float: left;" class="checkbox input-sm">\
    		<label for="gf-autoplay" title="If unchecked, videos will only play when hovered. Takes effect on your next search."><input type="checkbox" id="gf-autoplay"> Autoplay Results </label>\
    	*/

	$("#gf-in-resultnum").val(SETTINGS.gifSearchResultNum).on("change", function() {
		setOpt(KEY_gifSearchResultNum, this.value);
	})

	/*$("#gf-autoplay").prop("checked", SETTINGS.gifMenuAutoplay).on("change", function(e) {
		if (!e.originalEvent.isTrusted) return;
		$("#gf-c-menuautoplay").prop("checked", this.checked);
		SETTINGS.gifMenuAutoplay = this.checked;
	});*/

	/*$("#gf-autosend").prop("checked", SETTINGS.gifAutoSend).on("change", function(e) {
		SETTINGS.gifAutoSend = this.checked;
		setOpt(KEY_gifAutoSend, this.checked)
	});*/
/*
	$('<nav aria-label="Page navigation" style="display: flex;width: 100%;">\
		<ul class="pagination" style="margin: 10px auto;">\
			<li>\
			<a href="#" aria-label="Previous">\
				<span aria-hidden="true">«</span>\
			</a>\
			</li>\
			<li><a href="#">1</a></li>\
			<li><a href="#">2</a></li>\
			<li><a href="#">3</a></li>\
			<li><a href="#">4</a></li>\
			<li><a href="#">5</a></li>\
			<li>\
			<a href="#" aria-label="Next">\
				<span aria-hidden="true">»</span>\
			</a>\
			</li>\
		</ul>\
	</nav>').insertBefore(container);*/

	/*
		<div style="float: left;" class="checkbox input-sm">\
			<label for="gf-autosend" title="If checked, videos will be instantly sent in chat when clicked, instead of being sent to your chat input box."><input type="checkbox" id="gf-autosend"> Instantly post GIFs when clicked </label>\
		</div>\*/

	settings_body.append(createCheckbox("gf-c-enable", "Enable Search & Embeds", "gifChatEnabled", function(e, key) {
		if (!e.originalEvent.isTrusted) return;
		onCheckboxChange.call(this, e, key);
		clearbtn.trigger("click");
	}))
	//.append(createCheckbox("gf-c-chatautoplay", "Autoplay Chat Embeds", "gifChatAutoplay", onCheckboxChange))
	/*.append(createCheckbox("gf-c-menuautoplay", "Autoplay Menu Embeds", "gifMenuAutoplay", function(e, key) {
		if (!e.originalEvent.isTrusted) return;
		onCheckboxChange.call(this, e, key);
		$("#gf-autoplay").prop("checked", this.checked);
	}))*/
	.append(createCheckbox("gf-c-autosend", "Instantly send GIFs from the menu when clicked", "gifAutoSend", onCheckboxChange))
}

export function createFavButton(gif_url) {
	const isFavorited = SETTINGS.gifFavorites.includes(gif_url);
	const icon = $("<i/>", {
		"class": (isFavorited ? "fa fa-trash-o" : "fa fa-star-o")
	});

	return $("<div class='gif-btn fav-btn'></div>").data("url", gif_url).addClass(isFavorited ? "fav-btn-del" : "fav-btn-add").on("click", function (e) {

		e.preventDefault();
		e.stopPropagation();

		const didAdd = onFavClick(this, gif_url, icon);

		const favs = $(".tenor-chat-embed .fav-btn, .tenor-wrap .fav-btn");
		for (let i = 0; i < favs.length; i++) {
			const fav = $(favs[i]);
			if (fav.data("url") == gif_url) {
				favs[i].classList.remove("fav-btn-del", "fav-btn-add");
				favs[i].classList.add(didAdd ? "fav-btn-del" : "fav-btn-add");
				fav.find("i").attr("class", didAdd ? "fa fa-trash-o" : "fa fa-star-o");
			}
		}
	}).append(icon);
}

function createRepostButton(gif_url) {

	return $("<div class='gif-btn repost-btn'></div>").data("url", gif_url).on("click", function (e) {

		e.preventDefault();
		e.stopPropagation();

		if (!hasPermission("chat")) return;

		if (Date.now() - last_repost >= 2000) {
			last_repost = Date.now();
			sendMessage(gif_url);
		}

	}).append($("<i/>", {
		"class": ("fa fa-retweet")
	}));
}

export function createImageEmbed(url, classes, showRepostBtn, onclick) {
	const div = $("<div/>");
	const img = $("<img/>", {
		src: escapeHTML(url),
		loading: "lazy"
	})
	div.append(img);

	if (classes && typeof(classes) == 'string') {
		div.addClass(classes);
	}

	if (onclick && typeof(onclick) == 'function') {
		div.on("click", function(e) {
			e.preventDefault();
			onclick(e);
		});
	}

	if (!showRepostBtn)
		return div.append(createFavButton(url));
	return div.append(createFavButton(url)).append(createRepostButton(url));
}

/*export function createVideoEmbed(url, type, autoplay, vidclasses, onclick) {
	if (!type) {
		const ext = getLast(url.split("."));
		if (ext == "webm") type = "webm";
		else if (ext == "mp4") type = "mp4";
		else throw new Error("createVideoEmbed: unknown extension (" + ext + "), only webm and mp4 accepted");
	}

	const video = $("<video/>", { muted: true, autoplay: false, loop: true, controlslist: "nofullscreen noremoteplayback", playsinline: true, disablepictureinpicture: true, disableremoteplayback: true })
				.append($("<source/>", { src: escapeHTML(url), type: "video/" + type }));


	//mute the damn thing. why do i have to explicitly mute it here anyway?
	video[0].muted = true;

	video.one("loadeddata", function() {
		this.muted = true;
		this.autoplay = autoplay;
		if (this.autoplay) {
			this.currentTime = 0.0;
			this.play();
		}
	});

	if (!autoplay) {
		video.on("mouseenter", function() {
			this.currentTime = 0.0;
			this.play();
		})
		video.on("mouseleave", function() {
			this.pause();
			this.currentTime = 0.0;
		})
	}

	if (vidclasses && typeof(vidclasses) == 'string') {
		video.addClass(vidclasses);
	}

	if (onclick && typeof(onclick) == 'function') {
		video.on("click", onclick);
	}

	return $("<div/>").append(video).append(createFavButton(url));
}*/

function processMessage(message, data) {
	let found_tenor = false;
	message.find("img").each(function() {
		if (found_tenor) return;
		const match = this.src.match(reg_tenor);
		if (match) {
			found_tenor = true;
			if (SETTINGS.gifChatEnabled) {
				//const embed = createVideoEmbed(this.href, match[1].toLowerCase(), SETTINGS.gifChatAutoplay);
				const embed = createImageEmbed(this.src, "tenor-chat-embed", true);
				$(this).replaceWith(embed);
			} else {
				$(this).replaceWith($("<code/>", {text: "tenor embed removed", title: this.src}));
			}
		}
	})
		/*
		message.find("a").each(function() {
			if (found_tenor) return;
			const match = this.href.match(reg_tenor);
			if (match) {
				found_tenor = true;
				const embed = createVideoEmbed(this.href, match[1].toLowerCase(), SETTINGS.gifChatAutoplay);
				embed.addClass("tenor-chat-embed");
				$(this).replaceWith(embed);
			}
			///^https\:\/\/media\.tenor\.com\/[\w-]+\/.+?\.(webm|mp4)$/
		})*/
	return message;
}

FormatChatMsgProcHook.registerListener(processMessage);

buildGifSearch();

$("#chat-buttons-left").append(createChatButton("gifbtn", "GIF Search", "film", () => { MODALS[key].modal(); }, null));