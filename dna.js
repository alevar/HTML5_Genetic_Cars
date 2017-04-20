// Any changes to the DNA rules mean this file changes.
// TODO: refactor other dna-dependent stuff to here.

var minPolyRadius = 0.25;
var maxPolyRadius = 0.9;
var chassisMinDensity = 30;
var chassisMaxDensity = 300;

var wheelMaxRadius = 0.8;
var wheelMinRadius = 0.15;

var minDeltaAngleWt = 0.1; // the genome stores the change in angles. 
var maxDeltaAngleWt = 1.0;

var nPts = 6; // whenever there is a polygon.

var motorSpeed = 20;

var minAngleRad = 0.1;

// For now two polygons with one wheel.



////////////// Helpers //////////////

function rand_ab(a,b) {
   return a + (b-a)*Math.random();
}
function rand_iab(a,b) { // inclisvei, exclusive.
   return Math.floor(a + (b-a)*Math.random());
}
function polar2cart(r,a) {
   var out = new Object();
   var c = Math.cos(a); var s = Math.sin(a);
   out.x = c*r - s*r;
   out.y = s*r + c*r;
   return out;
}

function heads() {
  if (Math.random()>0.5) {return true};
  return false;
}

function danglews2angles(danglews){
   var n = danglews.length;
   var tw = 0.0;
   for (var i=0; i<n; i++) {
     tw = tw + danglews[i];
   }
   var angles = new Array();
   var acc = 0;
   for (var i=0; i<n; i++) {
     angles.push(acc);
     acc = acc + danglews[i]/tw*2.0*Math.PI; //acc ends up at 2pi, but the last angle pushed is below 2pi.
   }
   return angles;
}

////////////// Genetic part //////////////

function dna_random() {
  // Randomly makes a DNA car_def object.
  var dna = new Object();
  
  dna.bodies = new Array();
  dna.wheelAttachIx = new Array();
  dna.wheelRadius = new Array();
  
  for (var o = 0; o < 2; o++) {
    dna.bodies.push(new Object);
    dna.bodies[o].danglews = new Array();
    dna.bodies[o].radii = new Array();
	for (var i = 0; i < nPts; i++) {
        dna.bodies[o].radii.push(rand_ab(minPolyRadius, maxPolyRadius));
        dna.bodies[o].danglews.push(rand_ab(minDeltaAngleWt, maxDeltaAngleWt));
	}
	dna.wheelAttachIx.push(rand_iab(0,nPts));
	dna.wheelRadius.push(rand_ab(wheelMinRadius, wheelMaxRadius));
  }
  
  dna.wheelDensity = 70;
  dna.chassisDensity = rand_ab(chassisMinDensity, chassisMaxDensity);
  
  return dna;
}

function dna_copy_this_is_why_clojure_is_better(dna) {
  // just in case.
  var dna1 = new Object();
  dna1.bodies = new Array();
  dna1.wheelAttachIx = new Array();
  dna1.wheelRadius = new Array();
  for (var o = 0; o < 2; o++) {
    dna1.bodies.push(new Object);
    dna1.bodies[o].danglews = new Array();
    dna1.bodies[o].radii = new Array();
	for (var i = 0; i < nPts; i++) {
        dna1.bodies[o].radii.push(dna.bodies[o].radii[i]);
        dna1.bodies[o].danglews.push(dna.bodies[o].danglews[i]);
	}
	dna1.wheelAttachIx.push(dna.wheelAttachIx[o]);
	dna1.wheelRadius.push(dna.wheelRadius[o]);
  } 
  dna1.wheelDensity = dna.wheelDensity;
  dna1.chassisDensity = dna.chassisDensity;
  return dna1;
}

function dna_mutate(dna0, rate) {
  var dna = dna_copy_this_is_why_clojure_is_better(dna0);
  for (var o = 0; o < dna.wheelAttachIx.length; o++) {
     if(Math.random()<rate) {
       dna.wheelAttachIx[o] = rand_iab(0,nPts);
     }
  }
  for (var o = 0; o < dna.wheelRadius.length; o++) {
     if(Math.random()<rate) {
       dna.wheelRadius[o] = rand_ab(wheelMinRadius, wheelMaxRadius);
     }
  }
  for (var o = 0; o < dna.bodies.length; o++) {
     for (var i = 0; i < dna.bodies[o].danglews.length; i++) {
		 if(Math.random()<rate) {
		     dna.bodies[o].danglews[i] = rand_ab(minDeltaAngleWt, maxDeltaAngleWt);
		 }
     }
     for (var i = 0; i < dna.bodies[o].radii.length; i++) {
		 if(Math.random()<rate) {
		     dna.bodies[o].radii[i] = rand_ab(minPolyRadius, maxPolyRadius);
		 }
     }
  }  
  dna.chassisDensity = (1.0-rate)*dna0.chassisDensity + rate*rand_ab(chassisMinDensity, chassisMaxDensity);
  return dna;
}

