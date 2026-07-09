import { clamp } from "./utils";

let last_gif_request = 0;

function getExternalKey(service, defaultKey) {
	if (!window.api_keys) return defaultKey;

	if (!window.api_keys[service]) return defaultKey;

	if (typeof window.api_keys[service] === "string" && window.api_keys[service].trim() != "") {
		return window.api_keys[service];
	}

	return defaultKey;
}

export function apiCall_gifsearch(in_data, callback) {

	if (typeof(callback) != "function") return false;

	if (Date.now() - last_gif_request < 3000) {
		callback(false, {
			reason: "cooldown",
			remaining_time: Date.now() - last_gif_request
		});
		return false;
	}

	if (!in_data.term || in_data.term.trim() == "") { callback(false, null); return false; }

	in_data.limit = clamp(parseInt(in_data.limit) || 20, 1, 50);

	last_gif_request = Date.now();

	// can change the key in your channel with:
	//		window.api_keys = { klipy: "key" }
	// NOT recommended though if you care about people easily taking your key
	const key = getExternalKey("klipy", "7c2PLH7KG2Sc5rbyaVFPOSKyeRwQqYhabVAJanjZGdyAUDyJWE0Vl9oQICftxS8A");

	$.ajax({
		url: "https://api.klipy.com/api/v1/" + key + "/gifs/search?q=" + encodeURIComponent(in_data.term) + "&content_filter=off&format_filter=webp&per_page=" + in_data.limit,
		dataType: 'json',
		success: function(data) {
			if (data && data.result) {
				callback(true, data);
			}
		},
		error: function(data) {
			callback(false, data);
		}
	});

	return true;
}
