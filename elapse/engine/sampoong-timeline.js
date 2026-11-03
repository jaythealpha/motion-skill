import {studyState,smooth} from './sampoong-study-motion.js';
// The dated timeline keeps its original chapters. This maps them to observation choreography.
export function sampoongProgress(t){const keys=[[0,0],[12,.12],[32,.265],[54,.9],[58,.96],[100,1]];t=Math.max(0,Math.min(100,t));for(let i=1;i<keys.length;i++)if(t<=keys[i][0]){const[a,p]=keys[i-1],[b,q]=keys[i];return p+(q-p)*(t-a)/(b-a);}return 1;}
export function sampoongView(t,width){const p=sampoongProgress(t),b=studyState(p).camera,after=smooth((p-.75)/.2),mix=(a,c,v)=>a+(c-a)*v,narrow=width<600;
 return{box:narrow?{min:[mix(-35,mix(-23,-32,after),b),mix(-18,-5,b),mix(-2,-9,b)],max:[mix(38,mix(23,34,after),b),19,28]}:{min:[mix(-54,mix(-25,-53,after),b),mix(-27,mix(-5,-27,after),b),mix(-2,-10,b)],max:[mix(103,mix(25,102,after),b),mix(29,mix(18,29,after),b),28]},yaw:mix(236,257,b),pitch:mix(23,11,b)+after*10};
}
