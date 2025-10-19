

import 'aframe';
import 'aframe-orbit-controls';

// Register a custom component to animate the face image
AFRAME.registerComponent('image-animator', {
    schema: {
        src1: { type: 'string' },
        src2: { type: 'string' },
        interval: { type: 'number', default: 1000 }
    },
    init: function () {
        this.toggle = false;
        this.tickId = null;
    },
    play: function () {
        this.tickId = setInterval(() => {
            this.toggle = !this.toggle;
            this.el.setAttribute('src', this.toggle ? this.data.src2 : this.data.src1);
        }, this.data.interval);
    },
    pause: function () {
        if (this.tickId) clearInterval(this.tickId);
    },
    remove: function () {
        if (this.tickId) clearInterval(this.tickId);
    }
});


const app = document.getElementById('app');
const SKINTONE = '#C99460';
const personHTML = `
        <a-entity id="person" position="0 0 -4.9">
            <a-entity id="head-group" position="0 2.4 0">
                <a-plane id="head" position="-0.1 0.3 0" width="2" height="1.8" src="/head.png" material="side: double; transparent: true"></a-circle>
                <a-plane id="eyes" position="0.08 -0.1 0.01" width="1" height="0.3" src="#eyes" image-animator="src1: #eyes; src2: #eyes-blink; interval: 1000" material="side: double"></a-plane>
                <a-plane id="mouth" position="0.04 -0.54 0.01" width="0.4" height="0.2" src="/lips.jpg"  material="side: double"></a-plane>
            </a-entity>
            <a-entity id="body-group" position="0 1.2 0">
                <a-plane id="body" position="0 0 0" width="0.7" height="1" color="#4682B4" material="side: double"></a-plane>
                                <!-- Left Arm Group -->
                                <a-entity id="left-arm-group" position="-0.7 0.5 0">
                                    <a-plane id="left-upper-arm" width="0.45" height="0.15" color="${SKINTONE}" rotation="0 0 30" material="side: double"></a-plane>
                                    <a-plane id="left-elbow" position="-0.35 0 0" width="0.3" height="0.15" color="${SKINTONE}" rotation="0 0 10" material="side: double"></a-plane>
                                </a-entity>
                                <a-entity id="right-arm-group" position="0.7 0.5 0">
                                    <a-plane id="right-upper-arm" width="0.45" height="0.15" color="${SKINTONE}" rotation="0 0 -30" material="side: double"></a-plane>
                                    <a-plane id="right-elbow" position="0.35 0 0" width="0.3" height="0.15" color="${SKINTONE}" rotation="0 0 -10" animation="property: rotation; to: 0 0 80; dir: alternate; loop: true; dur: 800" material="side: double"></a-plane>
                                </a-entity>
                <a-plane id="left-leg" position="-0.2 -0.8 0" width="0.2" height="0.7" color="${SKINTONE}" material="side: double"></a-plane>
                <a-plane id="right-leg" position="0.2 -0.8 0" width="0.2" height="0.7" color="${SKINTONE}" material="side: double"></a-plane>
            </a-entity>
        </a-entity>
`;
app.innerHTML = `
        <a-scene>
                <a-assets>
                        <img id="eyes" src="/eyes.png">
                        <img id="eyes-blink" src="/eyes-blink.jpg">
                </a-assets>
                <!-- Three parallel planes (walls) facing the user, separated by 10 units -->
                <a-plane position="0 2 -5" rotation="0 0 0" width="8" height="4" color="#7BC8A4" material="opacity: 0.5; transparent: true; side: double; depthWrite: false" render-order="1"></a-plane>
                <a-plane position="0 2 -15" rotation="0 0 0" width="8" height="4" color="#FFC65D" material="opacity: 0.5; transparent: true; side: double; depthWrite: false" render-order="2"></a-plane>
                <a-plane position="0 2 -25" rotation="0 0 0" width="8" height="4" color="#EF2D5E" material="opacity: 0.5; transparent: true; side: double; depthWrite: false" render-order="3"></a-plane>
                <a-entity id="cameraRig" camera wasd-controls orbit-controls="enableDamping: true; dampingFactor: 0.125; rotateSpeed:0.25; minDistance:2; maxDistance:20" position="0 0 -2" dynamic-orbit-target></a-entity>
                ${personHTML}
                <a-sky color="#ECECEC"></a-sky>
        </a-scene>
`;

// Register a component to dynamically update orbit-controls target
AFRAME.registerComponent('dynamic-orbit-target', {
    tick: function () {
        const cam = this.el;
        const pos = cam.object3D.position;
        // Always target 5 units in front and 2 units higher in Y
        const target = `${pos.x} ${pos.y + 2} ${pos.z - 5}`;
        cam.setAttribute('orbit-controls', 'target', target);
    }
});
