// 🦌 RUKA PORRO VOXL - AI EDITION
// A Generative AI Narrative Adventure in Lapland
// OPTIMIZED VERSION

class PoroGame {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.clock = new THREE.Clock();

        // Player state
        this.player = {
            position: new THREE.Vector3(0, 10, 0),
            velocity: new THREE.Vector3(0, 0, 0),
            rotation: { x: 0, y: 0 },
            onGround: false,
            speed: 12,
            sprintSpeed: 22,
            jumpForce: 14
        };

        // Survival stats
        this.stats = {
            health: 100,
            energy: 100,
            warmth: 100,
            hunger: 100
        };

        // Game state
        this.lichenCollected = 0;
        this.dayTime = 0.3;
        this.isNight = false;
        this.auroraActive = false;
        this.currentMission = 1;
        this.porroCorruption = 5;

        // NPC Trust levels
        this.npcTrust = {};

        // Dialogue state
        this.inDialogue = false;
        this.currentNPC = null;
        this.dialogueQueue = [];

        // Input state
        this.keys = {};
        this.mouseLocked = false;

        // Camera settings
        this.cameraDistance = 15;
        this.cameraMinDistance = 5;
        this.cameraMaxDistance = 40;
        this.cameraHeight = 8;
        this.cameraSmoothing = 0.08;

        // World objects
        this.npcs = [];
        this.lichens = [];
        this.birds = [];
        this.trees = [];

        // World settings
        this.worldSize = 400;

        // Terrain data
        this.mountains = [
            { x: -120, z: -120, height: 40, radius: 60 },
            { x: 150, z: -80, height: 50, radius: 70 },
            { x: -80, z: 120, height: 35, radius: 55 },
            { x: 120, z: 100, height: 38, radius: 58 },
            { x: 0, z: -160, height: 55, radius: 80 },
            { x: -160, z: 0, height: 30, radius: 45 },
            { x: 160, z: 30, height: 45, radius: 65 }
        ];

        this.hills = [
            { x: -60, z: 60, height: 12, radius: 30 },
            { x: 80, z: -30, height: 15, radius: 35 },
            { x: -30, z: -80, height: 10, radius: 25 },
            { x: 90, z: 70, height: 13, radius: 32 },
            { x: -100, z: 50, height: 9, radius: 22 },
            { x: 50, z: -100, height: 11, radius: 28 }
        ];

        // Level zones
        this.zones = {
            start: { center: new THREE.Vector3(0, 0, 0), radius: 30, name: "Ontwaken" },
            sieni: { center: new THREE.Vector3(-50, 0, -40), radius: 25, name: "Berkenbos", mission: 1 },
            sammal: { center: new THREE.Vector3(-80, 0, 20), radius: 25, name: "Mosvelden", mission: 2 },
            yuki: { center: new THREE.Vector3(-30, 0, 70), radius: 25, name: "Dennenbos", mission: 3 },
            taisto: { center: new THREE.Vector3(60, 5, 50), radius: 25, name: "Rotsige Heuvel", mission: 4 },
            karen: { center: new THREE.Vector3(90, 10, 0), radius: 25, name: "Boomtoppen", mission: 5 },
            susi: { center: new THREE.Vector3(70, 0, -70), radius: 30, name: "Wolvengebied", mission: 6 },
            hunter: { center: new THREE.Vector3(0, -5, -90), radius: 25, name: "Donker Ravijn", mission: 7 },
            karhu: { center: new THREE.Vector3(-70, 0, -90), radius: 25, name: "Berengrot", mission: 8 },
            koulu: { center: new THREE.Vector3(0, 0, -130), radius: 35, name: "Oude School", mission: 9 }
        };

