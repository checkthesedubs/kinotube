import { Theme, themes } from "../classes/Theme";
import { addTabsToModal } from "./ui";

//To create a new theme, just import the CSS and add a new Theme object here.

//This actually imports the raw CSS which gets embedded into the minified JS.
//This should probably be separated from the JS soon so it doesn't get bloated
import btclassic from "../../css/theme-classic.css?raw";
import btclassiclw from "../../css/theme-classic-lw.css?raw";
import bthalloween from "../../css/theme-classic-halloween.css?raw";
import glass from "../../css/theme-glass.css?raw";
import glassdark from "../../css/theme-glass-dark.css?raw";
import glasshalloween from "../../css/theme-glass-halloween.css?raw";
import harakiri from "../../css/theme-harakiri.css?raw";

new Theme("custtheme_none", "CyTube", "", "", "", false);
new Theme("custtheme_billtube", "BillTube", "", "", btclassic, false);
new Theme("custtheme_billtube_lw", "BillTube Lightweight", "", "", btclassiclw, false);
new Theme("custtheme_billtube_halloween", "BillTube Halloween", "", "", bthalloween, false);
new Theme("custtheme_glass", "Glass", "", "", glass, false);
new Theme("custtheme_glass_dark", "Dark Glass", "", "", glassdark, false);
new Theme("custtheme_glass_halloween", "Dark Glass Halloween", "", "", glasshalloween, false);
new Theme("custtheme_harakiri", "Harakiri", "", "", harakiri, false);

const css_element = document.createElement("style");
css_element.classList.add("custom-theme-css");
document.getElementsByTagName("head")[0].appendChild(css_element);

const success_text = $("<p/>", { class: "text-success" });

function createSelection(theme) {
	const p = $("<p/>", {
		class: theme.id,
		text: theme.display_name,
		title: theme.id
	}).on("click", function() {
		this.blur();
		theme.apply();
		success_text.text("Applied " + theme.display_name + "!");
		SETTINGS.theme = theme.id;
	});

	if (theme.author && theme.author.trim() != "") {
		$("<span/>", {
			text: "— created by: " + theme.author,
			class: "theme-author"
		}).appendTo(p);
	}
	return p;
}

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

let keys = Object.keys(themes);
for (let i = 0; i < keys.length; i++) {
	container.append(createSelection(themes[keys[i]]));
	if (themes[keys[i]].id == (window.ThemeOverride || SETTINGS.theme)) {
		themes[keys[i]].apply();
	}
}
success_text.insertAfter(container);

export function applyTheme(theme) {
	if (theme && themes[theme]) {
		themes[theme].apply();
	}
}