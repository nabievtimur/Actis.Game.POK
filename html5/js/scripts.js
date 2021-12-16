canvasColor = '#D0D0D0';
canvasRectBorderColor = '#0F0F0F';
canvasAccentColor = '#000000';
canvasTimerColor = '#200672';

class StylePainter {
	colorFiller(ctx, x, y, rectSize, value) {
		let rectH = Math.round(window.innerHeight / rectSize.RectsCountY);
		let rectW = Math.round(window.innerWidth / rectSize.RectsCountX);

		var typesColor = [	"#FF0000", "#FF3500", "#FF5900", "#FF7400", "#FF8900", "#FF9A00", "#FFAA00", "#FFB800", "#FFC600", 
							"#FFD300", "#FFE100", "#FFEF00", "#FFFF00", "#DCF900", "#BDF400", "#9FEE00", "#7CE700", "#4DDE00", 
							"#00CC00", "#00B64F", "#00A876", "#009999", "#086FA1", "#0D56A6", "#1240AB", "#1729B0", "#2618B1", 
							"#3914AF", "#4A11AE", "#5C0DAC", "#7109AA", "#8F04A8", "#B70094", "#CD0074", "#DC0055", "#EC0033", 
							"#A60000", "#A62300", "#A63A00", "#A64B00", "#A65900", "#A66400", "#A66F00", "#A67800", "#A68100", 
							"#A68900", "#A69200", "#A69C00", "#A6A600", "#8FA200", "#7B9E00", "#679B00", "#519600", "#329000", 
							"#008500", "#007633", "#006D4C", "#006363", "#034769", "#04356C", "#06266F", "#081472", "#120873", 
							"#200772", "#081472", "#3A0470", "#48036F", "#5D016D", "#770060", "#85004B", "#8F0037", "#990021" ];
		
		ctx.fillStyle = "#808080";
		ctx.fillRect(rectW * y + 8, rectH * x + 8, rectW - 10, rectH - 10);
		
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
		rectH = Math.round(window.innerHeight / rectSize.RectsCountY);
		rectW = Math.round(window.innerWidth / rectSize.RectsCountX);
		ctx.fillStyle = canvasAccentColor;
		ctx.fillRect(rectW * x + 3, rectH * y + 3, rectW - 6, rectH - 6);
	}
}

class Game {
	// x - колличество плиточек по горизонтали
	// y - колличество плиточек по вертикали
	// canvasContext - контекс для рисования
	// mode - режим игры
	// style - стиль плиточек
	constructor(level, canvasContext, mode, style) {
		let x = 15 + level;
		let y = 8 + level;
		this.ctx = canvasContext;
		this.rectSize = { RectsCountX: level + 17, RectsCountY: level + 10 };
		this.mode = mode;
		this.style = new StylePainter(style);
		this.gameRects = [];
		this.last = {x: 0, y: 0};
		this.timer = Math.pow(level * 100, 1.3);
		this.timerFull = this.timer;
		this.pathTimer = 0;
		this.path = [];
		this.accent = {startPos: {x: 0, y: 0}, endPos: {x: 0, y: 0}};

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
	
	timerDec() {
		this.timer --;
		if (this.timer <= 0) {
			alert("Game over.");
			document.location.href = "index.html";
		}
	}

	paint() {
		this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
		let rectH = Math.round(window.innerHeight / this.rectSize.RectsCountY);
		let rectW = Math.round(window.innerWidth / this.rectSize.RectsCountX);

		this.ctx.fillStyle = canvasTimerColor;
		this.ctx.fillRect(40, 10, (window.innerWidth - 80) * this.timer / this.timerFull, rectH / 4);

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
			if (this.pathTimer == 0) {
				this.pathTimer = 2;
			}
			else {
				this.pathTimer--;
			}
			if (this.pathTimer == 0) {
				this.path = [];
			}
		}
	}

	onClick(x, y) {
		let rectH = Math.round(window.innerHeight / this.rectSize.RectsCountY);
		let rectW = Math.round(window.innerWidth / this.rectSize.RectsCountX);
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
					if(this.validate()) {
						this.regenerate();
					}
					this.paint();
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
		return true;
	}
}

