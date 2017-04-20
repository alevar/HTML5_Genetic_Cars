// Graphics.
var canvas = document.getElementById("mainbox");
var minimapcanvas = document.getElementById("minimap");
var ctx = canvas.getContext("2d");
var cameraspeed = 0.1;
var camera_y = 0;
var camera_x = 0;
var camera_target = -1; // which car should we follow? -1 = leader
var minimapcamera = document.getElementById("minimapcamera").style;
var minimapctx = minimapcanvas.getContext("2d");
var minimapscale = 3;
var minimapfogdistance = 0;
var fogdistance = document.getElementById("minimapfog").style;
var distanceMeter = document.getElementById("distancemeter");
var heightMeter = document.getElementById("heightmeter");

minimapcamera.width = 12 * minimapscale + "px";
minimapcamera.height = 6 * minimapscale + "px";

function gfx_drawScreen(ghost,cw_carArray,tiles, gen) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = "30px Arial"; ctx.fillText(env_getDesc(gen),10,30);
  ctx.save();
  ctx.translate(200 - (camera_x * zoom), 200 + (camera_y * zoom));
  ctx.scale(zoom, -zoom);
  gfx_drawFloor(tiles);
  ghost_draw_frame(ctx, ghost);
  gfx_drawCars(cw_carArray);
  ctx.restore();
}

function gfx_showDistance(distance, height) {
  distanceMeter.innerHTML = distance + " meters<br />";
  heightMeter.innerHTML = height + " meters";
  if (distance > minimapfogdistance) {
    fogdistance.width = 800 - Math.round(distance + 15) * gfx_GetMinimapscale() + "px";
    minimapfogdistance = distance;
  }
}

function gfx_setCameraPosByXY(x,y) {
  camera_x = x;
  camera_y = y;
}

function gfx_minimapCamera(x, y) {
  minimapcamera.left = Math.round((2 + camera_x) * minimapscale) + "px";
  minimapcamera.top = Math.round((31 - camera_y) * minimapscale) + "px";
}

function gfx_setCameraTarget(k) {
  camera_target = k;
}

function gfx_setCameraPosition() {
  if (camera_target >= 0) {
    var cameraTargetPosition = cw_carArray[camera_target].getPosition();
  } else {
    var cameraTargetPosition = leaderPosition;
  }
  var diff_y = camera_y - cameraTargetPosition.y;
  var diff_x = camera_x - cameraTargetPosition.x;
  camera_y -= cameraspeed * diff_y;
  camera_x -= cameraspeed * diff_x;
  gfx_minimapCamera(camera_x, camera_y);
}

function gfx_drawGhostReplay(ghost, tiles) {
  carPosition = ghost_get_position(ghost);
  camera_x = carPosition.x;
  camera_y = carPosition.y;
  gfx_minimapCamera(camera_x, camera_y);
  showDistance(Math.round(carPosition.x * 100) / 100, Math.round(carPosition.y * 100) / 100);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.translate(200 - (carPosition.x * zoom), 200 + (carPosition.y * zoom));
  ctx.scale(zoom, -zoom);
  ghost_draw_frame(ctx, ghost);
  ghost_move_frame(ghost);
  gfx_drawFloor(tiles);
  ctx.restore();
}


function gfx_drawCars(cw_carArray) {
  for (var k = (cw_carArray.length - 1); k >= 0; k--) {
    myCar = cw_carArray[k];
    if (!myCar.alive) {
      continue;
    }
    myCarPos = myCar.getPosition();

    if (myCarPos.x < (camera_x - 5)) {
      // too far behind, don't draw
      continue;
    }

    ctx.strokeStyle = "#444";
    ctx.lineWidth = 1 / zoom;

    for (var i = 0; i < myCar.physics.wheels.length; i++) {
      b = myCar.physics.wheels[i];
      for (f = b.GetFixtureList(); f; f = f.m_next) {
        var s = f.GetShape();
        var color = "128";
        var rgbcolor = "rgb(" + color + "," + color + "," + color + ")";
        if ('m_p' in s) {
          gfx_drawCircle(b, s.m_p, s.m_radius, b.m_sweep.a, rgbcolor);
        } else {
          ctx.fillStyle = rgbcolor; gfx_drawPoly(b, s.m_vertices, s.m_vertices.length);
        }
      }
    }

    if (myCar.is_elite) {
      ctx.strokeStyle = "#3F72AF";
      ctx.fillStyle = "#DBE2EF";
    } else {
      ctx.strokeStyle = "#F7C873";
      ctx.fillStyle = "#FAEBCD";
    }
    for (var i=0; i<myCar.physics.chassiss.length; i++) {
		ctx.beginPath();
		var b = myCar.physics.chassiss[i];
		for (f = b.GetFixtureList(); f; f = f.m_next) {
		  var s = f.GetShape();
		  gfx_drawVirtualPoly(b, s.m_vertices, s.m_vertexCount);
		}
		ctx.fill();
		ctx.stroke();
    }
  }
}


