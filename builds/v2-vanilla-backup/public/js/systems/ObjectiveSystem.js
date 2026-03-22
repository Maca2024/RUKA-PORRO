/**
 * AI Academy - Objective System
 * Guides the player with clear goals, compass arrows, and tutorial
 */

const getMentorsForWorld = window.getMentorsForWorld;
const CONFIG = window.CONFIG;
const i18n = window.i18n;

class ObjectiveSystem {
    constructor(game) {
        this.game = game;
        this.currentObjective = null;
        this.objectives = [];
        this.tutorialShown = false;
        this.compassTarget = null;

        this._createUI();
    }

    _createUI() {
        // Objective panel (top-center)
        this.panel = document.createElement('div');
        this.panel.id = 'objective-panel';
        this.panel.innerHTML = `
            <div class="obj-icon">!</div>
            <div class="obj-text">
                <div id="obj-title" class="obj-title"></div>
                <div id="obj-desc" class="obj-desc"></div>
            </div>
        `;
        document.getElementById('game-container').appendChild(this.panel);

        // Compass arrow (screen edge pointer)
        this.compass = document.createElement('div');
        this.compass.id = 'compass-arrow';
        this.compass.innerHTML = `
            <div class="compass-inner">
                <div class="compass-arrow-shape"></div>
                <div class="compass-label" id="compass-label"></div>
                <div class="compass-dist" id="compass-dist"></div>
            </div>
        `;
        document.getElementById('game-container').appendChild(this.compass);

        // Welcome overlay
        this.welcomeEl = document.createElement('div');
        this.welcomeEl.id = 'welcome-overlay';
        document.getElementById('game-container').appendChild(this.welcomeEl);
    }

    showWelcome() {
        if (localStorage.getItem('ai_academy_welcomed')) {
            this.tutorialShown = true;
            this._generateObjectives();
            return;
        }

        const lang = i18n.lang;
        this.welcomeEl.innerHTML = `
            <div class="welcome-panel">
                <h1>${lang === 'nl' ? 'Welkom bij AI Academy!' : 'Welcome to AI Academy!'}</h1>
                <div class="welcome-porro"></div>
                <p class="welcome-intro">${lang === 'nl'
                    ? 'Jij bent Porro, een rendier dat door 10 werelden reist om alles over AI te leren. Elke wereld heeft mentoren die je uitdagingen geven.'
                    : 'You are Porro, a reindeer traveling through 10 worlds to learn all about AI. Each world has mentors who give you challenges.'}</p>
                <div class="welcome-controls">
                    <div class="wc-row"><span class="wc-key">WASD</span><span>${lang === 'nl' ? 'Bewegen & strafing' : 'Move & strafe'}</span></div>
                    <div class="wc-row"><span class="wc-key">MUIS</span><span>${lang === 'nl' ? 'Rondkijken (klik eerst)' : 'Look around (click first)'}</span></div>
                    <div class="wc-row"><span class="wc-key">SHIFT</span><span>${lang === 'nl' ? 'Rennen' : 'Sprint'}</span></div>
                    <div class="wc-row"><span class="wc-key">SPACE</span><span>${lang === 'nl' ? 'Springen' : 'Jump'}</span></div>
                    <div class="wc-row"><span class="wc-key">V</span><span>${lang === 'nl' ? 'Praten met mentor' : 'Talk to mentor'}</span></div>
                    <div class="wc-row"><span class="wc-key">C</span><span>${lang === 'nl' ? 'Camera wisselen' : 'Toggle camera'}</span></div>
                    <div class="wc-row"><span class="wc-key">M</span><span>${lang === 'nl' ? 'Wereldkaart' : 'World map'}</span></div>
                </div>
                <div class="welcome-goal">
                    <h3>${lang === 'nl' ? 'Jouw missie:' : 'Your mission:'}</h3>
                    <p>${lang === 'nl'
                        ? 'Vind mentoren (groene bollen), praat met ze, voltooi uitdagingen en activeer het portaal om naar de volgende wereld te reizen!'
                        : 'Find mentors (green orbs), talk to them, complete challenges and activate the portal to travel to the next world!'}</p>
                </div>
                <button class="welcome-start" onclick="window.game?.objectiveSystem?.dismissWelcome()">
                    ${lang === 'nl' ? 'Begin het avontuur!' : 'Start the adventure!'}
                </button>
            </div>
        `;
        this.welcomeEl.style.display = 'flex';
    }

    dismissWelcome() {
        this.welcomeEl.style.display = 'none';
        localStorage.setItem('ai_academy_welcomed', 'true');
        this.tutorialShown = true;
        this._generateObjectives();
    }

