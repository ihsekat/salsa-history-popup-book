const paper = {
  edge: '#f4dfb1',
  parchment: '#e5c98e',
  ochre: '#d59a44',
  amber: '#e6ad51',
  glow: '#ffe3a1',
  coral: '#ca6650',
  red: '#a84439',
  wine: '#663831',
  brick: '#aa614a',
  espresso: '#47382f',
  midnight: '#224443',
  blue: '#426463',
  jade: '#68847a',
  shadow: '#334640',
  glass: '#91a59a',
};

function downstageSkyline(k, x, z, heights, shade) {
  const g = k.anchor(x, z);
  const step = 0.64;
  const start = -heights.length * step / 2;
  const silhouette = [[start, 0]];
  heights.forEach((h, i) => {
    const a = start + i * step;
    silhouette.push([a, h], [a + step * 0.2, h], [a + step * 0.2, h + 0.14],
      [a + step * 0.75, h + 0.14], [a + step * 0.75, h], [a + step, h]);
  });
  silhouette.push([start + heights.length * step, 0]);
  k.card(g, silhouette, shade, 0, 0.04);
  const lit=new k.THREE.Color(paper.glow),dim=new k.THREE.Color(paper.blue);
  heights.forEach((h,i)=>{
    if(i%2)return;
    for(const [j,offset] of [.42,.72].entries()){
      const pane=k.box(g,start+(i+offset)*step,h*.67,.05,.095,.20,.012,paper.jade);
      const rest=new k.THREE.Color(j?paper.jade:paper.parchment);
      pane.material=new k.THREE.MeshBasicMaterial({color:rest});
      k.motions.push((seconds,strength)=>{
        const level=k.THREE.MathUtils.smoothstep(Math.cos(seconds*Math.PI/4+i*1.3+j*2),-.55,.55);
        pane.material.color.copy(dim).lerp(lit,level).lerp(rest,1-strength);
      });
    }
  });
}

function musicStand(k, x, z) {
  const g = k.anchor(x, z);
  k.rod(g, [0, .05, 0], [0, 1.09, 0], .031, paper.midnight);
  k.rod(g, [0, .19, 0], [-.25, 0, .12], .026, paper.midnight);
  k.rod(g, [0, .19, 0], [.25, 0, .12], .026, paper.midnight);
  k.box(g, 0, 1.05, 0, .72, .44, .06, paper.midnight, -.045);
  k.card(g, [[-.29, .91], [-.03, .94], [-.02, 1.22], [-.29, 1.19]], paper.parchment, .043);
  k.card(g, [[-.012, .94], [.26, .91], [.27, 1.18], [.004, 1.22]], paper.edge, .043);
  for (let i = 0; i < 3; i++) {
    k.box(g, -.151, 1.10 - i * .045, .075, .18, .009, .008, paper.blue);
    k.box(g, .13, 1.10 - i * .045, .075, .16, .009, .008, paper.blue);
  }
}

function bass(k, x, z) {
  const g = k.anchor(x, z);
  const instrument = k.group(g, 0, 0, 0);
  instrument.rotation.z = -.11;
  k.rod(instrument, [0, 0, 0], [0, .28, 0], .022, paper.midnight);
  const outline = [[0,.18],[-.25,.2],[-.39,.34],[-.43,.52],[-.37,.70],[-.23,.81],
    [-.24,.92],[-.32,1.04],[-.31,1.20],[-.18,1.30],[-.075,1.32],[-.06,1.49],
    [.06,1.49],[.10,1.32],[.22,1.28],[.33,1.16],[.33,1.04],[.23,.91],
    [.23,.81],[.39,.69],[.44,.52],[.4,.33],[.26,.21]];
  k.card(instrument, outline, paper.ochre, 0, .12);
  k.card(instrument, [[0,.2],[-.25,.21],[-.38,.35],[-.4,.49],[-.24,.43],[-.10,.53]], '#bd793d', .125);
  k.card(instrument, [[-.058,1.86],[-.09,1.08],[-.065,.88],[.04,.87],[.066,1.83]], paper.espresso, .14);
  k.box(instrument, .005, 1.94, .08, .14, .26, .08, '#98643b', -.04);
  k.disc(instrument, .007, 2.06, .15, .082, paper.ochre, 8);
  k.card(instrument, [[-.08,.46],[.08,.46],[.029,.27],[-.024,.27]], paper.espresso, .146);
  k.box(instrument, 0, .625, .155, .20, .045, .03, paper.edge);
  [-.027, .018].forEach(s => k.rod(instrument, [s,.42,.18],[s,1.98,.18],.006,paper.edge,4));
  [-1, 1].forEach(s => {
    k.rod(instrument, [s * .19,.75,.15],[s * .158,.61,.15],.012,paper.espresso,4);
    k.disc(instrument, s * .19,.75,.16,.023,paper.espresso,8);
  });
}

