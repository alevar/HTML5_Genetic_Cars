
var friction = -1;
var restitution = -1;
var maxFloorTiles = 500;
var groundPieceWidth = 1.5;
var groundPieceHeight = 0.15;

//pt_createFloor(0.5,0.3,0,0,0)
function pt_createFloor(f,r,terrainID,cliff,potholeAmount) {
  // defaults:
  friction = f;
  restitution = r;
  var angles = new Array();
    
  for(var k=0; k<10; k++) { // initial flat zone.
    angles.push(0);
  }
    
  if(terrainID==1) {
    geronimo_terrain(angles);
  } else {
    default_terrain(angles);
  }
  cliffs(angles, cliff);
  
  return pt_angles2floor(angles,potholeAmount);
}

function cliffs(angles, cliffHeight) {
  // cliff fun.
  for (var k = 10; k < maxFloorTiles; k++) {
	if ((k%40<cliffHeight) && (k>cliffHeight)) {
	  angles[k] = -1.4 - 0.2*Math.random();
	}
  }
}

function default_terrain(angles) {
  for (var k = 10; k < maxFloorTiles; k++) {
    angles.push((Math.random()-0.5)*k*0.02);
  }
}

function geronimo_terrain(angles) {
  for (var k = 10; k < 150; k++) {
    angles.push((Math.random()-1.0)*2.0);
  }
  for (var k = 150; k < maxFloorTiles; k++) {
    angles.push((Math.random()-0.5)*(k-150)*0.02+ 0.02*(k-150));
  }
}

function pt_angles2floor(angles, maxPothole) {
  var last_tile = null;
  var tile_position = new b2Vec2(-5, 0);
  var tiles = new Array();
  Math.seedrandom(floorseed);
  for (var k = 0; k < angles.length; k++) {
      if (k<10) {
        var ph = 0.0;
      }
      else {
        var ph = maxPothole*Math.random()*Math.min(1.0,(k-10)*0.05);
      }
      last_tile = cw_createFloorTile(tile_position, angles[k], ph);
      tiles.push(last_tile);
      last_fixture = last_tile.GetFixtureList();
      last_world_coords = last_tile.GetWorldPoint(last_fixture.GetShape().m_vertices[3]);
      tile_position = last_world_coords;
  }
  return tiles;
}

function cw_createFloorTile(position, angle, pothole) {
  body_def = new b2BodyDef();

  body_def.position.Set(position.x, position.y);
  var body = world.CreateBody(body_def);
  fix_def = new b2FixtureDef();
  fix_def.shape = new b2PolygonShape();
  fix_def.friction = friction;
  fix_def.restitution = restitution; //restitution;

  var coords = new Array();
  var gp = groundPieceWidth*pothole;
  coords.push(new b2Vec2(gp, 0));
  coords.push(new b2Vec2(gp, -groundPieceHeight));
  coords.push(new b2Vec2(groundPieceWidth, -groundPieceHeight));
  coords.push(new b2Vec2(groundPieceWidth, 0));

  var center = new b2Vec2(0, 0);

  var newcoords = cw_rotateFloorTile(coords, center, angle);

  fix_def.shape.SetAsArray(newcoords);

  body.CreateFixture(fix_def);
  return body;
}

function cw_rotateFloorTile(coords, center, angle) {
  var newcoords = new Array();
  for (var k = 0; k < coords.length; k++) {
    nc = new Object();
    nc.x = Math.cos(angle) * (coords[k].x - center.x) - Math.sin(angle) * (coords[k].y - center.y) + center.x;
    nc.y = Math.sin(angle) * (coords[k].x - center.x) + Math.cos(angle) * (coords[k].y - center.y) + center.y;
    newcoords.push(nc);
  }
  return newcoords;
}