function gfx_drawFloor(tiles) {
  
  if (restitution < 0.3) {
     ctx.strokeStyle = "#000";
  }
  else if (restitution < 0.7) {
     ctx.strokeStyle = "#707";
  }
  else {
      ctx.strokeStyle = "#F0F";
  }
  if (friction < 0.1) {
     ctx.fillStyle = "#CCC";
  }
  else if (friction < 0.7) {
     ctx.fillStyle = "#666";
  }
  else {
     ctx.fillStyle = "#111";
  }
  ctx.lineWidth = 2 / zoom;
  ctx.beginPath();

  outer_loop:
    for (var k = 0; k < tiles.length; k++) {
      var b = tiles[k];
      for (f = b.GetFixtureList(); f; f = f.m_next) {
        var s = f.GetShape();
        var shapePosition = b.GetWorldPoint(s.m_vertices[0]).x;
        if ((shapePosition > (camera_x - 5)) && (shapePosition < (camera_x + 10))) {
          gfx_drawVirtualPoly(b, s.m_vertices, s.m_vertexCount);
        }
        if (shapePosition > camera_x + 10) {
          break outer_loop;
        }
      }
    }
  ctx.fill();
  ctx.stroke();
}

function gfx_drawVirtualPoly(body, vtx, n_vtx) {
  // set strokestyle and fillstyle before call
  // call beginPath before call

  var p0 = body.GetWorldPoint(vtx[0]);
  ctx.moveTo(p0.x, p0.y);
  for (var i = 1; i < n_vtx; i++) {
    p = body.GetWorldPoint(vtx[i]);
    ctx.lineTo(p.x, p.y);
  }
  ctx.lineTo(p0.x, p0.y);
}

function gfx_drawPoly(body, vtx, n_vtx) {
  // set strokestyle and fillstyle before call
  ctx.beginPath();

  var p0 = body.GetWorldPoint(vtx[0]);
  ctx.moveTo(p0.x, p0.y);
  for (var i = 1; i < n_vtx; i++) {
    p = body.GetWorldPoint(vtx[i]);
    ctx.lineTo(p.x, p.y);
  }
  ctx.lineTo(p0.x, p0.y);

  ctx.fill();
  ctx.stroke();
}

function gfx_drawCircle(body, center, radius, angle, color) {
  var p = body.GetWorldPoint(center);
  ctx.fillStyle = color;

  ctx.beginPath();
  ctx.arc(p.x, p.y, radius, 0, 2 * Math.PI, true);

  ctx.moveTo(p.x, p.y);
  ctx.lineTo(p.x + radius * Math.cos(angle), p.y + radius * Math.sin(angle));

  ctx.fill();
  ctx.stroke();
}

function gfx_drawMiniMap(tiles) {
  var last_tile = null;
  var tile_position = new b2Vec2(-5, 0);
  minimapfogdistance = 0;
  fogdistance.width = "800px";
  minimapcanvas.width = minimapcanvas.width;
  minimapctx.strokeStyle = "#3F72AF";
  minimapctx.beginPath();
  var sh = 35;
  minimapctx.moveTo(0, sh * minimapscale);
  for (var k = 0; k < tiles.length; k++) {
    last_tile = tiles[k];
    last_fixture = last_tile.GetFixtureList();
    last_world_coords = last_tile.GetWorldPoint(last_fixture.GetShape().m_vertices[3]);
    tile_position = last_world_coords;
    minimapctx.lineTo((tile_position.x + 5) * minimapscale, (-tile_position.y + sh) * minimapscale);
  }
  minimapctx.stroke();
}

function gfx_GetMinimapscale(){
  return minimapscale;
}
