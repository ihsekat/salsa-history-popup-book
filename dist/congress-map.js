import {t} from './edition.js';
const continents=[
  [[-165,67],[-143,72],[-127,67],[-112,74],[-101,70],[-89,74],[-73,69],[-80,59],[-63,51],[-78,45],[-80,30],[-91,18],[-83,12],[-78,9],[-82,8],[-96,15],[-106,22],[-113,24],[-119,34],[-126,49],[-135,55],[-151,57],[-162,55]],
  [[-80,12],[-73,11],[-67,10],[-60,8],[-51,5],[-47,0],[-35,-6],[-39,-17],[-45,-24],[-54,-34],[-57,-39],[-66,-55],[-72,-50],[-75,-33],[-72,-20],[-77,-10],[-81,-3]],
  [[-56,60],[-50,65],[-45,77],[-28,82],[-18,75],[-30,68],[-44,60]],
  [[-10,36],[-9,43],[-2,47],[4,49],[8,54],[13,57],[5,60],[12,67],[23,70],[26,66],[28,59],[45,66],[64,69],[85,74],[102,73],[114,69],[134,72],[150,66],[169,65],[159,57],[142,54],[139,45],[130,42],[128,35],[121,30],[119,24],[109,19],[105,11],[100,8],[95,19],[88,22],[80,8],[76,10],[71,22],[61,23],[56,18],[48,13],[42,16],[35,29],[28,36],[21,38],[18,41],[14,38],[9,44],[7,44],[2,41],[0,38]],
  [[-17,16],[-14,27],[-8,35],[6,37],[15,33],[25,32],[34,30],[35,22],[43,12],[51,11],[50,4],[43,-5],[39,-15],[35,-26],[27,-34],[20,-34],[15,-26],[12,-15],[9,-3],[5,4],[-4,5],[-12,9]],
  [[112,-22],[117,-20],[121,-17],[126,-14],[132,-13],[137,-17],[142,-11],[146,-19],[153,-27],[149,-36],[140,-38],[135,-35],[128,-32],[118,-35],[113,-30]],
  [[128,31],[131,33],[134,34],[138,35],[140,40],[143,44],[145,43],[142,39],[140,35],[137,33],[133,32]]
];

export const regions=[
  {label:'US',lon:-118.24,lat:34.05,dx:-26,dy:-36},
  {label:'Europe',lon:13.40,lat:52.52,dx:-11,dy:-37},
  {label:'Asia',lon:139.69,lat:35.68,dx:21,dy:-36},
  {label:'South America',lon:-76.53,lat:3.45,dx:-12,dy:43},
  {label:'Africa',lon:18.42,lat:-33.92,dx:10,dy:39},
  {label:'Australia',lon:151.21,lat:-33.87,dx:-21,dy:40}
];

export function projectRegion(lon,lat){
  return [500+lon*2.6,270-lat*2.95];
}

export function drawCongressMap(onRoutes){
  const chart=document.createElement('canvas');
  chart.width=1000;chart.height=500;
  let ctx=chart.getContext('2d');
  ctx.fillStyle='#769a95';ctx.fillRect(0,0,chart.width,chart.height);
  ctx.strokeStyle='#91ada1';ctx.lineWidth=1.4;ctx.beginPath();
  for(let lon=-150;lon<=150;lon+=30){
    const [x]=projectRegion(lon,0);ctx.moveTo(x,0);ctx.lineTo(x,500);
  }
  for(let lat=-60;lat<=75;lat+=15){
    const [,y]=projectRegion(0,lat);ctx.moveTo(0,y);ctx.lineTo(1000,y);
  }
  ctx.stroke();
  for(const [i,outline] of continents.entries()){
    ctx.beginPath();
    outline.forEach(([lon,lat],index)=>{
      const [x,y]=projectRegion(lon,lat);
      if(index===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
    });
    ctx.closePath();ctx.fillStyle=i%2?'#c5c69a':'#d2cf9f';
    ctx.shadowColor='#4c655e';ctx.shadowOffsetY=3;ctx.fill();ctx.shadowOffsetY=0;
    ctx.strokeStyle='#a4a77c';ctx.lineWidth=1.4;ctx.stroke();
  }
  const points=regions.map(({lon,lat})=>projectRegion(lon,lat));
  // Control points keep the two shorter routes clear of the paper labels.
  const connections=[
    [0,1,340,35,0], [0,3,175,255,.04], [1,2,717,43,.16],
    [1,4,615,244,.22], [2,5,963,280,.30]
  ];
  function routes(target,progress,opacity=1){
    target.save();target.lineCap='round';target.globalAlpha=opacity;
    for(const [start,end,cx,cy,delay] of connections){
      const amount=Math.max(0,Math.min(1,(progress-delay)/.70));
      if(!amount)continue;
      const [x,y]=points[start],[u,v]=points[end];
      const ax=x+(cx-x)*amount,ay=y+(cy-y)*amount;
      const bx=cx+(u-cx)*amount,by=cy+(v-cy)*amount;
      const tipX=ax+(bx-ax)*amount,tipY=ay+(by-ay)*amount;
      target.beginPath();target.moveTo(x,y);target.quadraticCurveTo(ax,ay,tipX,tipY);
      target.setLineDash([]);target.lineWidth=8;target.strokeStyle='#e8d4a4';target.stroke();
      target.setLineDash([11,7]);target.lineWidth=5.5;target.strokeStyle='#844632';target.stroke();
      if(amount<1){
        target.beginPath();target.arc(tipX,tipY,4.5,0,2*Math.PI);
        target.fillStyle='#844632';target.fill();
      }
    }
    target.restore();
  }
  let refresh;
  if(onRoutes){
    const coast=document.createElement('canvas'),labels=document.createElement('canvas');
    for(const layer of [coast,labels]){layer.width=chart.width;layer.height=chart.height;}
    coast.getContext('2d').drawImage(chart,0,0);
    const map=ctx;ctx=labels.getContext('2d');
    refresh=(progress,opacity=1)=>{
      map.drawImage(coast,0,0);routes(map,progress,opacity);map.drawImage(labels,0,0);
    };
  }else routes(ctx,1);
  ctx.font='bold 28px Georgia, serif';
  ctx.textAlign='center';ctx.textBaseline='middle';
  for(const [i,{label,dx,dy}] of regions.entries()){
    const [x,y]=points[i],cx=x+dx,cy=y+dy,word=t(label).toUpperCase();
    const width=Math.ceil(ctx.measureText(word).width)+19;
    ctx.fillStyle='#5c6859';ctx.fillRect(cx-width/2+1,cy-16,width,36);
    ctx.fillStyle='#f2e4bf';ctx.fillRect(cx-width/2,cy-18,width,35);
    ctx.fillStyle='#263e3c';ctx.fillText(word,cx,cy+1);
    ctx.beginPath();ctx.arc(x,y,14,0,2*Math.PI);ctx.fillStyle='#733d32';ctx.fill();
    ctx.beginPath();ctx.arc(x,y,7,0,2*Math.PI);ctx.fillStyle='#f4c875';ctx.fill();
  }
  if(refresh){refresh(1);onRoutes(refresh);}
  return chart;
}
