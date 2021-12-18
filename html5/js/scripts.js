var canvasColor = '#D0D0D0';
var canvasRectBorderColor = '#0F0F0F';
var canvasAccentColor = '#000000';
var canvasTimerColor = '#06998a';
var canvasHeaderColor = '#E0E0E0'

var docHeader = document.getElementById("HeaderCanvas");
var docPole = document.getElementById("PoleCanvas");

class StylePainter {
	colorFiller(ctx, x, y, rectSize, value) {
		let rectH = Math.round(ctx.height / rectSize.RectsCountY);
		let rectW = Math.round(ctx.width / rectSize.RectsCountX);

		var typesColor = [	"#FF0000", "#FF3500", "#FF5900", "#FF7400", "#FF8900", "#FF9A00", "#FFAA00", "#FFB800", "#FFC600", 
							"#FFD300", "#FFE100", "#FFEF00", "#FFFF00", "#DCF900", "#BDF400", "#9FEE00", "#7CE700", "#4DDE00", 
							"#00CC00", "#00B64F", "#00A876", "#009999", "#086FA1", "#0D56A6", "#1240AB", "#1729B0", "#2618B1", 
							"#3914AF", "#4A11AE", "#5C0DAC", "#7109AA", "#8F04A8", "#B70094", "#CD0074", "#DC0055", "#EC0033", 
							"#A60000", "#A62300", "#A63A00", "#A64B00", "#A65900", "#A66400", "#A66F00", "#A67800", "#A68100", 
							"#A68900", "#A69200", "#A69C00", "#A6A600", "#8FA200", "#7B9E00", "#679B00", "#519600", "#329000", 
							"#008500", "#007633", "#006D4C", "#006363", "#034769", "#04356C", "#06266F", "#081472", "#120873", 
							"#200772", "#081472", "#3A0470", "#48036F", "#5D016D", "#770060", "#85004B", "#8F0037", "#990021" ];
		
		ctx.fillStyle = "#808080";
		ctx.fillRect(rectW * y + 10, rectH * x + 10, rectW - 10, rectH - 10);
		
		if (value < 0) {
			return;
		}
		if (value > typesColor.length) {
			ctx.fillStyle = "#000000";
		}
		else {
			ctx.fillStyle = typesColor[value - 1];
		}
		ctx.fillRect(rectW * y + 5, rectH * x + 5, rectW - 10, rectH - 10);
		ctx.fillStyle = "#FFFFFF";
		ctx.font = "48px serif";
		ctx.fillText(value, rectW * y + 10, rectH * (x + 1) - 10, rectW - 20);
	}

	imageFiller(ctx, x, y, rectSize, value) {
		return;
	}

	constructor(style) { 
		if (style === 1)
		{
			this.style = this.imageFiller;
		}
		else
		{
			this.style = this.colorFiller;
		}
	}

	fillCtxStyle(ctx, x, y, rectSize, value) {
		this.style(ctx, x, y, rectSize, value);
	}

	fillCtxAccent(ctx, x, y, rectSize) {
		let rectH = Math.round(ctx.height / rectSize.RectsCountY);
		let rectW = Math.round(ctx.width / rectSize.RectsCountX);
		ctx.fillStyle = canvasAccentColor;
		ctx.fillRect(rectW * x + 3, rectH * y + 3, rectW - 6, rectH - 6);
	}
}

class Timer {
	constructor(time, fps) {
		console.log("construct");
		this.timerFull = time * fps;
		this.timer = this.timerFull;
		this.fps = fps;
		this.ctx = docHeader.getContext("2d");
		this.activate = true;
		this.interval = null;
	}
	
	// и отрисовка и декримент
	paint() {
		this.timer--;
		if (this.activate && this.timer <= 0) {
			this.stop();
			this.activate = false;
			alert("Game over");
			document.location.href = "index.html";
		}
		
		this.ctx.fillStyle = canvasHeaderColor;
		this.ctx.fillRect(0, 0, this.ctx.width, this.ctx.height);
		
		let timerWidth = (this.timer * this.timer / this.timerFull) / this.timerFull;
		if (timerWidth > 1) { timerWidth = 1; }
		this.ctx.fillStyle = canvasTimerColor;
		this.ctx.fillRect(
			this.ctx.width * 0.05, 
			this.ctx.height / 4, 
			timerWidth * (this.ctx.width * 0.9), 
			this.ctx.height / 2);
	}
	
