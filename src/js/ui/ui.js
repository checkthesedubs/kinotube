import { ChatCommandAliases, ChatCommands } from "../classes/ChatCommand";
import { ClientCommandAliases, ClientCommands } from "../classes/ClientCommand";
import { addTextToChatline, escapeHTML, flipMap, getAvatar, stringToColor, toggleFavoriteEmote } from "../utils";

export const blankEmoteTabBody =
	'<div class="pull-left"><input class="emotelist-search form-control" type="text" placeholder="Search"></div>'+
	'<div class="pull-right"><div class="checkbox"><label><input class="emotelist-alphabetical" type="checkbox">Sort alphabetically</label></div></div>'+
	'<div class="emotelist-paginator-container"></div>'+
	'<table class="emotelist-table"><tbody></tbody></table>';

export function addTabsToModal(modal_id, tabs, replacement_id, replacement_text) {

	let modal = $("#" + modal_id);

	if (modal.length <= 0) return console.error("addTabsToModal: #" + modal_id + " does not exist!");

	if (modal.find(".tab-content").length <= 0) {
		if (replacement_id == null || replacement_id.trim() == "" || replacement_text == null || replacement_text.trim() == "") {
			throw new Error("addTabsToModal: #" + modal_id + " is not a tabbed modal yet, so replacement_id and replacement_text are required!");
		}

		if ($("#" + replacement_id).length >= 1) {
			throw new Error("addTabsToModal: the replacement ID, #" + replacement_id + " already exists! Choose a new one!");
		}
	} else {
		for (let i = 0; i < tabs.length; i++) {
			if (modal.find("#" + tabs[i].id).length >= 1) {
				console.warn("addTabsToModal: #" + modal_id + " already has tab #" + tabs[i].id + ", skipping");
				tabs[i] = null;
			}
		}
	}

	if (tabs && tabs.length > 0) {

		let first_tab;

		let header = modal.find(".modal-header");

		//add tabs to header
		let tabrow = header.find(".nav-tabs");

		if (tabrow.length <= 0) {

			header
				.css("border-bottom", "none")
				.css("padding-bottom", 0)
				.css("margin-bottom", 0);

			tabrow = $("<ul/>", { "class": "nav nav-tabs" }).appendTo(header);
		}

		let body = modal.find(".modal-body");

		let tabcontent = body.find(".tab-content");

		if (tabcontent.length <= 0) {
			let children = body.find(">").detach();
			tabcontent = $("<div/>", { "class": "tab-content" }).appendTo(body);
			
			$("<div/>", {
				"class": "tab-pane",
				id: replacement_id
			}).append(children).appendTo(tabcontent);

			first_tab = $("<a/>", {
				"href": "#" + replacement_id,
				"data-toggle": "tab",
				text: replacement_text
			});

			$("<li/>").append(first_tab).prependTo(tabrow);
		}

		const hasActiveTab = tabrow.find("li.active").length >= 1;

		for (let i = 0; i < tabs.length; i++) {
			if (tabs[i] == null) continue;

			const tab = $("<a/>", {
				"href": "#" + tabs[i].id,
				"data-toggle": "tab",
				text: tabs[i].text
			});

			$("<li/>")
				.append(tab)
				.appendTo(tabrow);

			if (!first_tab && !hasActiveTab) first_tab = tab;

			let tempbody = $("<div/>", {
				"class": "tab-pane",
				id: tabs[i].id,
			}).appendTo(tabcontent);

			if (tabs[i].body_title) {
				tempbody.append($("<h4/>").text(tabs[i].body_title));
			}

			tempbody.append(tabs[i].body);

		}

		if (first_tab) {
			first_tab.trigger("click");
		}
	}
}

/*
{
  id: modal id,
  header: title text,
  tabs: [
	{
	  text: "Text",
	  target_id: "id"
	}
  ],
  body: body html,
  body: [
	{
	  "title":text,
	  "id":id,
	  html:html
	}
  ],
  buttons: [
	{
	  text: "text",
	  "extra_classes": "",
	  dismiss: false,
	  onclick
	}
  ],
  backdrop: false/true/static,
  nonfluid: true,
  centered: true,
  nofooter: true
}
*/

