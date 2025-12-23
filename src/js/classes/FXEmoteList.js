import { toggleFavoriteEmote } from "../utils";
import { CustomEmoteList } from "./CustomEmoteList";
import preview_image from "../../img/cia.jpg";

export class FXEmoteList extends CustomEmoteList {
	constructor(selector, list, emoteClickCallback) {
		super(selector, list, emoteClickCallback);
	}
}

FXEmoteList.prototype.loadPage = function (page) {
	var tbody = this.table.children[0];
	tbody.innerHTML = "";

	var row;
	var start = page * this.itemsPerPage;
	if (start >= this.emotes.length) return;
	var end = Math.min(start + this.itemsPerPage, this.emotes.length);
	var _this = this;

	for (var i = start; i < end; i++) {
		if ((i - start) % this.cols === 0) {
			row = document.createElement("tr");
			tbody.appendChild(row);
		}

		(function (emote) {
			var td = document.createElement("td");
			td.className = "emote-preview-container";
			td.title = emote.name;
			td.onclick = function(e) {
				if (e.shiftKey) {
					e.preventDefault();
					e.stopPropagation();
					document.getSelection().removeAllRanges();
					toggleFavoriteEmote(emote.name);
				} else {
					_this.emoteClickCallback.call(null, emote);
				}
			}

			// Trick element to vertically align the emote within the container
			var hax = document.createElement("span");
			hax.className = "emote-preview-hax";
			td.appendChild(hax);

			var fxHax = document.createElement("span");
			fxHax.title = emote.name;
			fxHax.style.width = 0;

			var img = document.createElement("img");
			img.loading = "lazy";
			img.src = preview_image;
			img.className = "emote-preview channel-emote";

			td.appendChild(fxHax);
			td.appendChild(img);
			row.appendChild(td);
		})(this.emotes[i]);
	}

	this.page = page;
};