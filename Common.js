//
// Common.js is distributed under the FreeBSD License
//
// Copyright (c) 2012, Carlos Rafael Gimenes das Neves
// All rights reserved.
//
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are met: 
//
// 1. Redistributions of source code must retain the above copyright notice, this
//    list of conditions and the following disclaimer. 
// 2. Redistributions in binary form must reproduce the above copyright notice,
//    this list of conditions and the following disclaimer in the documentation
//    and/or other materials provided with the distribution. 
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
// ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
// WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
// DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
// ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
// (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
// LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
// ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
// (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
// SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
// The views and conclusions contained in the software and documentation are those
// of the authors and should not be interpreted as representing official policies, 
// either expressed or implied, of the FreeBSD Project.
//
// https://github.com/carlosrafaelgn/GraphicalFilterEditor/blob/master/Common.js
//
"use strict";

//Miscellaneous functions
var _isTouch = (("ontouchend" in document) ? true : false);
function seal$(x) {
	if (Object.seal) Object.seal(x);
	return x;
}
function freeze$(x) {
	if (Object.freeze) Object.freeze(x);
	return x;
}
function $(e) {
	if (typeof (e) === "string")
		return document.getElementById(e);
	return e;
}
function cancelEvent(e) {
	if (e.stopPropagation)
		e.stopPropagation();
	if (e.preventDefault)
		e.preventDefault();
	if (e.cancelBubble !== undefined)
		e.cancelBubble = true;
	if (e.cancel !== undefined)
		e.cancel = true;
	if (e.returnValue !== undefined)
		e.returnValue = false;
	return false;
}
function leftTop(element) {
	var left = 0, top = 0;
	while (element) {
		left += element.offsetLeft;
		top += element.offsetTop;
		element = element.offsetParent;
	}
	return [left, top];
}
var touchMouse = (_isTouch ? {
	_touchstartc: function (e) {
		return touchMouse.touchstart(this, "_tc", e);
	},
	_touchstart: function (e) {
		return touchMouse.touchstart(this, "_t", e);
	},
	touchstart: function (t, p, e) {
		if (e.touches.length > 1) return;
		if (!t._tstate) {
			t._tstate = true;
			e.button = 0;
			e.clientX = e.changedTouches[0].clientX;
			e.clientY = e.changedTouches[0].clientY;
			var i, l;
			l = t[p + "mouseover"];
			if (l) {
				for (i = l.length - 1; i >= 0; i--)
					l[i](e);
			}
			l = t[p + "mousedown"];
			if (l) {
				for (i = l.length - 1; i >= 0; i--)
					l[i](e);
			}
		}
	},
	_touchmovec: function (e) {
		return touchMouse.touchmove(this, "_tc", e);
	},
	_touchmove: function (e) {
		return touchMouse.touchmove(this, "_t", e);
	},
	touchmove: function (t, p, e) {
		if (e.touches.length > 1) return;
		if (!t._tstate) {
			t._tstate = true;
			e.button = 0;
			e.clientX = e.changedTouches[0].clientX;
			e.clientY = e.changedTouches[0].clientY;
			var i, l;
			l = t[p + "mousemove"];
			if (l) {
				for (i = l.length - 1; i >= 0; i--)
					l[i](e);
			}
		}
	},
	_touchendc: function (e) {
		return touchMouse.touchend(this, "_tc", e);
	},
	_touchend: function (e) {
		return touchMouse.touchend(this, "_t", e);
	},
	touchend: function (t, p, e) {
		if (t._tstate) {
			e.preventDefault();
			t._tstate = false;
			e.button = 0;
			if (e.changedTouches && e.changedTouches.length >= 1) {
				e.clientX = e.changedTouches[0].clientX;
				e.clientY = e.changedTouches[0].clientY;
			} else {
				e.clientX = 0;
				e.clientY = 0;
			}
			var i, l;
			l = t[p + "mouseup"];
			if (l) {
				for (i = l.length - 1; i >= 0; i--)
					l[i](e);
			}
			l = t[p + "mouseout"];
			if (l) {
				for (i = l.length - 1; i >= 0; i--)
					l[i](e);
			}
		}
	}
} : undefined),
attachMouse = (_isTouch ? function (observable, eventName, targetFunction, capturePhase) {
	var e;
	if (eventName === "click") {
		observable.addEventListener(eventName, targetFunction, capturePhase);
	} else if (eventName === "mousemove") {
		e = (capturePhase ? "_tc" : "_t") + eventName;
		if (!observable[e]) {
			observable[e] = [targetFunction];
			observable.addEventListener("touchmove", capturePhase ? touchMouse._touchmovec : touchMouse._touchmove, capturePhase);
		} else {
			observable[e].push(targetFunction);
		}
	} else {
		e = (capturePhase ? "_tc" : "_t");
		if (!observable[e]) {
			observable[e] = 1;
			observable.addEventListener("touchstart", capturePhase ? touchMouse._touchstartc : touchMouse._touchstart, capturePhase);
			observable.addEventListener("touchend", capturePhase ? touchMouse._touchendc : touchMouse._touchend, capturePhase);
		} else {
			observable[e]++;
		}
		e += eventName;
		if (!observable[e]) {
			observable[e] = [targetFunction];
		} else {
			observable[e].push(targetFunction);
		}
	}
	return true;
} : function (observable, eventName, targetFunction, capturePhase) {
	return observable.addEventListener(eventName, targetFunction, capturePhase);
}),
detachMouse = (_isTouch ? function (observable, eventName, targetFunction, capturePhase) {
	var i, l, p, e;
	if (eventName === "click") {
		observable.removeEventListener(eventName, targetFunction, capturePhase);
	} else if (eventName === "mousemove") {
		e = (capturePhase ? "_tc" : "_t") + eventName;
		l = observable[e];
		if (l) {
			for (i = l.length - 1; i >= 0; i--) {
				if (l[i] === targetFunction) {
					if (l.length === 1) {
						delete observable[e];
						observable.removeEventListener("touchmove", capturePhase ? touchMouse._touchmovec : touchMouse._touchmove, capturePhase);
					} else {
						l.splice(i, 1);
					}
					break;
				}
			}
		}
	} else {
		p = (capturePhase ? "_tc" : "_t");
		e = p + eventName;
		i = -1;
		l = observable[e];
		if (l) {
			for (i = l.length - 1; i >= 0; i--) {
				if (l[i] === targetFunction) {
					if (l.length === 1) {
						delete observable[e];
					} else {
						l.splice(i, 1);
					}
					break;
				}
			}
		}
		if (i >= 0) {
			if (observable[p] > 1) {
				observable[p]--;
			} else {
				delete observable[p];
				observable.removeEventListener("touchstart", capturePhase ? touchMouse._touchstartc : touchMouse._touchstart, capturePhase);
				observable.removeEventListener("touchend", capturePhase ? touchMouse._touchendc : touchMouse._touchend, capturePhase);
			}
		}
	}
	return true;
} : function (observable, eventName, targetFunction, capturePhase) {
	return observable.removeEventListener(eventName, targetFunction, capturePhase ? true : false);
});