/**
 * Creates a modal using the given options and adds it to the page if valid.
 * @param {Object} options
 * @param {string} options[].id
 * @param {string} options[].header
 * @param {?Object[]} options[].tabs
 * @param {string} options[].tabs[].text
 * @param {string} options[].tabs[].id
 * @param {Node|string|Object[]} options[].tabs[].body
 * @param {?string} [options[].body]
 * @param {Object[]} options[].buttons
 * @param {string} options[].buttons[].text
 * @param {string} options[].buttons[].extra_classes
 * @param {boolean} options[].buttons[].dismiss
 * @param {?function} [options[].buttons[].onclick]
 * @param {?boolean|string} [options[].backdrop] - Changes whether or not the modal has a backdrop: false, true, or "static"
 * @param {?boolean} [options[].nonfluid]
 * @param {?boolean} [options[].centered]
 * @param {?boolean} [options[].nofooter = false]
 * @param {?boolean} [show]
 */
export function createModal(options, show) {
	if (!options) {
		return console.error("createModal: options cannot be null!");
	}

	if ($("#" + options.id).length > 0) {
		let _modal = $("#" + options.id);
		if (_modal.hasClass("modal")) {
			/*console.warn("createModal: a modal with that ID already exists!");
			if (show)
			  _modal.modal();*/
			throw new Error("createModal: a modal already exists with that ID!");
		}
		else {
			throw new Error("createModal: a non-modal element already exists with that ID!");
		}
		return null;
	}

	let hasTabs = options.tabs && Array.isArray(options.tabs);

	if (hasTabs && options.body) {
		console.warn("createModal: tabs were found in options, ignoring body")
	}


	//content container
	let content = $('<div class="modal-content"></div>');

	let dialog = $('<div class="modal-dialog"></div>').append(content);

	if (options['nonfluid']) {
		dialog.addClass("modal-dialog-nonfluid");
	}

	if (options['centered']) {
		dialog.addClass("modal-centered");
	}

	//modal container
	let modal = $("<div/>", {
		"id": options.id,
		"class": "modal fade",
		tabindex: "-1",
		role: "dialog",
		"aria-hidden": "true"
	})
		.append(dialog);

	if (options.hasOwnProperty("backdrop")) {
		let backdrop = options.backdrop;
		if (typeof (backdrop) == "string") backdrop = backdrop.toLowerCase();
		if (backdrop == true || backdrop == false || backdrop == "false" || backdrop == "true" || backdrop == "static") {
			modal.attr("data-backdrop", backdrop);
		}
	}

	//header
	let header = $("<div/>", {
		"class": "modal-header"
	})
		.append($("<button/>", {
			"class": "close",
			"data-dismiss": "modal",
			"aria-hidden": "true",
			"text": '\u00D7'
		}))
		.append($("<h4/>").text(options.header))
		.appendTo(content);

	//content body
	let body = $("<div/>", {
		"class": "modal-body"
	}).appendTo(content);

	if (!hasTabs) {
		body.html(options.body);
	} else {

		//construct tabs if given
		if (options.tabs) {

			//add tabs to header
			header
				.css("border-bottom", "none")
				.css("padding-bottom", 0)
				.css("margin-bottom", 0);

			let tabrow = $("<ul/>", { "class": "nav nav-tabs" }).appendTo(header);

			let tabcontent = $("<div/>", { "class": "tab-content" }).appendTo(body);

			for (let i = 0; i < options.tabs.length; i++) {

				if (!options.tabs[i].hasOwnProperty("body")) {
					console.warn("createModal: skipping tab for #" + options.tabs[i].id + ", no body found");
					continue;
				}

				$("<li/>")
					.append(
						$("<a/>", {
							"href": "#" + options.tabs[i].id,
							"data-toggle": "tab",
							text: options.tabs[i].text
						})
					)
					.appendTo(tabrow);

				let tempbody = $("<div/>", {
					"class": "tab-pane",
					id: options.tabs[i].id
				}).appendTo(tabcontent);

				if (options.tabs[i].body_title) {
					tempbody.append($("<h4/>").text(options.tabs[i].body_title));
				}

				tempbody.append(options.tabs[i].body);
			}
		}
	}

	//footer
	if (!options.nofooter) {
		const footer = $("<div/>", {
			"class": "modal-footer"
		}).appendTo(content);
	
		for (let i = 0; i < options.buttons.length; i++) {
			let button =
				$("<button/>", {
					"class": "btn " + options.buttons[i].extra_classes,
					"type": "button",
					"text": options.buttons[i].text
				})
	
			if (options.buttons[i].dismiss)
				button.attr("data-dismiss", "modal");
	
			let onclick = options.buttons[i].onclick;
			if (onclick && typeof (onclick) === "function")
				button.on("click", onclick);
	
			footer.append(button);
		}
	}

	modal.appendTo("body");
	if (hasTabs) {
		header.find("ul.nav li a").first().trigger("click");
	}
	if (show) {
		$('.modal').modal("hide");
		modal.modal();
	}
	return modal;
}