	timerAdd(timerProc) {
		this.timer += this.timerFull / 100 * timerProc;
	}
	
	timerSub(timerProc) {
		this.timer -= this.timerFull / 100 * timerProc;
	}
	
	start() {
		this.interval = setInterval(() => { this.paint(); }, 1000 / this.fps);
	}
	
	stop() {
		clearInterval(this.interval);
	}
}

class Game {
	// x - колличество плиточек по горизонтали
	// y - колличество плиточек по вертикали
	// canvasContext - контекс для рисования
	// mode - режим игры
	// style - стиль плиточек
	constructor(level, mode, style) {
		let x = 15 + level;
		let y = 8 + level;
		this.ctx = docPole.getContext("2d");
		this.rectSize = { RectsCountX: level + 17, RectsCountY: level + 10 };
		this.mode = mode;
		this.style = new StylePainter(style);
		this.gameRects = [];
		this.last = {x: 0, y: 0};
		this.timer = new Timer(Math.pow(level * 100, 1.3), 30);
		this.activePath = 0;
		this.path = [];
		this.accent = {startPos: {x: 0, y: 0}, endPos: {x: 0, y: 0}};
		this.allowMistake = true;

		let pickedList = [];
		for (let i = 0; i < this.rectSize.RectsCountY; i++) {
			this.gameRects[i] = [];
			for (let j = 0; j < this.rectSize.RectsCountX; j++) {
				this.gameRects[i][j] = -1;
			}
		}

		for (let i = 1; i < y + 1; i++) {
			for (let j = 1; j < x + 1; j++) {
				pickedList[pickedList.length] = {y: i, x: j};
			}
		}

		pickedList.sort((a, b) => { return Math.random() - 0.5; });

		let t = 1;
		for (let i = 0; i < pickedList.length; i++) {
			this.gameRects[pickedList[i].y][pickedList[i].x] = t;
			if ((i + 1) % 2 == 0) {
				t++;
				if (t > (34 + 2 * level))
				{
					t = 1;
				}
			}
		}
	}
	
	start() {
		console.log("Start Game");
		this.timer.start();
		this.paint();
	}

	paint() {
		this.ctx.clearRect(0, 0, this.ctx.width, this.ctx.height);
		let rectH = Math.round(this.ctx.height / this.rectSize.RectsCountY);
		let rectW = Math.round(this.ctx.width / this.rectSize.RectsCountX);
		
		if ((this.last.y != 0) && (this.last.x != 0)) {
			if (this.gameRects[this.last.y][this.last.x] != -1) {
				this.ctx.fillStyle = canvasRectBorderColor;
				this.ctx.fillRect(rectW * this.last.x + 3, rectH * this.last.y + 3, rectW - 6, rectH - 6);
			}
		}
		
		/*if ((this.acsent.startPos.x) && (this.acsent.startPos.y) && (this.acsent.endPos.x) && (this.acsent.endPos.y)) {
			this.style.fillCtxAccent(this.ctx, this.acsent.startPos.x, this.acsent.startPos.y, this.rectSize);
			this.style.fillCtxAccent(this.ctx, this.acsent.endPos.x, this.acsent.endPos.y, this.rectSize);
		}*/

		for (var i = 0; i < this.rectSize.RectsCountY; i++) {
			for (var j = 0; j < this.rectSize.RectsCountX; j++) {
				if (this.gameRects[i][j] != -1) {
					this.style.fillCtxStyle(this.ctx, i, j, this.rectSize, this.gameRects[i][j]);
				}
			}
		}

		if (this.path.length > 0) {
			this.ctx.beginPath();
			this.ctx.lineWidth = 5;
			this.ctx.fillStyle = canvasRectBorderColor;
			this.ctx.moveTo(rectW * this.path[0].x + rectW / 2, rectH * this.path[0].y + rectH / 2);
			for (i = 1; i < this.path.length; i++) {
				this.ctx.lineTo(rectW * this.path[i].x + rectW / 2, rectH * this.path[i].y + rectH / 2);
			}
			this.ctx.stroke(); 
			this.activePath++;
			setTimeout(() => { 
				if (this.activePath <= 1) {
					this.activePath = 0;
					this.path = [];
					this.paint();
				}
				else {
					this.activePath--;
				}
			}, 1000);
		}
	}

