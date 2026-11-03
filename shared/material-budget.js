import * as THREE from 'three';
let lightweight=false;
export function configureMaterialBudget(renderer){const gl=renderer.getContext(),ext=gl.getExtension('WEBGL_debug_renderer_info'),gpu=ext?String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)):'';lightweight=innerWidth<600||/swiftshader|llvmpipe|software/i.test(gpu);renderer.userData={...(renderer.userData||{}),lightweight,gpu};return lightweight;}
export function surfaceMaterial(options={}){if(!lightweight)return new THREE.MeshStandardMaterial(options);const{roughness=.65,metalness=0,envMapIntensity,roughnessMap,metalnessMap,...rest}=options;return new THREE.MeshPhongMaterial({...rest,shininess:Math.max(8,(1-roughness)*72),specular:metalness>.1?'#647280':'#253443',reflectivity:metalness>.1?.22:.08});}

export function presentationPixelRatio(renderer){const software=/swiftshader|llvmpipe|software/i.test(renderer.userData?.gpu||'');const ratio=Math.min(devicePixelRatio||1,software?1:innerWidth<600?1.5:2);renderer.userData.pixelRatioBudget=ratio;return ratio;}