/**
 * Creates a modal using the given options and adds it to the page if valid.
 * @param {Object} options
 * @param {string} options[].id
 * @param {string} options[].header
 * @param {?Object[]} options[].tabs
 * @param {string} options[].tabs[].text
 * @param {string} options[].tabs[].id
 * @param {Node|string|Object[]} options[].tabs[].body
 * @param {?string} [options[].body]
 * @param {Object[]} options[].buttons
 * @param {string} options[].buttons[].text
 * @param {string} options[].buttons[].extra_classes
 * @param {boolean} options[].buttons[].dismiss
 * @param {?function} [options[].buttons[].onclick]
 * @param {?boolean|string} [options[].backdrop] - Changes whether or not the modal has a backdrop: false, true, or "static"
 * @param {?boolean} [options[].nonfluid]
 * @param {?boolean} [options[].centered]
 * @param {?boolean} [options[].nofooter = false]
 */
export function createTemporaryModal(options) {
	let modal = createModal(options, true);
	if (modal) {
		modal.on("hidden.bs.modal", function () {
			modal.remove();
		})
	}
}

function createChatButtonInternal(id, title, onclick, extraClasses) {
	if (extraClasses == null) extraClasses = [];
	extraClasses.push("pull-right");
	return $("<button/>").on("click", onclick).attr("id", id).attr("title", title).attr("type", "button").addClass("btn btn-default btn-chat " + extraClasses.join(" ")).tooltip({container: "body"});
}

export function createChatButton(id, title, icon, onclick, extraClasses) {
	return createChatButtonInternal(id, title, onclick, extraClasses).append( $("<i/>").addClass("fa fa-" + icon) );
}

export function createChatTextButton(id, title, text, onclick, extraClasses) {
	if (extraClasses == null) extraClasses = [];
	extraClasses.push("label");
	return createChatButtonInternal(id, title, onclick, extraClasses).text(text);
}

export function createNavBarButton(_text, id, onclick) {
	return $("<li/>").append($("<a/>").attr("id", id).attr("href", "javascript:void(0)").text(_text).on("click", onclick));
}

export function createNavBarDropdown(_text) {
	let toggle = $("<a/>")
		.addClass("dropdown-toggle")
		.attr("href", "#")
		.attr("data-toggle", "dropdown")
		.text(_text)
		.append('<b class="caret"></b>');
	return $('<li/').addClass("dropdown").append(toggle).append('<ul class="dropdown-menu"></ul>');
}

//Used for applying script stuff to old chat messages
//Incomplete, has been untouched as features have been added over time
export function repaintChat() {

	$("#messagebuffer .profile-image").remove();

	$("[class^='chat-msg-']").addClass("chat-msg").find("span:last-child").addClass("message");

	$("#messagebuffer .username").each(function () {

		//this.textContent = this.textContent.replaceAll(":", "").trim();
		let username = this.textContent.replaceAll(":", "").trim();
		//this.classList.add("clr_" + username);

		let color = stringToColor(username);

		$(this).css("color", color).off("click").on("click", function () {
			addTextToChatline(username + ": ", true);
		});

		let parent = this.parentElement;

		if (SETTINGS.chatAvatarSize !== "none") {

			let avatar = getAvatar(username);

			if (avatar.trim() !== "") {
				$("<img/>")
					.attr("src", avatar)
					.attr("title", username)
					.addClass("profile-image")
					.prependTo(parent);
			} else {
				$("<div/>")
					.addClass("text-avatar")
					.text(username.substring(0, 2).toUpperCase())
					.css("background-color", color + "7F")
					.prependTo(parent);
			}
		}
		parent.classList.add("nametitle");
	})

	$("#messagebuffer .channel-emote").each(function () {
		$(this).off("click").on("click", function (e) {
			onChatEmoteClick.call(this, e);
		});
	})
}

