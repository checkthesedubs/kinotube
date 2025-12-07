/*
- Niconico Chat script for cytu.be
- version 1.0387
- (still in testing, some things will NOT work as they should)
*/

const { FormatChatMsgProcHook } = require("../../overrides");
const { SettingsMenuSaveHook } = require("../../ui/settings");
const { addTabsToModal } = require("../../ui/ui");

window.CLIENT.Nexus.plugins.loaded["nnd"] = true;

let listenerID = -1;

const _defaultEnabled = true,
		_defaultFontSize = 32,
		_defaultImageHeight = 128,
		_defaultMessageGap = 4,
		_scrollDuration = 7;

let playerRect = {
	"x": 0,
	"y": 0,
	"width": 0,
	"height": 0,
	"top": 0,
	"right": 0,
	"bottom": 0,
	"left": 0
};

let playerResizeObserver = new ResizeObserver((e) => {
	playerRect = e[0].contentRect;
})

let container;

window.nnd_debug = false;

function debuglog(msg) {
	if (window.nnd_debug)
		console.debug("%c["+Date.now()+"]%o", "color: #0ff", msg);
}

const nnd = {
	'enabled':_defaultEnabled, //enabled? self-explanatory
	'MAX':125, //maximum amount of messages allowed on screen before the oldest messages are removed
	'offsetType':0, //0: position based on fontsize and player height; 1: random %
	'fromRight':true, //move messages from right? if false, moves from left instead
	'fontSize':_defaultFontSize, //font size of messages in pixels
	'imageHeight':_defaultImageHeight, //max height of images in pixels
	'displayImages':false, //show emotes/images in niconico messages
	'discardWhenFull':false,
	'ignoreRandomCollision':false,
	'opacity':70,
	'messageGap':_defaultMessageGap,
	'_reloading': false,
	'_fn': {
		'get_player_rect':()=>{
			return playerRect;
		},
		'reload_plugin':(silent)=>{
			
			if (nnd._reloading) return;
			
			nnd._reloading = true;

			container = null;
			player = null;
			
			//socket.off('chatMsg', onChatMsg);
			FormatChatMsgProcHook.unregisterListener(listenerID);
			nnd._fn.removeAll();
			$('#videochatContainer').remove();

			nnd._fn.setupCSS();
			$('.embed-responsive').prepend($('<div/>', {
				'id': 'videochatContainer'
			}));
			nnd._fn.attachPlayerObserver();
			listenerID = FormatChatMsgProcHook.registerListener(onChatMsg);
			//socket.on('chatMsg', onChatMsg);

			if (!silent) {
				console.debug('NND has been successfully reloaded');
				
				let classes = ["server-msg-reconnect", "server-msg-disconnect", "poll-notify", "greentext"];
				let cls = classes[Math.floor(Math.random() * classes.length)];
				
				$("<div/>").addClass(cls)
					.text((cls === "greentext" ? ">" : "") + "Restarted NND!")
					.appendTo($("#messagebuffer"));
				scrollChat();
			}
			
			nnd._reloading = false;
		},
		'attachPlayerObserver':()=>{
			playerResizeObserver.disconnect();
			const vcc = document.getElementById('videochatContainer');
			playerRect = vcc.getBoundingClientRect();
			playerResizeObserver.observe(vcc);
		},
		'getopts':()=>{
			var tmp = {};
			for (var i in nnd)
				if (i.charAt(0) != '_')
					tmp[i] = nnd[i];
			return tmp;
		},
		'save':()=>{
			if (!nnd.enabled) {nnd._fn.removeAll();}
			setOpt(CHANNEL.name.toLowerCase() + '_nndOptions', nnd._fn.getopts());
		},
		'load':()=>{

			var tmp = getOpt(CHANNEL.name.toLowerCase()+'_nndOptions');

			if (tmp === null || tmp === undefined) {
			
			nnd['enabled'] = _defaultEnabled;
			nnd['MAX'] = 125;
			nnd['offsetType'] = 0;
			nnd['fromRight'] = true;
			nnd['fontSize'] = _defaultFontSize;
			nnd['imageHeight'] = _defaultImageHeight;
			nnd['displayImages'] = false;
			nnd['discardWhenFull'] = false;
			nnd['ignoreRandomCollision'] = false;
			nnd['opacity'] = 70;
			nnd['messageGap'] = _defaultMessageGap;

			nnd._fn.setFontSize(_defaultFontSize, _defaultImageHeight);
			
			nnd._fn.updateModal();
			nnd._fn.save()
			
			console.debug('NND settings not found, using defaults and saving them');
			} else {
			for (var i in tmp) {
				if (nnd.hasOwnProperty(i) && i.charAt(0) != '_')
					nnd[i] = tmp[i];
			}
			nnd._fn.save();
			nnd._fn.updateModal();
			}
			
			nnd._fn.setupCSS();
		},
		'updateModal':()=>{
			$('#nnd-enable').prop('checked', nnd.enabled);
			$('#nnd-displayimages').prop('checked', nnd.displayImages);
			$('#nnd-discardwhenfull').prop('checked', nnd.discardWhenFull);
			$('#nnd-ignorerndcollision').prop('checked', nnd.ignoreRandomCollision);
			$('#nnd-opacity').val(nnd.opacity);
			$('#nnd-opacity-value').text(nnd.opacity + "%")
			$('#nnd-offsettype-' + nnd.offsetType).prop('checked', true);
			$('#nnd-fromright-' + nnd.fromRight).prop('checked', true);
			$('#nnd-maxmsgs').attr('placeholder', nnd.MAX);
			$('#nnd-maxmsgs').val(nnd.MAX)
			$('#nnd-fontsize').attr('placeholder', nnd.fontSize);
			$('#nnd-fontsize').val(nnd.fontSize);
			$('#nnd-imageheight').attr('placeholder', nnd.imageHeight);
			$('#nnd-imageheight').val(nnd.imageHeight);
			$('#nnd-msggap').attr('placeholder', nnd.messageGap);
			$('#nnd-msggap').val(nnd.messageGap);
			nnd._fn.setFontSize(nnd.fontSize, nnd.imageHeight);
		},
		'saveFromModal':()=>{
			nnd['enabled'] = $('#nnd-enable').prop('checked');
			nnd['displayImages'] = $('#nnd-displayimages').prop('checked');

			if (!nnd['enabled']) {
				nnd._fn.removeAll();
			}

			nnd['discardWhenFull'] = $('#nnd-discardwhenfull').prop('checked');
			nnd['ignoreRandomCollision'] = $('#nnd-ignorerndcollision').prop('checked');
			nnd['opacity'] = parseFloat($('#nnd-opacity').val());
			$('#nnd-opacity-value').text(nnd.opacity + "%");
			nnd._fn.setOpacity();

			if ($('#nnd-offsettype-0').prop('checked'))
			nnd['offsetType'] = 0;
			else if ($('#nnd-offsettype-1').prop('checked'))
			nnd['offsetType'] = 1;

			let oldFrom = nnd['fromRight'];
			nnd['fromRight'] = $('#nnd-fromright-true').prop('checked');
			if (nnd.fromRight !== oldFrom) {nnd._fn.removeAll();}

			nnd._fn.validateAndSetValue('MAX', $('#nnd-maxmsgs'), 1, 125);
			nnd._fn.validateAndSetValue('fontSize', $('#nnd-fontsize'), 1, _defaultFontSize);
			nnd._fn.validateAndSetValue('imageHeight', $('#nnd-imageheight'), 1, _defaultImageHeight);
			nnd._fn.validateAndSetValue('messageGap', $('#nnd-msggap'), 0, _defaultMessageGap);

			nnd._fn.setFontSize(nnd.fontSize, nnd.imageHeight);

			nnd._fn.save();
		},
		'setOpacity':()=>{
			$('.head-NNDCSS-opacity').remove();
			$('<style />', {
				'class':'head-NNDCSS-opacity',
				text:".videoText {opacity:" + (nnd.opacity/100) + ";}"
			}).appendTo('head');
		},
		'setupCSS':()=>{
			
			$('.head-NNDCSS').remove();
			$('.head-NNDCSS-opacity').remove();
			
			$('<style />', {
			'class':'head-NNDCSS',
			text:".videoText {color: white;position: absolute;z-index: 1;cursor: default;white-space:nowrap;font-family: 'Meiryo', sans-serif!important;letter-spacing: 0.063em;user-select: none;text-shadow: 0 -0.063em #000, 0.063em 0 #000, 0 0.063em #000, -0.063em 0 #000;pointer-events: none}"+
				".videoText.moving {transition: transform "+_scrollDuration+"s linear; will-change: transform}"+
				".videoText.greentext {color: #789922}"+
				".videoText.spoiler {border:0; color: black; background: black;}"+
				".videoText img, #videochatContainer .channel-emote {box-shadow: none!important; vertical-align: middle!important;display: inline-block!important;transition: none!important}"+
				".videoText.shout {color: #f00}"+
				"#videochatContainer, .videoText {z-index: 20}"+
				"#videochatContainer {width: 100%;height: 100%;position: absolute;pointer-events: none}"+
				".modal .save-warning {font-size: 13px;color: #ff8f8f}"+
				".modal .modal-caption {font-size: 13px;color: #8f9cad}"+
				"#opt-nnd .radio label {display: block;color: #c4ccd8}"+
				"#opt-nnd .modal-option {padding: 2px 5px}"+
				"#opt-nnd #nnd-maxmsgs, #opt-nnd #nnd-fontsize, #opt-nnd #nnd-imageheight, #opt-nnd #nnd-msggap {margin: 6px 0;width: 100px}"+
				".modal-subheader {font-size: 16px;border-bottom: 1px solid #212123}"+
				"#opt-nnd .subfooter {text-align: center;position: absolute;right: 0;left: 0;pointer-events: none;color: #757575;bottom: 12px;display: inline-block}"+
				"#opt-nnd .subfooter > * {border-right: 1px solid rgba(0,0,0,0.48);pointer-events: none;padding: 0px 8px;border-left: 1px solid rgba(255,255,255,0.22)}"+
				"#opt-nnd .subfooter a {pointer-events:all}"+
				"#opt-nnd .subfooter > *:first-child {border-left:0!important;} #opt-nnd .subfooter > *:last-child {border-right:0!important}"+
				"#opt-nnd .radio, #opt-nnd .modal-option > input {margin-left: 35px!important}"+
				"#opt-nnd .radio, #opt-nnd .checkbox, #opt-nnd .modal-option > input {margin-top: 4px!important;margin-bottom: 4px!important}"+
				"#opt-nnd .ver {font-size: 12px;opacity:.5;margin-left:5px}"+
				"#nnd-opacity-value {color: #8f9cad}"+
				".modal .modal-group {display: inline-block; margin-left: 35px;padding: 0 6px;border-radius: 4px;background: rgba(143, 156, 173, 0.15)}"+
				".modal .modal-group > * {display: inline-block;text-indent: 0!important}"+
				".modal .modal-group > input {margin-left: 4px !important}"+
				".modal-option-group {display:flex;flex-wrap:wrap}"+
				".modal-option-group > .modal-option {width:50%}"+
				".modal-option-group .modal-caption {padding-right:5%}"
			}).appendTo('head');
			
			nnd._fn.setOpacity();
			
			console.debug('NND Chat: CSS added to page header');
		},
		'placeMessage':(frm, el)=>{
			
			debuglog("NND debug: placeMessage called");

			if (!container) {
				debuglog("NND debug: placeMessage: no container?");
				return;
			}

			if (nnd.fontSize <= 0) nnd.fontSize = _defaultFontSize;

			let maxLane = (Math.floor((playerRect.height+nnd.messageGap) / (nnd.fontSize+nnd.messageGap))) - 1,
				lane = 0;

			if (maxLane <= -1) {
				console.error("NND: tried to add a message, but maxLane <= -1!");
				return;
			}

			container.appendChild(el);
			
			let thisRect = el.getBoundingClientRect();

			el.dataset.clwidth = thisRect.width;

			el.addEventListener("transitionend", function() {
				debuglog("NND debug: text triggered transitionend, cleaning up");
				this.remove();
				if (nnd._msgCount > 0)
					nnd._msgCount--;
			}, {once: true});

			if (nnd._msgCount <= 0) {

				if (nnd.offsetType === 0) {
					lane = Math.floor(Math.random() * (maxLane + 1));
				}

			} else {

				let msgs = [];

				if (nnd.offsetType === 0) {//RANDOM

					let openLanes = [];

					for (;lane <= maxLane; lane++) {
						msgs = document.getElementsByClassName("nn-lane-" + lane);

						if (msgs.length <= 0 || nnd.ignoreRandomCollision || !nnd._fn.willCollide(thisRect.width, msgs[msgs.length-1], frm)) {
							openLanes.push(lane);
							continue;
						}
					}

					if (openLanes.length <= 0) {
						if (nnd.discardWhenFull) {
							debuglog("NND debug: openLanes <= 0, discarding new message");
							el.remove();
							return;
						}
						lane = Math.floor(Math.random() * (maxLane + 1));
					} else {
						lane = openLanes[Math.floor(Math.random() * openLanes.length)];
					}

				} else {//ORDERED

					let furthestLane = 0,
					furthestLaneGap = 0,
					allFull = false;

					for (;lane <= maxLane; lane++) {
						msgs = document.getElementsByClassName("nn-lane-" + lane);
						if (msgs.length <= 0) break;
						else {

							let offset = frm === 'right' ? playerRect.right - msgs[msgs.length-1].getBoundingClientRect().right
														: playerRect.left  - msgs[msgs.length-1].getBoundingClientRect().left;

							if (!nnd._fn.willCollide(thisRect.width, msgs[msgs.length-1], frm)) break;

							if (furthestLaneGap >= 0 || offset > furthestLaneGap) {
								furthestLane = lane;
								furthestLaneGap = offset;
							}
							if (lane === maxLane) allFull = true;
						}
					}

					if (allFull) {
						if (nnd.discardWhenFull) {
							debuglog("NND debug: allFull, discarding new message");
							el.remove();
							return;
						}
						lane = furthestLane;
					}
				}
			}

			nnd._msgCount++;

			debuglog("NND debug: placeMessage almost finished");

			let _el = $(el);
			_el.css('top', ((nnd.fontSize * lane) + (nnd.messageGap * lane)) + 'px');
			_el.css(frm, -thisRect.width);
			_el.addClass('nn-lane-' + lane);
			_el.css("transform", "translate3d(0,0,0)");

			if (window.nnd_debug) {
				debuglog("NND debug: placeMessage has created a text element, about to move it now");
				debuglog(_el);
			}

			_el.addClass('moving');
			_el.css('visibility', 'visible');
			_el.css("transform", "translate3d(" + (frm==='right'?-playerRect.width-thisRect.width:playerRect.width+thisRect.width) + "px, 0, 0)");

			if (window.nnd_debug) {
				debuglog("NND debug: placeMessage has reached the end");
				debuglog(_el);
			}
		},
		'addScrollingMessage':(message, extraClass)=>{

			debuglog("NND debug: addScrollingMessage called");

			if (!container) {
				debuglog("NND debug: addScrollingMessage: container not set, retrying");
				container = document.getElementById("videochatContainer");
			}

			if (!container || playerRect.width <= 0 || playerRect.height <= 0) {
				debuglog("NND debug: addScrollingMessage: no container, or player is too small!");
				return;
			}

			if (nnd.MAX < 1 || isNaN(parseInt(nnd.MAX))) nnd.MAX = 125;
			if (nnd._msgCount >= nnd.MAX && nnd.MAX >= 1) {
				debuglog("NND debug: addScrollingMessage: too many messages, not adding new ones");
				return;
			}
			if (nnd.offsetType < 0 || nnd.offsetType > 1) {
				console.error('NNDchat: Unknown offsetType '+nnd.offsetType+', reverting to 0');
				nnd.offsetType = 0;
			}
			if (nnd.enabled && document.visibilityState === "visible") {
				if (message !== null && typeof message === "string" && message.length > 0 && !(/^(?:\<.+?\>)?[\uD83E\uDD16\$\!]/.test(message))) {
					
					debuglog("NND debug: addScrollingMessage: beginning to pass off to placeMessage");

					var frm = 'right';
					if (!nnd.fromRight) frm = 'left';

					let txt = document.createElement("div");
					txt.classList.add('videoText');
					if (extraClass && extraClass.length > 0)
					txt.classList.add(extraClass);
					txt.style.visibility = "hidden";
					txt.innerHTML = message;

					$(txt).find("a").remove();

					var imgs = txt.getElementsByTagName("img"),
					loadedImgs = 0;

					for (var i = imgs.length - 1; i >= 0; --i) {
						if (!nnd.displayImages)
							imgs[i].remove();
						else {
							imgs[i].onload = function() {
								loadedImgs++;
								if (loadedImgs >= imgs.length) nnd._fn.placeMessage(frm, txt);
							}
						}
					}
					if (txt.innerHTML.trim() === "") return;

					if (imgs.length <= 0) {
						nnd._fn.placeMessage(frm, txt);
					}

				}
			}
		},
		'willCollide':(nWidth, targetMsg, from)=>{

			let tWidth = targetMsg.dataset.clwidth;
			let playerWidth = playerRect.width;
			let rect_target = targetMsg.getBoundingClientRect();
			let targetOffset = from === 'right' ? playerRect.right - rect_target.right : rect_target.left - playerRect.left;

			//console.log("nWidth: " + nWidth + " // tWidth: " + tWidth + " // playerWidth: " + playerWidth + " // targetOffset: " + targetOffset);
			if (nWidth <= tWidth) return targetOffset < 0;
			let delta = (playerWidth - targetOffset) / nnd._fn.getSpeed(tWidth, playerWidth);
			//console.log("delta: " + delta);
			return (delta * nnd._fn.getSpeed(nWidth, playerWidth)) >= playerWidth;
		},
		'getSpeed':(elWidth, playerWidth)=>{
			return (playerWidth + elWidth) / _scrollDuration;
		},
		'validateAndSetValue':(valName, modalEl, min, _default)=>{
			if (!nnd.hasOwnProperty(valName)) {console.error("NND: tried to validate invalid property " + valName); return;}
			var value = parseFloat(modalEl.val());

			if (!isNaN(value) && value >= min) {
				nnd[valName] = value;
			} else {
				if (nnd[valName] < min) nnd[valName] = _default;
			}
			modalEl.attr('placeholder', nnd[valName]);
			modalEl.val(nnd[valName]);
		},
		'setFontSize':(fontsize, imageheight)=>{
			$('.head-NNDCSS-fontsize').remove();
			$('<style />', {
				'class':'head-NNDCSS-fontsize',
				text:".videoText img, #videochatContainer .channel-emote {max-height: "+imageheight+"px!important;max-width: "+(imageheight*2)+"px!important;}"+
				".videoText {font-size: "+fontsize+"px; line-height: "+fontsize+"px;}"
			}).appendTo('head');
		},
		'removeAll':()=>{
			debuglog("NND debug: removeAll called");
			$('.videoText').remove();
			nnd._msgCount = 0;
		}
	},
	'_msgCount': 0,
	'_ver':'1.0387'
};

