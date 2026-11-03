// Educational traffic context only: no asserted identities, occupancy, count or speed on 1994-10-21.
export const TRAFFIC_LANES=[{y:-6.8,direction:1},{y:-2.3,direction:1},{y:2.3,direction:-1},{y:6.8,direction:-1}];
export const trafficAvailable=t=>Number.isFinite(t)&&(t>=0&&t<18||t>=94&&t<=100);
export function trafficPose(lane,index,clock){const l=TRAFFIC_LANES[lane],loop=336,gap=42,offset=index*gap+lane*11;return{x:((offset+Math.max(0,clock)*9*(lane%2?1.12:1))%loop-loop/2)*l.direction,y:l.y,z:20.34,yaw:l.direction===1?0:Math.PI,wheel:clock*9/.31,direction:l.direction};}
export function advanceTraffic(clock,dt,{running=true,available=true,hidden=false,reduced=false}={}){return clock+((running&&available&&!hidden&&!reduced)?Math.max(0,Math.min(.1,dt)):0);}
export const trafficText={
 label:{en:'Illustrative traffic',ko:'통행 예시',ja:'通行の例',zh:'示意交通',es:'Tráfico ilustrativo'},
 close:{en:'Traffic close-up',ko:'차량 확대',ja:'車両を拡大',zh:'车辆近景',es:'Acercar tráfico'},
 moving:{en:'Moving',ko:'움직임',ja:'走行',zh:'行驶',es:'En movimiento'},
 still:{en:'Freeze',ko:'정지',ja:'静止',zh:'静止',es:'Detener'},
 note:{en:'Normal traffic context · vehicle shapes, spacing and speed are illustrative. The historical date stays fixed while traffic runs.',ko:'정상 통행 예시 · 차량 형상·간격·속도는 추정입니다. 차량이 움직이는 동안 역사 날짜는 고정됩니다.',ja:'通常通行の例。車形・間隔・速度は推定です。交通の走行中も歴史上の日付は固定されます。',zh:'正常通行示意。车型、间距和速度为估计。车辆运动时历史日期保持不变。',es:'Contexto de circulación normal; formas, separación y velocidad ilustrativas. La fecha histórica queda fija mientras circulan los vehículos.'},
 inspection:{en:'Traffic is frozen for structural inspection. Select Road traffic / close-up to observe moving traffic at a fixed date.',ko:'구조 탐사 중에는 차량을 정지합니다. 움직이는 차량은 도로 통행·확대 지점에서 볼 수 있습니다.',ja:'構造観察中は車両を静止します。「道路の通行・拡大」で日時を固定した走行を観察できます。',zh:'结构观察期间车辆静止。请选择道路通行近景，在固定日期下观看行驶。',es:'El tráfico se detiene al inspeccionar estructuras. Seleccione Tráfico / primer plano para verlo circular con la fecha fija.'},
 unavailable:{en:'Normal traffic is paused here. The separate bus / vehicle fall follows the recorded order; vehicle shapes, motion and damage are estimated. No people are depicted.',ko:'정상 통행 예시는 중지됩니다. 별도의 버스·차량 추락은 기록의 순서를 따르며 형상·움직임·손상은 추정입니다. 사람은 표현하지 않습니다.',ja:'通常通行の例は停止します。別のバス・車両落下は記録の順序に従い、形状・動き・損傷は推定です。人物は描きません。',zh:'此阶段停止正常交通示意。另行展示的公交与车辆坠落遵循记录顺序，形状、运动和损伤为估计，不描绘人员。',es:'El tráfico normal se pausa. La caída del autobús y vehículos sigue el orden registrado; formas, movimiento y daños son estimados. No se representan personas.'}
};
