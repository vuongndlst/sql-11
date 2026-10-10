import * as THREE from 'three';
import {GLTFLoader} from './vendor/loaders/GLTFLoader.js?v=4753a04700cc';
import {clone} from './vendor/utils/SkeletonUtils.js?v=4753a04700cc';
const loader=new GLTFLoader(),cache=new Map();
const url=name=>{const u=new URL('./models/'+name+'.glb',import.meta.url);u.searchParams.set('v',window.PORTAL_RUNTIME_VERSION||'1');return u.href;};
function load(name){if(!cache.has(name))cache.set(name,loader.loadAsync(url(name)).catch(()=>null));return cache.get(name);}
export function upgradeActor(root,{scale=1,offsetY=0,color=null,managed=true}={}){
 let live=true,mixer=null,current=null,actions={},lastTime=null;const original=[...root.children],ownMaterials=[];
 const old=root.userData.animate;
 const ready=load('lsts-runner').then(asset=>{if(!asset||!live)return false;const actor=clone(asset.scene);actor.scale.setScalar(scale);actor.position.y=offsetY;
  actor.traverse(o=>{if(o.isMesh){o.castShadow=o.receiveShadow=true;o.frustumCulled=false;if(color){const mm=(Array.isArray(o.material)?o.material:[o.material]).map(m=>{if(m.name==='teal varsity jacket'){m=m.clone();m.color.set(color);ownMaterials.push(m);}return m;});o.material=Array.isArray(o.material)?mm:mm[0];}}});
  original.forEach(o=>o.visible=false);root.add(actor);root.userData.blenderActor=actor;mixer=new THREE.AnimationMixer(actor);actions=Object.fromEntries(asset.animations.map(c=>[c.name,mixer.clipAction(c)]));actions.Idle?.play();current='Idle';return true;
 });
 const animate=(time,mode='run',moving=1)=>{if(!mixer){old?.(time,mode,moving);return;}const name=mode==='jump'?'Jump':mode==='celebrate'?'Celebrate':mode==='clap'?'Clap':mode==='bow'?'Bow':mode==='stumble'?'Stumble':moving>.02?'Run':'Idle';
  if(name!==current&&actions[name]){const next=actions[name];next.reset().play();actions[current]?.crossFadeTo(next,.14,true);current=name;}
  const dt=lastTime===null?0:Math.max(0,Math.min(.06,time-lastTime));lastTime=time;mixer.update(dt);};
 if(managed)root.userData.animate=animate;
 return {ready,animate,dispose(){live=false;mixer?.stopAllAction();mixer?.uncacheRoot(root.userData.blenderActor);root.userData.blenderActor?.removeFromParent();ownMaterials.forEach(m=>m.dispose());}};
}
export function addLandmark(scene,theme,position,scale=1){let live=true,node;load(theme+'-landmark').then(asset=>{if(!asset||!live)return;node=asset.scene.clone(true);node.position.set(...position);node.scale.setScalar(scale);node.traverse(o=>{if(o.isMesh)o.castShadow=o.receiveShadow=true;});scene.add(node);});return ()=>{live=false;node?.removeFromParent();};}
export function upgradePlane(root){let live=true,propeller,node;const original=[...root.children],old=root.userData.animate;load('lsts-plane').then(asset=>{if(!asset||!live)return;node=asset.scene.clone(true);node.traverse(o=>{if(o.isMesh)o.castShadow=o.receiveShadow=true;});propeller=node.getObjectByName('Propeller');original.forEach(o=>o.visible=false);root.add(node);root.userData.blenderPlane=node;});root.userData.animate=t=>{if(propeller)propeller.rotation.x=t*38;else old?.(t);};return ()=>{live=false;node?.removeFromParent();};}
