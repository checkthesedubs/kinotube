//Adds a button that turns the default plaintext MOTD editor into a WYSIWYG one.
//Only those who have permission to edit the MOTD will see this button, and doing it this way cuts down on script size since this is almost never used.
//loadEditor can also be put into an external script as well to save even more space...

let loaded = false;

function parse() {
	const text = $("#cs-motdrt").text();
	if (window.confirm("The \"Parse HTML\" button should only be used if the ENTIRETY of the MOTD contents have not been parsed yet (for example, after copy/pasting HTML). This might break all of your formatting - and it will if not used properly.\n\nContinue?")) {
		$("#cs-motdrt").html(text);
	}
}

function loadEditor() {
	if (loaded) return;
	loaded = true;
	$.getScript("https://cdn.jsdelivr.net/npm/bootstrap-wysiwyg@2.0.1/js/bootstrap-wysiwyg.min.js", function() {
		$("#cs-motdsubmit").off("click");
		$("#cs-motdtext").remove();
		$(".wysiwyg-css").remove();
		$("<link/>", {href: "https://cdn.jsdelivr.net/npm/bootstrap-wysiwyg@2.0.1/css/style.min.css", rel: "stylesheet", class: "wysiwyg-css"}).appendTo("head");
		$('<div id="motd-toolbar" class="btn-toolbar" data-role="editor-toolbar" data-target="#cs-motdrt">'+
			'<div class="btn-group">'+
				'<a class="btn dropdown-toggle" data-toggle="dropdown" title="Font"><i class="fa fa-font"></i><b class="caret"></b></a>'+
				'<ul class="dropdown-menu">'+
				'<li><a data-edit="fontName Serif" style="font-family:\'Serif\'">Serif</a></li><li><a data-edit="fontName Sans" style="font-family:\'Sans\'">Sans</a></li><li><a data-edit="fontName Arial" style="font-family:\'Arial\'">Arial</a></li><li><a data-edit="fontName Arial Black" style="font-family:\'Arial Black\'">Arial Black</a></li><li><a data-edit="fontName Courier" style="font-family:\'Courier\'">Courier</a></li><li><a data-edit="fontName Courier New" style="font-family:\'Courier New\'">Courier New</a></li><li><a data-edit="fontName Comic Sans MS" style="font-family:\'Comic Sans MS\'">Comic Sans MS</a></li><li><a data-edit="fontName Helvetica" style="font-family:\'Helvetica\'">Helvetica</a></li><li><a data-edit="fontName Impact" style="font-family:\'Impact\'">Impact</a></li><li><a data-edit="fontName Lucida Grande" style="font-family:\'Lucida Grande\'">Lucida Grande</a></li><li><a data-edit="fontName Lucida Sans" style="font-family:\'Lucida Sans\'">Lucida Sans</a></li><li><a data-edit="fontName Tahoma" style="font-family:\'Tahoma\'">Tahoma</a></li><li><a data-edit="fontName Times" style="font-family:\'Times\'">Times</a></li><li><a data-edit="fontName Times New Roman" style="font-family:\'Times New Roman\'">Times New Roman</a></li><li><a data-edit="fontName Verdana" style="font-family:\'Verdana\'">Verdana</a></li></ul>'+
				'</div>'+
			'<div class="btn-group">'+
				'<a class="btn dropdown-toggle" data-toggle="dropdown" title="Font Size" aria-expanded="false"><i class="fa fa-text-height"></i>&nbsp;<b class="caret"></b></a>'+
				'<ul class="dropdown-menu">'+
				'<li><a data-edit="fontSize 5"><font size="5">Huge</font></a></li>'+
				'<li><a data-edit="fontSize 3"><font size="3">Normal</font></a></li>'+
				'<li><a data-edit="fontSize 1"><font size="1">Small</font></a></li>'+
				'</ul>'+
			'</div>'+
			'<div class="btn-group">'+
				'<a class="btn" data-edit="bold" title="Bold (Ctrl/Cmd+B)"><i class="fa fa-bold"></i></a>'+
				'<a class="btn" data-edit="italic" title="Italic (Ctrl/Cmd+I)"><i class="fa fa-italic"></i></a>'+
				'<a class="btn" data-edit="strikethrough" title="Strikethrough"><i class="fa fa-strikethrough"></i></a>'+
				'<a class="btn" data-edit="underline" title="Underline (Ctrl/Cmd+U)"><i class="fa fa-underline"></i></a>'+
			'</div>'+
			'<div class="btn-group">'+
				'<a class="btn" data-edit="insertunorderedlist" title="Bullet list"><i class="fa fa-list-ul"></i></a>'+
				'<a class="btn" data-edit="insertorderedlist" title="Number list"><i class="fa fa-list-ol"></i></a>'+
				'<a class="btn" data-edit="outdent" title="Reduce indent (Shift+Tab)"><i class="fa fa-outdent"></i></a>'+
				'<a class="btn" data-edit="indent" title="Indent (Tab)"><i class="fa fa-indent"></i></a>'+
			'</div>'+
			'<div class="btn-group">'+
				'<a class="btn btn-info" data-edit="justifyleft" title="Align Left (Ctrl/Cmd+L)"><i class="fa fa-align-left"></i></a>'+
				'<a class="btn" data-edit="justifycenter" title="Center (Ctrl/Cmd+E)"><i class="fa fa-align-center"></i></a>'+
				'<a class="btn" data-edit="justifyright" title="Align Right (Ctrl/Cmd+R)"><i class="fa fa-align-right"></i></a>'+
				'<a class="btn" data-edit="justifyfull" title="Justify (Ctrl/Cmd+J)"><i class="fa fa-align-justify"></i></a>'+
			'</div>'+
			'<div class="btn-group">'+
				'<a class="btn dropdown-toggle" data-toggle="dropdown" title="Hyperlink"><i class="fa fa-link"></i></a>'+
					'<div class="dropdown-menu input-append">'+
						'<input class="span2" placeholder="URL" type="text" data-edit="createLink">'+
						'<button class="btn" type="button">Add</button>'+
				'</div>'+
				'<a class="btn" data-edit="unlink" title="Remove Hyperlink"><i class="fa fa-cut"></i></a>'+

			'</div>'+
			
			'<div class="btn-group">'+
				'<a class="btn" id="pictureBtn" title="Insert picture (or just drag &amp; drop)"><i class="fa fa-file-image-o"></i></a>'+
				'<input type="file" data-role="magic-overlay" data-target="#pictureBtn" data-edit="insertImage" style="opacity: 0; position: absolute; top: 0px; left: 0px; width: 39px; height: 30px;">'+
			'</div>'+
			'<div class="btn-group">'+
				'<a class="btn" data-edit="undo" title="Undo (Ctrl/Cmd+Z)"><i class="fa fa-undo"></i></a>'+
				'<a class="btn" data-edit="redo" title="Redo (Ctrl/Cmd+Y)"><i class="fa fa-repeat"></i></a>'+
			'</div>'+
			
		'</div>').insertBefore($("#cs-motdsubmit").eq(0))
		$("<div/>", {id: "cs-motdrt"}).css("overflow", "scroll").css("height", "300px").insertBefore("#cs-motdsubmit");
		$("#cs-motdrt").wysiwyg();
		$("#cs-motdrt").off("keydown").html(CHANNEL.motd).on("keydown", function(e) {
			if ($(this).attr("contenteditable") && $(this).is(":visible")) {

				let action = "";

				if (e.ctrlKey) {
					switch (e.key) {
						case "b":
							action = "bold"; break;
						case "i":
							action = "italic"; break;
						case "u":
							action = "underline"; break;
						case "s":
							action = "strikethrough"; break;
						case "z":
							action = "undo"; break;
						case "y":
							action = "redo"; break;
						case "l":
							action = "justifyleft"; break;
						case "r":
							action = "justifyright"; break;
						case "e":
							action = "justifycenter"; break;
						case "j":
							action = "justifyfull"; break;
						default: break;
					}
				} else if (e.shiftKey) {
					if (e.key == "Tab") {
						action = "outdent";
					}
				} else {
					if (e.key == "Tab") {
						action = "indent";
					}
				}

				if (action != "") {
					e.preventDefault();
					e.stopPropagation();
					document.execCommand(action);
				}
			}
		})
		$("#cs-motdsubmit").on("click", function() {
			socket.emit("setMotd", {
				//Replace strike with s. CyTube seems to filter strike tags
				motd: $("#cs-motdrt").html().replace(/\<strike\>(.*?)\<\/strike\>/g, "<s>$1</s>")
			});
		})
		$("<button/>", {text: "Parse HTML", class: "btn btn-warning", style: "margin-top: 10px;"}).on("click", function() {
			parse();
		}).insertBefore("#cs-motdsubmit");
		$("<button/>", {text: "Clear", class: "btn btn-danger", style: "margin-top: 10px;"}).on("click", function() {
			$("#cs-motdrt").html("");
		}).insertBefore("#cs-motdsubmit");
	})
}


$("<button/>", {text: "Load HTML Editor", class: "btn btn-primary", style: "margin-top: 10px;"}).on("click", function() {
	$(this).remove();
	loadEditor();
}).insertBefore("#cs-motdsubmit");