export function setChatlinePlaceholder() {
	document.getElementById("chatline").placeholder = (Math.floor(Math.random() * 8192) == 0 ? "You're a big guy." : "Send a message...");
}

export function onChatEmoteClick(e) {
	if (e.shiftKey) {
		toggleFavoriteEmote(this.title);
	} else {
		addTextToChatline(this.title, true);
	}
}

export function doesModalExist(id, key) {
	const el = $(id);

	if (MODALS[key]) {
		return true;
	} else {
		if (el.length > 0) {
			MODALS[key] = el;
			return true;
		}
	}
	return false;
}

export function updateAccountButton(data) {

	if (null == data) {
		data = {
			guest: CLIENT.guest,
			logged_in: CLIENT.logged_in,
			name: CLIENT.name
		}
	}

	$("ul.navbar-nav > li > a").each(function() {
		const text = this.textContent.toLowerCase();
		if (text === "home")
			this.textContent = "Other Channels";
		else if (text === "layout")
			this.parentElement.style.display = "none";
		else if (text === "account" && !data.guest && data.logged_in) {
			const userinfo = findUserlistItem(data.name);
			if (userinfo) {
				const pfp = userinfo.data().profile ? userinfo.data().profile.image || "" : "";
				this.childNodes[0].textContent = " " + data.name + " ";
				$(this).find("> a > img").remove();
				$(this).prepend($("<img/>").attr("src", pfp).attr("class", "profile-image-small"))
				this.parentElement.classList.add("account-dropdown");
			}
		}
	})
}

export function SpawnCommandModal() {

	let body = $("<div/>", {class: "panel-list"});

	//flip the alias maps
	const aliases = flipMap(ChatCommandAliases);
	const aliases_cl = flipMap(ClientCommandAliases);

	const cmds = Object.values(ChatCommands).concat(Object.values(ClientCommands));

	for (let i = 0; i < cmds.length; i++) {
		const el = $("<div/>", {class: "panel-list-item"});
		const desc = escapeHTML(cmds[i].description).replaceAll("\n", "<br>");

		el.html("<code>" + escapeHTML(cmds[i].name) + "</code>&nbsp;&nbsp;—&nbsp;&nbsp;" + desc);

		let aliasText = "";

		if (aliases[cmds[i].name])
			aliasText = "Alias" + (aliases[cmds[i].name].length > 1 ? "es" : "") + ": " + aliases[cmds[i].name].join(", ");
		else if (aliases_cl[cmds[i].name])
			aliasText = "Alias" + (aliases_cl[cmds[i].name].length > 1 ? "es" : "") + ": " + aliases_cl[cmds[i].name].join(", ");

		if (aliasText != "")
			$("<div/>", {class: "cmd-aliases text-primary small", text: aliasText, style: "padding-top: 4px;"}).appendTo(el);

		body.append(el);
	}

	return createTemporaryModal({
		id: "helpmodal",
		header: "Chat Commands",
		body: body,
		buttons: [],
		backdrop: true,
		centered: true,
		nonfluid: true,
		nofooter: true
	})
}

