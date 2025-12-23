import { apiCall_tenor } from "../../api";
import { VideoList } from "./VideoList";
import { FormatChatMsgProcHook } from "../../overrides";
import { SAVEKEY_PFX } from "../../storage";
import { createChatButton, createCheckbox, createModal, doesModalExist } from "../../ui/ui";
import { addTextToChatline, arrayRemove, escapeHTML, sendMessage } from "../../utils";

import * as css from "./style.css";

const id = "gif-modal";
const key = "GIFSEARCH";

const KEY_gifFavorites    	 = SAVEKEY_PFX + "gifFavs";
const KEY_gifChatEnabled	 = SAVEKEY_PFX + "gifChatEnabled";
const KEY_gifSearchResultNum = SAVEKEY_PFX + "gifSearchResultNum";
const KEY_gifAutoSend		 = SAVEKEY_PFX + "gifAutoSend";

SETTINGS.gifFavorites 		= getOrDefault(KEY_gifFavorites, []);
SETTINGS.gifChatEnabled 	= getOrDefault(KEY_gifChatEnabled, true);
SETTINGS.gifSearchResultNum = getOrDefault(KEY_gifSearchResultNum, 20);
SETTINGS.gifAutoSend 		= getOrDefault(KEY_gifAutoSend, true);

$(window).unload(function() {
	setOpt(KEY_gifFavorites			, SETTINGS.gifFavorites);
	setOpt(KEY_gifChatEnabled 		, SETTINGS.gifChatEnabled);
	setOpt(KEY_gifSearchResultNum	, SETTINGS.gifSearchResultNum);
	setOpt(KEY_gifAutoSend			, SETTINGS.gifAutoSend);
})

let can_autosend = true;
let last_repost = 0;

window.CLIENT.Nexus.plugins.loaded["gif_search"] = true;

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

				for (let i = 0; i < r.length; i++) {

					const URL = r[i].media_formats["tinywebp"].url;

					$("<div/>", {
						class: "tenor-wrap"
					}).append(
						createImageEmbed(URL, "tenor-embed", false, ()=>{onStandardClick(URL)})
					).append(createFavButton(URL))
						.appendTo(columns[c])

					if (++c >= COLUMN_NUM) c = 0;

				}
			}

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

	$("#gf-in-resultnum").val(SETTINGS.gifSearchResultNum).on("change", function() {
		setOpt(KEY_gifSearchResultNum, this.value);
	})

	settings_body.append(createCheckbox("gf-c-enable", "Enable Search & Embeds", "gifChatEnabled", function(e, key) {
		if (!e.originalEvent.isTrusted) return;
		onCheckboxChange.call(this, e, key);
		clearbtn.trigger("click");
	}))
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

function processMessage(message, data) {
	let found_tenor = false;
	message.find("img").each(function() {
		if (found_tenor) return;
		const match = this.src.match(reg_tenor);
		if (match) {
			found_tenor = true;
			if (SETTINGS.gifChatEnabled) {
				const embed = createImageEmbed(this.src, "tenor-chat-embed", true);
				$(this).replaceWith(embed);
			} else {
				$(this).replaceWith($("<code/>", {text: "tenor embed removed", title: this.src}));
			}
		}
	})
	return message;
}

FormatChatMsgProcHook.registerListener(processMessage);

buildGifSearch();

$("#chat-buttons-left").append(createChatButton("gifbtn", "GIF Search", "film", () => { MODALS[key].modal(); }, null));