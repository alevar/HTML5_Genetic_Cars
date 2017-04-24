// Evolutionary algorithm.
// dna.js sets the genetic rules and limitations, i.e anything that changing the genetic rules would affect.
// evolve.js navigates the landscape at a POPULATION level.

var gen_counter = 0; 
var generationSize = parseInt(document.getElementById("gensize").options[document.getElementById("gensize").selectedIndex].value);
var gen_champions = parseInt(document.getElementById("elitesize").options[document.getElementById("elitesize").selectedIndex].value);
var gen_mutationLo = parseFloat(document.getElementById("mutationratelow").options[document.getElementById("mutationratelow").selectedIndex].value);
var gen_mutationHi = parseFloat(document.getElementById("mutationratehi").options[document.getElementById("mutationratehi").selectedIndex].value);

var ev_carScores = new Array();
var ev_carScoresOld = new Array();
var ev_carGeneration = new Array();

function ev_generationZero() {
  generationSize = document.getElementById("gensize").options[document.getElementById("gensize").selectedIndex].value;

  for (var k = 0; k < generationSize; k++) {
    var car_def = dna_random();
    car_def.index = k;
    ev_carGeneration.push(car_def);
  }
  gen_counter = 0;
  
  document.getElementById("generation").innerHTML = "0";
  document.getElementById("population").innerHTML = generationSize.toString();
  
  return ev_materializeGeneration();
}

function ev_materializeGeneration() {
  ev_carArray = new Array();
  for (var k = 0; k < generationSize; k++) {
    ev_carArray.push(new cw_Car(ev_carGeneration[k], env_squareDisease(gen_counter)));
  }
  return ev_carArray;
}

//http://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

function ev_nextGeneration() {
  gen_counter++;
  
  generationSize = document.getElementById("gensize").options[document.getElementById("gensize").selectedIndex].value;
  
  var newGeneration = new Array();
  var newborn;
  ev_getChampions();
  for (var k = 0; k < Math.min(gen_champions,ev_carScores.length); k++) {
    ev_carScores[k].car_def.is_elite = true;
    ev_carScores[k].car_def.index = k;
    newGeneration.push(ev_carScores[k].car_def);
  }
  
  // Mutation array geometric progression from low to high:
  var mutationRates = new Array();
  for (k = 0; k < generationSize; k++) {
    if(k<gen_champions) {
      mutationRates.push(0);
     }else{
       var porp = (k-gen_champions)/(generationSize-0.99999999-gen_champions);
       mutationRates.push(Math.exp(Math.log(gen_mutationLo)*(1.0-porp)+Math.log(gen_mutationHi)*porp));
     }
  }

  var k = gen_champions;
  while (newGeneration.length < generationSize) {
    var parent1 = ev_getParents();
    var parent2 = parent1;
    while (parent2 == parent1 && ev_carScores.length > 1) {
      parent2 = ev_getParents();
    }
    newborn = dna_makeChild(ev_carScores[parent1].car_def,
      ev_carScores[parent2].car_def);
    newborn = dna_mutate(newborn, mutationRates[k]);
    if(k<mutationRates.length-1) {
      k = k+1.0;
    }
    newborn.is_elite = false;
    newborn.index = newGeneration.length;
    newGeneration.push(newborn);
  }
  ev_carScoresOld = ev_carScores;
  ev_carScores = new Array();
  ev_carGeneration = newGeneration;
    
  document.getElementById("generation").innerHTML = gen_counter.toString();
  document.getElementById("cars").innerHTML = "";
  document.getElementById("population").innerHTML = generationSize.toString();
  
  return ev_materializeGeneration();
}

function ev_getChampions() { // how is this used?
  var ret = new Array();
  ev_carScores.sort(function (a, b) {
    if (a.v > b.v) {
      return -1
    } else {
      return 1
    }
  });
  for (var k = 0; k < Math.min(generationSize,ev_carScores.length); k++) {
    ret.push(ev_carScores[k].i);
  }
  return ret;
}

function ev_getParents() {
  var r = Math.random();
  if (r == 0)
    return 0;
  return Math.floor(-Math.log(r) * ev_carScores.length) % ev_carScores.length;
}

function ev_setMutationLo(mutation) {
  gen_mutationLo = parseFloat(mutation);
}

function ev_setMutationHi(mutation) {
  gen_mutationHi = parseFloat(mutation);
}

function ev_setGenSize(size) {
  ev_setGenSize
}

///////////////////

function ev_pushCarScore(cs) {
    ev_carScores.push(cs);
}

function ev_getGenerationSize() {
  generationSize = document.getElementById("gensize").options[document.getElementById("gensize").selectedIndex].value;
  return generationSize;
}

function ev_clearCarScores() {
    ev_carScores = new Array();
}

function ev_setGenCounter(gc) {
  gen_counter = gc;
}
function ev_getGenCounter() {
  return gen_counter;
}

function ev_getCarGeneration() {
  return ev_carGeneration;
}
function ev_setCarGeneration(cg) {
  generationSize = cg.length;
  ev_carGeneration = cg;
}

function ev_getCarScores() {
  return ev_carScores;
}

function ev_getCarScoresOld() {
  return ev_carScoresOld;
}

function ev_setEliteSize(clones) {
  gen_champions = parseInt(clones, 10);
}