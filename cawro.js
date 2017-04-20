// Global Vars
var ghost;

var timeStep = 1.0 / 60.0;

var doDraw = true;
var cw_paused = false;

var box2dfps = 60;
var screenfps = 60;

var debugbox = document.getElementById("debug");

var cw_carArray = new Array();

var cw_floorTiles = new Array();

var mmm = null; // set at the beginning
var hbar = null;

var gravity = new b2Vec2(0.0, -document.getElementById("gravity").options[document.getElementById("gravity").selectedIndex].value);

var doSleep = true;

var world;

var zoom = 70;

var velocityIndex = 0;
var deathSpeed = 0.1;
var max_car_health = box2dfps * 10;
var car_health = max_car_health;

var cw_ghostReplayInterval = null;


var leaderPosition = new Object();
leaderPosition.x = 0;
leaderPosition.y = 0;

function debug(str, clear) {
  if (clear) {
    debugbox.innerHTML = "";
  }
  debugbox.innerHTML += str + "<br />";
}

function saveProgress() {
  localStorage.cw_savedGeneration = JSON.stringify(ev_getCarGeneration());
  localStorage.cw_genCounter = ev_getGenCounter();
  localStorage.cw_ghost = JSON.stringify(ghost);
  localStorage.gra_topScores = JSON.stringify(gra_getTopScores());
  localStorage.cw_floorSeed = floorseed;
}

function restoreProgress() {
  if (typeof localStorage.cw_savedGeneration == 'undefined' || localStorage.cw_savedGeneration == null) {
    alert("No saved progress found");
    return;
  }
  cw_stopSimulation();
  ev_setCarGeneration(JSON.parse(localStorage.cw_savedGeneration));
  ev_setGenCounter(localStorage.cw_genCounter);
  ghost = JSON.parse(localStorage.cw_ghost);
  gra_setTopScores(JSON.parse(localStorage.gra_topScores));
  floorseed = localStorage.cw_floorSeed;
  document.getElementById("newseed").value = floorseed;

  for (b = world.m_bodyList; b; b = b.m_next) {
    world.DestroyBody(b);
  }
  Math.seedrandom(floorseed);
  cw_floorTiles = env_createFloor(ev_getGenCounter());
  gfx_drawMiniMap(cw_floorTiles);
  Math.seedrandom();

  buildHealthBars();
  cw_carArray = ev_materializeGeneration();
  cw_deadCars = 0;
  leaderPosition = new Object();
  leaderPosition.x = 0;
  leaderPosition.y = 0;
  document.getElementById("generation").innerHTML = ev_getGenCounter();
  document.getElementById("cars").innerHTML = "";
  document.getElementById("population").innerHTML = cw_carArray.length;
  cw_startSimulation();
}

function simulationStep() {
  world.Step(1 / box2dfps, 20, 20);
  gfx_setCameraPosition();
  leaderPosition.x = -1000000;
  ghost_move_frame(ghost);
  for (var k = 0; k < cw_carArray.length; k++) {
    if (!cw_carArray[k].alive) {
      continue;
    }
    ghost_add_replay_frame(cw_carArray[k].replay, cw_carArray[k]);
    cw_carArray[k].frames++;
    position = cw_carArray[k].getPosition();
    cw_carArray[k].minimapmarker.style.left = Math.round((position.x + 5) * gfx_GetMinimapscale()) + "px";
    cw_carArray[k].healthBar.width = Math.round((cw_carArray[k].health / max_car_health) * 100) + "%";
    if (cw_carArray[k].checkDeath()) {
      cw_carArray[k].kill();
      cw_deadCars++;
      document.getElementById("population").innerHTML = (cw_carArray.length - cw_deadCars).toString();
      cw_carArray[k].minimapmarker.style.borderLeft = "1px solid #3F72AF";
      if (cw_deadCars >= cw_carArray.length) {
        cw_newRound();
      }
      if (leaderPosition.leader == k) {
        // leader is dead, find new leader
        cw_findLeader();
      }
      continue;
    }
    if (position.x > leaderPosition.x) {
      leaderPosition = position;
      leaderPosition.leader = k;
    }
  }
  gfx_showDistance(Math.round(leaderPosition.x * 100) / 100, Math.round(leaderPosition.y * 100) / 100);
}

function cw_findLeader() {
  var lead = 0;
  for (var k = 0; k < cw_carArray.length; k++) {
    if (!cw_carArray[k].alive) {
      continue;
    }
    position = cw_carArray[k].getPosition();
    if (position.x > lead) {
      leaderPosition = position;
      leaderPosition.leader = k;
    }
  }
}

function toggleDisplay() {
  if (cw_paused) {
    return;
  }
  if (doDraw) {
    doDraw = false;
    cw_stopSimulation();
    cw_runningInterval = setInterval(function () {
      var time = performance.now() + (1000 / screenfps);
      while (time > performance.now()) {
        simulationStep();
      }
    }, 1);
  } else {
    doDraw = true;
    clearInterval(cw_runningInterval);
    cw_startSimulation();
  }
}