function dna_makeChild(dna1, dna2) {
  var dna3 = new Object();
  dna3.wheelAttachIx = new Array();
  dna3.wheelRadius = new Array();
  dna3.bodies = new Array();
  for (var o = 0; o < dna1.wheelAttachIx.length; o++) {
     if(heads()) {dna3.wheelAttachIx[o] = dna1.wheelAttachIx[o]}
     else {dna3.wheelAttachIx[o] = dna2.wheelAttachIx[o]}
  }
  for (var o = 0; o < dna1.wheelRadius.length; o++) {
     if(heads()) {dna3.wheelRadius[o] = dna1.wheelRadius[o]}
     else {dna3.wheelRadius[o] = dna2.wheelRadius[o]}
  }
  for (var o = 0; o < dna1.bodies.length; o++) {
     dna3.bodies[o] = new Object();
     dna3.bodies[o].danglews = new Array();
     dna3.bodies[o].radii = new Array();
     for (var i = 0; i < dna1.bodies[o].danglews.length; i++) {
         if (heads()) {
            dna3.bodies[o].danglews[i] = dna1.bodies[o].danglews[i];
         }
         else {
            dna3.bodies[o].danglews[i] = dna2.bodies[o].danglews[i];
         }
         if (heads()) {
            dna3.bodies[o].radii[i] = dna1.bodies[o].radii[i];
         }
         else {
            dna3.bodies[o].radii[i] = dna2.bodies[o].radii[i];
         }
     }
  }  
  if (Math.random()<0.5) {
    dna3.wheelDensity = dna1.wheelDensity;
  }
  else {
    dna3.wheelDensity = dna2.wheelDensity;
  }
  if (Math.random()<0.5) {
    dna3.chassisDensity = dna1.chassisDensity;
  }
  else {
    dna3.chassisDensity = dna2.chassisDensity;
  }
  return dna3;
}


////////////// BOX 2D interface part //////////////

function makePolygon(radii, angles, density) {

  var body_def = new b2BodyDef();
  body_def.type = b2Body.b2_dynamicBody;
  body_def.position.Set(0.0, 0.0);

  var body = world.CreateBody(body_def);

  var b2verts = new Array();
  for (var i = 0; i < angles.length; i++) {
     var pt = polar2cart(radii[i], angles[i]);
     b2verts.push(b2Vec2.Make(pt.x, pt.y));
  }
  
  b2verts.push(b2verts[0]); // wrap around.
  for (var i = 1; i < b2verts.length; i++) {
	  var fix_def = new b2FixtureDef();
	  fix_def.shape = new b2PolygonShape();
	  fix_def.density = density;
	  fix_def.friction = 0.5;
	  fix_def.restitution = 0.0;
	  fix_def.filter.groupIndex = -1;
	  var b2verts1 = new Array();
	  b2verts1[0] = b2Vec2.Make(0.0,0.0);
	  b2verts1[1] = b2verts[i-1];
	  b2verts1[2] = b2verts[i];
	  fix_def.shape.SetAsArray(b2verts1, 3);
	  body.CreateFixture(fix_def);
  }

  return body;
}

function makeWheel(radius, density, squareDisease) {
  var body_def = new b2BodyDef();
  body_def.type = b2Body.b2_dynamicBody;
  body_def.position.Set(0, 0);

  var body = world.CreateBody(body_def);

  var fix_def = new b2FixtureDef();
  if (!squareDisease) {
    fix_def.shape = new b2CircleShape(radius);
  } else {
    fix_def.shape = new b2PolygonShape();
    var coords = new Array();
    coords.push(new b2Vec2(radius, -radius));
    coords.push(new b2Vec2(radius, radius));
    coords.push(new b2Vec2(-radius, radius));
    coords.push(new b2Vec2(-radius, -radius));

    fix_def.shape.SetAsArray(coords);
  }
  fix_def.density = density;
  fix_def.friction = 1;
  fix_def.restitution = 0.0;
  fix_def.filter.groupIndex = -1;

  body.CreateFixture(fix_def);
  return body;
}