//ignore messages sent by [server], [voteskip] and anything within CHANNEL.bots if defined
//formatChatMessage tweak: added the message parameter. if reverting to chatMsg, make sure to remove it
let onChatMsg = function(message, data) {
	if (!nnd.enabled) return;
	if (nnd._reloading) return;
	if (data.username.charAt(0) == '[') return;
	if (IGNORED.indexOf(data.username) > -1) return;
	if (window.LAST_CONNECT_TIME - 1000 > data.time) return;
	
	if (((data.meta && !data.meta.action) || !data.meta) &&
		(!CHANNEL.hasOwnProperty("bots") || (Array.isArray(CHANNEL.bots) && !~CHANNEL.bots.indexOf(data.username)))) {
		if (!data.meta['addClass'])
			data.meta['addClass'] = '';
		nnd._fn.addScrollingMessage(data.msg, data.meta.addClass);
	}
};

addTabsToModal("scriptsettings", [
	{
		text: "NND",
		id: "opt-nnd",
		body: '<div class=save-warning>Settings are not applied until you click Save.</div><div class=modal-option-group><div class=modal-option><div class=checkbox><label for=nnd-enable><input id=nnd-enable type=checkbox> Enable Niconico Chat</label><div class=modal-caption>Enable Niconico-style chat messages. Places chat messages on the currently playing video and scrolls them to the opposite side.</div></div></div><div class=modal-option><div class=checkbox><label for=nnd-displayimages><input id=nnd-displayimages type=checkbox> Display Images and Emotes</label><div class=modal-caption>Show images in Niconico messages.</div></div></div><div class="modal-option"><div class="checkbox"><label for="nnd-discardwhenfull"><input id="nnd-discardwhenfull" type="checkbox"> Discard New Messages When Full</label><div class="modal-caption">If checked, new messages will be ignored and discarded if they cannot fit without overlapping. Otherwise, when there\'s no room, it will be placed on a random line regardless of overlaps.</div></div></div><div class="modal-option"><div class="checkbox"><label for="nnd-ignorerndcollision"><input type="checkbox" id="nnd-ignorerndcollision"> Ignore Message Overlap (Random order only)</label><div class="modal-caption">If checked, overlap prediction will not be performed when the message order is set to Random. Messages might be a bit messy, but this may help improve performance. \"Discard New Messages When Full\" will have no effect while this is enabled.</div></div></div><div class="modal-option"><div class="slider"><label for="nnd-opacity"> Opacity <span id="nnd-opacity-value">70%</span><input id="nnd-opacity" min="0" max="100" type="range"></label><div class="modal-caption">Controls transparency of messages. Default 70%.</div></div></div></div><div class=modal-option-group><div class=modal-option><div class=modal-subheader> Message Order</div><div class=modal-caption>Determines the order in which new messages are placed, as long as there is enough room.</div><div class=radio><label for=nnd-offsettype-0><input id=nnd-offsettype-0 type=radio name=offsettype> Random </label><label for=nnd-offsettype-1><input id=nnd-offsettype-1 type=radio name=offsettype> Top to Bottom </label></div></div><div class=modal-option><div class=modal-subheader>Message Direction</div><div class=modal-caption>Determines where new messages will start and end.</div><div class=radio><label for=nnd-fromright-true><input id=nnd-fromright-true type=radio name=fromright> from Right to Left</label><label for=nnd-fromright-false><input id=nnd-fromright-false type=radio name=fromright> from Left to Right</label></div></div></div><div class=modal-option><div class=modal-subheader>Maximum Messages</div><div class=modal-caption>Maximum amount of messages allowed on screen at once. New messages will be ignored if this many are on screen. A large amount of messages may cause lag. Default 125.</div><input id=nnd-maxmsgs type=text class=form-control placeholder=125></div><div class="modal-option"><div class="modal-subheader">Message Size</div><div class="modal-caption">Sizes of all text and images in Niconico messages. Max image width is always twice the max image height. If you want to avoid vertical image overlap, make sure Max Image Height is the same as or less than Font Size.</div><div class="modal-group"><div class="modal-caption">Font Size (px, default '+_defaultFontSize+') </div><input id="nnd-fontsize" type="text" class="form-control" placeholder="'+_defaultFontSize+'"></div><div class="modal-group"><div class="modal-caption">Max Image Height (px, default '+_defaultImageHeight+')</div><input id="nnd-imageheight" type="text" class="form-control" placeholder="'+_defaultImageHeight+'"></div><div class="modal-group"><div class="modal-caption">Vertical Message Gap (px, default '+_defaultMessageGap+')</div><input id="nnd-msggap" type="text" class="form-control" placeholder="'+_defaultMessageGap+'"></div><div style="text-align:right;"><button id="btn-reload-nnd" class="btn btn-info" type="button">Reload Plugin</button></div></div>',
		body_title: "Niconico Chat Settings"
	}
]);

