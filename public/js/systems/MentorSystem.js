/**
 * AI Academy - Mentor System
 * Manages mentor NPCs per world, their 3D models, and interactions
 */

class MentorSystem {
    constructor(game) {
        this.game = game;
        this.mentors = []; // Active 3D mentor objects
        this.nearbyMentor = null;
    }

    loadWorldMentors(worldId) {
        this.unloadMentors();
        const mentorDefs = getMentorsForWorld(worldId);

        for (const def of mentorDefs) {
            const model = this._createMentorModel(def);
            if (!model) continue;

            model.name = def.key;
            model.userData = {
                type: 'mentor',
                mentorKey: def.key,
                mentorName: def.name,
                challenges: def.challenges || []
            };

            const height = this.game.chunkManager.getHeightAt(def.position.x, def.position.z);
            model.position.set(def.position.x, height, def.position.z);

            this.game.sceneManager.add(model);
            this.mentors.push(model);
        }
    }

    unloadMentors() {
        for (const mentor of this.mentors) {
            this.game.sceneManager.remove(mentor);
            mentor.traverse(obj => {
                if (obj.geometry) obj.geometry.dispose();
                if (obj.material) obj.material.dispose();
            });
        }
        this.mentors = [];
        this.nearbyMentor = null;
    }

    _createMentorModel(def) {
        switch (def.modelCreator) {
            case 'school': return this._createSchool();
            case 'mushroom': return this._createMushroom();
            case 'amstaff': return this._createAmstaff();
            case 'crow': return this._createCrow();
            case 'flame': return this._createFlame();
            case 'moss': return this._createMoss();
            case 'echo_crystal': return this._createEchoCrystal();
            case 'akita': return this._createAkita();
            case 'scarecrow': return this._createScarecrow();
            case 'wolf': return this._createWolf();
            case 'crystal_pillar': return this._createCrystalPillar();
            case 'ghostly_figure': return this._createGhostlyFigure();
            case 'hunter': return this._createHunter();
            case 'automaton': return this._createAutomaton();
            case 'hologram': return this._createHologram();
            case 'cyborg': return this._createCyborg();
            case 'statue': return this._createStatue();
            case 'mirror_pillar': return this._createMirrorPillar();
            default: return this._createDefaultMentor();
        }
    }

    _createSchool() {
        const group = new THREE.Group();
        const buildingMat = new THREE.MeshLambertMaterial({ color: 0x228B22 });
        const buildingGeom = new THREE.BoxGeometry(8, 4, 6);
        const building = new THREE.Mesh(buildingGeom, buildingMat);
        building.position.y = 2;
        group.add(building);

        const roofMat = new THREE.MeshLambertMaterial({ color: 0x8B0000 });
        const roofGeom = new THREE.ConeGeometry(5, 2, 4);
        const roof = new THREE.Mesh(roofGeom, roofMat);
        roof.position.y = 5;
        roof.rotation.y = Math.PI / 4;
        group.add(roof);

        const windowMat = new THREE.MeshBasicMaterial({ color: 0xFFD700 });
        const windowGeom = new THREE.PlaneGeometry(0.8, 1.2);
        [[-3, 2, 3.01], [-1, 2, 3.01], [1, 2, 3.01], [3, 2, 3.01]].forEach(pos => {
            const win = new THREE.Mesh(windowGeom, windowMat);
            win.position.set(...pos);
            group.add(win);
        });

        // Mentor indicator (floating orb)
        this._addMentorIndicator(group, 7);
        return group;
    }

    _createMushroom() {
        const group = new THREE.Group();
        const caps = [
            { x: 0, z: 0, h: 1.2, r: 0.5 },
            { x: 0.4, z: 0.3, h: 0.8, r: 0.35 },
            { x: -0.3, z: 0.4, h: 0.9, r: 0.4 }
        ];
        caps.forEach(cap => {
            const stemGeom = new THREE.CylinderGeometry(0.1, 0.15, cap.h * 0.6, 8);
            const stemMat = new THREE.MeshLambertMaterial({ color: 0xF5F5DC });
            const stem = new THREE.Mesh(stemGeom, stemMat);
            stem.position.set(cap.x, cap.h * 0.3, cap.z);
            group.add(stem);

            const capGeom = new THREE.SphereGeometry(cap.r, 8, 6);
            const capMat = new THREE.MeshLambertMaterial({
                color: 0xCD5C5C, emissive: 0x330000, emissiveIntensity: 0.2
            });
            const capMesh = new THREE.Mesh(capGeom, capMat);
            capMesh.position.set(cap.x, cap.h * 0.6 + cap.r * 0.5, cap.z);
            capMesh.scale.y = 0.5;
            group.add(capMesh);
        });
        this._addMentorIndicator(group, 2.5);
        return group;
    }

