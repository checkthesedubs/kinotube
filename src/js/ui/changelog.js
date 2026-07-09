import { compareVersionStrings } from "../utils";
import { createTemporaryModal } from "./ui";

if (compareVersionStrings(CLIENT.Nexus._last_version, CLIENT.Nexus._version) > 0) {
	window.CLIENT.Nexus._changelogSeen = false;
}

const log = $("<div/>", {
	html:
	'<div>'+
		'<b style="color: orange">0.0.30</b>'+
			'<ul>'+
				'<li>Added the changelog.</li>'+
				'<li>The chat can now be resized by dragging the side. It will snap at 350px (default size) unless CTRL is held. The Chat Width option in the Layout settings has been removed in favor of this.</li>'+
				'<li>NND has a new option to show usernames with each message, which is disabled by default.</li>'+
				'<li>Thanks to Google shutting down their Tenor search API, Tenor search has been replaced with KLIPY. Favorites and direct links to Tenor GIFs can still be posted in chat if the channel still has chat filters set up for them.</li>'+
				'<ul>'+
					'<li>Currently, valid Tenor links look like this: https://media.tenor.com/xxxxxxxxxxxxxxxx/gifname.(gif or webp)</li>'+
					'<li>If you have a link that begins with https://media1.tenor.com/m/, changing it to https://media.tenor.com/ should work.</li>'+
					'<li>While not really recommended, channel admins can optionally provide their own KLIPY key with: <code>window.api_keys = { klipy: "key" }</code></li>'+
				'</ul>'+
				'<li>Some channel settings will now be reprocessed whenever channel admins update the channel JS or CSS, including: external themes, theme overrides, navbar channel text (top left), and background image. Changes to these options should immediately take effect without requiring users to refresh the page.</li>'+
				'<li>Added a button in GIF settings to "import" favorites from older versions (pre-0.0.30) of Kinotube.</li>'+
				'<ul>'+
					'<li>This is only relevant if you add new GIFs to your favorites list in other channels that use old versions of Kinotube.</li>'+
					'<li>At some point in the future, this will be done automatically, and your old favorites list (and this button) will be removed.</li>'+
				'</ul>'+
			'</ul>'+
		'<b>0.0.29</b>'+
			'<ul>'+
				'<li>Added a "minimize" button to active polls.</li>'+
				'<li>Added an option under the General tab in Script Settings to filter profile image links based on a list of valid image hosts, which is on by default.</li>'+
					'<ul>'+
						'<li>A list of valid image hosts can be viewed from the settings menu.</li>'+
					'</ul>'+
				'<li>Fixed some small visual issues.</li>'+
				'<li>Added colored outlines to fx/overlay emotes in the regular emote list.</li>'+
				'<li>Fixed some small issues pertaining to private messages.</li>'+
				'<li>Added warning to the GIF Search menu, informing of Google\'s decision to shut down Tenor\'s search API.</li>'+
				'<li>Improved chat history handling a bit.</li>'+
			'</ul>'+
	'</div>'
})

$("<li/>", {style: "float:right;", class: (window.CLIENT.Nexus._changelogSeen ? "" : "changelogNew")}).append(
	$("<a/>", {"data-placement": "bottom", class:"navbar-icon", id:"changelogbtn", title: "Changelog", 'aria-hidden':'true', href: "javascript:void(0)"}).tooltip({container:"body"})
		.append($("<i/>", {class:"fa fa-list"}))).appendTo($(".navbar .navbar-nav"));

$("#changelogbtn").on("click", function() {
	const modal = createTemporaryModal({
		id: "changelogmodal",
		header: "Kinotube Changelog",
		body: log,
		buttons: [],
		backdrop: true,
		centered: true,
		nonfluid: false,
		nofooter: false
	});

	modal.find(".modal-footer").append('<div class="version">'+window.CLIENT.Nexus._version+'</div>');

	window.CLIENT.Nexus._changelogSeen = true;

	$(".changelogNew").removeClass("changelogNew");
});
