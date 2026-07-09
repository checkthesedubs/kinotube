import { Theme, themes } from "../classes/Theme";
import { addTabsToModal } from "./ui";

const css_element = document.createElement("style");
css_element.classList.add("custom-theme-css");
document.getElementsByTagName("head")[0].appendChild(css_element);
let external_themes = [];

const success_text = $("<p/>", { id: "theme-success-text", class: "text-success" });

const container = $("<div/>", {
	class: "theme-selection"
})

addTabsToModal("scriptsettings",
	[
		{
			text: "Themes",
			id: "opt-customthemes",
			body: container,
			body_title:"Custom Themes"
		}
	]
)

success_text.insertAfter(container);

//To create a new theme, just import the CSS and add a new Theme object here.

//This actually imports the raw CSS which gets embedded into the minified JS.
//This should probably be separated from the JS soon so it doesn't get bloated
//import latenight from "../../css/themes/theme-latenight.css?raw";
import btclassic from "../../css/themes/theme-classic.css?raw";
import btclassiclw from "../../css/themes/theme-classic-lw.css?raw";
import bthalloween from "../../css/themes/theme-classic-halloween.css?raw";
import glass from "../../css/themes/theme-glass.css?raw";
import glassdark from "../../css/themes/theme-glass-dark.css?raw";
import glasshalloween from "../../css/themes/theme-glass-halloween.css?raw";
import harakiri from "../../css/themes/theme-harakiri.css?raw";
import christmas from "../../css/themes/theme-christmas.css?raw";
//import underglow from "../../css/themes/theme-underglow.css?raw";

new Theme("custtheme_none", "CyTube", "", "", "", false);
//new Theme("custtheme_latenight", "Late Night", "", "", latenight, false);
new Theme("custtheme_billtube", "BillTube", "", "", btclassic, false);
new Theme("custtheme_billtube_lw", "BillTube Lightweight", "", "", btclassiclw, false);
new Theme("custtheme_billtube_halloween", "BillTube Halloween", "", "", bthalloween, false);
new Theme("custtheme_glass", "Glass", "", "", glass, false);
new Theme("custtheme_glass_dark", "Dark Glass", "", "", glassdark, false);
new Theme("custtheme_glass_halloween", "Dark Glass Halloween", "", "", glasshalloween, false);
new Theme("custtheme_harakiri", "Harakiri", "", "", harakiri, false);
new Theme("custtheme_christmas", "Christmas", "", "", christmas, false);
//new Theme("custtheme_underglow", "Underglow", "", "", underglow, false);


export function updateExternalThemes() {

	for (let i = 0; i < external_themes.length; i++) {
		external_themes[i].removeOption();
	}
	external_themes = [];

	if (window["ExternalThemes"]) {
		if (window.ExternalThemes instanceof Object) {
			let replaced_theme = null;
			for (let id in window.ExternalThemes) {
				if (window.ExternalThemes[id].cssLink && typeof window.ExternalThemes[id].cssLink == "string" && /^https\:\/\/.+?\.css(\?.*?)?$/.test(window.ExternalThemes[id].cssLink)) {
					external_themes.push(new Theme(id, window.ExternalThemes[id].display_name || id, window.ExternalThemes[id].author || null, window.ExternalThemes[id].display_image || null, window.ExternalThemes[id].cssLink, true));
					if (SETTINGS.theme === id) replaced_theme = id;
				} else {
					console.error("ExternalThemes: " + id + ": cssLink is missing or invalid");
				}
			}
			if (replaced_theme) {
				applyTheme(replaced_theme);
			}
		} else {
			console.error("ExternalThemes must be an Object!");
		}
	}
}

export function applyThemeOverride() {
	if (window.ThemeOverride && themes[window.ThemeOverride] && SETTINGS.lastForcedTheme != window.ThemeOverride) {
		SETTINGS.lastForcedTheme = window.ThemeOverride;
		themes[window.ThemeOverride].apply(true);
		return true;
	}
	return false;
}

updateExternalThemes();
if (!applyThemeOverride() && themes[SETTINGS.theme]) {
	themes[SETTINGS.theme].apply(true);
}

export function applyTheme(theme, save=false) {
	if (theme && themes[theme]) {
		themes[theme].apply(save);
	}
}
