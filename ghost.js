var enable_ghost = true;

function ghost_create_replay() {
  if (!enable_ghost)
    return null;

  return {
    num_frames: 0,
    frames: [],
  }
}

function ghost_create_ghost() {
  if (!enable_ghost)
    return null;

  return {
    replay: null,
    frame: 0,
    dist: -100
  }
}

function ghost_reset_ghost(ghost) {
  if (!enable_ghost)
    return;
  if (ghost == null)
    return;
  ghost.frame = 0;
}

function ghost_pause(ghost) {
  if (ghost != null)
    ghost.old_frame = ghost.frame;
  ghost_reset_ghost(ghost);
}

function ghost_resume(ghost) {
  if (ghost != null)
    ghost.frame = ghost.old_frame;
}

function ghost_get_position(ghost) {
  if (!enable_ghost)
    return;
  if (ghost == null)
    return;
  if (ghost.frame < 0)
    return;
  if (ghost.replay == null)
    return;
  var frame = ghost.replay.frames[ghost.frame];
  return frame.pos;
}

function ghost_compare_to_replay(replay, ghost, max) {
  if (!enable_ghost)
    return;
  if (ghost == null)
    return;
  if (replay == null)
    return;

  if (ghost.dist < max) {
    ghost.replay = replay;
    ghost.dist = max;
    ghost.frame = 0;
  }
}

function ghost_move_frame(ghost) {
  if (!enable_ghost)
    return;
  if (ghost == null)
    return;
  if (ghost.replay == null)
    return;
  ghost.frame++;
  if (ghost.frame >= ghost.replay.num_frames)
    ghost.frame = ghost.replay.num_frames - 1;
}

function ghost_add_replay_frame(replay, car) {
  if (!enable_ghost)
    return;
  if (replay == null)
    return;

  var frame = ghost_get_frame(car);
  replay.frames.push(frame);
  replay.num_frames++;
}

function ghost_draw_frame(ctx, ghost) {
  if (!enable_ghost)
    return;
  if (ghost == null)
    return;
  if (ghost.frame < 0)
    return;
  if (ghost.replay == null)
    return;

  var frame = ghost.replay.frames[ghost.frame];

  // wheel style
  ctx.fillStyle = "#eee";
  ctx.strokeStyle = "#aaa";
  ctx.lineWidth = 1 / zoom;

  for (var i = 0; i < frame.wheels.length; i++) {
    for (w in frame.wheels[i]) {
      ghost_draw_circle(ctx, frame.wheels[i][w].pos, frame.wheels[i][w].rad, frame.wheels[i][w].ang);
    }
  }

  // chassis style
  ctx.strokeStyle = "#aaa";
  ctx.fillStyle = "#eee";
  ctx.lineWidth = 1 / zoom;
  for (var i=0; i<frame.chassiss.length; i++) {
     ctx.beginPath();
     ghost_draw_poly(ctx, frame.chassiss[i].vtx);
     ctx.fill();
     ctx.stroke();
  }
}

function ghost_get_frame(car) {
  var out = {
    chassiss: [],
    wheels: [],
    pos: {x: car.getPosition().x, y: car.getPosition().y}
  };

  for (var i=0; i< car.physics.chassiss.length; i++) {
     out.chassiss[i] = ghost_get_chassis(car.physics.chassiss[i]); // TODO: more than one chassis to show.)
  }
  for (var i = 0; i < car.physics.wheels.length; i++) {
    out.wheels[i] = ghost_get_wheel(car.physics.wheels[i]);
  }

  return out;
}

function ghost_get_chassis(c) {
  var gc = [];
  for (f = c.GetFixtureList(); f; f = f.m_next) {
    s = f.GetShape();

    var p = {
      vtx: [],
      num: 0
    }

    p.num = s.m_vertexCount;

    for (var i = 0; i < s.m_vertexCount; i++) {
      p.vtx.push(c.GetWorldPoint(s.m_vertices[i]));
    }

    gc.push(p);
  }

  return gc[0];
}

function ghost_get_wheel(w) {
  var gw = [];

  for (f = w.GetFixtureList(); f; f = f.m_next) {
    s = f.GetShape();
    if ('m_p' in s) {
      var ps = w.GetWorldPoint(s.m_p);
    } else {
      var ps = w.GetWorldPoint(s.m_centroid);
    }
    var c = {
      pos: ps,
      rad: s.m_radius,
      ang: w.m_sweep.a
    }

    gw.push(c);
  }

  return gw;
}

function ghost_draw_poly(ctx, vtx) {
  n_vtx = vtx.length;
  ctx.moveTo(vtx[0].x, vtx[0].y);
  for (var i = 1; i < n_vtx; i++) {
    ctx.lineTo(vtx[i].x, vtx[i].y);
  }
  ctx.lineTo(vtx[0].x, vtx[0].y);
}

function ghost_draw_circle(ctx, center, radius, angle) {
  ctx.beginPath();
  ctx.arc(center.x, center.y, radius, 0, 2 * Math.PI, true);

  ctx.moveTo(center.x, center.y);
  ctx.lineTo(center.x + radius * Math.cos(angle), center.y + radius * Math.sin(angle));

  ctx.fill();
  ctx.stroke();
}
