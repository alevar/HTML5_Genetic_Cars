// Environment stresses and boosts. Stuff happens...



function _m(gen) {
  return gen%16;
}

function env_isPothole(gen) {
  return _m(gen)==2;
}

function env_squareDisease(gen) {
  return _m(gen)==6;
}

function env_isCliffs(gen) {
  return _m(gen)==4;
}

function env_isBouncy(gen) {
  return _m(gen)==8;
}

function env_isGeronimo(gen) {
  return _m(gen)==12;
}

function env_isSlippy(gen) {
  return _m(gen)==10;
}

function env_createFloor(gen) {
  // Different floors depending on the generation.
  if (env_isPothole(gen)) {
    return pt_createFloor(1.0,0.3,0,0,0.7);
  }
  if (env_isCliffs(gen)) {
    return pt_createFloor(1.0,0.3,0,3,0.0);
  }
  if (env_isBouncy(gen)) {
    return pt_createFloor(3.0,0.9,0,0,0.0);
  }
  if (env_isGeronimo(gen)) {
    return pt_createFloor(1.0,0.3,1,0,0.0);
  }
  if (env_isSlippy(gen)) {
    return pt_createFloor(0.05,0.1,0,0,0.0);
  }
  return pt_createFloor(1.0,0.3,0,0,0);
}

function env_getDesc(gen) {
  if (env_squareDisease(gen)) {
    return "SQUARE WHEEL DISEASE";
  }
  if (env_isPothole(gen)) {
    return "POTHOLES";
  }
  if (env_isCliffs(gen)) {
    return "CLIFFS";
  }
  if (env_isBouncy(gen)) {
    return "SUPERBALL-COATING";
  }
  if (env_isGeronimo(gen)) {
    return "GERONIMO";
  }
  if (env_isSlippy(gen)) {
    return "WINTER BLUNDERLAND";
  }
  return "run little cars run!";
}