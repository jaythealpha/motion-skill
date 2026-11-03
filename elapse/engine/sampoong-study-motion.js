// Observation-time choreography. No computed failure capacities or measured fall durations.
export const clamp=x=>Math.max(0,Math.min(1,x));
export const smooth=x=>{x=clamp(x);return x*x*(3-2*x);};
export const seed=n=>{const a=Math.sin(n*127.1+311.7)*43758.5453;return a-Math.floor(a);};
export const LEVELS=[{id:'second',z:4.4,start:.56},{id:'third',z:8.8,start:.48},{id:'fourth',z:13.2,start:.40},{id:'fifth',z:17.6,start:.31},{id:'roof',z:22.4,start:.265}];
export function slabPose(level,x,y,p,n=0){const k=LEVELS[level],distance=Math.hypot((x+6.5)/39,y/27),onset=k.start+Math.min(.09,distance*.065)+seed(n+11)*.012,d=clamp((p-onset)/.225),drop=d*d,settle=-4.8+level*.54+seed(n+19)*.6,distress=level===3?Math.sin(Math.PI*clamp((p-.12)/.23))*.36*Math.exp(-((x+6.5)**2+y*y)/250):0;const freeZ=k.z+(settle-k.z)*drop-distress,lower=level>0?slabPose(level-1,x,y,p,n-72).z+.38:-Infinity;return {onset,d,z:Math.max(freeZ,lower),x:x+(seed(n+7)-.5)*3*drop,y:y+(seed(n+9)-.5)*3*drop,rx:drop*(seed(n+31)-.5)*.65,ry:drop*(seed(n+42)-.5)*.8,rz:drop*(seed(n+13)-.5)*.28};}
export function studyState(p){p=clamp(p);return {p,phase:p<.18?0:p<.36?1:p<.77?2:3,section:smooth((p-.16)/.095),camera:smooth((p-.15)/.18),dust:smooth((p-.45)/.2)*(1-smooth((p-.85)/.15)),layers:LEVELS.map((k,i)=>{const a=slabPose(i,-6.5,0,p,i);return a.d===0?0:a.d===1&&slabPose(0,-6.5,0,p,i-i*72).d===1?2:1;})};}
export function advanceStudy(p,dt,speed=1){for(let e=0;e<dt;e+=.005){const d=Math.min(.005,dt-e),rate=p>=.25&&p<.76?.48:1;p=Math.min(1,p+d/28*speed*rate);}return p;}
