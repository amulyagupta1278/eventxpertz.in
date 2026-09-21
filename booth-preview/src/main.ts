import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {createEventxpertzExhibitionBoothModel, type ProceduralModelRuntime} from './createObjectModel';
import './style.css';
import {refineGeometry} from './refineGeometry';
const capture=new URLSearchParams(location.search).has('capture');
if(capture)document.body.classList.add('capture');
const host=document.querySelector<HTMLElement>('#viewport')!;
const renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.9;host.append(renderer.domElement);
renderer.domElement.tabIndex=0;renderer.domElement.setAttribute('aria-label','Drag to orbit the booth. Use the view buttons to reset.');
const scene=new THREE.Scene();scene.background=new THREE.Color(capture?'#ffffff':'#f6f5f1');
const camera=new THREE.PerspectiveCamera(34,1,.05,100);
const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.maxDistance=25;controls.minDistance=5;controls.maxPolarAngle=Math.PI*.51;controls.target.set(0,2.2,0);
THREE.DefaultLoadingManager.setURLModifier(url => url.startsWith('/materials/') ? `${import.meta.env.BASE_URL}${url.slice(1)}` : url);
const model=createEventxpertzExhibitionBoothModel({textureSize:256});refineGeometry(model);scene.add(model);
const runtime=model.userData.sculptRuntime as ProceduralModelRuntime;
// Container mesh is an addressable hierarchy anchor, never visible geometry.
if(runtime.meshes.root)runtime.meshes.root.visible=false;
const hemi=new THREE.HemisphereLight(0xffffff,0xa4a097,1.0);scene.add(hemi);
const key=new THREE.DirectionalLight(0xfff4e4,2.0);key.position.set(-3,7,6);key.castShadow=true;key.shadow.mapSize.set(2048,2048);Object.assign(key.shadow.camera,{left:-6,right:6,top:7,bottom:-4,near:.1,far:25});key.shadow.normalBias=.025;scene.add(key);
const fill=new THREE.DirectionalLight(0xe0f5ff,.7);fill.position.set(4,4,2);scene.add(fill);
const pmrem=new THREE.PMREMGenerator(renderer);const env=pmrem.fromScene(new RoomEnvironment(),.04);scene.environment=env.texture;scene.environmentIntensity=.25;pmrem.dispose();
const ground=new THREE.Mesh(new THREE.PlaneGeometry(200,200),new THREE.ShadowMaterial({opacity:.14}));ground.rotation.x=-Math.PI/2;ground.position.y=-.15;ground.receiveShadow=true;scene.add(ground);
function view(degrees=0){const a=degrees*Math.PI/180;camera.position.set(Math.sin(a)*11,3.3,Math.cos(a)*11);controls.target.set(0,2.25,0);controls.update()}
function resize(){const w=host.clientWidth,h=host.clientHeight;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();if(!capture&&w>800)camera.setViewOffset(w,h,-w*.10,0,w,h);else camera.clearViewOffset()}
resize();view();window.addEventListener('resize',resize);
let exploded=false,wire=false;const original=new Map<THREE.Object3D,THREE.Vector3>();Object.values(runtime.nodes).forEach(n=>original.set(n,n.position.clone()));
function explode(value:boolean){exploded=value;for(const [n,p] of original){const spec=n.userData.sculptComponent;if(!spec||spec.id==='root')continue;n.position.copy(p);if(spec.parent==='root')n.position.add(new THREE.Vector3(p.x,p.y-2,p.z).multiplyScalar(value?.18:0))}document.querySelector('#explode')!.setAttribute('aria-pressed',String(value))}
document.querySelector('#front')!.addEventListener('click',()=>{controls.autoRotate=false;explode(false);view()});
document.querySelector('#orbit')!.addEventListener('click',()=>{controls.autoRotate=!controls.autoRotate;controls.autoRotateSpeed=.7});
document.querySelector('#explode')!.addEventListener('click',()=>explode(!exploded));
document.querySelector('#wire')!.addEventListener('click',()=>{wire=!wire;model.traverse(o=>{if(o instanceof THREE.Mesh){const ms=Array.isArray(o.material)?o.material:[o.material];ms.forEach(m=>{if('wireframe'in m)(m as THREE.MeshStandardMaterial).wireframe=wire})}});document.querySelector('#wire')!.setAttribute('aria-pressed',String(wire))});
const ray=new THREE.Raycaster();let down=[0,0];renderer.domElement.addEventListener('pointerdown',e=>{down=[e.clientX,e.clientY]});renderer.domElement.addEventListener('pointerup',e=>{if(Math.hypot(e.clientX-down[0],e.clientY-down[1])>5)return;const rect=renderer.domElement.getBoundingClientRect();ray.setFromCamera(new THREE.Vector2((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1),camera);const hit=ray.intersectObjects(Object.values(runtime.meshes).filter(m=>m.visible),false)[0];document.querySelector('#selection')!.textContent=hit?hit.object.name:'Drag to rotate · Scroll to zoom · Click a part'});
const stats=()=>({triangles:renderer.info.render.triangles,drawCalls:renderer.info.render.calls,parts:Object.keys(runtime.meshes).length});
Object.assign(window,{__booth:{model,scene,camera,renderer,runtime,view,explode,stats,stripMaps:()=>model.traverse(o=>{if(o instanceof THREE.Mesh){for(const m of (Array.isArray(o.material)?o.material:[o.material])){for(const k of ["map","normalMap","bumpMap","roughnessMap","metalnessMap","aoMap","displacementMap"])(m as any)[k]=null;m.needsUpdate=true}}}),ready:true}});
function frame(){controls.update();renderer.render(scene,camera);requestAnimationFrame(frame)}frame();
