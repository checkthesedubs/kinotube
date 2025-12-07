import { EventDataHook } from "../classes/EventDataHook";
import { saveall } from "../storage";
import { createCheckbox, createModal, createNavBarButton } from "./ui";

export const SettingsMenuSaveHook = new EventDataHook(false);

if (SETTINGS.hideConnectionMessages) {
	$(".server-msg-reconnect").remove();
	$(".server-msg-disconnect").remove();
}

const body = $("<div/>");

function onChange(e, key) {
	if (!e.originalEvent.isTrusted) return;
	SETTINGS[key] = this.checked;
}

function onModalSave() {
	SettingsMenuSaveHook.processListeners(null, null);
	saveall();
}

body.append(createCheckbox("opt-autoembed", "Automatically accept custom embed warnings", "autoAcceptEmbed", onChange)
	.append('<p class="text-info" style="font-size: .9em;">This will automatically accept any custom embedded content. Admins can set a trusted uploader with <code>window.OnlyAutoAcceptEmbedsFrom</code>.</p>'));

const chat_body = $("<div/>");

chat_body.append(createCheckbox("opt-hideservermsgs", "Hide all server messages", "hideServerMsgs", onChange))
		 .append(createCheckbox("opt-hideconnmsgs", "Hide connect/disconnect messages", "hideConnectionMessages", onChange))
		 .append(createCheckbox("opt-hidebotmsgs", "Hide command messages (such as !roll) and bot responses", "hideBotMessages", onChange))
		 .append(createCheckbox("opt-hideexactmsgs", "Anti-spam: hide repeated exact messages sent from the same user within "+((typeof window.ExactAntifloodCooldown == "number" ? window.ExactAntifloodCooldown : 10000)/1000)+" seconds", "chatAntifloodExact", onChange))
		 .append(createCheckbox("opt-hidesimilarmsgs", "Anti-spam: hide repeated similar messages sent from the same user within "+((typeof window.SimilarAntifloodCooldown == "number" ? window.SimilarAntifloodCooldown : 10000)/1000)+" seconds", "chatAntifloodSimilar", onChange))

chat_body.append()

MODALS["scriptSettings"] = createModal({
	id: "scriptsettings",
	header: "Script Settings",
	tabs: [
		{
			text: "General",
			id: "opt-generalsettings",
			body: body,
			body_title: "General Settings"
		},
		{
			text: "Chat",
			id: "opt-chatsettings",
			body: chat_body,
			body_title: "Chat Settings"
		}
	],
	buttons: [
		{
			text: "Save",
			dismiss: true,
			extra_classes: "btn-primary",
			onclick: onModalSave
		},
		{
			text: "Close",
			dismiss: true,
			extra_classes: "btn-default"
		}
	],
	nonfluid: 0,
	backdrop: true
});

$("#scriptsettings .modal-footer").append($("<div/>", {class: "version", text: "v" + window.CLIENT.Nexus._version}));

createNavBarButton("Script Settings", "scriptSettingsButton", (t)=>{
	t.preventDefault();
	t.stopPropagation();
	MODALS["scriptSettings"].modal();
}).appendTo($("ul.nav.navbar-nav"));

/*addTabsToModal("scriptsettings-modal",
	[
		{
			text: "Settings",
			id: "opt-customsettings",
			body: body,
			body_title: "Settings"
		}
	]
)*/