function dna_to_physics(dna, squareWheelDisease) {

  // Makes the box2D object.
  height = 0.1;
 
  chassiss = new Array();
  for (var i = 0; i < dna.bodies.length; i++) {
     var angles = danglews2angles(dna.bodies[i].danglews);
     chassiss.push(makePolygon(dna.bodies[i].radii, angles, dna.chassisDensity));
  }

  wheels = new Array();
  for (var i = 0; i < dna.wheelRadius.length; i++) {
    wheels[i] = makeWheel(dna.wheelRadius[i], dna.wheelDensity, squareWheelDisease);
  }

  var carmass = 0.0;
  
  for (var i = 0; i < wheels.length; i++) {
     carmass = carmass + wheels[i].GetMass();
  }
  for (var i = 0; i < chassiss.length; i++) {
     carmass = carmass + chassiss[i].GetMass();
  }
  
  var torque = [];
  for (var i = 0; i < wheels.length; i++) {
    torque[i] = carmass * 9.81 / dna.wheelRadius[i]; // torque suited to earth gravity.
  }

  var lowPt = 123456.7;
  for (var i = 0; i < dna.wheelAttachIx.length; i++) {
    var angles = danglews2angles(dna.bodies[i].danglews);
    var joint_def = new b2RevoluteJointDef();
    var attachment = polar2cart(dna.bodies[i].radii[dna.wheelAttachIx[i]], angles[dna.wheelAttachIx[i]]); //TODO fix
    joint_def.localAnchorA.Set(attachment.x, attachment.y);
    joint_def.localAnchorB.Set(0, 0);
    // Unnessessary: joint_def.collideConnected = false;
    joint_def.maxMotorTorque = torque[i];
    joint_def.motorSpeed = -20;//-motorSpeed;
    joint_def.enableMotor = true;
    joint_def.bodyA = chassiss[i];
    joint_def.bodyB = wheels[i];
    wheels[i].SetPosition(b2Vec2.Make(attachment.x, attachment.y)); // Set so the joint isn't stretched (more important for the positioning on the road)
    lowPt = Math.min(lowPt,attachment.y-dna.wheelRadius[i]);
    var joint = world.CreateJoint(joint_def);
  }
  
  // Attach the two pieces:
  var joint_def = new b2RevoluteJointDef();
  var angles0 = danglews2angles(dna.bodies[0].danglews);
  var angles1 = danglews2angles(dna.bodies[1].danglews);
  var attachmentA = polar2cart(dna.bodies[0].radii[0], angles0[0]);
  var attachmentB = polar2cart(dna.bodies[1].radii[0], angles1[0]); 
  joint_def.localAnchorA.Set(attachmentA.x, attachmentA.y);
  joint_def.localAnchorB.Set(attachmentB.x, attachmentB.y);
  
  // Unnessessary: joint_def.collideConnected = false;
  joint_def.enableMotor = false;
  joint_def.bodyA = chassiss[0];
  joint_def.bodyB = chassiss[1];
  
  // Set so the joint isn't stretched (more important for the positioning on the road):
  chassiss[0].SetPosition(b2Vec2.Make(0.0, 0.0)); 
  chassiss[1].SetPosition(b2Vec2.Make(attachmentA.x-attachmentB.x, attachmentA.y-attachmentB.y)); 
    
  world.CreateJoint(joint_def);
  
  // Find the lowest point:
  for (var o=0; o<dna.bodies.length; o++) {
     var angles = danglews2angles(dna.bodies[o].danglews);
     for (var i = 0; i < dna.bodies[o].radii.length; i++) {
         var xyLocal = polar2cart(dna.bodies[o].radii[i], angles[i]);
         lowPt = Math.min(lowPt, xyLocal.y + chassiss[o].GetPosition().y);
     }
  }
  
  // Change the height:
  var shiftUp = height - lowPt;
  for (var o=0; o<chassiss.length; o++) {
     var pos = chassiss[o].GetPosition();
     chassiss[o].SetPosition(b2Vec2.Make(pos.x, pos.y + shiftUp)); 
  }
  for (var o=0; o<wheels.length; o++) {
     var pos = wheels[o].GetPosition();
     wheels[o].SetPosition(b2Vec2.Make(pos.x, pos.y + shiftUp));
  } 
  
  var out = new Object();
  out.chassiss = chassiss;
  out.wheels = wheels;
    
  return out;
}