function cw_onGen() {
  buildHealthBarsIfNeeded();
  cw_carScores = ev_getCarScores();
  cw_carArray = ev_nextGeneration(); cw_deadCars = 0; cw_deadCars = 0; leaderPosition = new Object(); leaderPosition.x = 0; leaderPosition.y = 0; 
  gen_counter = ev_getGenCounter();
  
  gt = gra_getTopScores();
gt.push({
    i: gen_counter,
    v: cw_carScores[0].v,
    x: cw_carScores[0].x,
    y: cw_carScores[0].y,
    y2: cw_carScores[0].y2
  });
  gra_setTopScores(gt);
  
  gra_plot_graphs();
}

function cw_newRound() {
  var mutable_floor = true;
  if (mutable_floor) {
    // GHOST DISABLED
    ghost = null;
    floorseed = btoa(Math.seedrandom());

    world = new b2World(gravity, doSleep);
    cw_floorTiles = env_createFloor(ev_getGenCounter()+1); // add 1 since we will be increasing generation.
    gfx_drawMiniMap(cw_floorTiles);
  } else {
    // RE-ENABLE GHOST
    ghost_reset_ghost(ghost);
  }

  cw_onGen(); 
  gfx_setCameraPosByXY(0,0);
  gfx_setCameraTarget(-1);
}

function cw_setGravity(choice) {
  gravity = new b2Vec2(0.0, -parseFloat(choice));
  // CHECK GRAVITY CHANGES
  if (world.GetGravity().y != gravity.y) {
    world.SetGravity(gravity);
  }
}

function cw_drawScreen() { // wrapper fn.
    gfx_drawScreen(ghost,cw_carArray,cw_floorTiles, ev_getGenCounter());
}

function cw_startSimulation() {
  cw_runningInterval = setInterval(simulationStep, Math.round(1000 / box2dfps));
  cw_drawInterval = setInterval(cw_drawScreen, Math.round(1000 / screenfps));
}

function cw_stopSimulation() {
  clearInterval(cw_runningInterval);
  clearInterval(cw_drawInterval);
}

function cw_kill() {
  var avgspeed = (myCar.maxPosition / myCar.frames) * box2dfps;
  var position = myCar.maxPosition;
  var score = position + avgspeed;
  document.getElementById("cars").innerHTML += Math.round(position * 100) / 100 + "m + " + " " + Math.round(avgspeed * 100) / 100 + " m/s = " + Math.round(score * 100) / 100 + "pts<br />";
  ghost_compare_to_replay(replay, ghost, score);
  ev_pushCarScore({
    i: current_car_index,
    v: score,
    s: avgspeed,
    x: position,
    y: myCar.maxPositiony,
    y2: myCar.minPositiony
  });
  current_car_index++;
  cw_killCar();
  if (current_car_index >= cw_carArray.length) {
    cw_onGen();
    current_car_index = 0;
  }
  myCar = cw_createNextCar();
  last_drawn_tile = 0;
}

function cw_resetPopulation() {
  document.getElementById("generation").innerHTML = "";
  document.getElementById("cars").innerHTML = "";
  document.getElementById("topscores").innerHTML = "";
  buildHealthBarsIfNeeded();
  cw_clearGraphics();
  ev_setCarGeneration(new Array());
  ev_clearCarScores();
  
  gra_clearHistory();

  cw_carArray = ev_generationZero(); cw_deadCars = 0; leaderPosition = new Object(); leaderPosition.x = 0; leaderPosition.y = 0; ghost = ghost_create_ghost();
}

function cw_resetWorld() {
  doDraw = true;
  cw_stopSimulation();
  for (b = world.m_bodyList; b; b = b.m_next) {
    world.DestroyBody(b);
  }
  floorseed = document.getElementById("newseed").value;
  Math.seedrandom(floorseed);
  cw_floorTiles = env_createFloor(ev_getGenCounter());
  gfx_drawMiniMap(cw_floorTiles);
  Math.seedrandom();
  cw_resetPopulation();
  cw_startSimulation();
}

function cw_confirmResetWorld() {
  if (confirm('Really reset world?')) {
    cw_resetWorld();
  } else {
    return false;
  }
}

// ghost replay stuff

function cw_pauseSimulation() {
  cw_paused = true;
  clearInterval(cw_runningInterval);
  clearInterval(cw_drawInterval);
  old_last_drawn_tile = last_drawn_tile;
  last_drawn_tile = 0;
  ghost_pause(ghost);
}

function cw_resumeSimulation() {
  cw_paused = false;
  ghost_resume(ghost);
  last_drawn_tile = old_last_drawn_tile;
  cw_runningInterval = setInterval(simulationStep, Math.round(1000 / box2dfps));
  cw_drawInterval = setInterval(cw_drawScreen, Math.round(1000 / screenfps));
}

