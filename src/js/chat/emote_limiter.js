//this purposefully iterates past the emote limit to blank out any excessive emote text, so it's not efficient - but it does reduce text spam

if (!window.hasOwnProperty("EMOTESPERLINE") || !window.hasOwnProperty("FXPERLINE")) {
	window["EMOTESPERLINE"] = 3;
	window["FXPERLINE"] = 9;
  }
  
  window.execEmotesEfficient = function(e){
	var c=0;
	var d=0;
	return CHANNEL.badEmotes.forEach(function(t){
	  e=e.replace(t.regex, function(match, cont) {
		if (/^(fx|ov)[A-Z0-9]/.test(t.name)) {
		  if (window["DISABLE_EMOTE_FX"]) return '';
		  return (d++>=window["FXPERLINE"] ? '' : (cont+emoteToImg(t).outerHTML))
		}
		return (c++>=window["EMOTESPERLINE"] ? '' : (cont+emoteToImg(t).outerHTML))
	  })
	}),
	e=e.replace(/[^\s]+/gi,function(e){
	  if (CHANNEL.emoteMap.hasOwnProperty(e)){
		var t=CHANNEL.emoteMap[e];
		if (/^(fx|ov)[A-Z0-9]/.test(t.name)) {
		  if (window["DISABLE_EMOTE_FX"]) return '';
		  return (d++>=window["FXPERLINE"] ? '' : emoteToImg(t).outerHTML);
		}
		return (c++>=window["EMOTESPERLINE"] ? '' : emoteToImg(t).outerHTML);
	  }
	  return e
	})
  }
  
  window.execEmotes = function(e){
	var c=0;
	var d=0;
	return (USEROPTS.no_emotes || window["EMOTESPERLINE"] === 0) ? e :
	  (CyTube.featureFlag && CyTube.featureFlag.efficientEmotes) ? execEmotesEfficient(e) :
		(CHANNEL.emotes.forEach(function(t){
		  e=e.replace(t.regex, function(match, cont) {
			if (/^(fx|ov)[A-Z0-9]/.test(t.name)) {
			  if (window["DISABLE_EMOTE_FX"]) return '';
			  return (d++>=window["FXPERLINE"] ? '' : (cont+emoteToImg(t).outerHTML))
			}
			return (c++>=window["EMOTESPERLINE"] ? '' : (cont+emoteToImg(t).outerHTML))
		  })
		}) ,e)
  }