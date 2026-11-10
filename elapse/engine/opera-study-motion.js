// Authored inspection-camera cuts, independent of historical time and model variant.
const smooth=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);},mix=(a,b,t)=>a+(b-a)*t;
export function studyCamera(seconds,aspect=1.6){
 const t=Math.max(0,Math.min(36,seconds));let eye,target,interior=false;
 if(t<12){const u=smooth(t/12);eye=[mix(175,130,u),mix(-215,-160,u),mix(110,85,u)];target=[0,5,27];}
 else if(t<25){const u=smooth((t-12)/13);eye=[mix(-125,-105,u),mix(-38,-8,u),mix(108,98,u)];target=[-25,13,40];}
 else{const u=smooth((t-25)/11);eye=[mix(-25,-22,u),mix(48,32,u),mix(35,29,u)];target=[-25,-17,19.7];interior=true;}
 if(aspect<1.1){const factor=interior?1.15:1.4;eye=eye.map((x,i)=>target[i]+(x-target[i])*factor);}
 return{eye,target,interior,shot:t<12?'overview':t<25?'shells':'hall'};
}
