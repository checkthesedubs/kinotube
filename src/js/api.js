import { clamp } from "./utils";
//This was meant to house a system for various API calls, but for now, Tenor is the only one used

let last_tenor_request = 0;

export function apiCall_tenor(in_data, callback) {

	if (typeof(callback) != "function") return false;
  
	if (Date.now() - last_tenor_request < 1000) {
	  callback(false, {
		reason: "cooldown",
		remaining_time: Date.now() - last_tenor_request
	  });
	  return false;
	}
  
	if (!in_data.term || in_data.term.trim() == "") { callback(false, null); return false; }
  
	in_data.limit = clamp(parseInt(in_data.limit) || 20, 1, 50);

	last_tenor_request = Date.now();
  
	$.ajax({
	  url: "https://tenor.googleapis.com/v2/search?q=" + encodeURIComponent(in_data.term) + "&key=AIzaSyDZ1mbhNHFGLlnsv4SqWcy3ecX1LMl3CBM&contentfilter=off&media_filter=tinywebp&limit=" + in_data.limit,
	  dataType: 'json',
	  success: function(data) {
		if (data && data.results) {
		  callback(true, data);
		}
	  },
	  error: function(data) {
		callback(false, data);
	  }
	});
  
	return true;
  }