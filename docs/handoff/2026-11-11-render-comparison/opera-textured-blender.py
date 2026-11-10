import bpy, math, os
from mathutils import Vector

# Same exported triangle meshes, object transforms and 36-degree camera as the browser.
for ob in list(bpy.data.objects): bpy.data.objects.remove(ob, do_unlink=True)
asset_dir = os.environ['JR_ASSETS_DIR']
bpy.ops.import_scene.gltf(filepath=os.path.join(asset_dir, 'opera-detail-model.glb'))
scene=bpy.context.scene
scene.camera=bpy.data.objects.get('OriginalCamera')
if scene.camera is None: raise RuntimeError('OriginalCamera missing from imported GLB')
scene.render.film_transparent=False
scene.world=bpy.data.worlds.new('Opera sky approximation');scene.world.use_nodes=True
world=scene.world.node_tree; nodes=world.nodes; links=world.links; nodes.clear()
out=nodes.new('ShaderNodeOutputWorld');bg=nodes.new('ShaderNodeBackground');bg.inputs['Strength'].default_value=.8
tex=nodes.new('ShaderNodeTexCoord');separate=nodes.new('ShaderNodeSeparateXYZ');links.new(tex.outputs['Normal'],separate.inputs[0])
ramp=nodes.new('ShaderNodeValToRGB');ramp.color_ramp.elements[0].position=.2;ramp.color_ramp.elements[0].color=(.42,.51,.62,1)
ramp.color_ramp.elements[1].position=.85;ramp.color_ramp.elements[1].color=(.07,.17,.4,1)
norm=nodes.new('ShaderNodeMapRange');norm.inputs['From Min'].default_value=-1;norm.inputs['From Max'].default_value=1;links.new(separate.outputs['Z'],norm.inputs['Value']);links.new(norm.outputs['Result'],ramp.inputs[0]);links.new(ramp.outputs['Color'],bg.inputs['Color']);links.new(bg.outputs[0],out.inputs['Surface'])
# Direction derived from source sun (-110,230,160), capped to elevation 0.38rad.
original=Vector((-110,230,160));length=original.length; horizontal=math.hypot(original.x,original.z)
pos=Vector((original.x*math.cos(.38)/horizontal*length,-original.z*math.cos(.38)/horizontal*length,math.sin(.38)*length))
sun_data=bpy.data.lights.new('Opera original-direction key','SUN');sun_data.energy=3.0;sun_data.color=(1.0,.8,.6);sun_data.angle=math.radians(2)
sun=bpy.data.objects.new('Opera original-direction key',sun_data);scene.collection.objects.link(sun);sun.location=pos;sun.rotation_euler=(-pos).to_track_quat('-Z','Y').to_euler()
# World illumination approximates original hemispheric fill; it is not the GLSL sky.
for mat in bpy.data.materials:
 base_name=mat.name.split('.')[0]
 if base_name not in ('tile','water'): continue
 mat.use_nodes=True; n=mat.node_tree.nodes;l=mat.node_tree.links; n.clear();output=n.new('ShaderNodeOutputMaterial');bs=n.new('ShaderNodeBsdfPrincipled');l.new(bs.outputs['BSDF'],output.inputs['Surface'])
 if base_name=='tile':
  # Source texture and data tiles reproduce drawTiles in opera-art-pass.js.
  bs.inputs['Base Color'].default_value=(1.0,.965,.82,1);bs.inputs['Roughness'].default_value=1.0;bs.inputs['Metallic'].default_value=0
  uv=n.new('ShaderNodeTexCoord');mapping=n.new('ShaderNodeVectorMath');mapping.operation='MULTIPLY';mapping.inputs[1].default_value=(1/1.018,-1/1.018,1)
  offset=n.new('ShaderNodeVectorMath');offset.operation='ADD';offset.inputs[1].default_value=(0,1/1.018,0)
  l.new(uv.outputs['UV'],mapping.inputs[0]);l.new(mapping.outputs[0],offset.inputs[0])
  image=n.new('ShaderNodeTexImage');image.image=bpy.data.images.load(os.path.join(asset_dir,'source-tiles.png'));image.extension='REPEAT';image.interpolation='Linear'
  l.new(offset.outputs[0],image.inputs['Vector']);l.new(image.outputs['Color'],bs.inputs['Base Color'])
  detail=n.new('ShaderNodeTexImage');detail.image=bpy.data.images.load(os.path.join(asset_dir,'source-tile-detail.png'));detail.image.colorspace_settings.name='Non-Color';detail.extension='REPEAT';detail.interpolation='Linear';l.new(offset.outputs[0],detail.inputs['Vector'])
  split=n.new('ShaderNodeSeparateColor');l.new(detail.outputs['Color'],split.inputs['Color']);l.new(split.outputs['Green'],bs.inputs['Roughness'])
  bump=n.new('ShaderNodeBump');bump.inputs['Strength'].default_value=1.0;bump.inputs['Distance'].default_value=.003;l.new(split.outputs['Red'],bump.inputs['Height']);l.new(bump.outputs['Normal'],bs.inputs['Normal'])
 else:
  bs.inputs['Base Color'].default_value=(.004,.045,.055,1);bs.inputs['Metallic'].default_value=0;bs.inputs['Roughness'].default_value=.18
  if 'IOR' in bs.inputs: bs.inputs['IOR'].default_value=1.33
  # Dissolve the water into the world at distance, approximating the source horizon fade.
  for link in list(output.inputs['Surface'].links): l.remove(link)
  transparent=n.new('ShaderNodeBsdfTransparent');mix=n.new('ShaderNodeMixShader');distance=n.new('ShaderNodeCameraData');fade=n.new('ShaderNodeMapRange');fade.inputs['From Min'].default_value=500;fade.inputs['From Max'].default_value=1900;fade.clamp=True
  l.new(distance.outputs['View Distance'],fade.inputs['Value']);l.new(fade.outputs['Result'],mix.inputs[0]);l.new(bs.outputs['BSDF'],mix.inputs[1]);l.new(transparent.outputs[0],mix.inputs[2]);l.new(mix.outputs[0],output.inputs['Surface'])
  # Approximate the source analytic waves with four Blender wave textures.
  tc=n.new('ShaderNodeTexCoord'); combine=None
  for i,(direction,scale,strength) in enumerate([(.64,.33,.05),(-.47,.62,.06),(-.17,1.15,.07),(1.31,2.1,.07)]):
   rotate=n.new('ShaderNodeVectorRotate');rotate.rotation_type='Z_AXIS';rotate.inputs['Angle'].default_value=direction;l.new(tc.outputs['Object'],rotate.inputs['Vector'])
   wave=n.new('ShaderNodeTexWave');wave.wave_type='BANDS';wave.bands_direction='X';wave.inputs['Scale'].default_value=scale/(2*math.pi*5);wave.inputs['Distortion'].default_value=.15
   l.new(rotate.outputs['Vector'],wave.inputs['Vector'])
   weighted=n.new('ShaderNodeMath');weighted.operation='MULTIPLY';weighted.inputs[1].default_value=strength;l.new(wave.outputs['Fac'],weighted.inputs[0])
   if combine is None: combine=weighted
   else:
    add=n.new('ShaderNodeMath');add.operation='ADD';l.new(combine.outputs[0],add.inputs[0]);l.new(weighted.outputs[0],add.inputs[1]);combine=add
  bump=n.new('ShaderNodeBump');bump.inputs['Strength'].default_value=.38;bump.inputs['Distance'].default_value=.38;l.new(combine.outputs[0],bump.inputs['Height']);l.new(bump.outputs['Normal'],bs.inputs['Normal'])
scene.view_settings.view_transform='AgX'
scene.frame_set(1)
print('OPERA_SCENE_READY camera=',scene.camera.name,'meshes=',sum(1 for x in scene.objects if x.type=='MESH'))
