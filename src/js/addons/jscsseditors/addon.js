import { ROOM_PFX, SAVEKEY_PFX } from "../../storage";
import { SettingsMenuSaveHook } from "../../ui/settings";
import { addTabsToModal } from "../../ui/ui";

let tabs = [];

if (window.EnableCSSPlugin) {
	tabs.push(
	{
		"text": "Custom CSS",
		"id": "opt-customcss",
		"body":'<textarea autocorrect="off" class="form-control" rows="16" style="font-family: \'Anonymous Pro\', monospace;" id="customCSSText"></textarea><div class="input-group"><div class="input-group-btn"><button id="ccss-rs" class="btn btn-success ">Apply &amp; Save</button><button id="ccss-rwos" class="btn btn-warning ">Apply without Saving</button><button id="ccss-revert" class="btn btn-danger ">Revert to Last Saved CSS</button></div></div><div class="checkbox"><label for="ccss-enable"><input type="checkbox" id="ccss-enable"> Enable Custom CSS</label></div><div class="text-info">Press CTRL+SHIFT+BACKSPACE at any time to disable custom CSS.</div></div>',
		"body_title":"Custom CSS Editor"
	});
}

if (window.EnableJSPlugin) {
	tabs.push(
	{
		"text": "Custom JS",
		"id": "opt-customjs",
		"body":'<textarea autocorrect="off" class="form-control" rows="16" style="font-family: \'Anonymous Pro\', monospace;" id="customJSText"></textarea><div class="input-group"><div class="input-group-btn"><button id="cjs-rs" class="btn btn-success ">Run &amp; Save</button><button id="cjs-rwos" class="btn btn-warning ">Run without Saving</button><button id="cjs-revert" class="btn btn-danger ">Revert to Last Saved Script</button></div></div><div class="checkbox"><label for="cjs-enable"><input type="checkbox" id="cjs-enable"> Enable Custom JS</label></div><div class="text-warning">Executed code can only be undone by refreshing the page.</div></div>',
		"body_title":"Custom JS Editor"
	});
}

if (!window.EnableJSPlugin && !window.EnableCSSPlugin) {
	tabs = null;
} else {
	
window.CLIENT.Nexus.plugins.loaded["jscsseditors"] = true;

const KEY_customCSS 		= SAVEKEY_PFX + ROOM_PFX + "customCSS";
const KEY_customCSSEnabled 	= SAVEKEY_PFX + ROOM_PFX + "customCSSEnabled";
const KEY_customJS 			= SAVEKEY_PFX + ROOM_PFX + "customJS";
const KEY_customJSEnabled 	= SAVEKEY_PFX + ROOM_PFX + "customJSEnabled";

let CSS = getOrDefault(KEY_customCSS, "");
let CSSenabled = getOrDefault(KEY_customCSSEnabled, false);

let JS = getOrDefault(KEY_customJS, "");
let JSenabled = getOrDefault(KEY_customJSEnabled, false);

addTabsToModal("scriptsettings",
	tabs
);

function onTab(e) {
	if (e.key == "Tab") {

		e.preventDefault()
		e.stopPropagation();

		const start = this.selectionStart;
		const end = this.selectionEnd;
		const val = this.value;
		this.value = val.substring(0, start) + "\t" + val.substring(end);
		this.selectionStart = this.selectionEnd = start + 1;
	}
}

if (window.EnableCSSPlugin) {

	$(document).on("keydown", function (e) {

		if (e.shiftKey && e.ctrlKey && e.key === "Backspace") {
			e.preventDefault();
			disableCSS();
		}

	})

	$("#customCSSText").on("keydown", function(e) {
		onTab.call(this, e);
	});

	$("#customCSSText").val(CSS);

	$("#ccss-enable").prop("checked", CSSenabled).on("change", function() {
		CSSenabled = this.checked;
		setOpt(KEY_customCSSEnabled, this.checked);
		if (!CSSenabled) clear();
	});

	$("#ccss-revert").on("click", function() {
		CSS = getOrDefault(KEY_customCSS, "");
		$("#customCSSText").val(CSS);
		applyCSS();
	})

	$("#ccss-rwos").on("click", function() {
		applyCSS();
	})

	$("#ccss-rs").on("click", function() {
		saveCSS(); applyCSS();
	})
	
}

if (window.EnableJSPlugin) {

	$("#customJSText").on("keydown", function(e) {
		onTab.call(this, e);
	});
	
	$("#customJSText").val(JS);
	
	$("#cjs-enable").prop("checked", JSenabled).on("change", function() {
		JSenabled = this.checked;
		setOpt(KEY_customJSEnabled, this.checked);
	});
	
	$("#cjs-revert").on("click", function() {
		JS = getOrDefault(KEY_customJS, "");
		$("#customJSText").val(JS);
	})
	$("#cjs-rwos").on("click", function() {
		applyJS();
	})
	
	$("#cjs-rs").on("click", function() {
		saveJS(); applyJS();
	})

}

function save() {
	saveCSS();
	saveJS();
}

function saveCSS() {
	if (!window.EnableCSSPlugin) return;
	CSS = $("#customCSSText").val().trim() || "";

	setOpt(KEY_customCSS, CSS);
	setOpt(KEY_customCSSEnabled, CSSenabled);
}

function saveJS() {
	if (!window.EnableJSPlugin) return;
	JS  = $("#customJSText").val().trim() || "";

	setOpt(KEY_customJS, JS);
	setOpt(KEY_customJSEnabled, JSenabled);
}

function clear() {
	$(".custom-css").remove();
}

function applyCSS() {
	if (!window.EnableCSSPlugin) return;
	clear();
	CSS = $("#customCSSText").val().trim() || "";
	if (CSSenabled) {
		const style = document.createElement("style");
		style.classList.add("custom-css");
		style.innerHTML = CSS;
		document.head.appendChild(style);
	}
}

function applyJS() {
	if (!window.EnableJSPlugin) return;
	JS = $("#customJSText").val().trim() || "";
	if (JSenabled) {
		eval(JS);
	}
}

function disableCSS() {
	if (!window.EnableCSSPlugin) return;
	clear();
	const was_enabled = CSSenabled;
	CSSenabled = false;
	setOpt(KEY_customCSSEnabled, CSSenabled);
	$('#ccss-enable').prop('checked', CSSenabled);

	if (was_enabled) {
		$("<div/>").addClass("server-msg-disconnect")
			.text("Disabled custom CSS!")
			.appendTo($("#messagebuffer"));
		scrollChat();
	}
}

applyCSS();
applyJS();

/*const old_saveUserOptions = window.saveUserOptions;
window.saveUserOptions = function() {
	old_saveUserOptions();
	save();
	applyCSS();
}*/

SettingsMenuSaveHook.registerListener(function() {
	save();
	applyCSS();
})

$(window).unload(function () {
	save();
});
	
}