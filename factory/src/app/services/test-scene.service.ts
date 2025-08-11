import { Injectable } from '@angular/core';
import * as THREE from 'three';

@Injectable({
  providedIn: 'root'
})
export class TestSceneService {

  public createSimpleTestScene(scene: THREE.Scene): void {
    console.log('Creating simple test scene...');

    // Clear any existing objects
    while(scene.children.length > 0) {
      scene.remove(scene.children[0]);
    }

    // Add basic lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    scene.add(directionalLight);

    // Add a simple ground plane
    const groundGeometry = new THREE.PlaneGeometry(20, 20);
    const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x90EE90 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);

    // Add a bright red cube at origin
    const cubeGeometry = new THREE.BoxGeometry(2, 2, 2);
    const cubeMaterial = new THREE.MeshLambertMaterial({ color: 0xff0000 });
    const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cube.position.set(0, 1, 0);
    scene.add(cube);

    // Add a blue sphere
    const sphereGeometry = new THREE.SphereGeometry(1, 16, 16);
    const sphereMaterial = new THREE.MeshLambertMaterial({ color: 0x0000ff });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.position.set(3, 1, 0);
    scene.add(sphere);

    // Add a green cylinder
    const cylinderGeometry = new THREE.CylinderGeometry(1, 1, 2, 16);
    const cylinderMaterial = new THREE.MeshLambertMaterial({ color: 0x00ff00 });
    const cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
    cylinder.position.set(-3, 1, 0);
    scene.add(cylinder);

    console.log('Simple test scene created with', scene.children.length, 'objects');
  }
}
