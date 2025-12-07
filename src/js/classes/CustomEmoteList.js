import { EmoteListOverride } from "./EmoteListOverride";

export class CustomEmoteList extends EmoteListOverride {
	constructor(selector, list, emoteClickCallback) {
		super(selector, emoteClickCallback);
		this.customList = list || [];
	}
}

CustomEmoteList.prototype.handleChange = function () {
	this.emotes = this.customList.slice();
	if (this.sortAlphabetical) {
		this.emotes.sort(function (a, b) {
			var x = a.name.toLowerCase();
			var y = b.name.toLowerCase();

			if (x < y) {
				return -1;
			} else if (x > y) {
				return 1;
			} else {
				return 0;
			}
		});
	}

	if (this.filter) {
		this.emotes = this.emotes.filter(this.filter);
	}

	this.paginator = new NewPaginator(this.emotes.length, this.itemsPerPage,
		this.loadPage.bind(this));
	this.paginatorContainer.html("");
	this.paginatorContainer.append(this.paginator.elem);
	this.paginator.loadPage(this.page);
};