$("#btn-reload-nnd").on("click", ()=>{nnd._fn.reload_plugin(false);})
$("#opt-nnd > h4").eq(0).append('<span class="ver">v'+nnd._ver+'</span>');

//load the user's options then update the modal element
nnd._fn.load();
nnd._fn.updateModal();

$('#nnd-opacity').on("change", function(e) {
	$('#nnd-opacity-value').text(e.target.value + "%")
})

//create #videochatContainer which is basically an invisible container element. this holds the chat messages that will be scrolling by
$('.embed-responsive').prepend($('<div/>', {
	'id': 'videochatContainer'
}));

nnd._fn.attachPlayerObserver();

//attach addScrollingMessage to the chatMsg socket event
//socket.on('chatMsg', onChatMsg);

//attach to formatChatMessage instead, so client-side throttling can work
listenerID = FormatChatMsgProcHook.registerListener(onChatMsg);

//save user's settings on page unload so they are persistent
$(window).unload(function() {nnd._fn.save()});

$(document).on("visibilitychange", function() {
	if (document.visibilityState !== "visible") {
		nnd._fn.removeAll();
	}
});

setTimeout(function() {
	let staleMessages = $('.videoText');
	if (staleMessages.length > 0) {
	setTimeout(function() {
		staleMessages.each(function(i,e) {e.remove(); if (nnd._msgCount > 0) nnd._msgCount--;});
	}, 7500);
	}
}, 2500);

SettingsMenuSaveHook.registerListener(nnd._fn.saveFromModal);

console.log('LOADED: Niconico chat script for cytu.be. Version '+nnd._ver);