function paint(ctx, gameSettings, gameRects, last) {
	ctx.height = window.innerHeight;
	ctx.width = window.innerWidth;
	ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
	rectH = Math.round(window.innerHeight / (gameSettings.RectsCountY));
	rectW = Math.round(window.innerWidth / (gameSettings.RectsCountX));

	ctx.fillStyle = canvasTimerColor;
	ctx.fillRect(40, 10, (window.innerWidth - 80) * timer / timerFull, rectH / 4);

	if (last.y != 0) {
		if (gameRects[last.y][last.x] != -1) {
			ctx.fillStyle = canvasRectBorderColor;
			ctx.fillRect(rectW * last.x + 3, rectH * last.y + 3, rectW - 6, rectH - 6);
		}
	}
	
	if ((acsent.j) && (acsent.i) && (acsent.m) && (acsent.n)) {
		ctx.fillStyle = canvasAcsentColor;
		ctx.fillRect(rectW * acsent.j + 3, rectH * acsent.i + 3, rectW - 6, rectH - 6);
		ctx.fillRect(rectW * acsent.m + 3, rectH * acsent.n + 3, rectW - 6, rectH - 6);
	}

	for (var i = 1; i < gameSettings.RectsCountY + 1; i++) {
		for (var j = 1; j < gameSettings.RectsCountX + 1; j++) {
			if (gameRects[i][j] != -1) {
				ctx.fillStyle = getColorByTypeAndTypes(gameRects[i][j]);
				ctx.fillRect(rectW * j + 5, rectH * i + 5, rectW - 10, rectH - 10);
				ctx.fillStyle = "#FFFFFF";
				ctx.font = "48px serif";
				ctx.fillText(gameRects[i][j], rectW * j + 10, rectH * (i + 1) - 10, rectW - 20);
			}
		}
	}

	if (path.length > 0) {
		console.log("paint Path" + path[0]);
		ctx.beginPath();       // Начинает новый путь
		ctx.lineWidth = 5;
		ctx.fillStyle = canvasRectBorderColor;
		ctx.moveTo(rectW * path[0].x + rectW / 2, rectH * path[0].y + rectH / 2);
		for (i = 1; i < path.length; i++) {
			ctx.lineTo(rectW * path[i].x + rectW / 2, rectH * path[i].y + rectH / 2);
		}
		ctx.stroke();          // Отображает путь
	}
}

function nextExpand() {
	level++;
	alert("level - " + level);
	game = new Game(level, doc.getContext('2d'), 0, 0);
	
	window.addEventListener(`resize`, event => {
		canvas.height = window.innerHeight;
		canvas.width = window.innerWidth;
		game.paint();
	}, false);

	window.onclick = function (event) {
		x = event.pageX;
		y = event.pageY;
		game.onClick(x, y);
		if (game.check()) {
			next();
		}
	}	
		
	console.log("new level");
}

function nextGravity() {
	alert("level - " + (i - 8));
	game = new Game(level, doc.getContext('2d'), 0, 0);
	
	window.addEventListener(`resize`, event => {
		canvas.height = window.innerHeight;
		canvas.width = window.innerWidth;
		game.paint();
	}, false);

	window.onclick = function (event) {
		x = event.pageX;
		y = event.pageY;
		game.onClick(x, y);
	}
		
	console.log("new level");
}

function getQueryStringValue (key) {  
	return decodeURIComponent(window.location.search.replace(new RegExp("^(?:.*[&\\?]" + encodeURIComponent(key).replace(/[\.\+\*]/g, "\\$&") + "(?:\\=([^&]*))?)?.*$", "i"), "$1"));  
}  

let mode = getQueryStringValue("mode");
console.log(mode);

// main code 
var doc = document.getElementById("canvas");
canvas.height = window.innerHeight;
canvas.width = window.innerWidth;

var level = 0;
if (mode === "expand") {
	var next = nextExpand;
}
else{
	var next = nextGravity;
}

setInterval(function() {
	game.timerDec();
	game.paint();
	console.log("timer");
}, 1000);

window.addEventListener(`resize`, event => {
	canvas.height = window.innerHeight;
	canvas.width = window.innerWidth;
	game.paint();
}, false);

next();