function timbales(k, x, z) {
  const g = k.anchor(x, z);
  k.rod(g, [0, .05, 0], [0, 1.02, 0], .034, paper.midnight);
  [-1, 1].forEach((s) => {
    k.rod(g, [0,.34,0],[s * .38,.01,.10],.027,paper.midnight);
    const drum = k.group(g, s * .27, 1.00 + (s + 1) * .032, 0);
    drum.rotation.x = .08;
    const mesh = new k.THREE.Mesh(new k.THREE.CylinderGeometry(.285,.247,.30,12),
      new k.THREE.MeshStandardMaterial({color: s < 0 ? paper.jade : paper.ochre, roughness:1, flatShading:true}));
    mesh.castShadow = true;
    drum.add(mesh);
    const head = k.disc(drum, 0, .16, 0, .285, paper.edge, 12);
    head.rotation.x = -Math.PI / 2;
    k.box(drum, 0, .119, .252, .35, .035, .023, paper.parchment);
    k.box(drum, 0, -.104, .232, .31, .022, .023, paper.parchment);
  });
  k.rod(g, [-.03,1.19,-.13],[.10,1.4,-.13],.024,paper.espresso);
  k.card(g, [[-.03,1.38],[.28,1.34],[.29,1.45],[.03,1.45]],paper.espresso,-.11,.10);
}

function stageCurtain(k, proscenium, side) {
  const g = k.group(proscenium, side * 1.75, .36, .24);
  g.scale.x = -side;
  k.card(g, [[-.16,0],[.38,0],[.30,.35],[.19,.72],[.36,.91],[.66,1.25],[.90,1.69],[-.16,1.69]],
    paper.red,0,.06);
  k.card(g, [[-.12,.03],[.047,.01],[.095,.68],[.52,1.64],[.24,1.65],[-.04,.67]],paper.coral,.075);
  k.card(g, [[.18,.02],[.33,.025],[.23,.65],[.70,1.64],[.56,1.63],[.16,.69]],paper.wine,.076);
  k.box(g,.095,.71,.11,.34,.064,.048,paper.ochre,-.11);
}

export function palladium(k) {
  downstageSkyline(k, -3.35, -2.69, [1.07, 1.66, 1.24, 1.86, 1.53, 1.05, .85], '#566e63');
  const stage = k.anchor(2.80,-1.60);
  k.box(stage,0,1.12,0,4.52,2.24,.26,paper.espresso);
  k.box(stage,0,1.13,.17,4.21,2.01,.075,paper.midnight);
  k.card(stage,[[-1.93,.34],[-1.16,.34],[.30,1.84],[-.12,1.84]],paper.blue,.221);
  k.card(stage,[[-.80,.34],[-.48,.34],[.73,1.83],[.63,1.83]],'#506e63',.222);
  k.card(stage,[[1.75,.34],[1.09,.34],[-.15,1.83],[.13,1.83]],'#3d5852',.223);
  stageCurtain(k, stage, -1);
  stageCurtain(k, stage, 1);
  k.box(stage,0,.13,.43,4.73,.26,1.05,'#8c5d40');
  k.box(stage,0,.22,.47,4.79,.085,1.11,paper.parchment);
  k.box(stage,0,.11,1.04,2.23,.15,.32,paper.ochre);
  k.box(stage,0,.046,1.23,2.54,.08,.20,paper.parchment);
  [-1, 1].forEach(s => {
    k.box(stage,s*2.20,1.34,.22,.31,2.66,.39,paper.jade);
    k.box(stage,s*2.20,1.36,.438,.17,2.53,.05,paper.parchment);
    k.box(stage,s*2.20,1.37,.471,.055,2.38,.018,paper.ochre);
    k.box(stage,s*2.18,.24,.33,.49,.42,.49,paper.midnight);
    k.box(stage,s*2.18,.47,.34,.42,.065,.51,paper.parchment);
  });
  k.card(stage, [[-2.44,2.05],[-2.44,2.66],[-1.97,2.66],[-1.97,2.83],[-1.33,2.83],[-1.33,2.96],[-.75,2.96],[-.75,3.12],[-.35,3.12],[0,3.43],[.35,3.12],[.75,3.12],[.75,2.96],[1.33,2.96],[1.33,2.83],[1.97,2.83],[1.97,2.66],[2.44,2.66],[2.44,2.05]], paper.midnight,.32,.22);
  k.card(stage, [[-.66,2.87],[-.34,3.0],[0,3.32],[.34,3],[.66,2.87],[0,3.13]], paper.parchment,.555);
  k.card(stage, [[-.28,2.86],[0,3.06],[.28,2.86]], paper.coral,.556);
  k.box(stage,0,2.45,.55,4.61,.70,.15,paper.ochre);
  k.box(stage,0,2.45,.65,4.48,.58,.08,paper.edge);
  k.label(stage,'PALLADIUM',0,2.47,.718,3.74,.53,{bg:null,ink:paper.midnight,font:'Georgia',tracking:.035});
  k.box(stage,0,2.05,.49,2.57,.29,.18,paper.coral);
  k.label(stage,'BALLROOM',0,2.05,.60,1.96,.205,{bg:null,ink:paper.edge,font:'Georgia',tracking:.085});
  k.box(stage,0,1.78,.49,3.82,.23,.15,paper.midnight);
  k.label(stage,'MACHITO  ·  TITO PUENTE  ·  TITO RODRÍGUEZ',0,1.78,.58,3.60,.145,{ink:paper.parchment});
  for (let i = -4; i <= 4; i++) {
    k.disc(stage,i*.51,2.775,.657,.028,paper.glow,8);
  }
  [-2.13,2.13].forEach(x => k.disc(stage,x,2.46,.705,.077,paper.amber,10));
  bass(k,-4.11,-.59);
  timbales(k,-2.77,-.87);
  musicStand(k,-1.95,-.39);
}
