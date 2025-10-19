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
                                    console.log(`WASD tick called: now=${now}, delta=${delta}, name=${name}`);
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
            console.log('Rendering with HalftonePass');
            composer.render();
        });
    }

    sceneEl.addEventListener('loaded', () => {
        setupComposer();
        hookRenderLoop();
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
