// Public observation window, not a population/growth simulation. Positions/counts/sizes are illustrative.
import {barToTime} from './chapters.js';
export const ECO_SOURCES=[
 {title:'Cleland et al. 2025 · Titanic wreck fauna (distinct from Seamount U)',url:'https://doi.org/10.1016/j.dsr.2025.104544'},
 {title:'University of Edinburgh · author publication record',url:'https://www.research.ed.ac.uk/en/publications/megafauna-of-the-rms-titanic-shipwreck-and-a-nearby-seamount-ridg/'},
 {title:'NOAA · light penetration',url:'https://oceanservice.noaa.gov/facts/light_travel.html'},
];
export function ecologyAvailable(model,t){const year=new Date(barToTime(model,t)).getUTCFullYear();return year>=1986&&year<=2022;}
export function ecologyMode(model,st){return ecologyAvailable(model,st.t)&&st.style==='color'&&!st.xray;}
// Motion is in playback seconds, independent of calendar years and unchanged by camera/style changes.
export function fishPose(clock,index=0){const a=clock*.095+index*2.1;return {offset:[Math.sin(a)*2.4,Math.cos(a)*1.5,Math.sin(a*.4)*.12],heading:Math.atan2(-1.5*Math.sin(a),2.4*Math.cos(a)),tail:Math.sin(clock*2.6+index)*.20};}
export function snowPoint(seed,clock,span){const [a,b,c]=seed;return [(a-.5)*span+Math.sin(clock*.07+b*6)*span*.025,(b-.5)*span,((c-clock*.012/span)%1+1)%1*span-span*.5];}
export function scaleBar(ppm,limit=120){const values=[.001,.002,.005,.01,.02,.05,.1,.2,.5,1,2,5,10,20,50,100];return values.filter(n=>n*ppm<=limit).at(-1)||.001;}