    _createAmstaff() {
        const group = new THREE.Group();
        const furMat = new THREE.MeshLambertMaterial({ color: 0x4A4A4A });
        const bodyGeom = new THREE.CapsuleGeometry(0.5, 0.7, 4, 8);
        const body = new THREE.Mesh(bodyGeom, furMat);
        body.rotation.z = Math.PI / 2;
        body.position.y = 0.5;
        group.add(body);
        const headGeom = new THREE.SphereGeometry(0.35, 8, 6);
        const head = new THREE.Mesh(headGeom, furMat);
        head.position.set(0.6, 0.8, 0);
        group.add(head);
        this._addMentorIndicator(group, 2);
        return group;
    }

    _createCrow() {
        const group = new THREE.Group();
        const featherMat = new THREE.MeshLambertMaterial({ color: 0x1a1a1a });
        const bodyGeom = new THREE.SphereGeometry(0.3, 8, 6);
        const body = new THREE.Mesh(bodyGeom, featherMat);
        body.scale.set(1, 1, 1.3);
        body.position.y = 2.5;
        group.add(body);

        // Perch
        const perchGeom = new THREE.CylinderGeometry(0.05, 0.08, 2.5, 6);
        const perchMat = new THREE.MeshLambertMaterial({ color: 0x4a3728 });
        const perch = new THREE.Mesh(perchGeom, perchMat);
        perch.position.y = 1.25;
        group.add(perch);

        this._addMentorIndicator(group, 3.5);
        return group;
    }

    _createFlame() {
        const group = new THREE.Group();
        const flameMat = new THREE.MeshBasicMaterial({
            color: 0xff6600, transparent: true, opacity: 0.8
        });
        for (let i = 0; i < 5; i++) {
            const flameGeom = new THREE.ConeGeometry(0.3 - i * 0.05, 0.8 + i * 0.2, 6);
            const flame = new THREE.Mesh(flameGeom, flameMat.clone());
            flame.material.color.setHSL(0.08 + i * 0.02, 1, 0.5);
            flame.position.set((Math.random() - 0.5) * 0.2, 0.5 + i * 0.15, (Math.random() - 0.5) * 0.2);
            group.add(flame);
        }
        this._addMentorIndicator(group, 2.5);
        return group;
    }

    _createMoss() {
        const group = new THREE.Group();
        const mossMat = new THREE.MeshLambertMaterial({
            color: 0x228B22, emissive: 0x004400, emissiveIntensity: 0.3
        });
        const moundGeom = new THREE.SphereGeometry(1, 12, 8);
        const mound = new THREE.Mesh(moundGeom, mossMat);
        mound.scale.set(1.5, 0.5, 1.5);
        mound.position.y = 0.25;
        group.add(mound);
        this._addMentorIndicator(group, 2);
        return group;
    }

    _createEchoCrystal() {
        const group = new THREE.Group();
        const crystalMat = new THREE.MeshLambertMaterial({
            color: 0x8080ff, emissive: 0x4040ff, emissiveIntensity: 0.4,
            transparent: true, opacity: 0.7
        });
        for (let i = 0; i < 4; i++) {
            const geom = new THREE.OctahedronGeometry(0.5 + i * 0.15, 0);
            const crystal = new THREE.Mesh(geom, crystalMat);
            crystal.position.set((Math.random() - 0.5) * 0.8, 0.5 + i * 0.6, (Math.random() - 0.5) * 0.8);
            crystal.rotation.set(Math.random(), Math.random(), Math.random());
            group.add(crystal);
        }
        this._addMentorIndicator(group, 3);
        return group;
    }

    _createAkita() {
        const group = new THREE.Group();
        const furMat = new THREE.MeshLambertMaterial({ color: 0xFFFFF0 });
        const bodyGeom = new THREE.CapsuleGeometry(0.4, 0.8, 4, 8);
        const body = new THREE.Mesh(bodyGeom, furMat);
        body.rotation.z = Math.PI / 2;
        body.position.y = 0.6;
        group.add(body);
        const headGeom = new THREE.SphereGeometry(0.35, 8, 6);
        const head = new THREE.Mesh(headGeom, furMat);
        head.position.set(0.6, 0.9, 0);
        group.add(head);
        this._addMentorIndicator(group, 2);
        return group;
    }

    _createScarecrow() {
        const group = new THREE.Group();
        // Post
        const postGeom = new THREE.CylinderGeometry(0.08, 0.1, 2.5, 6);
        const postMat = new THREE.MeshLambertMaterial({ color: 0x5a4030 });
        const post = new THREE.Mesh(postGeom, postMat);
        post.position.y = 1.25;
        group.add(post);
        // Arms
        const armGeom = new THREE.CylinderGeometry(0.05, 0.05, 1.5, 6);
        const arm = new THREE.Mesh(armGeom, postMat);
        arm.rotation.z = Math.PI / 2;
        arm.position.y = 2;
        group.add(arm);
        // Head
        const headGeom = new THREE.SphereGeometry(0.25, 8, 6);
        const headMat = new THREE.MeshLambertMaterial({ color: 0xdaa520 });
        const head = new THREE.Mesh(headGeom, headMat);
        head.position.y = 2.6;
        group.add(head);
        // Hat
        const hatGeom = new THREE.ConeGeometry(0.35, 0.4, 6);
        const hatMat = new THREE.MeshLambertMaterial({ color: 0x4a3020 });
        const hat = new THREE.Mesh(hatGeom, hatMat);
        hat.position.y = 2.9;
        group.add(hat);

        this._addMentorIndicator(group, 3.5);
        return group;
    }

