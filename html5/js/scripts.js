var canvasColor = '#D0D0D0';
var canvasRectBorderColor = '#0F0F0F';
var canvasAccentColor = '#000000';
var canvasTimerColor = '#06998a';
var canvasHeaderColor = '#E0E0E0';
var complexity = 2;

var docHeader = document.getElementById("HeaderCanvas");
var docPole = document.getElementById("PoleCanvas");

// ___________________________________Timer___________________________________
class Timer {
	constructor(time, fps, endSignal) {
		console.log("Timer.construct.");
		this.timerFull = time * fps;
		this.time = this.timerFull;
		this.fps = fps;
		this.activate = true;
		this.interval = null;
		this.endSignal = endSignal;
		this.paint = null;
		this.timerPainter = new TimerPainter();
	}
	
	// и отрисовка и декримент
	tick() {
		this.time--;
		if (this.time <= 0) {
			this.stop();
			// emit timer end
			this.timerPainter.paint(this.time, this.timerFull);
			this.endSignal();
		}
		this.timerPainter.paint(this.time, this.timerFull);
	}
	
	timerAdd(timerProc) {
		if(typeof timerProc == "undefined") {
			return;
		}
		console.log("Timer.timerAdd(" + timerProc + ").");
		this.time += this.timerFull / 100 * timerProc;
	}
	
	timerAddSec(time) {
		console.log("Timer.timerAdd(" + time + ").");
		this.time += time * this.fps;
	}
	
	start() {
		console.log("Timer.start.");
		this.interval = setInterval(() => { this.tick(); }, 1000 / this.fps);
		this.timerPainter.paint(this.time, this.timerFull);
	}
	
	stop() {
		console.log("Timer.stop.");
		clearInterval(this.interval);
	}
	
	pause() {
		console.log("Timer.pause.");
		stop();
	}
	
	resume() {
		console.log("Timer.resume.");
		start();
	}
}

// ___________________________________TimerPainter___________________________________
class TimerPainter {
	constructor() {
		console.log("TimerPainter.construct.");
		this.ctx = docHeader.getContext("2d");
	}
	
	paint(time, timerFull) {
		this.ctx.fillStyle = canvasHeaderColor;
		this.ctx.fillRect(0, 0, this.ctx.width, this.ctx.height);
		
		let timerWidth = (time * time / timerFull) / timerFull;
		if (timerWidth > 1) { timerWidth = 1; }
		this.ctx.fillStyle = canvasTimerColor;
		this.ctx.fillRect(
			this.ctx.width * 0.05, 
			this.ctx.height / 4, 
			timerWidth * (this.ctx.width * 0.9), 
			this.ctx.height / 2);
	}
}

// ___________________________________GamePole___________________________________
class GamePole {
	constructor(level, mode) {
		// mode depent part
		if (mode == "expand") {
			this.rules = this.rulesExpand;
			this.rectSize = { RectsCountY: level + 10, RectsCountX: level + 17 };
		}
		else {
			this.rules = this.rulesGraviti;
			this.rectSize = { RectsCountY: 11, RectsCountX: 18 };
		}
		
		// univers part
		this.path = [];
		this.last = {x: 0, y: 0};
		this.allowMistake = true;
		
		this.gameRects = [];
		for (let i = 0; i < this.rectSize.RectsCountY; i++) {
			this.gameRects[i] = [];
			for (let j = 0; j < this.rectSize.RectsCountX; j++) {
				this.gameRects[i][j] = -1;
			}
		}
		
		let t = 1;
		if (this.rectSize.RectsCountY % 2 == 0) {
			for (let i = 1; i < ((this.rectSize.RectsCountY - 2) / 2 + 1); i++) {
				for (let j = 1; j < (this.rectSize.RectsCountX - 1); j++) {
					this.gameRects[i][j] = t;
					this.gameRects[i + (this.rectSize.RectsCountY - 2) / 2][j] = t;
					t++;
					if (t > this.rectSize.RectsCountX * 2) {
						t = 1;
					}
				}
			}
		}
		else {
			for (let i = 1; i < (this.rectSize.RectsCountY - 1); i++) {
				for (let j = 1; j < ((this.rectSize.RectsCountX - 2) / 2 + 1); j++) {
					this.gameRects[i][j] = t;
					this.gameRects[i][j + (this.rectSize.RectsCountX - 2) / 2] = t;
					t++;
					if (t > this.rectSize.RectsCountX * 2) {
						t = 1;
					}
				}
			}
		}
		
		this.shufle();
	}
	