export function updateLayoutSettings() {
	/*const bodyClassesToRemove = 
		ChatWidthSize.map(i=>{return "chat-width-"+i})
		.concat(NavbarSize.map(i=>{return "navbar-size-"+i}))
		.concat(PageSide.map(i=>{return "chat-side-"+i}));*/
	
	const bodyClassesToRemove = ["navbar-disabled", "chat-emotes-small"];
	const reg_bodyclasses = /^(navbar-size|chat-(?:width|side|hdr|ftr))\-/i;

	const msgBufClassesToRemove = [];
	const reg_chatclasses = /^(chat-(?:size|avatars))\-/i;

	const body = document.getElementsByTagName("body")[0];
	const msgBuf = document.getElementById("messagebuffer");

	for (let i = 0; i < body.classList.length; i++) {
		if (reg_bodyclasses.test(body.classList[i])) {
			bodyClassesToRemove.push(body.classList[i]);
		}
	}

	for (let i = 0; i < msgBuf.classList.length; i++) {
		if (reg_chatclasses.test(msgBuf.classList[i])) {
			msgBufClassesToRemove.push(msgBuf.classList[i]);
		}
	}

	body.classList.remove(...bodyClassesToRemove);
	msgBuf.classList.remove(...msgBufClassesToRemove);

	if (SETTINGS.navbarHidden) {
		body.classList.add("navbar-disabled");
	}
	
	body.classList.add("navbar-size-" + SETTINGS.navbarSize);
	body.classList.add("chat-width-" + SETTINGS.chatWidthSize);
	body.classList.add("chat-side-" + SETTINGS.chatSide);
	if (SETTINGS.chatSmallEmotes)
		body.classList.add("chat-emotes-small");
	if (SETTINGS.chatHeaderSize != "normal")
		body.classList.add("chat-hdr-" + SETTINGS.chatHeaderSize);
	if (SETTINGS.chatFooterSize != "normal")
		body.classList.add("chat-ftr-" + SETTINGS.chatFooterSize);

	msgBuf.classList.add("chat-size-" + SETTINGS.chatTextSize);
	msgBuf.classList.add("chat-avatars-" + SETTINGS.chatAvatarSize);

	scrollChat();
}

export function createFormCheckboxOption(id, label, key, onchange) {
	const html = $('<div class="form-group">'+
        '<div class="col-sm-8 col-sm-offset-4">'+
        	'<div class="checkbox">'+
				'<label for="'+id+'">'+
					'<input id="'+id+'" type="checkbox">' + label +
				'</label>'+
        	'</div>'+
        '</div>'+
  	'</div>')

	const checkbox = html.find("#" + id);

	checkbox.prop("checked", SETTINGS[key]);

	checkbox.on("change", function(e) {
		onchange.call(this, e, key);
	});

	return html;
}

export function createFormSelectionOption(id, label, valid_options, key, onchange) {
	const html = $('<div class="form-group">'+
    	'<label class="control-label col-sm-4" for="'+id+'">'+label+'</label>'+
        '<div class="col-sm-8">'+
        	'<select class="form-control" id="'+id+'">'+
            '</select>'+
        '</div>'+
  	'</div>')

	const select = html.find("#" + id);

	for (let i = 0; i < valid_options.length; i++) {
		const opt = $("<option/>", {
			value: valid_options[i],
			text: valid_options[i].charAt(0).toUpperCase() + valid_options[i].substring(1),
			selected: SETTINGS[key] == valid_options[i]
		});

		select.append(opt);
	}

	select.on("change", function(e) {
		onchange.call(this, e, key);
	});

	return html;
}

export function createCheckbox(id, label, key, onchange, caption=null) {
	const html = $('<div class="checkbox"><label for="'+id+'"><input type="checkbox" id="'+id+'">'+label+'</label>'+(caption?'<div class="option-text">'+caption+'</div>':'')+'</div>');

	const checkbox = html.find("#" + id);

	checkbox.prop("checked", SETTINGS[key]);

	checkbox.on("change", function(e) {
		onchange.call(this, e, key);
	})

	return html;
}

export function wrapSelectedChatText(before, after, focus=true) {
	const chatline = $("#chatline")[0];
	const text = chatline.value;

	const selStart = chatline.selectionStart;
	const selEnd = chatline.selectionEnd;

	chatline.value = text.substring(0,selStart) + before + text.substring(selStart, selEnd) + after + text.substring(selEnd);
	if (focus) {
		chatline.focus();
		chatline.selectionStart = selEnd + before.length;
		chatline.selectionEnd = chatline.selectionStart;
	}
}