    _generateObjectives() {
        const worldId = this.game.worldManager?.currentWorldId || 1;
        const lang = i18n.lang;
        const challengeSystem = this.game.challengeSystem;
        const saveSystem = this.game.saveSystem;

        this.objectives = [];

        // Check what's been done
        const mentorsToMeet = [];
        const challengesToDo = [];
        const mentorDefs = getMentorsForWorld(worldId);

        for (const mentor of mentorDefs) {
            const met = saveSystem?.data?.mentorsMet?.includes(mentor.key);
            if (!met) {
                mentorsToMeet.push(mentor);
            }

            if (mentor.challenges) {
                for (const c of mentor.challenges) {
                    if (!saveSystem?.isChallengeCompleted(c.id)) {
                        challengesToDo.push({ challenge: c, mentor });
                    }
                }
            }
        }

        // Build objective list
        if (mentorsToMeet.length > 0) {
            const m = mentorsToMeet[0];
            this.objectives.push({
                type: 'meet_mentor',
                title: lang === 'nl' ? `Vind ${m.name}` : `Find ${m.name}`,
                desc: lang === 'nl'
                    ? `Loop naar de groene bol en druk V om te praten`
                    : `Walk to the green orb and press V to talk`,
                target: m.position,
                mentorKey: m.key
            });
        }

        if (challengesToDo.length > 0) {
            const cd = challengesToDo[0];
            this.objectives.push({
                type: 'challenge',
                title: lang === 'nl' ? (cd.challenge.title_nl || 'Uitdaging') : (cd.challenge.title_en || 'Challenge'),
                desc: lang === 'nl'
                    ? `Praat met ${cd.mentor.name} en start de uitdaging`
                    : `Talk to ${cd.mentor.name} and start the challenge`,
                target: cd.mentor.position,
                mentorKey: cd.mentor.key
            });
        }

        // Portal objective
        const completed = challengeSystem?.getCompletedCount(worldId) || 0;
        const total = challengeSystem?.getTotalCount(worldId) || 1;
        const pct = total > 0 ? completed / total : 0;

        if (pct >= CONFIG.academy.portalActivationThreshold) {
            this.objectives.push({
                type: 'portal',
                title: lang === 'nl' ? 'Ga naar het portaal!' : 'Go to the portal!',
                desc: lang === 'nl'
                    ? 'Het portaal is actief - loop erin om naar de volgende wereld te reizen'
                    : 'The portal is active - walk in to travel to the next world',
                target: this.game.portalSystem?.portalPosition
            });
        } else if (total > 0) {
            this.objectives.push({
                type: 'progress',
                title: lang === 'nl'
                    ? `Voortgang: ${completed}/${total} uitdagingen`
                    : `Progress: ${completed}/${total} challenges`,
                desc: lang === 'nl'
                    ? `Voltooi ${Math.ceil(total * CONFIG.academy.portalActivationThreshold) - completed} meer om het portaal te openen`
                    : `Complete ${Math.ceil(total * CONFIG.academy.portalActivationThreshold) - completed} more to open the portal`,
                target: null
            });
        }

        // Set first uncompleted objective as current
        this.currentObjective = this.objectives[0] || null;
        this._updateUI();
    }

    _updateUI() {
        const obj = this.currentObjective;
        if (!obj) {
            this.panel.style.display = 'none';
            return;
        }

        this.panel.style.display = 'flex';
        document.getElementById('obj-title').textContent = obj.title;
        document.getElementById('obj-desc').textContent = obj.desc;

        // Set compass target
        this.compassTarget = obj.target ? new THREE.Vector3(obj.target.x, 0, obj.target.z) : null;
    }

    update(playerPosition, cameraAngleY) {
        if (!this.tutorialShown || !this.currentObjective) {
            this.compass.style.display = 'none';
            return;
        }

        // Update compass arrow pointing to target
        if (this.compassTarget) {
            const dx = this.compassTarget.x - playerPosition.x;
            const dz = this.compassTarget.z - playerPosition.z;
            const distance = Math.sqrt(dx * dx + dz * dz);

            if (distance < 5) {
                this.compass.style.display = 'none';
                // Check if objective is met
                if (this.currentObjective.type === 'meet_mentor') {
                    this._generateObjectives(); // Refresh
                }
                return;
            }

            this.compass.style.display = 'block';

            // Angle from player to target (world space)
            const targetAngle = Math.atan2(dx, dz);
            // Relative to camera direction
            let relAngle = targetAngle - cameraAngleY;
            while (relAngle > Math.PI) relAngle -= Math.PI * 2;
            while (relAngle < -Math.PI) relAngle += Math.PI * 2;

            // Position compass on screen edge
            const screenW = window.innerWidth;
            const screenH = window.innerHeight;
            const margin = 60;

            // Convert angle to screen position (on edge of screen)
            const cx = screenW / 2 + Math.sin(relAngle) * (screenW / 2 - margin);
            const cy = screenH / 2 - Math.cos(relAngle) * (screenH / 2 - margin);

            // Clamp to screen edges
            const clampedX = Math.max(margin, Math.min(screenW - margin, cx));
            const clampedY = Math.max(margin + 50, Math.min(screenH - margin, cy));

            this.compass.style.left = `${clampedX}px`;
            this.compass.style.top = `${clampedY}px`;

            // Rotate arrow to point toward target
            const arrowAngle = relAngle * (180 / Math.PI);
            this.compass.querySelector('.compass-arrow-shape').style.transform = `rotate(${arrowAngle}deg)`;

            // Distance label
            document.getElementById('compass-dist').textContent = `${Math.round(distance)}m`;
            document.getElementById('compass-label').textContent = this.currentObjective.title.substring(0, 15);
        } else {
            this.compass.style.display = 'none';
        }
    }

    onWorldChanged(worldId) {
        this._generateObjectives();
    }

    onChallengeCompleted() {
        this._generateObjectives();
    }

    onMentorMet() {
        this._generateObjectives();
    }
}

window.ObjectiveSystem = ObjectiveSystem;
export { ObjectiveSystem };