    _createWolf() {
        const group = new THREE.Group();
        const furMat = new THREE.MeshLambertMaterial({ color: 0x6a6a7a });
        const bodyGeom = new THREE.CapsuleGeometry(0.45, 1.0, 4, 8);
        const body = new THREE.Mesh(bodyGeom, furMat);
        body.rotation.z = Math.PI / 2;
        body.position.y = 0.7;
        group.add(body);
        this._addMentorIndicator(group, 2);
        return group;
    }

    _createCrystalPillar() { return this._createEchoCrystal(); }
    _createGhostlyFigure() { return this._createDefaultMentor(0x8888ff, 0.6); }
    _createHunter() {
        const group = new THREE.Group();
        const coatMat = new THREE.MeshLambertMaterial({ color: 0x2F4F2F });
        const coatGeom = new THREE.CylinderGeometry(0.3, 0.4, 1.2, 8);
        const coat = new THREE.Mesh(coatGeom, coatMat);
        coat.position.y = 0.8;
        group.add(coat);
        const headGeom = new THREE.SphereGeometry(0.25, 8, 6);
        const headMat = new THREE.MeshLambertMaterial({ color: 0xDEB887 });
        const head = new THREE.Mesh(headGeom, headMat);
        head.position.y = 1.6;
        group.add(head);
        this._addMentorIndicator(group, 2.5);
        return group;
    }
    _createAutomaton() { return this._createDefaultMentor(0x8B7355); }
    _createHologram() { return this._createDefaultMentor(0x00aaff, 0.5); }
    _createCyborg() { return this._createDefaultMentor(0x6a6a8a); }
    _createStatue() { return this._createDefaultMentor(0xe8e0d8); }
    _createMirrorPillar() { return this._createDefaultMentor(0xccccff, 0.7); }

    _createDefaultMentor(color = 0xaaaaaa, opacity = 1) {
        const group = new THREE.Group();
        const mat = new THREE.MeshLambertMaterial({
            color: color || 0xaaaaaa,
            transparent: opacity < 1,
            opacity
        });
        const geom = new THREE.CapsuleGeometry(0.4, 1, 4, 8);
        const mesh = new THREE.Mesh(geom, mat);
        mesh.position.y = 0.8;
        group.add(mesh);
        this._addMentorIndicator(group, 2.5);
        return group;
    }

    _addMentorIndicator(group, height) {
        // Floating glowing orb above mentor
        const orbGeom = new THREE.SphereGeometry(0.15, 8, 8);
        const orbMat = new THREE.MeshBasicMaterial({
            color: 0x00ffaa, transparent: true, opacity: 0.8
        });
        const orb = new THREE.Mesh(orbGeom, orbMat);
        orb.position.y = height;
        orb.userData.isMentorOrb = true;
        group.add(orb);
    }

    update(delta, playerPosition) {
        this.nearbyMentor = null;

        for (const mentor of this.mentors) {
            const dx = mentor.position.x - playerPosition.x;
            const dz = mentor.position.z - playerPosition.z;
            const distance = Math.sqrt(dx * dx + dz * dz);

            if (distance < 8 && (!this.nearbyMentor || distance < this.nearbyMentor._distance)) {
                this.nearbyMentor = mentor;
                mentor._distance = distance;
            }

            // Idle animation - bob mentor orb (use baseY to prevent drift)
            mentor.traverse(child => {
                if (child.userData.isMentorOrb) {
                    if (child.userData.orbBaseY === undefined) {
                        child.userData.orbBaseY = child.position.y;
                    }
                    child.position.y = child.userData.orbBaseY + Math.sin(Date.now() * 0.003 + mentor.position.x) * 0.3;

                    // Pulse brighter when player is nearby
                    if (distance < 12) {
                        const pulse = 0.6 + Math.sin(Date.now() * 0.006) * 0.3;
                        child.material.opacity = pulse;
                        const scale = 1 + (1 - distance / 12) * 0.5;
                        child.scale.setScalar(scale);
                    } else {
                        child.material.opacity = 0.8;
                        child.scale.setScalar(1);
                    }
                }
            });

            // Face player when nearby
            if (distance < 15) {
                const targetAngle = Math.atan2(
                    playerPosition.x - mentor.position.x,
                    playerPosition.z - mentor.position.z
                );
                mentor.rotation.y = targetAngle;
            }
        }
    }
}

window.MentorSystem = MentorSystem;
