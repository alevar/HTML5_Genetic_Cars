var graphwidth = 400;
var graphheight = 250;
var graphcanvas = document.getElementById("graphcanvas");
var graphctx = graphcanvas.getContext("2d");

var gra_topScores = new Array();
var gra_graphTop = new Array();
var gra_graphElite = new Array();
var gra_graphAverage = new Array();

function gra_clearHistory(){ 
  gra_topScores = new Array();
  gra_graphTop = new Array();
  gra_graphElite = new Array();
  gra_graphAverage = new Array();
}

function gra_storeGraphScores() {
  carScores = ev_getCarScoresOld();
  gra_graphAverage.push(gra_average(carScores));
  gra_graphElite.push(gra_eliteaverage(carScores));
  gra_graphTop.push(carScores[0].v);
}

function gra_plotTop() {
  var graphsize = gra_graphTop.length;
  graphctx.strokeStyle = "#C83B3B";
  graphctx.beginPath();
  graphctx.moveTo(0, 0);
  for (var k = 0; k < graphsize; k++) {
    graphctx.lineTo(400 * (k + 1) / graphsize, gra_graphTop[k]);
  }
  graphctx.stroke();
}

function gra_plotElite() {
  var graphsize = gra_graphElite.length;
  graphctx.strokeStyle = "#7BC74D";
  graphctx.beginPath();
  graphctx.moveTo(0, 0);
  for (var k = 0; k < graphsize; k++) {
    graphctx.lineTo(400 * (k + 1) / graphsize, gra_graphElite[k]);
  }
  graphctx.stroke();
}

function gra_plotAverage() {
  var graphsize = gra_graphAverage.length;
  graphctx.strokeStyle = "#3F72AF";
  graphctx.beginPath();
  graphctx.moveTo(0, 0);
  for (var k = 0; k < graphsize; k++) {
    graphctx.lineTo(400 * (k + 1) / graphsize, gra_graphAverage[k]);
  }
  graphctx.stroke();
}

function gra_plot_graphs() {
  gra_storeGraphScores();
  gra_clearGraphics();
  gra_plotAverage();
  gra_plotElite();
  gra_plotTop();
  gra_listTopScores();
}


function gra_eliteaverage(scores) {
  var sum = 0;
  genSize = scores.length;
  for (var k = 0; k < Math.floor(genSize / 2); k++) {
    sum += scores[k].v;
  }
  return sum / Math.floor(genSize / 2);
}

function gra_average(scores) {
  var sum = 0;
  genSize = scores.length;
  for (var k = 0; k < genSize; k++) {
    sum += scores[k].v;
  }
  return sum / genSize;
}

function gra_clearGraphics() {
  graphcanvas.width = graphcanvas.width;
  graphctx.translate(0, graphheight);
  graphctx.scale(1, -1);
  graphctx.lineWidth = 1;
  graphctx.strokeStyle = "#3F72AF";
  graphctx.beginPath();
  graphctx.moveTo(0, graphheight / 2);
  graphctx.lineTo(graphwidth, graphheight / 2);
  graphctx.moveTo(0, graphheight / 4);
  graphctx.lineTo(graphwidth, graphheight / 4);
  graphctx.moveTo(0, graphheight * 3 / 4);
  graphctx.lineTo(graphwidth, graphheight * 3 / 4);
  graphctx.stroke();
}

function gra_listTopScores() {
  var ts = document.getElementById("topscores");
  ts.innerHTML = "<b>Top Scores:</b><br />";
  gra_topScores.sort(function (a, b) {
    if (a.v > b.v) {
      return -1
    } else {
      return 1
    }
  });

  for (var k = 0; k < Math.min(10, gra_topScores.length); k++) {
    document.getElementById("topscores").innerHTML += "#" + (k + 1) + ": " + Math.round(gra_topScores[k].v * 100) / 100 + " d:" + Math.round(gra_topScores[k].x * 100) / 100 + " h:" + Math.round(gra_topScores[k].y2 * 100) / 100 + "/" + Math.round(gra_topScores[k].y * 100) / 100 + "m (Gen " + gra_topScores[k].i + ")<br />";
  }
}

// Getters and setters:
function gra_getTopScores() {
  return gra_topScores;
}
function gra_setTopScores(ts) {
  gra_topScores = ts;
}
function gra_getGraphTop() {
  return gra_graphTop;
}
function gra_setGraphTop(gt) {
  gra_graphTop = gt;
}
function gra_getGraphElite() {
  return gra_graphElite;
}
function gra_setGraphElite(ge) {
  gra_graphElite = ge;
}
function gra_getGraphAverage() {
  return gra_graphAverage;
}
function gra_setGraphAverage(ga) {
  gra_graphAverage = ga;
}

var gra_topScores = new Array();
var gra_graphTop = new Array();
var gra_graphElite = new Array();
var gra_graphAverage = new Array();