        this.init();
    }

    init() {
        // Scene setup
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB);
        this.scene.fog = new THREE.Fog(0xCCCCDD, 50, 300);

        // Camera setup
        this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 500);
        this.camera.position.set(0, 15, 20);

        // Renderer setup
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        document.getElementById('game-container').appendChild(this.renderer.domElement);

        // Lighting
        this.setupLighting();

        // Create world - OPTIMIZED
        this.createOptimizedTerrain();
        this.createTrees();
        this.createLichen();
        this.createPoro();
        this.createNPCs();
        this.createSchool();
        this.createSnowParticles();
        this.createAurora();
        this.createBirds();

        // Event listeners
        this.setupControls();
        this.setupDialogueUI();

        // Hide loading screen
        setTimeout(() => {
            const loading = document.getElementById('loading');
            if (loading) {
                loading.style.opacity = '0';
                setTimeout(() => {
                    loading.style.display = 'none';
                    this.showMessage('🦌 Welkom, Ruka. Verken het bos!');
                }, 500);
            }
        }, 1500);

        // Start game loop
        this.animate();
    }

    setupLighting() {
        // Ambient light
        this.ambientLight = new THREE.AmbientLight(0x6688cc, 0.5);
        this.scene.add(this.ambientLight);

        // Directional light (sun)
        this.sunLight = new THREE.DirectionalLight(0xffffff, 1);
        this.sunLight.position.set(100, 150, 100);
        this.sunLight.castShadow = true;
        this.sunLight.shadow.mapSize.width = 1024;
        this.sunLight.shadow.mapSize.height = 1024;
        this.sunLight.shadow.camera.near = 10;
        this.sunLight.shadow.camera.far = 400;
        this.sunLight.shadow.camera.left = -150;
        this.sunLight.shadow.camera.right = 150;
        this.sunLight.shadow.camera.top = 150;
        this.sunLight.shadow.camera.bottom = -150;
        this.scene.add(this.sunLight);

        // Hemisphere light
        this.hemiLight = new THREE.HemisphereLight(0x87CEEB, 0x444444, 0.4);
        this.scene.add(this.hemiLight);
    }

    getTerrainHeight(x, z) {
        // Base terrain with smooth noise
        let height = Math.sin(x * 0.02) * 4 +
                     Math.cos(z * 0.02) * 4 +
                     Math.sin((x + z) * 0.015) * 6 +
                     Math.cos((x - z) * 0.01) * 3;

        // Add mountains
        for (const mt of this.mountains) {
            const dist = Math.sqrt((x - mt.x) ** 2 + (z - mt.z) ** 2);
            if (dist < mt.radius) {
                const factor = 1 - (dist / mt.radius);
                height += mt.height * factor * factor;
            }
        }

        // Add hills
        for (const hill of this.hills) {
            const dist = Math.sqrt((x - hill.x) ** 2 + (z - hill.z) ** 2);
            if (dist < hill.radius) {
                const factor = 1 - (dist / hill.radius);
                height += hill.height * Math.cos(factor * Math.PI / 2);
            }
        }

        return height;
    }

    createOptimizedTerrain() {
        // Use a single PlaneGeometry - MUCH more efficient
        const segments = 200;
        const geometry = new THREE.PlaneGeometry(this.worldSize, this.worldSize, segments, segments);
        geometry.rotateX(-Math.PI / 2);

        const positions = geometry.attributes.position.array;
        const colors = new Float32Array(positions.length);

        // Modify vertices and colors
        for (let i = 0; i < positions.length; i += 3) {
            const x = positions[i];
            const z = positions[i + 2];
            const height = this.getTerrainHeight(x, z);
            positions[i + 1] = height;

            // Color based on height
            let r, g, b;
            if (height > 30) {
                // Mountain peak - gray rock
                r = 0.5; g = 0.5; b = 0.5;
            } else if (height > 15) {
                // High altitude - white snow
                r = 1; g = 1; b = 1;
            } else if (height < -3) {
                // Low - ice blue
                r = 0.7; g = 0.85; b = 0.95;
            } else {
                // Normal - white snow
                r = 0.95; g = 0.95; b = 0.98;
            }

            // Check for moss zone
            const mossCenter = this.zones.sammal.center;
            const distToMoss = Math.sqrt((x - mossCenter.x) ** 2 + (z - mossCenter.z) ** 2);
            if (distToMoss < this.zones.sammal.radius) {
                r = 0.3; g = 0.5; b = 0.35;
            }

            colors[i] = r;
            colors[i + 1] = g;
            colors[i + 2] = b;
        }

        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.computeVertexNormals();

        const material = new THREE.MeshLambertMaterial({
            vertexColors: true,
            flatShading: true
        });

        this.terrain = new THREE.Mesh(geometry, material);
        this.terrain.receiveShadow = true;
        this.scene.add(this.terrain);
    }

    createTrees() {
        // Create instanced trees for performance
        const treeCount = 400;

        for (let i = 0; i < treeCount; i++) {
            const x = (Math.random() - 0.5) * this.worldSize * 0.9;
            const z = (Math.random() - 0.5) * this.worldSize * 0.9;
            const pos = new THREE.Vector3(x, 0, z);

            // Skip near school and in water
            if (pos.distanceTo(this.zones.koulu.center) < 30) continue;
            const height = this.getTerrainHeight(x, z);
            if (height < -2 || height > 35) continue;

            const tree = this.createTree(pos.distanceTo(this.zones.sieni.center) < this.zones.sieni.radius);
            tree.position.set(x, height, z);
            tree.scale.setScalar(0.7 + Math.random() * 0.5);
            this.scene.add(tree);
            this.trees.push(tree);
        }
    }

    createTree(isBirch = false) {
        const tree = new THREE.Group();

        if (isBirch) {
            // Birch tree
            const trunk = new THREE.Mesh(
                new THREE.CylinderGeometry(0.3, 0.4, 8, 6),
                new THREE.MeshLambertMaterial({ color: 0xf5f5dc })
            );
            trunk.position.y = 4;
            trunk.castShadow = true;
            tree.add(trunk);

            const leaves = new THREE.Mesh(
                new THREE.SphereGeometry(3, 6, 6),
                new THREE.MeshLambertMaterial({ color: 0xdaa520 })
            );
            leaves.position.y = 9;
            leaves.castShadow = true;
            tree.add(leaves);
        } else {
            // Pine tree
            const trunk = new THREE.Mesh(
                new THREE.CylinderGeometry(0.3, 0.5, 5, 6),
                new THREE.MeshLambertMaterial({ color: 0x4a3728 })
            );
            trunk.position.y = 2.5;
            trunk.castShadow = true;
            tree.add(trunk);

            // Pine layers
            for (let l = 0; l < 3; l++) {
                const cone = new THREE.Mesh(
                    new THREE.ConeGeometry(2.5 - l * 0.5, 4, 6),
                    new THREE.MeshLambertMaterial({ color: l === 0 ? 0x1a472a : 0x2d5a3d })
                );
                cone.position.y = 5 + l * 2;
                cone.castShadow = true;
                tree.add(cone);
            }

            // Snow cap
            const snowCap = new THREE.Mesh(
                new THREE.ConeGeometry(0.8, 1.5, 6),
                new THREE.MeshLambertMaterial({ color: 0xffffff })
            );
            snowCap.position.y = 12;
            tree.add(snowCap);
        }

        return tree;
    }

    createLichen() {
        for (let i = 0; i < 60; i++) {
            const x = (Math.random() - 0.5) * this.worldSize * 0.7;
            const z = (Math.random() - 0.5) * this.worldSize * 0.7;
            const height = this.getTerrainHeight(x, z);

            if (height < -2 || height > 20) continue;

            const lichen = new THREE.Group();

            // Lichen cluster
            for (let j = 0; j < 4; j++) {
                const sphere = new THREE.Mesh(
                    new THREE.SphereGeometry(0.3, 6, 6),
                    new THREE.MeshLambertMaterial({ color: 0x90EE90 })
                );
                sphere.position.set(
                    (Math.random() - 0.5) * 1.5,
                    0.2,
                    (Math.random() - 0.5) * 1.5
                );
                lichen.add(sphere);
            }

            // Glow
            const glow = new THREE.Mesh(
                new THREE.SphereGeometry(1, 8, 8),
                new THREE.MeshBasicMaterial({ color: 0x90EE90, transparent: true, opacity: 0.2 })
            );
            glow.position.y = 0.3;
            lichen.add(glow);

            lichen.position.set(x, height + 0.5, z);
            lichen.userData = { collected: false };
            this.scene.add(lichen);
            this.lichens.push(lichen);
        }
    }

    createPoro() {
        this.poro = new THREE.Group();
        const bodyMat = new THREE.MeshLambertMaterial({ color: 0x8B7355 });

        // Body
        const body = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1, 2), bodyMat);
        body.position.y = 1;
        body.castShadow = true;
        this.poro.add(body);

        // Head
        const head = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.7, 1), bodyMat);
        head.position.set(0, 1.5, 1.2);
        head.castShadow = true;
        this.poro.add(head);

        // Snout
        const snout = new THREE.Mesh(
            new THREE.BoxGeometry(0.4, 0.3, 0.5),
            new THREE.MeshLambertMaterial({ color: 0x3d3d3d })
        );
        snout.position.set(0, 1.3, 1.7);
        this.poro.add(snout);

        // Eyes
        const eyeMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
        [-0.25, 0.25].forEach(xPos => {
            const eye = new THREE.Mesh(new THREE.SphereGeometry(0.08, 6, 6), eyeMat);
            eye.position.set(xPos, 1.55, 1.5);
            this.poro.add(eye);
        });

        // Antlers
        const antlerMat = new THREE.MeshLambertMaterial({ color: 0x5c4033 });
        [-0.3, 0.3].forEach((xPos, i) => {
            const antler = new THREE.Group();
            const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.06, 0.8, 5), antlerMat);
            stem.position.y = 0.4;
            stem.rotation.z = i === 0 ? -0.3 : 0.3;
            antler.add(stem);

            const branch = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.04, 0.4, 5), antlerMat);
            branch.position.set(i === 0 ? -0.15 : 0.15, 0.7, 0);
            branch.rotation.z = i === 0 ? -0.8 : 0.8;
            antler.add(branch);

            antler.position.set(xPos, 2, 1);
            this.poro.add(antler);
        });

        // Legs
        this.poroLegs = [];
        const legMat = new THREE.MeshLambertMaterial({ color: 0x6B5344 });
        [[-0.5, 0.6], [0.5, 0.6], [-0.5, -0.6], [0.5, -0.6]].forEach(([x, z]) => {
            const leg = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.9, 0.25), legMat);
            leg.position.set(x, 0.45, z);
            leg.castShadow = true;
            this.poro.add(leg);
            this.poroLegs.push(leg);
        });

        // Tail
        const tail = new THREE.Mesh(
            new THREE.SphereGeometry(0.15, 6, 6),
            new THREE.MeshLambertMaterial({ color: 0xffffff })
        );
        tail.position.set(0, 1.1, -1.1);
        this.poro.add(tail);

        this.poro.position.copy(this.player.position);
        this.scene.add(this.poro);
    }

    createNPCs() {
        // Create all NPCs
        this.createMushrooms();
        this.createMagicMoss();
        this.createDog('yuki', 0xffffff, this.zones.yuki.center, 'Yuki (Witte Akita)', 3);
        this.createDog('taisto', 0x8B4513, this.zones.taisto.center, 'Taisto (Amstaff)', 4);
        this.createCrow();
        this.createWolf();
        this.createHunter();
        this.createBear();
    }

    createMushrooms() {
        const pos = this.zones.sieni.center;
        const mushrooms = new THREE.Group();
        const colors = [0xff6b6b, 0xffd93d, 0x6bcb77, 0x4d96ff];

        for (let i = 0; i < 10; i++) {
            const mush = new THREE.Group();

            const stem = new THREE.Mesh(
                new THREE.CylinderGeometry(0.12, 0.18, 0.7, 6),
                new THREE.MeshLambertMaterial({ color: 0xf5f5dc })
            );
            stem.position.y = 0.35;
            mush.add(stem);

            const cap = new THREE.Mesh(
                new THREE.SphereGeometry(0.35, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2),
                new THREE.MeshLambertMaterial({ color: colors[i % colors.length] })
            );
            cap.position.y = 0.7;
            cap.rotation.x = Math.PI;
            mush.add(cap);

            mush.position.set((Math.random() - 0.5) * 8, 0, (Math.random() - 0.5) * 8);
            mush.scale.setScalar(0.7 + Math.random() * 0.6);
            mushrooms.add(mush);
        }

        const h = this.getTerrainHeight(pos.x, pos.z);
        mushrooms.position.set(pos.x, h + 0.5, pos.z);
        mushrooms.userData = {
            type: 'npc', id: 'sieni', name: 'Sieni (Paddenstoelen)', mission: 1,
            dialogues: ["Wij zijn vele... Wij zijn één...", "De Porro nadert...", "Zoek het magische mos..."]
        };
        this.scene.add(mushrooms);
        this.npcs.push(mushrooms);
    }

    createMagicMoss() {
        const pos = this.zones.sammal.center;
        const moss = new THREE.Group();

        const mossPlane = new THREE.Mesh(
            new THREE.CircleGeometry(8, 16),
            new THREE.MeshLambertMaterial({ color: 0x00ff88, transparent: true, opacity: 0.8 })
        );
        mossPlane.rotation.x = -Math.PI / 2;
        mossPlane.position.y = 0.1;
        moss.add(mossPlane);

        // Glowing particles
        const particleGeom = new THREE.BufferGeometry();
        const positions = new Float32Array(30 * 3);
        for (let i = 0; i < 30; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 10;
            positions[i * 3 + 1] = Math.random() * 3;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
        }
        particleGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const particles = new THREE.Points(particleGeom, new THREE.PointsMaterial({
            color: 0x00ffaa, size: 0.3, transparent: true, opacity: 0.6
        }));
        moss.add(particles);

        const h = this.getTerrainHeight(pos.x, pos.z);
        moss.position.set(pos.x, h + 0.5, pos.z);
        moss.userData = {
            type: 'npc', id: 'sammal', name: 'Sammal (Magisch Mos)', mission: 2,
            dialogues: ["Ik zie paden... zoveel paden...", "De hond huilt naar de maan...", "Volg de stille..."]
        };
        this.scene.add(moss);
        this.npcs.push(moss);
    }

    createDog(id, color, pos, name, mission) {
        const dog = new THREE.Group();
        const mat = new THREE.MeshLambertMaterial({ color });

        const body = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.8, 1.6), mat);
        body.position.y = 0.8;
        body.castShadow = true;
        dog.add(body);

        const head = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.5, 0.7), mat);
        head.position.set(0, 1.1, 0.85);
        dog.add(head);

        // Eyes
        const eyeMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
        [-0.15, 0.15].forEach(x => {
            const eye = new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 6), eyeMat);
            eye.position.set(x, 1.15, 1.15);
            dog.add(eye);
        });

        // Legs
        [[-0.4, 0.5], [0.4, 0.5], [-0.4, -0.5], [0.4, -0.5]].forEach(([x, z]) => {
            const leg = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.5, 0.2), mat);
            leg.position.set(x, 0.25, z);
            dog.add(leg);
        });

        const h = this.getTerrainHeight(pos.x, pos.z);
        dog.position.set(pos.x, h + 0.5, pos.z);

        const dialogues = id === 'yuki'
            ? ["...", "*knikt*", "...Gevaar. ...Volg."]
            : ["Waarom zou ik je vertrouwen?", "De Porro nam mijn vriend...", "Bewijs je waarde."];

        dog.userData = { type: 'npc', id, name, mission, dialogues };
        this.scene.add(dog);
        this.npcs.push(dog);
    }

    createCrow() {
        const pos = this.zones.karen.center;
        const crow = new THREE.Group();
        const mat = new THREE.MeshLambertMaterial({ color: 0x1a1a1a });

        const body = new THREE.Mesh(new THREE.SphereGeometry(0.3, 6, 6), mat);
        body.scale.set(1, 0.7, 1.3);
        crow.add(body);

        const head = new THREE.Mesh(new THREE.SphereGeometry(0.2, 6, 6), mat);
        head.position.set(0, 0.25, 0.25);
        crow.add(head);

        const beak = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.25, 4), mat);
        beak.position.set(0, 0.2, 0.4);
        beak.rotation.x = Math.PI / 2;
        crow.add(beak);

        // Wings
        const wingGeom = new THREE.BoxGeometry(0.5, 0.05, 0.3);
        [-0.35, 0.35].forEach((x, i) => {
            const wing = new THREE.Mesh(wingGeom, mat);
            wing.position.set(x, 0.05, 0);
            wing.rotation.z = i === 0 ? -0.3 : 0.3;
            crow.add(wing);
        });

        const h = this.getTerrainHeight(pos.x, pos.z) + 10;
        crow.position.set(pos.x, h, pos.z);
        crow.userData = {
            type: 'npc', id: 'karen', name: 'Karen (Kraai)', mission: 5,
            dialogues: ["Oh, JIJ weer?!", "Niemand luistert naar mij!", "De jager... laat me vertellen..."]
        };
        this.scene.add(crow);
        this.npcs.push(crow);
    }

    createWolf() {
        const pos = this.zones.susi.center;
        const wolf = new THREE.Group();
        const mat = new THREE.MeshLambertMaterial({ color: 0x505050 });

        const body = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.9, 2), mat);
        body.position.y = 1;
        body.castShadow = true;
        wolf.add(body);

        const head = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.5, 0.8), mat);
        head.position.set(0, 1.25, 1.2);
        wolf.add(head);

        const snout = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.25, 0.45), new THREE.MeshLambertMaterial({ color: 0x3a3a3a }));
        snout.position.set(0, 1.15, 1.6);
        wolf.add(snout);

        // Yellow eyes
        const eyeMat = new THREE.MeshBasicMaterial({ color: 0xffcc00 });
        [-0.15, 0.15].forEach(x => {
            const eye = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 6), eyeMat);
            eye.position.set(x, 1.3, 1.5);
            wolf.add(eye);
        });

        // Ears
        [-0.2, 0.2].forEach(x => {
            const ear = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.3, 4), mat);
            ear.position.set(x, 1.6, 1.1);
            wolf.add(ear);
        });

        // Legs
        [[-0.4, 0.6], [0.4, 0.6], [-0.4, -0.6], [0.4, -0.6]].forEach(([x, z]) => {
            const leg = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.7, 0.2), mat);
            leg.position.set(x, 0.35, z);
            wolf.add(leg);
        });

        const h = this.getTerrainHeight(pos.x, pos.z);
        wolf.position.set(pos.x, h + 0.5, pos.z);
        wolf.userData = {
            type: 'npc', id: 'susi', name: 'Susi (Wolf)', mission: 6,
            dialogues: ["Dit is MIJN bos.", "Bewijs je kennis.", "Beantwoord mijn raadsels."]
        };
        this.scene.add(wolf);
        this.npcs.push(wolf);
    }

    createHunter() {
        const pos = this.zones.hunter.center;
        const hunter = new THREE.Group();

        const body = new THREE.Mesh(
            new THREE.BoxGeometry(0.7, 1.4, 0.4),
            new THREE.MeshLambertMaterial({ color: 0x2d4a3e })
        );
        body.position.y = 1.4;
        hunter.add(body);

        const head = new THREE.Mesh(
            new THREE.BoxGeometry(0.45, 0.45, 0.45),
            new THREE.MeshLambertMaterial({ color: 0xdeb887 })
        );
        head.position.set(0, 2.35, 0);
        hunter.add(head);

        // Red glitching eyes
        const eyeMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        [-0.1, 0.1].forEach(x => {
            const eye = new THREE.Mesh(new THREE.SphereGeometry(0.04, 6, 6), eyeMat);
            eye.position.set(x, 2.4, 0.2);
            hunter.add(eye);
        });

        // Glitch effect
        const glitch = new THREE.Mesh(
            new THREE.BoxGeometry(0.9, 1.8, 0.6),
            new THREE.MeshBasicMaterial({ color: 0xff00ff, transparent: true, opacity: 0.25, wireframe: true })
        );
        glitch.position.y = 1.5;
        hunter.add(glitch);
        hunter.userData.glitch = glitch;

        const h = this.getTerrainHeight(pos.x, pos.z);
        hunter.position.set(pos.x, h + 0.5, pos.z);
        hunter.userData = {
            type: 'npc', id: 'hunter', name: 'Metsästäjä (Jager)', mission: 7, corrupted: true,
            dialogues: ["Ben... ben ik de jager?", "Of word ik gejaagd?", "De stemmen... ze LIEGEN!"]
        };
        this.scene.add(hunter);
        this.npcs.push(hunter);
    }

    createBear() {
        const pos = this.zones.karhu.center;
        const bear = new THREE.Group();
        const mat = new THREE.MeshLambertMaterial({ color: 0x5c4033 });

        const body = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.4, 2.2), mat);
        body.position.y = 1.2;
        body.castShadow = true;
        bear.add(body);

        const head = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.8, 0.9), mat);
        head.position.set(0, 1.9, 1.2);
        bear.add(head);

        const snout = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.35, 0.4), new THREE.MeshLambertMaterial({ color: 0x4a3728 }));
        snout.position.set(0, 1.75, 1.6);
        bear.add(snout);

        // Ears
        const earMat = mat;
        [-0.35, 0.35].forEach(x => {
            const ear = new THREE.Mesh(new THREE.SphereGeometry(0.18, 6, 6), earMat);
            ear.position.set(x, 2.4, 1.1);
            bear.add(ear);
        });

        // Legs
        [[-0.55, 0.6], [0.55, 0.6], [-0.55, -0.6], [0.55, -0.6]].forEach(([x, z]) => {
            const leg = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.7, 0.4), mat);
            leg.position.set(x, 0.35, z);
            bear.add(leg);
        });

        const h = this.getTerrainHeight(pos.x, pos.z);
        bear.position.set(pos.x, h + 0.5, pos.z);
        bear.userData = {
            type: 'npc', id: 'karhu', name: 'Karhu (Beer)', mission: 8,
            dialogues: ["Ik was zoals jij, ooit...", "De Porro verandert alles.", "Maar niet alles is verloren."]
        };
        this.scene.add(bear);
        this.npcs.push(bear);
    }

    createSchool() {
        const pos = this.zones.koulu.center;
        const school = new THREE.Group();

        // Main building
        const building = new THREE.Mesh(
            new THREE.BoxGeometry(18, 7, 10),
            new THREE.MeshLambertMaterial({ color: 0x2d5a27 })
        );
        building.position.y = 3.5;
        building.castShadow = true;
        school.add(building);

        // Roof
        const roof = new THREE.Mesh(
            new THREE.ConeGeometry(12, 4, 4),
            new THREE.MeshLambertMaterial({ color: 0x8b0000 })
        );
        roof.position.y = 9;
        roof.rotation.y = Math.PI / 4;
        school.add(roof);

        // Windows
        const windowMat = new THREE.MeshBasicMaterial({ color: 0xffffcc });
        for (let i = -2; i <= 2; i++) {
            if (i === 0) continue;
            const win = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.6, 0.1), windowMat);
            win.position.set(i * 3, 4, 5.05);
            school.add(win);
        }

        // Door
        const door = new THREE.Mesh(
            new THREE.BoxGeometry(1.8, 3, 0.2),
            new THREE.MeshLambertMaterial({ color: 0x4a3728 })
        );
        door.position.set(0, 1.5, 5.1);
        school.add(door);

        // Bell tower
        const tower = new THREE.Mesh(
            new THREE.BoxGeometry(2.5, 4, 2.5),
            new THREE.MeshLambertMaterial({ color: 0x2d5a27 })
        );
        tower.position.set(0, 9, 0);
        school.add(tower);

        const towerRoof = new THREE.Mesh(
            new THREE.ConeGeometry(2, 2.5, 4),
            new THREE.MeshLambertMaterial({ color: 0x8b0000 })
        );
        towerRoof.position.set(0, 12.5, 0);
        towerRoof.rotation.y = Math.PI / 4;
        school.add(towerRoof);

        const h = this.getTerrainHeight(pos.x, pos.z);
        school.position.set(pos.x, h, pos.z);
        school.userData = {
            type: 'npc', id: 'koulu', name: 'Koulu (Oude School)', mission: 9,
            dialogues: ["Kinderen lachten hier...", "Ik herinner me warmte...", "Help me herinneren..."]
        };
        this.scene.add(school);
        this.npcs.push(school);
    }

    createSnowParticles() {
        const count = 2000;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        this.snowVelocities = [];

        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 200;
            positions[i * 3 + 1] = Math.random() * 60;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 200;
            this.snowVelocities.push({ y: 0.4 + Math.random() * 0.4, x: (Math.random() - 0.5) * 0.1 });
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        this.snow = new THREE.Points(geometry, new THREE.PointsMaterial({
            color: 0xffffff, size: 0.25, transparent: true, opacity: 0.8
        }));
        this.scene.add(this.snow);
    }

    createAurora() {
        const geometry = new THREE.PlaneGeometry(300, 60, 60, 12);
        const material = new THREE.ShaderMaterial({
            uniforms: { time: { value: 0 }, intensity: { value: 0 } },
            vertexShader: `
                varying vec2 vUv;
                uniform float time;
                void main() {
                    vUv = uv;
                    vec3 pos = position;
                    pos.y += sin(pos.x * 0.04 + time) * 6.0;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                }
            `,
            fragmentShader: `
                varying vec2 vUv;
                uniform float time, intensity;
                void main() {
                    vec3 green = vec3(0.0, 1.0, 0.4);
                    vec3 blue = vec3(0.2, 0.4, 1.0);
                    float t = sin(vUv.x * 8.0 + time) * 0.5 + 0.5;
                    vec3 color = mix(green, blue, t);
                    float alpha = (1.0 - vUv.y) * 0.5 * intensity;
                    gl_FragColor = vec4(color, alpha);
                }
            `,
            transparent: true, side: THREE.DoubleSide, depthWrite: false
        });

        this.aurora = new THREE.Mesh(geometry, material);
        this.aurora.position.set(0, 100, -80);
        this.aurora.rotation.x = -0.25;
        this.scene.add(this.aurora);
    }

    createBirds() {
        for (let flock = 0; flock < 6; flock++) {
            const center = new THREE.Vector3(
                (Math.random() - 0.5) * this.worldSize * 0.6,
                35 + Math.random() * 25,
                (Math.random() - 0.5) * this.worldSize * 0.6
            );
            const speed = 8 + Math.random() * 6;
            const direction = Math.random() * Math.PI * 2;
            const flockSize = 4 + Math.floor(Math.random() * 6);

            for (let i = 0; i < flockSize; i++) {
                const bird = new THREE.Group();

                const body = new THREE.Mesh(
                    new THREE.SphereGeometry(0.15, 5, 5),
                    new THREE.MeshLambertMaterial({ color: 0x2a2a2a })
                );
                body.scale.set(1, 0.6, 1.4);
                bird.add(body);

                const wingGeom = new THREE.BoxGeometry(0.6, 0.04, 0.2);
                const wingMat = new THREE.MeshLambertMaterial({ color: 0x1a1a1a });
                const leftWing = new THREE.Mesh(wingGeom, wingMat);
                leftWing.position.set(-0.3, 0, 0);
                bird.add(leftWing);
                const rightWing = new THREE.Mesh(wingGeom, wingMat);
                rightWing.position.set(0.3, 0, 0);
                bird.add(rightWing);

                bird.position.set(
                    center.x + (Math.random() - 0.5) * 8,
                    center.y + (Math.random() - 0.5) * 4,
                    center.z + (Math.random() - 0.5) * 8
                );

                bird.userData = {
                    center: center.clone(), speed, direction,
                    phase: Math.random() * Math.PI * 2,
                    leftWing, rightWing,
                    offsetX: (Math.random() - 0.5) * 8,
                    offsetZ: (Math.random() - 0.5) * 8
                };

                this.scene.add(bird);
                this.birds.push(bird);
            }
        }
    }

    setupControls() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
                e.preventDefault();
            }
        });

        document.addEventListener('keyup', (e) => this.keys[e.code] = false);

        document.addEventListener('click', () => {
            if (!this.mouseLocked && !this.inDialogue) {
                this.renderer.domElement.requestPointerLock();
            }
        });

        document.addEventListener('pointerlockchange', () => {
            this.mouseLocked = document.pointerLockElement === this.renderer.domElement;
        });

        document.addEventListener('mousemove', (e) => {
            if (this.mouseLocked && !this.inDialogue) {
                this.player.rotation.y -= e.movementX * 0.003;
                this.player.rotation.x -= e.movementY * 0.003;
                this.player.rotation.x = Math.max(-Math.PI / 2.5, Math.min(Math.PI / 4, this.player.rotation.x));
            }
        });

        document.addEventListener('wheel', (e) => {
            e.preventDefault();
            this.cameraDistance += e.deltaY * 0.015;
            this.cameraDistance = Math.max(this.cameraMinDistance, Math.min(this.cameraMaxDistance, this.cameraDistance));
        }, { passive: false });

        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    setupDialogueUI() {
        const box = document.createElement('div');
        box.id = 'dialogue-box';
        box.style.cssText = `
            position:absolute;bottom:80px;left:50%;transform:translateX(-50%);
            width:550px;max-width:90%;background:rgba(0,0,0,0.9);
            border:2px solid #4a9;border-radius:10px;padding:18px;
            color:white;font-family:'Segoe UI',Arial;display:none;z-index:1000;
        `;
        box.innerHTML = `
            <div id="npc-name" style="color:#4a9;font-weight:bold;margin-bottom:8px;"></div>
            <div id="dialogue-text" style="font-size:15px;line-height:1.5;"></div>
            <div style="margin-top:12px;font-size:11px;color:#888;">Druk E om door te gaan...</div>
        `;
        document.getElementById('game-container').appendChild(box);
        this.dialogueBox = box;
    }

    updatePlayer(delta) {
        if (this.inDialogue) return;

        const speed = (this.keys['ShiftLeft'] || this.keys['ShiftRight']) ? this.player.sprintSpeed : this.player.speed;

        const moveDir = new THREE.Vector3();
        if (this.keys['KeyW'] || this.keys['ArrowUp']) moveDir.z -= 1;
        if (this.keys['KeyS'] || this.keys['ArrowDown']) moveDir.z += 1;
        if (this.keys['KeyA'] || this.keys['ArrowLeft']) moveDir.x -= 1;
        if (this.keys['KeyD'] || this.keys['ArrowRight']) moveDir.x += 1;

        moveDir.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.player.rotation.y);
        moveDir.normalize();

        this.player.velocity.x = moveDir.x * speed;
        this.player.velocity.z = moveDir.z * speed;
        this.player.velocity.y -= 30 * delta;

        if (this.keys['Space'] && this.player.onGround) {
            this.player.velocity.y = this.player.jumpForce;
            this.player.onGround = false;
        }

        this.player.position.x += this.player.velocity.x * delta;
        this.player.position.y += this.player.velocity.y * delta;
        this.player.position.z += this.player.velocity.z * delta;

        const groundHeight = this.getTerrainHeight(this.player.position.x, this.player.position.z) + 2;

        if (this.player.position.y < groundHeight) {
            this.player.position.y = groundHeight;
            this.player.velocity.y = 0;
            this.player.onGround = true;
        }

        const bound = this.worldSize / 2 - 10;
        this.player.position.x = Math.max(-bound, Math.min(bound, this.player.position.x));
        this.player.position.z = Math.max(-bound, Math.min(bound, this.player.position.z));

        if ((this.keys['ShiftLeft'] || this.keys['ShiftRight']) && moveDir.length() > 0) {
            this.stats.energy = Math.max(0, this.stats.energy - 8 * delta);
        }

        // Update Poro
        this.poro.position.copy(this.player.position);
        this.poro.rotation.y = this.player.rotation.y + Math.PI;

        // Third-person camera
        const camX = Math.sin(this.player.rotation.y) * this.cameraDistance;
        const camZ = Math.cos(this.player.rotation.y) * this.cameraDistance;
        const camY = this.cameraHeight + Math.sin(this.player.rotation.x) * this.cameraDistance * 0.4;

        this.camera.position.x += (this.player.position.x + camX - this.camera.position.x) * this.cameraSmoothing * 2;
        this.camera.position.y += (this.player.position.y + camY - this.camera.position.y) * this.cameraSmoothing * 2;
        this.camera.position.z += (this.player.position.z + camZ - this.camera.position.z) * this.cameraSmoothing * 2;

        this.camera.lookAt(this.player.position.x, this.player.position.y + 2, this.player.position.z);

        // Animate legs
        if (moveDir.length() > 0) {
            const walk = Math.sin(Date.now() * 0.012) * 0.35;
            this.poroLegs[0].rotation.x = walk;
            this.poroLegs[1].rotation.x = -walk;
            this.poroLegs[2].rotation.x = -walk;
            this.poroLegs[3].rotation.x = walk;
        }

        if (this.keys['KeyE']) {
            this.checkNPCInteraction();
            this.collectLichen();
        }

        this.updateZone();
    }

    checkNPCInteraction() {
        if (this.inDialogue) {
            this.advanceDialogue();
            return;
        }

        for (const npc of this.npcs) {
            if (this.player.position.distanceTo(npc.position) < 6 && npc.userData.type === 'npc') {
                this.startDialogue(npc);
                break;
            }
        }
    }

    startDialogue(npc) {
        this.inDialogue = true;
        this.currentNPC = npc;
        this.dialogueQueue = [...npc.userData.dialogues];

        this.dialogueBox.style.display = 'block';
        document.getElementById('npc-name').textContent = npc.userData.name;
        document.getElementById('dialogue-text').textContent = this.dialogueQueue.shift();

        document.exitPointerLock();
    }

    advanceDialogue() {
        if (this.dialogueQueue.length > 0) {
            document.getElementById('dialogue-text').textContent = this.dialogueQueue.shift();
        } else {
            this.inDialogue = false;
            this.currentNPC = null;
            this.dialogueBox.style.display = 'none';
        }
    }

    collectLichen() {
        for (const lichen of this.lichens) {
            if (!lichen.userData.collected && this.player.position.distanceTo(lichen.position) < 3) {
                lichen.userData.collected = true;
                lichen.visible = false;
                this.lichenCollected++;
                this.stats.hunger = Math.min(100, this.stats.hunger + 15);
                this.stats.energy = Math.min(100, this.stats.energy + 10);
                this.showMessage(`🍃 Lichen! (${this.lichenCollected})`);
                break;
            }
        }
    }

    updateZone() {
        let zoneName = "Wildernis";
        for (const [id, zone] of Object.entries(this.zones)) {
            if (this.player.position.distanceTo(zone.center) < zone.radius) {
                zoneName = zone.name;
                if (zone.mission) this.porroCorruption = Math.max(this.porroCorruption, zone.mission * 8);
                break;
            }
        }
        document.getElementById('score').innerHTML = `📍 ${zoneName}<br>🌟 ${this.lichenCollected}<br>☠️ ${Math.floor(this.porroCorruption)}%`;
    }

    updateSurvival(delta) {
        this.stats.hunger = Math.max(0, this.stats.hunger - 0.8 * delta);
        this.stats.warmth = this.isNight ? Math.max(0, this.stats.warmth - 2 * delta) : Math.min(100, this.stats.warmth + 0.8 * delta);
        if (this.stats.hunger > 50) this.stats.energy = Math.min(100, this.stats.energy + 1.5 * delta);
        if (this.stats.warmth < 20 || this.stats.hunger < 20) this.stats.health = Math.max(0, this.stats.health - 4 * delta);
        else if (this.stats.warmth > 50 && this.stats.hunger > 50) this.stats.health = Math.min(100, this.stats.health + 0.8 * delta);

        document.getElementById('health-bar').style.width = this.stats.health + '%';
        document.getElementById('energy-bar').style.width = this.stats.energy + '%';
        document.getElementById('warmth-bar').style.width = this.stats.warmth + '%';
        document.getElementById('hunger-bar').style.width = this.stats.hunger + '%';
    }

    updateDayNight(delta) {
        this.dayTime += delta * 0.006;
        if (this.dayTime > 1) this.dayTime = 0;

        this.isNight = this.dayTime > 0.7 || this.dayTime < 0.2;

        const sunAngle = this.dayTime * Math.PI * 2;
        this.sunLight.position.set(Math.cos(sunAngle) * 150, Math.sin(sunAngle) * 150, 100);

        const intensity = Math.max(0, Math.sin(sunAngle));
        this.sunLight.intensity = intensity * 1.2;
        this.ambientLight.intensity = 0.3 + intensity * 0.3;

        if (this.isNight) {
            this.scene.background.setHex(0x0a0a1a);
            this.scene.fog.color.setHex(0x0a0a1a);
            if (this.aurora && this.dayTime > 0.75) {
                this.aurora.material.uniforms.intensity.value = Math.min(1, (this.dayTime - 0.75) * 5);
            }
        } else {
            const t = this.dayTime < 0.3 ? this.dayTime / 0.3 : (this.dayTime > 0.6 ? (0.7 - this.dayTime) / 0.1 : 1);
            const color = new THREE.Color().lerpColors(new THREE.Color(0x1a1a2e), new THREE.Color(0x87CEEB), Math.min(1, Math.max(0, t)));
            this.scene.background.copy(color);
            this.scene.fog.color.copy(color);
            if (this.aurora) this.aurora.material.uniforms.intensity.value = 0;
        }
    }

    updateSnow(delta) {
        const positions = this.snow.geometry.attributes.position.array;
        for (let i = 0; i < positions.length / 3; i++) {
            positions[i * 3 + 1] -= this.snowVelocities[i].y * delta * 6;
            positions[i * 3] += this.snowVelocities[i].x;
            if (positions[i * 3 + 1] < -5) {
                positions[i * 3 + 1] = 60;
                positions[i * 3] = this.player.position.x + (Math.random() - 0.5) * 100;
                positions[i * 3 + 2] = this.player.position.z + (Math.random() - 0.5) * 100;
            }
        }
        this.snow.geometry.attributes.position.needsUpdate = true;
    }

    updateAurora(delta) {
        if (this.aurora) {
            this.aurora.material.uniforms.time.value += delta;
            this.aurora.position.x = this.player.position.x;
            this.aurora.position.z = this.player.position.z - 80;
        }
    }

    updateBirds(delta) {
        const time = Date.now() * 0.001;
        const bound = this.worldSize / 2 - 30;

        for (const bird of this.birds) {
            const d = bird.userData;

            d.center.x += Math.sin(d.direction) * d.speed * delta;
            d.center.z += Math.cos(d.direction) * d.speed * delta;

            if (Math.abs(d.center.x) > bound) d.center.x *= -0.9;
            if (Math.abs(d.center.z) > bound) d.center.z *= -0.9;

            bird.position.x = d.center.x + d.offsetX + Math.sin(time + d.phase) * 2;
            bird.position.z = d.center.z + d.offsetZ + Math.cos(time * 0.8 + d.phase) * 2;
            bird.position.y = d.center.y + Math.sin(time * 0.6 + d.phase) * 3;

            bird.rotation.y = d.direction + Math.PI;

            const wing = Math.sin(time * 10 + d.phase) * 0.5;
            d.leftWing.rotation.z = -wing - 0.2;
            d.rightWing.rotation.z = wing + 0.2;
        }
    }

    updateNPCs() {
        const time = Date.now() * 0.001;
        for (const npc of this.npcs) {
            if (npc.userData.id === 'karen') {
                npc.position.y = this.getTerrainHeight(npc.position.x, npc.position.z) + 10 + Math.sin(time * 2) * 0.3;
            }
            if (npc.userData.glitch) {
                npc.userData.glitch.scale.x = 1 + Math.sin(time * 6) * 0.15;
                npc.userData.glitch.material.opacity = 0.2 + Math.sin(time * 4) * 0.1;
            }
        }
    }

    updateMinimap() {
        const canvas = document.getElementById('minimap');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        canvas.width = 150;
        canvas.height = 150;

        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(0, 0, 150, 150);

        const scale = 0.35;

        // Zones
        for (const zone of Object.values(this.zones)) {
            const x = 75 + (zone.center.x - this.player.position.x) * scale;
            const z = 75 + (zone.center.z - this.player.position.z) * scale;
            if (x > -30 && x < 180 && z > -30 && z < 180) {
                ctx.fillStyle = zone.mission === 9 ? 'rgba(255,0,0,0.2)' : 'rgba(74,153,153,0.15)';
                ctx.beginPath();
                ctx.arc(x, z, zone.radius * scale, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // NPCs
        ctx.fillStyle = '#ffcc00';
        for (const npc of this.npcs) {
            const x = 75 + (npc.position.x - this.player.position.x) * scale;
            const z = 75 + (npc.position.z - this.player.position.z) * scale;
            if (x > 5 && x < 145 && z > 5 && z < 145) {
                ctx.beginPath();
                ctx.arc(x, z, 3, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Player
        ctx.fillStyle = '#FF6B6B';
        ctx.beginPath();
        ctx.arc(75, 75, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#FF6B6B';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(75, 75);
        ctx.lineTo(75 - Math.sin(this.player.rotation.y) * 10, 75 - Math.cos(this.player.rotation.y) * 10);
        ctx.stroke();
    }

    showMessage(text) {
        const msg = document.getElementById('message');
        if (msg) {
            msg.textContent = text;
            msg.classList.add('show');
            setTimeout(() => msg.classList.remove('show'), 2500);
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const delta = Math.min(this.clock.getDelta(), 0.1);

        this.updatePlayer(delta);
        this.updateSurvival(delta);
        this.updateDayNight(delta);
        this.updateSnow(delta);
        this.updateAurora(delta);
        this.updateBirds(delta);
        this.updateNPCs();
        this.updateMinimap();

        this.renderer.render(this.scene, this.camera);
    }
}

// Start
window.addEventListener('load', () => new PoroGame());
