// Custom A-Frame component to add a Three.js text plane as a child mesh
AFRAME.registerComponent('threejs-text-plane', {
    schema: {
        text: { type: 'string', default: 'Hello from Three.js!' },
        bgcolor: { type: 'string', default: 'transparent' }
    },
    init: function () {
        // Create canvas
        const width = 512, height = 128;
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        // No background fill for transparent text
        // Load Dogica font from public folder
        const self = this;
        const fontFace = new FontFace('Dogica', 'url(TTF/dogicapixel.ttf)');
        // fontFace.load().then(function (loadedFace) {
        //     document.fonts.add(loadedFace);
        //     ctx.clearRect(0, 0, width, height);
        //     ctx.font = '20px Dogica, monospace';
        //     ctx.fillStyle = '#ff0000';
        //     ctx.textAlign = 'center';
        //     ctx.textBaseline = 'middle';
        //     ctx.fillText(self.data.text, width / 2, height / 2);
        //     texture.needsUpdate = true;
        // });
        // Do not draw fallback text; only draw after Dogica loads
        // Measure text width and height (with padding)
        const font = '20px Dogica, monospace';
        ctx.font = font;
        const metrics = ctx.measureText(this.data.text);
        const padding = 24;
        const textWidth = Math.ceil(metrics.width) + 2 * padding;
        const textHeight = Math.ceil((metrics.actualBoundingBoxAscent || 20) + (metrics.actualBoundingBoxDescent || 12)) + 2 * padding;
        // Set canvas size to fit text
        canvas.width = textWidth;
        canvas.height = textHeight;
        // Redraw background and text after resizing canvas
        // No background fill for transparent text
        // Draw a visible border for debugging
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 4;
        ctx.strokeRect(0, 0, textWidth, textHeight);
        ctx.font = font;
        ctx.fillStyle = 'red';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.data.text, textWidth / 2, textHeight / 2);
        // Plane size in world units (1 unit = 200px)
        const planeWidth = textWidth / 200;
        const planeHeight = textHeight / 200;
        // Create texture and mesh
        const texture = new THREE.CanvasTexture(canvas);
        const geometry = new THREE.PlaneGeometry(planeWidth, planeHeight);
        const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
        this.mesh = new THREE.Mesh(geometry, material);
        this.el.setObject3D('mesh', this.mesh);
    },
    remove: function () {
        if (this.mesh) this.el.removeObject3D('mesh');
    }
});


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
const SKINTONE = '#C9C9C9';
const personHTML = `
        <a-entity id="person" position="0 0 -4.8w">
            <a-entity id="head-group" position="0 2.4 0">
                <a-plane id="head" position="-0.1 0.3 0" width="2" height="1.8" src="grayscale/head.png" material="side: double; transparent: true"></a-circle>
                <a-plane id="eyes" position="0.08 -0.1 0.01" width="1" height="0.3" src="#eyes" image-animator="src1: #eyes; src2: #eyes-blink; interval: 1000" material="side: double"></a-plane>
                <a-plane id="mouth" position="0.04 -0.54 0.01" width="0.4" height="0.2" src="grayscale/lips.jpg"  material="side: double"></a-plane>
            </a-entity>
            <a-entity id="body-group" position="0 1.2 0">
                <a-plane id="body" position="0 0.1 0" width="0.7" height="1" color="#aaaaaa" material="side: double"></a-plane>
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
                <img id="eyes" src="grayscale/eyes.png">
                <img id="eyes-blink" src="grayscale/eyes-blink.jpg">                
            </a-assets>
                

                <!-- Three parallel planes (walls) facing the user, separated by 10 units -->
                <a-plane position="0 2 -5" rotation="0 0 0" width="8" height="4" color="#c3c3c3" material="opacity: 0.5; transparent: true; side: double; depthWrite: false" render-order="1"></a-plane>
                <a-plane position="0 2 -15" rotation="0 0 0" width="8" height="4" color="#d4d4d4" material="opacity: 0.5; transparent: true; side: double; depthWrite: false" render-order="2"></a-plane>
                <a-plane position="0 2 -25" rotation="0 0 0" width="8" height="4" color="#ededed" material="opacity: 0.5; transparent: true; side: double; depthWrite: false" render-order="3"></a-plane>
                <a-entity id="cameraRig" camera wasd-controls orbit-controls="enableDamping: true; dampingFactor: 0.125; rotateSpeed:0.25; minDistance:2; maxDistance:20" position="0 0 -2" dynamic-orbit-target></a-entity>
                ${personHTML}

                <!-- Vector dashed rectangle using custom component -->
                
                                    <!-- Dashed rectangle using a repeating dash image as border -->
                                    <a-assets>
                                        <img id="dash-img" src="dash.png">
                                    </a-assets>

                                    <a-plane position="0 2 -3" width="0.5" height=".01" src="#dash-img" material="transparent: true; side: double; repeat: 8 2"></a-plane>

                                    <!-- Three.js text plane as A-Frame entity -->
                                    <a-entity position="1.5 2.5 -4" threejs-text-plane="text: Hello from Three.js!; font: bold 48px sans-serif; color: #222; bgcolor: rgba(255,255,255,0.95)"></a-entity>
                    

                
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
