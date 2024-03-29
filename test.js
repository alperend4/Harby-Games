var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

window.onresize = function() {
  w = ctx.canvas.width = window.innerWidth;
  h = ctx.canvas.height = window.innerHeight;
};window.onresize();

lines = [];

conf = {
 
  hue:  15,
  shadow: false,
  width: 1,
  length: 1,
  emitNum: 2,
  speed: 0.7,
  opacity: 0.2,
  maxLines: 300
};

bgDots = [
  {
    rad: (w+h)/2,
    x: w/2,
    y: 0,
    hue: 0
  },
  {
    rad: (w+h)/2,
    x: 0,
    y: h,
    hue: -45
  },
  {
    rad: (w+h)/2,
    x: w,
    y: h,
    hue: -90
  }
];

var gui = new dat.GUI();
dat.GUI.toggleHide();
var f1 = gui.addFolder("Design");
var f2 = gui.addFolder("Behaviour");
f1.add(conf, "hue", 0, 360).step(1).name("Color");
f1.add(conf, "opacity", 0.1, 1).step(0.1).name("Opacity");
f1.add(conf, "width", 0.3, 3).step(0.1).name("Width");
f1.add(conf, "length", 0.2, 2).step(0.1).name("Length");
f2.add(conf, "emitNum", 1, 5).step(1).name("Amount");
f2.add(conf, "speed", 0.5, 1.5).step(0.1).name("Speed");
f2.add(conf, "maxLines", 100, 1000).step(1).name("Max Lines");
//gui.add(conf, "shadow");

function emitLine(){
  if(conf.maxLines < lines.length)
    return;
  for(var i = 0; i < conf.emitNum; i++){
    var rx = Math.random() * w + 100;
    var ry = Math.random() * h - 100;
    lines.push({
      x1: rx,
      y1: ry,
      x2: rx,
      y2: ry,
      length: (Math.random() * (260 - 80) + 80) * conf.length,
      width: (Math.random() * (15 - 5) + 5) * conf.width,
      v1: (Math.random() * (4 - 2) + 2) * conf.speed,
      v2: (Math.random() * (1 - 0.5) + 0.5) * conf.speed,
      half: false,
      hue: Math.random() * 50
    });
  }
}

function drawBackground(){
  ctx.globalCompositeOperation = "lighter";
  for(var i = 0; i < bgDots.length; i++){
    var grd = ctx.createRadialGradient(bgDots[i].x, bgDots[i].y, 0, bgDots[i].x, bgDots[i].y, bgDots[i].rad);
    grd.addColorStop(0, "hsla("+ (conf.hue + bgDots[i].hue) +", 100%, 60%, 0.3)");
    grd.addColorStop(1, "hsla("+ (conf.hue + bgDots[i].hue) +", 100%, 50%, 0)");
    ctx.beginPath();
    ctx.arc(bgDots[i].x, bgDots[i].y, bgDots[i].rad, 0, Math.PI * 2);
    ctx.fillStyle = grd;
    ctx.fill();
    ctx.closePath();
  }
}

function drawLines(){
  ctx.globalCompositeOperation = "lighter";
  for(var i = 0; i < lines.length; i++){
    ctx.lineWidth = lines[i].width;
    ctx.beginPath();
    ctx.moveTo(lines[i].x1, lines[i].y1);
    ctx.lineTo(lines[i].x2, lines[i].y2);
    ctx.strokeStyle = "hsla("+(conf.hue - lines[i].hue)+", 100%, 50%, " +(conf.opacity)+ ")";
    ctx.lineCap = "round";
    ctx.stroke();
    ctx.closePath();

    if(lines[i].half == false){
      lines[i].x1 -= lines[i].v1;
      lines[i].y1 += lines[i].v1;
      lines[i].x2 -= lines[i].v2;
      lines[i].y2 += lines[i].v2;
      if(dist(lines[i].x1, lines[i].y1, lines[i].x2, lines[i].y2) > lines[i].length){
        lines[i].half = true;
      }
    }else{
      lines[i].x1 -= lines[i].v2;
      lines[i].y1 += lines[i].v2;
      lines[i].x2 -= lines[i].v1;
      lines[i].y2 += lines[i].v1;
    }
  }
}

function clear(){
  ctx.globalCompositeOperation = "source-over";
  ctx.beginPath();
  ctx.fillStyle = "#000";
  ctx.fillRect(0,0,w,h);
  ctx.closePath();
}

function checkLines(){
  emitLine();
  for(var i = 0; i < lines.length; i++){
    if(lines[i].half == true && dist(lines[i].x1, lines[i].y1, lines[i].x2, lines[i].y2) <= 10){
      lines[i] = lines[lines.length - 1];
      lines.pop();
    }else if(lines[i].x1 < 0 && lines[i].x2 < 0 && lines[i].y1 > h && lines[i].y2 > h){
      lines[i] = lines[lines.length - 1];
      lines.pop();
    }
  }
}

generateLines = setInterval(checkLines, 10);

function dist(x1, y1, x2, y2){
  return Math.sqrt(Math.pow((x2 - x1), 2) + Math.pow((y2 - y1), 2));
}

function render(){
  clear();
  drawBackground();
  drawLines();
  requestAnimationFrame(render);
}
render();
var Text = function(el, toRotate, period) {
  this.toRotate = toRotate;
  this.el = el;
  this.loopNum = 0;
  this.period = parseInt(period, 20) || 6000;
  this.txt = '';
  this.tick();
  this.isDeleting = false;
};

Text.prototype.tick = function() {
  var i = this.loopNum % this.toRotate.length;
  var fullTxt = this.toRotate[i];

  if (this.isDeleting) {
    this.txt = fullTxt.substring(0, this.txt.length - 1);
  } else {
    this.txt = fullTxt.substring(0, this.txt.length + 1);
  }

  this.el.innerHTML = '<span class="wrap">'+this.txt+'</span>';

  var that = this;
  var delta = 200 - Math.random() * 100;

  if (this.isDeleting) { delta /= 2; }

  if (!this.isDeleting && this.txt === fullTxt) {
    delta = this.period;
    this.isDeleting = false;
  } else if (this.isDeleting && this.txt === '') {
    this.isDeleting = false;
    this.loopNum++;
    delta = 500;
  }

  setTimeout(function() {
    that.tick();
  }, delta);
};

window.onload = function() {
  var elements = document.getElementsByClassName('typewrite');
  for (var i=0; i<elements.length; i++) {
    var toRotate = elements[i].getAttribute('data-words');
    var period = elements[i].getAttribute('data-period');
    if (toRotate) {
      new Text(elements[i], JSON.parse(toRotate), period);
    }
  }
};