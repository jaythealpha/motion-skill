// Independent diagram geometry. Reference envelope 125m × 125m / 300m; internal profiles estimated.
export const PROFILE=[[0,62.5],[15,54],[35,43],[57,35],[80,28],[115,20.5],[150,15.8],[190,11.8],[230,8.5],[276,4.7],[288,3.4],[300,1]];
export function halfWidth(z){for(let i=1;i<PROFILE.length;i++)if(z<=PROFILE[i][0]){const [a,x]=PROFILE[i-1],[b,y]=PROFILE[i];return x+(y-x)*(z-a)/(b-a);}return 1;}
const legWidth=z=>25+(6-25)*Math.min(1,z/115);
export function eiffelMembers(){const list=[],add=(a,b,w,group='steel')=>{if(Math.hypot(...b.map((v,i)=>v-a[i]))>1e-5)list.push({a,b,w,group});},corner=(z,sx,sy,u,v)=>{const w=legWidth(z),c=halfWidth(z)-w/2;return[sx*c+u*w/2,sy*c+v*w/2,z];};
 for(const sx of [-1,1])for(const sy of [-1,1])for(let z=0;z<115;z+=5){const top=Math.min(115,z+5),w=.5-(z/115)*.23;for(const [u,v] of [[-1,-1],[1,-1],[1,1],[-1,1]])add(corner(z,sx,sy,u,v),corner(top,sx,sy,u,v),w*1.4);
  for(const [[u,v],[U,V]] of [[[-1,-1],[1,-1]],[[1,-1],[1,1]],[[1,1],[-1,1]],[[-1,1],[-1,-1]]]){add(corner(z,sx,sy,u,v),corner(z,sx,sy,U,V),w);add(corner(z,sx,sy,u,v),corner(top,sx,sy,U,V),w*.55);add(corner(z,sx,sy,U,V),corner(top,sx,sy,u,v),w*.55);}}
 for(let z=115;z<294;z+=6){const top=Math.min(294,z+6),a=halfWidth(z),b=halfWidth(top),sides=[[[a,a,z],[-a,a,z],[b,b,top],[-b,b,top]],[[a,-a,z],[-a,-a,z],[b,-b,top],[-b,-b,top]],[[a,a,z],[a,-a,z],[b,b,top],[b,-b,top]],[[-a,a,z],[-a,-a,z],[-b,b,top],[-b,-b,top]]];for(const [A,B,C,D] of sides){add(A,C,.38);add(A,B,.24);add(A,D,.19);add(B,C,.19);}}
 for(const side of [-1,1])for(const axis of [0,1]){const arc=[];for(let j=0;j<=32;j++){const x=-43+86*j/32,z=49-35*(x/43)**2,pt=axis?[side*halfWidth(z),x,z]:[x,side*halfWidth(z),z];arc.push(pt);if(j)add(arc[j-1],pt,.68,'arch');if(j%2===0){const end=[...pt];end[2]=55;add(pt,end,.22,'arch');}}}
 for(const [z,width,group] of [[57,70,'first'],[115,41,'second'],[276,10,'crown']]){const a=width/2;for(const y of [-a,a]){add([-a,y,z],[a,y,z],1.1,group);for(let x=-a;x<a;x+=2.5){add([x,y,z],[x,y,z+1.5],.13,group);add([x,y,z+1.5],[Math.min(a,x+2.5),y,z+1.5],.13,group);}}for(const x of [-a,a]){add([x,-a,z],[x,a,z],1.1,group);for(let y=-a;y<a;y+=2.5){add([x,y,z],[x,y,z+1.5],.13,group);add([x,y,z+1.5],[x,Math.min(a,y+2.5),z+1.5],.13,group);}}for(let x=-a;x<=a;x+=3)add([x,-a,z-.8],[x,a,z-.8],.25,group);}
 for(const x of [-2,2])for(const y of [-2,2])add([x,y,288],[0,0,300],.27,'crown');
 // Construction aids: diagrammatic positions, not surveyed scaffold locations.
 for(const a of [-1,1])for(const b of [-1,1])for(const u of [-1,0,1]){const x=a*(32+u*7),y=b*32,H=30;for(const dx of [-1.4,1.4])for(const dy of [-1.4,1.4]){add([x+dx,y+dy,0],[x+dx,y+dy,H],.24,'scaffold');for(let z=0;z<H;z+=5)add([x-1.4,y+dy,z],[x+1.4,y+dy,z+5],.16,'scaffold');}add([x-2,y,H],[x+2,y,H],.5,'scaffold');}
 for(const x of [-14,14])for(const y of [-14,14]){for(const dx of [-2,2])for(const dy of [-2,2]){add([x+dx,y+dy,0],[x+dx,y+dy,40],.28,'scaffold');for(let z=0;z<40;z+=5)add([x-2,y+dy,z],[x+2,y+dy,z+5],.2,'scaffold');}add([x-2.5,y,40],[x+2.5,y,40],.6,'scaffold');}
 return list;
}
