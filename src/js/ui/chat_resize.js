import { clamp } from "../utils";

const snap_threshold = 16;
const normal_size = 350;
let last_x_pos = -1;

const mouse_pos_tooltip = $("<div/>", { id: "chatwidth", class: "basic_tooltip" });
mouse_pos_tooltip.hide();

$("#chatwrap").append($("<div/>", {id: "chat-resize-handle"}))
$("body").append(mouse_pos_tooltip);

export function resizeChat(width) {
  const screenwidth = $("#wrap").width();
  width = clamp(width, 250, screenwidth);
  $("#chatwrap").width(width + "px");
  $("#mainpage .container-fluid")[0].style.width = 'calc(100vw - ' + width + 'px)';
  SETTINGS.chatWidthPxSize = width;
  return width;
}

function on_chat_resize_mouse_move(e) {
  let clientX = 0, clientY = 0;
  if (e.originalEvent.touches && e.originalEvent.touches.length > 0) {
    clientX = e.originalEvent.touches[0].clientX;
    clientY = e.originalEvent.touches[0].clientY;
  } else {
    clientX = e.clientX;
    clientY = e.clientY;
  }
  mouse_pos_tooltip.css("left", clientX + 8 + "px");
  mouse_pos_tooltip.css("top", clientY + "px");
  if (clientX === last_x_pos) return;
  last_x_pos = clientX;
  const screenwidth = $("#wrap").width();
  let width = SETTINGS.chatSide === "left" ? clientX : screenwidth - clientX;
  if (!e.ctrlKey)
    if (width >= normal_size - snap_threshold && width <= normal_size + snap_threshold) width = normal_size;
  width = resizeChat(width);
  mouse_pos_tooltip.text(width + "px");
}

function handle_mouseup(e) {
  $("#videowrap").css("pointer-events", "auto");
  mouse_pos_tooltip.hide();
  $(window).off("mousemove", on_chat_resize_mouse_move);
  $(window).off("touchmove", on_chat_resize_mouse_move);
  $(window).off("blur", handle_mouseup)
  $(window).off("mouseup", handle_mouseup)
  $(window).off("touchend", handle_mouseup)
}

function handle_mousedown(e) {
  e.stopPropagation();
  e.preventDefault();
  handle_mouseup();

  if (e.originalEvent.touches && e.originalEvent.touches.length > 0) {
    mouse_pos_tooltip.css("left", e.originalEvent.touches[0].clientX + 8 + "px");
    mouse_pos_tooltip.css("top", e.originalEvent.touches[0].clientY + "px");
  } else {
    mouse_pos_tooltip.css("left", e.clientX + 8 + "px");
    mouse_pos_tooltip.css("top", e.clientY + "px");
  }
  mouse_pos_tooltip.text($("#chatwrap").width() + "px");
  mouse_pos_tooltip.show();

  $("#videowrap").css("pointer-events", "none");
  $(window).on("mousemove", on_chat_resize_mouse_move);
  $(window).on("touchmove", on_chat_resize_mouse_move);
  $(window).on("blur", handle_mouseup)
  $(window).on("mouseup", handle_mouseup)
  $(window).on("touchend", handle_mouseup)
}

$("#chat-resize-handle").on("mousedown", handle_mousedown);
$("#chat-resize-handle").on("touchstart", handle_mousedown);

resizeChat(SETTINGS.chatWidthPxSize);