	onClick(x, y) {
		let rectH = Math.round(this.ctx.height / this.rectSize.RectsCountY);
		let rectW = Math.round(this.ctx.width / this.rectSize.RectsCountX);
		let Xnumber = Math.floor(x / rectW);
		let Ynumber = Math.floor(y / rectH);
		if (this.gameRects[Ynumber][Xnumber] == -1) {
			return;
		}
		if (((Xnumber > 0) && (Xnumber < (this.rectSize.RectsCountX - 1))) && ((Ynumber > 0) && (Ynumber < (this.rectSize.RectsCountY - 1)))) {
			if ((this.last.y == 0) && (this.last.x == 0)) {
				this.last.y = Ynumber;
				this.last.x = Xnumber;
				this.paint();
			} else if ((this.last.y == Ynumber) && (this.last.x == Xnumber)) {
				this.last.x = 0;
				this.last.y = 0;
				this.paint();
			} else if (this.gameRects[Ynumber][Xnumber] == this.gameRects[this.last.y][this.last.x]) {
				this.path = [];
				this.path[0] = {x: Xnumber, y: Ynumber};
				if (0 == this.pathFinder(this.last.x, this.last.y, Xnumber, Ynumber, 2, false)) {
					this.gameRects[Ynumber][Xnumber] = -1;
					this.gameRects[this.last.y][this.last.x] = -1;
					this.allowMistake = true;
					this.timer.timerAdd(1);
					if(this.validate()) {
						this.regenerate();
					}
					this.paint();
				}
				else{
					if (this.allowMistake) {
						this.allowMistake = false;
					}
					else {
						this.allowMistake = true;
						this.timer.timerSub(5);
					}
				}
				this.last.x = 0;
				this.last.y = 0;
				this.paint();
			} else {
				this.last.x = 0;
				this.last.y = 0;
				this.paint();
			}
		}
	}

	move(cx, cy, tx, ty, depth, up, hv, check) {
		let ccx = cx;
		let ccy = cy;
		do {
			if (up) {
				if (hv) {
					ccx++;
				} else {
					ccy++;
				}
			}
			else {
				if (hv) {
					ccx--;
				} else {
					ccy--;
				}
			}
			if ((ccx >= this.gameRects[0].length) || (ccy >= this.gameRects.length) || (ccx < 0) || (ccy < 0)) {
				return -1;
			}
			if ((ccx === tx) && (ccy === ty))
			{
				if (!check) {
					this.path[this.path.length] = {x: cx, y: cy};
				}
				return 0;
			}
			if (this.gameRects[ccy][ccx] != -1)
			{
				return -1;
			}
			if (depth > 0) {
				let ret = this.move(ccx, ccy, tx, ty, depth - 1, true, !hv, check);
				if (ret === 0) {
					if (!check) {
						this.path[this.path.length] = {x: cx, y: cy};
					}
					return ret;
				}
			}
			if (depth > 0) {
				let ret = this.move(ccx, ccy, tx, ty, depth - 1, false, !hv, check);
				if (ret === 0) {
					if (!check) {
						this.path[this.path.length] = {x: cx, y: cy};
					}
					return ret;
				}
			}
		} while (true);
		return -1;
	}

	pathFinder(cx, cy, tx, ty, depth, check) {
		if (cx == tx) {
			if (Math.abs(ty - cy) < 2) {
				if (!check) {
					this.path[this.path.length] = {x: cx, y: cy};
					this.path[this.path.length] = {x: tx, y: ty};
				}
				return 0;
			}
		}
		if (cy == ty) {
			if (Math.abs(tx - cx) < 2) {
				if (!check) {
					this.path[this.path.length] = {x: cx, y: cy};
					this.path[this.path.length] = {x: tx, y: ty};
				}
				return 0;
			}
		}
		if (this.cellFree(cy, cx) && this.cellFree(ty, tx)) {
			let s = false;
			let d = false;
			if (Math.abs(tx - cx) >= Math.abs(ty - cy)) {
				d = true;
				s = (tx > cx ? s = true : s = false);
			}
			else {
				d = false;
				s = (ty > cy ? s = true : s = false);
			}
			if (0 === this.move(cx, cy, tx, ty, 2,  s,  d, check)) {
				return 0;
			}
			if (0 === this.move(cx, cy, tx, ty, 2,  s, !d, check)) {
				return 0;
			}
			if (0 === this.move(cx, cy, tx, ty, 2, !s, !d, check)) {
				return 0;
			}
			if (0 === this.move(cx, cy, tx, ty, 2, !s,  d, check)) {
				return 0;
			}
		}
		return -1;
	}

