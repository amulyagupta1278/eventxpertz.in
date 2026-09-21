import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import type { ProceduralModelRuntime } from './createObjectModel';
// Explicit closed strips avoid ear-clipped sliver triangles on thin, curved caps.
function closedStrip(vertices:number[]){
 const n=vertices.length/12,indices:number[]=[];
 for(let i=0;i<n-1;i++){const a=i*4,b=a+4;indices.push(a,a+1,b,a+1,b+1,b,a+2,b+2,a+3,a+3,b+2,b+3,a,b,a+2,a+2,b,b+2,a+1,a+3,b+1,a+3,b+3,b+1)}
 indices.push(0,2,1,1,2,3);const e=(n-1)*4;indices.push(e,e+1,e+2,e+1,e+3,e+2);
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));const uv:number[]=[];for(let i=0;i<n;i++)uv.push(i/(n-1),1,i/(n-1),0,i/(n-1),1,i/(n-1),0);g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(indices);const result=g.toNonIndexed();result.computeVertexNormals();g.dispose();return result;
}
function graphicMaterial(kind:string){
 const canvas=document.createElement('canvas');canvas.width=kind==='brand'?1100:512;canvas.height=kind==='brand'?190:1024;
 const ctx=canvas.getContext('2d')!;
 if(kind==='brand'){
  const polygon=(points:number[][],color:string)=>{ctx.fillStyle=color;ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fill()};
  polygon([[65,12],[128,157],[88,157],[43,54]],'#00828a');polygon([[0,157],[43,80],[68,126],[48,157]],'#102338');polygon([[59,157],[72,133],[84,157]],'#102338');
  ctx.font='bold 140px Arial';ctx.fillStyle='#102338';ctx.fillText('Event',164,151);const w=ctx.measureText('Event').width;ctx.fillStyle='#00828a';ctx.fillText('xpertz',164+w,151);
 }else{ctx.fillStyle='#efeae0';ctx.font='70px Arial';ctx.textAlign='center';['WEAVE','INNOVATION.','THREAD','EXCELLENCE.'].forEach((t,i)=>ctx.fillText(t,256,335+i*120))}
 const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=4;
 return new THREE.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false});
}
export function refineGeometry(model:THREE.Group){
 const runtime=model.userData.sculptRuntime as ProceduralModelRuntime;
 for(const [id,mesh] of Object.entries(runtime.meshes)){
  const spec=runtime.nodes[id].userData.sculptComponent,form=spec.geometryDescriptor.customForm;
  let geometry:THREE.BufferGeometry|undefined;
  if(spec.geometryDescriptor.graphic){mesh.material=graphicMaterial(spec.geometryDescriptor.graphic);mesh.castShadow=false;mesh.userData.explodeWithParent=true}
  if(form?.kind==='coat-lathe'){
   geometry=new THREE.LatheGeometry(form.profile.map((p:number[])=>new THREE.Vector2(p[0],p[1])),32);
   geometry.scale(1,1,form.depthScale);geometry.translate(0,0,form.zOffset);
  }
  if(form?.kind==='rounded-fold'){
   const d=spec.dimensions;geometry=new RoundedBoxGeometry(d.width,d.height,d.depth,3,.035);
  }
  if(form?.kind==='chair-shell'){
   const vertices:number[]=[];
   for(let i=0;i<=40;i++){
    const a=Math.PI+.3-i*(Math.PI+.6)/40,x=Math.cos(a),z=Math.sin(a),height=form.height*(.40+.60*Math.max(0,z));
    vertices.push(x*form.radiusX,height,z*form.radiusZ,x*form.radiusX,0,z*form.radiusZ,x*(form.radiusX-form.thickness),height,z*(form.radiusZ-form.thickness),x*(form.radiusX-form.thickness),0,z*(form.radiusZ-form.thickness));
   }
   geometry=closedStrip(vertices);
  }
  if(id.startsWith('canopy-trim-')){
   const profile=spec.geometryDescriptor.profile2D,points=profile.points as number[][],vertices:number[]=[];
   for(let i=0;i<points.length/2;i++){const top=points[i],bottom=points[points.length-1-i];vertices.push(top[0],top[1],profile.depth,bottom[0],bottom[1],profile.depth,top[0],top[1],0,bottom[0],bottom[1],0)}
   geometry=closedStrip(vertices);
  }
  if(geometry){if(geometry.getAttribute('uv'))geometry.setAttribute('uv1',geometry.getAttribute('uv').clone());mesh.geometry.dispose();mesh.geometry=geometry}
 }
}
