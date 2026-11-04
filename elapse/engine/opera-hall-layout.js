// Estimated seating bowl. These are model coordinates, never a venue seating plan.
export const HALL_FLOOR=13,STAGE_Y=-22;
export function hallRow(row){return{y:-14+row*1.7,z:HALL_FLOOR+Math.max(0,row-3)*.235,width:12+Math.sin(row/24*Math.PI)*3};}
export function rowY(row,x){const q=hallRow(row);return q.y-3.4*(x/q.width)**2;}
export function hallSeat(row,x){const q=hallRow(row),y=rowY(row,x),angle=Math.atan2(-x,y-STAGE_Y);return{x,y,z:q.z,angle,backX:x-.28*Math.sin(angle),backY:y+.28*Math.cos(angle)};}
// Ordered polygon for the curved tread shared by that row's chairs and aisles.
export function rowOutline(row){const q=hallRow(row),points=[];for(let i=0;i<=40;i++){const x=-q.width+2*q.width*i/40;points.push([x,rowY(row,x)-.855]);}for(let i=40;i>=0;i--){const x=-q.width+2*q.width*i/40;points.push([x,rowY(row,x)+.855]);}return points;}
export function riserOutline(outer,inner){const points=[];for(let i=0;i<=36;i++){const a=Math.PI+i/36*Math.PI;points.push([Math.cos(a)*outer,STAGE_Y+2+Math.sin(a)*outer*.8]);}for(let i=36;i>=0;i--){const a=Math.PI+i/36*Math.PI;points.push([Math.cos(a)*inner,STAGE_Y+2+Math.sin(a)*inner*.8]);}return points;}
