// Car constructor.

var cw_Car = function () {
  this.__constructor.apply(this, arguments);
}

cw_Car.prototype.__constructor = function (car_def, squareDisease) {
  this.velocityIndex = 0;
  this.health = max_car_health;
  this.maxPosition = 0;
  this.maxPositiony = 0;
  this.minPositiony = 0;
  this.frames = 0;
  this.car_def = car_def;
  this.alive = true;
  this.is_elite = car_def.is_elite;
  this.healthBar = document.getElementById("health" + car_def.index).style;
  this.healthBarText = document.getElementById("health" + car_def.index).nextSibling.nextSibling;
  this.healthBarText.innerHTML = car_def.index;
  this.minimapmarker = document.getElementById("bar" + car_def.index);

  if (this.is_elite) {
    this.healthBar.backgroundColor = "#3F72AF";
    this.minimapmarker.style.borderLeft = "1px solid #3F72AF";
    this.minimapmarker.innerHTML = car_def.index;
  } else {
    this.healthBar.backgroundColor = "#F7C873";
    this.minimapmarker.style.borderLeft = "1px solid #F7C873";
    this.minimapmarker.innerHTML = car_def.index;
  }

  this.physics = dna_to_physics(car_def, squareDisease);
  
  this.replay = ghost_create_replay();
  ghost_add_replay_frame(this.replay, this);
}

cw_Car.prototype.getPosition = function () {
  var netX = 0.0;
  var netY = 0.0;
  var netM = 0.0;
  for (var i = 0; i < this.physics.chassiss.length; i++) {
     p = this.physics.chassiss[i].GetPosition();
     m = this.physics.chassiss[i].GetMass();
     netX = netX + p.x*m; netY = netY + p.y*m; netM = netM + m + 1e-10;
  }
  out = b2Vec2.Make(netX/netM, netY/netM);
  return out
}

cw_Car.prototype.draw = function () {
  for (var i = 0; i < this.physics.chassiss.length; i++) {
    drawObject(this.physics.chassiss[i]);
  }
  
  for (var i = 0; i < this.physics.wheels.length; i++) {
    drawObject(this.physics.wheels[i]);
  }
}

cw_Car.prototype.kill = function () {
  var avgspeed = (this.maxPosition / this.frames) * box2dfps;
  var position = this.maxPosition;
  var score = position + avgspeed;
  ghost_compare_to_replay(this.replay, ghost, score);
  ev_pushCarScore({
    car_def: this.car_def,
    v: score,
    s: avgspeed,
    x: position,
    y: this.maxPositiony,
    y2: this.minPositiony
  });
  
  for (var i = 0; i < this.physics.chassiss.length; i++) {
     world.DestroyBody(this.physics.chassiss[i]);
  }
  for (var i = 0; i < this.physics.wheels.length; i++) {
    world.DestroyBody(this.physics.wheels[i]);
  }
  this.alive = false;

  // refocus camera to leader on death
  if (camera_target == this.car_def.index) {
    cw_setCameraTarget(-1);
  }
}

cw_Car.prototype.checkDeath = function () {
  // check health
  var position = this.getPosition();
  // check if car reached end of the path
  if (position.x > world.finishLine) {
    this.healthBar.width = "0";
    return true;
  }
  if (position.y > this.maxPositiony) {
    this.maxPositiony = position.y;
  }
  if (position.y < this.minPositiony) {
    this.minPositiony = position.y;
  }
  if (position.x > this.maxPosition + 0.02) {
    this.health = max_car_health;
    this.maxPosition = position.x;
  } else {
    if (position.x > this.maxPosition) {
      this.maxPosition = position.x;
    }
    if (Math.abs(this.physics.chassiss[0].GetLinearVelocity().x) < 0.001) {
      this.health -= 5;
    }
    this.health--;
    if (this.health <= 0) {
      this.healthBarText.innerHTML = "&dagger;";
      this.healthBar.width = "0";
      return true;
    }
  }
}





