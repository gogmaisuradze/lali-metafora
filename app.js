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

        let isHoveringPortal = false;
        if (entrancePortal) {
            entrancePortal.addEventListener('mouseenter', () => { isHoveringPortal = true; });
            entrancePortal.addEventListener('mouseleave', () => { isHoveringPortal = false; });
        }

        function renderDandelionLoop(timestamp) {
            if (!entrancePortal || entrancePortal.style.display !== 'none') {
                if (!isHoveringPortal) {
                    targetYaw += 0.0024; // Continuous elegant 3D ambient rotation
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

        // Portal Exit Transition & Connect Button (სულ თავში ჩართვა)
        if (connectBtn && entrancePortal && mainWebsite) {
            connectBtn.addEventListener('click', (e) => {
                e.preventDefault();
                connectBtn.style.transform = 'scale(0.92)';
                setTimeout(() => {
                    exitPortalAndScroll('#hero');
                }, 150);
            });
        }
    }

    function navigateToProfile(profile) {
        if (!profile) {
            exitPortalAndScroll('#hero');
            return;
        }
        const target = profile.target || '#hero';
        if (target.endsWith('.html')) {
            window.location.href = target;
        } else {
            exitPortalAndScroll(target);
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
        const entrancePortal = document.getElementById('entrance-portal');
        const mainWebsite = document.getElementById('main-website');

        if (entrancePortal && entrancePortal.style.display !== 'none') {
            entrancePortal.classList.add('portal-exit');
            document.body.classList.remove('initial-lock');
            if (mainWebsite) mainWebsite.classList.add('active');
            window.scrollTo({ top: 0, behavior: 'instant' });

            setTimeout(() => {
                entrancePortal.style.display = 'none';
                if (typeof ScrollTrigger !== 'undefined') {
                    ScrollTrigger.refresh();
                }
                if (targetHash && targetHash !== '#hero' && targetHash !== '#entrance') {
                    scrollToAnchor(targetHash);
                } else {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            }, 450);
        } else if (targetHash && targetHash !== '#entrance') {
            scrollToAnchor(targetHash);
        }
    }

    // Re-open Entrance 3D Portal
    function reopenPortal() {
        const entrancePortal = document.getElementById('entrance-portal');
        const mainWebsite = document.getElementById('main-website');
        if (entrancePortal && mainWebsite) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            entrancePortal.style.display = 'flex';
            entrancePortal.offsetHeight; // trigger reflow
            entrancePortal.classList.remove('portal-exit');
            mainWebsite.classList.remove('active');
            document.body.classList.add('initial-lock');
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
                const targetEl = document.querySelector(hash);
                if (targetEl) {
                    e.preventDefault();
                    exitPortalAndScroll(hash);
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

    });

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
        if (!video) return;

        video.muted = true;
        video.pause();

        video.addEventListener('loadedmetadata', () => {
            video.currentTime = 0.01;
        });

        card.addEventListener('mouseenter', () => {
            const playPromise = video.play();
            if (playPromise !== undefined) {
                playPromise.catch(() => {});
            }
        });

        card.addEventListener('mouseleave', () => {
            video.pause();
        });
    });

    // ==========================================================================
    // 3. TYPEWRITER AUDIO TESTIMONIALS (Team Members)
    // ==========================================================================
        const testimonials = [
        {
            image: 'გუნდი/1.jpg',
            audio: 'audio_1.mp3',
            text: '„მეტაფორა“ არის გარემო, სადაც იდეები ცოცხლდებიან, ხოლო ადამიანები და შესაძლებლობები ერთმანეთს პოულობენ. აქ ყველაფერია შენი განვითარებისა და შთაგონებისთვის.',
            name: 'ლალი',
            jobtitle: 'დამფუძნებელი & ფასილიტატორი',
            time: '0:14 / 0:45'
        },
        {
            image: 'გუნდი/2.jpg',
            audio: 'audio_2.mp3',
            text: 'Personal Development მიმართულება ეხმარება ადამიანებს შინაგანი ძალის, ბალანსისა და ემოციური ჰარმონიის პოვნაში პროფესიული მხარდაჭერით.',
            name: 'თინათინი',
            jobtitle: 'პოზიტიური ფსიქოთერაპევტი',
            time: '0:22 / 0:50'
        },
        {
            image: 'გუნდი/3.jpg',
            audio: 'audio_3.mp3',
            text: 'Think Tank სალონური დისკუსიები და ინტელექტუალური დებატები ქმნის სივრცეს, სადაც იდეები გარდაიქმნება რეალურ ცვლილებებად და ინოვაციებად.',
            name: 'გიორგი',
            jobtitle: 'Think Tank მოდერატორი',
            time: '0:18 / 0:42'
        },
        {
            image: 'გუნდი/4.jpg',
            audio: 'audio_4.mp3',
            text: 'Playback თეატრი მაყურებლის ემოციებსა და ისტორიებს აცოცხლებს სცენაზე — ეს არის უნიკალური შემოქმედებითი და არტ-თერაპიული გამოცდილება.',
            name: 'ნინო',
            jobtitle: 'Playback თეატრის არტისტი',
            time: '0:31 / 1:05'
        },
        {
            image: 'გუნდი/5.jpg',
            audio: 'audio_5.mp3',
            text: 'მეტაფორა Business აერთიანებს მეწარმეებსა და პროფესიონალებს ნაყოფიერი თანამშრომლობის, პარტნიორობისა და ახალი შესაძლებლობების შესაქმნელად.',
            name: 'დავითი',
            jobtitle: 'Business & Partnerships Lead',
            time: '0:12 / 0:38'
        },
        {
            image: 'გუნდი/6.jpg',
            audio: 'audio_6.mp3',
            text: 'მეტაფორა Clubs არის შენი „მესამე სივრცე“ — ადგილი, სადაც თავს ყოველთვის შინაურად, მყუდროდ და თავისუფლად იგრძნობ თანამოაზრეებთან ერთად.',
            name: 'ელენე',
            jobtitle: 'Community Manager & Clubs Host',
            time: '0:25 / 0:48'
        },
        {
            image: 'გუნდი/7.jpg',
            audio: 'audio_7.mp3',
            text: 'ჩვენ ვქმნით შთამაგონებელ გარემოს, ვორქშოფებსა და არტ-საღამოებს, რომლებიც ადამიანებს აკავშირებს და ავსებს შემოქმედებითი ენერგიით.',
            name: 'სანდრო',
            jobtitle: 'Creative Producer & Curator',
            time: '0:19 / 0:52'
        }
    ];

    let currentTwIdx = 0;
    let typeTimer = null;
    let isAudioPlaying = false;

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
                setTestimonial(idx);
            });

            twRibbon.appendChild(chip);
        });
    }

    // Soft low-toned iPhone typing click synthesizer
    let typingAudioCtx = null;
    function playIPhoneKeySound() {
        try {
            if (!typingAudioCtx) {
                const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
                if (AudioCtxClass) typingAudioCtx = new AudioCtxClass();
            }
            if (!typingAudioCtx) return;
            if (typingAudioCtx.state === 'suspended') {
                typingAudioCtx.resume().catch(() => {});
            }

            const now = typingAudioCtx.currentTime;
            
            const osc = typingAudioCtx.createOscillator();
            const gain = typingAudioCtx.createGain();
            const filter = typingAudioCtx.createBiquadFilter();

            // Warm low-mid iPhone keyboard click (~360Hz - 420Hz)
            const baseFreq = 380 + (Math.random() * 40 - 20);
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(baseFreq, now);
            osc.frequency.exponentialRampToValueAtTime(110, now + 0.024);

            // Soft lowpass filter to remove harsh highs
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(1500, now);
            filter.Q.setValueAtTime(1.5, now);

            // Subtle, warm gain envelope
            gain.gain.setValueAtTime(0.038, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.022);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(typingAudioCtx.destination);

            osc.start(now);
            osc.stop(now + 0.025);
        } catch (_) {}
    }

    const unlockAudio = () => {
        if (typingAudioCtx && typingAudioCtx.state === 'suspended') {
            typingAudioCtx.resume().catch(() => {});
        }
    };
    window.addEventListener('pointerdown', unlockAudio, { passive: true, once: true });
    window.addEventListener('touchstart', unlockAudio, { passive: true, once: true });

    function typewriteText(fullText) {
        clearInterval(typeTimer);
        if (!twText) return;
        twText.textContent = '';
        let charIndex = 0;

        function typeNext() {
            if (charIndex < fullText.length) {
                const char = fullText.charAt(charIndex);
                twText.textContent += char;
                charIndex++;
                
                // Play pleasant subtle iPhone typing sound
                if (char !== ' ' && char !== '\n') {
                    playIPhoneKeySound();
                }

                let speed = 25 + Math.random() * 8;
                if (char === '.' || char === '!' || char === '?') speed = 130;
                else if (char === ',') speed = 65;

                typeTimer = setTimeout(typeNext, speed);
            }
        }
        typeNext();
    }

    function setTestimonial(idx) {
        currentTwIdx = (idx + testimonials.length) % testimonials.length;
        const current = testimonials[currentTwIdx];

        if (twAvatar) twAvatar.src = current.image;
        if (twName) twName.textContent = current.name;
        if (twRole) twRole.textContent = current.jobtitle;
        if (twTime) twTime.textContent = current.time;

        typewriteText(current.text);

        const chips = Array.from(document.querySelectorAll('.tw-member-chip'));
        chips.forEach((c, i) => {
            if (i === currentTwIdx) c.classList.add('active');
            else c.classList.remove('active');
        });
    }

    if (twText) {
        setTestimonial(0);
    }

    if (twNextBtn) {
        twNextBtn.addEventListener('click', () => {
            setTestimonial(currentTwIdx + 1);
        });
    }

    if (twPrevBtn) {
        twPrevBtn.addEventListener('click', () => {
            setTestimonial(currentTwIdx - 1);
        });
    }

    if (twPlayBtn && twVisualizer && twPlayIcon) {
        twPlayBtn.addEventListener('click', () => {
            isAudioPlaying = !isAudioPlaying;
            if (isAudioPlaying) {
                twVisualizer.classList.add('playing');
                twPlayIcon.textContent = '❚❚';
                twPlayBtn.style.background = '#014d51';
            } else {
                twVisualizer.classList.remove('playing');
                twPlayIcon.textContent = '▶';
                twPlayBtn.style.background = '#016166';
            }
        });
    }

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

    function startManifestoTypewriter() {
        if (!manifestoTextElem) return;
        clearInterval(manifestoTypeTimer);
        manifestoTextElem.textContent = '';
        let charIndex = 0;

        function typeNextChar() {
            if (charIndex < manifestoFullText.length) {
                manifestoTextElem.textContent += manifestoFullText.charAt(charIndex);
                charIndex++;

                const char = manifestoFullText.charAt(charIndex - 1);
                let speed = 20;
                if (char === '.' || char === '!' || char === '?') speed = 120;
                else if (char === '—' || char === ',') speed = 55;

                manifestoTypeTimer = setTimeout(typeNextChar, speed);
            }
        }
        typeNextChar();
    }

    if (manifestoCard && 'IntersectionObserver' in window) {
        const obs = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    startManifestoTypewriter();
                }
            });
        }, { threshold: 0.25 });

        obs.observe(manifestoCard);
    } else {
        startManifestoTypewriter();
    }

    // About Audio Player
    const aboutPlayBtn = document.getElementById('about-play-btn');
    const aboutPlayIcon = document.getElementById('about-play-icon');
    const aboutPlayText = document.getElementById('about-play-text');
    const aboutVisualizer = document.getElementById('about-visualizer');
    const aboutAudioTime = document.getElementById('about-audio-time');
    let isAboutAudioPlaying = false;

    if (aboutPlayBtn && aboutVisualizer && aboutPlayIcon) {
        aboutPlayBtn.addEventListener('click', () => {
            isAboutAudioPlaying = !isAboutAudioPlaying;
            if (isAboutAudioPlaying) {
                aboutVisualizer.classList.add('playing');
                aboutPlayIcon.textContent = '❚❚';
                if (aboutPlayText) aboutPlayText.textContent = 'პაუზა';
                aboutPlayBtn.style.background = '#582847';
                if (aboutAudioTime) aboutAudioTime.textContent = '0:18 / 1:18';
            } else {
                aboutVisualizer.classList.remove('playing');
                aboutPlayIcon.textContent = '▶';
                if (aboutPlayText) aboutPlayText.textContent = 'მოსმენა';
                aboutPlayBtn.style.background = '#7a3963';
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
    // 6. GLASSMORPHISM BOOKING MODAL POPUP WINDOW ENGINE
    // ==========================================================================
    const bookingModalOverlay = document.getElementById('booking-modal-overlay');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const openModalButtons = document.querySelectorAll('.open-booking-modal-btn');

    function openBookingModal() {
        if (bookingModalOverlay) {
            bookingModalOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    function closeBookingModal() {
        if (bookingModalOverlay) {
            bookingModalOverlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    openModalButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            openBookingModal();
        });
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

        // Toggle chat window
        launcherBtn.addEventListener('click', () => {
            const isActive = chatWindow.classList.toggle('active');
            if (isActive) {
                if (launcherBadge) launcherBadge.style.display = 'none';
                if (chatInput) setTimeout(() => chatInput.focus(), 300);
            }
        });

        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                chatWindow.classList.remove('active');
            });
        }

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

            fetch(METAFORA_CHAT_WEBHOOK, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: query, sessionId: metaforaSessionId() })
            })
            .then(r => r.json())
            .then(data => {
                showTyping(false);
                const out = (data && data.output) ? data.output : 'ბოდიში, ვერ დაგიკავშირდი. სცადე ხელახლა ან დაგვირეკე: 📞 599 22 82 28';
                appendMessage('bot', formatBotHtml(out));
            })
            .catch(() => {
                showTyping(false);
                appendMessage('bot', '<p>ბოდიში, დროებითი შეფერხებაა 🙏 სცადე ხელახლა ან დაგვირეკე: 📞 599 22 82 28</p>');
            });
        }

        function generateBotResponse(input) {
            const q = input.toLowerCase();

            if (q.includes('რა არის') || q.includes('მეტაფორა') || q.includes('იდეა') || q.includes('კონცეფცია') || q.includes('about')) {
                return `<p>✨ <strong>მეტაფორა</strong> არის <em>Edutainment Hub &amp; Third Place</em> — მესამე ადგილი სახლსა და სამსახურს მიღმა!</p><p>ეს არის სივრცე პიროვნული ზრდისთვის, ინტელექტუალური დისკუსიებისთვის, ხელოვნებისთვის და შინაური, მყუდრო კომუნისთვის.</p>`;
            }

            if (q.includes('სერვის') || q.includes('მიმართულებ') || q.includes('რას გვთავაზობთ') || q.includes('service')) {
                return `<p>🌱 <strong>მეტაფორას 5 ძირითადი მიმართულება:</strong></p>
                <ol style=\"margin-left: 18px; margin-top: 6px; display: flex; flex-direction: column; gap: 4px;\">
                    <li><strong>1. Personal Development</strong> — პიროვნული ზრდა და ფსიქოლოგია;</li>
                    <li><strong>2. Business</strong> — B2B შეხვედრები &amp; ნეთვორქინგი;</li>
                    <li><strong>3. Think Tank</strong> — სალონური დისკუსიები &amp; დებატები;</li>
                    <li><strong>4. Art</strong> — Playback თეატრი &amp; არტ-თერაპია;</li>
                    <li><strong>5. Clubs</strong> — მესამე სივრცე &amp; Coworking Lounge.</li>
                </ol>`;
            }

            if (q.includes('თეატრ') || q.includes('playback') || q.includes('პლეიბექ') || q.includes('art') || q.includes('ხელოვნებ')) {
                return `<p>🎭 <strong>Playback თეატრი &amp; Art:</strong></p><p>Playback თეატრი არის ინტერაქციული იმპროვიზაციული ხელოვნება, სადაც მაყურებლების მიერ მოყოლილი ისტორიები და ემოციები სცენაზე ცოცხლდება. ეს არის საუკეთესო გზა ემოციური განტვირთვისა და თვითშემეცნებისთვის!</p>`;
            }

            if (q.includes('ჯავშან') || q.includes('დაჯავშნ') || q.includes('ადგილ') || q.includes('ფას') || q.includes('რეგისტრაცი') || q.includes('book')) {
                return `<p>📅 <strong>ადგილის დაჯავშნა:</strong></p><p>ადგილის დასაჯავშნად შეგიძლიათ გამოიყენოთ ღილაკი <strong>„ჯავშანი“</strong> ზედა მენიუში, ან გადახვიდეთ კონტაქტის სექციაში. ჩვენი გუნდი უმოკლეს დროში დაგიკავშირდებათ დეტალების შესათანხმებლად! ✨</p>`;
            }

            if (q.includes('გუნდ') || q.includes('ვინ ხართ') || q.includes('წევრ') || q.includes('team')) {
                return `<p>👥 <strong>მეტაფორას გუნდი:</strong></p><p>ჩვენს გუნდში არიან პოზიტიური ფსიქოთერაპევტები, ბიზნეს-მენტორები, Playback თეატრის მსახიობები და საზოგადოებრივი მოდერატორები. გაიცანით ჩვენი გუნდის სრული წრე მთავარი გვერდის გუნდის სექციაში!</p>`;
            }

            if (q.includes('ლოკაცი') || q.includes('სად') || q.includes('მისამართ') || q.includes('კონტაქტ') || q.includes('ტელეფონ') || q.includes('location')) {
                return `<p>📍 <strong>კონტაქტი &amp; ლოკაცია:</strong></p><p>მეტაფორა მდებარეობს თბილისში. <br>📞 ტელეფონი: <strong>+995 599 00 00 00</strong><br>✉️ ელ.ფოსტა: <strong>info@metafora.ge</strong><br>⏰ სამუშაო საათები: ყოველდღე 10:00 - 23:00.</p>`;
            }

            if (q.includes('გალერე') || q.includes('ფოტო') || q.includes('gallery')) {
                return `<p>🖼️ <strong>ფოტოგალერეა:</strong></p><p>გალერეის გვერდზე შეგიძლიათ იხილოთ მეტაფორას უნიკალური სივრცეები (შესასვლელი, მოზაიკა, Themed Bar, კლუბების ოთახი) და ჩვენი გუნდის ფოტოები!</p>`;
            }

            if (q.includes('ბლოგ') || q.includes('სტატი') || q.includes('blog')) {
                return `<p>📖 <strong>ბლოგი:</strong></p><p>ბლოგის გვერდზე გაეცნობით საინტერესო სტატიებს „მესამე ადგილის“ ფენომენზე, Playback თეატრის თერაპიულ ეფექტზე, ემოციურ ინტელექტსა და პიროვნულ ბალანსზე.</p>`;
            }

            return `<p>დიდი მადლობა შეკითხვისთვის! ✨</p><p>მეტაფორას შესახებ დამატებითი ინფორმაციისთვის შეგიძლიათ აირჩიოთ ერთ-ერთი სწრაფი ღილაკი ან დაგვიკავშირდეთ ნომერზე <strong>+995 599 00 00 00</strong>.</p>`;
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
        const toggleBtn = document.getElementById('mobile-menu-toggle-btn');
        const overlay = document.getElementById('mobile-nav-overlay');
        const closeBtn = document.getElementById('mobile-nav-close-btn');

        if (!toggleBtn || !overlay) return;

        toggleBtn.addEventListener('click', () => {
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        });

        const closeMenu = () => {
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        };

        if (closeBtn) closeBtn.addEventListener('click', closeMenu);

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeMenu();
        });

        // Accordion expand/collapse on category click
        overlay.querySelectorAll('.mobile-accordion-toggle').forEach(btn => {
            btn.addEventListener('click', (e) => {
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

        // Close drawer on navigation link click
        overlay.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                closeMenu();
            });
        });
    }

    // ==========================================================================
    // 17. SERVICE VIDEOS CONTROLLER (Desktop: Hover Only | Mobile: Centered Card Only)
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
                    const p = video.play();
                    if (p !== undefined) p.catch(() => {});
                }
            });

            card.addEventListener('mouseleave', () => {
                if (window.innerWidth > 992) {
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
                            }
                            activeMobilePlayingVideo = video;
                            const p = video.play();
                            if (p !== undefined) p.catch(() => {});
                        } else {
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

    initBUFigure();
    initManifestoSpinningFigure();
    initThemeSwitcher();
    initMetaBot();
    initMobileNav();
    initServiceVideoInteractions();

    // ==========================================================================
    // 18. ROBUST BILINGUAL I18N ENGINE (KA ⇄ EN)
    // ==========================================================================
    const I18N_DICTIONARY = {
        "მეტაფორა - Edutainment Hub & Third Place": "METAPHORA - Edutainment Hub & Third Place",
        "გალერეა - მეტაფორა": "Gallery - METAPHORA",
        "ბლოგი - მეტაფორა": "Blog - METAPHORA",
        "მთავარი": "Home",
        "🏠 მთავარი": "🏠 Home",
        "ჩვენს შესახებ": "About Us",
        "✨ ჩვენს შესახებ": "✨ About Us",
        "მანიფესტი & ფილოსოფია": "Manifesto & Philosophy",
        "📜 მანიფესტი & ფილოსოფია": "📜 Manifesto & Philosophy",
        "მესამე ადგილის კონცეფცია": "The Third Place Concept",
        "მეტაფორას გუნდი": "Metaphora Team",
        "👥 მეტაფორას გუნდი": "👥 Metaphora Team",
        "გაიცანით ჩვენი წევრები": "Meet Our Team",
        "სერვისები": "Services",
        "სერვისები & სივრცეები": "Services & Spaces",
        "🌱 სერვისები & სივრცეები": "🌱 Services & Spaces",
        "1. Edutainment & ვორქშოფები": "1. Edutainment & Workshops",
        "განათლება და პიროვნული ზრდა": "Education and Personal Growth",
        "2. პოზიტიური ფსიქოთერაპია": "2. Positive Psychotherapy",
        "ინდივიდუალური & ჯგუფური სესიები": "Individual & Group Sessions",
        "3. Playback თეატრი": "3. Playback Theatre",
        "იმპროვიზაციული არტ-პერფორმანსი": "Improvisational Art Performance",
        "4. Coworking & Quiet Lounge": "4. Coworking & Quiet Lounge",
        "კომფორტული სამუშაო სივრცე": "Comfortable Workspace & Quiet Zone",
        "5. Themed Bar & Community": "5. Themed Bar & Community",
        "სამაგიდო თამაშები & კოქტეილები": "Board Games & Cocktails",
        "გალერეა": "Gallery",
        "🖼️ გალერეა": "🖼️ Gallery",
        "ბლოგი": "Blog",
        "📖 ბლოგი": "📖 Blog",
        "კონტაქტი": "Contact",
        "📞 კონტაქტი": "📞 Contact",
        "ჯავშანი": "Book Now",
        "ონლაინ ჯავშანი": "Online Booking",
        "✨ ონლაინ ჯავშანი": "✨ Online Booking",
        "ადგილის დაჯავშნა": "Reserve a Spot",
        "ადგილის დაჯავშნა მეტაფორაში": "Reserve a Spot at Metaphora",
        "დაჯავშნე ადგილი": "Reserve a Spot",
        "დაჯავშნე ვიზიტი": "Book a Visit",
        "დაწყება": "Start",
        "შედი მეტაფორაში": "Enter Metaphora",
        "გადადი სივრცეში": "Explore Space",
        "გაიგე მეტი": "Learn More",
        "აღმოაჩინე მეტი": "Discover More",
        "სერვისების ნახვა": "View Services",
        "კონსულტაციის ჯავშანი": "Book Consultation",
        "გაიცანი სივრცე": "Explore Space",
        "გაიცანი წევრი": "Meet Member",
        "← მთავარ გვერდზე დაბრუნება": "← Back to Home Page",
        "✨ Edutainment Hub & Third Place": "✨ Edutainment Hub & Third Place",
        "💡 ორჯერ დააწკაპუნეთ წრეზე ან დააჭირეთ": "💡 Double-click any circle or click",
        "ღილაკს შესასვლელად": "button to enter",
        "იპოვე შენი შინაგანი ძალა": "Find your inner strength",
        "გაიზარდე & ითანამშრომლე": "Grow & collaborate",
        "გაიზარდე და შექმენი შესაძლებლობები": "Grow and create new opportunities",
        "სიღრმისეული სალონური დისკუსიები": "Deep salon discussions & debates",
        "შემოქმედებითი ენერგია & ხელოვნება": "Creative energy & artistic expression",
        "შენი მესამე სივრცე & კომუნა": "Your third place & community hub",
        "მანიფესტი, გუნდი & ფილოსოფია": "Manifesto, team & philosophy",
        "სივრცე, გუნდი & ღონისძიებები": "Spaces, team & vibrant events",
        "სიახლეები, სტატიები & იდეები": "Insights, articles & inspiring ideas",
        "შენი მესამე ადგილი — სახლსა და სამსახურს მიღმა": "Your Third Place — Beyond Home and Work",
        "„მეტაფორა“ არის უნიკალური სივრცე თბილისში, რომელიც აერთიანებს პიროვნულ განვითარებას, შემოქმედებას, სალონურ დისკუსიებსა და მეგობრულ გარემოს.": "“Metaphora” is a unique space in Tbilisi uniting personal development, creative arts, intellectual salon discussions, and a warm community.",
        "🎭 Playback თეატრი & არტ-პერფორმანსი": "🎭 Playback Theatre & Art Performance",
        "ცოცხალი იმპროვიზაცია და შენი ისტორიები სცენაზე": "Live Improvisation & Your Stories on Stage",
        "გახდი სპექტაკლის თანაავტორი. Playback თეატრი აცოცხლებს მაყურებლის რეალურ ემოციებსა და გამოცდილებას.": "Become a co-creator of the show. Playback Theatre brings real audience stories and emotions to life on stage.",
        "🧠 Think Tank & პოზიტიური ფსიქოთერაპია": "🧠 Think Tank & Positive Psychotherapy",
        "ინტელექტუალური დისკუსიები და პიროვნული ზრდა": "Intellectual Discussions & Personal Growth",
        "სიღრმისეული სალონური შეხვედრები, მენტორინგი და ფსიქოლოგიური მხარდაჭერა შინაგანი ჰარმონიისთვის.": "In-depth salon dialogues, mentorship, and psychological guidance for inner balance and harmony.",
        "ჩვენი ფილოსოფია": "Our Philosophy",
        "სივრცე, სადაც ყოველი დეტალი შენზეა მორგებული": "A space where every detail is tailored for you",
        "მეტაფორა არის გარემო, სადაც იდეები ცოცხლდებიან": "Metaphora is an environment where ideas come to life",
        "და ადამიანები პოულობენ ახალ შესაძლებლობებს": "and people discover new possibilities and growth",
        "შექმნილია შთაგონებისთვის, განვითარებისა და ჰარმონიისთვის": "Crafted for inspiration, development, and harmony",
        "ღონისძიებების აფიშა & სიახლეები": "Events Schedule & Announcements",
        "აღმოაჩინეთ მეტაფორას უახლოესი ვორქშოფები, სპექტაკლები და შეხვედრები": "Discover Metaphora’s upcoming workshops, performances, and gatherings",
        "აღმოაჩინე „მეტაფორა“": "Discover “Metaphora”",
        "ეს არ არის უბრალოდ სივრცე — „მეტაფორა“ არის გარემო, სადაც იდეები ცოცხლდებიან, ხოლო ადამიანები და შესაძლებლობები ერთმანეთს პოულობენ.": "This is not just a space — “Metaphora” is an environment where ideas thrive and people connect with new opportunities.",
        "1. მეტაფორა Personal Development": "1. Metaphora Personal Development",
        "შინაგანი ძალა": "Inner Strength",
        "ზრდა & ბალანსი": "Growth & Balance",
        "იპოვე შენი შინაგანი ძალა. პიროვნული განვითარება, ფსიქოლოგიური მხარდაჭერა და თვითშემეცნება.": "Find your inner strength. Personal growth, psychological support, and deep self-discovery.",
        "2. მეტაფორა Business": "2. Metaphora Business",
        "შესაძლებლობები": "Opportunities",
        "ნეთვორქინგი": "Networking",
        "გაიზარდე, ითანამშრომლე და შექმენი ახალი შესაძლებლობები. ბიზნეს-კონტაქტები და პარტნიორობა.": "Grow, collaborate, and create new possibilities. Business connections and high-impact partnerships.",
        "3. მეტაფორა Think Tank": "3. Metaphora Think Tank",
        "დისკუსიები": "Discussions",
        "სალონური გარემო": "Salon Atmosphere",
        "ჩაერთე სიღრმისეულ სალონურ დისკუსიებში. ინტელექტუალური დებატები, იდეების გაზიარება და ანალიტიკა.": "Engage in deep salon discussions. Intellectual debates, insightful ideas, and analytical exchanges.",
        "4. მეტაფორა Art": "4. Metaphora Art",
        "შემოქმედება": "Creativity",
        "ხელოვნება & ენერგია": "Art & Energy",
        "დაიმუხტე შემოქმედებითი ენერგიითა და ხელოვნებით. Playback თეატრი, პერფორმანსები და გამოფენები.": "Energize through creative energy and art. Playback Theatre, live performances, and exhibitions.",
        "5. მეტაფორა Clubs": "5. Metaphora Clubs",
        "მესამე სივრცე": "Third Place",
        "შინაური გარემო ★": "Homey Vibe ★",
        "შენი „მესამე სივრცე“ — ადგილი, სადაც თავს ყოველთვის შინაურად იგრძნობ. თემატური კლუბები და კომუნა.": "Your “Third Place” — where you always feel at home. Themed community clubs and inspiring circles.",
        "🌱 1. Personal Development": "🌱 1. Personal Development",
        "💼 2. Business": "💼 2. Business",
        "🧠 3. Think Tank": "🧠 3. Think Tank",
        "🎨 4. Art & Playback თეატრი": "🎨 4. Art & Playback Theatre",
        "🏛️ 5. Clubs & Coworking": "🏛️ 5. Clubs & Coworking",
        "გაიცანი მეტაფორას გუნდი": "Meet the Metaphora Team",
        "პროფესიონალები, რომლებიც ქმნიან მეტაფორას ატმოსფეროს": "The dedicated professionals shaping Metaphora’s atmosphere",
        "გუნდის წევრები": "Team Members",
        "მეტაფორას მანიფესტი": "Metaphora Manifesto",
        "მოუსმინეთ ჩვენს ხმას და გაეცანით მეტაფორას ფილოსოფიას": "Listen to our voice and explore the philosophy behind Metaphora",
        "ხმოვანი აუდიო გზამკვლევი": "Voice Audio Guide",
        "დამფუძნებელი & ფასილიტატორი": "Founder & Facilitator",
        "პოზიტიური ფსიქოთერაპევტი": "Positive Psychotherapist",
        "Think Tank მოდერატორი": "Think Tank Moderator",
        "Playback თეატრის არტისტი": "Playback Theatre Artist",
        "Business & Partnerships Lead": "Business & Partnerships Lead",
        "Community Manager & Clubs Host": "Community Manager & Clubs Host",
        "Creative Producer & Curator": "Creative Producer & Curator",
        "დაგვიკავშირდით": "Get in Touch",
        "ჩვენ მზად ვართ გიპასუხოთ ნებისმიერ შეკითხვაზე": "We are ready to answer all your questions and welcome you",
        "მისამართი:": "Address:",
        "თბილისი, საქართველო": "Tbilisi, Georgia",
        "სამუშაო საათები:": "Working Hours:",
        "ორშაბათი - კვირა: 10:00 - 23:00": "Monday - Sunday: 10:00 - 23:00",
        "ტელეფონი:": "Phone:",
        "ელ.ფოსტა:": "Email:",
        "ყველა უფლება დაცულია": "All Rights Reserved",
        "ნავიგაცია": "Navigation",
        "სოციალური ქსელები": "Social Networks",
        "აირჩიეთ სასურველი სერვისი ან სივრცე": "Select your desired service or space",
        "აირჩიეთ სასურველი სერვისი, თარიღი და დრო — ჩვენი გუნდი მალე დაგიკავშირდებათ.": "Select your preferred service, date, and time — our team will contact you promptly.",
        "სახელი და გვარი": "Full Name",
        "თქვენი სახელი და გვარი": "Your Full Name",
        "ტელეფონის ნომერი": "Phone Number",
        "აირჩიეთ სერვისი": "Choose Service",
        "სერვისი / მიმართულება": "Service / Field",
        "თარიღი": "Date",
        "შეტყობინება / კომენტარი": "Message / Notes",
        "დამატებითი დეტალები, შეკითხვები...": "Additional details, questions...",
        "დაჯავშნის გაგზავნა": "Submit Reservation",
        "გაგზავნა": "Send",
        "დახურვა": "Close",
        "მეტაბოტი": "MetaBot",
        "ონლაინ ასისტენტი": "AI Online Guide",
        "🌿 რა არის მეტაფორა?": "🌿 What is Metaphora?",
        "🌱 სერვისები": "🌱 Services",
        "🎭 Playback თეატრი": "🎭 Playback Theatre",
        "📅 ონლაინ ჯავშანი": "📅 Online Booking",
        "📍 ლოკაცია & კონტაქტი": "📍 Location & Contact",
        "მეტაბოტი წერს...": "MetaBot is typing...",
        "სივრცეები & ღონისძიებები": "Spaces & Events",
        "მეტაფორას ფოტოგალერეა": "Metaphora Photo Gallery",
        "ფოტოკოლექცია": "Photo Collection",
        "მეტაფორას გალერეა": "Metaphora Gallery",
        "დაათვალიერეთ ჩვენი მრავალფუნქციური სივრცეები, არტ-საღამოები და გუნდის შემოქმედებითი პროცესი.": "Explore our multifunctional spaces, art evenings, and team’s creative journey.",
        "დაათვალიერეთ ჩვენი სივრცეები, შემოქმედებითი გუნდი და დაუვიწყარი ღონისძიებები.": "Explore our spaces, creative team, and unforgettable events.",
        "ყველა ფოტო": "All Photos",
        "✨ ყველა ფოტო": "✨ All Photos",
        "გუნდი": "Team",
        "👥 გუნდის წევრები": "👥 Team Members",
        "ღონისძიებები & თეატრი": "Events & Theatre",
        "🎭 ღონისძიებები & თეატრი": "🎭 Events & Theatre",
        "სივრცეები & ლაუნჯი": "Spaces & Lounge",
        "🏛️ სივრცეები & ლაუნჯი": "🏛️ Spaces & Lounge",
        "სტატიები & ფიქრები": "Articles & Insights",
        "მეტაფორას ბლოგი": "Metaphora Blog",
        "გაეცანით საინტერესო მოსაზრებებს ფსიქოლოგიაზე, მესამე ადგილის კონცეფციასა და თვითგანვითარებაზე.": "Read inspiring perspectives on psychology, the Third Place concept, and personal growth.",
        "🌟 რჩეული სტატია • 5 წთ საკითხავი": "🌟 Featured Article • 5 min read",
        "რა არის „მესამე ადგილი“ და რატომ სჭირდება ის თანამედროვე ადამიანს?": "What is the “Third Place” and why do modern people need it?",
        "სოციოლოგი რეი ოლდენბურგის თეორიით, ადამიანის ბედნიერებისთვის აუცილებელია მესამე სივრცე — ადგილი სახლსა და სამსახურს მიღმა, სადაც არ არის იერარქია, სადაც ურთიერთობა არის მარტივი და შთამაგონებელი.": "According to sociologist Ray Oldenburg’s theory, a third space beyond home and work is vital for human fulfillment — a place free from hierarchy, where connection is simple and inspiring.",
        "ავტორი: მეტაფორას გუნდი": "Author: Metaphora Team",
        "თეატრი & ემოცია • 4 წთ": "Theatre & Emotion • 4 min",
        "Playback თეატრის მაგია და არტ-თერაპია": "The Magic of Playback Theatre & Art Therapy",
        "როგორ ეხმარება იმპროვიზაციული თეატრი საკუთარი ისტორიების გარედან დანახვას, ემოციების გაცნობიერებასა და სტრესის განმუხტვას.": "How improvisational theatre helps reflect on personal stories from outside, process emotions, and relieve stress.",
        "ფსიქოლოგია • 6 წთ": "Psychology • 6 min",
        "პოზიტიური ფსიქოთერაპიის 5 ოქროს წესი": "5 Golden Rules of Positive Psychotherapy",
        "როგორ შევხედოთ პრობლემებს არა როგორც დაბრკოლებას, არამედ როგორც ზრდისა და განვითარების რესურსს.": "How to view challenges not as barriers, but as resources for growth and personal development.",
        "პროდუქტიულობა • 3 წთ": "Productivity • 3 min",
        "როგორ შევქმნათ Deep Work გარემო?": "How to Create a Deep Work Environment?",
        "რატომ არის მნიშვნელოვანი მყუდრო Coworking სივრცე ყოველდღიური კონცენტრაციისა და ახალი იდეების დაბადებისთვის.": "Why a cozy Coworking space is essential for daily focus and sparking innovative ideas.",
        "კომუნა • 4 წთ": "Community • 4 min",
        "სამაგიდო თამაშები როგორც სოციალური ხიდი": "Board Games as a Social Bridge",
        "რატომ გვაახლოებს ინტელექტუალური თამაშები და როგორ ქმნის ის უსაფრთხო გარემოს ახალი ნაცნობობისთვის.": "Why intellectual board games bring us closer and create a welcoming environment for new friendships.",
        "თვითგამოხატვა • 5 წთ": "Self-Expression • 5 min",
        "არტ-თერაპია და შინაგანი ბალანსი": "Art Therapy & Inner Balance",
        "ფერებითა და ფორმებით თვითგამოხატვა მათთვისაც, ვისაც ჰგონია, რომ ხატვა არ ეხერხება.": "Expressing yourself through colors and forms — even for those who think they can’t paint.",
        "წიგნების კლუბი • 4 წთ": "Book Club • 4 min",
        "რას ვკითხულობთ ამ თვეში მეტაფორაში?": "What are we reading this month at Metaphora?",
        "თვიური რეკომენდაციები, საკითხავი სიები და დისკუსიების ანონსი ჩვენი წიგნის კლუბიდან.": "Monthly book recommendations, reading lists, and discussion announcements from our book club."
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
        if (node.nodeType === Node.TEXT_NODE) {
            const raw = node.nodeValue.trim();
            if (!raw) return;

            if (targetLang === 'EN') {
                if (I18N_DICTIONARY[raw]) {
                    if (!node._originalKa) node._originalKa = raw;
                    node.nodeValue = node.nodeValue.replace(raw, I18N_DICTIONARY[raw]);
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

            if (node.placeholder) {
                const p = node.placeholder.trim();
                if (targetLang === 'EN' && I18N_DICTIONARY[p]) {
                    if (!node._origPlace) node._origPlace = p;
                    node.placeholder = I18N_DICTIONARY[p];
                } else if (targetLang === 'KA' && node._origPlace) {
                    node.placeholder = node._origPlace;
                }
            }

            node.childNodes.forEach(child => translateDOMNodes(child, targetLang));
        }
    }

    function setLanguage(lang, save = true) {
        document.querySelectorAll('.lang-label, #lang-active-label').forEach(lbl => {
            lbl.textContent = lang;
        });
        document.querySelectorAll('.lang-single-btn, #lang-toggle-btn').forEach(btn => {
            btn.setAttribute('title', lang === 'KA' ? 'ენა: KA (დააწკაპუნეთ ინგლისურზე გადასართავად)' : 'Language: EN (Click to switch to Georgian)');
        });
        document.documentElement.setAttribute('lang', lang.toLowerCase());

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
            if (typeof setTestimonial === 'function' && typeof currentTwIdx !== 'undefined') setTestimonial(currentTwIdx);
            if (typeof renderAfishaCards === 'function') renderAfishaCards();

            // Update MetaBot welcome msg
            const firstBotMsg = document.querySelector('.metabot-msg.bot-msg .metabot-msg-bubble');
            if (firstBotMsg) {
                firstBotMsg.innerHTML = dynData.botWelcome;
            }
        }
    }

    function initI18nLanguageSwitcher() {
        const langToggleBtns = document.querySelectorAll('.lang-single-btn, #lang-toggle-btn');
        const savedLang = localStorage.getItem('metafora_lang') || 'KA';
        
        if (savedLang === 'EN') {
            setLanguage('EN', false);
        } else {
            document.querySelectorAll('.lang-label, #lang-active-label').forEach(lbl => {
                lbl.textContent = 'KA';
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