function cw_drawGhostReplay() {
   gfx_drawGhostReplay(ghost, cw_floorTiles);
}
function cw_startGhostReplay() {
  if (!doDraw) {
    toggleDisplay();
  }
  cw_pauseSimulation();
  cw_ghostReplayInterval = setInterval(cw_drawGhostReplay, Math.round(1000 / screenfps));
}

function cw_stopGhostReplay() {
  clearInterval(cw_ghostReplayInterval);
  cw_ghostReplayInterval = null;
  cw_findLeader();
  camera_x = leaderPosition.x;
  camera_y = leaderPosition.y;
  cw_resumeSimulation();
}

function cw_toggleGhostReplay(button) {
  if (cw_ghostReplayInterval == null) {
    cw_startGhostReplay();
    button.value = "Resume simulation";
  } else {
    cw_stopGhostReplay();
    button.value = "View top replay";
  }
}
// ghost replay stuff END


function buildHealthBarsIfNeeded() { // does the gen size change?
   if (ev_getGenerationSize() != document.getElementById("health").childNodes.length) {
       buildHealthBars();
   }
}

function buildHealthBars() {
  // # Health bars = # in a generation.
  // clone silver dot and health bar
  
  generationSize = ev_getGenerationSize();
  fog = document.getElementById("minimapfog");
  mmap = document.getElementById("minimap");
  camera = document.getElementById("minimapcamera");
  while (minimapholder.hasChildNodes()) { //http://stackoverflow.com/questions/683366/remove-all-the-children-dom-elements-in-div
    minimapholder.removeChild(minimapholder.lastChild);
  }
  minimapholder.appendChild(fog);
  minimapholder.appendChild(mmap);
  minimapholder.appendChild(camera);
  while (document.getElementById("health").hasChildNodes()) {
    document.getElementById("health").removeChild(document.getElementById("health").lastChild);
  }
  for (var k = 0; k < generationSize; k++) {
    // minimap markers
    var newbar = mmm.cloneNode(true);
    newbar.id = "bar" + k;
    newbar.style.paddingTop = k * 9 + "px";
    minimapholder.appendChild(newbar);

    // health bars
    var newhealth = hbar.cloneNode(true);
    newhealth.getElementsByTagName("DIV")[0].id = "health" + k;
    newhealth.car_index = k;
    document.getElementById("health").appendChild(newhealth);
  }
}

// initial stuff, only called once (hopefully)
function cw_init() {
  
  mmm = document.getElementsByName('minimapmarker')[0];
  hbar = document.getElementsByName('healthbar')[0];
  buildHealthBars();
  mmm.parentNode.removeChild(mmm);
  hbar.parentNode.removeChild(hbar);
  
  floorseed = btoa(Math.seedrandom());
  world = new b2World(gravity, doSleep);
  cw_floorTiles = env_createFloor(ev_getGenCounter());
  gfx_drawMiniMap(cw_floorTiles);
  cw_carArray = ev_generationZero(); cw_deadCars = 0; cw_deadCars = 0; leaderPosition = new Object(); leaderPosition.x = 0; leaderPosition.y = 0; ghost = ghost_create_ghost();
  cw_runningInterval = setInterval(simulationStep, Math.round(1000 / box2dfps));
  cw_drawInterval = setInterval(cw_drawScreen, Math.round(1000 / screenfps));
}

function relMouseCoords(event) {
  var totalOffsetX = 0;
  var totalOffsetY = 0;
  var canvasX = 0;
  var canvasY = 0;
  var currentElement = this;

  do {
    totalOffsetX += currentElement.offsetLeft - currentElement.scrollLeft;
    totalOffsetY += currentElement.offsetTop - currentElement.scrollTop;
  }
  while (currentElement = currentElement.offsetParent);

  canvasX = event.pageX - totalOffsetX;
  canvasY = event.pageY - totalOffsetY;

  return {x: canvasX, y: canvasY}
}
HTMLDivElement.prototype.relMouseCoords = relMouseCoords;
minimapholder.onclick = function (event) {
  var coords = minimapholder.relMouseCoords(event);
  var closest = {
    index: 0,
    dist: Math.abs(((cw_carArray[0].getPosition().x + 6) * gfx_GetMinimapscale()) - coords.x),
    x: cw_carArray[0].getPosition().x
  }

  var maxX = 0;
  for (var i = 0; i < cw_carArray.length; i++) {
    if (!cw_carArray[i].alive) {
      continue;
    }
    var pos = cw_carArray[i].getPosition();
    var dist = Math.abs(((pos.x + 6) * gfx_GetMinimapscale()) - coords.x);
    if (dist < closest.dist) {
      closest.index = i;
      closest.dist = dist;
      closest.x = pos.x;
    }
    maxX = Math.max(pos.x, maxX);
  }

  if (closest.x == maxX) { // focus on leader again
    gfx_setCameraTarget(-1);
  } else {
    gfx_setCameraTarget(closest.index);
  }
}

cw_init();