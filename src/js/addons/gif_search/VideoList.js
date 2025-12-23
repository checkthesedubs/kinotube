import { createImageEmbed } from "./addon";
import { CustomEmoteList } from "../../classes/CustomEmoteList";

export class VideoList extends CustomEmoteList {
	constructor(selector, list, menuColumns, videoClickCallback) {
		super(selector, list, videoClickCallback);
		this._cols = menuColumns;
		this._itemsPerPage = 20;
	}
}

VideoList.prototype.initSearch = ()=>{};
VideoList.prototype.initSortOption = ()=>{};

VideoList.prototype.handleChange = function () {
	this.emotes = this.customList.slice();

	this.paginator = new NewPaginator(this.emotes.length, this.itemsPerPage,
		this.loadPage.bind(this));
	this.paginatorContainer.html("");
	this.paginatorContainer.append(this.paginator.elem);
	this.paginator.loadPage(this.page);
};

VideoList.prototype.loadPage = function (page) {
	const columns = this.elem.find(".tenor-column");
	columns.empty();
	
    var col = 0;
    var start = page * this.itemsPerPage;
    if (start >= this.emotes.length) return;
    var end = Math.min(start + this.itemsPerPage, this.emotes.length);
    var _this = this;

    for (var i = start; i < end; i++, col++) {
        if (col >= this.cols) {
            col = 0;
        }

        (function (emote) {

			$("<div/>", {
				class: "tenor-wrap"
			}).append(
				createImageEmbed(emote, "tenor-embed", false, _this.emoteClickCallback.bind(null, emote))
			).appendTo(columns.eq(col))
			
        })(this.emotes[i]);
    }

    this.page = page;
};