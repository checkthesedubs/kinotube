export const themes = {};

export class Theme {
	constructor(id, display_name, author, display_image, css, cssIsLink) {
		this.id = id;
		this.display_name = display_name;
		this.author = author;
		this.css = css;
		this.cssIsLink = cssIsLink;
		this.display_image = display_image;

		themes[this.id] = this;
	}

	apply() {
		const css_element = document.getElementsByClassName("custom-theme-css")[0];
		if (this.cssIsLink) {
			css_element.innerHTML = "@import url('"+this.css+"');"
		} else {
			css_element.innerHTML = this.css;
		}

		$(".theme-selection .theme-active").remove();
		const option_element = document.getElementsByClassName(this.id);
		if (option_element && option_element[0]) {
			$("<span/>", {
				class: "theme-active",
				text: "active"
			}).appendTo(option_element[0]);
		}
	}
}