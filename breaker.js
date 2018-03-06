
function breakText(text, min, max, wiggle) {
	outer: for (let n = min; n <= max; n++) {
		let t = text, c = 0, res = []
		while (t.length) {
			if (t.length < n) {
				res.push(t)
				t = ''
			} else {
				let m = t.substr(n, wiggle).match(/[^\w]/)
				if (m) {
					res.push(t.substr(0, n + m.index))
					t = t.substr(n + m.index)
				} else {
					continue outer
				}
			}
		}
		return { len: n, arr: res }
	}
	return { len: -1, arr: text }
}

var code = `var Emitter=function(){function a(b){this._evt={};this._ctx=b||this}a.extend=function(b){return new a(b)};a.prototype.on=function(b,c){(this._evt[b]||(this._evt[b]=[])).push(c);return this};a.prototype.once=function(b,c){return this.on(b,function d(){this.off(b,d);c.apply(this,arguments)})};a.prototype.off=function(b,c){if(0===arguments.length)this._evt={};else if(1===arguments.length)delete this._evt[b];else if(1===arguments.length){var a=this._evt[b],d=a?a.indexOf(c):-1;-1<d&&a.splice(d,1)}return this}; a.prototype.emit=function(b){var c=this._evt[b];if(c&&0<c.length){c=c.slice();for(var a=c.length,d=1<arguments.length?Array.prototype.slice.call(arguments,1):[],e=0;e<a;e++)c[e].apply(this._ctx,d)}return this};a.prototype.hasListeners=function(b,a){var c=this._evt[b];return c?1<arguments.length?-1<c.indexOf(a):!0:!1};return a}();`

console.log(breakText(code, 50, 100, 6))