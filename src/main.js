// Utility: Create a canvas texture with styled text
function createTextTexture(text, options = {}) {
    const {
        font = '48px Dogica, monospace',
        color = '#222',
        bgColor = 'rgba(255,255,255,0.9)',
        padding = 32,
        width = 512,
        height = 128,
        align = 'center'
    } = options;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);
    ctx.font = font;
    ctx.fillStyle = color;
    ctx.textAlign = align;
    ctx.textBaseline = 'middle';
    ctx.fillText(text, width / 2, height / 2);
    return new THREE.CanvasTexture(canvas);
}

// Sample usage: Add a text plane to the scene
function addTextPlaneToScene(scene, text, opts = {}) {
    const texture = createTextTexture(text, opts);
    const geometry = new THREE.PlaneGeometry(4, 1);
    const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(0, 2, -4);
    scene.add(mesh);
    return mesh;
}

// Example: Add styled text to your Three.js scene after setup

import './style.css';
import './aframe-app.js';

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { HalftonePass } from 'three/examples/jsm/postprocessing/HalftonePass.js';

window.addEventListener('DOMContentLoaded', () => {
    const sceneEl = document.querySelector('a-scene');
    if (!sceneEl) return;

    let composer, halftonePass;

    function setupComposer() {
        const renderer = sceneEl.renderer;
        const threeScene = sceneEl.object3D;
        const camera = sceneEl.camera;
        if (!renderer || !threeScene || !camera) return;

        composer = new EffectComposer(renderer);
        composer.addPass(new RenderPass(threeScene, camera));
        const halftoneParams = {
            shape: 2,
            radius: 4,
            rotateR: Math.PI / 8,
            scatter: 0,
            blending: 1,
            blendingMode: 3,
            greyscale: false,
            disable: false
        };
        halftonePass = new HalftonePass(window.innerWidth, window.innerHeight, halftoneParams);
        composer.addPass(halftonePass);
    }

    function hookRenderLoop() {
        if (!composer) return;
        let lastTime = performance.now();
        sceneEl.renderer.setAnimationLoop(() => {
            const now = performance.now();
            const delta = now - lastTime;
            lastTime = now;
            // Update camera controls before rendering
            // Update all components' tick methods on scene and camera
            const updateComponentTicks = (entity) => {
                if (entity && entity.components) {
                    Object.entries(entity.components).forEach(([name, component]) => {
                        if (typeof component.tick === 'function') {
                            try {
                                if (name === 'wasd-controls') {
                                    // console.log(`WASD tick called: now=${now}, delta=${delta}, name=${name}`);
                                }
                                component.tick(now, delta);
                            } catch (err) {
                                console.warn(`Component tick error for ${name}:`, err);
                            }
                        }
                    });
                }
            };
            updateComponentTicks(sceneEl);
            if (sceneEl.camera && sceneEl.camera.el) {
                updateComponentTicks(sceneEl.camera.el);
            }
            // Restore waving animation by manually ticking the animation component on right-elbow-joint
            const rightElbowJoint = sceneEl.querySelector('#right-elbow-joint');
            if (rightElbowJoint && rightElbowJoint.components && rightElbowJoint.components.animation && typeof rightElbowJoint.components.animation.tick === 'function') {
                try {
                    rightElbowJoint.components.animation.tick(performance.now(), delta);
                } catch (err) {
                    console.warn('Animation tick error on right-elbow-joint:', err);
                }
            }
            // Debug log to verify rendering
            // console.log('Rendering with HalftonePass');
            composer.render();
        });
    }

    sceneEl.addEventListener('loaded', () => {
        setupComposer();
        hookRenderLoop();
        // addTextPlaneToScene(sceneEl, 'Hello from Three.js!', { font: 'bold 48px sans-serif', color: '#222', bgColor: 'rgba(255,255,255,0.95)' });
    });

    // Re-hook render loop if A-Frame resets it
    sceneEl.addEventListener('renderstart', () => {
        hookRenderLoop();
    });

    // Update composer size on window resize
    window.addEventListener('resize', () => {
        if (composer && halftonePass) {
            composer.setSize(window.innerWidth, window.innerHeight);
            halftonePass.setSize(window.innerWidth, window.innerHeight);
        }
    });
});