	shufle() {
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
	
	move(cx, cy, tx, ty, depth, up, hv, check) {
		let ccx = cx;
		let ccy = cy;
		do {
			(up ? (hv ? ccx++: ccy++) : (hv ? ccx--: ccy--));
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
	
	// return 1 if HIT or -1 if MISTAKE or 0 ELSE
	pick(y, x) {
		if ((this.last.y == 0) && (this.last.x == 0)) {
			this.last.y = y;
			this.last.x = x;
		} else if ((this.last.y == y) && (this.last.x == x)) {
			this.last.x = 0;
			this.last.y = 0;
		} else if (this.gameRects[y][x] == this.gameRects[this.last.y][this.last.x]) {
			this.path = [];
			this.path[0] = {x: x, y: y};
			if (0 == this.pathFinder(this.last.x, this.last.y, x, y, 2, false)) {
				console.log("HIT");
				this.gameRects[y][x] = -1;
				this.gameRects[this.last.y][this.last.x] = -1;
				this.last.x = 0;
				this.last.y = 0;
				this.allowMistake = true;
				if(this.validate()) {
					this.shufle();
				}
				return 1;
			}
			else{
				if (this.allowMistake) {
					this.allowMistake = false;
				}
				else {
					this.allowMistake = true;
					console.log("MISTAKE");
					return -5;
				}
			}
			this.last.x = 0;
			this.last.y = 0;
		} else {
			this.last.x = 0;
			this.last.y = 0;
		}
		console.log("MISS");
		return 0;
	}

	// return bool 
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
	
	check() {
		for (let i = 1; i < this.rectSize.RectsCountY - 1; i++) {
			for (let j = 1; j < this.rectSize.RectsCountX - 1; j++) {
				if (this.gameRects[i][j] != -1) {
					return false;
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
	
	rulesExpand() {
		return;
	}
	
	rulesGraviti() {
		console.log("TODO rulesGraviti");
		return;
	}
}

// ___________________________________GamePainter___________________________________
class GamePainter {
	constructor(style, gamePole) { 
		this.ctx = docPole.getContext("2d");
		this.gamePole = gamePole;
		this.pathTimeout = null;
		if (style === 1)
		{
			this.style = this.imageFiller;
		}
		else
		{
			this.style = this.colorFiller;
			this.typesColor = [ 
				"#FFCC66", "#CC9933", "#FF9933", "#FF6600", "#CC3300", 
				"#FF9999", "#CC6666", "#FF3399", "#FF99FF", "#CC66CC", 
				"#CC00FF", "#9933CC", "#9966FF", "#6666FF", "#3300FF", 
				"#3399FF", "#66CCCC", "#00CCCC", "#33CC99", "#33CC66", 
				"#66CC66", "#99CC99", "#00FF99", "#99FF66", "#99CC66", 
				"#CCFF00", "#CCCC33", "#CCCCCC", "#666666", "#999966", 
				"#CCCC99", "#669933", "#009900", "#009966", "#33CCFB", 
				"#006666", "#0099CC", "#336699", "#003366", "#0055FF", 
				"#330099", "#663399", "#9900CC", "#996699", "#CC3399", 
				"#CC0066", "#990033", "#CC0000", "#CC6600", "#FF3333"
			];
		}
	}

	colorFiller(y, x, width, height, value) {
		if (value < 0) {
			return;
		}
		if (value > this.typesColor.length) {
			this.ctx.fillStyle = "#000000";
		}
		else {
			this.ctx.fillStyle = this.typesColor[value - 1];
		}
		this.ctx.fillRect(y, x, width, height);
		this.ctx.fillStyle = "#FFFFFF";
		this.ctx.font = Math.round(height - 20) + "px normal";
		this.ctx.fillText(value, y + 15, x + height - 20, width - 20);
	}

	imageFiller(y, x, width, height, value) {
		console.log("TODO imageFiller");
		return;
	}
	
	paintCell(y, x, width, height, value) {
		this.style(y, x, width, height, value);
	}
	
	paint() {
		let rectW = Math.round(this.ctx.width / this.gamePole.rectSize.RectsCountX);
		let rectH = Math.round(this.ctx.height / this.gamePole.rectSize.RectsCountY);
		this.ctx.clearRect(0, 0, this.ctx.width, this.ctx.height);

		if ((this.gamePole.last.y != 0) && (this.gamePole.last.x != 0)) {
			if (this.gamePole.gameRects[this.gamePole.last.y][this.gamePole.last.x] != -1) {
				this.ctx.fillStyle = canvasRectBorderColor;
				this.ctx.fillRect(rectW * this.gamePole.last.x + 3, rectH * this.gamePole.last.y + 3, rectW - 6, rectH - 6);
			}
		}

		if (this.gamePole.path.length > 0) {
			this.ctx.beginPath();
			this.ctx.lineWidth = 5;
			this.ctx.fillStyle = canvasRectBorderColor;
			this.ctx.moveTo(rectW * this.gamePole.path[0].x + rectW / 2, rectH * this.gamePole.path[0].y + rectH / 2);
			for (let i = 1; i < this.gamePole.path.length; i++) {
				this.ctx.lineTo(rectW * this.gamePole.path[i].x + rectW / 2, rectH * this.gamePole.path[i].y + rectH / 2);
			}
			this.ctx.stroke(); 
			clearTimeout(this.pathTimeout);
			setTimeout(() => { 
				this.gamePole.path = [];
				this.paint();
			}, 1000);
		}
		
		for (let i = 0; i < this.gamePole.rectSize.RectsCountY - 1; i++) {
			for (let j = 0; j < this.gamePole.rectSize.RectsCountX - 1; j++) {
				if (this.gamePole.gameRects[i][j] != -1) {
					this.ctx.fillStyle = "#808080";
					this.ctx.fillRect(j * rectW + 10, i * rectH + 10, rectW - 10, rectH - 10);
					this.paintCell(j * rectW + 5, i * rectH + 5, rectW - 10, rectH - 10, this.gamePole.gameRects[i][j]);
				}
			}
		}
	}
	
	onClick(x, y) {
		let rectW = Math.round(this.ctx.width / this.gamePole.rectSize.RectsCountX);
		let rectH = Math.round(this.ctx.height / this.gamePole.rectSize.RectsCountY);
		let Xnumber = Math.floor(x / rectW);
		let Ynumber = Math.floor(y / rectH);
		
		if (this.gamePole.gameRects[Ynumber][Xnumber] == -1) {
			return;
		}
		
		if (((Xnumber > 0) && 
			((Ynumber > 0) && 
			(Xnumber < (this.gamePole.rectSize.RectsCountX - 1))) && 
			(Ynumber < (this.gamePole.rectSize.RectsCountY - 1)))) {
			let a = this.gamePole.pick(Ynumber, Xnumber);
			this.paint();
			return a;
		}
	}
}

// ___________________________________Game___________________________________
class Game {
	// x - колличество плиточек по горизонтали
	// y - колличество плиточек по вертикали
	// canvasContext - контекс для рисования
	// mode - режим игры
	// style - стиль плиточек
	constructor(level, mode, style) {
		this.gamePole = new GamePole(level, mode);
		this.gamePolePainter = new GamePainter(style, this.gamePole);
		this.timer = new Timer(Math.pow(level * (50 + 25 * complexity), 1.1), 30, () => {
			alert("Game over");			
			document.location.href = ".\\modePicker.html"; });
	}
	
	start() {
		console.log("Start Game");
		this.timer.start();
		//this.timerPainter.paint(this.timer);
		this.gamePolePainter.paint();
	}
	
	onClick(x, y) {
		let res = this.gamePolePainter.onClick(x, y);
		if (res === 1) {
			this.timer.timerAddSec(3);
		}
		else if (res === -5) {
			this.timer.timerAdd(-5);
		}
	}
	
	stop() {
		this.timer.stop();
		this.gamePolePainter.paint();
	}
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

var mode = getQueryStringValue("mode");
if (mode != "expand") {
	mode = "graviti";
}
var style = 0;

canvasResize();

var level = 0;
var game = null;

function next() {
	level++;
	alert("level - " + level);
	var game = new Game(level, mode, style);
	game.start();
	game.gamePolePainter.paint();

	docPole.onclick = function (event) {
		x = event.pageX;
		y = event.pageY - docHeader.height;
		game.onClick(x, y);
		if (game.gamePole.check()) {
			game.stop();
			next();
		}
	}	
		
	console.log("new level");
}

next();

window.addEventListener(`resize`, event => {
	canvasResize();
	if (game != null) {
		game.gamePolePainter.paint();
	}
}, false);