	regenerate() {
		let pickedList = [];
		for (let i = 0; i < this.rectSize.RectsCountY - 1; i++) {
			for (let j = 0; j < this.rectSize.RectsCountX - 1; j++) {
				if (this.gameRects[i][j] != -1) {
					pickedList[pickedList.length] = {y: i, x: j};
				}
			}
		}

		pickedList.sort((a, b) => { return Math.random() - 0.5; });

		let t = 0;
		let count = 0;
		for (let i = 0; i < this.rectSize.RectsCountY - 1; i++) {
			for (let j = 0; j < this.rectSize.RectsCountX - 1; j++) {
				if (this.gameRects[i][j] != -1) {
					t = this.gameRects[i][j];
					this.gameRects[i][j] = this.gameRects[pickedList[count].y][pickedList[count].x];
					this.gameRects[pickedList[count].y][pickedList[count].x] = t;
					count++;
				}
			}
		}
	}

	validate() {
		for (let i = 1; i < this.rectSize.RectsCountY - 1; i++) {
			for (let j = 1; j < this.rectSize.RectsCountX - 1; j++) {
				if (this.gameRects[i][j] != -1) {
					for (let n = 1; n < this.rectSize.RectsCountY - 1; n++) {
						for (let m = 1; m < this.rectSize.RectsCountX - 1; m++) {
							if ((i === n) && (j === m)) {
								continue;
							}
							if (this.gameRects[i][j] === this.gameRects[n][m]) {
								if (0 === this.pathFinder(j, i, m, n, 2, true)) {
									console.log("find " + j + " " + i + " " + m + " " + n);
									return false;
								}
							}
						}
					}
				}
			}
		}
		return true;
	}

	cellFree(y, x) {
		if ((this.gameRects[y - 1][x] === -1) || (this.gameRects[y][x - 1] === -1) || (this.gameRects[y + 1][x] === -1) || (this.gameRects[y][x + 1] === -1)) {
			return true;
		}
		return false;
	}
	
	check() {
		for (let i = 1; i < this.rectSize.RectsCountY - 1; i++) {
			for (let j = 1; j < this.rectSize.RectsCountX - 1; j++) {
				if (this.gameRects[i][j] != -1) {
					return false;
				}
			}
		}
		this.timer.stop();
		return true;
	}
}

function nextExpand() {
	level++;
	alert("level - " + level);
	game = new Game(level, 0, 0);
	game.start();

	docPole.onclick = function (event) {
		x = event.pageX;
		y = event.pageY - docHeader.height;
		game.onClick(x, y);
		if (game.check()) {
			next();
		}
	}	
		
	console.log("new level");
}

function nextGravity() {
	alert("level - " + (i - 8));
	let PoleDocument = document.getElementById("PoleCanvas");
	let game = new Game(level, 0, 0);
	game.start();
	
	docPole.onclick = function (event) {
		x = event.pageX;
		y = event.pageY + docHeader.height;
		game.onClick(x, y);
	}
	
	console.log("new level");
}

function getQueryStringValue (key) {  
	return decodeURIComponent(window.location.search.replace(new RegExp("^(?:.*[&\\?]" + encodeURIComponent(key).replace(/[\.\+\*]/g, "\\$&") + "(?:\\=([^&]*))?)?.*$", "i"), "$1"));  
}

function canvasResize() {
	docHeader.height = document.getElementById("HeaderCanvasContainer").getBoundingClientRect().height;
	docHeader.width = document.getElementById("HeaderCanvasContainer").getBoundingClientRect().width;
	let HeaderCanvas = docHeader.getContext('2d');
	HeaderCanvas.height = docHeader.height;
	HeaderCanvas.width = docHeader.width;
	
	docPole.height = document.getElementById("PoleCanvasContainer").getBoundingClientRect().height;
	docPole.width = document.getElementById("PoleCanvasContainer").getBoundingClientRect().width;
	let PoleCanvas = docPole.getContext('2d');
	PoleCanvas.height = docPole.height;
	PoleCanvas.width = docPole.width;
};

// main code 
console.log("GameStart");

let mode = getQueryStringValue("mode");
console.log(mode);
canvasResize();

var level = 0;
if (mode === "expand") {
	var next = nextExpand;
}
else{
	var next = nextGravity;
}
next();

window.addEventListener(`resize`, event => {
	canvasResize();
	game.paint();
}, false);