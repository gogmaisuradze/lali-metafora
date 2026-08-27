/* app.js - Botanical 3D Dandelion Flower, Kinetic Image-Text Reveal, Stagger Cards, Team & Glassmorphism Booking Modal */

document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================================================
    // 1. Profile Data & Botanical 3D Dandelion Configuration (Home Page)
    // ==========================================================================
        const profiles = [
        {
            id: 0,
            name: 'Personal Development',
            role: 'იპოვე შენი შინაგანი ძალა',
            image: 'მთავარის ფოტოები/Personal Development.jpeg',
            target: '#services',
            plane: 'equator'
        },
        {
            id: 1,
            name: 'Business',
            role: 'გაიზარდე და შექმენი შესაძლებლობები',
            image: 'მთავარის ფოტოები/Business.jpeg',
            target: '#services',
            plane: 'vertical'
        },
        {
            id: 2,
            name: 'Think Tank',
            role: 'სიღრმისეული სალონური დისკუსიები',
            image: 'მთავარის ფოტოები/tink tank.jpeg',
            target: '#services',
            plane: 'diagonal'
        },
        {
            id: 3,
            name: 'Art',
            role: 'შემოქმედებითი ენერგია & ხელოვნება',
            image: 'მთავარის ფოტოები/art.jpeg',
            target: '#services',
            plane: 'equator'
        },
        {
            id: 4,
            name: 'Clubs',
            role: 'შენი მესამე სივრცე & კომუნა',
            image: 'მთავარის ფოტოები/clubs.jpeg',
            target: '#services',
            plane: 'vertical'
        },
        {
            id: 5,
            name: 'ჩვენს შესახებ',
            role: 'მანიფესტი, გუნდი & ფილოსოფია',
            image: 'მთავარის ფოტოები/ჩვენს შესახებ.jpeg',
            target: '#about',
            plane: 'diagonal'
        },
        {
            id: 6,
            name: 'გალერეა',
            role: 'სივრცე, გუნდი & ღონისძიებები',
            image: 'მთავარის ფოტოები/გალერე.jpeg',
            target: 'gallery.html',
            plane: 'equator'
        },
        {
            id: 7,
            name: 'ბლოგი',
            role: 'სიახლეები, სტატიები & იდეები',
            image: 'მთავარის ფოტოები/ბლოგი.jpeg',
            target: 'blog.html',
            plane: 'vertical'
        }
    ];

    let activeIndex = 0;
    const total = profiles.length;
    const baseOrbitRadius = 310;

    // Silk Spring Physics
    let currentYaw = 0;
    let targetYaw = 0;
    let velocityYaw = 0;

    let currentPitch = 0;
    let targetPitch = 0;
    let velocityPitch = 0;

    let puffExpansion = 0;
    let autoTimer = null;
    const stiffness = 0.024;
    const damping = 0.88;

    const canvas = document.getElementById('dandelion-globe-canvas');
    const ctx = canvas ? canvas.getContext('2d') : null;
    const nodesContainer = document.getElementById('dandelion-nodes-container');
    const stemsSvg = document.getElementById('dandelion-stems-svg');
    const dotsContainer = document.getElementById('pagination-dots');
    const cardAvatar = document.getElementById('card-avatar');
    const cardName = document.getElementById('card-name');
    const cardRole = document.getElementById('card-role');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const connectBtn = document.getElementById('connect-btn');
    const entrancePortal = document.getElementById('entrance-portal');
    const mainWebsite = document.getElementById('main-website');
    const dandelionWrapper = document.getElementById('dandelion-wrapper');

    // Node Dragging & Repositioning System
    let activeDragNode = null;
    let isNodeDragging = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let nodeStartOffX = 0;
    let nodeStartOffY = 0;
    const nodeOffsets = profiles.map(() => ({ x: 0, y: 0 }));

    if (nodesContainer && stemsSvg) {
        // Create Profile Stems
        profiles.forEach((profile, index) => {
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('class', `stem-line stem-${index} ${index === 0 ? 'active' : ''}`);
            line.setAttribute('x1', '480');
            line.setAttribute('y1', '480');
            line.setAttribute('x2', '480');
            line.setAttribute('y2', '480');
            stemsSvg.appendChild(line);

            const node = document.createElement('div');
            node.className = `dandelion-node node-${index} ${index === 0 ? 'active' : ''}`;
            node.dataset.index = index;

            node.innerHTML = `<img src="${profile.image}" alt="${profile.name}" loading="lazy">`;

            // Node Pointer & Dragging Events (მაუსით გადაწევა და ადგილის შეცვლა)
            node.addEventListener('pointerdown', (e) => {
                e.preventDefault();
                e.stopPropagation();
                clearInterval(autoTimer);
                activeDragNode = index;
                isNodeDragging = false;
                dragStartX = e.clientX;
                dragStartY = e.clientY;
                nodeStartOffX = nodeOffsets[index].x;
                nodeStartOffY = nodeOffsets[index].y;
                node.classList.add('dragging');
                try { node.setPointerCapture(e.pointerId); } catch(err) {}
            });

            node.addEventListener('pointermove', (e) => {
                if (activeDragNode === index) {
                    const dx = e.clientX - dragStartX;
                    const dy = e.clientY - dragStartY;
                    if (Math.hypot(dx, dy) > 4) {
                        isNodeDragging = true;
                    }
                    nodeOffsets[index].x = nodeStartOffX + dx;
                    nodeOffsets[index].y = nodeStartOffY + dy;
                }
            });

            node.addEventListener('pointerup', (e) => {
                if (activeDragNode === index) {
                    node.classList.remove('dragging');
                    try { node.releasePointerCapture(e.pointerId); } catch(err) {}
                    goToIndex(index);
                    activeDragNode = null;
                    isNodeDragging = false;
                }
            });

            node.addEventListener('pointercancel', () => {
                if (activeDragNode === index) {
                    node.classList.remove('dragging');
                    activeDragNode = null;
                    isNodeDragging = false;
                }
            });

            node.addEventListener('mouseenter', () => {
                clearInterval(autoTimer);
            });

            // Double Click on Node to Navigate
            node.addEventListener('dblclick', (e) => {
                e.preventDefault();
                e.stopPropagation();
                navigateToProfile(profile);
            });

            // Double Tap on Mobile
            let lastNodeTap = 0;
            node.addEventListener('touchend', (e) => {
                const now = new Date().getTime();
                const diff = now - lastNodeTap;
                if (diff < 350 && diff > 0) {
                    e.preventDefault();
                    e.stopPropagation();
                    navigateToProfile(profile);
                }
                lastNodeTap = now;
            });

            nodesContainer.appendChild(node);

            if (dotsContainer) {
                const dot = document.createElement('div');
                dot.className = `dot ${index === 0 ? 'active' : ''}`;
                dot.dataset.index = index;
                dot.addEventListener('click', (e) => {
                    e.stopPropagation();
                    clearInterval(autoTimer);
                    goToIndex(index);
                });
                dotsContainer.appendChild(dot);
            }
        });

        // Create 24 Omnidirectional 3D Dandelion Seed Heads
        const numSeedHeads = 24;
        const seedHeadElements = [];
        const seedStemElements = [];
        const seedProps = [];

        for (let j = 0; j < numSeedHeads; j++) {
            const seedLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            seedLine.setAttribute('class', 'stem-line seed-stem');
            seedLine.setAttribute('x1', '480');
            seedLine.setAttribute('y1', '480');
            seedLine.setAttribute('x2', '480');
            seedLine.setAttribute('y2', '480');
            stemsSvg.appendChild(seedLine);
            seedStemElements.push(seedLine);

            const seedHead = document.createElement('div');
            seedHead.className = 'dandelion-seed-head';
            nodesContainer.appendChild(seedHead);
            seedHeadElements.push(seedHead);

            // 3D Spherical Fibonacci distribution + natural organic floating waves
            const theta = Math.acos(1 - 2 * (j + 0.5) / numSeedHeads);
            const phi = Math.PI * (1 + Math.sqrt(5)) * j;
            seedProps.push({
                theta,
                phi,
                radiusRatio: 0.58 + (j % 6) * 0.06, // Variable radius (0.58 to 0.88)
                speed: 0.6 + (j % 5) * 0.25,
                phaseX: j * 1.7,
                phaseY: j * 2.3,
                phaseZ: j * 0.9,
                ampX: 10 + (j % 4) * 4,
                ampY: 10 + (j % 3) * 5,
                ampZ: 14 + (j % 5) * 4
            });
        }

        const nodeElements = Array.from(document.querySelectorAll('.dandelion-node'));
        const stemElements = Array.from(document.querySelectorAll('.stem-line:not(.seed-stem)'));
        const dotElements = Array.from(document.querySelectorAll('.dot'));

        // Floating Ambient Dandelion Seed Parachutes
        const ambientFluffs = [];
        const numFluffs = 22;

        for (let f = 0; f < numFluffs; f++) {
            ambientFluffs.push({
                x: Math.random() * 960,
                y: Math.random() * 960,
                size: 2 + Math.random() * 2.5,
                speedX: -0.20 - Math.random() * 0.30,
                speedY: -0.10 + Math.random() * 0.25,
                angle: Math.random() * Math.PI * 2,
                opacity: 0.25 + Math.random() * 0.45
            });
        }

        const crownBristles = 28;

        function updateCenterCard() {
            const activeProfile = profiles[activeIndex];

            if (cardAvatar && cardName && cardRole) {
                cardAvatar.style.opacity = '0';
                cardAvatar.style.filter = 'blur(4px) grayscale(0%)';
                cardName.style.opacity = '0';
                cardRole.style.opacity = '0';

                setTimeout(() => {
                    if (activeProfile.isError) {
                        cardAvatar.style.display = 'none';
                    } else {
                        cardAvatar.style.display = 'block';
                        cardAvatar.src = activeProfile.image;
                    }
                    cardName.textContent = activeProfile.name;
                    cardRole.textContent = activeProfile.role;

                    cardAvatar.style.opacity = '1';
                    cardAvatar.style.filter = 'blur(0px) grayscale(0%) saturate(120%)';
                    cardName.style.opacity = '1';
                    cardRole.style.opacity = '1';
                }, 180);
            }

            dotElements.forEach((dot, i) => {
                if (i === activeIndex) {
                    dot.classList.add('active');
                } else {
                    dot.classList.remove('active');
                }
            });
        }

        function triggerDandelionPuff() {
            puffExpansion = 0.75;
        }

        function goNext() {
            activeIndex = (activeIndex + 1) % total;
            targetYaw -= (2 * Math.PI / total);
            targetPitch += (2 * Math.PI / total) * 0.65;
            triggerDandelionPuff();
            updateCenterCard();
        }

        function goPrev() {
            activeIndex = (activeIndex - 1 + total) % total;
            targetYaw += (2 * Math.PI / total);
            targetPitch -= (2 * Math.PI / total) * 0.65;
            triggerDandelionPuff();
            updateCenterCard();
        }

        function goToIndex(targetIdx) {
            if (targetIdx === activeIndex) return;

            let diff = targetIdx - activeIndex;
            if (diff > total / 2) diff -= total;
            if (diff < -total / 2) diff += total;

            activeIndex = targetIdx;
            targetYaw -= diff * (2 * Math.PI / total);
            targetPitch += diff * (2 * Math.PI / total) * 0.65;
            triggerDandelionPuff();
            updateCenterCard();
        }

        window.addEventListener('keydown', (e) => {
            if (entrancePortal && entrancePortal.style.display !== 'none') {
                if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                    e.preventDefault();
                    goNext();
                } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                    e.preventDefault();
                    goPrev();
                } else if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    if (connectBtn) connectBtn.click();
                }
            }
        });

        // Stage Dragging & 3D Orbit Sweeping
        let isDraggingStage = false;
        let stageStartX = 0, stageStartY = 0;
        let startYaw = 0, startPitch = 0;

        if (entrancePortal) {
            entrancePortal.addEventListener('pointerdown', (e) => {
                if (e.target.closest('.dandelion-node') || e.target.closest('.center-circular-hub') || e.target.closest('.portal-btn') || e.target.closest('.pagination-dots')) return;
                isDraggingStage = true;
                stageStartX = e.clientX;
                stageStartY = e.clientY;
                startYaw = targetYaw;
                startPitch = targetPitch;
            });

            window.addEventListener('pointermove', (e) => {
                if (isDraggingStage) {
                    const dx = e.clientX - stageStartX;
                    const dy = e.clientY - stageStartY;
                    targetYaw = startYaw + dx * 0.005;
                    targetPitch = Math.max(-0.7, Math.min(0.7, startPitch + dy * 0.004));
                }
            });

            window.addEventListener('pointerup', () => {
                isDraggingStage = false;
            });
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                goPrev();
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                goNext();
            });
        }

        if (dandelionWrapper) {
            dandelionWrapper.addEventListener('animationend', (e) => {
                if (e.animationName === 'dandelionBloomIn') {
                    dandelionWrapper.classList.remove('bloom-enter');
                }
            });
        }

        function renderDandelionLoop(timestamp) {
            if (!entrancePortal || entrancePortal.style.display !== 'none') {
                if (!isDraggingStage) {
                    targetYaw += 0.0032; // Continuous smooth, elegant 3D ambient rotation that never freezes
                }

                const forceYaw = (targetYaw - currentYaw) * stiffness;
                velocityYaw = (velocityYaw + forceYaw) * damping;
                currentYaw += velocityYaw;

                const forcePitch = (targetPitch - currentPitch) * stiffness;
                velocityPitch = (velocityPitch + forcePitch) * damping;
                currentPitch += velocityPitch;

                puffExpansion *= 0.94;

                const time = timestamp * 0.0012;
                const isMobile = window.innerWidth <= 768;
                const scaleFactor = isMobile ? 0.78 : 1.0;
                const svgCenter = 480;
                const cameraDistance = 880;

                const windMultiplier = 1.0 + (puffExpansion * 0.15);

                if (ctx) {
                    ctx.clearRect(0, 0, 960, 960);

                    ambientFluffs.forEach((fluff) => {
                        fluff.x += fluff.speedX;
                        fluff.y += fluff.speedY + Math.sin(time + fluff.x * 0.01) * 0.3;
                        if (fluff.x < -30) fluff.x = 990;
                        if (fluff.y < -30) fluff.y = 990;
                        if (fluff.y > 990) fluff.y = -20;

                        ctx.save();
                        ctx.translate(fluff.x, fluff.y);
                        ctx.rotate(time * 0.4 + fluff.angle);

                        ctx.beginPath();
                        ctx.arc(0, 0, fluff.size, 0, Math.PI * 2);
                        ctx.fillStyle = `rgba(139, 123, 168, ${fluff.opacity})`;
                        ctx.fill();

                        ctx.beginPath();
                        for (let w = 0; w < 6; w++) {
                            const wAng = (w / 6) * Math.PI * 2;
                            const wx = Math.cos(wAng) * (fluff.size * 2.8);
                            const wy = Math.sin(wAng) * (fluff.size * 2.8);
                            ctx.moveTo(0, 0);
                            ctx.lineTo(wx, wy);
                        }
                        ctx.strokeStyle = `rgba(122, 57, 99, ${(fluff.opacity * 0.6).toFixed(2)})`;
                        ctx.lineWidth = 0.8;
                        ctx.stroke();

                        ctx.restore();
                    });

                    const gYaw = currentYaw * 0.5;

                    ctx.save();
                    ctx.translate(svgCenter, svgCenter);

                    for (let b = 0; b < crownBristles; b++) {
                        const bAng = (b / crownBristles) * Math.PI * 2 + gYaw * 0.3;
                        const innerR = (isMobile ? 85 : 115) * scaleFactor;
                        const outerR = ((isMobile ? 115 : 145) + Math.sin(time * 1.5 + b) * 8) * scaleFactor;

                        const bx1 = Math.cos(bAng) * innerR;
                        const by1 = Math.sin(bAng) * innerR;
                        const bx2 = Math.cos(bAng) * outerR;
                        const by2 = Math.sin(bAng) * outerR;

                        ctx.beginPath();
                        ctx.moveTo(bx1, by1);
                        ctx.lineTo(bx2, by2);
                        ctx.strokeStyle = 'rgba(139, 123, 168, 0.28)';
                        ctx.lineWidth = 1.2;
                        ctx.stroke();

                        ctx.beginPath();
                        ctx.arc(bx2, by2, 2 * scaleFactor, 0, Math.PI * 2);
                        ctx.fillStyle = 'rgba(139, 123, 168, 0.45)';
                        ctx.fill();
                    }
                    ctx.restore();
                }

                profiles.forEach((profile, i) => {
                    const angleOffset = i * (2 * Math.PI / total);
                    const r = baseOrbitRadius * windMultiplier * scaleFactor;

                    const ang = currentYaw + angleOffset - Math.PI / 2;
                    const x0 = r * Math.cos(ang);
                    const y0 = r * Math.sin(ang) * 0.74;
                    const z0 = r * Math.sin(ang) * 0.35;

                    const pitchTilt = 0.10 + (currentPitch * 0.15);
                    const cosP = Math.cos(pitchTilt);
                    const sinP = Math.sin(pitchTilt);

                    const y1 = y0 * cosP - z0 * sinP;
                    const z1 = y0 * sinP + z0 * cosP;

                    const perspective = cameraDistance / (cameraDistance - z1);
                    
                    // Smooth decay of drag offset when not actively dragging
                    if (activeDragNode !== i) {
                        nodeOffsets[i].x *= 0.96;
                        nodeOffsets[i].y *= 0.96;
                    }

                    const projX = x0 * perspective + nodeOffsets[i].x;
                    const projY = y1 * perspective + nodeOffsets[i].y;

                    const isCurrentActive = (i === activeIndex);
                    const isBeingDragged = (activeDragNode === i);

                    const node = nodeElements[i];
                    const normalizedZ = z1 / (baseOrbitRadius * scaleFactor);
                    
                    // Active node elevates upwards and scales up dynamically
                    const activeLift = (isCurrentActive && !isBeingDragged) ? (35 * scaleFactor) : 0;
                    const nodeScale = isBeingDragged ? (1.38 * scaleFactor) : (isCurrentActive ? (1.30 + puffExpansion * 0.12) : (0.82 + (normalizedZ + 1) * 0.18));
                    const nodeOpacity = (isCurrentActive || isBeingDragged) ? 1.0 : (0.55 + (normalizedZ + 1) * 0.22);
                    const zIndex = isBeingDragged ? 150 : (isCurrentActive ? 120 : Math.round(50 + normalizedZ * 20));

                    node.style.transform = `translate(${projX.toFixed(1)}px, ${(projY - activeLift).toFixed(1)}px) scale(${nodeScale.toFixed(2)})`;
                    node.style.opacity = nodeOpacity.toFixed(2);
                    node.style.zIndex = zIndex;

                    if (isCurrentActive || isBeingDragged) {
                        node.classList.add('active');
                    } else {
                        node.classList.remove('active');
                    }

                    const stem = stemElements[i];
                    const targetX = svgCenter + projX;
                    const targetY = svgCenter + (projY - activeLift);

                    stem.setAttribute('x1', svgCenter.toString());
                    stem.setAttribute('y1', svgCenter.toString());
                    stem.setAttribute('x2', targetX.toFixed(1));
                    stem.setAttribute('y2', targetY.toFixed(1));

                    if (isCurrentActive || isBeingDragged) {
                        stem.classList.add('active');
                    } else {
                        stem.classList.remove('active');
                    }
                });

                for (let j = 0; j < numSeedHeads; j++) {
                    const prop = seedProps[j];
                    const sR = baseOrbitRadius * (isMobile ? (prop.radiusRatio + 0.12) : prop.radiusRatio) * windMultiplier * scaleFactor;

                    // 3D Spherical + organic wave motion in all directions
                    const currentPhi = prop.phi + (currentYaw * 0.75);
                    const currentTheta = prop.theta + (currentPitch * 0.4);

                    const floatX = Math.sin(time * prop.speed + prop.phaseX) * prop.ampX * scaleFactor;
                    const floatY = Math.cos(time * prop.speed + prop.phaseY) * prop.ampY * scaleFactor;
                    const floatZ = Math.sin(time * prop.speed * 0.8 + prop.phaseZ) * prop.ampZ * scaleFactor;

                    const sx0 = (sR * Math.sin(currentTheta) * Math.cos(currentPhi)) + floatX;
                    const sy0 = (sR * Math.sin(currentTheta) * Math.sin(currentPhi) * 0.85) + floatY;
                    const sz0 = (sR * Math.cos(currentTheta) * 0.65) + floatZ;

                    const pitchTilt = 0.12;
                    const sy1 = sy0 * Math.cos(pitchTilt) - sz0 * Math.sin(pitchTilt);
                    const sz1 = sy0 * Math.sin(pitchTilt) + sz0 * Math.cos(pitchTilt);

                    const sPerspective = cameraDistance / (cameraDistance - sz1);
                    const sProjX = sx0 * sPerspective;
                    const sProjY = sy1 * sPerspective;

                    const sNormalizedZ = sz1 / (baseOrbitRadius * scaleFactor);
                    const sScale = 0.65 + (sNormalizedZ + 1) * 0.22;
                    const sOpacity = 0.35 + (sNormalizedZ + 1) * 0.28;
                    const sZIndex = Math.round(20 + sNormalizedZ * 15);

                    const seedHead = seedHeadElements[j];
                    seedHead.style.transform = `translate(${sProjX.toFixed(1)}px, ${sProjY.toFixed(1)}px) scale(${sScale.toFixed(2)})`;
                    seedHead.style.opacity = sOpacity.toFixed(2);
                    seedHead.style.zIndex = sZIndex;

                    const seedStem = seedStemElements[j];
                    seedStem.setAttribute('x1', svgCenter.toString());
                    seedStem.setAttribute('y1', svgCenter.toString());
                    seedStem.setAttribute('x2', (svgCenter + sProjX).toFixed(1));
                    seedStem.setAttribute('y2', (svgCenter + sProjY).toFixed(1));
                }
            }

            requestAnimationFrame(renderDandelionLoop);
        }
        requestAnimationFrame(renderDandelionLoop);

        // Center Circular Hub Double-Click to Navigate
        const centerCard = document.getElementById('center-card');
        if (centerCard) {
            centerCard.addEventListener('dblclick', (e) => {
                e.preventDefault();
                e.stopPropagation();
                navigateToProfile(profiles[activeIndex]);
            });

            let lastCenterTap = 0;
            centerCard.addEventListener('touchend', (e) => {
                const now = new Date().getTime();
                const diff = now - lastCenterTap;
                if (diff < 350 && diff > 0) {
                    e.preventDefault();
                    e.stopPropagation();
                    navigateToProfile(profiles[activeIndex]);
                }
                lastCenterTap = now;
            });
        }

        // Portal Exit Transition & Connect Button (დაწყების ღილაკზე დაჭერისას ცენტრში შეკუმშვა ტრიალით და გადასვლა)
        if (connectBtn && entrancePortal && mainWebsite) {
            connectBtn.addEventListener('click', (e) => {
                e.preventDefault();
                connectBtn.style.transform = 'scale(0.92)';
                exitWithDandelionCollapse('#hero');
            });
        }
    }

    function exitWithDandelionCollapse(targetHash) {
        const dandelionWrapper = document.getElementById('dandelion-wrapper');
        const entrancePortal = document.getElementById('entrance-portal');
        const mainWebsite = document.getElementById('main-website');

        if (dandelionWrapper) {
            dandelionWrapper.classList.remove('bloom-enter');
            dandelionWrapper.classList.add('collapse-exit');
        }

        // Parallel transition: shrink and fade/scroll simultaneously
        if (entrancePortal && entrancePortal.style.display !== 'none') {
            entrancePortal.classList.add('portal-exit');
            document.body.classList.remove('initial-lock');
            if (mainWebsite) mainWebsite.classList.add('active');

            if (targetHash && targetHash !== '#hero' && targetHash !== '#entrance') {
                scrollToAnchor(targetHash);
            } else {
                window.scrollTo({ top: 0, behavior: 'instant' });
            }

            setTimeout(() => {
                entrancePortal.style.display = 'none';
                if (typeof ScrollTrigger !== 'undefined') {
                    ScrollTrigger.refresh();
                }
            }, 880);
        } else if (targetHash && targetHash !== '#entrance') {
            scrollToAnchor(targetHash);
        }
    }

    function navigateToProfile(profile) {
        if (!profile) {
            exitWithDandelionCollapse('#hero');
            return;
        }
        const target = profile.target || '#hero';
        if (target.endsWith('.html')) {
            window.location.href = target;
        } else {
            exitWithDandelionCollapse(target);
        }
    }

    // Smooth scroll helper with sticky header offset (90px) & portal exit support
    function scrollToAnchor(hash) {
        if (!hash || hash.length <= 1) return;
        const targetEl = document.querySelector(hash);
        if (!targetEl) return;

        const headerOffset = 90;
        const elementPosition = targetEl.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }

    function exitPortalAndScroll(targetHash) {
        exitWithDandelionCollapse(targetHash);
    }

    // Re-open Entrance 3D Portal
    function reopenPortal() {
        const entrancePortal = document.getElementById('entrance-portal');
        const mainWebsite = document.getElementById('main-website');
        const dandelionWrapper = document.getElementById('dandelion-wrapper');
        if (entrancePortal && mainWebsite) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            entrancePortal.style.display = 'flex';
            entrancePortal.offsetHeight; // trigger reflow
            entrancePortal.classList.remove('portal-exit');
            mainWebsite.classList.remove('active');
            document.body.classList.add('initial-lock');

            if (dandelionWrapper) {
                dandelionWrapper.classList.remove('collapse-exit');
                void dandelionWrapper.offsetWidth; // Force reflow
                dandelionWrapper.classList.add('bloom-enter');
            }

            if (window.history && window.history.pushState) {
                window.history.pushState(null, '', window.location.pathname);
            }
        }
    }

    // Top-level global click listener for ALL anchor links (e.g. #contact, #about, #services, #hero, #entrance)
    document.addEventListener('click', (e) => {
        const anchor = e.target.closest('a');
        if (!anchor) return;

        const href = anchor.getAttribute('href');
        if (!href) return;

        // 1. Logo Click: Return to Entrance 3D Start Page
        if (anchor.classList.contains('logo-link') || anchor.id === 'header-logo-to-portal' || href.includes('#entrance')) {
            const entrancePortal = document.getElementById('entrance-portal');
            if (entrancePortal) {
                e.preventDefault();
                reopenPortal();
                return;
            }
        }

        // 2. Hash Links (e.g. #hero for 'მთავარი', #about, #services, #contact)
        const hashIdx = href.indexOf('#');
        if (hashIdx !== -1) {
            const hash = href.substring(hashIdx);
            if (hash.length > 1 && hash !== '#entrance') {
                if (typeof window.setActiveNav === 'function') {
                    window.setActiveNav(hash);
                }
                const targetEl = document.querySelector(hash);
                if (targetEl) {
                    e.preventDefault();
                    const entrancePortal = document.getElementById('entrance-portal');
                    if (entrancePortal && entrancePortal.style.display !== 'none') {
                        exitWithDandelionCollapse(hash);
                    } else {
                        exitPortalAndScroll(hash);
                    }
                }
            }
        }
    });

    // Automatically handle initial URL hash navigation on page load without any delay or flickering
    if (window.location.hash && window.location.hash !== '#entrance') {
        const entrancePortal = document.getElementById('entrance-portal');
        const mainWebsite = document.getElementById('main-website');
        if (entrancePortal) entrancePortal.style.display = 'none';
        if (mainWebsite) {
            mainWebsite.classList.add('active');
            mainWebsite.style.opacity = '1';
        }
        document.body.classList.remove('initial-lock');
        document.documentElement.classList.remove('direct-main-mode');

        if (window.location.hash !== '#hero') {
            setTimeout(() => {
                scrollToAnchor(window.location.hash);
            }, 60);
        } else {
            window.scrollTo({ top: 0, behavior: 'instant' });
        }
    }

    // Search & Language Toggle
    const searchToggleBtn = document.getElementById('search-toggle-btn');
    const searchExpandable = document.getElementById('search-expandable');
    const searchCloseBtn = document.getElementById('search-close-btn');
    const searchInput = document.getElementById('search-input');

    if (searchToggleBtn && searchExpandable && searchCloseBtn) {
        searchToggleBtn.addEventListener('click', () => {
            searchExpandable.classList.toggle('active');
            if (searchExpandable.classList.contains('active') && searchInput) {
                searchInput.focus();
            }
        });

        searchCloseBtn.addEventListener('click', () => {
            searchExpandable.classList.remove('active');
            if (searchInput) {
                searchInput.value = '';
                searchInput.dispatchEvent(new Event('input'));
            }
        });

        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const query = e.target.value.toLowerCase().trim();
                const galleryItems = document.querySelectorAll('.gallery-item');
                if (galleryItems.length > 0) {
                    galleryItems.forEach(item => {
                        const img = item.querySelector('img');
                        const alt = img ? (img.getAttribute('alt') || '') : '';
                        const title = item.getAttribute('title') || '';
                        const category = item.dataset.category || '';
                        const text = (alt + ' ' + title + ' ' + category + ' ' + item.textContent).toLowerCase();
                        if (!query || text.includes(query)) {
                            item.classList.remove('hidden');
                            item.style.opacity = '1';
                            item.style.transform = 'scale(1)';
                        } else {
                            item.classList.add('hidden');
                        }
                    });
                }
            });
        }
    }

    // Featured Slider Auto-Play Logic
    const slides = Array.from(document.querySelectorAll('.hero-slide'));
    const indicators = Array.from(document.querySelectorAll('.slider-indicators .indicator'));
    const sliderPrev = document.getElementById('slider-prev');
    const sliderNext = document.getElementById('slider-next');
    let currentSlide = 0;
    let sliderTimer = null;
    const SLIDE_DURATION = 3800; // 3.8 seconds per slide

    function showSlide(index) {
        if (slides.length === 0) return;
        currentSlide = (index + slides.length) % slides.length;

        slides.forEach((slide, i) => {
            if (i === currentSlide) {
                slide.classList.add('active');
            } else {
                slide.classList.remove('active');
            }
        });

        indicators.forEach((ind, i) => {
            if (i === currentSlide) {
                ind.classList.add('active');
                // Re-trigger CSS animation on indicator
                const oldAfter = ind.querySelector('span');
                ind.style.animation = 'none';
                ind.offsetHeight; /* trigger reflow */
                ind.style.animation = '';
            } else {
                ind.classList.remove('active');
            }
        });
    }

    function nextSlide() {
        showSlide(currentSlide + 1);
    }

    function prevSlide() {
        showSlide(currentSlide - 1);
    }

    function startSliderAuto() {
        clearInterval(sliderTimer);
        sliderTimer = setInterval(nextSlide, SLIDE_DURATION);
    }

    if (sliderNext) {
        sliderNext.addEventListener('click', () => { 
            nextSlide(); 
            startSliderAuto(); 
        });
    }
    
    if (sliderPrev) {
        sliderPrev.addEventListener('click', () => { 
            prevSlide(); 
            startSliderAuto(); 
        });
    }

    indicators.forEach((ind, i) => {
        ind.addEventListener('click', () => {
            showSlide(i);
            startSliderAuto();
        });
    });

    const sliderElem = document.getElementById('featured-slider');
    if (sliderElem) {
        // Pause briefly on hover, then resume automatically
        sliderElem.addEventListener('mouseenter', () => {
            clearInterval(sliderTimer);
        });
        sliderElem.addEventListener('mouseleave', () => {
            startSliderAuto();
        });
    }

    // Always launch slider autoplay immediately
    startSliderAuto();

    // ==========================================================================
    // 2. FLUID STAGGER POSITION-SWAPPING AFISHA ENGINE
    // ==========================================================================
    const afishaEvents = [
        {
            id: 0,
            title: "🎭 Playback იმპროვიზაციის საღამო",
            testimonial: "თეატრალური პერფორმანსი, სადაც მაყურებლის რეალური ისტორიები და ემოციები სცენაზე ცოცხლდება.",
            by: "28 აგვ | 19:00 • Playback დასი",
            imgSrc: "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=150&auto=format&fit=crop"
        },
        {
            id: 1,
            title: "🌿 პოზიტიური ფსიქოლოგიის ვორქშოფი",
            testimonial: "სტრესის მართვის, ემოციური ბალანსისა და თვითშემეცნების პრაქტიკული სემინარი ფსიქოთერაპევტთან.",
            by: "30 აგვ | 18:30 • ანა კაპანაძე",
            imgSrc: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop"
        },
        {
            id: 2,
            title: "🎲 Board Games Night & Cocktail Hour",
            testimonial: "სამაგიდო თამაშების ჩემპიონატი, საავტორო კოქტეილები, ახალი ნაცნობობა და მხიარული ატმოსფერო.",
            by: "02 სექ | 20:00 • მეტაფორა Bar",
            imgSrc: "https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=150&auto=format&fit=crop"
        },
        {
            id: 3,
            title: "💡 Think Tank & ფილოსოფიის საღამო",
            testimonial: "დისკუსია თანამედროვე კულტურასა და „მესამე ადგილის“ ფენომენზე თანამოაზრეთა წრეში.",
            by: "05 სექ | 19:30 • ლევან ჯაფარიძე",
            imgSrc: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=150&auto=format&fit=crop"
        },
        {
            id: 4,
            title: "🎨 არტ-თერაპია & თვითგამოხატვა",
            testimonial: "შემოქმედებითი ხატვისა და ემოციური განტვირთვის სესია მყუდრო ლაუნჯში.",
            by: "08 სექ | 18:00 • სალომე მგელაძე",
            imgSrc: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=150&auto=format&fit=crop"
        },
        {
            id: 5,
            title: "☕ Coworking & Mastermind საუზმე",
            testimonial: "დილის ყავა, პროდუქტიული ნეთვორქინგი და გამოცდილების გაზიარება სტარტაპერებთან.",
            by: "12 სექ | 10:30 • გიორგი გელოვანი",
            imgSrc: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150&auto=format&fit=crop"
        },
        {
            id: 6,
            title: "📚 წიგნის კლუბი & ღია დისკუსია",
            testimonial: "თვიური წიგნის განხილვა, საინტერესო დებატები და ცხელი ჩაის საღამო.",
            by: "15 სექ | 19:00 • მეტაფორა Club",
            imgSrc: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=150&auto=format&fit=crop"
        }
    ];

    const staggerTrack = document.getElementById('stagger-cards-track');
    const staggerPrevBtn = document.getElementById('stagger-prev-btn');
    const staggerNextBtn = document.getElementById('stagger-next-btn');

    const staggerCardDoms = [];
    let eventOrder = afishaEvents.map((_, i) => i);

    if (staggerTrack) {
        staggerTrack.innerHTML = '';
        afishaEvents.forEach((item, originalIndex) => {
            const card = document.createElement('div');
            card.className = 'stagger-card';
            card.dataset.index = originalIndex;

            card.innerHTML = `
                <span class="corner-accent-line"></span>
                <div>
                    <div class="stagger-card-header">
                        <img src="${item.imgSrc}" alt="${item.title}" class="stagger-card-img">
                        <span class="stagger-card-date">${item.by.split('•')[0]}</span>
                    </div>
                    <h3 class="stagger-card-title">${item.title}</h3>
                    <p class="stagger-card-desc">„${item.testimonial}“</p>
                </div>
                <div style="display: flex; align-items: center; justify-content: space-between;">
                    <span class="stagger-card-author">${item.by.split('•')[1] || ''}</span>
                    <button class="open-booking-modal-btn btn btn-primary" style="padding: 4px 14px; font-size: 0.78rem;">დაჯავშნა</button>
                </div>
            `;

            card.addEventListener('click', () => {
                const currentPos = getPositionOf(originalIndex);
                moveStagger(currentPos);
            });

            staggerTrack.appendChild(card);
            staggerCardDoms.push(card);
        });
    }

    function getCardSize() {
        return window.innerWidth <= 640 ? 290 : 365;
    }

    function getPositionOf(originalIdx) {
        const orderIdx = eventOrder.indexOf(originalIdx);
        const len = eventOrder.length;
        return len % 2 ? orderIdx - Math.floor(len / 2) : orderIdx - len / 2;
    }

    function updateStaggerLayout() {
        if (!staggerTrack) return;
        const cardSize = getCardSize();
        const len = eventOrder.length;

        eventOrder.forEach((originalIdx, orderIdx) => {
            const position = len % 2
                ? orderIdx - Math.floor(len / 2)
                : orderIdx - len / 2;

            const isCenter = position === 0;
            const cardDom = staggerCardDoms[originalIdx];
            if (!cardDom) return;

            cardDom.style.width = `${cardSize}px`;
            cardDom.style.height = `${cardSize}px`;

            const translateX = (cardSize / 1.5) * position;
            const translateY = isCenter ? -60 : (position % 2 ? 15 : -15);
            const rotate = isCenter ? 0 : (position % 2 ? 2.5 : -2.5);

            cardDom.style.transform = `translate(-50%, -50%) translateX(${translateX.toFixed(1)}px) translateY(${translateY}px) rotate(${rotate}deg)`;
            cardDom.style.zIndex = isCenter ? 15 : Math.max(1, 10 - Math.abs(position));

            if (isCenter) {
                cardDom.classList.add('center');
                cardDom.classList.remove('side');
            } else {
                cardDom.classList.remove('center');
                cardDom.classList.add('side');
            }
        });
    }

    function moveStagger(steps) {
        if (steps === 0) return;
        const newOrder = [...eventOrder];
        if (steps > 0) {
            for (let i = 0; i < steps; i++) {
                const shifted = newOrder.shift();
                if (shifted !== undefined) newOrder.push(shifted);
            }
        } else {
            for (let i = 0; i < Math.abs(steps); i++) {
                const popped = newOrder.pop();
                if (popped !== undefined) newOrder.unshift(popped);
            }
        }
        eventOrder = newOrder;
        updateStaggerLayout();
    }

    if (staggerPrevBtn) staggerPrevBtn.addEventListener('click', () => moveStagger(-1));
    if (staggerNextBtn) staggerNextBtn.addEventListener('click', () => moveStagger(1));

    window.addEventListener('resize', updateStaggerLayout);
    updateStaggerLayout();

    // ==========================================================================
    // 2.5 SERVICE CARDS VIDEO HOVER PLAY & COLORIZE
    // ==========================================================================
    const serviceVideoCards = document.querySelectorAll('.service-five-card');
    serviceVideoCards.forEach(card => {
        const video = card.querySelector('video');
        if (!video || typeof video.pause !== 'function') return;

        video.muted = true;
        try { video.pause(); } catch(e) {}

        if (typeof video.addEventListener === 'function') {
            video.addEventListener('loadedmetadata', () => {
                video.currentTime = 0.01;
            });
        }

        card.addEventListener('mouseenter', () => {
            if (typeof video.play === 'function') {
                const playPromise = video.play();
                if (playPromise !== undefined && typeof playPromise.catch === 'function') {
                    playPromise.catch(() => {});
                }
            }
        });

        card.addEventListener('mouseleave', () => {
            if (typeof video.pause === 'function') {
                video.pause();
            }
        });
    });

    // ==========================================================================
    // 3. TYPEWRITER AUDIO TESTIMONIALS (Team Members)
    // ==========================================================================
        const testimonials = [
        {
            image: 'გუნდი/1.jpg',
            audio: 'galaktion.mp3',
            galaktionStart: 0.0,
            text: '„მეტაფორა“ არის გარემო, სადაც იდეები ცოცხლდებიან, ხოლო ადამიანები და შესაძლებლობები ერთმანეთს პოულობენ. აქ ყველაფერია შენი განვითარებისა და შთაგონებისთვის.',
            name: 'ლალი',
            fullname: 'ლალი ბადრიძე',
            jobtitle: 'დამფუძნებელი & ფასილიტატორი',
            facebook: 'https://www.facebook.com/lali.badridze',
            instagram: 'https://instagram.com',
            whatsapp: 'https://wa.me/995599228228',
            time: '0:00 / 1:20'
        },
        {
            image: 'გუნდი/2.jpg',
            audio: 'galaktion.mp3',
            galaktionStart: 11.5,
            text: 'Personal Development მიმართულება ეხმარება ადამიანებს შინაგანი ძალის, ბალანსისა და ემოციური ჰარმონიის პოვნაში პროფესიული მხარდაჭერით.',
            name: 'თინათინი',
            fullname: 'თინათინ გოგუაძე',
            jobtitle: 'პოზიტიური ფსიქოთერაპევტი',
            facebook: 'https://www.facebook.com/metaphora.geo',
            instagram: 'https://instagram.com',
            whatsapp: 'https://wa.me/995599228228',
            time: '0:11 / 1:20'
        },
        {
            image: 'გუნდი/3.jpg',
            audio: 'galaktion.mp3',
            galaktionStart: 23.0,
            text: 'Think Tank სალონური დისკუსიები და ინტელექტუალური დებატები ქმნის სივრცეს, სადაც იდეები გარდაიქმნება რეალურ ცვლილებებად და ინოვაციებად.',
            name: 'გიორგი',
            fullname: 'გიორგი მაისურაძე',
            jobtitle: 'Think Tank მოდერატორი',
            facebook: 'https://www.facebook.com/metaphora.geo',
            instagram: 'https://instagram.com',
            whatsapp: 'https://wa.me/995599228228',
            time: '0:23 / 1:20'
        },
        {
            image: 'გუნდი/4.jpg',
            audio: 'galaktion.mp3',
            galaktionStart: 34.5,
            text: 'Playback თეატრი მაყურებლის ემოციებსა და ისტორიებს აცოცხლებს სცენაზე — ეს არის უნიკალური შემოქმედებითი და არტ-თერაპიული გამოცდილება.',
            name: 'ნინო',
            fullname: 'ნინო კვარაცხელია',
            jobtitle: 'Playback თეატრის არტისტი',
            facebook: 'https://www.facebook.com/metaphora.geo',
            instagram: 'https://instagram.com',
            whatsapp: 'https://wa.me/995599228228',
            time: '0:34 / 1:20'
        },
        {
            image: 'გუნდი/5.jpg',
            audio: 'galaktion.mp3',
            galaktionStart: 46.0,
            text: 'მეტაფორა Business აერთიანებს მეწარმეებსა და პროფესიონალებს ნაყოფიერი თანამშრომლობის, პარტნიორობისა და ახალი შესაძლებლობების შესაქმნელად.',
            name: 'დავითი',
            fullname: 'დავით ბერიძე',
            jobtitle: 'Business & Partnerships Lead',
            facebook: 'https://www.facebook.com/metaphora.geo',
            instagram: 'https://instagram.com',
            whatsapp: 'https://wa.me/995599228228',
            time: '0:46 / 1:20'
        },
        {
            image: 'გუნდი/6.jpg',
            audio: 'galaktion.mp3',
            galaktionStart: 57.5,
            text: 'მეტაფორა Clubs არის შენი „მესამე სივრცე“ — ადგილი, სადაც თავს ყოველთვის შინაურად, მყუდროდ და თავისუფლად იგრძნობ თანამოაზრეებთან ერთად.',
            name: 'ელენე',
            fullname: 'ელენე ჩხეიძე',
            jobtitle: 'Community Manager & Clubs Host',
            facebook: 'https://www.facebook.com/metaphora.geo',
            instagram: 'https://instagram.com',
            whatsapp: 'https://wa.me/995599228228',
            time: '0:57 / 1:20'
        },
        {
            image: 'გუნდი/7.jpg',
            audio: 'galaktion.mp3',
            galaktionStart: 68.0,
            text: 'ჩვენ ვქმნით შთამაგონებელ გარემოს, ვორქშოფებსა და არტ-საღამოებს, რომლებიც ადამიანებს აკავშირებს და ავსებს შემოქმედებითი ენერგიით.',
            name: 'სანდრო',
            fullname: 'სანდრო ჯაფარიძე',
            jobtitle: 'Creative Producer & Curator',
            facebook: 'https://www.facebook.com/metaphora.geo',
            instagram: 'https://instagram.com',
            whatsapp: 'https://wa.me/995599228228',
            time: '1:08 / 1:20'
        }
    ];

    let currentTwIdx = 0;
    let typeTimer = null;

    const twAvatar = document.getElementById('tw-avatar');
    const twText = document.getElementById('tw-text');
    const twName = document.getElementById('tw-name');
    const twRole = document.getElementById('tw-role');
    const twTime = document.getElementById('tw-audio-time');
    const twVisualizer = document.getElementById('tw-visualizer');
    const twPlayBtn = document.getElementById('tw-play-btn');
    const twPlayIcon = document.getElementById('tw-play-icon');
    const twPrevBtn = document.getElementById('tw-prev-btn');
    const twNextBtn = document.getElementById('tw-next-btn');
    const twRibbon = document.getElementById('tw-members-ribbon');

    if (twRibbon) {
        twRibbon.innerHTML = '';
        testimonials.forEach((item, idx) => {
            const chip = document.createElement('div');
            chip.className = `tw-member-chip ${idx === 0 ? 'active' : ''}`;
            chip.dataset.index = idx;
            chip.title = `${item.name} (${item.jobtitle})`;
            chip.innerHTML = `<img src="${item.image}" alt="${item.name}" loading="lazy">`;

            chip.addEventListener('click', () => {
                setTestimonial(idx, true);
            });

            twRibbon.appendChild(chip);
        });
    }

    // 1. Gentle keyboard typewriter typing sound (Strictly synchronized with active typing dynamics)
    let isTypingSoundEnabled = true;
    let isCurrentlyTyping = false;
    let manifestoIsTyping = false;
    let manifestoSoundActive = false;
    let twTypingAudio = null;

    function startTwTypingAudio() {
        if (!isTypingSoundEnabled) return;
        try {
            if (!twTypingAudio) {
                twTypingAudio = new Audio('typewriter.mp3');
                twTypingAudio.volume = 0.08; // Subtle gentle low volume
                twTypingAudio.loop = true;
            }
            twTypingAudio.volume = 0.08;
            twTypingAudio.currentTime = 0;
            const p = twTypingAudio.play();
            if (p !== undefined) p.catch(() => {});
        } catch (e) {}
    }

    function stopTwTypingAudio() {
        if (twTypingAudio) {
            try {
                twTypingAudio.pause();
                twTypingAudio.currentTime = 0;
            } catch (e) {}
        }
    }

    // 2. Galaktion Tabidze Audio Player (Manual & Automatic Member Chrono Playback)
    let galaktionAudio = null;
    let isGalaktionPlaying = false;

    function formatAudioTime(sec) {
        const m = Math.floor(sec / 60);
        const s = Math.floor(sec % 60);
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    }

    function initGalaktionAudio() {
        if (!galaktionAudio) {
            galaktionAudio = new Audio('galaktion.mp3');
            galaktionAudio.volume = 0.65;
            galaktionAudio.preload = 'auto';

            galaktionAudio.addEventListener('timeupdate', () => {
                if (twTime && !galaktionAudio.paused) {
                    twTime.textContent = `${formatAudioTime(galaktionAudio.currentTime)} / 1:20`;
                }
            });

            galaktionAudio.addEventListener('ended', () => {
                isGalaktionPlaying = false;
                if (twVisualizer) twVisualizer.classList.remove('playing');
                if (twPlayIcon) twPlayIcon.textContent = '▶';
                if (twPlayBtn) twPlayBtn.style.background = '';
                if (twTime) twTime.textContent = testimonials[currentTwIdx].time;
            });

            galaktionAudio.addEventListener('pause', () => {
                if (!isGalaktionPlaying) {
                    if (twVisualizer) twVisualizer.classList.remove('playing');
                    if (twPlayIcon) twPlayIcon.textContent = '▶';
                    if (twPlayBtn) twPlayBtn.style.background = '';
                }
            });
        }
    }

    function playGalaktionForMember(idx) {
        initGalaktionAudio();
        const startSec = (testimonials[idx] && typeof testimonials[idx].galaktionStart === 'number')
            ? testimonials[idx].galaktionStart
            : 0;

        const applySeekAndPlay = () => {
            try {
                galaktionAudio.currentTime = startSec;
            } catch (e) {}
            const p = galaktionAudio.play();
            if (p !== undefined) p.catch(() => {});
        };

        if (galaktionAudio.readyState >= 1) {
            applySeekAndPlay();
        } else {
            galaktionAudio.addEventListener('loadedmetadata', applySeekAndPlay, { once: true });
            galaktionAudio.addEventListener('canplay', applySeekAndPlay, { once: true });
            try { galaktionAudio.load(); } catch(e) {}
        }

        isGalaktionPlaying = true;
        if (twVisualizer) twVisualizer.classList.add('playing');
        if (twPlayIcon) twPlayIcon.textContent = '❚❚';
        if (twPlayBtn) twPlayBtn.style.background = '#014d51';
    }

    function toggleGalaktionAudio() {
        initGalaktionAudio();
        if (isGalaktionPlaying && !galaktionAudio.paused) {
            galaktionAudio.pause();
            isGalaktionPlaying = false;
            if (twVisualizer) twVisualizer.classList.remove('playing');
            if (twPlayIcon) twPlayIcon.textContent = '▶';
            if (twPlayBtn) twPlayBtn.style.background = '';
        } else {
            playGalaktionForMember(currentTwIdx);
        }
    }

    function typewriteText(fullText, playSound = true) {
        clearTimeout(typeTimer);
        stopTwTypingAudio();
        if (!twText) return;
        twText.textContent = '';
        let charIndex = 0;
        isCurrentlyTyping = true;

        if (playSound && isTypingSoundEnabled) {
            startTwTypingAudio();
        }

        function typeNext() {
            if (charIndex < fullText.length) {
                const char = fullText.charAt(charIndex);
                twText.textContent += char;
                charIndex++;

                let speed = 22;
                if (char === '.' || char === '!' || char === '?') speed = 90;
                else if (char === ',') speed = 45;

                typeTimer = setTimeout(typeNext, speed);
            } else {
                isCurrentlyTyping = false;
                stopTwTypingAudio();
            }
        }
        typeNext();
    }

    function setTestimonial(idx, playSound = true) {
        currentTwIdx = (idx + testimonials.length) % testimonials.length;
        const current = testimonials[currentTwIdx];

        if (twAvatar) twAvatar.src = current.image;
        if (twName) twName.textContent = current.name;
        if (twRole) twRole.textContent = current.jobtitle;

        // Galaktion Play button is NOT auto-pressed unless user manually started it before!
        if (isGalaktionPlaying && galaktionAudio && !galaktionAudio.paused) {
            playGalaktionForMember(currentTwIdx);
        } else {
            if (twTime) twTime.textContent = current.time;
            if (twVisualizer) twVisualizer.classList.remove('playing');
            if (twPlayIcon) twPlayIcon.textContent = '▶';
            if (twPlayBtn) twPlayBtn.style.background = '';
        }

        const twSocialFb = document.getElementById('tw-social-fb');
        if (twSocialFb) {
            twSocialFb.href = current.facebook || 'https://www.facebook.com/metaphora.geo';
            twSocialFb.title = `${current.name} — Facebook`;
        }

        const twSocialInsta = document.getElementById('tw-social-insta');
        if (twSocialInsta) {
            twSocialInsta.href = current.instagram || 'https://instagram.com';
            twSocialInsta.title = `${current.name} — Instagram`;
        }

        const twSocialWa = document.getElementById('tw-social-wa');
        if (twSocialWa) {
            twSocialWa.href = current.whatsapp || 'https://wa.me/995599228228';
            twSocialWa.title = `${current.name} — WhatsApp`;
        }

        // On team member switch: typewriter typing sound plays during typing!
        typewriteText(current.text, playSound);

        const chips = Array.from(document.querySelectorAll('.tw-member-chip'));
        chips.forEach((c, i) => {
            if (i === currentTwIdx) c.classList.add('active');
            else c.classList.remove('active');
        });
    }

    if (twText) {
        setTestimonial(0, false);
    }

    if (twNextBtn) {
        twNextBtn.addEventListener('click', () => {
            setTestimonial(currentTwIdx + 1, true);
        });
    }

    if (twPrevBtn) {
        twPrevBtn.addEventListener('click', () => {
            setTestimonial(currentTwIdx - 1, true);
        });
    }

    if (twPlayBtn) {
        twPlayBtn.addEventListener('click', () => {
            toggleGalaktionAudio();
        });
    }

    // Quote mark ( “ ) click interaction: Mute/Unmute sound without restarting text
    document.querySelectorAll('.tw-quote-mark').forEach(quoteMark => {
        quoteMark.setAttribute('title', 'ბეჭდვის საუნდის ჩართვა / გამორთვა (Mute / Unmute) 🔊');
        quoteMark.style.cursor = 'pointer';
        quoteMark.addEventListener('click', (e) => {
            e.stopPropagation();
            const manifestoCard = quoteMark.closest('#manifesto-typewriter-card');
            if (manifestoCard) {
                // In Manifesto: Toggle sound on/off during typing WITHOUT restarting the text!
                manifestoSoundActive = !manifestoSoundActive;
                if (manifestoSoundActive) {
                    quoteMark.style.opacity = '1';
                    if (manifestoIsTyping) {
                        startTwTypingAudio();
                    } else {
                        // If typing was already finished, replay with sound
                        startManifestoTypewriter(true);
                    }
                } else {
                    quoteMark.style.opacity = '0.4';
                    stopTwTypingAudio();
                }
            } else {
                // In Team cards: Toggle typing sound on/off without restarting text
                isTypingSoundEnabled = !isTypingSoundEnabled;
                if (!isTypingSoundEnabled) {
                    stopTwTypingAudio();
                    quoteMark.style.opacity = '0.4';
                } else {
                    quoteMark.style.opacity = '1';
                    if (isCurrentlyTyping) {
                        startTwTypingAudio();
                    }
                }
            }
        });
    });

    // 3. Keyboard Arrow Navigation (← / → arrow keys to switch team members)
    document.addEventListener('keydown', (e) => {
        const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
        if (activeTag === 'input' || activeTag === 'textarea' || (document.activeElement && document.activeElement.isContentEditable)) {
            return;
        }

        if (!twText) return;

        if (e.key === 'ArrowRight' || e.key === 'Right') {
            setTestimonial(currentTwIdx + 1, true);
        } else if (e.key === 'ArrowLeft' || e.key === 'Left') {
            setTestimonial(currentTwIdx - 1, true);
        }
    });

    // ==========================================================================
    // 4. KINETIC IMAGE-TEXT REVEAL SCROLL ANIMATION (About Us Section Parts 1 & 2)
    // ==========================================================================
    const allRevealLines = document.querySelectorAll('.about-image-text-reveal-section .reveal-line');
    const mouseImgFollower = document.getElementById('mouse-img-follower');
    const mouseImgFollowerElem = document.getElementById('mouse-img-follower-elem');

    if (allRevealLines.length > 0 && typeof gsap !== 'undefined') {
        if (typeof ScrollTrigger !== 'undefined') {
            gsap.registerPlugin(ScrollTrigger);
        }

        const isMobile = window.innerWidth < 768;
        const revealWidth = isMobile ? 110 : 280;

        allRevealLines.forEach((line) => {
            const imgSpan = line.querySelector('.img-reveal-span');
            if (imgSpan) {
                gsap.to(imgSpan, {
                    width: revealWidth,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: line,
                        start: 'top 85%',
                        end: 'top 40%',
                        scrub: 1,
                        invalidateOnRefresh: true,
                    },
                });

                // Hover Preview Image Follower
                const previewImgSrc = imgSpan.dataset.previewImg;
                if (previewImgSrc) {
                    imgSpan.addEventListener('mouseenter', () => {
                        if (mouseImgFollower && mouseImgFollowerElem) {
                            mouseImgFollowerElem.src = previewImgSrc;
                            mouseImgFollower.classList.add('active');
                        }
                    });

                    imgSpan.addEventListener('mouseleave', () => {
                        if (mouseImgFollower) {
                            mouseImgFollower.classList.remove('active');
                        }
                    });
                }
            }
        });

        // Smooth Mouse Follower
        window.addEventListener('mousemove', (e) => {
            if (mouseImgFollower) {
                gsap.to(mouseImgFollower, {
                    x: e.clientX,
                    y: e.clientY,
                    duration: 0.4,
                    ease: 'power3.out',
                });
            }
        });
    }

    // About Us Manifesto Live Typewriter Logic
    const manifestoFullText = "ეს არ არის უბრალოდ სივრცე — „მეტაფორა“ არის გარემო, სადაც იდეები ცოცხლდებიან, ხოლო ადამიანები და შესაძლებლობები ერთმანეთს პოულობენ. აქ ყველაფერია შენი განვითარების, ახალი კონტაქტებისა და შთაგონებისთვის: Personal Development, Business, Think Tank, Art და Clubs.";
    const manifestoTextElem = document.getElementById('manifesto-typewriter-text');
    const manifestoCard = document.getElementById('manifesto-typewriter-card');
    let manifestoTypeTimer = null;

    function startManifestoTypewriter(playSound = false) {
        if (!manifestoTextElem) return;
        clearTimeout(manifestoTypeTimer);
        stopTwTypingAudio();
        manifestoTextElem.textContent = '';
        let charIndex = 0;
        manifestoIsTyping = true;
        manifestoSoundActive = playSound;

        const manifestoQuote = document.querySelector('#manifesto-typewriter-card .tw-quote-mark');
        if (manifestoQuote) {
            manifestoQuote.style.opacity = manifestoSoundActive ? '1' : '0.4';
        }

        if (manifestoSoundActive) {
            startTwTypingAudio();
        }

        function typeNextChar() {
            if (charIndex < manifestoFullText.length) {
                const char = manifestoFullText.charAt(charIndex);
                manifestoTextElem.textContent += char;
                charIndex++;

                const prevChar = manifestoFullText.charAt(charIndex - 1);
                let speed = 20;
                if (prevChar === '.' || prevChar === '!' || prevChar === '?') speed = 120;
                else if (prevChar === '—' || prevChar === ',') speed = 55;

                manifestoTypeTimer = setTimeout(typeNextChar, speed);
            } else {
                manifestoIsTyping = false;
                manifestoSoundActive = false;
                stopTwTypingAudio();
            }
        }
        typeNextChar();
    }

    if (manifestoCard && 'IntersectionObserver' in window) {
        const obs = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    startManifestoTypewriter(false);
                }
            });
        }, { threshold: 0.25 });

        obs.observe(manifestoCard);
    } else {
        startManifestoTypewriter(false);
    }

    // ==========================================================================
    // 4.5. MANIFESTO MUSIC PLAYER (metafora.mp3)
    // ==========================================================================
    const aboutPlayBtn = document.getElementById('about-play-btn');
    const aboutPlayIcon = document.getElementById('about-play-icon');
    const aboutPlayText = document.getElementById('about-play-text');
    const aboutVisualizer = document.getElementById('about-visualizer');
    const aboutAudioTime = document.getElementById('about-audio-time');
    
    let manifestoAudio = null;
    try {
        if (typeof Audio !== 'undefined') {
            manifestoAudio = new Audio('metafora.mp3');
            manifestoAudio.preload = 'metadata';
        }
    } catch (e) {
        console.warn('Audio initialization skipped in this environment:', e);
    }

    function formatAudioSeconds(sec) {
        if (isNaN(sec) || sec < 0) return '0:00';
        const mins = Math.floor(sec / 60);
        const secs = Math.floor(sec % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }

    if (aboutPlayBtn && manifestoAudio) {
        manifestoAudio.addEventListener('loadedmetadata', () => {
            const total = formatAudioSeconds(manifestoAudio.duration);
            if (aboutAudioTime) aboutAudioTime.textContent = `0:00 / ${total}`;
        });

        manifestoAudio.addEventListener('timeupdate', () => {
            const cur = formatAudioSeconds(manifestoAudio.currentTime);
            const total = formatAudioSeconds(manifestoAudio.duration || 179);
            if (aboutAudioTime) aboutAudioTime.textContent = `${cur} / ${total}`;
        });

        manifestoAudio.addEventListener('ended', () => {
            if (aboutVisualizer) aboutVisualizer.classList.remove('playing');
            if (aboutPlayIcon) aboutPlayIcon.textContent = '▶';
            if (aboutPlayText) aboutPlayText.textContent = 'მოსმენა';
            aboutPlayBtn.style.background = '';
            const total = formatAudioSeconds(manifestoAudio.duration || 179);
            if (aboutAudioTime) aboutAudioTime.textContent = `0:00 / ${total}`;
        });

        manifestoAudio.addEventListener('pause', () => {
            if (aboutVisualizer) aboutVisualizer.classList.remove('playing');
            if (aboutPlayIcon) aboutPlayIcon.textContent = '▶';
            if (aboutPlayText) aboutPlayText.textContent = 'მოსმენა';
            aboutPlayBtn.style.background = '';
        });

        manifestoAudio.addEventListener('play', () => {
            if (aboutVisualizer) aboutVisualizer.classList.add('playing');
            if (aboutPlayIcon) aboutPlayIcon.textContent = '❚❚';
            if (aboutPlayText) aboutPlayText.textContent = 'პაუზა';
            aboutPlayBtn.style.background = 'var(--brand-plum)';
        });

        aboutPlayBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (manifestoAudio.paused) {
                manifestoAudio.play().catch(err => {
                    console.log('Audio autoplay prevented or error:', err);
                });
            } else {
                manifestoAudio.pause();
            }
        });
    }

    // ==========================================================================
    // 5. GALLERY PAGE CATEGORY FILTERING
    // ==========================================================================
    const galleryTabs = document.querySelectorAll('.gallery-tab-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');

    function filterGallery(category) {
        galleryTabs.forEach(tab => {
            if (tab.dataset.tab === category) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });

        galleryItems.forEach(item => {
            if (category === 'all' || item.dataset.category === category) {
                item.classList.remove('hidden');
                item.style.opacity = '1';
                item.style.transform = 'scale(1)';
            } else {
                item.classList.add('hidden');
            }
        });
    }

    galleryTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            filterGallery(tab.dataset.tab);
        });
    });

    if (galleryTabs.length > 0) {
        let initialCat = 'team';
        if (window.location.hash) {
            const hashCategory = window.location.hash.replace('#', '');
            if (['spaces', 'team', 'events', 'all'].includes(hashCategory)) {
                initialCat = hashCategory;
            }
        }
        filterGallery(initialCat);
    }

    // ==========================================================================
    // 6. GLASSMORPHISM BOOKING & PAYMENT SYSTEM ENGINE (PORTED & ADAPTED FROM IDC)
    // ==========================================================================
    const bookingModalOverlay = document.getElementById('booking-modal-overlay');
    const bookingGlassCard = document.getElementById('booking-modal-glass-card');
    const modalCloseBtn = document.getElementById('modal-close-btn');

    const bookingStepForm = document.getElementById('booking-step-form');
    const bookingStepPayment = document.getElementById('booking-step-payment');
    const bookingStepSuccess = document.getElementById('booking-step-success');

    const bookingForm = document.getElementById('metafora-booking-form');
    const bookingFormStatus = document.getElementById('booking-form-status');
    const btnProceedToPayment = document.getElementById('btn-proceed-to-payment');

    const btnPaymentBack = document.getElementById('btn-payment-back');
    const btnPaymentConfirm = document.getElementById('btn-payment-confirm');
    const btnCloseSuccess = document.getElementById('btn-close-success');

    const btnCopyIban = document.getElementById('btn-copy-iban');
    const copyBtnText = document.getElementById('copy-btn-text');
    const btnCopyAmount = document.getElementById('btn-copy-amount');
    const copyAmountBtnText = document.getElementById('copy-amount-btn-text');
    const btnCopyFullRequisites = document.getElementById('btn-copy-full-requisites');
    const copyFullText = document.getElementById('copy-full-text');

    const metaforaIbanVal = document.getElementById('metafora-iban-val');
    const bookingPaymentAmount = document.getElementById('booking-payment-amount');
    const bookingPaymentPurpose = document.getElementById('booking-payment-purpose');

    const btnBogPay = document.getElementById('btn-bog-pay');
    const btnTbcPay = document.getElementById('btn-tbc-pay');

    const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
    let pendingBookingPayload = null;

    const SERVICE_PRICES = {};

    function getServicePrice(serviceName) {
        if (!serviceName) return "";
        const lower = serviceName.toLowerCase();
        for (const [key, price] of Object.entries(SERVICE_PRICES)) {
            if (lower.includes(key)) return price;
        }
        return "";
    }

    // Helper: Set dynamic QR code with fallback providers
    function setBookingQrCodeUrl(url) {
        const qrImg = document.getElementById('booking-qr-img');
        if (!qrImg) return;

        const encoded = encodeURIComponent(url);
        const qrProviders = [
            `https://api.qrserver.com/v1/create-qr-code/?size=450x450&data=${encoded}&margin=10&ecc=M`,
            `https://quickchart.io/qr?size=450&text=${encoded}&margin=2&ecLevel=M`,
            `https://chart.googleapis.com/chart?cht=qr&chs=450x450&chld=M|2&chl=${encoded}`
        ];

        let providerIndex = 0;
        qrImg.onerror = () => {
            providerIndex++;
            if (providerIndex < qrProviders.length) {
                qrImg.src = qrProviders[providerIndex];
            }
        };
        qrImg.src = qrProviders[0];
    }

    // Helper: Telegram bot notifications
    async function sendTelegramBookingNotification(payload) {
        const botToken = "8563426842:AAEuhg8EXmAV18NXtlAaiky0ZzWGvNXkJQU";
        const chatId = "443575738";

        const priceLine = payload.price ? `💰 *საფასური:* ${payload.price}\n` : '';
        const text = `🏛️ *მეტაფორა — ახალი ჯავშანი & გადახდა!* 💳\n\n` +
            `👤 *სტუმარი:* ${payload.name}\n` +
            `📞 *ტელეფონი:* ${payload.phone}\n` +
            `✨ *მიმართულება:* ${payload.service}\n` +
            priceLine +
            `📅 *თარიღი:* ${payload.date}\n` +
            `🕒 *დრო:* ${payload.time}\n` +
            `👥 *სტუმრები:* ${payload.guests}\n` +
            `✅ *სტატუსი:* ${payload.payment_status || 'გადახდილია (დადასტურებული)'}`;

        try {
            await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: text,
                    parse_mode: "Markdown"
                })
            });
        } catch (e) {
            console.error("Telegram notification error:", e);
        }
    }

    function showBookingStep(step) {
        if (bookingStepForm) bookingStepForm.classList.add('hidden');
        if (bookingStepPayment) bookingStepPayment.classList.add('hidden');
        if (bookingStepSuccess) bookingStepSuccess.classList.add('hidden');

        if (bookingGlassCard) {
            if (step === 'payment') {
                bookingGlassCard.classList.add('payment-mode');
            } else {
                bookingGlassCard.classList.remove('payment-mode');
            }
        }

        if (step === 'form' && bookingStepForm) {
            bookingStepForm.classList.remove('hidden');
        } else if (step === 'payment' && bookingStepPayment) {
            bookingStepPayment.classList.remove('hidden');
        } else if (step === 'success' && bookingStepSuccess) {
            bookingStepSuccess.classList.remove('hidden');
        }
    }

    function openBookingModal(preselectedService = '') {
        if (bookingModalOverlay) {
            if (preselectedService) {
                const sSelect = document.getElementById('booking-service-select');
                if (sSelect) {
                    for (let opt of sSelect.options) {
                        if (opt.value.toLowerCase().includes(preselectedService.toLowerCase()) || opt.text.toLowerCase().includes(preselectedService.toLowerCase())) {
                            opt.selected = true;
                            break;
                        }
                    }
                }
            }
            showBookingStep('form');
            bookingModalOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    function closeBookingModal() {
        if (bookingModalOverlay) {
            bookingModalOverlay.classList.remove('active');
            document.body.style.overflow = '';
            setTimeout(() => {
                showBookingStep('form');
                if (bookingFormStatus) bookingFormStatus.classList.add('hidden');
            }, 300);
        }
    }

    function showBookingStatus(msg, isError = false) {
        if (!bookingFormStatus) return;
        bookingFormStatus.textContent = msg;
        bookingFormStatus.className = `booking-status-box ${isError ? 'error' : ''}`;
        bookingFormStatus.classList.remove('hidden');
    }

    function clearInputErrors() {
        const inputs = document.querySelectorAll('#metafora-booking-form input, #metafora-booking-form select');
        inputs.forEach(inp => inp.classList.remove('input-error'));
        if (bookingFormStatus) bookingFormStatus.classList.add('hidden');
    }

    function validateBookingInputs() {
        clearInputErrors();
        const isEn = (localStorage.getItem('metafora_lang') === 'EN');

        const nameInput = document.getElementById('booking-name-input');
        const phoneInput = document.getElementById('booking-phone-input');
        const dateInput = document.getElementById('booking-date-input');
        const timeSelect = document.getElementById('booking-time-select');
        const guestsSelect = document.getElementById('booking-guests-select');
        const serviceSelect = document.getElementById('booking-service-select');

        const name = (nameInput?.value || '').trim();
        const phone = (phoneInput?.value || '').trim().replace(/\s+/g, '');
        const date = (dateInput?.value || '').trim();
        const time = (timeSelect?.value || '').trim();
        const guests = (guestsSelect?.value || '').trim();
        const service = (serviceSelect?.value || '').trim();

        if (!name) {
            if (nameInput) {
                nameInput.classList.add('input-error');
                nameInput.focus();
            }
            showBookingStatus(isEn ? '⚠️ Please enter your full name.' : '⚠️ გთხოვთ შეავსოთ თქვენი სახელი და გვარი.', true);
            return null;
        }

        if (!date) {
            if (dateInput) {
                dateInput.classList.add('input-error');
                dateInput.focus();
            }
            showBookingStatus(isEn ? '⚠️ Please select a date.' : '⚠️ გთხოვთ აირჩიოთ სასურველი თარიღი.', true);
            return null;
        }

        if (!phone) {
            if (phoneInput) {
                phoneInput.classList.add('input-error');
                phoneInput.focus();
            }
            showBookingStatus(isEn ? '⚠️ Please enter your contact phone number.' : '⚠️ გთხოვთ მიუთითოთ საკონტაქტო ტელეფონის ნომერი.', true);
            return null;
        }

        let normalizedPhone = phone;
        if (normalizedPhone.startsWith("+995")) {
            normalizedPhone = normalizedPhone.slice(4);
        } else if (normalizedPhone.startsWith("995")) {
            normalizedPhone = normalizedPhone.slice(3);
        }

        if (!/^5\d{8}$/.test(normalizedPhone)) {
            if (phoneInput) {
                phoneInput.classList.add('input-error');
                phoneInput.focus();
            }
            showBookingStatus(isEn ? '⚠️ Invalid phone number (must start with 5 and contain 9 digits, e.g. 599 22 82 28).' : '⚠️ ტელეფონის ნომერი არასწორია (უნდა იწყებოდეს 5-ით და შედგებოდეს 9 ციფრისგან, მაგ: 599 22 82 28).', true);
            return null;
        }

        const price = getServicePrice(service);

        return {
            name: name,
            phone: "+995 " + normalizedPhone,
            date: date,
            time: time,
            guests: guests || '1 ადამიანი',
            service: service,
            price: price
        };
    }

    // Attach real-time clearing of error styles and custom Georgian validity tooltips
    function initBookingInputListeners() {
        const formInputs = document.querySelectorAll('#metafora-booking-form input, #metafora-booking-form select');
        formInputs.forEach(input => {
            input.addEventListener('input', () => {
                input.classList.remove('input-error');
                input.setCustomValidity('');
                if (bookingFormStatus) bookingFormStatus.classList.add('hidden');
            });
            input.addEventListener('change', () => {
                input.classList.remove('input-error');
                input.setCustomValidity('');
                if (bookingFormStatus) bookingFormStatus.classList.add('hidden');
            });
            input.addEventListener('invalid', (e) => {
                const isEn = (localStorage.getItem('metafora_lang') === 'EN');
                input.classList.add('input-error');
                input.setCustomValidity(isEn ? 'Please fill out this field.' : 'გთხოვთ შეავსოთ ეს ველი.');
            });
        });
    }
    initBookingInputListeners();

    function openPaymentStep(payload) {
        if (payload.price === undefined) {
            payload.price = getServicePrice(payload.service);
        }
        pendingBookingPayload = payload;

        const amountRow = document.getElementById('booking-amount-row');
        if (payload.price && payload.price.trim() !== '') {
            if (bookingPaymentAmount) bookingPaymentAmount.textContent = payload.price;
            if (amountRow) amountRow.style.display = 'flex';
        } else {
            if (bookingPaymentAmount) bookingPaymentAmount.textContent = '';
            if (amountRow) amountRow.style.display = 'none';
        }

        if (bookingPaymentPurpose) {
            bookingPaymentPurpose.innerHTML = `მეტაფორას ჯავშანი — <strong>${payload.name} (${payload.service})</strong>`;
        }

        const priceQuery = payload.price ? `&price=${encodeURIComponent(payload.price)}` : '';
        let baseOrigin = window.location.origin;
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            baseOrigin = `http://192.168.1.3:8888`;
        }
        const mobilePayUrl = `${baseOrigin}${window.location.pathname}?pay_mobile=true&name=${encodeURIComponent(payload.name)}&service=${encodeURIComponent(payload.service)}${priceQuery}&date=${encodeURIComponent(payload.date)}`;
        setBookingQrCodeUrl(mobilePayUrl);

        const headerText = document.getElementById('bank-buttons-header-text');
        const bogBadge = document.getElementById('bog-badge-text');
        const tbcBadge = document.getElementById('tbc-badge-text');

        if (isMobileDevice) {
            if (headerText) headerText.textContent = "აირჩიეთ მობაილ ბანკი გადასასვლელად:";
            if (bogBadge) bogBadge.textContent = "BOG Mobile";
            if (tbcBadge) tbcBadge.textContent = "TBC Mobile";
        } else {
            if (headerText) headerText.textContent = "აირჩიეთ ბანკი ან გადადით ინტერნეტ ბანკში:";
            if (bogBadge) bogBadge.textContent = "iBank Web";
            if (tbcBadge) tbcBadge.textContent = "TBC Web";
        }

        showBookingStep('payment');
    }

    function copyTextToClipboard(text) {
        if (!text) return false;
        let copied = false;
        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(text);
                copied = true;
            }
        } catch (e) {}

        try {
            const textArea = document.createElement("textarea");
            textArea.value = text;
            textArea.style.position = "fixed";
            textArea.style.left = "-999999px";
            textArea.style.top = "-999999px";
            textArea.setAttribute("readonly", "");
            document.body.appendChild(textArea);
            textArea.select();
            textArea.setSelectionRange(0, 99999);
            const successful = document.execCommand("copy");
            document.body.removeChild(textArea);
            if (successful) copied = true;
        } catch (err) {}

        return copied;
    }

    function handleMetaforaBankClick(bankType, btnElement) {
        const targetIban = "GE93BG0000000192399800";
        const priceText = (pendingBookingPayload?.price || '').trim();
        const amountNum = priceText ? (parseInt(priceText.replace(/[^\d.]/g, ''), 10) || 0) : 0;
        const purposeStr = `მეტაფორას ჯავშანი - ${pendingBookingPayload?.name || 'სტუმარი'} (${pendingBookingPayload?.service || 'მეტაფორა'})`;

        // 1. Synchronously copy Clean IBAN to clipboard
        copyTextToClipboard(targetIban);

        // 2. Visual feedback on button
        const bankName = bankType === "bog" ? "საქართველოს ბანკ" : "თიბისი ბანკ";
        const priceMsg = priceText ? ` & ${priceText}` : '';
        if (btnElement) {
            const originalHTML = btnElement.innerHTML;
            btnElement.innerHTML = `
                <div style="display:flex; align-items:center; justify-content:center; gap:8px; width:100%; padding:4px 0;">
                    <span style="font-weight:800; font-size:0.82rem;">✓ IBAN${priceMsg} დაკოპირდა! გადადიხართ ${bankName}-ში...</span>
                </div>
            `;
            setTimeout(() => {
                btnElement.innerHTML = originalHTML;
            }, 3500);
        }

        // 3. Deep link redirect with prefilled transfer parameters
        if (!isMobileDevice) {
            if (bankType === "bog") {
                window.open("https://ibank.bog.ge/", "_blank");
            } else if (bankType === "tbc") {
                window.open("https://tbconline.ge/tbcrd/login?", "_blank");
            }
        } else {
            const encodedPurpose = encodeURIComponent(purposeStr);
            const amountParam = amountNum > 0 ? `&amount=${amountNum}` : '';
            if (bankType === "bog") {
                const primaryBog = `bogmbank://transfer?iban=${targetIban}${amountParam}&desc=${encodedPurpose}`;
                window.location.href = primaryBog;
                setTimeout(() => {
                    window.location.href = `bogmobile://transfer?account=${targetIban}${amountParam}`;
                }, 400);
            } else if (bankType === "tbc") {
                const primaryTbc = `tbcbank://transfer?iban=${targetIban}${amountParam}&purpose=${encodedPurpose}`;
                window.location.href = primaryTbc;
                setTimeout(() => {
                    window.location.href = `tbc-mobile://transfer?to=${targetIban}${amountParam}`;
                }, 400);
            }
        }
    }

    // Event Listeners for Booking Form & Buttons
    if (bookingForm) {
        bookingForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const payload = validateBookingInputs();
            if (!payload) return;
            openPaymentStep(payload);
        });
    }

    if (btnPaymentBack) {
        btnPaymentBack.addEventListener('click', () => {
            showBookingStep('form');
        });
    }

    if (btnBogPay) {
        btnBogPay.addEventListener('click', () => handleMetaforaBankClick('bog', btnBogPay));
    }

    if (btnTbcPay) {
        btnTbcPay.addEventListener('click', () => handleMetaforaBankClick('tbc', btnTbcPay));
    }

    // Copy IBAN
    if (btnCopyIban && metaforaIbanVal) {
        btnCopyIban.addEventListener('click', () => {
            const iban = metaforaIbanVal.textContent.trim();
            copyTextToClipboard(iban);
            if (copyBtnText) copyBtnText.textContent = "✓ დაკოპირდა!";
            setTimeout(() => {
                if (copyBtnText) copyBtnText.textContent = "📋 კოპირება";
            }, 2000);
        });
    }

    // Copy Amount
    if (btnCopyAmount && bookingPaymentAmount) {
        btnCopyAmount.addEventListener('click', () => {
            const rawAmount = bookingPaymentAmount.textContent.replace(/[^\d.]/g, '').trim();
            copyTextToClipboard(rawAmount);
            if (copyAmountBtnText) copyAmountBtnText.textContent = "✓ დაკოპირდა!";
            setTimeout(() => {
                if (copyAmountBtnText) copyAmountBtnText.textContent = "📋 კოპირება";
            }, 2000);
        });
    }

    // Copy Full Requisites
    if (btnCopyFullRequisites) {
        btnCopyFullRequisites.addEventListener('click', () => {
            const iban = metaforaIbanVal?.textContent.trim() || "GE93BG0000000192399800";
            const price = (pendingBookingPayload?.price || '').trim();
            const service = pendingBookingPayload?.service || "მეტაფორა";
            const name = pendingBookingPayload?.name || "სტუმარი";
            const purpose = `მეტაფორას ჯავშანი - ${name} (${service})`;
            const priceLine = price ? `\nსაფასური: ${price}` : '';

            const fullText = `მიმღები: ანი მაისურაძე\nბანკი: საქართველოს ბანკი (BOG)\nIBAN: ${iban}${priceLine}\nდანიშნულება: ${purpose}`;

            copyTextToClipboard(fullText);
            if (copyFullText) copyFullText.textContent = "✓ სრული რეკვიზიტები დაკოპირდა!";
            setTimeout(() => {
                if (copyFullText) copyFullText.textContent = "📋 სრული რეკვიზიტების კოპირება (IBAN, მიმღები, თანხა, დანიშნულება)";
            }, 2500);
        });
    }

    if (btnPaymentConfirm) {
        btnPaymentConfirm.addEventListener('click', async () => {
            if (!pendingBookingPayload) {
                closeBookingModal();
                return;
            }

            const confirmBtnLabel = document.getElementById('confirm-btn-label');
            const originalLabel = confirmBtnLabel ? confirmBtnLabel.textContent : btnPaymentConfirm.innerHTML;
            btnPaymentConfirm.disabled = true;
            if (confirmBtnLabel) confirmBtnLabel.textContent = "⏳ იგზავნება...";

            const payload = {
                ...pendingBookingPayload,
                payment_status: "გადახდილია (მომხმარებელმა დაადასტურა)",
                payment_method: "საბანკო გადარიცხვა (BOG / TBC)"
            };

            // 1. Send Telegram Notification
            await sendTelegramBookingNotification(payload);

            // 2. Send Webhook
            try {
                fetch('https://meticulous-oyster.pikapod.net/webhook/metafora-booking', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'x-booking-secret': 'aeYMKQvGD2j-Sh_j-5aOJvTg6Kg' },
                    body: JSON.stringify(payload)
                }).catch(err => console.warn("Webhook warning:", err));
            } catch (e) {}

            btnPaymentConfirm.disabled = false;
            if (confirmBtnLabel) confirmBtnLabel.textContent = originalLabel;
            if (bookingForm) bookingForm.reset();

            showBookingStep('success');
        });
    }

    if (btnCloseSuccess) {
        btnCloseSuccess.addEventListener('click', closeBookingModal);
    }

    // Delegated click for all booking buttons across all pages
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.open-booking-modal-btn');
        if (btn) {
            e.preventDefault();
            const mobOverlay = document.getElementById('mobile-nav-overlay');
            if (mobOverlay) {
                mobOverlay.classList.remove('active');
            }
            
            // Extract preselected service if button is on a specific service card/header
            let sName = '';
            const card = btn.closest('.service-deep-section, .service-card, .afisha-event-card');
            if (card) {
                const titleElem = card.querySelector('.service-deep-title, .card-title, .afisha-title');
                if (titleElem) sName = titleElem.textContent;
            }
            openBookingModal(sName);
        }
    });

    if (modalCloseBtn) {
        modalCloseBtn.addEventListener('click', closeBookingModal);
    }

    if (bookingModalOverlay) {
        bookingModalOverlay.addEventListener('click', (e) => {
            if (e.target === bookingModalOverlay) {
                closeBookingModal();
            }
        });
    }

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && bookingModalOverlay && bookingModalOverlay.classList.contains('active')) {
            closeBookingModal();
        }
    });

    // Check if opened on mobile via QR scan (?pay_mobile=true)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('pay_mobile') === 'true') {
        const name = urlParams.get('name') || 'სტუმარი';
        const service = urlParams.get('service') || 'მეტაფორა Clubs';
        const price = urlParams.get('price') || getServicePrice(service);
        const date = urlParams.get('date') || new Date().toISOString().split('T')[0];

        openPaymentStep({
            name: name,
            phone: 'N/A (Mobile QR Scan)',
            date: date,
            time: '19:30 — 22:00',
            guests: '2 ადამიანი',
            service: service,
            price: price
        });

        if (bookingModalOverlay) {
            bookingModalOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }



    // ==========================================================================
    // DOMINANT COLOR THEME SWITCHER (TEAL vs PLUM) - SPIN TOGGLE
    // ==========================================================================
    function initThemeSwitcher() {
        const savedTheme = localStorage.getItem('metafora_color_theme') || 'teal';
        setTheme(savedTheme, false);

        const spinToggles = document.querySelectorAll('.theme-spin-toggle, #theme-spin-toggle');
        spinToggles.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const isPlum = document.documentElement.getAttribute('data-theme') === 'plum';
                const nextTheme = isPlum ? 'teal' : 'plum';

                btn.classList.add('spin-anim');
                setTimeout(() => btn.classList.remove('spin-anim'), 650);

                setTheme(nextTheme, true);
            });
        });
    }

    function setTheme(theme, save = true) {
        const isPlum = (theme === 'plum');
        if (isPlum) {
            document.documentElement.setAttribute('data-theme', 'plum');
            document.body.setAttribute('data-theme', 'plum');
            
            // Switch dynamic brand logos to plum
            document.querySelectorAll('.brand-dynamic-logo').forEach(img => {
                img.src = 'logo_plum_crop.png';
            });
            document.querySelectorAll('.brand-dynamic-o').forEach(img => {
                img.src = 'logo_o_plum.png';
            });
        } else {
            document.documentElement.removeAttribute('data-theme');
            document.body.removeAttribute('data-theme');
            
            // Switch dynamic brand logos to teal
            document.querySelectorAll('.brand-dynamic-logo').forEach(img => {
                img.src = 'logo_teal_crop.png';
            });
            document.querySelectorAll('.brand-dynamic-o').forEach(img => {
                img.src = 'logo_o_teal.png';
            });
        }

        if (save) {
            localStorage.setItem('metafora_color_theme', theme);
        }
    }

    // ==========================================================================
    // BLOG PAGE: INTERACTIVE 3D DANDELION FIGURE (BU FIGURE)
    // ==========================================================================
    function initBUFigure() {
        const stage = document.getElementById("bu-stage");
        const stemsSvg = document.getElementById("bu-stems-svg");
        const centerCore = document.getElementById("bu-center-core");
        const nodesContainer = document.getElementById("bu-outer-nodes-container");

        if (!stage || !stemsSvg || !centerCore || !nodesContainer) return;

        const numRays = 20;
        const rays = [];
        const svgLines = [];
        const ringElements = [];

        for (let i = 0; i < numRays; i++) {
            const isLong = (i % 2 === 0);
            const baseRadius = isLong ? 120 : 80;
            const angleOffset = (i * (2 * Math.PI / numRays)) - (Math.PI / 2);

            // SVG Ray line
            const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
            line.setAttribute("stroke", "currentColor");
            line.setAttribute("stroke-width", "2");
            line.setAttribute("stroke-linecap", "round");
            line.style.color = "var(--primary-color)";
            stemsSvg.appendChild(line);
            svgLines.push(line);

            // Outer Hollow Ring ('o' head)
            const ring = document.createElement("div");
            ring.style.position = "absolute";
            ring.style.width = isLong ? "16px" : "12px";
            ring.style.height = isLong ? "16px" : "12px";
            ring.style.borderRadius = "50%";
            ring.style.background = "#ffffff";
            ring.style.border = isLong ? "2.4px solid var(--primary-color)" : "1.8px solid var(--primary-color)";
            ring.style.boxShadow = "0 3px 8px rgba(1, 97, 102, 0.25)";
            ring.style.transform = "translate(-50%, -50%)";
            ring.style.pointerEvents = "none";
            ring.style.willChange = "transform, left, top";
            nodesContainer.appendChild(ring);
            ringElements.push(ring);

            rays.push({
                angleOffset,
                baseRadius,
                isLong,
                phase: i * 0.45,
                speed: 1.2 + (i % 3) * 0.2
            });
        }

        // 3D & Physics Variables
        let currentYaw = 0;
        let targetYaw = 0;
        let velocityYaw = 0;
        let currentPitch = 0;
        let targetPitch = 0;
        let velocityPitch = 0;

        let pointerInteracting = null;
        let isPaused = false;
        let time = 0;

        function animateBU() {
            time += 0.016;

            if (!isPaused) {
                targetYaw += 0.0018; // Smooth, slow 360-degree rotation
            }

            // Spring physics
            const forceYaw = (targetYaw - currentYaw) * 0.05;
            velocityYaw = (velocityYaw + forceYaw) * 0.88;
            currentYaw += velocityYaw;

            const forcePitch = (targetPitch - currentPitch) * 0.05;
            velocityPitch = (velocityPitch + forcePitch) * 0.88;
            currentPitch += velocityPitch;

            const stageRect = stage.getBoundingClientRect();
            const stageW = stageRect.width || 380;
            const stageH = stageRect.height || 360;
            const cx = stageW / 2;
            const cy = stageH / 2;

            // Center core subtle 3D tilt
            const tiltX = currentPitch * 12;
            const tiltY = Math.sin(currentYaw) * 8;
            centerCore.style.transform = `translate(${tiltY.toFixed(1)}px, ${tiltX.toFixed(1)}px) scale(${1 + Math.sin(time) * 0.025})`;

            const coreCenterX = cx + tiltY;
            const coreCenterY = cy + tiltX;

            // Update Rays & Hollow Rings
            rays.forEach((ray, i) => {
                const breath = Math.sin(time * ray.speed + ray.phase) * (ray.isLong ? 4 : 2.5);
                const r = ray.baseRadius + breath;

                const ang = currentYaw + ray.angleOffset;
                const x0 = r * Math.cos(ang);
                const y0 = r * Math.sin(ang);
                const z0 = r * Math.sin(ang) * 0.25;

                const pitchTilt = 0.06 + (currentPitch * 0.10);
                const y1 = y0 * Math.cos(pitchTilt) - z0 * Math.sin(pitchTilt);
                const z1 = y0 * Math.sin(pitchTilt) + z0 * Math.cos(pitchTilt);

                const perspective = 500 / (500 - z1);
                const projX = x0 * perspective;
                const projY = y1 * perspective;

                const targetX = cx + projX;
                const targetY = cy + projY;

                // Update Line from center core to outer ring
                const line = svgLines[i];
                line.setAttribute("x1", coreCenterX.toFixed(1));
                line.setAttribute("y1", coreCenterY.toFixed(1));
                line.setAttribute("x2", targetX.toFixed(1));
                line.setAttribute("y2", targetY.toFixed(1));

                // Update Ring
                const ring = ringElements[i];
                ring.style.left = `${targetX.toFixed(1)}px`;
                ring.style.top = `${targetY.toFixed(1)}px`;
                const ringScale = 0.88 + (z1 / 150) * 0.22;
                ring.style.transform = `translate(-50%, -50%) scale(${ringScale.toFixed(2)})`;
            });

            requestAnimationFrame(animateBU);
        }

        requestAnimationFrame(animateBU);

        // Drag & Touch Interaction
        stage.addEventListener('pointerdown', (e) => {
            pointerInteracting = { x: e.clientX, y: e.clientY };
            stage.style.cursor = 'grabbing';
            isPaused = true;
        });

        window.addEventListener('pointerup', () => {
            pointerInteracting = null;
            stage.style.cursor = 'grab';
            isPaused = false;
        });
    }

    // ==========================================================================
    // SECTION 5: MANIFESTO 3D SPINNING FIGURE
    // ==========================================================================
    function initManifestoSpinningFigure() {
        const stage = document.getElementById("manifesto-figure-stage");
        const stemsSvg = document.getElementById("manifesto-figure-svg");
        const centerCore = document.getElementById("manifesto-figure-core");
        const nodesContainer = document.getElementById("manifesto-figure-rings");

        if (!stage || !stemsSvg || !centerCore || !nodesContainer) return;

        const numRays = 18;
        const rays = [];
        const svgLines = [];
        const ringElements = [];

        for (let i = 0; i < numRays; i++) {
            const isLong = (i % 2 === 0);
            const baseRadius = isLong ? 65 : 45;
            const angleOffset = (i * (2 * Math.PI / numRays)) - (Math.PI / 2);

            // SVG Ray line
            const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
            line.setAttribute("stroke", "currentColor");
            line.setAttribute("stroke-width", "1.6");
            line.setAttribute("stroke-linecap", "round");
            line.style.color = "var(--primary-color)";
            stemsSvg.appendChild(line);
            svgLines.push(line);

            // Outer Hollow Ring ('o' head)
            const ring = document.createElement("div");
            ring.style.position = "absolute";
            ring.style.width = isLong ? "10px" : "8px";
            ring.style.height = isLong ? "10px" : "8px";
            ring.style.borderRadius = "50%";
            ring.style.background = "#ffffff";
            ring.style.border = isLong ? "2px solid var(--primary-color)" : "1.5px solid var(--primary-color)";
            ring.style.boxShadow = "0 2px 5px rgba(1, 97, 102, 0.25)";
            ring.style.transform = "translate(-50%, -50%)";
            ring.style.pointerEvents = "none";
            ring.style.willChange = "transform, left, top";
            nodesContainer.appendChild(ring);
            ringElements.push(ring);

            rays.push({
                angleOffset,
                baseRadius,
                isLong,
                phase: i * 0.45,
                speed: 1.2 + (i % 3) * 0.2
            });
        }

        // 3D & Physics Variables
        let currentYaw = 0;
        let targetYaw = 0;
        let velocityYaw = 0;
        let currentPitch = 0;
        let targetPitch = 0;
        let velocityPitch = 0;

        let pointerInteracting = null;
        let isPaused = false;
        let time = 0;

        function animateManifesto() {
            time += 0.016;

            if (!isPaused) {
                targetYaw += 0.002; // Continuous smooth 360-degree rotation
            }

            // Spring physics
            const forceYaw = (targetYaw - currentYaw) * 0.06;
            velocityYaw = (velocityYaw + forceYaw) * 0.88;
            currentYaw += velocityYaw;

            const forcePitch = (targetPitch - currentPitch) * 0.06;
            velocityPitch = (velocityPitch + forcePitch) * 0.88;
            currentPitch += velocityPitch;

            const stageRect = stage.getBoundingClientRect();
            const stageW = stageRect.width || 165;
            const stageH = stageRect.height || 165;
            const cx = stageW / 2;
            const cy = stageH / 2;

            // Center core subtle 3D tilt
            const tiltX = currentPitch * 8;
            const tiltY = Math.sin(currentYaw) * 5;
            centerCore.style.transform = `translate(${tiltY.toFixed(1)}px, ${tiltX.toFixed(1)}px) scale(${1 + Math.sin(time) * 0.025})`;

            const coreCenterX = cx + tiltY;
            const coreCenterY = cy + tiltX;

            // Update Rays & Hollow Rings
            rays.forEach((ray, i) => {
                const breath = Math.sin(time * ray.speed + ray.phase) * (ray.isLong ? 3 : 1.8);
                const r = ray.baseRadius + breath;

                const ang = currentYaw + ray.angleOffset;
                const x0 = r * Math.cos(ang);
                const y0 = r * Math.sin(ang);
                const z0 = r * Math.sin(ang) * 0.25;

                const pitchTilt = 0.06 + (currentPitch * 0.10);
                const y1 = y0 * Math.cos(pitchTilt) - z0 * Math.sin(pitchTilt);
                const z1 = y0 * Math.sin(pitchTilt) + z0 * Math.cos(pitchTilt);

                const perspective = 350 / (350 - z1);
                const projX = x0 * perspective;
                const projY = y1 * perspective;

                const targetX = cx + projX;
                const targetY = cy + projY;

                // Update Line from center core to outer ring
                const line = svgLines[i];
                line.setAttribute("x1", coreCenterX.toFixed(1));
                line.setAttribute("y1", coreCenterY.toFixed(1));
                line.setAttribute("x2", targetX.toFixed(1));
                line.setAttribute("y2", targetY.toFixed(1));

                // Update Ring
                const ring = ringElements[i];
                ring.style.left = `${targetX.toFixed(1)}px`;
                ring.style.top = `${targetY.toFixed(1)}px`;
                const ringScale = 0.88 + (z1 / 100) * 0.2;
                ring.style.transform = `translate(-50%, -50%) scale(${ringScale.toFixed(2)})`;
            });

            requestAnimationFrame(animateManifesto);
        }

        requestAnimationFrame(animateManifesto);

        // Drag & Touch Interaction
        stage.addEventListener('pointerdown', (e) => {
            pointerInteracting = { x: e.clientX, y: e.clientY };
            stage.style.cursor = 'grabbing';
            isPaused = true;
        });

        window.addEventListener('pointermove', (e) => {
            if (pointerInteracting !== null) {
                const deltaX = e.clientX - pointerInteracting.x;
                const deltaY = e.clientY - pointerInteracting.y;
                targetYaw += deltaX * 0.01;
                targetPitch += deltaY * 0.006;
                pointerInteracting = { x: e.clientX, y: e.clientY };
            }
        });

        window.addEventListener('pointerup', () => {
            pointerInteracting = null;
            stage.style.cursor = 'grab';
            isPaused = false;
        });
    }

    // ==========================================================================
    // 15. METABOT AI CHAT ASSISTANT (მეტაბოტი)
    // ==========================================================================
    function initMetaBot() {
        const launcherBtn = document.getElementById('metabot-launcher-btn');
        const chatWindow = document.getElementById('metabot-chat-window');
        const closeBtn = document.getElementById('metabot-close-btn');
        const chatForm = document.getElementById('metabot-chat-form');
        const chatInput = document.getElementById('metabot-chat-input');
        const messagesBody = document.getElementById('metabot-messages-body');
        const typingIndicator = document.getElementById('metabot-typing-indicator');
        const chipsContainer = document.getElementById('metabot-chips-container');
        const launcherBadge = launcherBtn ? launcherBtn.querySelector('.metabot-launcher-badge') : null;

        if (!launcherBtn || !chatWindow) return;

        const openChat = () => {
            chatWindow.classList.add('active');
            launcherBtn.classList.add('is-hidden');
            document.body.classList.add('metabot-open');
            if (launcherBadge) launcherBadge.style.display = 'none';
            if (chatInput) setTimeout(() => chatInput.focus(), 300);
        };

        const closeChat = () => {
            chatWindow.classList.remove('active');
            launcherBtn.classList.remove('is-hidden');
            document.body.classList.remove('metabot-open');
        };

        // Toggle chat window
        launcherBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (chatWindow.classList.contains('active')) {
                closeChat();
            } else {
                openChat();
            }
        });

        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                closeChat();
            });
        }

        // Close when tapping outside chat window
        document.addEventListener('click', (e) => {
            if (chatWindow.classList.contains('active') && !e.target.closest('#metabot-chat-window') && !e.target.closest('#metabot-launcher-btn')) {
                closeChat();
            }
        });

        // Close on ESC key
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && chatWindow.classList.contains('active')) {
                closeChat();
            }
        });

        // Handle Chip click
        if (chipsContainer) {
            chipsContainer.addEventListener('click', (e) => {
                const chip = e.target.closest('.metabot-chip');
                if (!chip) return;
                const query = chip.getAttribute('data-query') || chip.textContent.trim();
                handleUserMessage(query);
            });
        }

        // Handle Form submit
        if (chatForm) {
            chatForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const text = chatInput.value.trim();
                if (!text) return;
                chatInput.value = '';
                handleUserMessage(text);
            });
        }

        function appendMessage(sender, htmlContent) {
            const msgEl = document.createElement('div');
            msgEl.className = `metabot-msg ${sender}-msg`;
            
            const avatar = document.createElement('div');
            avatar.className = 'metabot-msg-avatar';
            if (sender === 'bot') {
                const currentTheme = document.documentElement.getAttribute('data-theme') || document.body.getAttribute('data-theme');
                const botImgSrc = (currentTheme === 'plum') ? 'logo_o_plum.png' : 'logo_o_teal.png';
                avatar.innerHTML = `<img src="${botImgSrc}" alt="MetaBot" class="metabot-msg-avatar-img brand-dynamic-o">`;
            } else {
                avatar.textContent = '👤';
            }

            const bubble = document.createElement('div');
            bubble.className = 'metabot-msg-bubble';
            bubble.innerHTML = htmlContent;

            msgEl.appendChild(avatar);
            msgEl.appendChild(bubble);

            messagesBody.appendChild(msgEl);
            messagesBody.scrollTop = messagesBody.scrollHeight;
        }

        function showTyping(show) {
            if (typingIndicator) {
                typingIndicator.style.display = show ? 'flex' : 'none';
                messagesBody.scrollTop = messagesBody.scrollHeight;
            }
        }

        // n8n Website Chat Agent (Gemini + ცოდნის ბაზა)
        const METAFORA_CHAT_WEBHOOK = 'https://meticulous-oyster.pikapod.net/webhook/metaphora-website-chat';

        function metaforaSessionId() {
            try {
                let s = localStorage.getItem('mtf_sid');
                if (!s) { s = 'web-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8); localStorage.setItem('mtf_sid', s); }
                return s;
            } catch (_) { return 'web-anon'; }
        }

        function formatBotHtml(text) {
            const esc = escapeHtml(String(text || ''));
            return esc.split(/\n\s*\n/).map(p => '<p>' + p.replace(/\n/g, '<br>') + '</p>').join('');
        }

        function handleUserMessage(query) {
            // Append User Message
            appendMessage('user', `<p>${escapeHtml(query)}</p>`);
            // Show Typing indicator
            showTyping(true);

            // Timeout controller (2.5s) to guarantee instant fallback
            let answered = false;
            const controller = new AbortController();
            const timeoutId = setTimeout(() => {
                if (!answered) {
                    controller.abort();
                    answered = true;
                    showTyping(false);
                    appendMessage('bot', generateBotResponse(query));
                }
            }, 2500);

            fetch(METAFORA_CHAT_WEBHOOK, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: query, sessionId: metaforaSessionId() }),
                signal: controller.signal
            })
            .then(r => {
                if (!r.ok) throw new Error('Webhook error ' + r.status);
                return r.json();
            })
            .then(data => {
                if (!answered) {
                    clearTimeout(timeoutId);
                    answered = true;
                    showTyping(false);
                    if (data && data.output && data.output.trim().length > 0) {
                        appendMessage('bot', formatBotHtml(data.output));
                    } else {
                        appendMessage('bot', generateBotResponse(query));
                    }
                }
            })
            .catch(() => {
                if (!answered) {
                    clearTimeout(timeoutId);
                    answered = true;
                    showTyping(false);
                    appendMessage('bot', generateBotResponse(query));
                }
            });
        }

        function generateBotResponse(input) {
            const q = input.toLowerCase();

            if (q.includes('რა არის') || q.includes('მეტაფორა') || q.includes('იდეა') || q.includes('კონცეფცია') || q.includes('about') || q.includes('მესამე ადგილი') || q.includes('third place')) {
                return `<p>✨ <strong>მეტაფორა</strong> არის <em>Edutainment Hub &amp; Third Place</em> — მესამე ადგილი სახლსა და სამსახურს მიღმა!</p><p>ეს არის უნიკალური სივრცე თბილისში, რომელიც აერთიანებს პიროვნულ განვითარებას, ბიზნეს-ნეთვორქინგს, სალონურ დისკუსიებს (Think Tank), Playback თეატრსა და თემატურ კლუბებს.</p>`;
            }

            if (q.includes('სერვის') || q.includes('მიმართულებ') || q.includes('რას გვთავაზობთ') || q.includes('service') || q.includes('ფასი') || q.includes('რა გაქვთ')) {
                return `<p>🌱 <strong>მეტაფორას 5 ინდივიდუალური მიმართულება:</strong></p>
                <ul style="margin-left: 18px; margin-top: 6px; display: flex; flex-direction: column; gap: 8px;">
                    <li><a href="service-personal-development.html" style="color: var(--primary-color); font-weight: 700; text-decoration: underline;">🌱 1. Personal Development</a> — ფსიქოთერაპია &amp; ბალანსი</li>
                    <li><a href="service-business.html" style="color: var(--primary-color); font-weight: 700; text-decoration: underline;">💼 2. Business</a> — B2B &amp; Mastermind შეხვედრები</li>
                    <li><a href="service-think-tank.html" style="color: var(--primary-color); font-weight: 700; text-decoration: underline;">🧠 3. Think Tank</a> — სალონური დისკუსიები</li>
                    <li><a href="service-art.html" style="color: var(--primary-color); font-weight: 700; text-decoration: underline;">🎨 4. Art</a> — Playback თეატრი &amp; არტ-თერაპია</li>
                    <li><a href="service-clubs.html" style="color: var(--primary-color); font-weight: 700; text-decoration: underline;">🏛️ 5. Clubs</a> — მესამე სივრცე &amp; სამაგიდო თამაშები</li>
                </ul>
                <p style="margin-top: 8px;">👉 დააჭირეთ სასურველ სერვისს მის ინდივიდუალურ გვერდზე გადასასვლელად!</p>`;
            }

            if (q.includes('თეატრ') || q.includes('playback') || q.includes('პლეიბექ') || q.includes('art') || q.includes('ხელოვნებ') || q.includes('სპექტაკლ')) {
                return `<p>🎭 <strong>Playback თეატრი &amp; Art:</strong></p><p>Playback თეატრი არის ინტერაქციული იმპროვიზაციული ხელოვნება, სადაც მაყურებლების მიერ მოყოლილი ისტორიები და ემოციები სცენაზე ცოცხლდება. ეს არის საუკეთესო გზა ემოციური განტვირთვისა და თვითშემეცნებისთვის!</p><p>გვესტუმრეთ და გახდით სპექტაკლის თანაავტორი ✨</p>`;
            }

            if (q.includes('ჯავშან') || q.includes('დაჯავშნ') || q.includes('ადგილ') || q.includes('რეგისტრაცი') || q.includes('book') || q.includes('ვიზიტი')) {
                return `<p>📅 <strong>ადგილის დაჯავშნა:</strong></p><p>ადგილის დასაჯავშნად შეგიძლიათ დააჭიროთ ღილაკს <strong>„ჯავშანი“</strong> ზედა მენიუში, ან გადახვიდეთ კონტაქტის ფორმაზე. ჩვენი გუნდი უმოკლეს დროში დაგიკავშირდებათ დეტალების შესათანხმებლად! ✨</p>`;
            }

            if (q.includes('გუნდ') || q.includes('ვინ ხართ') || q.includes('წევრ') || q.includes('team') || q.includes('დამფუძნებელ')) {
                return `<p>👥 <strong>მეტაფორას გუნდი:</strong></p><p>ჩვენს გუნდში არიან სერტიფიცირებული პოზიტიური ფსიქოთერაპევტები, ბიზნეს-მენტორები, Playback თეატრის მსახიობები და საზოგადოებრივი მოდერატორები. გაიცანით ჩვენი გუნდის სრული წრე მთავარი გვერდის გუნდის სექციაში!</p>`;
            }

            if (q.includes('ლოკაცი') || q.includes('სად') || q.includes('მისამართ') || q.includes('კონტაქტ') || q.includes('ტელეფონ') || q.includes('ნომერ') || q.includes('location')) {
                return `<p>📍 <strong>კონტაქტი &amp; ლოკაცია:</strong></p><p>მეტაფორა მდებარეობს თბილისში, საქართველოში.<br>📞 ტელეფონი: <strong>+995 599 22 82 28</strong><br>✉️ ელ.ფოსტა: <strong>info@metafora.ge</strong><br>⏰ სამუშაო საათები: ყოველდღე 10:00 - 23:00.</p>`;
            }

            if (q.includes('გალერე') || q.includes('ფოტო') || q.includes('gallery') || q.includes('სივრცე')) {
                return `<p>🖼️ <strong>ფოტოგალერეა:</strong></p><p>გალერეის გვერდზე შეგიძლიათ იხილოთ მეტაფორას უნიკალური სივრცეები (შესასვლელი, მოზაიკა, Themed Bar, კლუბების ოთახი) და ჩვენი გუნდის ფოტოები! 👉 <a href="gallery.html" style="color: var(--primary-color); font-weight: 700; text-decoration: underline;">გალერეის ნახვა</a></p>`;
            }

            if (q.includes('ბლოგ') || q.includes('სტატი') || q.includes('ნაშრომ') || q.includes('blog')) {
                return `<p>📖 <strong>მეტაფორას ბლოგი &amp; სტატიები:</strong></p><p>ბლოგის გვერდზე გაეცნობით საინტერესო სტატიებს „მესამე ადგილის“ ფენომენზე, Playback თეატრის თერაპიულ ეფექტზე, ემოციურ ინტელექტსა და პიროვნულ ბალანსზე. 👉 <a href="blog.html" style="color: var(--primary-color); font-weight: 700; text-decoration: underline;">ბლოგის გახსნა</a></p>`;
            }

            return `<p>დიდი მადლობა შეკითხვისთვის! ✨</p><p>მეტაფორას შესახებ დამატებითი ინფორმაციისთვის შეგიძლიათ აირჩიოთ ერთ-ერთი სწრაფი ღილაკი ქვემოთ, ან დაგვიკავშირდეთ ნომერზე <strong>📞 599 22 82 28</strong>.</p>`;
        }

        function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }
    }

    // ==========================================================================
    // 16. MOBILE NAVIGATION DRAWER
    // ==========================================================================
    function initMobileNav() {
        const toggleBtns = document.querySelectorAll('#mobile-menu-toggle-btn, #mobile-menu-btn, .mobile-menu-toggle-btn, .mobile-menu-btn');
        const overlay = document.getElementById('mobile-nav-overlay');
        const closeBtns = document.querySelectorAll('#mobile-nav-close, #mobile-nav-close-btn, .mobile-nav-close, .mobile-nav-close-btn');

        if (!overlay) return;

        const openMenu = () => {
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        };

        const closeMenu = () => {
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        };

        if (toggleBtns && toggleBtns.length > 0) {
            toggleBtns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (overlay.classList.contains('active')) {
                        closeMenu();
                    } else {
                        openMenu();
                    }
                });
            });
        }

        if (closeBtns && closeBtns.length > 0) {
            closeBtns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    closeMenu();
                });
            });
        }

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                closeMenu();
            }
        });

        // Close on ESC key
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && overlay.classList.contains('active')) {
                closeMenu();
            }
        });

        // Auto close if window is resized above 992px
        window.addEventListener('resize', () => {
            if (window.innerWidth > 992 && overlay.classList.contains('active')) {
                closeMenu();
            }
        });

        // Accordion expand/collapse on category click
        overlay.querySelectorAll('.mobile-accordion-toggle').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const acc = btn.closest('.mobile-nav-accordion');
                if (acc) {
                    const wasActive = acc.classList.contains('active');
                    overlay.querySelectorAll('.mobile-nav-accordion').forEach(a => a.classList.remove('active'));
                    if (!wasActive) {
                        acc.classList.add('active');
                    }
                }
            });
        });

        // Close drawer on navigation link or booking button click
        overlay.querySelectorAll('a, .open-booking-modal-btn').forEach(link => {
            link.addEventListener('click', () => {
                if (link.classList.contains('mobile-accordion-toggle')) return;
                closeMenu();
            });
        });
    }

    // ==========================================================================
    // 17. ACTIVE NAVIGATION (Yellow Indicator For Active Menu Items - Click Only)
    // ==========================================================================
    function initScrollSpyAndActiveNav() {
        const path = (window.location.pathname || "").toLowerCase();
        const navLinks = document.querySelectorAll('.site-header .nav-item');
        const mobLinks = document.querySelectorAll('.mobile-nav-item');

        window.setActiveNav = function(targetHrefOrEl) {
            navLinks.forEach(l => l.classList.remove('active', 'active-page'));
            mobLinks.forEach(l => l.classList.remove('active', 'active-page'));

            let href = '';
            if (typeof targetHrefOrEl === 'string') {
                href = targetHrefOrEl;
            } else if (targetHrefOrEl && targetHrefOrEl.getAttribute) {
                href = targetHrefOrEl.getAttribute('href') || targetHrefOrEl.getAttribute('data-href') || '';
            }

            href = href.toLowerCase();

            if (href.includes('contact')) {
                document.querySelectorAll('.site-header a[href*="contact"], .mobile-nav-item[href*="contact"]').forEach(el => el.classList.add('active'));
            } else if (href.includes('gallery')) {
                document.querySelectorAll('.site-header a[href*="gallery"], .mobile-nav-item[href*="gallery"]').forEach(el => el.classList.add('active-page', 'active'));
            } else if (href.includes('blog')) {
                document.querySelectorAll('.site-header a[href*="blog"], .mobile-nav-item[href*="blog"]').forEach(el => el.classList.add('active-page', 'active'));
            } else if (href.includes('service')) {
                document.querySelectorAll('.site-header .nav-dropdown-wrapper > a[href*="service"], .mobile-nav-accordion#mob-acc-services > .mobile-accordion-toggle').forEach(el => el.classList.add('active'));
            } else if (href.includes('about') || href.includes('team')) {
                document.querySelectorAll('.site-header .nav-dropdown-wrapper > a[href*="about"], .mobile-nav-accordion#mob-acc-about > .mobile-accordion-toggle').forEach(el => el.classList.add('active'));
            } else if (href.includes('hero') || href.includes('#home') || href.includes('index.html') || href === '#') {
                const homeBtn = document.getElementById('nav-home-btn') || document.querySelector('.site-header a[href*="#hero"]');
                if (homeBtn) homeBtn.classList.add('active');
                const mobHome = document.querySelector('.mobile-nav-item[href*="#hero"]');
                if (mobHome) mobHome.classList.add('active');
            } else if (targetHrefOrEl && targetHrefOrEl.classList && targetHrefOrEl.classList.contains('nav-item')) {
                targetHrefOrEl.classList.add('active');
            }
        };

        // Standalone subpage initial check
        if (path.includes('blog.html')) {
            window.setActiveNav('blog.html');
        } else if (path.includes('gallery.html')) {
            window.setActiveNav('gallery.html');
        } else if (path.includes('service-') || path.includes('services.html')) {
            window.setActiveNav('services.html');
        } else {
            const hash = (window.location.hash || "").toLowerCase();
            if (hash.includes('contact')) {
                window.setActiveNav('#contact');
            } else if (hash.includes('service')) {
                window.setActiveNav('#services');
            } else if (hash.includes('about') || hash.includes('team')) {
                window.setActiveNav('#about');
            } else {
                window.setActiveNav('#hero');
            }
        }

        // On Click of any nav link or dropdown link across desktop and mobile:
        document.querySelectorAll('.site-header .nav-item, .site-header .dropdown-link, .mobile-nav-item, .mobile-sub-item, .portal-contact-btn').forEach(link => {
            link.addEventListener('click', function() {
                window.setActiveNav(this);
            });
        });

        // Listen to hashchange
        window.addEventListener('hashchange', () => {
            if (window.location.hash) {
                window.setActiveNav(window.location.hash);
            }
        });
    }

    // ==========================================================================
    // 18. SERVICE VIDEOS CONTROLLER (Desktop: Hover Only | Mobile: Centered Card Only)
    // ==========================================================================
    function initServiceVideoInteractions() {
        const cards = document.querySelectorAll('.service-five-card');
        if (!cards.length) return;

        let activeMobilePlayingVideo = null;

        cards.forEach(card => {
            const video = card.querySelector('.card-feature-video');
            if (!video) return;

            video.muted = true;
            video.defaultMuted = true;
            video.playsInline = true;
            video.setAttribute('playsinline', '');
            video.setAttribute('webkit-playsinline', '');

            // 1. DESKTOP: Only play when mouse is hovered over this specific card
            card.addEventListener('mouseenter', () => {
                if (window.innerWidth > 992) {
                    card.classList.add('is-playing');
                    const p = video.play();
                    if (p !== undefined) p.catch(() => {});
                }
            });

            card.addEventListener('mouseleave', () => {
                if (window.innerWidth > 992) {
                    card.classList.remove('is-playing');
                    video.pause();
                }
            });
        });

        // 2. MOBILE: IntersectionObserver that plays ONLY the single card centered in the viewport
        if ('IntersectionObserver' in window) {
            const mobileObserver = new IntersectionObserver((entries) => {
                if (window.innerWidth <= 992) {
                    entries.forEach(entry => {
                        const video = entry.target.querySelector('.card-feature-video');
                        if (!video) return;

                        if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
                            // If another video was playing, pause it first
                            if (activeMobilePlayingVideo && activeMobilePlayingVideo !== video) {
                                activeMobilePlayingVideo.pause();
                                if (activeMobilePlayingVideo.closest('.service-five-card')) {
                                    activeMobilePlayingVideo.closest('.service-five-card').classList.remove('is-playing');
                                }
                            }
                            activeMobilePlayingVideo = video;
                            entry.target.classList.add('is-playing');
                            const p = video.play();
                            if (p !== undefined) p.catch(() => {});
                        } else {
                            entry.target.classList.remove('is-playing');
                            if (activeMobilePlayingVideo === video) {
                                video.pause();
                                activeMobilePlayingVideo = null;
                            } else {
                                video.pause();
                            }
                        }
                    });
                }
            }, {
                threshold: [0.25, 0.5, 0.75],
                rootMargin: "-5% 0px -5% 0px"
            });

            cards.forEach(card => mobileObserver.observe(card));
        }

        // On window resize, pause all videos if transitioning
        window.addEventListener('resize', () => {
            if (window.innerWidth > 992 && activeMobilePlayingVideo) {
                activeMobilePlayingVideo.pause();
                activeMobilePlayingVideo = null;
            }
        });
    }

    // ==========================================================================
    // 17.5. ARTICLE READER DRAWER CONTROLLER (Right Sliding Glassmorphism Drawer)
    // ==========================================================================
    const ARTICLES_DATABASE = {
        'article-featured': {
            badge: '🌟 რჩეული სტატია • 5 წთ',
            duration: '5 წთ საკითხავი',
            img: 'მთავარის ფოტოები/ჩვენს შესახებ.jpeg',
            title: 'რა არის „მესამე ადგილი“ და რატომ სჭირდება ის თანამედროვე ადამიანს?',
            author: 'მეტაფორას გუნდი',
            date: '2026 წლის აგვისტო',
            html: `
                <p>თანამედროვე ურბანულ ცხოვრებაში ადამიანების უმრავლესობის ყოველდღიურობა ორ ძირითად წერტილს შორის მოძრაობით შემოიფარგლება: <strong>სახლი</strong> (პირველი ადგილი) და <strong>სამსახური</strong> (მეორე ადგილი).</p>
                <p>1989 წელს ცნობილმა ამერიკელმა ურბან-სოციოლოგმა <strong>რეი ოლდენბურგმა</strong> შემოიტანა რევოლუციური კონცეფცია — <em>„მესამე ადგილი“ (The Third Place)</em>. ეს არის სივრცე, სადაც ადამიანი არ არის შებოჭილი არც ოჯახური ვალდებულებებით და არც პროფესიული იერარქიით.</p>
                <blockquote>
                    „მესამე ადგილი არის საზოგადოების სულიერი წამყვანი. იქ, სადაც ადამიანები თანასწორად საუბრობენ, იბადება ნამდვილი კავშირები და შინაგანი თავისუფლება.“
                </blockquote>
                <h3>რატომ არის მეტაფორა შენი მესამე ადგილი?</h3>
                <p>„მეტაფორა“ შეიქმნა სწორედ ამ იდეის გარშემო — გავხდეთ შენი მესამე ადგილი თბილისში. სივრცე, სადაც შეგიძლია მოხვიდე, დალიო ყავა, იკითხო წიგნი, ჩაერთო სალონურ დისკუსიაში ან უბრალოდ მოუსმინო Playback თეატრის იმპროვიზაციას.</p>
                <div class="article-takeaway-box">
                    <h4>✨ მესამე ადგილის 4 მთავარი ნიშანი:</h4>
                    <ul>
                        <li><strong>ნეიტრალური ტერიტორია:</strong> არანაირი ვალდებულება ან ფორმალური წესები;</li>
                        <li><strong>თანასწორობა:</strong> სოციალური სტატუსი კარს მიღმა რჩება;</li>
                        <li><strong>მთავარი აქტივობა — ცოცხალი საუბარი:</strong> გულწრფელი და შინაარსიანი დიალოგი;</li>
                        <li><strong>შინაური გარემო:</strong> განცდა, რომ ყოველთვის გელიან.</li>
                    </ul>
                </div>
                <p>გვეწვიეთ მეტაფორაში და აღმოაჩინეთ თქვენი პირადი მესამე ადგილი!</p>
            `
        },
        'article-playback': {
            badge: '🎭 Playback თეატრი • 4 წთ',
            duration: '4 წთ საკითხავი',
            img: 'blog_playback.jpg',
            title: 'Playback თეატრის მაგია და არტ-თერაპია',
            author: 'არტ-ფასილიტატორი • მეტაფორა',
            date: '2026 წლის აგვისტო',
            html: `
                <p>წარმოიდგინეთ თეატრი, სადაც არ არსებობს წინასწარ დაწერილი სცენარი, რეპეტიციები და როლები. სცენარი იწერება აქ და ახლა — მაყურებლის მოყოლილი რეალური ისტორიებით.</p>
                <p><strong>Playback თეატრი</strong> არის ინტერაქციული იმპროვიზაციის უნიკალური ფორმა, რომელიც 1975 წელს ჯონათან ფოქსმა და ჯო სალასმა დააფუძნეს. მაყურებელი უზიარებს დარბაზს საკუთარ განცდას, მოგონებას ან სიზმარს, ხოლო მსახიობები და მუსიკოსი მას წამიერად ცოცხალ სცენურ ეტიუდად გარდაქმნიან.</p>
                <blockquote>
                    „საკუთარი ისტორიის სცენიდან დანახვა ადამიანს აძლევს უნიკალურ განცდას: მე არ ვარ მარტო, ჩემი ხმა და ემოცია მნიშვნელოვანია.“
                </blockquote>
                <h3>როგორ მუშაობს თერაპიული ეფექტი?</h3>
                <p>როდესაც ჩვენს ისტორიას გარედან ვუყურებთ, ხდება ე.წ. <em>ემპათიური რეფლექსია</em>. მძიმე გამოცდილება კარგავს ტოქსიკურობას, ხოლო სასიხარულო მომენტები მრავალჯერადად ძლიერდება.</p>
                <div class="article-takeaway-box">
                    <h4>🎭 რას მოგანიჭებთ Playback საღამო მეტაფორაში:</h4>
                    <ul>
                        <li>ემოციური სტრესისა და დაძაბულობისგან განტვირთვა;</li>
                        <li>საკუთარი თავის და სხვების უკეთ გაგება;</li>
                        <li>უსაფრთხო და მიმღები გარემო თვითგამოხატვისთვის;</li>
                        <li>თანაშემოქმედების დაუვიწყარი ემოცია.</li>
                    </ul>
                </div>
            `
        },
        'article-psychology': {
            badge: '🧠 ფსიქოლოგია • 6 წთ',
            duration: '6 წთ საკითხავი',
            img: 'blog_psychology.jpg',
            title: 'პოზიტიური ფსიქოთერაპიის 5 ოქროს წესი',
            author: 'პოზიტიური ფსიქოთერაპევტი • მეტაფორა',
            date: '2026 წლის აგვისტო',
            html: `
                <p>პოზიტიური ფსიქოთერაპია (დამფუძნებელი ნოსრატ პეზეშკიანი) არ ნიშნავს „ყალბ ოპტიმიზმს“ ან პრობლემების უარყოფას. პირიქით — სიტყვა <em>Positum</em> ლათინურად ნიშნავს „ფაქტობრივს“, „რეალურს“, „იმას, რაც უკვე მოცემულია“.</p>
                <p>ეს მიმართულება ადამიანს ხედავს როგორც რესურსებით სავსე მთლიანობას, რომელსაც უკვე გააჩნია ყველა საჭირო შესაძლებლობა გამოწვევებთან გასამკლავებლად.</p>
                <blockquote>
                    „თუ გსურთ გქონდეთ ის, რაც არასდროს გქონიათ, უნდა გააკეთოთ ის, რაც არასდროს გაგიკეთებიათ — ოღონდ საკუთარ შინაგან რესურსებზე დაყრდნობით.“
                </blockquote>
                <div class="article-takeaway-box">
                    <h4>🌿 5 ოქროს პრინციპი ყოველდღიურობისთვის:</h4>
                    <ul>
                        <li><strong>1. სიმპტომი არის სიგნალი:</strong> ნებისმიერი შფოთვა ან დაღლილობა ორგანიზმის მინიშნებაა, რომ რაღაც შესაცვლელია;</li>
                        <li><strong>2. ბალანსის მოდელი:</strong> სხეული, საქმიანობა, ურთიერთობები და მომავლის ხედვა — ოთხივე სფერო თანაბარ ყურადღებას მოითხოვს;</li>
                        <li><strong>3. კონფლიქტი როგორც ზრდის რესურსი:</strong> განსხვავებული აზრი გვაძლევს ახალ პერსპექტივას;</li>
                        <li><strong>4. მეტაფორების ძალა:</strong> იგავები და შედარებები გვეხმარება ქვეცნობიერი ბლოკების მარტივად მოხსნაში;</li>
                        <li><strong>5. თვითდახმარების უნარი:</strong> თერაპიის მიზანია ადამიანი გახდეს საკუთარი თავის საუკეთესო მეგზური.</li>
                    </ul>
                </div>
            `
        },
        'article-coworking': {
            badge: '☕ პროდუქტიულობა • 3 წთ',
            duration: '3 წთ საკითხავი',
            img: 'blog_coworking.jpg',
            title: 'როგორ შევქმნათ Deep Work გარემო?',
            author: 'მეტაფორას გუნდი',
            date: '2026 წლის აგვისტო',
            html: `
                <p>ციფრული შეტყობინებების, უსასრულო სქროლინგისა და ზედაპირული ყურადღების ეპოქაში ღრმა, კონცენტრირებული მუშაობის უნარი (Deep Work) სუპერძალად იქცა.</p>
                <p>კვლევები ადასტურებს, რომ შეწყვეტილი ყურადღების შემდეგ თავდაპირველ ფოკუსში დასაბრუნებლად ტვინს საშუალოდ <strong>23 წუთი</strong> სჭირდება. სწორედ ამიტომ, მეტაფორას Coworking & Quiet Lounge შექმნილია მინიმალისტური, ესთეტიკური და მშვიდი აკუსტიკით.</p>
                <div class="article-takeaway-box">
                    <h4>💡 Deep Work-ის 3 წესი მეტაფორაში:</h4>
                    <ul>
                        <li><strong>90-წუთიანი ფოკუს-ბლოკები:</strong> მუშაობა შეფერხებების გარეშე;</li>
                        <li><strong>სენსორული სიმშვიდე:</strong> ბუნებრივი განათება, ხარისხიანი მცენარეული ჩაი და ერგონომიული სივრცე;</li>
                        <li><strong>შესვენება როგორც რიტუალი:</strong> მუშაობის შემდეგ გონების განტვირთვა მოზაიკის ზონაში ან ლაუნჯში.</li>
                    </ul>
                </div>
            `
        },
        'article-community': {
            badge: '🍸 კომუნა • 4 წთ',
            duration: '4 წთ საკითხავი',
            img: 'blog_boardgames.jpg',
            title: 'სამაგიდო თამაშები როგორც სოციალური ხიდი',
            author: 'Clubs Host • მეტაფორა',
            date: '2026 წლის აგვისტო',
            html: `
                <p>რატომ არის სამაგიდო თამაშები ერთ-ერთი ყველაზე სწრაფი და ბუნებრივი საშუალება ახალი ადამიანების გასაცნობად?</p>
                <p>სამაგიდო თამაში ქმნის ე.წ. <em>„უსაფრთხო თამაშის ველს“</em>. როდესაც მაგიდასთან ზიხარ, არ გჭირდება ხელოვნური „Small Talk“ — თამაშის წესები და სტრატეგია თავისთავად წარმართავს დიალოგს, იუმორსა და ჯანსაღ აზარტს.</p>
                <blockquote>
                    „თამაშისას ადამიანი ავლენს თავის ნამდვილ ხასიათს, სტრატეგიულ აზროვნებასა და გუნდურობას გაცილებით სწრაფად, ვიდრე ჩვეულებრივი საუბრისას.“
                </blockquote>
                <p>მეტაფორას Themed Bar-ში გელოდებათ 50-ზე მეტი მსოფლიო სამაგიდო თამაში — სტრატეგიულიდან დაწყებული, სახალისო პარტი-თამაშებით დამთავრებული!</p>
            `
        },
        'article-art-therapy': {
            badge: '🎨 თვითგამოხატვა • 5 წთ',
            duration: '5 წთ საკითხავი',
            img: 'blog_art_therapy.jpg',
            title: 'არტ-თერაპია და შინაგანი ბალანსი',
            author: 'არტ-თერაპევტი • მეტაფორა',
            date: '2026 წლის აგვისტო',
            html: `
                <p>„მე ხატვა არ ვიცი“ — ეს არის ყველაზე გავრცელებული ფრაზა, რომელსაც არტ-თერაპიის დაწყებამდე ვისმენთ. არტ-თერაპიის არსი კი სწორედ იმაშია, რომ აქ <strong>ესთეტიკური შეფასება არ არსებობს</strong>.</p>
                <p>ფერები, ხაზები, მოცულობა და ტექსტურა არის ჩვენი ემოციების პირდაპირი პროექცია ქაღალდზე. როდესაც ემოციას ვერ ვხსნით სიტყვებით, ფუნჯი და ტილო ხდება ჩვენი ყველაზე გულწრფელი მთარგმნელი.</p>
                <div class="article-takeaway-box">
                    <h4>🎨 რას გვაძლევს რეგულარული არტ-სესიები:</h4>
                    <ul>
                        <li>შინაგანი დაძაბულობისა და აკვიატებული ფიქრების მოხსნა;</li>
                        <li>კრეატიული აზროვნებისა და წარმოსახვის გააქტიურება;</li>
                        <li>შინაგანი თავისუფლებისა და სიხარულის განცდა;</li>
                        <li>საკუთარი ემოციების უსაფრთხო გამოხატვა.</li>
                    </ul>
                </div>
            `
        },
        'article-book-club': {
            badge: '📚 წიგნის კლუბი • 4 წთ',
            duration: '4 წთ საკითხავი',
            img: 'blog_book_club.jpg',
            title: 'რას ვკითხულობთ ამ თვეში მეტაფორაში?',
            author: 'წიგნის კლუბის მოდერატორი • მეტაფორა',
            date: '2026 წლის აგვისტო',
            html: `
                <p>მეტაფორას წიგნების კლუბი ყოველთვიურად არჩევს ერთ განსაკუთრებულ ნაწარმოებს, რომელიც ეხმიანება ადამიანურ ურთიერთობებს, ფილოსოფიასა და ცნობიერების ევოლუციას.</p>
                <p>თვის ბოლოს, მყუდრო სალონურ გარემოში, ჩაისა და სასიამოვნო მუსიკის თანხლებით ვიკრიბებით და ვმსჯელობთ ავტორის იდეებზე, პერსონაჟთა არჩევანზე და იმაზე, თუ როგორ პასუხობს ეს წიგნი ჩვენს რეალურ ცხოვრებას.</p>
                <div class="article-takeaway-box">
                    <h4>📖 მიმდინარე თვის რეკომენდაციები:</h4>
                    <ul>
                        <li><strong>რეი ოლდენბურგი:</strong> <em>„The Great Good Place“</em> — მესამე ადგილების ფილოსოფია;</li>
                        <li><strong>ვიქტორ ფრანკლი:</strong> <em>„ადამიანის მიერ აზრის ძიება“</em> — ლოგოთერაპია და შინაგანი ძალა;</li>
                        <li><strong>მიჰაი ჩიქსენტმიჰაი:</strong> <em>„დინება (Flow)“</em> — ოპტიმალური გამოცდილების ფსიქოლოგია.</li>
                    </ul>
                </div>
                <p>შემოგვიერთდით ჩვენს უახლოეს შეხვედრაზე!</p>
            `
        }
    };

    function initArticleReader() {
        const overlay = document.getElementById('article-reader-overlay');
        const closeBtn = document.getElementById('article-reader-close-btn');
        const topicBadge = document.getElementById('reader-topic-badge');
        const durationEl = document.getElementById('reader-duration');
        const heroImg = document.getElementById('reader-hero-img');
        const titleEl = document.getElementById('reader-title');
        const authorEl = document.getElementById('reader-author');
        const dateEl = document.getElementById('reader-date');
        const contentEl = document.getElementById('reader-content');

        if (!overlay) return;

        function openArticle(id) {
            const article = ARTICLES_DATABASE[id] || ARTICLES_DATABASE['article-featured'];
            if (!article) return;

            if (topicBadge) topicBadge.textContent = article.badge;
            if (durationEl) durationEl.textContent = article.duration;
            if (heroImg) {
                heroImg.src = article.img;
                heroImg.alt = article.title;
            }
            if (titleEl) titleEl.textContent = article.title;
            if (authorEl) authorEl.textContent = article.author;
            if (dateEl) dateEl.textContent = article.date;
            if (contentEl) contentEl.innerHTML = article.html;

            overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        }

        function closeArticle() {
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        }

        document.addEventListener('click', (e) => {
            const card = e.target.closest('.blog-post-card[data-article-id]');
            if (card && !e.target.closest('.open-booking-modal-btn')) {
                e.preventDefault();
                const articleId = card.getAttribute('data-article-id');
                openArticle(articleId);
            }
        });

        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                closeArticle();
            });
        }

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                closeArticle();
            }
        });

        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && overlay.classList.contains('active')) {
                closeArticle();
            }
        });
    }

    initBUFigure();
    initManifestoSpinningFigure();
    initThemeSwitcher();
    initMetaBot();
    initMobileNav();
    initScrollSpyAndActiveNav();
    initServiceVideoInteractions();
    initArticleReader();

    // ==========================================================================
    // 18. ROBUST BILINGUAL I18N ENGINE (KA ⇄ EN)
    // ==========================================================================
    const I18N_DICTIONARY = {
        "მეტაფორა - Edutainment Hub & Third Place": "METAPHORA - Edutainment Hub & Third Place",
        "გალერეა - მეტაფორა": "Gallery - METAPHORA",
        "ბლოგი - მეტაფორა": "Blog - METAPHORA",
        "სერვისები - მეტაფორა": "Services - METAPHORA",
        "1. Personal Development - მეტაფორა": "1. Personal Development - METAPHORA",
        "2. Business - მეტაფორა": "2. Business - METAPHORA",
        "3. Think Tank - მეტაფორა": "3. Think Tank - METAPHORA",
        "4. Art - მეტაფორა": "4. Art - METAPHORA",
        "5. Clubs - მეტაფორა": "5. Clubs - METAPHORA",
        "Personal Development - მეტაფორა": "Personal Development - METAPHORA",
        "Business - მეტაფორა": "Business - METAPHORA",
        "Think Tank - მეტაფორა": "Think Tank - METAPHORA",
        "Art - მეტაფორა": "Art - METAPHORA",
        "Clubs - მეტაფორა": "Clubs - METAPHORA",
        "მთავარი": "Home",
        "🏠 მთავარი": "🏠 Home",
        "ჩვენს შესახებ": "About Us",
        "✨ ჩვენს შესახებ": "✨ About Us",
        "მანიფესტი & ფილოსოფია": "Manifesto & Philosophy",
        "მანიფესტი &amp; ფილოსოფია": "Manifesto & Philosophy",
        "მესამე ადგილის კონცეფცია": "Third Place Concept",
        "მეტაფორას გუნდი": "Metaphora Team",
        "👥 მეტაფორას გუნდი": "👥 Metaphora Team",
        "გაიცანით ჩვენი წევრები": "Meet Our Members",
        "გუნდის წევრები": "Team Members",
        "👥 გუნდის წევრები": "👥 Team Members",
        "გაიცანი წევრი": "Meet Member",
        "სერვისები": "Services",
        "სერვისები & სივრცეები": "Services & Spaces",
        "სერვისები &amp; სივრცეები": "Services & Spaces",
        "🌱 სერვისები": "🌱 Services",
        "🌱 სერვისები & სივრცეები": "🌱 Services & Spaces",
        "🌱 სერვისები &amp; სივრცეები": "🌱 Services & Spaces",
        "1. Personal Development": "1. Personal Development",
        "2. Business": "2. Business",
        "3. Think Tank": "3. Think Tank",
        "4. Art": "4. Art",
        "5. Clubs": "5. Clubs",
        "🌱 1. Personal Development": "🌱 1. Personal Development",
        "💼 2. Business": "💼 2. Business",
        "🧠 3. Think Tank": "🧠 3. Think Tank",
        "🎨 4. Art": "🎨 4. Art",
        "🏛️ 5. Clubs": "🏛️ 5. Clubs",
        "იპოვე შენი შინაგანი ძალა": "Find Your Inner Power",
        "გაიზარდე & ითანამშრომლე": "Grow & Collaborate",
        "გაიზარდე &amp; ითანამშრომლე": "Grow & Collaborate",
        "სიღრმისეული სალონური დისკუსიები": "In-Depth Salon Discussions",
        "შემოქმედებითი ენერგია & ხელოვნება": "Creative Energy & Art",
        "შემოქმედებითი ენერგია &amp; ხელოვნება": "Creative Energy & Art",
        "შენი „მესამე სივრცე“": "Your 'Third Place'",
        "🏛️ შენი „მესამე სივრცე“": "🏛️ Your 'Third Place'",
        "გალერეა": "Gallery",
        "🖼️ გალერეა": "🖼️ Gallery",
        "ბლოგი": "Blog",
        "📖 ბლოგი": "📖 Blog",
        "დაგვიკავშირდით": "Contact Us",
        "📞 დაგვიკავშირდით": "📞 Contact Us",
        "კონტაქტი": "Contact",
        "📞 კონტაქტი": "📞 Contact",
        "ონლაინ ჯავშანი": "Online Booking",
        "📅 ონლაინ ჯავშანი": "📅 Online Booking",
        "✨ ონლაინ ჯავშანი": "✨ Online Booking",
        "მოძებნე მეტაფორაში...": "Search in Metaphora...",
        "ძიება": "Search",
        "Edutainment Hub & Third Place": "Edutainment Hub & Third Place",
        "საგანმანათლებლო-გასართობი ჰაბი და „მესამე ადგილი“": "Educational-Entertainment Hub & 'Third Place'",
        "აღმოაჩინეთ მეტაფორას სამყარო": "Discover the World of Metaphora",
        "აღმოაჩინე „მეტაფორა“": "Discover Metaphora",
        "შედი მეტაფორაში": "Enter Metaphora",
        "შესვლა საიტზე": "Enter Website",
        "ღილაკს შესასვლელად": "button to enter",
        "საწყის გვერდზე გადასვლა": "Go to Home Page",
        "ნახვა": "Explore",
        "დაწყება": "Explore",
        "დააჭირეთ ცენტრალურ ბარათს საიტზე გადასასვლელად": "Click the center card to explore the website",
        "დააჭირეთ „ნახვა“-ს ან ცენტრალურ ბარათს საიტზე გადასასვლელად": "Click 'Explore' or the center card to enter the website",
        "საგანმანათლებლო-გასართობი ჰაბი": "Edutainment Hub",
        "სივრცე, სადაც იდეები და ადამიანები ერთიანდებიან": "A Space Where Ideas and People Unite",
        "მეტაფორა არის თანამედროვე მესამე ადგილი — სივრცე თვითგანვითარებისთვის, შემოქმედებისთვის, საქმიანი თანამშრომლობისა და ინტელექტუალური დისკუსიებისთვის.": "Metaphora is a modern Third Place — a sanctuary for personal growth, creativity, business collaboration, and intellectual discussions.",
        "გაეცანი სერვისებს": "Explore Services",
        "სერვისების ნახვა": "View Services",
        "შეუერთდი კომუნას": "Join Community",
        "აქტიური წევრი": "Active Members",
        "თემატური მიმართულება": "Themed Pillars",
        "მიმართულებები": "Pillars",
        "მიმართულება 01": "Pillar 01",
        "მიმართულება 02": "Pillar 02",
        "მიმართულება 03": "Pillar 03",
        "მიმართულება 04": "Pillar 04",
        "მიმართულება 05": "Pillar 05",
        "ყოველთვიური ღონისძიება": "Monthly Events",
        "მიმართულებები & შესაძლებლობები": "Pillars & Opportunities",
        "მიმართულებები &amp; შესაძლებლობები": "Pillars & Opportunities",
        "მეტაფორას სერვისები & სივრცეები": "Metaphora Services & Spaces",
        "მეტაფორას სერვისები &amp; სივრცეები": "Metaphora Services & Spaces",
        "გაეცანით ჩვენს 5 მთავარ მიმართულებას — პიროვნული განვითარებიდან დაწყებული, სალონური დისკუსიებითა და თემატური კლუბებით დასრულებული.": "Explore our 5 core pillars — from personal growth and salon discussions to creative arts and themed clubs.",
        "შინაგანი ძალა": "Inner Power",
        "ზრდა & ბალანსი": "Growth & Balance",
        "ზრდა &amp; ბალანსი": "Growth & Balance",
        "1. მეტაფორა Personal Development": "1. Metaphora Personal Development",
        "იპოვე შენი შინაგანი ძალა. პიროვნული განვითარება, ფსიქოლოგიური მხარდაჭერა და თვითშემეცნება.": "Find your inner power. Personal development, psychological support, and self-discovery.",
        "შესაძლებლობები": "Opportunities",
        "ნეთვორქინგი": "Networking",
        "2. მეტაფორა Business": "2. Metaphora Business",
        "გაიზარდე, ითანამშრომლე და შექმენი ახალი შესაძლებლობები. ბიზნეს-კონტაქტები და პარტნიორობა.": "Grow, collaborate, and create new opportunities. Business contacts and strategic partnerships.",
        "დისკუსიები": "Discussions",
        "სალონური გარემო": "Salon Atmosphere",
        "3. მეტაფორა Think Tank": "3. Metaphora Think Tank",
        "ჩაერთე სიღრმისეულ სალონურ დისკუსიებში. ინტელექტუალური დებატები, იდეების გაზიარება და ანალიტიკა.": "Engage in deep salon discussions. Intellectual debates, idea sharing, and analytics.",
        "შემოქმედება": "Creativity",
        "ხელოვნება & ენერგია": "Art & Energy",
        "ხელოვნება &amp; ენერგია": "Art & Energy",
        "4. მეტაფორა Art": "4. Metaphora Art",
        "დაიმუხტე შემოქმედებითი ენერგიითა და ხელოვნებით. Playback თეატრი, პერფორმანსები და გამოფენები.": "Charge yourself with creative energy and art. Playback theatre, performances, and exhibitions.",
        "მესამე სივრცე": "Third Space",
        "მესამე ადგილი": "Third Place",
        "— შენი მესამე ადგილი": "— Your Third Place",
        "შინაური გარემო ★": "Home Atmosphere ★",
        "5. მეტაფორა Clubs": "5. Metaphora Clubs",
        "შენი „მესამე სივრცე“ — ადგილი, სადაც თავს ყოველთვის შინაურად იგრძნობ. თემატური კლუბები და კომუნა.": "Your 'Third Place' — where you always feel at home. Themed clubs, board games, and community.",
        "განრიგი & პოსტერები": "Schedule & Posters",
        "განრიგი &amp; პოსტერები": "Schedule & Posters",
        "აფიშა": "Events & Posters",
        "აფიშის ნახვა": "View Events",
        "უახლოესი ღონისძიებები, ვორქშოფები და თეატრალური საღამოები მეტაფორაში.": "Upcoming events, workshops, and theatre evenings at Metaphora.",
        "დაჯავშნე ადგილი ✨": "Reserve a Seat ✨",
        "დაჯავშნე ადგილი": "Reserve a Seat",
        "ადგილის დაჯავშნა ✨": "Reserve Seat ✨",
        "ადგილის დაჯავშნა": "Reserve Seat",
        "დაჯავშნე ეხლავე": "Book Now",
        "გუნდის ხმა & შეფასებები": "Team Voice & Stories",
        "გუნდის ხმა &amp; შეფასებები": "Team Voice & Stories",
        "გაიცანით მეტაფორას გუნდი": "Meet the Metaphora Team",
        "მოუსმინეთ და გაეცანით ადამიანებს, რომლებიც ქმნიან მეტაფორას ატმოსფეროს.": "Listen to and meet the people who create the Metaphora atmosphere.",
        "ლალი": "Lali",
        "ლალი ბადრიძე": "Lali Badridze",
        "თინათინი": "Tinatin",
        "თინათინ გოგუაძე": "Tinatin Goguadze",
        "გიორგი": "Giorgi",
        "გიორგი მაისურაძე": "Giorgi Maisuradze",
        "ნინო": "Nino",
        "ნინო კვარაცხელია": "Nino Kvaratskhelia",
        "დავითი": "Davit",
        "დავით ბერიძე": "Davit Beridze",
        "ელენე": "Elene",
        "ელენე ჩხეიძე": "Elene Chkheidze",
        "სანდრო": "Sandro",
        "სანდრო ჯაფარიძე": "Sandro Japaridze",
        "დამფუძნებელი & ფასილიტატორი": "Founder & Facilitator",
        "დამფუძნებელი &amp; ფასილიტატორი": "Founder & Facilitator",
        "დამფუძნებელი": "Founder",
        "პოზიტიური ფსიქოთერაპევტი": "Positive Psychotherapist",
        "Think Tank მოდერატორი": "Think Tank Moderator",
        "Playback თეატრის არტისტი": "Playback Theatre Artist",
        "Business & Partnerships Lead": "Business & Partnerships Lead",
        "Community Manager & Clubs Host": "Community Manager & Clubs Host",
        "Clubs Host • მეტაფორა": "Clubs Host • Metaphora",
        "Creative Producer & Curator": "Creative Producer & Curator",
        "ლალი - მეტაფორას გუნდი": "Lali - Metaphora Team",
        "Facebook პროფილი": "Facebook Profile",
        "Instagram პროფილი": "Instagram Profile",
        "WhatsApp ჩატი": "WhatsApp Chat",
        "ჩვენ ვქმნით": "We create",
        "მესამე": "a third",
        "ადგილს": "place",
        "იდეებისა და": "for ideas &",
        "ადამიანების": "people's",
        "ჰარმონიისთვის": "harmony",
        "მეტაფორაში.": "at Metaphora.",
        "ჩამოსქროლეთ და აღმოაჩინეთ მეტაფორას არსი.": "Scroll down and discover the essence of Metaphora.",
        "ჩვენი ფილოსოფია": "Our Philosophy",
        "მეტაფორას მანიფესტი": "Metaphora Manifesto",
        "მეტაფორას მუსიკის მოსმენა (Play/Pause)": "Listen to Metaphora Music (Play/Pause)",
        "მეტაფორას მუსიკის ჩართვა / პაუზა": "Play / Pause Metaphora Music",
        "მეტაფორას აუდიო ვიზუალიზატორი": "Metaphora Audio Visualizer",
        "მოსმენა": "Listen",
        "პაუზა": "Pause",
        "შემოგვიერთდით": "Join Us",
        "მზად ხართ ახალი გამოცდილებისთვის?": "Ready for a New Experience?",
        "დაჯავშნეთ ვიზიტი, შემოუერთდით კლუბებს ან გახდით მეტაფორას პარტნიორი.": "Book a visit, join our clubs, or become a Metaphora partner.",
        "დაჯავშნე ვიზიტი": "Book a Visit",
        "დაჯავშნე ვიზიტი ✨": "Book a Visit ✨",
        "ონლაინ ჯავშანი ✨": "Online Booking ✨",
        "შეავსეთ ფორმა სასურველ სერვისზე ან ღონისძიებაზე დასაჯავშნად.": "Fill out the form to reserve your preferred service or event.",
        "აირჩიეთ სერვისი ან მიმართულება": "Select Service or Pillar",
        "აირჩიეთ სერვისი": "Select Service",
        "სერვისი / მიმართულება": "Service / Pillar",
        "🌱 1. მეტაფორა Personal Development": "🌱 1. Metaphora Personal Development",
        "💼 2. მეტაფორა Business": "💼 2. Metaphora Business",
        "🧠 3. მეტაფორა Think Tank": "🧠 3. Metaphora Think Tank",
        "🎨 4. მეტაფორა Art": "🎨 4. Metaphora Art",
        "🏛️ 5. მეტაფორა Clubs": "🏛️ 5. Metaphora Clubs",
        "🎭 Playback თეატრის საღამო": "🎭 Playback Theatre Evening",
        "☕ Coworking & Mastermind საუზმე": "☕ Coworking & Mastermind Breakfast",
        "📚 წიგნის კლუბი & ღია დიალოგი": "📚 Book Club & Open Dialogue",
        "სრული სახელი": "Full Name",
        "სახელი და გვარი": "Full Name",
        "თქვენი სახელი და გვარი": "Your First and Last Name",
        "თქვენი სახელი": "Your Name",
        "მაგ: გიორგი ბერიძე": "e.g. Giorgi Beridze",
        "ტელეფონის ნომერი": "Phone Number",
        "ტელეფონი:": "Phone:",
        "ტელეფონი": "Phone",
        "ელ-ფოსტა": "Email Address",
        "ელ.ფოსტა:": "Email:",
        "თქვენი ელ-ფოსტა": "Your Email Address",
        "თარიღი": "Date",
        "📅 სასურველი თარიღი": "📅 Preferred Date",
        "დრო": "Time",
        "🕒 დროის ინტერვალი": "🕒 Time Slot",
        "👥 სტუმრების რაოდენობა": "👥 Number of Guests",
        "1 ადამიანი": "1 Person",
        "2 ადამიანი": "2 People",
        "3-4 ადამიანი": "3-4 People",
        "კომენტარი ან განსაკუთრებული სურვილი": "Comment or Special Request",
        "შეტყობინება / კომენტარი": "Message / Comment",
        "დამატებითი დეტალები ან შეკითხვა...": "Additional details or questions...",
        "ჯავშნის დადასტურება ✨": "Confirm Booking ✨",
        "დაჯავშნის გაგზავნა": "Send Booking",
        "გაგზავნა": "Send",
        "დახურვა": "Close",
        "✨ მყისიერი დაჯავშნა": "✨ Instant Booking",
        "კონსულტაციის ჯავშანი": "Consultation Booking",
        "დაჯავშნე კონსულტაცია ✨": "Book Consultation ✨",
        "გახდი პარტნიორი 💼": "Become a Partner 💼",
        "ჩაერთე დისკუსიაში 🧠": "Join Discussion 🧠",
        "დაესწარი პერფორმანსს 🎭": "Attend Performance 🎭",
        "დაჯავშნე მაგიდა 🏛️": "Book a Table 🏛️",
        "ჯავშანი წარმატებით გაიგზავნა! მალე დაგიკავშირდებით. ✨": "Booking sent successfully! We will contact you shortly. ✨",
        "კონტაქტი & ლოკაცია": "Contact & Location",
        "კონტაქტი &amp; ლოკაცია": "Contact & Location",
        "📍 ლოკაცია & კონტაქტი": "📍 Location & Contact",
        "დაგვიკავშირდით & გვეწვიეთ": "Contact Us & Visit",
        "დაგვიკავშირდით &amp; გვეწვიეთ": "Contact Us & Visit",
        "გვეწვიეთ მეტაფორას მყუდრო სივრცეში აღმაშენებლის გამზირზე ან მოგვწერეთ.": "Visit Metaphora's cozy space on Aghmashenebeli Avenue or get in touch.",
        "სივრცე, სადაც პოზიტიური ფსიქოთერაპია, ინტელექტუალური თამაშები და თანამოაზრეთა კომუნა ქმნის ჰარმონიულ გარემოს.": "A space where positive psychotherapy, intellectual games, and a vibrant community create a harmonious environment.",
        "მისამართი": "Address",
        "მისამართი:": "Address:",
        "დ.აღმაშენებლის გამზირი 63ა, თბილისი": "63a David Aghmashenebeli Ave, Tbilisi",
        "თბილისი, საქართველო": "Tbilisi, Georgia",
        "სამუშაო საათები": "Working Hours",
        "სამუშაო საათები:": "Working Hours:",
        "ყოველდღე: 10:00 — 23:00": "Every day: 10:00 — 23:00",
        "რუკის გახსნა": "Open Map",
        "Google Maps-ში გახსნა": "Open Map",
        "სოციალური ქსელები": "Social Media",
        "© 2026 მეტაფორა. ყველა უფლება დაცულია.": "© 2026 METAPHORA. All rights reserved.",
        "&copy; 2026 მეტაფორა. ყველა უფლება დაცულია.": "© 2026 METAPHORA. All rights reserved.",
        "2026 მეტაფორა. ყველა უფლება დაცულია.": "2026 METAPHORA. All rights reserved.",
        "ყველა უფლება დაცულია": "All rights reserved",
        "📍 მეტაფორა ჰაბი": "📍 Metaphora Hub",
        "🌱 პიროვნული განვითარება": "🌱 Personal Development",
        "💼 ბიზნესი & პარტნიორობა": "💼 Business & Partnerships",
        "💼 ბიზნესი &amp; პარტნიორობა": "💼 Business & Partnerships",
        "💼 B2B & ნეთვორქინგი": "💼 B2B & Networking",
        "🧠 ინტელექტუალური დისკუსიები": "🧠 Intellectual Discussions",
        "🧠 სალონური დისკუსიები": "🧠 Salon Discussions",
        "🎨 ხელოვნება & პერფორმანსი": "🎨 Art & Performance",
        "🎨 ხელოვნება &amp; პერფორმანსი": "🎨 Art & Performance",
        "🎭 Playback თეატრი": "🎭 Playback Theatre",
        "3. Playback თეატრი": "3. Playback Theatre",
        "Playback თეატრი": "Playback Theatre",
        "Playback თეატრის მაგია": "Magic of Playback Theatre",
        "🏛️ მესამე სივრცე & კლუბები": "🏛️ Third Place & Clubs",
        "🏛️ მესამე სივრცე &amp; კლუბები": "🏛️ Third Place & Clubs",
        "🏛️ სივრცეები & ლაუნჯი": "🏛️ Spaces & Lounge",
        "სივრცეები & ლაუნჯი": "Spaces & Lounge",
        "თვითშემეცნება & ბალანსი": "Self-Discovery & Balance",
        "თვითშემეცნება &amp; ბალანსი": "Self-Discovery & Balance",
        "არტ-თერაპია & ბალანსი": "Art Therapy & Balance",
        "პარტნიორობა & ზრდა": "Partnership & Growth",
        "პარტნიორობა &amp; ზრდა": "Partnership & Growth",
        "დებატები & იდეები": "Debates & Ideas",
        "დებატები &amp; იდეები": "Debates & Ideas",
        "პერფორმანსი & ენერგია": "Performance & Energy",
        "პერფორმანსი &amp; ენერგია": "Performance & Energy",
        "კომუნა & მესამე სივრცე": "Community & Third Space",
        "კომუნა &amp; მესამე სივრცე": "Community & Third Space",
        "პროგრამის დეტალები & მოდულები": "Program Details & Modules",
        "პროგრამის დეტალები &amp; მოდულები": "Program Details & Modules",
        "რას მოიცავს მიმართულება": "What the Pillar Includes",
        "გაეცანით მიმართულების ძირითად კომპონენტებსა და შესაძლებლობებს.": "Explore the core components and opportunities of this pillar.",
        "რატომ მეტაფორა?": "Why Metaphora?",
        "მიმართულების უპირატესობები": "Pillar Advantages",
        "რა გამოარჩევს მეტაფორას გამოცდილებას და გარემოს.": "What makes the Metaphora experience and environment unique.",
        "მზად ხართ შემოგვიერთდეთ?": "Ready to Join Us?",
        "დაჯავშნეთ ვიზიტი, გაიარეთ კონსულტაცია ან გახდით ჩვენი კომუნის წევრი.": "Book a visit, get a consultation, or become a member of our community.",
        "მთავარზე დაბრუნება": "Back to Home",
        "← მთავარზე დაბრუნება": "← Back to Home",
        "გაიგე მეტი": "Learn More",
        "აღმოაჩინე მეტი": "Discover More",
        "გაიცანი სივრცე": "Explore Space",
        "გადადი სივრცეში": "Enter Space",
        "დაინტერესდით თემით?": "Interested in this topic?",
        "🎬 ვიდეო მიმოხილვა": "🎬 Video Overview",
        "პოზიტიური ფსიქოთერაპია და თვითშემეცნება": "Positive Psychotherapy & Self-Discovery",
        "პოზიტიური ფსიქოთერაპია": "Positive Psychotherapy",
        "პიროვნული განვითარება მეტაფორაში არის მოგზაურობა საკუთარ თავში — პროფესიული ფსიქოლოგიური მხარდაჭერა, ემოციური ინტელექტის გაძლიერება და შინაგანი რესურსების გააქტიურება.": "Personal development at Metaphora is a journey within — professional psychological support, emotional intelligence empowerment, and tapping into your inner resources.",
        "ინდივიდუალური ფსიქოკონსულტირება": "Individual Psycho-Consultation",
        "ინდივიდუალური და ჯგუფური სესიები სერტიფიცირებულ ფსიქოთერაპევტებთან, რომელიც ორიენტირებულია ადამიანის შინაგან რესურსებზე და ბალანსის მოდელზე.": "Individual and group sessions with certified psychotherapists, focusing on inner resources and the positive balance model.",
        "ემოციური ინტელექტი & Mindfulness": "Emotional Intelligence & Mindfulness",
        "ემოციური ინტელექტი &amp; Mindfulness": "Emotional Intelligence & Mindfulness",
        "პრაქტიკული ვორქშოფები და მედიტაციური ტექნიკები ყურადღების კონცენტრაციისთვის, შფოთვის დაძლევისა და ემოციების გაცნობიერებისთვის.": "Practical workshops and mindfulness techniques for deep focus, stress resilience, and emotional awareness.",
        "Burnout პრევენცია & ენერგიის მართვა": "Burnout Prevention & Energy Management",
        "Burnout პრევენცია &amp; ენერგიის მართვა": "Burnout Prevention & Energy Management",
        "ეფექტური სტრატეგიები პროფესიული და პირადი გადაწვის (Burnout) დასაძლევად, ენერგიის აღსადგენად და მყარი მენტალური იმუნიტეტის შესაქმნელად.": "Proven strategies to overcome professional burnout, recharge personal vitality, and build mental stamina.",
        "თვითდახმარების ჯგუფები & საუბრები": "Support Groups & Open Dialogues",
        "თვითდახმარების ჯგუფები &amp; საუბრები": "Support Groups & Open Dialogues",
        "უსაფრთხო, მყუდრო და კონფიდენციალური გარემო, სადაც შეგიძლიათ გულწრფელად გაუზიაროთ გამოცდილება თანამოაზრეებს და მიიღოთ ემპათიური მხარდაჭერა.": "A safe, confidential, and empathetic space to share real experiences with peers and receive compassionate support.",
        "პოზიტიური ფსიქოთერაპიის მეთოდოლოგია": "Positive Psychotherapy Methodology",
        "სერტიფიცირებული და გამოცდილი ექსპერტები": "Certified and Experienced Practitioners",
        "სრული კონფიდენციალურობა და ეთიკური სტანდარტები": "Strict Confidentiality and Ethical Standards",
        "მყუდრო და შთამაგონებელი ატმოსფერო": "Inspiring, Warm, and Cozy Environment",
        "ბიზნეს-კავშირები, ნეთვორქინგი & ზრდა": "Business Networking, Partnerships & Growth",
        "მეტაფორა Business აერთიანებს მეწარმეებს, სტარტაპერებსა და დარგის წამყვან პროფესიონალებს. ჩვენ ვქმნით პლატფორმას იდეების რეალიზაციისთვის, სტრატეგიული პარტნიორობისა და მასტერმაინდისთვის.": "Metaphora Business brings together entrepreneurs, innovators, and industry leaders to foster strategic collaborations, mastermind circles, and business growth.",
        "Mastermind ჯგუფები": "Mastermind Circles",
        "მცირე ჯგუფური სესიები მეწარმეებისთვის, სადაც ერთობლივად ხდება ბიზნეს-ამოცანების გადაჭრა, გამოცდილების გაცვლა და მიზნების დაგეგმვა.": "Peer-to-peer mastermind sessions for founders to solve strategic challenges, share best practices, and accelerate goals.",
        "სტრატეგიული ნეთვორქინგი": "Strategic Networking",
        "მიზნობრივი შეხვედრები, სადაც შეგიძლიათ იპოვოთ მომავალი პარტნიორები, ინვესტორები, კლიენტები და თანამოაზრეები.": "Targeted matchmaking mixers to connect with investors, co-founders, clients, and industry pioneers.",
        "ბიზნეს-ვორქშოფები & ტრენინგები": "Business Workshops & Masterclasses",
        "ბიზნეს-ვორქშოფები &amp; ტრენინგები": "Business Workshops & Masterclasses",
        "პრაქტიკული სემინარები მენეჯმენტზე, მარკეტინგზე, ლიდერობასა და გაყიდვებზე წამყვანი პრაქტიკოსებისგან.": "Hands-on masterclasses in leadership, marketing, fundraising, and scale-up execution from seasoned founders.",
        "Boutique Coworking & Meeting Spaces": "Boutique Coworking & Meeting Spaces",
        "კომფორტული, ერგონომიული და მშვიდი სამუშაო ზონები მაღალსიჩქარიანი ინტერნეტით, სადაც ფოკუსირება და პროდუქტიულობა გარანტირებულია.": "Comfortable, serene workspaces equipped with high-speed fiber internet, private meeting rooms, and focus zones.",
        "მაღალი დონის ბიზნეს-საზოგადოება": "High-Caliber Professional Community",
        "პრაქტიკული და შედეგზე ორიენტირებული ფორმატები": "Result-Driven Mastermind Formats",
        "პრემიუმ ხარისხის სამუშაო სივრცეები": "Premium Boutique Workspace Environment",
        "ახალი ბიზნეს-შესაძლებლობების გენერირება": "Catalyst for New Commercial Opportunities",
        "პროექტების ინკუბაცია": "Project Incubation",
        "Deep Work გარემო": "Deep Work Environment",
        "სალონური დისკუსიები & ინტელექტუალური დებატები": "Salon Discussions & Intellectual Debates",
        "მეტაფორა Think Tank აცოცხლებს კლასიკურ სალონურ კულტურას თანამედროვე ფორმატით. ეს არის ადგილი თავისუფალი აზროვნებისთვის, ფილოსოფიური დიალოგებისთვის და აქტუალური თემების სიღრმისეული ანალიზისთვის.": "Metaphora Think Tank revives classic salon culture in a modern setting — a sanctuary for free thought, philosophical dialogue, and critical analysis of key cultural and scientific ideas.",
        "სალონური დისკუსიები": "Salon Dialogues",
        "თემატური საღამოები ფილოსოფიაზე, კულტურაზე, ტექნოლოგიებსა და საზოგადოებრივ პროცესებზე მოდერატორთან ერთად.": "Thematic evenings exploring philosophy, culture, AI, ethics, and societal paradigms guided by expert facilitators.",
        "მოწვეული სპიკერების ლექციები": "Guest Speaker Series",
        "მოწვეული მკვლევრების, მეცნიერებისა და მოაზროვნეების საავტორო ლექციები ისტორიაზე, ხელოვნებაზე, ფსიქოლოგიასა და მომავლის ტენდენციებზე.": "Keynotes and master lectures by renowned scholars, authors, psychologists, and cultural luminaries.",
        "ინტელექტუალური დებატები": "Intellectual Debates",
        "სტრუქტურირებული დებატები და არგუმენტირებული დისკუსიები აქტუალურ და მრავალმხრივ თემებზე.": "Structured debate formats and dialectic inquiry exploring complex modern questions.",
        "Executive Roundtables": "Executive Roundtables",
        "დახურული ფორმატის დისკუსიები ბიზნეს-ლიდერებისთვის, სადაც განიხილება ბაზრის ტენდენციები, გამოწვევები და ზრდის სტრატეგიები.": "Chatham House style roundtable discussions for visionary leaders to explore macro shifts and strategic foresight.",
        "ღრმა და შინაარსიანი დიალოგი ზედაპირულობის გარეშე": "Deep, Substantive Dialogue Beyond Superficiality",
        "ინტელექტუალური და მრავალფეროვანი საზოგადოება": "Intellectually Diverse and Curious Community",
        "მყუდრო სალონური გარემო ღვინითა და ჩაით": "Cozy Salon Atmosphere with Wine, Coffee & Tea",
        "კრიტიკული აზროვნების განვითარება": "Cultivation of Independent Critical Thinking",
        "Think Tank დარბაზი": "Think Tank Hall",
        "ღია დებატების ფორუმი": "Open Debate Forum",
        "ავტორიტეტული სპიკერები": "Authoritative Keynote Speakers",
        "შემოქმედებითი ენერგია, Playback თეატრი & ხელოვნება": "Creative Energy, Playback Theatre & Fine Arts",
        "ხელოვნება მეტაფორაში არის თვითგამოხატვისა და ემოციური ტრანსფორმაციის მთავარი ინსტრუმენტი. Playback თეატრი, არტ-თერაპია და შემოქმედებითი პერფორმანსები ქმნის დაუვიწყარ გამოცდილებას.": "Art at Metaphora is the primary catalyst for self-expression and emotional transformation. Playback theatre, art therapy, and performances create unforgettable communal experiences.",
        "Playback თეატრის პერფორმანსები": "Playback Theatre Performances",
        "უნიკალური თეატრალური ფორმატი, სადაც მსახიობები და მუსიკოსები მაყურებლის მიერ მოყოლილ რეალურ ისტორიებს მყისიერად აცოცხლებენ სცენაზე.": "An improvisational theatrical form where actors and musicians instantly replay audience members' personal stories on stage.",
        "არტ-თერაპია & ვორქშოფები": "Art Therapy & Creative Workshops",
        "არტ-თერაპია &amp; ვორქშოფები": "Art Therapy & Creative Workshops",
        "თერაპიული ხატვის, თიხის, კოლაჟისა და ფერწერის ვორქშოფები, რომლებიც გეხმარებათ ემოციებისგან განტვირთვასა და შემოქმედებითი ენერგიის გაღვიძებაში.": "Workshops in intuitive painting, clay sculpture, and collage designed to awaken creative flow and emotional healing.",
        "გამოფენები & არტ-საღამოები": "Art Exhibitions & Cultural Evenings",
        "გამოფენები &amp; არტ-საღამოები": "Art Exhibitions & Cultural Evenings",
        "თანამედროვე ქართველი და საერთაშორისო ხელოვანების ნამუშევრების გამოფენები, პრეზენტაციები და შემოქმედებითი შეხვედრები.": "Exhibitions of contemporary Georgian and international artists, vernissages, and intimate creator meetups.",
        "მუსიკალური & პოეტური იმპროვიზაცია": "Musical & Poetic Improvisations",
        "მუსიკალური &amp; პოეტური იმპროვიზაცია": "Musical & Poetic Improvisations",
        "აკუსტიკური კონცერტები, პოეზიის საღამოები და ჯემ-სესიები მყუდრო, შინაურ ატმოსფეროში.": "Acoustic performances, spoken word nights, and live improvisational music jams.",
        "ავთენტური Playback თეატრალური დასი": "Authentic Professional Playback Ensemble",
        "პროფესიული არტ-თერაპიული სივრცე": "Equipped Atelier for Expressive Arts",
        "ცოცხალი შემოქმედებითი პროცესი": "Live Interactive Creative Process",
        "ემოციური კათარზისი და ინსპირაცია": "Emotional Catharsis and Deep Inspiration",
        "კურირებული გამოფენები": "Curated Art Exhibitions",
        "შენი „მესამე სივრცე“ — კლუბები, კომუნა & თამაშები": "Your 'Third Place' — Themed Clubs, Community & Board Games",
        "მეტაფორა Clubs არის ადგილი სახლსა და სამსახურს შორის, სადაც ყოველთვის გელიან. თემატური კლუბები, ინტელექტუალური თამაშები და მეგობრული კომუნა ქმნის ნამდვილ შინაურ გარემოს.": "Metaphora Clubs is the sanctuary between home and work where you always belong. Enjoy themed clubs, board game salons, and warm social camaraderie.",
        "სამაგიდო თამაშების სალონი": "Board Games Salon",
        "სტრატეგიული, ფსიქოლოგიური და გასართობი სამაგიდო თამაშები (Mafia, Catan, Dixit, Chess) მეგობრებთან და ახალ ნაცნობებთან ერთად.": "Strategic, social, and psychological tabletop games (Mafia, Catan, Dixit, Chess) enjoyed with friends and fellow club members.",
        "წიგნის კლუბი & ლიტერატურული სალონი": "Book Club & Literary Salon",
        "წიგნის კლუბი &amp; ლიტერატურული სალონი": "Book Club & Literary Salon",
        "თვეში ერთხელ შერჩეული წიგნის განხილვა, დისკუსიები ავტორებზე, იდეებსა და ლიტერატურულ ტენდენციებზე ჩაისთან ერთად.": "Monthly book reviews, literary deep-dives, and engaging discussions over fresh artisanal tea.",
        "წიგნების კლუბი": "Book Club",
        "წიგნების & კინოკლუბი": "Books & Film Club",
        "კინო-ჩვენებები & დისკუსიები": "Cinema Screenings & Cine-Club",
        "კინო-ჩვენებები &amp; დისკუსიები": "Cinema Screenings & Cine-Club",
        "არტ-ჰაუსისა და კლასიკური ფილმების ჩვენება მყუდრო დარბაზში, რასაც მოსდევს სიღრმისეული საუბარი რეჟისურასა და იდეებზე.": "Curated art-house and classic cinema screenings followed by thoughtful director and theme critiques.",
        "Lifestyle & ინტერესთა კლუბები": "Lifestyle & Special Interest Clubs",
        "Lifestyle &amp; ინტერესთა კლუბები": "Lifestyle & Special Interest Clubs",
        "იოგა, სუნთქვითი ვარჯიშები, მებაღეობა, კულინარიული საღამოები და სხვადასხვა ინტერესთა ჯგუფები ჰარმონიული ყოველდღიურობისთვის.": "Yoga, breathwork circles, urban gardening, gourmet culinary tastings, and lifestyle circles.",
        "თბილი, მიმღები და მეგობრული კომუნა": "Warm, Inclusive, and Welcoming Community",
        "მრავალფეროვანი ყოველკვირეული აქტივობები": "Diverse Weekly Social Calendar",
        "ბარი გემრიელი ყავით, ჩაითა და კოქტეილებით": "Artisanal Coffee, Rare Teas & Signature Cocktails",
        "ნამდვილი „მესამე ადგილის“ ატმოსფერო": "The Authentic Feeling of a True 'Third Place'",
        "სტატიები & სიახლეები": "Articles & News",
        "სტატიები &amp; სიახლეები": "Articles & News",
        "სტატიები & ფიქრები": "Articles & Reflections",
        "მეტაფორას ბლოგი": "Metaphora Blog",
        "სიღრმისეული სტატიები პიროვნულ განვითარებაზე, სალონურ კულტურაზე, ხელოვნებასა და კომუნაზე.": "In-depth articles on personal growth, salon culture, art, and community.",
        "ყველა სტატია": "All Articles",
        "ფსიქოლოგია": "Psychology",
        "ხელოვნება": "Art",
        "ბიზნესი": "Business",
        "კომუნა": "Community",
        "კლუბები": "Clubs",
        "რჩეული სტატია": "Featured Article",
        "🌟 რჩეული სტატია": "🌟 Featured Article",
        "🌟 რჩეული სტატია • 5 წთ": "🌟 Featured Article • 5 min",
        "6 წთ საკითხავი": "6 min read",
        "5 წთ საკითხავი": "5 min read",
        "4 წთ საკითხავი": "4 min read",
        "3 წთ საკითხავი": "3 min read",
        "4 წთ": "4 min",
        "5 წთ": "5 min",
        "6 წთ": "6 min",
        "3 წთ": "3 min",
        "სტატიის წაკითხვა 📖": "Read Article 📖",
        "სრულად წაკითხვა →": "Read Full Story →",
        "სრული სტატიის წაკითხვა →": "Read Full Article →",
        "წაიკითხე ბლოგი": "Read Blog",
        "სტატიის სათაური": "Article Title",
        "აგვისტო 2026": "August 2026",
        "2026 წლის აგვისტო": "August 2026",
        "🧠 ფსიქოლოგია": "🧠 Psychology",
        "🧠 ფსიქოლოგია • 6 წთ": "🧠 Psychology • 6 min",
        "ფსიქოლოგია • 6 წთ": "Psychology • 6 min",
        "☕ პროდუქტიულობა": "☕ Productivity",
        "☕ პროდუქტიულობა • 3 წთ": "☕ Productivity • 3 min",
        "პროდუქტიულობა • 3 წთ": "Productivity • 3 min",
        "🍸 კომუნა": "🍸 Community",
        "🍸 კომუნა • 4 წთ": "🍸 Community • 4 min",
        "კომუნა • 4 წთ": "Community • 4 min",
        "🎨 თვითგამოხატვა": "🎨 Self-Expression",
        "🎨 თვითგამოხატვა • 5 წთ": "🎨 Self-Expression • 5 min",
        "თვითგამოხატვა • 5 წთ": "Self-Expression • 5 min",
        "თეატრი & ემოცია • 4 წთ": "Theatre & Emotion • 4 min",
        "📚 წიგნის კლუბი": "📚 Book Club",
        "📚 წიგნის კლუბი • 4 წთ": "📚 Book Club • 4 min",
        "წიგნების კლუბი • 4 წთ": "Book Club • 4 min",
        "ფოტოარქივი & მომენტები": "Photo Archive & Moments",
        "ფოტოარქივი &amp; მომენტები": "Photo Archive & Moments",
        "მეტაფორას გალერეა": "Metaphora Gallery",
        "მეტაფორას ფოტოგალერეა": "Metaphora Photo Gallery",
        "დაათვალიერეთ ჩვენი სივრცეები, ღონისძიებები და შემოქმედებითი საღამოები.": "Browse our spaces, events, and creative evenings.",
        "ყველა ფოტო": "All Photos",
        "✨ ყველა ფოტო": "✨ All Photos",
        "სივრცეები": "Spaces",
        "ღონისძიებები": "Events",
        "ღონისძიებები & თეატრი": "Events & Theatre",
        "ხალხი & ემოციები": "People & Emotions",
        "ხალხი &amp; ემოციები": "People & Emotions",
        "ფოტოკოლექცია": "Photo Collection",
        "მეტაფორას ინტერიერი": "Metaphora Interior",
        "მეტაფორას მოზაიკა": "Metaphora Mosaic",
        "✨ მეტაფორას ატმოსფერო": "✨ Metaphora Atmosphere",
        "🚪 შესასვლელი & ფოიე": "🚪 Entrance & Foyer",
        "შესასვლელი & ფოიე": "Entrance & Foyer",
        "გალერეის ნახვა": "View Gallery",
        "მეტაფორას AI ასისტენტი • 🟢 ონლაინ": "Metaphora AI Assistant • 🟢 Online",
        "მეტაფორას AI გიდი": "Metaphora AI Guide",
        "ონლაინ ასისტენტი": "Online Assistant",
        "მეტაბოტი": "MetaBot",
        "მისწერე მეტაბოტს...": "Type to MetaBot...",
        "დაწერეთ შეკითხვა...": "Type your message...",
        "მეტაბოტი წერს...": "MetaBot is typing...",
        "რა სერვისები გაქვთ?": "What services do you offer?",
        "როგორი სივრცეები გაქვთ?": "What spaces do you have?",
        "რა ღონისძიებები გაქვთ?": "What events are coming up?",
        "როგორ დავჯავშნო?": "How do I book?",
        "სად მდებარეობთ?": "Where are you located?",
        "როგორია სამუშაო საათები?": "What are your opening hours?",
        "რა არის მეტაფორა?": "What is Metaphora?",
        "🌿 რა არის მეტაფორა?": "🌿 What is Metaphora?",
        "გამარჯობა! მე ვარ": "Hello! I am",
        "✨ — „მეტაფორას“ ვირტუალური გიდი.": "✨ — Metaphora’s virtual guide.",
        "რით შემიძლია დაგეხმაროთ? მკითხეთ ჩვენს": "How can I help you? Ask me about our",
        "სერვისებზე": "services",
        "სივრცეებზე": "spaces",
        "ღონისძიებებზე": "events",
        "ან": "or",
        "ჯავშანზე": "booking",
        "🏛️ სივრცეები": "🏛️ Spaces",
        "📅 ღონისძიებები": "📅 Events",
        "ენის შეცვლა (KA / EN)": "Change Language (KA / EN)",
        "დომინანტი ფერის შეცვლა": "Change Dominant Theme Color",
        "გადახდაზე გადასვლა 💳": "Proceed to Payment 💳",
        "გადახდაზე გადასვლა": "Proceed to Payment",
        "გადახდა საბანკო გადარიცხვით": "Payment by Bank Transfer",
        "ჯავშნის დასასრულებლად გადაიხადეთ საფასური": "Please complete the bank transfer to confirm your booking",
        "📸 დაასკანერეთ ტელეფონის კამერით": "📸 Scan with your phone camera",
        "დაასკანერეთ ტელეფონის კამერით": "Scan with your phone camera",
        "დასკანერებისას ავტომატურად გაგეხსნებათ საქართველოს ბანკისა და თიბისის გადახდის აპლიკაციები 📱": "Scanning automatically opens Bank of Georgia and TBC Bank apps 📱",
        "აირჩიეთ ბანკი გადასასვლელად:": "Choose your mobile bank:",
        "აირჩიეთ ბანკი ან გადადით ინტერნეტ ბანკში:": "Choose your bank or open Web Banking:",
        "საქართველოს ბანკი": "Bank of Georgia",
        "თიბისი ბანკი": "TBC Bank",
        "მიმღები": "Recipient",
        "ანი მაისურაძე": "Ani Maisuradze",
        "ბანკი": "Bank",
        "საქართველოს ბანკი (Bank of Georgia)": "Bank of Georgia (BOG)",
        "ანგარიშის ნომერი (IBAN)": "Account Number (IBAN)",
        "გადასარიცხი თანხა (საფასური)": "Transfer Amount (Fee)",
        "საფასური": "Fee",
        "📋 კოპირება": "📋 Copy",
        "კოპირება": "Copy",
        "✓ დაკოპირდა!": "✓ Copied!",
        "📋 სრული რეკვიზიტების კოპირება (IBAN, მიმღები, თანხა, დანიშნულება)": "📋 Copy Full Requisites (IBAN, Recipient, Amount, Purpose)",
        "✓ სრული რეკვიზიტები დაკოპირდა!": "✓ Full Requisites Copied!",
        "დანიშნულება": "Payment Purpose",
        "მეტაფორას ჯავშანი": "Metaphora Booking",
        "← უკან": "← Back",
        "✅ გადახდა დავასრულე - დადასტურება": "✅ Payment Completed - Confirm",
        "გადახდა დავასრულე - დადასტურება": "Payment Completed - Confirm",
        "ჯავშანი და გადახდა დადასტურდა!": "Booking & Payment Confirmed!",
        "გმადლობთ! თქვენი ჯავშანი წარმატებით დაფიქსირდა. მეტაფორას გუნდი უმოკლეს დროში დაგიკავშირდებათ დეტალების დასაზუსტებლად.": "Thank you! Your booking has been registered successfully. The Metafora team will contact you shortly to confirm all details.",
        "დახურვა ✨": "Close ✨"
    };

    const I18N_REVERSE_DICTIONARY = {};
    Object.keys(I18N_DICTIONARY).forEach(ka => {
        I18N_REVERSE_DICTIONARY[I18N_DICTIONARY[ka]] = ka;
    });

    const I18N_DYNAMIC_DATA = {
        KA: {
            profiles: [
                { id: 0, name: 'Personal Development', role: 'იპოვე შენი შინაგანი ძალა' },
                { id: 1, name: 'Business', role: 'გაიზარდე და შექმენი შესაძლებლობები' },
                { id: 2, name: 'Think Tank', role: 'სიღრმისეული სალონური დისკუსიები' },
                { id: 3, name: 'Art', role: 'შემოქმედებითი ენერგია & ხელოვნება' },
                { id: 4, name: 'Clubs', role: 'შენი მესამე სივრცე & კომუნა' },
                { id: 5, name: 'ჩვენს შესახებ', role: 'მანიფესტი, გუნდი & ფილოსოფია' },
                { id: 6, name: 'გალერეა', role: 'სივრცე, გუნდი & ღონისძიებები' },
                { id: 7, name: 'ბლოგი', role: 'სიახლეები, სტატიები & იდეები' }
            ],
            testimonials: [
                { name: 'ლალი', jobtitle: 'დამფუძნებელი & ფასილიტატორი', text: '„მეტაფორა“ არის გარემო, სადაც იდეები ცოცხლდებიან, ხოლო ადამიანები და შესაძლებლობები ერთმანეთს პოულობენ. აქ ყველაფერია შენი განვითარებისა და შთაგონებისთვის.' },
                { name: 'თინათინი', jobtitle: 'პოზიტიური ფსიქოთერაპევტი', text: 'Personal Development მიმართულება ეხმარება ადამიანებს შინაგანი ძალის, ბალანსისა და ემოციური ჰარმონიის პოვნაში პროფესიული მხარდაჭერით.' },
                { name: 'გიორგი', jobtitle: 'Think Tank მოდერატორი', text: 'Think Tank სალონური დისკუსიები და ინტელექტუალური დებატები ქმნის სივრცეს, სადაც იდეები გარდაიქმნება რეალურ ცვლილებებად და ინოვაციებად.' },
                { name: 'ნინო', jobtitle: 'Playback თეატრის არტისტი', text: 'Playback თეატრი მაყურებლის ემოციებსა და ისტორიებს აცოცხლებს სცენაზე — ეს არის უნიკალური შემოქმედებითი და არტ-თერაპიული გამოცდილება.' },
                { name: 'დავითი', jobtitle: 'Business & Partnerships Lead', text: 'მეტაფორა Business აერთიანებს მეწარმეებსა და პროფესიონალებს ნაყოფიერი თანამშრომლობის, პარტნიორობისა და ახალი შესაძლებლობების შესაქმნელად.' },
                { name: 'ელენე', jobtitle: 'Community Manager & Clubs Host', text: 'მეტაფორა Clubs არის შენი „მესამე სივრცე“ — ადგილი, სადაც თავს ყოველთვის შინაურად, მყუდროდ და თავისუფლად იგრძნობ თანამოაზრეებთან ერთად.' },
                { name: 'სანდრო', jobtitle: 'Creative Producer & Curator', text: 'ჩვენ ვქმნით შთამაგონებელ გარემოს, ვორქშოფებსა და არტ-საღამოებს, რომლებიც ადამიანებს აკავშირებს და ავსებს შემოქმედებითი ენერგიით.' }
            ],
            afisha: [
                { title: "🎭 Playback იმპროვიზაციის საღამო", testimonial: "თეატრალური პერფორმანსი, სადაც მაყურებლის რეალური ისტორიები და ემოციები სცენაზე ცოცხლდება.", by: "28 აგვ | 19:00 • Playback დასი" },
                { title: "🌿 პოზიტიური ფსიქოლოგიის ვორქშოფი", testimonial: "სტრესის მართვის, ემოციური ბალანსისა და თვითშემეცნების პრაქტიკული სემინარი ფსიქოთერაპევტთან.", by: "30 აგვ | 18:30 • ანა კაპანაძე" },
                { title: "🎲 Board Games Night & Cocktail Hour", testimonial: "სამაგიდო თამაშების ჩემპიონატი, საავტორო კოქტეილები, ახალი ნაცნობობა და მხიარული ატმოსფერო.", by: "02 სექ | 20:00 • მეტაფორა Bar" },
                { title: "💡 Think Tank & ფილოსოფიის საღამო", testimonial: "დისკუსია თანამედროვე კულტურასა და „მესამე ადგილის“ ფენომენზე თანამოაზრეთა წრეში.", by: "05 სექ | 19:30 • ლევან ჯაფარიძე" },
                { title: "🎨 არტ-თერაპია & თვითგამოხატვა", testimonial: "შემოქმედებითი ხატვისა და ემოციური განტვირთვის სესია მყუდრო ლაუნჯში.", by: "08 სექ | 18:00 • სალომე მგელაძე" },
                { title: "☕ Coworking & Mastermind საუზმე", testimonial: "დილის ყავა, პროდუქტიული ნეთვორქინგი და გამოცდილების გაზიარება სტარტაპერებთან.", by: "12 სექ | 10:30 • გიორგი გელოვანი" },
                { title: "📚 წიგნის კლუბი & ღია დისკუსია", testimonial: "თვიური წიგნის განხილვა, საინტერესო დებატები და ცხელი ჩაის საღამო.", by: "15 სექ | 19:00 • მეტაფორა Club" }
            ],
            botWelcome: "<p>გამარჯობა! მე ვარ <strong>მეტაბოტი</strong> ✨ — „მეტაფორას“ ვირტუალური გიდი.</p><p>რით შემიძლია დაგეხმაროთ? მკითხეთ ჩვენს <strong>სერვისებზე</strong>, <strong>სივრცეებზე</strong>, <strong>ღონისძიებებზე</strong> ან <strong>ჯავშანზე</strong>!</p>"
        },
        EN: {
            profiles: [
                { id: 0, name: 'Personal Development', role: 'Find your inner strength & balance' },
                { id: 1, name: 'Business', role: 'Grow and unlock new opportunities' },
                { id: 2, name: 'Think Tank', role: 'Deep salon discussions & debates' },
                { id: 3, name: 'Art', role: 'Creative energy & artistic expression' },
                { id: 4, name: 'Clubs', role: 'Your third place & community hub' },
                { id: 5, name: 'About Us', role: 'Manifesto, team & philosophy' },
                { id: 6, name: 'Gallery', role: 'Spaces, team & vibrant events' },
                { id: 7, name: 'Blog', role: 'Insights, articles & inspiring ideas' }
            ],
            testimonials: [
                { name: 'Lali', jobtitle: 'Founder & Facilitator', text: '“Metaphora” is an environment where ideas come to life and people connect with new possibilities. Everything here is crafted for your growth and inspiration.' },
                { name: 'Tinatin', jobtitle: 'Positive Psychotherapist', text: 'Personal Development helps individuals find inner resilience, balance, and emotional harmony with dedicated professional support.' },
                { name: 'Giorgi', jobtitle: 'Think Tank Moderator', text: 'Think Tank salon discussions and intellectual debates create a fertile space where bold ideas turn into tangible progress.' },
                { name: 'Nino', jobtitle: 'Playback Theatre Artist', text: 'Playback Theatre brings audience stories and emotions to life on stage — an unforgettable creative and therapeutic art experience.' },
                { name: 'Davit', jobtitle: 'Business & Partnerships Lead', text: 'Metaphora Business unites entrepreneurs and professionals for impactful collaboration, strategic partnerships, and new ventures.' },
                { name: 'Elene', jobtitle: 'Community Manager & Clubs Host', text: 'Metaphora Clubs is your “Third Place” — where you always feel at home, relaxed, and surrounded by kindred spirits.' },
                { name: 'Sandro', jobtitle: 'Creative Producer & Curator', text: 'We design inspiring gatherings, workshops, and art evenings that connect people and spark boundless creative energy.' }
            ],
            afisha: [
                { title: "🎭 Playback Improvisation Night", testimonial: "A theatrical performance where audience real stories and emotions come alive on stage.", by: "Aug 28 | 19:00 • Playback Troupe" },
                { title: "🌿 Positive Psychology Workshop", testimonial: "A practical seminar on stress management, emotional balance and self-discovery.", by: "Aug 30 | 18:30 • Ana Kapanadze" },
                { title: "🎲 Board Games Night & Cocktail Hour", testimonial: "Board game tournament, signature cocktails & mocktails, and inspiring new connections.", by: "Sep 02 | 20:00 • Metaphora Bar" },
                { title: "💡 Think Tank & Philosophy Salon", testimonial: "Engaging discussions on modern culture and the 'Third Place' phenomenon with peers.", by: "Sep 05 | 19:30 • Levan Japaridze" },
                { title: "🎨 Art Therapy & Creative Expression", testimonial: "A soothing session of creative painting and emotional decompression in a cozy lounge.", by: "Sep 08 | 18:00 • Salome Mgeladze" },
                { title: "☕ Coworking & Mastermind Breakfast", testimonial: "Morning coffee, productive networking, and experience sharing with creators and founders.", by: "Sep 12 | 10:30 • Giorgi Gelovani" },
                { title: "📚 Book Club & Open Dialogue", testimonial: "Monthly book discussion, lively debates, and a warm tea evening in good company.", by: "Sep 15 | 19:00 • Metaphora Club" }
            ],
            botWelcome: "<p>Hello! I am <strong>MetaBot</strong> ✨ — Metaphora’s virtual AI guide.</p><p>How can I help you today? Ask me about our <strong>services</strong>, <strong>spaces</strong>, <strong>events</strong>, or <strong>booking</strong>!</p>"
        }
    };

    function translateDOMNodes(node, targetLang) {
        if (!node) return;

        if (node.nodeType === Node.TEXT_NODE) {
            const raw = node.nodeValue.trim();
            if (!raw) return;

            if (targetLang === 'EN') {
                if (!node._originalKa) node._originalKa = raw;
                if (I18N_DICTIONARY[raw]) {
                    node.nodeValue = node.nodeValue.replace(raw, I18N_DICTIONARY[raw]);
                } else {
                    const clean = raw.replace(/\s+/g, ' ');
                    if (I18N_DICTIONARY[clean]) {
                        node.nodeValue = node.nodeValue.replace(raw, I18N_DICTIONARY[clean]);
                    }
                }
            } else if (targetLang === 'KA') {
                if (node._originalKa) {
                    const cur = node.nodeValue.trim();
                    node.nodeValue = node.nodeValue.replace(cur, node._originalKa);
                } else if (I18N_REVERSE_DICTIONARY[raw]) {
                    node.nodeValue = node.nodeValue.replace(raw, I18N_REVERSE_DICTIONARY[raw]);
                }
            }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            const tag = node.tagName.toLowerCase();
            if (tag === 'script' || tag === 'style' || tag === 'svg' || tag === 'path' || tag === 'line' || tag === 'circle') return;

            // Handle placeholders
            if (node.placeholder) {
                const p = node.placeholder.trim();
                if (targetLang === 'EN' && I18N_DICTIONARY[p]) {
                    if (!node._origPlace) node._origPlace = p;
                    node.placeholder = I18N_DICTIONARY[p];
                } else if (targetLang === 'KA' && node._origPlace) {
                    node.placeholder = node._origPlace;
                }
            }

            // Handle input submit/button values
            if ((tag === 'input' && (node.type === 'button' || node.type === 'submit')) || tag === 'button') {
                if (node.value && I18N_DICTIONARY[node.value.trim()]) {
                    const v = node.value.trim();
                    if (targetLang === 'EN') {
                        if (!node._origVal) node._origVal = v;
                        node.value = I18N_DICTIONARY[v];
                    } else if (targetLang === 'KA' && node._origVal) {
                        node.value = node._origVal;
                    }
                }
            }

            // Handle <select> <option> text
            if (tag === 'option') {
                const optText = node.textContent.trim();
                if (targetLang === 'EN') {
                    if (!node._origOptionText) node._origOptionText = optText;
                    if (I18N_DICTIONARY[optText]) {
                        node.textContent = I18N_DICTIONARY[optText];
                    }
                } else if (targetLang === 'KA' && node._origOptionText) {
                    node.textContent = node._origOptionText;
                }
            }

            // Handle title attributes
            if (node.getAttribute('title')) {
                const t = node.getAttribute('title').trim();
                if (targetLang === 'EN' && I18N_DICTIONARY[t]) {
                    if (!node._origTitle) node._origTitle = t;
                    node.setAttribute('title', I18N_DICTIONARY[t]);
                } else if (targetLang === 'KA' && node._origTitle) {
                    node.setAttribute('title', node._origTitle);
                }
            }

            node.childNodes.forEach(child => translateDOMNodes(child, targetLang));
        }
    }

    const targetLangTitleMap = {
        EN: {
            "მეტაფორა - Edutainment Hub & Third Place": "METAPHORA - Edutainment Hub & Third Place",
            "გალერეა - მეტაფორა": "Gallery - METAPHORA",
            "ბლოგი - მეტაფორა": "Blog - METAPHORA",
            "სერვისები - მეტაფორა": "Services - METAPHORA",
            "1. Personal Development - მეტაფორა": "1. Personal Development - METAPHORA",
            "2. Business - მეტაფორა": "2. Business - METAPHORA",
            "3. Think Tank - მეტაფორა": "3. Think Tank - METAPHORA",
            "4. Art - მეტაფორა": "4. Art - METAPHORA",
            "5. Clubs - მეტაფორა": "5. Clubs - METAPHORA"
        },
        KA: {
            "METAPHORA - Edutainment Hub & Third Place": "მეტაფორა - Edutainment Hub & Third Place",
            "Gallery - METAPHORA": "გალერეა - მეტაფორა",
            "Blog - METAPHORA": "ბლოგი - მეტაფორა",
            "Services - METAPHORA": "სერვისები - მეტაფორა",
            "1. Personal Development - METAPHORA": "1. Personal Development - მეტაფორა",
            "2. Business - METAPHORA": "2. Business - მეტაფორა",
            "3. Think Tank - METAPHORA": "3. Think Tank - მეტაფორა",
            "4. Art - METAPHORA": "4. Art - მეტაფორა",
            "5. Clubs - METAPHORA": "5. Clubs - მეტაფორა"
        }
    };

    function setLanguage(lang, save = true) {
        const labelText = (lang === 'KA') ? 'GE' : 'EN';
        document.querySelectorAll('.lang-label, #lang-active-label, #portal-lang-active-label').forEach(lbl => {
            lbl.textContent = labelText;
        });
        document.querySelectorAll('.lang-single-btn, #lang-toggle-btn, #portal-lang-toggle-btn').forEach(btn => {
            btn.setAttribute('title', lang === 'KA' ? 'ენა: GE (დააწკაპუნეთ ინგლისურზე გადასართავად)' : 'Language: English (Click to switch to Georgian)');
        });
        document.documentElement.setAttribute('lang', lang.toLowerCase());

        // Update Document Title
        if (targetLangTitleMap[lang] && targetLangTitleMap[lang][document.title]) {
            document.title = targetLangTitleMap[lang][document.title];
        }

        if (save) {
            localStorage.setItem('metafora_lang', lang);
        }

        // Translate DOM text nodes
        if (lang === 'EN' || (lang === 'KA' && localStorage.getItem('metafora_lang_switched') === '1')) {
            translateDOMNodes(document.body, lang);
            if (lang === 'EN') localStorage.setItem('metafora_lang_switched', '1');
        }

        // Update dynamic data arrays in memory
        const dynData = I18N_DYNAMIC_DATA[lang];
        if (dynData) {
            // Update profiles data
            if (typeof profiles !== 'undefined' && Array.isArray(profiles)) {
                dynData.profiles.forEach((p, idx) => {
                    if (profiles[idx]) {
                        profiles[idx].name = p.name;
                        profiles[idx].role = p.role;
                    }
                });
            }

            // Update testimonials
            if (typeof testimonials !== 'undefined' && Array.isArray(testimonials)) {
                dynData.testimonials.forEach((t, idx) => {
                    if (testimonials[idx]) {
                        testimonials[idx].name = t.name;
                        testimonials[idx].jobtitle = t.jobtitle;
                        testimonials[idx].text = t.text;
                    }
                });
            }

            // Update afisha events
            if (typeof afishaEvents !== 'undefined' && Array.isArray(afishaEvents)) {
                dynData.afisha.forEach((a, idx) => {
                    if (afishaEvents[idx]) {
                        afishaEvents[idx].title = a.title;
                        afishaEvents[idx].testimonial = a.testimonial;
                        afishaEvents[idx].by = a.by;
                    }
                });
            }

            // Re-render active UI pieces
            if (typeof updateCenterCard === 'function') updateCenterCard();
            if (typeof setTestimonial === 'function' && typeof currentTwIdx !== 'undefined') setTestimonial(currentTwIdx, false);
            if (typeof renderAfishaCards === 'function') renderAfishaCards();

            // Update MetaBot welcome msg
            const firstBotMsg = document.querySelector('.metabot-msg.bot-msg .metabot-msg-bubble');
            if (firstBotMsg) {
                firstBotMsg.innerHTML = dynData.botWelcome;
            }
        }
    }

    function initI18nLanguageSwitcher() {
        const langToggleBtns = document.querySelectorAll('.lang-single-btn, #lang-toggle-btn, #portal-lang-toggle-btn');
        const savedLang = localStorage.getItem('metafora_lang') || 'KA';
        
        if (savedLang === 'EN') {
            setLanguage('EN', false);
        } else {
            document.querySelectorAll('.lang-label, #lang-active-label, #portal-lang-active-label').forEach(lbl => {
                lbl.textContent = 'GE';
            });
        }

        langToggleBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const currentLang = localStorage.getItem('metafora_lang') || 'KA';
                const nextLang = (currentLang === 'KA') ? 'EN' : 'KA';
                
                btn.classList.add('flipping');
                setTimeout(() => btn.classList.remove('flipping'), 380);

                setLanguage(nextLang, true);
            });
        });
    }

    initI18nLanguageSwitcher();
});
