// Independently authored spherical patches, not digitised survey coordinates.
// The common-sphere construction is documented; this 75 m working radius,
// patch boundaries, placement and all erection increments are model assumptions.
export const ROOF_RADIUS=75;
const add=(a,b)=>a.map((x,i)=>x+b[i]),sub=(a,b)=>a.map((x,i)=>x-b[i]),mul=(a,s)=>a.map(x=>x*s),dot=(a,b)=>a.reduce((n,x,i)=>n+x*b[i],0),cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],norm=a=>mul(a,1/Math.hypot(...a));
export function sphericalPatch(w,length,height,side=1){
 const a=[0,-length/2,12],b=[0,length/2,12+height],c=[side*w,length*.42,12];
 const u=sub(b,a),v=sub(c,a),n=cross(u,v),n2=dot(n,n);
 const cc=add(a,mul(add(mul(cross(v,n),dot(u,u)),mul(cross(n,u),dot(v,v))),1/(2*n2)));
 const cr=Math.hypot(...sub(a,cc));if(cr>ROOF_RADIUS)throw Error('Patch exceeds common sphere');
 let axis=norm(n);if(axis[2]>0)axis=mul(axis,-1);const center=add(cc,mul(axis,Math.sqrt(ROOF_RADIUS**2-cr**2)));
 const arc=(p,q,t)=>{const p0=norm(sub(p,center)),q0=norm(sub(q,center)),omega=Math.acos(Math.max(-1,Math.min(1,dot(p0,q0))));if(omega<1e-8)return p;return add(center,mul(add(mul(p0,Math.sin((1-t)*omega)),mul(q0,Math.sin(t*omega))),ROOF_RADIUS/Math.sin(omega)));};
 return{center,point:(u,v)=>arc(a,arc(b,c,v),u)};
}
export const ROOF_SPECS=[
 // x,y,width,run,rise,orientation; paired half-shells, not a measured shell inventory.
 [-25,34,22,62,55,1,-.035],[-25,0,21,52,43,1,-.035],[-25,-28,18,39,28,1,-.035],[-25,-39,15,27,18,-1,-.035],
 [24,30,19,56,44,1,.055],[24,0,18,46,34,1,.055],[24,-26,16,35,24,1,.055],[24,-38,13,25,16,-1,.055],
 [39,-57,12,23,14,-1,.16]
];
export function placedPatch(spec,side){const[x,y,w,len,h,sgn,angle]=spec,p=sphericalPatch(w,len,h,side);const place=([a,b,z])=>[x+a*Math.cos(angle)-b*sgn*Math.sin(angle),y+a*Math.sin(angle)+b*sgn*Math.cos(angle),z];return{center:place(p.center),point:(u,v)=>place(p.point(u,v))};}
