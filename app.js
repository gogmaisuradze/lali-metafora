/* app.js - Botanical 3D Dandelion Flower, Kinetic Image-Text Reveal, Stagger Cards, Team & Glassmorphism Booking Modal */

// ==========================================================================
// TOP-LEVEL PERSISTENT UI CLICK SOUND ENGINE (მონაცვლეობითი ხმები: კნ1, კნ2, კნ3)
// ==========================================================================
(function initGlobalInteractiveClickSounds() {
    const soundFiles = ['kn1.mp3', 'kn2.mp3', 'kn3.mp3'];
    let currentSoundIndex = parseInt(sessionStorage.getItem('metafora_sound_idx') || '0', 10) % 3;
    if (isNaN(currentSoundIndex)) currentSoundIndex = 0;
    let lastPlayedTime = 0;

    let audioCtx = null;
    const audioBuffers = [null, null, null];
    let isPreloading = false;

    const getAudioContext = () => {
        if (!audioCtx) {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (AudioContextClass) {
                audioCtx = new AudioContextClass();
            }
        }
        if (audioCtx && audioCtx.state === 'suspended') {
            audioCtx.resume().catch(() => {});
        }
        return audioCtx;
    };

    // Preload and decode audio buffers for zero latency
    const preloadBuffers = () => {
        if (isPreloading) return;
        isPreloading = true;
        const ctx = getAudioContext();
        if (!ctx) return;

        soundFiles.forEach((file, index) => {
            fetch(file)
                .then(r => r.arrayBuffer())
                .then(buf => ctx.decodeAudioData(buf))
                .then(decoded => {
                    audioBuffers[index] = decoded;
                })
                .catch(() => {});
        });
    };

    // Fallback HTML5 Audio pool with iOS playsinline
    const audioPool = soundFiles.map(file => {
        const a = new Audio(file);
        a.preload = 'auto';
        a.volume = 0.40;
        a.setAttribute('playsinline', '');
        a.setAttribute('webkit-playsinline', '');
        return a;
    });

    const playNextClickSound = () => {
        const now = Date.now();
        if (now - lastPlayedTime < 45) return; // Prevent double-trigger on rapid touch+pointer+click
        lastPlayedTime = now;

        const soundIdx = currentSoundIndex;
        currentSoundIndex = (currentSoundIndex + 1) % soundFiles.length;
        try { sessionStorage.setItem('metafora_sound_idx', currentSoundIndex); } catch(e) {}

        const ctx = getAudioContext();
        if (ctx && audioBuffers[soundIdx]) {
            try {
                const source = ctx.createBufferSource();
                source.buffer = audioBuffers[soundIdx];
                const gainNode = ctx.createGain();
                gainNode.gain.value = 0.40;
                source.connect(gainNode);
                gainNode.connect(ctx.destination);
                source.start(0);
                return;
            } catch (err) {}
        }

        // HTML5 fallback for mobile devices
        try {
            const audio = audioPool[soundIdx];
            if (audio) {
                const clone = audio.cloneNode();
                clone.volume = 0.40;
                const p = clone.play();
                if (p !== undefined) p.catch(() => {});
            }
        } catch (e) {}
    };

    // Force-unlock iOS WebKit Audio hardware on first touch/click
    const unlockAudioIOS = () => {
        const ctx = getAudioContext();
        if (ctx) {
            if (ctx.state === 'suspended') {
                ctx.resume().catch(() => {});
            }
            try {
                const buffer = ctx.createBuffer(1, 1, 22050);
                const source = ctx.createBufferSource();
                source.buffer = buffer;
                source.connect(ctx.destination);
                source.start(0);
            } catch (e) {}
        }
        preloadBuffers();
    };

    ['touchstart', 'touchend', 'pointerdown', 'mousedown', 'keydown', 'click'].forEach(evt => {
        window.addEventListener(evt, unlockAudioIOS, { once: true, capture: true, passive: true });
    });

    // Check if target or ancestor is interactive
    function isInteractiveTarget(target) {
        if (!target || target === document.body || target === document.documentElement) return false;

        // Tags & interactive roles
        if (target.closest('a, button, select, input, textarea, summary, details, label, [role="button"], [role="link"], [role="tab"], [role="menuitem"], [role="checkbox"], [role="radio"]')) {
            return true;
        }

        // Navigation and menu items
        if (target.closest('.nav-item, .dropdown-link, .mobile-nav-item, .mobile-accordion-toggle, .mobile-dropdown-link, .mobile-nav-close, .mobile-menu-toggle-btn, .mobile-brand-logo, .brand-logo, .brand-wrapper')) {
            return true;
        }

        // Cards, buttons, chips, modals, players
        if (target.closest('.open-booking-modal-btn, .modal-close-btn, .btn-modal-submit, .bank-app-btn, .lang-single-btn, .theme-toggle-btn, .search-toggle-btn, .search-close-btn, .metabot-launcher-btn, .metabot-close-btn, .metabot-send-btn, .metabot-chip, .filter-btn, .audio-badge-play-btn, .tw-audio-play-btn, .tw-nav-btn, .tw-member-chip, .stagger-nav-btn, .stagger-card, .afisha-card, .card-explore-btn, .read-more-btn, .portal-btn, .portal-contact-btn, .dandelion-node, .center-circular-hub, .dot, .faq-item, .accordion-header, .gallery-item, .service-card, .blog-card, .blog-post-card, .blog-read-more-btn, .article-reader-close-btn, .btn, .clickable')) {
            return true;
        }

        if (target.closest('[onclick], [data-action], [data-filter], [data-index]')) {
            return true;
        }

        try {
            if (window.getComputedStyle(target).cursor === 'pointer') return true;
        } catch(e) {}

        return false;
    }

    // Touchstart event for immediate zero-lag sound response on mobile
    document.addEventListener('touchstart', (e) => {
        if (isInteractiveTarget(e.target)) {
            unlockAudioIOS();
            playNextClickSound();
        }
    }, { capture: true, passive: true });

    // Pointerdown / mousedown event for desktop & mouse devices
    document.addEventListener('pointerdown', (e) => {
        if (isInteractiveTarget(e.target)) {
            unlockAudioIOS();
            playNextClickSound();
        }
    }, { capture: true, passive: true });

    // Click event fallback for keyboard or assistive navigation
    document.addEventListener('click', (e) => {
        if (isInteractiveTarget(e.target)) {
            unlockAudioIOS();
            playNextClickSound();
        }
    }, { capture: true, passive: true });

    // Smooth navigation delay for cross-page navigation links so the sound completes
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a[href]');
        if (!link) return;
        const href = link.getAttribute('href');
        if (!href || href.startsWith('#') || href.startsWith('javascript:') || href.startsWith('tel:') || href.startsWith('mailto:') || link.target === '_blank' || e.metaKey || e.ctrlKey || e.shiftKey) {
            return;
        }

        // It is an internal page transition (e.g. blog.html, gallery.html, services.html, service-*.html)
        e.preventDefault();
        playNextClickSound();
        setTimeout(() => {
            window.location.href = href;
        }, 80);
    }, false);

    window.playNextClickSound = playNextClickSound;
    window.playClickSound = playNextClickSound;

    preloadBuffers();
})();

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
                if (typeof window.playNextClickSound === 'function') {
                    window.playNextClickSound();
                }
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
            centerCard.addEventListener('pointerdown', () => {
                if (typeof window.playNextClickSound === 'function') window.playNextClickSound();
            });

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

    function renderAfishaCards() {
        if (!staggerTrack) return;
        staggerTrack.innerHTML = '';
        staggerCardDoms.length = 0;
        const currentLang = localStorage.getItem('metafora_lang') || 'KA';
        const bookBtnText = currentLang === 'EN' ? 'Book Now' : 'დაჯავშნა';

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
                    <button class="open-booking-modal-btn btn btn-primary" style="padding: 4px 14px; font-size: 0.78rem;">${bookBtnText}</button>
                </div>
            `;

            card.addEventListener('click', () => {
                const currentPos = getPositionOf(originalIndex);
                moveStagger(currentPos);
            });

            staggerTrack.appendChild(card);
            staggerCardDoms.push(card);
        });

        updateStaggerLayout();
    }

    if (staggerTrack) {
        renderAfishaCards();
    }

    function getCardDimensions() {
        const isMobile = window.innerWidth <= 640;
        const width = isMobile ? Math.min(310, window.innerWidth - 44) : 365;
        const height = isMobile ? 360 : 365;
        return { width, height, isMobile };
    }

    function getPositionOf(originalIdx) {
        const orderIdx = eventOrder.indexOf(originalIdx);
        const len = eventOrder.length;
        return len % 2 ? orderIdx - Math.floor(len / 2) : orderIdx - len / 2;
    }

    function updateStaggerLayout() {
        if (!staggerTrack) return;
        const { width: cardW, height: cardH, isMobile } = getCardDimensions();
        const len = eventOrder.length;

        eventOrder.forEach((originalIdx, orderIdx) => {
            const position = len % 2
                ? orderIdx - Math.floor(len / 2)
                : orderIdx - len / 2;

            const isCenter = position === 0;
            const cardDom = staggerCardDoms[originalIdx];
            if (!cardDom) return;

            cardDom.style.width = `${cardW}px`;
            cardDom.style.height = `${cardH}px`;

            const translateX = (cardW / (isMobile ? 1.45 : 1.5)) * position;
            const translateY = isCenter ? (isMobile ? -36 : -60) : (position % 2 ? (isMobile ? 18 : 15) : (isMobile ? -8 : -15));
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
            jobtitle: 'ფსიქოთერაპევტი, ტრენერი & ასოციაციის პრეზიდენტი',
            facebook: 'https://www.facebook.com/lali.badridze',
            instagram: 'https://www.instagram.com/lali_badridze/',
            whatsapp: 'https://wa.me/995599228228',
            time: '0:00 / 1:20'
        },
        {
            image: 'გუნდი/2.jpg',
            audio: 'galaktion.mp3',
            galaktionStart: 11.5,
            text: 'პერსონალური ქოუჩინგი, პიროვნული განვითარების ტრენინგები და პოზიტიური ფსიქოკონსულტირება ეხმარება ადამიანებს შინაგანი ძალის, ბალანსისა და ჰარმონიის პოვნაში.',
            name: 'ქეთი',
            fullname: 'ქეთი ჟვანია',
            jobtitle: 'ქოუჩინგი, ტრენინგები & ფსიქოკონსულტირება',
            facebook: 'https://www.facebook.com/profile.php?id=100054981263056',
            instagram: 'https://www.instagram.com/kety_zhvania_tyson/',
            whatsapp: 'https://wa.me/995599228228',
            time: '0:11 / 1:20'
        },
        {
            image: 'გუნდი/3.jpg',
            audio: 'galaktion.mp3',
            galaktionStart: 23.0,
            text: 'პოზიტიური და ტრანსკულტურალური ფსიქოთერაპია ეხმარება ადამიანს საკუთარი შინაგანი შესაძლებლობების აღმოჩენასა და ცხოვრებისეული გამოწვევების რესურსად გარდაქმნაში.',
            name: 'ნათია',
            fullname: 'ნათია ქოდუა',
            jobtitle: 'პოზიტიური ფსიქოთერაპევტი & ფსიქოკონსულტანტი',
            facebook: 'https://www.facebook.com/natia.kodua.1',
            instagram: 'https://www.instagram.com/kodua.natia/',
            whatsapp: 'https://wa.me/995599228228',
            time: '0:23 / 1:20'
        },
        {
            image: 'გუნდი/4.jpg',
            audio: 'galaktion.mp3',
            galaktionStart: 34.5,
            text: 'ჩვენი მიზანია ადამიანებისა და ბიზნესების გაძლიერება პერსონალური და პროფესიული განვითარების, მართვის კონსალტინგისა და პრაქტიკული ქოუჩინგის გზით.',
            name: 'მარიკა',
            fullname: 'მარიკა ხალიანი',
            jobtitle: 'პერსონალური & ბიზნეს განვითარების ქოუჩი',
            facebook: 'https://www.facebook.com/marika.khaliani',
            instagram: 'https://www.instagram.com/marikakhaliani',
            whatsapp: 'https://wa.me/995599228228',
            time: '0:34 / 1:20'
        },
        {
            image: 'გუნდი/5.jpg',
            audio: 'galaktion.mp3',
            galaktionStart: 46.0,
            text: 'მეტაფორა Business აერთიანებს მეწარმეებსა და პროფესიონალებს ნაყოფიერი თანამშრომლობის, პარტნიორობისა და ახალი შესაძლებლობების შესაქმნელად.',
            name: 'ია',
            fullname: 'ია ხიდირბეგიშვილი',
            jobtitle: 'ბიზნეს განვითარება & პარტნიორობა',
            facebook: 'https://www.facebook.com/ia.khidirbegishvili',
            instagram: 'https://www.instagram.com/istudioatelia/',
            whatsapp: 'https://wa.me/995599228228',
            time: '0:46 / 1:20'
        },
        {
            image: 'გუნდი/6.jpg',
            audio: 'galaktion.mp3',
            galaktionStart: 57.5,
            text: 'მეტაფორა Clubs არის შენი „მესამე სივრცე“ — ადგილი, სადაც თავს ყოველთვის შინაურად, მყუდროდ და თავისუფლად იგრძნობ თანამოაზრეებთან ერთად.',
            name: 'თეო',
            fullname: 'თეო ფერაძე',
            jobtitle: 'ქოუჩინგი, ტრენინგები & ფსიქოკონსულტირება',
            facebook: 'https://www.facebook.com/teo.peradze.7',
            instagram: 'https://www.instagram.com/teo_peradze16/',
            whatsapp: 'https://wa.me/995599228228',
            time: '0:57 / 1:20'
        },
        {
            image: 'გუნდი/7.jpg',
            audio: 'galaktion.mp3',
            galaktionStart: 68.0,
            text: 'ჩვენ ვეხმარებით ადამიანებს შინაგანი რესურსების გააქტიურებაში, პიროვნულ ტრანსფორმაციასა და მიზნების მიღწევაში ქოუჩინგისა და პოზიტიური ფსიქოთერაპიის მეთოდებით.',
            name: 'ქეთი',
            fullname: 'ქეთი მირიანაშვილი',
            jobtitle: 'ფსიქოკონსულტანტი, ტრენერი & სერტიფიცირებული ქოუჩი',
            facebook: 'https://www.facebook.com/keti.mirianasvili',
            instagram: 'https://www.facebook.com/keti.mirianasvili',
            whatsapp: 'https://wa.me/995599228228',
            time: '1:08 / 1:20'
        },
        {
            image: 'გუნდი/8.jpg',
            audio: 'galaktion.mp3',
            galaktionStart: 0.0,
            text: 'პერსონალური ქოუჩინგი და პოზიტიური ფსიქოკონსულტირება ქმნის უსაფრთხო გარემოს თვითგამორკვევისთვის, შინაგანი რესურსების გააქტიურებისა და პიროვნული ზრდისთვის.',
            name: 'ია',
            fullname: 'ია ქარდავა',
            jobtitle: 'ქოუჩინგი, ტრენინგები & ფსიქოკონსულტირება',
            facebook: 'https://www.facebook.com/ia.kardava.3',
            instagram: 'https://www.instagram.com/metaphora.ge/',
            whatsapp: 'https://wa.me/995599228228',
            time: '0:00 / 1:20'
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

    function pauseGalaktionAudio() {
        if (galaktionAudio && !galaktionAudio.paused) {
            try { galaktionAudio.pause(); } catch(e) {}
        }
        isGalaktionPlaying = false;
        if (twVisualizer) twVisualizer.classList.remove('playing');
        if (twPlayIcon) twPlayIcon.textContent = '▶';
        if (twPlayBtn) twPlayBtn.style.background = '';
        if (twTime && testimonials && testimonials[currentTwIdx]) {
            twTime.textContent = testimonials[currentTwIdx].time || '0:00 / 1:20';
        }
    }
    window.pauseGalaktionAudio = pauseGalaktionAudio;

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

            galaktionAudio.addEventListener('play', () => {
                if (typeof window.pauseManifestoAudio === 'function') {
                    window.pauseManifestoAudio();
                }
                isGalaktionPlaying = true;
                if (twVisualizer) twVisualizer.classList.add('playing');
                if (twPlayIcon) twPlayIcon.textContent = '❚❚';
                if (twPlayBtn) twPlayBtn.style.background = '#014d51';
            });

            galaktionAudio.addEventListener('ended', () => {
                isGalaktionPlaying = false;
                if (twVisualizer) twVisualizer.classList.remove('playing');
                if (twPlayIcon) twPlayIcon.textContent = '▶';
                if (twPlayBtn) twPlayBtn.style.background = '';
                if (twTime && testimonials && testimonials[currentTwIdx]) {
                    twTime.textContent = testimonials[currentTwIdx].time || '0:00 / 1:20';
                }
            });

            galaktionAudio.addEventListener('pause', () => {
                if (!isGalaktionPlaying || galaktionAudio.paused) {
                    if (twVisualizer) twVisualizer.classList.remove('playing');
                    if (twPlayIcon) twPlayIcon.textContent = '▶';
                    if (twPlayBtn) twPlayBtn.style.background = '';
                }
            });
        }
    }

    function playGalaktionForMember(idx) {
        if (typeof window.pauseManifestoAudio === 'function') {
            window.pauseManifestoAudio();
        }
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
            if (typeof window.pauseManifestoAudio === 'function') {
                window.pauseManifestoAudio();
            }
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
            twSocialInsta.href = current.instagram || 'https://www.instagram.com/metaphora.ge/';
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
    const manifestoTexts = {
        KA: "ეს არ არის უბრალოდ სივრცე — „მეტაფორა“ არის გარემო, სადაც იდეები ცოცხლდებიან, ხოლო ადამიანები და შესაძლებლობები ერთმანეთს პოულობენ. აქ ყველაფერია შენი განვითარების, ახალი კონტაქტებისა და შთაგონებისთვის: Personal Development, Business, Think Tank, Art და Clubs.",
        EN: "This is more than just a space — “Metaphora” is an environment where ideas come to life, and people and opportunities find each other. Everything here is crafted for your growth, meaningful connections, and inspiration: Personal Development, Business, Think Tank, Art, and Clubs."
    };

    function getManifestoFullText() {
        const currentLang = localStorage.getItem('metafora_lang') || 'KA';
        return manifestoTexts[currentLang] || manifestoTexts.KA;
    }

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

        const currentFullText = getManifestoFullText();

        const manifestoQuote = document.querySelector('#manifesto-typewriter-card .tw-quote-mark');
        if (manifestoQuote) {
            manifestoQuote.style.opacity = manifestoSoundActive ? '1' : '0.4';
        }

        if (manifestoSoundActive) {
            startTwTypingAudio();
        }

        function typeNextChar() {
            if (charIndex < currentFullText.length) {
                const char = currentFullText.charAt(charIndex);
                manifestoTextElem.textContent += char;
                charIndex++;

                const prevChar = currentFullText.charAt(charIndex - 1);
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

    function pauseManifestoAudio() {
        if (manifestoAudio && !manifestoAudio.paused) {
            try { manifestoAudio.pause(); } catch (e) {}
        }
        if (aboutVisualizer) aboutVisualizer.classList.remove('playing');
        if (aboutPlayIcon) aboutPlayIcon.textContent = '▶';
        if (aboutPlayText) aboutPlayText.textContent = 'მოსმენა';
        if (aboutPlayBtn) aboutPlayBtn.style.background = '';
    }
    window.pauseManifestoAudio = pauseManifestoAudio;

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
            if (typeof window.pauseGalaktionAudio === 'function') {
                window.pauseGalaktionAudio();
            }
            if (aboutVisualizer) aboutVisualizer.classList.add('playing');
            if (aboutPlayIcon) aboutPlayIcon.textContent = '❚❚';
            if (aboutPlayText) aboutPlayText.textContent = 'პაუზა';
            aboutPlayBtn.style.background = 'var(--brand-plum)';
        });

        aboutPlayBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (manifestoAudio.paused) {
                if (typeof window.pauseGalaktionAudio === 'function') {
                    window.pauseGalaktionAudio();
                }
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
            img: 'მთავარის ფოტოები/ჩვენს შესახებ.jpeg',
            KA: {
                badge: '🌟 რჩეული სტატია • 5 წთ',
                duration: '5 წთ საკითხავი',
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
            EN: {
                badge: '🌟 Featured Article • 5 min',
                duration: '5 min read',
                title: 'What is the "Third Place" and Why Do We Need It Today?',
                author: 'Metaphora Team',
                date: 'August 2026',
                html: `
                    <p>In modern urban life, most people's daily routine oscillates between two primary anchors: <strong>Home</strong> (the First Place) and <strong>Work</strong> (the Second Place).</p>
                    <p>In 1989, renowned American urban sociologist <strong>Ray Oldenburg</strong> introduced a revolutionary concept — <em>"The Third Place"</em>. This is a public anchor where a person is unbound by household duties or workplace hierarchies.</p>
                    <blockquote>
                        “The third place is the anchor of community life. Where people converse as equals, authentic connections and inner freedom flourish.”
                    </blockquote>
                    <h3>Why is Metaphora Your Third Place?</h3>
                    <p>“Metaphora” was founded precisely around this vision — to be your third place in Tbilisi. A welcoming space where you can drop in, savor specialty coffee, read a book, join a salon discussion, or immerse yourself in live Playback Theatre improvisation.</p>
                    <div class="article-takeaway-box">
                        <h4>✨ 4 Core Pillars of a Third Place:</h4>
                        <ul>
                            <li><strong>Neutral Ground:</strong> No obligations or rigid social protocols;</li>
                            <li><strong>Leveler:</strong> Social status is left outside the door;</li>
                            <li><strong>Conversation is Key:</strong> Wholesome, stimulating, and heartfelt dialogue;</li>
                            <li><strong>A Home Away from Home:</strong> A warm sense of belonging and community.</li>
                        </ul>
                    </div>
                    <p>Visit us at Metaphora and discover your personal third place!</p>
                `
            }
        },
        'article-playback': {
            img: 'blog_playback.jpg',
            KA: {
                badge: '🎭 Playback თეატრი • 4 წთ',
                duration: '4 წთ საკითხავი',
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
            EN: {
                badge: '🎭 Playback Theatre • 4 min',
                duration: '4 min read',
                title: 'The Magic of Playback Theatre & Art Therapy',
                author: 'Art Facilitator • Metaphora',
                date: 'August 2026',
                html: `
                    <p>Imagine a theatre without predefined scripts, rehearsals, or fixed roles. The script is written in the present moment — through real stories shared by the audience.</p>
                    <p><strong>Playback Theatre</strong> is a unique form of interactive improvisation founded in 1975 by Jonathan Fox and Jo Salas. An audience member shares a personal memory, feeling, or dream, and actors together with a musician immediately transform it into a vivid stage enactment.</p>
                    <blockquote>
                        “Witnessing one’s own story reflected on stage offers a transformative realization: I am not alone; my voice and emotion truly matter.”
                    </blockquote>
                    <h3>How Does the Therapeutic Effect Work?</h3>
                    <p>When we observe our story from the outside, <em>empathetic reflection</em> occurs. Heavy burdens lose their toxicity, while joyful moments are deeply amplified.</p>
                    <div class="article-takeaway-box">
                        <h4>🎭 What You Experience at a Playback Evening:</h4>
                        <ul>
                            <li>Release of emotional tension and everyday stress;</li>
                            <li>Deeper understanding of oneself and others;</li>
                            <li>A safe, non-judgmental space for authentic self-expression;</li>
                            <li>The unforgettable warmth of collective co-creation.</li>
                        </ul>
                    </div>
                `
            }
        },
        'article-psychology': {
            img: 'blog_psychology.jpg',
            KA: {
                badge: '🧠 ფსიქოლოგია • 6 წთ',
                duration: '6 წთ საკითხავი',
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
            EN: {
                badge: '🧠 Psychology • 6 min',
                duration: '6 min read',
                title: '5 Golden Rules of Positive Psychotherapy',
                author: 'Positive Psychotherapist • Metaphora',
                date: 'August 2026',
                html: `
                    <p>Positive Psychotherapy (founded by Nossrat Peseschkian) is not about "toxic positivity" or denying hardships. The Latin root <em>Positum</em> translates to "the factual, the actual, that which is already given."</p>
                    <p>This modality views every individual as an inherently resourceful whole, already equipped with innate capacities to overcome life challenges.</p>
                    <blockquote>
                        “If you want something you never had, you must do something you've never done — by tapping into your intrinsic resources.”
                    </blockquote>
                    <div class="article-takeaway-box">
                        <h4>🌿 5 Golden Principles for Everyday Well-being:</h4>
                        <ul>
                            <li><strong>1. Symptoms are Signals:</strong> Anxiety or fatigue is your organism's gentle alert that something needs realigning;</li>
                            <li><strong>2. Balance Model:</strong> Body, Achievement, Contact, and Meaning — all four spheres require harmonious attention;</li>
                            <li><strong>3. Conflict as a Growth Resource:</strong> Differing perspectives unlock novel horizons;</li>
                            <li><strong>4. The Power of Metaphors:</strong> Parables and metaphors easily dissolve subconscious barriers;</li>
                            <li><strong>5. Capacity for Self-Help:</strong> The goal is empowering every person to become their own best therapist.</li>
                        </ul>
                    </div>
                `
            }
        },
        'article-coworking': {
            img: 'blog_coworking.jpg',
            KA: {
                badge: '☕ პროდუქტიულობა • 3 წთ',
                duration: '3 წთ საკითხავი',
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
            EN: {
                badge: '☕ Productivity • 3 min',
                duration: '3 min read',
                title: 'How to Create a Deep Work Environment?',
                author: 'Metaphora Team',
                date: 'August 2026',
                html: `
                    <p>In an era of relentless digital notifications, endless feeds, and fragmented attention, the ability to engage in concentrated deep work (Deep Work) has become a genuine superpower.</p>
                    <p>Research indicates that after an interruption, it takes the human brain an average of <strong>23 minutes</strong> to regain deep focus. That is why Metaphora's Coworking & Quiet Lounge is curated with minimalist aesthetics and serene acoustic balance.</p>
                    <div class="article-takeaway-box">
                        <h4>💡 3 Rules of Deep Work at Metaphora:</h4>
                        <ul>
                            <li><strong>90-Minute Focus Blocks:</strong> Uninterrupted creative momentum;</li>
                            <li><strong>Sensory Serenity:</strong> Soft natural lighting, artisanal herbal teas, and ergonomic comfort;</li>
                            <li><strong>Rest as a Sacred Ritual:</strong> Recharging your mind in our art & mosaic lounge between deep sprints.</li>
                        </ul>
                    </div>
                `
            }
        },
        'article-community': {
            img: 'blog_boardgames.jpg',
            KA: {
                badge: '🍸 კომუნა • 4 წთ',
                duration: '4 წთ საკითხავი',
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
            EN: {
                badge: '🍸 Community • 4 min',
                duration: '4 min read',
                title: 'Board Games as a Social Bridge',
                author: 'Clubs Host • Metaphora',
                date: 'August 2026',
                html: `
                    <p>Why are modern board games one of the fastest and most natural catalysts for building genuine friendships?</p>
                    <p>Board games create a <em>"safe magic circle"</em>. When gathered around the table, awkward small talk disappears — game mechanics and playful strategy naturally spark shared laughter, wits, and collaboration.</p>
                    <blockquote>
                        “In gameplay, human character, strategic instincts, and empathy reveal themselves far quicker than in conventional conversation.”
                    </blockquote>
                    <p>At Metaphora's Themed Bar, over 50 premier world tabletop games await you — from deep strategy euro-games to lively social party favorites!</p>
                `
            }
        },
        'article-art-therapy': {
            img: 'blog_art_therapy.jpg',
            KA: {
                badge: '🎨 თვითგამოხატვა • 5 წთ',
                duration: '5 წთ საკითხავი',
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
            EN: {
                badge: '🎨 Creative Expression • 5 min',
                duration: '5 min read',
                title: 'Art Therapy & Emotional Harmony',
                author: 'Art Therapist • Metaphora',
                date: 'August 2026',
                html: `
                    <p>“I don't know how to draw” — this is the most frequent statement heard before starting an art therapy session. Yet the essence of art therapy is that <strong>aesthetic judgment does not exist here</strong>.</p>
                    <p>Colors, lines, textures, and brushstrokes are direct projections of our internal emotional landscape. When words fail to articulate our feelings, canvas and paints become our most honest translators.</p>
                    <div class="article-takeaway-box">
                        <h4>🎨 Benefits of Regular Art Therapy Sessions:</h4>
                        <ul>
                            <li>Release of deep somatic tension and intrusive thoughts;</li>
                            <li>Activation of creative problem solving and imagination;</li>
                            <li>A renewed sense of inner lightness and authentic joy;</li>
                            <li>Safe emotional catharsis through color and texture.</li>
                        </ul>
                    </div>
                `
            }
        },
        'article-book-club': {
            img: 'blog_book_club.jpg',
            KA: {
                badge: '📚 წიგნის კლუბი • 4 წთ',
                duration: '4 წთ საკითხავი',
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
            },
            EN: {
                badge: '📚 Book Club • 4 min',
                duration: '4 min read',
                title: 'What Are We Reading This Month at Metaphora?',
                author: 'Book Club Moderator • Metaphora',
                date: 'August 2026',
                html: `
                    <p>Metaphora Book Club selects one standout book every month that explores human connection, philosophical depth, and personal transformation.</p>
                    <p>At month's end, we gather in our cozy salon over warm tea and ambient acoustic melodies to discuss key insights, character arcs, and practical takeaways for our everyday lives.</p>
                    <div class="article-takeaway-box">
                        <h4>📖 Current Month Reading Highlights:</h4>
                        <ul>
                            <li><strong>Ray Oldenburg:</strong> <em>“The Great Good Place”</em> — The sociology of third places;</li>
                            <li><strong>Viktor Frankl:</strong> <em>“Man’s Search for Meaning”</em> — Logotherapy and inner resilience;</li>
                            <li><strong>Mihaly Csikszentmihalyi:</strong> <em>“Flow”</em> — The psychology of optimal experience.</li>
                        </ul>
                    </div>
                    <p>Join us at our upcoming gathering and share your perspective!</p>
                `
            }
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

        let currentOpenArticleId = null;

        function openArticle(id, targetLang) {
            const lang = targetLang || (localStorage.getItem('metafora_lang') || 'KA');
            const rawArticle = ARTICLES_DATABASE[id] || ARTICLES_DATABASE['article-featured'];
            if (!rawArticle) return;

            currentOpenArticleId = id;
            const articleData = rawArticle[lang] || rawArticle['KA'] || rawArticle;

            if (topicBadge) topicBadge.textContent = articleData.badge;
            if (durationEl) durationEl.textContent = articleData.duration;
            if (heroImg) {
                heroImg.src = rawArticle.img || articleData.img;
                heroImg.alt = articleData.title;
            }
            if (titleEl) titleEl.textContent = articleData.title;
            if (authorEl) authorEl.textContent = articleData.author;
            if (dateEl) dateEl.textContent = articleData.date;
            if (contentEl) contentEl.innerHTML = articleData.html;

            // Translate static elements inside drawer footer CTA
            if (typeof translateDOMNodes === 'function') {
                const footerCta = overlay.querySelector('.article-reader-footer-cta');
                if (footerCta) translateDOMNodes(footerCta, lang);
            }

            overlay.classList.add('active');
            overlay.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
        }

        function closeArticle() {
            currentOpenArticleId = null;
            overlay.classList.remove('active');
            overlay.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
        }

        window.refreshActiveArticleLanguage = function(newLang) {
            if (currentOpenArticleId && overlay && overlay.classList.contains('active')) {
                openArticle(currentOpenArticleId, newLang);
            }
        };

        document.addEventListener('click', (e) => {
            const card = e.target.closest('.blog-post-card[data-article-id]');
            if (card && !e.target.closest('.open-booking-modal-btn')) {
                e.preventDefault();
                const articleId = card.getAttribute('data-article-id');
                const curLang = localStorage.getItem('metafora_lang') || 'KA';
                openArticle(articleId, curLang);
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
        "„მესამე ადგილი“ არის სოციალური თავშესაფარი სახლსა და სამსახურს მიღმა. მეტაფორა Clubs გთავაზობთ მყუდრო Coworking ზონას დღისით, ხოლო საღამოს — თემატურ სამაგიდო თამაშებს, წიგნის კლუბსა და საავტორო სასმელების Themed Bar-ს.": "The 'Third Place' is a social sanctuary beyond home and work. Metaphora Clubs offers daytime coworking, followed by evening board games, book clubs, and an artisanal themed bar.",
        "თანამედროვე სამყაროში იშვიათია ადგილი, სადაც აჩქარების გარეშე, არგუმენტირებულად და სიღრმისეულად მსჯელობენ კულტურაზე, ფილოსოფიაზე, სოციალურ ტენდენციებსა და მომავლის ხედვებზე. მეტაფორას სალონი სწორედ ამისთვის შეიქმნა.": "In a fast-paced world, places for unhurried, nuanced discussions on culture, philosophy, and future trends are rare. Metaphora Salon was crafted for this purpose.",
        "„მეტაფორას“ პიროვნული განვითარების მიმართულება შექმნილია მათთვის, ვისაც სურს საკუთარი პოტენციალის აღმოჩენა, სტრესის დაძლევა და შინაგანი რესურსების გააქტიურება. ჩვენ გთავაზობთ პროფესიულ, ეთიკურ და მზრუნველ გარემოს.": "Metaphora Personal Development is designed for those seeking to discover their potential, overcome stress, and activate inner resilience in a caring setting.",
        "გაიზარდე, ითანამშრომლე და შექმენი ახალი შესაძლებლობები. მეტაფორა Business აერთიანებს მეწარმეებს, სტარტაპებსა და კორპორატიულ პროფესიონალებს ნდობასა და საერთო ღირებულებებზე დაფუძნებულ ეკოსისტემაში.": "Grow, collaborate, and create new opportunities. Metaphora Business unites entrepreneurs and corporate innovators into a values-driven ecosystem.",
        "ბიზნესი არის ურთიერთობები და ნდობა. მეტაფორა Business აერთიანებს სტარტაპერებს, მეწარმეებს, კორპორატიულ ლიდერებსა და ინოვატორებს საერთო ეკოსისტემაში ახალი პარტნიორობებისა და იდეების დასაბადებლად.": "Business is built on relationships and trust. Metaphora Business unites founders, entrepreneurs, and leaders into a shared ecosystem to foster strategic partnerships.",
        "სოციოლოგი რეი ოლდენბურგის თეორიით, ადამიანის ბედნიერებისთვის აუცილებელია მესამე სივრცე — ადგილი სახლსა და სამსახურს მიღმა, სადაც არ არის იერარქია, სადაც ურთიერთობა არის მარტივი და შთამაგონებელი.": "According to sociologist Ray Oldenburg, human happiness thrives on having a Third Place — a sanctuary beyond home and work without hierarchies, where socializing is effortless and inspiring.",
        "მეტაფორა Think Tank აცოცხლებს კლასიკურ სალონურ კულტურას თანამედროვე ფორმატით. ეს არის ადგილი თავისუფალი აზროვნებისთვის, ფილოსოფიური დიალოგებისთვის და აქტუალური თემების სიღრმისეული ანალიზისთვის.": "Metaphora Think Tank revives classic salon culture in a modern setting — a sanctuary for free thought, philosophical dialogue, and critical analysis of key cultural and scientific ideas.",
        "ხელოვნება მეტაფორაში არ არის მხოლოდ საყურებელი — ის არის თანამონაწილეობისა და ემოციური გარდაქმნის პროცესი. Playback თეატრისა და არტ-თერაპიის მეშვეობით მაყურებელი ხდება სპექტაკლის თანაავტორი.": "Art at Metaphora is an interactive journey of emotional transformation. Through Playback theatre and art therapy, audiences become co-creators.",
        "იპოვე შენი შინაგანი ძალა და ემოციური ბალანსი. მეტაფორას პიროვნული განვითარების მიმართულება აერთიანებს პოზიტიურ ფსიქოთერაპიას, თვითშემეცნების პრაქტიკებსა და სტრესის მართვის ავტორულ სესიებს.": "Find your inner strength and emotional balance. Metaphora Personal Development brings together positive psychotherapy, mindfulness practices, and stress resilience sessions.",
        "მეტაფორა Business აერთიანებს მეწარმეებს, სტარტაპერებსა და დარგის წამყვან პროფესიონალებს. ჩვენ ვქმნით პლატფორმას იდეების რეალიზაციისთვის, სტრატეგიული პარტნიორობისა და მასტერმაინდისთვის.": "Metaphora Business brings together entrepreneurs, innovators, and industry leaders to foster strategic collaborations, mastermind circles, and business growth.",
        "ხელოვნება მეტაფორაში არის თვითგამოხატვისა და ემოციური ტრანსფორმაციის მთავარი ინსტრუმენტი. Playback თეატრი, არტ-თერაპია და შემოქმედებითი პერფორმანსები ქმნის დაუვიწყარ გამოცდილებას.": "Art at Metaphora is the primary catalyst for self-expression and emotional transformation. Playback theatre, art therapy, and performances create unforgettable communal experiences.",
        "ჩაერთე სიღრმისეულ სალონურ დისკუსიებში. მეტაფორა Think Tank არის ინტელექტუალური სივრცე ფილოსოფიური, სოციალური, კულტურული და ტექნოლოგიური თემების კრიტიკული და ღრმა გააზრებისთვის.": "Join deep salon discussions. Metaphora Think Tank is an intellectual forum for critical reflection on philosophy, culture, and future frontiers.",
        "შენი „მესამე სივრცე“ — ადგილი სახლსა და სამსახურს შორის, სადაც თავს ყოველთვის შინაურად იგრძნობ. თემატური კლუბები, სამაგიდო თამაშები, Deep Work Coworking და მეგობრული კომუნა.": "Your 'Third Place' — between home and work where you always belong. Enjoy themed clubs, board games, deep work coworking, and friendly camaraderie.",
        "მეტაფორა Clubs არის ადგილი სახლსა და სამსახურს შორის, სადაც ყოველთვის გელიან. თემატური კლუბები, ინტელექტუალური თამაშები და მეგობრული კომუნა ქმნის ნამდვილ შინაურ გარემოს.": "Metaphora Clubs is the sanctuary between home and work where you always belong. Enjoy themed clubs, board game salons, and warm social camaraderie.",
        "პიროვნული განვითარება მეტაფორაში არის მოგზაურობა საკუთარ თავში — პროფესიული ფსიქოლოგიური მხარდაჭერა, ემოციური ინტელექტის გაძლიერება და შინაგანი რესურსების გააქტიურება.": "Personal development at Metaphora is a journey within — professional psychological support, emotional intelligence empowerment, and tapping into your inner resources.",
        "დაიმუხტე შემოქმედებითი ენერგიითა და ხელოვნებით. მეტაფორა Art აერთიანებს Playback იმპროვიზაციულ თეატრს, არტ-თერაპიას, ცოცხალ მუსიკას, გამოფენებსა და პერფორმანსებს.": "Ignite your creative energy through the arts. Metaphora Art combines Playback improvisational theatre, expressive therapy, live music, and exhibitions.",
        "მეტაფორა არის თანამედროვე მესამე ადგილი — სივრცე თვითგანვითარებისთვის, შემოქმედებისთვის, საქმიანი თანამშრომლობისა და ინტელექტუალური დისკუსიებისთვის.": "Metaphora is a modern Third Place — a sanctuary for personal growth, creativity, business collaboration, and intellectual discussions.",
        "თერაპიული ხატვის, თიხის, კოლაჟისა და ფერწერის ვორქშოფები, რომლებიც გეხმარებათ ემოციებისგან განტვირთვასა და შემოქმედებითი ენერგიის გაღვიძებაში.": "Workshops in intuitive painting, clay sculpture, and collage designed to awaken creative flow and emotional healing.",
        "ინდივიდუალური და ჯგუფური სესიები სერტიფიცირებულ ფსიქოთერაპევტებთან, რომელიც ორიენტირებულია ადამიანის შინაგან რესურსებზე და ბალანსის მოდელზე.": "Individual and group sessions with certified psychotherapists, focusing on inner resources and the positive balance model.",
        "უსაფრთხო, მყუდრო და კონფიდენციალური გარემო, სადაც შეგიძლიათ გულწრფელად გაუზიაროთ გამოცდილება თანამოაზრეებს და მიიღოთ ემპათიური მხარდაჭერა.": "A safe, confidential, and empathetic space to share real experiences with peers and receive compassionate support.",
        "ეფექტური სტრატეგიები პროფესიული და პირადი გადაწვის (Burnout) დასაძლევად, ენერგიის აღსადგენად და მყარი მენტალური იმუნიტეტის შესაქმნელად.": "Proven strategies to overcome professional burnout, recharge personal vitality, and build mental stamina.",
        "მოწვეული მკვლევრების, მეცნიერებისა და მოაზროვნეების საავტორო ლექციები ისტორიაზე, ხელოვნებაზე, ფსიქოლოგიასა და მომავლის ტენდენციებზე.": "Keynotes and master lectures by renowned scholars, authors, psychologists, and cultural luminaries.",
        "უნიკალური თეატრალური ფორმატი, სადაც მსახიობები და მუსიკოსები მაყურებლის მიერ მოყოლილ რეალურ ისტორიებს მყისიერად აცოცხლებენ სცენაზე.": "An improvisational theatrical form where actors and musicians instantly replay audience members' personal stories on stage.",
        "ეს არ არის უბრალოდ სივრცე — „მეტაფორა“ არის გარემო, სადაც იდეები ცოცხლდებიან, ხოლო ადამიანები და შესაძლებლობები ერთმანეთს პოულობენ.": "More than just a space — Metaphora is a sanctuary where ideas come alive and people discover new horizons.",
        "გაეცანით ჩვენს 5 მთავარ მიმართულებას — პიროვნული განვითარებიდან დაწყებული, სალონური დისკუსიებითა და თემატური კლუბებით დასრულებული.": "Explore our 5 core pillars — from personal growth and salon discussions to creative arts and themed clubs.",
        "მცირე ჯგუფური სესიები მეწარმეებისთვის, სადაც ერთობლივად ხდება ბიზნეს-ამოცანების გადაჭრა, გამოცდილების გაცვლა და მიზნების დაგეგმვა.": "Peer-to-peer mastermind sessions for founders to solve strategic challenges, share best practices, and accelerate goals.",
        "პრაქტიკული ვორქშოფები და მედიტაციური ტექნიკები ყურადღების კონცენტრაციისთვის, შფოთვის დაძლევისა და ემოციების გაცნობიერებისთვის.": "Practical workshops and mindfulness techniques for deep focus, stress resilience, and emotional awareness.",
        "კომფორტული, ერგონომიული და მშვიდი სამუშაო ზონები მაღალსიჩქარიანი ინტერნეტით, სადაც ფოკუსირება და პროდუქტიულობა გარანტირებულია.": "Comfortable, serene workspaces equipped with high-speed fiber internet, private meeting rooms, and focus zones.",
        "სტრატეგიული, ფსიქოლოგიური და გასართობი სამაგიდო თამაშები (Mafia, Catan, Dixit, Chess) მეგობრებთან და ახალ ნაცნობებთან ერთად.": "Strategic, social, and psychological tabletop games (Mafia, Catan, Dixit, Chess) enjoyed with friends and fellow club members.",
        "იოგა, სუნთქვითი ვარჯიშები, მებაღეობა, კულინარიული საღამოები და სხვადასხვა ინტერესთა ჯგუფები ჰარმონიული ყოველდღიურობისთვის.": "Yoga, breathwork circles, urban gardening, gourmet culinary tastings, and lifestyle circles.",
        "როგორ ეხმარება იმპროვიზაციული თეატრი საკუთარი ისტორიების გარედან დანახვას, ემოციების გაცნობიერებასა და სტრესის განმუხტვას.": "How improvisational theatre enables seeing our stories from a new vantage point and releasing tension.",
        "დახურული ფორმატის დისკუსიები ბიზნეს-ლიდერებისთვის, სადაც განიხილება ბაზრის ტენდენციები, გამოწვევები და ზრდის სტრატეგიები.": "Chatham House style roundtable discussions for visionary leaders to explore macro shifts and strategic foresight.",
        "არასტანდარტული, შემოქმედებითი და ემოციურად დამუხტული აქტივობები თქვენი გუნდის ერთიანობისა და მოტივაციის გასაძლიერებლად.": "Creative, inspiring, and engaging activities to strengthen your team's cohesion and motivation.",
        "ინტენსიური პრაქტიკული ვორქშოფები გაყიდვების, ლიდერობის, ციფრული ტრანსფორმაციისა და მენეჯმენტის წამყვანი ექსპერტებისგან.": "Intensive masterclasses in sales, leadership, digital transformation, and management.",
        "გმადლობთ! თქვენი ჯავშანი წარმატებით დაფიქსირდა. მეტაფორას გუნდი უმოკლეს დროში დაგიკავშირდებათ დეტალების დასაზუსტებლად.": "Thank you! Your booking has been registered successfully. The Metafora team will contact you shortly to confirm all details.",
        "კვირეული შეხვედრები, სადაც განვიხილავთ გამორჩეულ ლიტერატურულ ნაწარმოებებსა და საკულტო კინემატოგრაფიას მყუდრო გარემოში.": "Weekly gatherings exploring literature and cinema in an intimate lounge.",
        "თანამედროვე ქართველი და საერთაშორისო ხელოვანების ნამუშევრების გამოფენები, პრეზენტაციები და შემოქმედებითი შეხვედრები.": "Exhibitions of contemporary Georgian and international artists, vernissages, and intimate creator meetups.",
        "არტ-ჰაუსისა და კლასიკური ფილმების ჩვენება მყუდრო დარბაზში, რასაც მოსდევს სიღრმისეული საუბარი რეჟისურასა და იდეებზე.": "Curated art-house and classic cinema screenings followed by thoughtful director and theme critiques.",
        "თემატური შეხვედრები, Speed Networking და Pitch საღამოები, სადაც იბადება ახალი იდეები და სტრატეგიული პარტნიორობები.": "Thematic mixers, Speed Networking, and Pitch evenings where new partnerships emerge.",
        "თანამედროვე ქართველი და უცხოელი მხატვრების, ფოტოგრაფებისა და ილუსტრატორების ნამუშევრების პერიოდული ექსპოზიციები.": "Curated seasonal expositions of Georgian and international painters, photographers, and illustrators.",
        "კლასიკური ევროპული სალონების ტრადიციით შთაგონებული შეხვედრები, სადაც აქტუალური და მარადიული კითხვები განიხილება.": "Gatherings inspired by classic European salon traditions exploring timeless philosophical questions.",
        "თვეში ერთხელ შერჩეული წიგნის განხილვა, დისკუსიები ავტორებზე, იდეებსა და ლიტერატურულ ტენდენციებზე ჩაისთან ერთად.": "Monthly book reviews, literary deep-dives, and engaging discussions over fresh artisanal tea.",
        "პრაქტიკული ვორქშოფები, სადაც მონაწილეები ერთობლივად მუშაობენ სოციალური და კულტურული ინიციატივების კონცეფციებზე.": "Hands-on workshops co-designing impactful social and cultural initiatives.",
        "სივრცე, სადაც პოზიტიური ფსიქოთერაპია, ინტელექტუალური თამაშები და თანამოაზრეთა კომუნა ქმნის ჰარმონიულ გარემოს.": "A space where positive psychotherapy, intellectual games, and a vibrant community create a harmonious environment.",
        "მიზნობრივი შეხვედრები, სადაც შეგიძლიათ იპოვოთ მომავალი პარტნიორები, ინვესტორები, კლიენტები და თანამოაზრეები.": "Targeted matchmaking mixers to connect with investors, co-founders, clients, and industry pioneers.",
        "რატომ არის მნიშვნელოვანი მყუდრო Coworking სივრცე ყოველდღიური კონცენტრაციისა და ახალი იდეების დაბადებისთვის.": "Why a peaceful coworking space is essential for deep focus and fresh ideas.",
        "მეტაფორას პოდკასტ-სივრცეში გამართული ღია დისკუსიები და ინტერვიუები გამორჩეულ მოაზროვნეებთან და ლიდერებთან.": "Open podcasts and recorded interviews with notable thinkers and visionaries.",
        "თემატური საღამოები ფილოსოფიაზე, კულტურაზე, ტექნოლოგიებსა და საზოგადოებრივ პროცესებზე მოდერატორთან ერთად.": "Thematic evenings exploring philosophy, culture, AI, ethics, and societal paradigms guided by expert facilitators.",
        "მყუდრო კამერული კონცერტები, პოეზიის საღამოები და მულტიმედიური არტ-ინსტალაციები შთამაგონებელ ატმოსფეროში.": "Intimate chamber concerts, poetry readings, and multimedia art installations.",
        "სივრცე, სადაც პოზიტიური ფსიქოთერაპია, ინტელექტუალური თამაშები და თანამოაზრეთა კომუნა ქმნის ჰარმონიას.": "A sanctuary where positive psychotherapy, social gaming, and community thrive.",
        "პრაქტიკული სემინარები მენეჯმენტზე, მარკეტინგზე, ლიდერობასა და გაყიდვებზე წამყვანი პრაქტიკოსებისგან.": "Hands-on masterclasses in leadership, marketing, fundraising, and scale-up execution from seasoned founders.",
        "შენი „მესამე სივრცე“ — ადგილი, სადაც თავს ყოველთვის შინაურად იგრძნობ. თემატური კლუბები და კომუნა.": "Your 'Third Place' — where you always feel at home. Themed clubs, board games, and community.",
        "რატომ გვაახლოებს ინტელექტუალური თამაშები და როგორ ქმნის ის უსაფრთხო გარემოს ახალი ნაცნობობისთვის.": "Why tabletop games bring people together and spark authentic connections.",
        "ჩაერთე სიღრმისეულ სალონურ დისკუსიებში. ინტელექტუალური დებატები, იდეების გაზიარება და ანალიტიკა.": "Engage in deep salon discussions. Intellectual debates, idea sharing, and analytics.",
        "როგორ შევხედოთ პრობლემებს არა როგორც დაბრკოლებას, არამედ როგორც ზრდისა და განვითარების რესურსს.": "How to view life challenges not as obstacles, but as rich resources for self-growth.",
        "გაეცანით საინტერესო მოსაზრებებს ფსიქოლოგიაზე, მესამე ადგილის კონცეფციასა და თვითგანვითარებაზე.": "Explore insightful perspectives on psychology, the third place concept, and self-growth.",
        "დაიმუხტე შემოქმედებითი ენერგიითა და ხელოვნებით. Playback თეატრი, პერფორმანსები და გამოფენები.": "Charge yourself with creative energy and art. Playback theatre, performances, and exhibitions.",
        "დასკანერებისას ავტომატურად გაგეხსნებათ საქართველოს ბანკისა და თიბისის გადახდის აპლიკაციები 📱": "Scanning automatically opens Bank of Georgia and TBC Bank apps 📱",
        "იპოვე შენი შინაგანი ძალა. პიროვნული განვითარება, ფსიქოლოგიური მხარდაჭერა და თვითშემეცნება.": "Find your inner power. Personal development, psychological support, and self-discovery.",
        "ინდივიდუალური მიდგომა და ჯგუფური მხარდაჭერა თქვენი ემოციური და მენტალური კეთილდღეობისთვის.": "Personalized approach and peer support for your mental and emotional wellbeing.",
        "გაიზარდე, ითანამშრომლე და შექმენი ახალი შესაძლებლობები. ბიზნეს-კონტაქტები და პარტნიორობა.": "Grow, collaborate, and create new opportunities. Business contacts and strategic partnerships.",
        "სიღრმისეული სტატიები პიროვნულ განვითარებაზე, სალონურ კულტურაზე, ხელოვნებასა და კომუნაზე.": "In-depth articles on personal growth, salon culture, art, and community.",
        "სტრუქტურირებული დებატები და არგუმენტირებული დისკუსიები აქტუალურ და მრავალმხრივ თემებზე.": "Structured debate formats and dialectic inquiry exploring complex modern questions.",
        "გახდით სალონური დისკუსიების მონაწილე და გაუზიარეთ თქვენი ხედვა მოაზროვნე საზოგადოებას.": "Join salon discussions and share your vision with a thoughtful community.",
        "ემოციური განტვირთვა ფერებითა და ფორმებით პროფესიონალი არტ-თერაპევტის მეთვალყურეობით.": "Emotional decompression through colors and shapes guided by certified therapists.",
        "აკუსტიკური კონცერტები, პოეზიის საღამოები და ჯემ-სესიები მყუდრო, შინაურ ატმოსფეროში.": "Acoustic performances, spoken word nights, and live improvisational music jams.",
        "ადგილი მათთვის, ვინც აფასებს ღრმა აზრს, თავისუფალ აზროვნებასა და ცოდნის გაზიარებას.": "A sanctuary for those who value deep thought, open minds, and knowledge sharing.",
        "აირჩიეთ სასურველი სივრცე, შემოგვიერთდით ვორქშოფებსა და Playback თეატრის საღამოებზე.": "Choose your preferred space, join our workshops and Playback theatre evenings.",
        "თვიური რეკომენდაციები, საკითხავი სიები და დისკუსიების ანონსი ჩვენი წიგნის კლუბიდან.": "Monthly book recommendations, reading lists, and discussion announcements.",
        "პიროვნული ზრდა, ბიზნეს შესაძლებლობები, Think Tank დისკუსიები, ხელოვნება და კლუბები.": "Personal growth, business opportunities, Think Tank salons, arts, and clubs.",
        "გარემო, სადაც ყოველთვის გელიან თანამოაზრეები, საინტერესო აქტივობები და სიმყუდროვე.": "An atmosphere where peers, engaging activities, and cozy warmth always await you.",
        "დაჯავშნეთ ადგილი Playback თეატრის უახლოეს სპექტაკლზე ან არტ-თერაპიის მასტერკლასზე.": "Reserve your seat for the next Playback theatre show or art therapy masterclass.",
        "მაღალსიჩქარიანი ინტერნეტი, საავტორო ყავა, სამუშაო სივრცეები და ბიზნეს ნეთვორქინგი.": "High-speed internet, specialty coffee, workspaces, and business networking.",
        "ფერებითა და ფორმებით თვითგამოხატვა მათთვისაც, ვისაც ჰგონია, რომ ხატვა არ ეხერხება.": "Expressive art therapy through colors and textures, even for complete beginners.",
        "ხელოვნება, როგორც თვითგამოხატვის, ემპათიისა და შთაგონების უმძლავრესი ინსტრუმენტი.": "Art as the most powerful medium for self-expression, empathy, and inspiration.",
        "დაჯავშნეთ ინდივიდუალური კონსულტაცია ან შემოუერთდით ჯგუფურ ვორქშოფებს მეტაფორაში.": "Book an individual consultation or join our group workshops at Metaphora.",
        "მაყურებლის რეალური ისტორიებისა და ემოციების სცენური გაცოცხლება მსახიობების მიერ.": "Live on-stage enactment of audience stories and authentic emotions.",
        "დილის ყავა, იდეების გაცვლა და ბიზნეს-კონტაქტების გაფართოება მყუდრო ატმოსფეროში.": "Morning coffee, idea exchange, and business networking in a warm environment.",
        "დაათვალიერეთ ჩვენი სივრცეები, შემოქმედებითი გუნდი და დაუვიწყარი ღონისძიებები.": "Explore our spaces, creative team, and unforgettable events.",
        "დაგვიკავშირდით კორპორატიული პაკეტებისთვის ან დაჯავშნეთ ადგილი ბიზნეს-ივენთზე.": "Contact us for corporate packages or reserve your seat at upcoming business events.",
        "ემოციური ინტელექტის, თვითშეფასებისა და კომუნიკაციის პრაქტიკული სემინარები.": "Hands-on seminars on emotional intelligence, self-worth, and communication.",
        "მოუსმინეთ და გაეცანით ადამიანებს, რომლებიც ქმნიან მეტაფორას ატმოსფეროს.": "Listen to and meet the people who create the Metaphora atmosphere.",
        "გუნდური შეჭიდულობის (Team Building), ლიდერობისა და სტრატეგიული სესიები.": "Team building, leadership workshops, and strategic alignment sessions.",
        "ინდივიდუალური და ჯგუფური თერაპიული სესიები გამოცდილ ფსიქოთერაპევტებთან.": "Individual and group therapy sessions with certified practitioners.",
        "სტატიები, პოდკასტები და ანალიტიკური მასალები თანამედროვე საზოგადოებაზე.": "Articles, podcasts, and cultural commentary on contemporary life.",
        "გვეწვიეთ მეტაფორას მყუდრო სივრცეში აღმაშენებლის გამზირზე ან მოგვწერეთ.": "Visit Metaphora's cozy space on Aghmashenebeli Avenue or get in touch.",
        "დაათვალიერეთ ჩვენი სივრცეები, ღონისძიებები და შემოქმედებითი საღამოები.": "Browse our spaces, events, and creative evenings.",
        "50+ მსოფლიო სამაგიდო თამაში, გამასპინძლება და სასიამოვნო სოციალიზაცია.": "50+ world board games, refreshments, and delightful socializing.",
        "მაღალი დონის ბიზნეს-გარემო, ინოვაციური ფორმატები და პარტნიორული ქსელი.": "High-caliber business environment, innovative formats, and peer network.",
        "მაღალსიჩქარიანი ინტერნეტი, ერგონომიული სივრცე და კონცენტრაციის გარემო.": "High-speed internet, ergonomic desks, and focused environment.",
        "უახლოესი ღონისძიებები, ვორქშოფები და თეატრალური საღამოები მეტაფორაში.": "Upcoming events, workshops, and theatre evenings at Metaphora.",
        "დაჯავშნეთ ვიზიტი, შემოუერთდით კლუბებს ან გახდით მეტაფორას პარტნიორი.": "Book a visit, join our clubs, or become a Metaphora partner.",
        "დაჯავშნეთ ვიზიტი, გაიარეთ კონსულტაცია ან გახდით ჩვენი კომუნის წევრი.": "Book a visit, get a consultation, or become a member of our community.",
        "აზრთა თავისუფალი გაცვლა პატივისცემისა და კონსტრუქციულობის პრინციპით.": "Free exchange of ideas guided by mutual respect and constructive inquiry.",
        "აირჩიეთ სასურველი კლუბი ან შემოგვიერთდით Deep Work სივრცეში დღესვე.": "Choose your desired club or join our Deep Work space today.",
        "თანამედროვე მხატვრების ნამუშევრების ექსპოზიცია და კამერული მუსიკა.": "Contemporary art expositions and intimate chamber music.",
        "რა არის „მესამე ადგილი“ და რატომ სჭირდება ის თანამედროვე ადამიანს?": "What is the 'Third Place' and why do we need it today?",
        "📋 სრული რეკვიზიტების კოპირება (IBAN, მიმღები, თანხა, დანიშნულება)": "📋 Copy Full Requisites (IBAN, Recipient, Amount, Purpose)",
        "მოდერირებული დისკუსიები მოწვეულ ექსპერტებთან და ინტელექტუალებთან.": "Moderated discussions with invited scholars and industry experts.",
        "თვიური რჩეული ლიტერატურის განხილვა და დისკუსიები ჩაის თანხლებით.": "Monthly discussions of curated literature over aromatic teas.",
        "გაეცანით მიმართულების ძირითად კომპონენტებსა და შესაძლებლობებს.": "Explore the core components and opportunities of this pillar.",
        "ექსპერტული კონსულტაციები და ბიზნესის მასშტაბირების მხარდაჭერა.": "Expert consultations and business scaling mentorship.",
        "შეავსეთ ფორმა სასურველ სერვისზე ან ღონისძიებაზე დასაჯავშნად.": "Fill out the form to reserve your preferred service or event.",
        "დააჭირეთ „ნახვა“-ს ან ცენტრალურ ბარათს საიტზე გადასასვლელად": "Click 'Explore' or the center card to enter the website",
        "მედიტაციური და სხეულზე ორიენტირებული რელაქსაციის ტექნიკები.": "Mindfulness and somatic relaxation techniques.",
        "შენი „მესამე სივრცე“ — ადგილი, სადაც ყოველთვის შინაურად ხარ": "Your 'Third Place' — where you always belong",
        "იდეალური გარემო პროდუქტიული მუშაობისა და განვითარებისთვის": "An ideal environment for deep focus and personal growth",
        "აირჩიეთ სასურველი მიმართულება და დრო რეგისტრაციისთვის.": "Select your preferred direction and time for registration.",
        "ჯავშანი წარმატებით გაიგზავნა! მალე დაგიკავშირდებით. ✨": "Booking sent successfully! We will contact you shortly. ✨",
        "შემოქმედებითი ენერგია, იმპროვიზაცია &amp; პერფორმანსი": "Creative Energy, Improvisation &amp; Performance",
        "სიღრმისეული ინტელექტუალური დებატები &amp; ანალიტიკა": "In-Depth Intellectual Debates &amp; Analytics",
        "შემოქმედებითი ენერგია, Playback თეატრი & ხელოვნება": "Creative Energy, Playback Theatre & Fine Arts",
        "საგანმანათლებლო-გასართობი ჰაბი და „მესამე ადგილი“": "Educational-Entertainment Hub & 'Third Place'",
        "შენი „მესამე სივრცე“ — კლუბები, კომუნა & თამაშები": "Your 'Third Place' — Themed Clubs, Community & Board Games",
        "შემოქმედებითი ენერგია, იმპროვიზაცია & პერფორმანსი": "Creative Energy, Improvisation & Performance",
        "რა გამოარჩევს მეტაფორას გამოცდილებას და გარემოს.": "What makes the Metaphora experience and environment unique.",
        "ღრმა და შინაარსიანი დიალოგი ზედაპირულობის გარეშე": "Deep, Substantive Dialogue Beyond Superficiality",
        "გაიზარდე, ითანამშრომლე და შექმენი შესაძლებლობები": "Grow, Collaborate, and Create Opportunities",
        "იპოვე შენი შინაგანი ძალა &amp; ემოციური ჰარმონია": "Find Your Inner Strength &amp; Emotional Harmony",
        "სივრცე, სადაც იდეები და ადამიანები ერთიანდებიან": "A Space Where Ideas and People Unite",
        "სიღრმისეული ინტელექტუალური დებატები & ანალიტიკა": "In-Depth Intellectual Debates & Analytics",
        "დააჭირეთ ცენტრალურ ბარათს საიტზე გადასასვლელად": "Click the center card to explore the website",
        "სრული კონფიდენციალურობა და ეთიკური სტანდარტები": "Strict Confidentiality and Ethical Standards",
        "სწრაფი Wi-Fi და მოსახერხებელი სამუშაო მაგიდები": "Ultra-fast Wi-Fi and ergonomic desks",
        "პრაქტიკული და შედეგზე ორიენტირებული ფორმატები": "Result-Driven Mastermind Formats",
        "სალონური დისკუსიები & ინტელექტუალური დებატები": "Salon Discussions & Intellectual Debates",
        "ადგილი, სადაც თავს ყოველთვის შინაურად იგრძნობ": "A place where you always feel right at home",
        "ინტელექტუალური და მრავალფეროვანი საზოგადოება": "Intellectually Diverse and Curious Community",
        "გსურთ თქვენი ბიზნესის ახალ საფეხურზე აყვანა?": "Ready to take your business to the next level?",
        "იპოვე შენი შინაგანი ძალა & ემოციური ჰარმონია": "Find Your Inner Strength & Emotional Harmony",
        "✍️ აკრიფეთ ტექსტი აქ და მოისმინეთ დაჭერისას:": "✍️ Type text here and listen on keypress:",
        "სტატიები & ფიქრები": "Articles & Insights",
        "სტატიები &amp; ფიქრები": "Articles &amp; Insights",
        "მეტაფორას ბლოგი": "Metaphora Blog",
        "🌟 რჩეული სტატია • 5 წთ საკითხავი": "🌟 Featured Article • 5 min read",
        "ავტორი: მეტაფორას გუნდი": "Author: Metaphora Team",
        "სტატიის წაკითხვა 📖": "Read Article 📖",
        "სტატიის წაკითხვა": "Read Article",
        "🎭 Playback თეატრი": "🎭 Playback Theatre",
        "🎭 Playback თეატრი • 4 წთ": "🎭 Playback Theatre • 4 min",
        "Playback თეატრის მაგია და არტ-თერაპია": "The Magic of Playback Theatre & Art Therapy",
        "როგორ ეხმარება იმპროვიზაციული თეატრი საკუთარი ისტორიების გარედან დანახვას, ემოციების გაცნობიერებასა და სტრესის განმუხტვას.": "How improvisational theatre helps reflect personal stories, process emotions, and relieve stress.",
        "სრულად წაკითხვა →": "Read Full Article →",
        "სრულად წაკითხვა": "Read Full Article",
        "🧠 ფსიქოლოგია": "🧠 Psychology",
        "🧠 ფსიქოლოგია • 6 წთ": "🧠 Psychology • 6 min",
        "პოზიტიური ფსიქოთერაპიის 5 ოქროს წესი": "5 Golden Rules of Positive Psychotherapy",
        "როგორ შევხედოთ პრობლემებს არა როგორც დაბრკოლებას, არამედ როგორც ზრდისა და განვითარების რესურსს.": "How to view challenges not as obstacles, but as essential resources for growth.",
        "☕ პროდუქტიულობა": "☕ Productivity",
        "☕ პროდუქტიულობა • 3 წთ": "☕ Productivity • 3 min",
        "როგორ შევქმნათ Deep Work გარემო?": "How to Create a Deep Work Environment?",
        "რატომ არის მნიშვნელოვანი მყუდრო Coworking სივრცე ყოველდღიური კონცენტრაციისა და ახალი იდეების დაბადებისთვის.": "Why a cozy coworking space is vital for daily focus and sparking new ideas.",
        "🍸 კომუნა": "🍸 Community",
        "🍸 კომუნა • 4 წთ": "🍸 Community • 4 min",
        "სამაგიდო თამაშები როგორც სოციალური ხიდი": "Board Games as a Social Bridge",
        "რატომ გვაახლოებს ინტელექტუალური თამაშები და როგორ ქმნის ის უსაფრთხო გარემოს ახალი ნაცნობობისთვის.": "Why tabletop games bring people closer and create a safe environment for new connections.",
        "🎨 თვითგამოხატვა": "🎨 Creative Expression",
        "🎨 თვითგამოხატვა • 5 წთ": "🎨 Creative Expression • 5 min",
        "არტ-თერაპია და შინაგანი ბალანსი": "Art Therapy & Emotional Balance",
        "ფერებითა და ფორმებით თვითგამოხატვა მათთვისაც, ვისაც ჰგონია, რომ ხატვა არ ეხერხება.": "Self-expression through colors and shapes even for those who believe they cannot draw.",
        "📚 წიგნის კლუბი": "📚 Book Club",
        "📚 წიგნის კლუბი • 4 წთ": "📚 Book Club • 4 min",
        "📚 წიგნების კლუბი": "📚 Book Club",
        "რას ვკითხულობთ ამ თვეში მეტაფორაში?": "What Are We Reading This Month at Metaphora?",
        "თვიური რეკომენდაციები, საკითხავი სიები და დისკუსიების ანონსი ჩვენი წიგნის კლუბიდან.": "Monthly recommendations, reading lists, and discussion announcements from our book club.",
        "← მთავარ გვერდზე დაბრუნება": "← Return to Home Page",
        "მოგეწონათ სტატია?": "Did you enjoy this article?",
        "გვეწვიეთ მეტაფორაში და გახდით ჩვენი შემოქმედებითი კომუნის წევრი.": "Visit Metaphora and become part of our creative community.",
        "სტატიის სათაური": "Article Title",
        "სტატიის დახურვა": "Close Article",
        "4 წთ საკითხავი": "4 min read",
        "5 წთ საკითხავი": "5 min read",
        "6 წთ საკითხავი": "6 min read",
        "3 წთ საკითხავი": "3 min read",
        "4 წთ": "4 min",
        "5 წთ": "5 min",
        "6 წთ": "6 min",
        "3 წთ": "3 min",
        "2026 წლის აგვისტო": "August 2026",
        "არტ-ფასილიტატორი • მეტაფორა": "Art Facilitator • Metaphora",
        "პოზიტიური ფსიქოთერაპევტი • მეტაფორა": "Positive Psychotherapist • Metaphora",
        "მეტაფორას გუნდი": "Metaphora Team",
        "Clubs Host • მეტაფორა": "Clubs Host • Metaphora",
        "არტ-თერაპევტი • მეტაფორა": "Art Therapist • Metaphora",
        "წიგნის კლუბის მოდერატორი • მეტაფორა": "Book Club Moderator • Metaphora",
        "შემოუერთდით მეტაფორას ინტელექტუალურ კომუნას": "Join Metaphora's Intellectual Community",
        "ელენე — Community Manager &amp; Clubs Host": "Elene — Community Manager &amp; Clubs Host",
        "კორპორატიული რიტრიტები &amp; Team Building": "Corporate Retreats &amp; Team Building",
        "პროფესიონალი არტ-თერაპევტის ხელმძღვანელობა": "Guidance by certified art therapists",
        "საკუთარი შესაძლებლობების ხელახალი აღმოჩენა": "Rediscovering your personal strengths",
        "🎨 4. მეტაფორა Art (Playback &amp; თერაპია)": "🎨 4. Metaphora Art (Playback &amp; Therapy)",
        "ჩამოსქროლეთ და აღმოაჩინეთ მეტაფორას არსი.": "Scroll down and discover the essence of Metaphora.",
        "ბარი გემრიელი ყავით, ჩაითა და კოქტეილებით": "Artisanal Coffee, Rare Teas & Signature Cocktails",
        "ჯავშნის დასასრულებლად გადაიხადეთ საფასური": "Please complete the bank transfer to confirm your booking",
        "აირჩიეთ ბანკი ან გადადით ინტერნეტ ბანკში:": "Choose your bank or open Web Banking:",
        "ია — ბიზნეს განვითარება &amp; პარტნიორობა": "Ia — Business Development &amp; Partnerships",
        "ია — ბიზნეს განვითარება & პარტნიორობა": "Ia — Business Development & Partnerships",
        "მარიკა — პერსონალური &amp; ბიზნეს განვითარების ქოუჩი": "Marika — Personal &amp; Business Development Coach",
        "მარიკა — პერსონალური & ბიზნეს განვითარების ქოუჩი": "Marika — Personal & Business Development Coach",
        "ნათია — პოზიტიური ფსიქოთერაპევტი &amp; ფსიქოკონსულტანტი": "Natia — Positive Psychotherapist &amp; Psychoconsultant",
        "ნათია — პოზიტიური ფსიქოთერაპევტი & ფსიქოკონსულტანტი": "Natia — Positive Psychotherapist & Psychoconsultant",
        "თეო — ქოუჩინგი, ტრენინგები &amp; ფსიქოკონსულტირება": "Teo — Personal Coaching, Trainings &amp; Psychoconsulting",
        "თეო — ქოუჩინგი, ტრენინგები & ფსიქოკონსულტირება": "Teo — Personal Coaching, Trainings & Psychoconsulting",
        "ია — ქოუჩინგი, ტრენინგები &amp; ფსიქოკონსულტირება": "Ia — Personal Coaching, Trainings &amp; Psychoconsulting",
        "ია — ქოუჩინგი, ტრენინგები & ფსიქოკონსულტირება": "Ia — Personal Coaching, Trainings & Psychoconsulting",
        "ია ქარდავა": "Ia Kardava",
        "ქეთი — ფსიქოკონსულტანტი, ტრენერი &amp; სერტიფიცირებული ქოუჩი": "Keti — Psychoconsultant, Trainer &amp; Certified Coach",
        "ქეთი — ფსიქოკონსულტანტი, ტრენერი & სერტიფიცირებული ქოუჩი": "Keti — Psychoconsultant, Trainer & Certified Coach",
        "კონფლიქტების ტრანსფორმაცია ზრდის რესურსად": "Transforming conflict into a growth resource",
        "მეტაფორა - Edutainment Hub & Third Place": "METAPHORA - Edutainment Hub & Third Place",
        "აკუსტიკური საღამოები &amp; პერფორმანსები": "Acoustic Evenings &amp; Performances",
        "იდეალური განტვირთვა დამღლელი დღის შემდეგ": "Perfect relaxation after a busy day",
        "ქეთი — ფსიქოკონსულტანტი &amp; EPC ქოუჩი": "Keti — Psychoconsultant &amp; Certified Coach",
        "პოზიტიური ფსიქოთერაპია და თვითშემეცნება": "Positive Psychotherapy & Self-Discovery",
        "Burnout პრევენცია &amp; ენერგიის მართვა": "Burnout Prevention & Energy Management",
        "სერტიფიცირებული და გამოცდილი ექსპერტები": "Certified and Experienced Practitioners",
        "ახალი ბიზნეს-შესაძლებლობების გენერირება": "Catalyst for New Commercial Opportunities",
        "მრავალფეროვანი ყოველკვირეული აქტივობები": "Diverse Weekly Social Calendar",
        "აღმოაჩინეთ თქვენი შემოქმედებითი საწყისი": "Discover Your Creative Core",
        "დააკლიკეთ აქ და დააჭირეთ კლავიატურას...": "Click here and type on your keyboard...",
        "სამაგიდო თამაშები როგორც სოციალური ხიდი": "Board games as a social bridge",
        "სტრესის მართვა &amp; გადაწვის პრევენცია": "Stress Resilience &amp; Burnout Prevention",
        "მეტაფორას მუსიკის მოსმენა (Play/Pause)": "Listen to Metaphora Music (Play/Pause)",
        "© 2026 მეტაფორა. ყველა უფლება დაცულია.": "© 2026 METAPHORA. All rights reserved.",
        "მყუდრო სალონური გარემო ღვინითა და ჩაით": "Cozy Salon Atmosphere with Wine, Coffee & Tea",
        "წიგნის კლუბი &amp; ლიტერატურული სალონი": "Book Club & Literary Salon",
        "რით შემიძლია დაგეხმაროთ? მკითხეთ ჩვენს": "How can I help you? Ask me about our",
        "17:00 — 19:00 (ვორქშოფი &amp; თერაპია)": "17:00 — 19:00 (Workshop &amp; Therapy)",
        "50-ზე მეტი თანამედროვე სამაგიდო თამაში": "Over 50 modern board games",
        "Mastermind საუზმეები &amp; ნეთვორქინგი": "Mastermind Breakfasts &amp; Networking",
        "Playback თეატრის ელემენტები გუნდისთვის": "Playback Theatre Elements for Teams",
        "ელენე — Community Manager & Clubs Host": "Elene — Community Manager & Clubs Host",
        "კორპორატიული რიტრიტები & Team Building": "Corporate Retreats & Team Building",
        "ლალი — დამფუძნებელი &amp; ფასილიტატორი": "Lali — Psychotherapist, Trainer &amp; Association President",
        "ლალი — ფსიქოთერაპევტი, ტრენერი &amp; ასოციაციის პრეზიდენტი": "Lali — Psychotherapist, Trainer &amp; Association President",
        "მეტაფორას საღამო &amp; არტ-პერფორმანსი": "Metaphora Evening &amp; Art Performance",
        "პროფესიონალი მოდერატორის მეთვალყურეობა": "Facilitation by experienced moderators",
        "🎨 4. მეტაფორა Art (Playback & თერაპია)": "🎨 4. Metaphora Art (Playback & Therapy)",
        "შემოქმედებითი ენერგია &amp; ხელოვნება": "Creative Energy & Art",
        "თვითდახმარების ჯგუფები &amp; საუბრები": "Support Groups & Open Dialogues",
        "მუსიკალური &amp; პოეტური იმპროვიზაცია": "Musical & Poetic Improvisations",
        "Playback თეატრის მაგია და არტ-თერაპია": "The Magic of Playback Theatre & Art Therapy",
        "გამოკვეთილი, სუფთა მექანიკური დარტყმა": "Distinct, crisp mechanical keystroke",
        "გამოფენები &amp; აკუსტიკური საღამოები": "Exhibitions &amp; Acoustic Evenings",
        "ია — Business & Partnerships Lead": "Ia — Business & Partnerships Lead",
        "კორპორატიული Retreat &amp; ვორქშოფები": "Corporate Retreat &amp; Workshops",
        "მეტაფორა — კლავიშის საუნდების ტესტერი": "METAPHORA — Keystroke Sound Tester",
        "💡 ორჯერ დააწკაპუნეთ წრეზე ან დააჭირეთ": "💡 Double click on a node or press",
        "🧠 სალონური დისკუსიები &amp; ანალიტიკა": "🧠 Salon Discussions &amp; Analytics",
        "2026 მეტაფორა. ყველა უფლება დაცულია.": "2026 METAPHORA. All rights reserved.",
        "ემოციური ინტელექტი &amp; Mindfulness": "Emotional Intelligence & Mindfulness",
        "ბიზნეს-კავშირები, ნეთვორქინგი & ზრდა": "Business Networking, Partnerships & Growth",
        "Art &amp; Playback თეატრი - მეტაფორა": "Art & Playback Theatre - METAPHORA",
        "Clubs &amp; მესამე სივრცე - მეტაფორა": "Clubs & Third Place - METAPHORA",
        "Mindfulness &amp; ემოციური ინტელექტი": "Mindfulness &amp; Emotional Intelligence",
        "აკუსტიკური საღამოები & პერფორმანსები": "Acoustic Evenings & Performances",
        "დომინანტი ფერის შეცვლა (Teal / Plum)": "Change Dominant Color (Teal / Plum)",
        "ენერგეტიკული ბალანსის აღდგენის გეგმა": "Vitality & energy recovery plan",
        "ინვესტორებთან და მენტორებთან კავშირი": "Connections with investors and mentors",
        "მზად ხართ ახალი შინაგანი ეტაპისთვის?": "Ready for a new inner chapter?",
        "მცირე, თბილი ჯგუფები (6-10 ადამიანი)": "Small, intimate groups (6-10 people)",
        "პოზიტიური ფსიქოთერაპიის 5 ოქროს წესი": "5 Golden Rules of Positive Psychotherapy",
        "ქეთი — ფსიქოკონსულტანტი & EPC ქოუჩი": "Keti — Psychoconsultant & EPC Coach",
        "ფილოსოფიური &amp; კულტურული ლექციები": "Philosophical &amp; Cultural Lectures",
        "წინასწარი გამოცდილება არ არის საჭირო": "No prior experience required",
        "🎨 შემოქმედებითი ენერგია &amp; თეატრი": "🎨 Creative Energy &amp; Theatre",
        "🏛️ 5. მეტაფორა Clubs (მესამე სივრცე)": "🏛️ 5. Metaphora Clubs (Third Place)",
        "🏛️ შენი „მესამე სივრცე“ &amp; კომუნა": "🏛️ Your 'Third Place' &amp; Community",
        "მეტაფორას სერვისები &amp; სივრცეები": "Metaphora Services & Spaces",
        "კომენტარი ან განსაკუთრებული სურვილი": "Comment or Special Request",
        "დ.აღმაშენებლის გამზირი 63ა, თბილისი": "63a David Aghmashenebeli Ave, Tbilisi",
        "Burnout პრევენცია & ენერგიის მართვა": "Burnout Prevention & Energy Management",
        "პოზიტიური ფსიქოთერაპიის მეთოდოლოგია": "Positive Psychotherapy Methodology",
        "Boutique Coworking & Meeting Spaces": "Boutique Coworking & Meeting Spaces",
        "ნამდვილი „მესამე ადგილის“ ატმოსფერო": "The Authentic Feeling of a True 'Third Place'",
        "საქართველოს ბანკი (Bank of Georgia)": "Bank of Georgia (BOG)",
        "19:30 — 22:00 (Playback თეატრი/Bar)": "19:30 — 22:00 (Playback Theatre / Bar)",
        "ბიზნეს-მასტერკლასები &amp; ქოუჩინგი": "Business Masterclasses &amp; Coaching",
        "გუნდის მართვის თანამედროვე მეთოდები": "Modern Team Management Frameworks",
        "ქეთი — ქოუჩინგი, ტრენინგები &amp; ფსიქოკონსულტირება": "Keti — Personal Coaching, Trainings &amp; Psychoconsulting",
        "ქეთი — ქოუჩინგი, ტრენინგები & ფსიქოკონსულტირება": "Keti — Personal Coaching, Trainings & Psychoconsulting",
        "ქეთი — პოზიტიური ფსიქოთერაპევტი": "Keti — Personal Coaching, Trainings & Psychoconsulting",
        "ინტელექტუალური დისკუსია &amp; კლუბი": "Intellectual Discussion &amp; Club",
        "მოდერირებული ინტელექტუალური დიალოგი": "Moderated intellectual dialogue",
        "პრობლემის გადაჭრის ინოვაციური გზები": "Innovative problem-solving strategies",
        "პროდუქტებისა და სერვისების წარდგენა": "Product and Service Showcases",
        "რას ვკითხულობთ ამ თვეში მეტაფორაში?": "What are we reading this month at Metaphora?",
        "რბილი, ხავერდოვანი ვინტაჟური დაჭერა": "Soft, velvety vintage keystroke",
        "სინერგიული გადაწყვეტილებების შექმნა": "Co-creating synergistic solutions",
        "სტრესის მართვა & გადაწვის პრევენცია": "Stress Resilience & Burnout Prevention",
        "სუნთქვითი და სხეულებრივი რელაქსაცია": "Breathwork and somatic relaxation",
        "შეხვედრების ოთახები (Meeting Rooms)": "Meeting Rooms",
        "„მესამე ადგილის“ კვლევითი პლატფორმა": "'Third Place' Research Platform",
        "💡 Think Tank &amp; Playback დარბაზი": "💡 Think Tank &amp; Playback Hall",
        "1. Personal Development - მეტაფორა": "1. Personal Development - METAPHORA",
        "მიმართულებები &amp; შესაძლებლობები": "Pillars & Opportunities",
        "🌱 1. მეტაფორა Personal Development": "🌱 1. Metaphora Personal Development",
        "დამატებითი დეტალები ან შეკითხვა...": "Additional details or questions...",
        "ბიზნეს-ვორქშოფები &amp; ტრენინგები": "Business Workshops & Masterclasses",
        "პრემიუმ ხარისხის სამუშაო სივრცეები": "Premium Boutique Workspace Environment",
        "ავთენტური Playback თეატრალური დასი": "Authentic Professional Playback Ensemble",
        "წიგნის კლუბი & ლიტერატურული სალონი": "Book Club & Literary Salon",
        "თბილი, მიმღები და მეგობრული კომუნა": "Warm, Inclusive, and Welcoming Community",
        "17:00 — 19:00 (ვორქშოფი & თერაპია)": "17:00 — 19:00 (Workshop & Therapy)",
        "Mastermind საუზმეები & ნეთვორქინგი": "Mastermind Breakfasts & Networking",
        "Themed Bar &amp; სამაგიდო თამაშები": "Themed Bar &amp; Board Games",
        "კითხვა-პასუხის ინტერაქტიული რეჟიმი": "Interactive Q&A Session",
        "კომუნის შეხვედრა &amp; ნეთვორქინგი": "Community Mixer &amp; Networking",
        "ლალი — დამფუძნებელი & ფასილიტატორი": "Lali — Psychotherapist, Trainer & Association President",
        "ლალი — ფსიქოთერაპევტი, ტრენერი & ასოციაციის პრეზიდენტი": "Lali — Psychotherapist, Trainer & Association President",
        "მაღალი ხარისხის აუდიო-ვიდეო ჩაწერა": "High-quality audio/video recording",
        "მეტაფორას საღამო & არტ-პერფორმანსი": "Metaphora Evening & Art Performance",
        "პირადი საზღვრების დაცვის ტექნიკები": "Techniques for establishing healthy personal boundaries",
        "რას მოიცავს პიროვნული განვითარება?": "What does Personal Development include?",
        "სალონური დისკუსიები &amp; დებატები": "Salon Discussions &amp; Debates",
        "სტრეს-მენეჯმენტი &amp; Mindfulness": "Stress Management &amp; Mindfulness",
        "ღრმა რეზონანსული მექანიკური დაჭერა": "Deep resonant mechanical stroke",
        "ჯანსაღი ცხოვრების წესის მხარდაჭერა": "Support for a balanced, healthy lifestyle",
        "შემოქმედებითი ენერგია & ხელოვნება": "Creative Energy & Art",
        "მზად ხართ ახალი გამოცდილებისთვის?": "Ready for a New Experience?",
        "პროგრამის დეტალები &amp; მოდულები": "Program Details & Modules",
        "თვითდახმარების ჯგუფები & საუბრები": "Support Groups & Open Dialogues",
        "მყუდრო და შთამაგონებელი ატმოსფერო": "Inspiring, Warm, and Cozy Environment",
        "მუსიკალური & პოეტური იმპროვიზაცია": "Musical & Poetic Improvisations",
        "Lifestyle &amp; ინტერესთა კლუბები": "Lifestyle & Special Interest Clubs",
        "მეტაფორას AI ასისტენტი • 🟢 ონლაინ": "Metaphora AI Assistant • 🟢 Online",
        "✅ გადახდა დავასრულე - დადასტურება": "✅ Payment Completed - Confirm",
        "12:00 — 14:00 (დღის ლანჩი/ლაუნჯი)": "12:00 — 14:00 (Day Lunch / Lounge)",
        "Think Tank-ის ფორმატები და თემები": "Think Tank Formats & Themes",
        "ახალი ჰობებისა და უნარების შეძენა": "Acquiring New Hobbies and Skills",
        "გამოფენები & აკუსტიკური საღამოები": "Exhibitions & Acoustic Evenings",
        "ექსპერტული ანალიტიკა და მოდერაცია": "Expert moderation and critical analysis",
        "ვორქშოფი &amp; ჯგუფური ინტერაქცია": "Workshop &amp; Group Interaction",
        "თემატური საღამო &amp; პრეზენტაცია": "Themed Evening &amp; Presentation",
        "კონფიდენციალური და ეთიკური სივრცე": "Confidential and ethical setting",
        "კორპორატიული Retreat & ვორქშოფები": "Corporate Retreat & Workshops",
        "ნამუშევრების შეძენის შესაძლებლობა": "Option to acquire original artworks",
        "სპეციალური სტუმრები და რეჟისორები": "Special guest speakers and filmmakers",
        "🎨 Playback თეატრი &amp; ხელოვნება": "🎨 Playback Theatre &amp; Fine Arts",
        "🧠 სალონური დისკუსიები & ანალიტიკა": "🧠 Salon Discussions & Analytics",
        "1. მეტაფორა Personal Development": "1. Metaphora Personal Development",
        "მეტაფორას მუსიკის ჩართვა / პაუზა": "Play / Pause Metaphora Music",
        "ემოციური ინტელექტი & Mindfulness": "Emotional Intelligence & Mindfulness",
        "კრიტიკული აზროვნების განვითარება": "Cultivation of Independent Critical Thinking",
        "ემოციური კათარზისი და ინსპირაცია": "Emotional Catharsis and Deep Inspiration",
        "✨ — „მეტაფორას“ ვირტუალური გიდი.": "✨ — Metaphora’s virtual guide.",
        "Art & Playback თეატრი - მეტაფორა": "Art & Playback Theatre - METAPHORA",
        "B2B პარტნიორობა &amp; მენტორინგი": "B2B Partnership &amp; Mentoring",
        "Clubs & მესამე სივრცე - მეტაფორა": "Clubs & Third Place - METAPHORA",
        "Mindfulness & ემოციური ინტელექტი": "Mindfulness & Emotional Intelligence",
        "ისტორიების გაცოცხლება და ემპათია": "Story enactment and deep empathy",
        "კლუბები და საზოგადოებრივი სივრცე": "Clubs & Community Space",
        "მეტაფორას გუნდი სამუშაო გარემოში": "Metaphora team in their creative space",
        "როგორ შევქმნათ Deep Work გარემო?": "How to create a Deep Work environment?",
        "სალონური შეხვედრა &amp; დისკუსია": "Salon Gathering &amp; Discussion",
        "სრული ორგანიზაციული უზრუნველყოფა": "Full turnkey event management",
        "ფილოსოფიური & კულტურული ლექციები": "Philosophical & Cultural Lectures",
        "🌟 რჩეული სტატია • 5 წთ საკითხავი": "🌟 Featured Article • 5 min read",
        "🎨 მეტაფორას მოზაიკა &amp; დეკორი": "🎨 Metaphora Mosaic &amp; Decor",
        "🎨 შემოქმედებითი ენერგია & თეატრი": "🎨 Creative Energy & Theatre",
        "🏛️ შენი „მესამე სივრცე“ & კომუნა": "🏛️ Your 'Third Place' & Community",
        "Personal Development - მეტაფორა": "Personal Development - METAPHORA",
        "სიღრმისეული სალონური დისკუსიები": "In-Depth Salon Discussions",
        "მეტაფორას სერვისები & სივრცეები": "Metaphora Services & Spaces",
        "დამფუძნებელი &amp; ფასილიტატორი": "Founder & Facilitator",
        "☕ Coworking & Mastermind საუზმე": "☕ Coworking & Mastermind Breakfast",
        "ინდივიდუალური ფსიქოკონსულტირება": "Individual Psycho-Consultation",
        "მაღალი დონის ბიზნეს-საზოგადოება": "High-Caliber Professional Community",
        "პროფესიული არტ-თერაპიული სივრცე": "Equipped Atelier for Expressive Arts",
        "კინო-ჩვენებები &amp; დისკუსიები": "Cinema Screenings & Cine-Club",
        "📸 დაასკანერეთ ტელეფონის კამერით": "📸 Scan with your phone camera",
        "გადახდა დავასრულე - დადასტურება": "Payment Completed - Confirm",
        "14:30 — 16:30 (Coworking სესია)": "14:30 — 16:30 (Coworking Session)",
        "2. Soft Vintage (რბილი ვინტაჟი)": "2. Soft Vintage",
        "არტ-თერაპია და შინაგანი ბალანსი": "Art Therapy and Inner Balance",
        "ახალგაზრდა ხელოვანთა მხარდაჭერა": "Supporting Emerging Artists",
        "ბიზნეს-მასტერკლასები & ქოუჩინგი": "Business Masterclasses & Coaching",
        "გაცნობიერებული ყოფნა აქ და ახლა": "Mindful presence in the here and now",
        "გახდით მეტაფორას კლუბების წევრი": "Become a Member of Metaphora Clubs",
        "ემოციური თვითრეგულაციის უნარები": "Emotional self-regulation skills",
        "ინდივიდუალური ბიზნეს-მენტორინგი": "One-on-One Business Mentoring",
        "ინტელექტუალური დისკუსია & კლუბი": "Intellectual Discussion & Club",
        "მოდერირებული ცოცხალი განხილვები": "Moderated live discussions",
        "მარიკა — Personal & Business Coach": "Marika — Personal & Business Coach",
        "პოდკასტები &amp; ღია ჩანაწერები": "Podcasts &amp; Live Recordings",
        "რას სთავაზობს მეტაფორა ბიზნესს?": "What does Metaphora offer for Business?",
        "ყავის და ჩაის შეუზღუდავი წვდომა": "Unlimited artisanal coffee & tea access",
        "ცხოვრების 4 სფეროს ჰარმონიზაცია": "Harmonizing the 4 key life balance dimensions",
        "💡 Think Tank & Playback დარბაზი": "💡 Think Tank & Playback Hall",
        "საგანმანათლებლო-გასართობი ჰაბი": "Edutainment Hub",
        "მიმართულებები & შესაძლებლობები": "Pillars & Opportunities",
        "Community Manager & Clubs Host": "Community Manager & Clubs Host",
        "აირჩიეთ სერვისი ან მიმართულება": "Select Service or Pillar",
        "🏛️ მესამე სივრცე &amp; კლუბები": "🏛️ Third Place & Clubs",
        "ბიზნეს-ვორქშოფები & ტრენინგები": "Business Workshops & Masterclasses",
        "Playback თეატრის პერფორმანსები": "Playback Theatre Performances",
        "გამოფენები &amp; არტ-საღამოები": "Art Exhibitions & Cultural Evenings",
        "✓ სრული რეკვიზიტები დაკოპირდა!": "✓ Full Requisites Copied!",
        "ჯავშანი და გადახდა დადასტურდა!": "Booking & Payment Confirmed!",
        "Playback იმპროვიზაციული თეატრი": "Playback Improvisational Theatre",
        "Themed Bar & სამაგიდო თამაშები": "Themed Bar & Board Games",
        "ნათია — PTT მასტერის კანდიდატი &amp; WAPP ფსიქო-კონსულტანტი": "Natia — PTT Master Candidate &amp; WAPP Psychoconsultant",
        "ნათია — PTT მასტერის კანდიდატი & WAPP ფსიქო-კონსულტანტი": "Natia — PTT Master Candidate & WAPP Psychoconsultant",
        "გულწრფელი და ღრმა ურთიერთობები": "Genuine and meaningful connections",
        "თვითშემეცნების სალონური წრეები": "Self-Discovery Salon Circles",
        "იდეების ლაბორატორია (Idea Lab)": "Idea Lab",
        "კვალიფიციური ბიზნეს-კონტაქტები": "Qualified business network",
        "კომუნის შეხვედრა & ნეთვორქინგი": "Community Mixer & Networking",
        "კრეატიული აზროვნების ტექნიკები": "Creative thinking techniques",
        "მკაფიო და სწრაფი მსუბუქი წკაპი": "Clear and swift light snap",
        "სალონური დისკუსიები & დებატები": "Salon Discussions & Debates",
        "სამაგიდო თამაშები &amp; კომუნა": "Board Games &amp; Community",
        "სტრეს-მენეჯმენტი & Mindfulness": "Stress Management & Mindfulness",
        "ყველა საჭირო ხარისხიანი მასალა": "All required premium art materials provided",
        "შესაძლებლობები &amp; ფორმატები": "Opportunities &amp; Formats",
        "ჩაი, ყავა და მეგობრული დიალოგი": "Tea, specialty coffee, and friendly dialogue",
        "ციფრული მასალები და შეჯამებები": "Digital reading packets and executive summaries",
        "ცოცხალი იმპროვიზაცია და მუსიკა": "Live improvisation and acoustic music",
        "⌨️ კლავიშის 1 დაჭერის საუნდები": "⌨️ Keystroke Single Sound Player",
        "🏛️ მესამე ადგილი &amp; კლუბები": "🏛️ Third Place &amp; Clubs",
        "Edutainment Hub & Third Place": "Edutainment Hub & Third Place",
        "მეტაფორას აუდიო ვიზუალიზატორი": "Metaphora Audio Visualizer",
        "დაგვიკავშირდით &amp; გვეწვიეთ": "Contact Us & Visit",
        "🎨 ხელოვნება &amp; პერფორმანსი": "🎨 Art & Performance",
        "პროგრამის დეტალები & მოდულები": "Program Details & Modules",
        "ცოცხალი შემოქმედებითი პროცესი": "Live Interactive Creative Process",
        "Lifestyle & ინტერესთა კლუბები": "Lifestyle & Special Interest Clubs",
        "დაასკანერეთ ტელეფონის კამერით": "Scan with your phone camera",
        "Wellbeing &amp; ჰობის კლუბები": "Wellbeing &amp; Hobby Clubs",
        "აირჩიეთ მიმართულება / სერვისი": "Select Direction / Service",
        "ვორქშოფი & ჯგუფური ინტერაქცია": "Workshop & Group Interaction",
        "თემატური საღამო & პრეზენტაცია": "Themed Evening & Presentation",
        "მედია-არქივის ხელმისაწვდომობა": "Access to media archives",
        "მეტაფორას Google Maps ლოკაცია": "Metaphora on Google Maps",
        "უნიკალური ატმოსფერო და გარემო": "Unique and inspiring ambiance",
        "🌱 თვითშემეცნება &amp; ბალანსი": "🌱 Self-Discovery &amp; Balance",
        "🌱 შინაგანი ძალა &amp; ბალანსი": "🌱 Inner Strength &amp; Balance",
        "🎨 Playback თეატრი & ხელოვნება": "🎨 Playback Theatre & Fine Arts",
        "📞 საკონტაქტო ტელეფონის ნომერი": "📞 Contact Phone Number",
        "აღმოაჩინეთ მეტაფორას სამყარო": "Discover the World of Metaphora",
        "Business & Partnerships Lead": "Business & Partnerships Lead",
        "📚 წიგნის კლუბი & ღია დიალოგი": "📚 Book Club & Open Dialogue",
        "მოწვეული სპიკერების ლექციები": "Guest Speaker Series",
        "არტ-თერაპია &amp; ვორქშოფები": "Art Therapy & Creative Workshops",
        "აირჩიეთ ბანკი გადასასვლელად:": "Choose your mobile bank:",
        "გადასარიცხი თანხა (საფასური)": "Transfer Amount (Fee)",
        "1. Crisp Click (სუფთა კლიკი)": "1. Crisp Click",
        "3. Deep Strike (ღრმა კნოპკა)": "3. Deep Strike",
        "4. Quick Snap (სწრაფი წკაპი)": "4. Quick Snap",
        "B2B პარტნიორობა & მენტორინგი": "B2B Partnership & Mentoring",
        "ავტორებთან პირადი გასაუბრება": "Personal conversations with authors",
        "არტ-თერაპიული ხატვის სესიები": "Art-Therapeutic Painting Sessions",
        "გამოფენები &amp; არტ-გალერეა": "Exhibitions &amp; Art Gallery",
        "გუნდის შემოქმედებითი პროცესი": "Creative Teamwork in Action",
        "მრავალფეროვანი პერსპექტივები": "Diverse perspectives",
        "სალონური შეხვედრა & დისკუსია": "Salon Gathering & Discussion",
        "სამაგიდო თამაშების საღამოები": "Board Game Nights",
        "სტრატეგიული სალონური სესიები": "Strategic Salon Sessions",
        "ცოცხალი აკუსტიკური შესრულება": "Live acoustic performances",
        "ცოცხალი აუდიტორიის ჩართულობა": "Engaged live audience participation",
        "🎨 მეტაფორას მოზაიკა & დეკორი": "🎨 Metaphora Mosaic & Decor",
        "💼 B2B ნეთვორქინგი &amp; ზრდა": "💼 B2B Networking &amp; Growth",
        "🌱 სერვისები &amp; სივრცეები": "🌱 Services & Spaces",
        "გაიზარდე &amp; ითანამშრომლე": "Grow & Collaborate",
        "გუნდის ხმა &amp; შეფასებები": "Team Voice & Stories",
        "დამფუძნებელი & ფასილიტატორი": "Founder & Facilitator",
        "Creative Producer & Curator": "Creative Producer & Curator",
        "💼 ბიზნესი &amp; პარტნიორობა": "💼 Business & Partnerships",
        "🧠 ინტელექტუალური დისკუსიები": "🧠 Intellectual Discussions",
        "თვითშემეცნება &amp; ბალანსი": "Self-Discovery & Balance",
        "კინო-ჩვენებები & დისკუსიები": "Cinema Screenings & Cine-Club",
        "გადახდა საბანკო გადარიცხვით": "Payment by Bank Transfer",
        "ადგილის დაჯავშნა მეტაფორაში": "Book a Spot at Metaphora",
        "არტ-თერაპია &amp; მხატვრობა": "Art Therapy &amp; Painting",
        "თემატური სალონური საღამოები": "Themed Salon Evenings",
        "ინტიმური და თბილი ატმოსფერო": "Intimate and warm atmosphere",
        "პოდკასტები & ღია ჩანაწერები": "Podcasts & Live Recordings",
        "შემოქმედებითი მიმართულებები": "Creative Disciplines",
        "🎭 ღონისძიებები &amp; თეატრი": "🎭 Events &amp; Theatre",
        "🏛️ მესამე სივრცე & კლუბები": "🏛️ Third Place & Clubs",
        "კომუნა &amp; მესამე სივრცე": "Community & Third Space",
        "მიმართულების უპირატესობები": "Pillar Advantages",
        "გამოფენები & არტ-საღამოები": "Art Exhibitions & Cultural Evenings",
        "ფოტოარქივი &amp; მომენტები": "Photo Archive & Moments",
        "მჭიდრო და მზრუნველი კომუნა": "Close-knit and supportive community",
        "სამაგიდო თამაშები & კომუნა": "Board Games & Community",
        "სტრესორების იდენტიფიცირება": "Identifying core stress triggers",
        "შესაძლებლობები & ფორმატები": "Opportunities & Formats",
        "← მთავარ გვერდზე დაბრუნება": "← Return to Main Page",
        "✨ მესამე ადგილის ფილოსოფია": "✨ Third Place Philosophy",
        "🏛️ მესამე ადგილი & კლუბები": "🏛️ Third Place & Clubs",
        "მანიფესტი &amp; ფილოსოფია": "Manifesto & Philosophy",
        "სერვისები &amp; სივრცეები": "Services & Spaces",
        "🌱 1. Personal Development": "🌱 1. Personal Development",
        "🎭 Playback თეატრის საღამო": "🎭 Playback Theatre Evening",
        "დაგვიკავშირდით & გვეწვიეთ": "Contact Us & Visit",
        "🎨 ხელოვნება & პერფორმანსი": "🎨 Art & Performance",
        "პერფორმანსი &amp; ენერგია": "Performance & Energy",
        "სამაგიდო თამაშების სალონი": "Board Games Salon",
        "Wellbeing & ჰობის კლუბები": "Wellbeing & Hobby Clubs",
        "თვითშემეცნების ვორქშოფები": "Self-Discovery Workshops",
        "🌱 თვითშემეცნება & ბალანსი": "🌱 Self-Discovery & Balance",
        "🌱 შინაგანი ძალა & ბალანსი": "🌱 Inner Strength & Balance",
        "🏛️ სივრცეები &amp; ლაუნჯი": "🏛️ Spaces &amp; Lounge",
        "3. Think Tank - მეტაფორა": "3. Think Tank - METAPHORA",
        "მესამე ადგილის კონცეფცია": "Third Place Concept",
        "იპოვე შენი შინაგანი ძალა": "Find Your Inner Power",
        "გაიცანით მეტაფორას გუნდი": "Meet the Metaphora Team",
        "პოზიტიური ფსიქოთერაპევტი": "Positive Psychotherapist",
        "Playback თეატრის არტისტი": "Playback Theatre Artist",
        "🧠 3. მეტაფორა Think Tank": "🧠 3. Metaphora Think Tank",
        "მზად ხართ შემოგვიერთდეთ?": "Ready to Join Us?",
        "არტ-თერაპია & ვორქშოფები": "Art Therapy & Creative Workshops",
        "სტატიები &amp; სიახლეები": "Articles & News",
        "სრული სტატიის წაკითხვა →": "Read Full Article →",
        "როგორია სამუშაო საათები?": "What are your opening hours?",
        "B2B ნეთვორქინგ საღამოები": "B2B Networking Evenings",
        "გამოფენები & არტ-გალერეა": "Exhibitions & Art Gallery",
        "მეტაფორას წიგნების კლუბი": "Metaphora Book Club",
        "პოლემიკის მაღალი კულტურა": "Culture of high-standard constructive debate",
        "რეალური ქეისების ანალიზი": "Real-world business case studies",
        "საწყის გვერდზე დაბრუნება": "Return to Start Page",
        "წიგნების &amp; კინოკლუბი": "Books &amp; Film Club",
        "👤 თქვენი სახელი და გვარი": "👤 Your Full Name",
        "💼 B2B ნეთვორქინგი & ზრდა": "💼 B2B Networking & Growth",
        "📍 ლოკაცია &amp; კონტაქტი": "📍 Location &amp; Contact",
        "🧠 ინტელექტუალური დიალოგი": "🧠 Intellectual Dialogue",
        "🌱 სერვისები & სივრცეები": "🌱 Services & Spaces",
        "1. Personal Development": "1. Personal Development",
        "გაიზარდე & ითანამშრომლე": "Grow & Collaborate",
        "🏛️ შენი „მესამე სივრცე“": "🏛️ Your 'Third Place'",
        "საწყის გვერდზე გადასვლა": "Go to Home Page",
        "ხელოვნება &amp; ენერგია": "Art & Energy",
        "განრიგი &amp; პოსტერები": "Schedule & Posters",
        "გუნდის ხმა & შეფასებები": "Team Voice & Stories",
        "შეტყობინება / კომენტარი": "Message / Comment",
        "ყოველდღე: 10:00 — 23:00": "Every day: 10:00 — 23:00",
        "🌱 პიროვნული განვითარება": "🌱 Personal Development",
        "💼 ბიზნესი & პარტნიორობა": "💼 Business & Partnerships",
        "თვითშემეცნება & ბალანსი": "Self-Discovery & Balance",
        "რას მოიცავს მიმართულება": "What the Pillar Includes",
        "სტრატეგიული ნეთვორქინგი": "Strategic Networking",
        "ინტელექტუალური დებატები": "Intellectual Debates",
        "როგორი სივრცეები გაქვთ?": "What spaces do you have?",
        "ანგარიშის ნომერი (IBAN)": "Account Number (IBAN)",
        "ავტორი: მეტაფორას გუნდი": "Author: Metaphora Team",
        "არტ-თერაპია & მხატვრობა": "Art Therapy & Painting",
        "გამცნობი გეიმ-მასტერები": "Friendly Game Masters",
        "მეტაბოტი — AI ასისტენტი": "MetaBot — AI Assistant",
        "ღრმა ემოციური კათარზისი": "Deep emotional catharsis",
        "🎭 ღონისძიებები & თეატრი": "🎭 Events & Theatre",
        "💼 B2B &amp; ნეთვორქინგი": "💼 B2B &amp; Networking",
        "🚪 შესასვლელი &amp; ფოიე": "🚪 Entrance &amp; Foyer",
        "2. Business - მეტაფორა": "2. Business - METAPHORA",
        "გაიცანით ჩვენი წევრები": "Meet Our Members",
        "ყოველთვიური ღონისძიება": "Monthly Events",
        "3. მეტაფორა Think Tank": "3. Metaphora Think Tank",
        "ლალი - მეტაფორას გუნდი": "Lali - Metaphora Team",
        "💼 2. მეტაფორა Business": "💼 2. Metaphora Business",
        "თქვენი სახელი და გვარი": "Your First and Last Name",
        "დაჯავშნე კონსულტაცია ✨": "Book Consultation ✨",
        "დაესწარი პერფორმანსს 🎭": "Attend Performance 🎭",
        "კონტაქტი &amp; ლოკაცია": "Contact & Location",
        "Playback თეატრის მაგია": "Magic of Playback Theatre",
        "პარტნიორობა &amp; ზრდა": "Partnership & Growth",
        "კომუნა & მესამე სივრცე": "Community & Third Space",
        "პოზიტიური ფსიქოთერაპია": "Positive Psychotherapy",
        "ავტორიტეტული სპიკერები": "Authoritative Keynote Speakers",
        "🌟 რჩეული სტატია • 5 წთ": "🌟 Featured Article • 5 min",
        "☕ პროდუქტიულობა • 3 წთ": "☕ Productivity • 3 min",
        "🎨 თვითგამოხატვა • 5 წთ": "🎨 Self-Expression • 5 min",
        "თეატრი & ემოცია • 4 წთ": "Theatre & Emotion • 4 min",
        "ფოტოარქივი & მომენტები": "Photo Archive & Moments",
        "რა ღონისძიებები გაქვთ?": "What events are coming up?",
        "დომინანტი ფერის შეცვლა": "Change Dominant Theme Color",
        "გსურთ ადგილის დაჯავშნა": "Looking to book a spot?",
        "Think Tank - მეტაფორა": "Think Tank - METAPHORA",
        "მანიფესტი & ფილოსოფია": "Manifesto & Philosophy",
        "სერვისები & სივრცეები": "Services & Spaces",
        "მოძებნე მეტაფორაში...": "Search in Metaphora...",
        "Think Tank მოდერატორი": "Think Tank Moderator",
        "Clubs Host • მეტაფორა": "Clubs Host • Metaphora",
        "სერვისი / მიმართულება": "Service / Pillar",
        "👥 სტუმრების რაოდენობა": "👥 Number of Guests",
        "ჯავშნის დადასტურება ✨": "Confirm Booking ✨",
        "Google Maps-ში გახსნა": "Open Map",
        "🧠 სალონური დისკუსიები": "🧠 Salon Discussions",
        "🏛️ სივრცეები & ლაუნჯი": "🏛️ Spaces & Lounge",
        "არტ-თერაპია & ბალანსი": "Art Therapy & Balance",
        "დებატები &amp; იდეები": "Debates & Ideas",
        "პერფორმანსი & ენერგია": "Performance & Energy",
        "Executive Roundtables": "Executive Roundtables",
        "კურირებული გამოფენები": "Curated Art Exhibitions",
        "📚 წიგნის კლუბი • 4 წთ": "📚 Book Club • 4 min",
        "წიგნების კლუბი • 4 წთ": "Book Club • 4 min",
        "მეტაფორას ფოტოგალერეა": "Metaphora Photo Gallery",
        "ღონისძიებები & თეატრი": "Events & Theatre",
        "✨ მეტაფორას ატმოსფერო": "✨ Metaphora Atmosphere",
        "ენის შეცვლა (KA / EN)": "Change Language (KA / EN)",
        "5+ ადამიანი (ჯგუფური)": "5+ People (Group)",
        "ენის შეცვლა (GE / EN)": "Change Language (GE / EN)",
        "მაგ: გიორგი მაისურაძე": "e.g., Giorgi Maisuradze",
        "შესასვლელი &amp; ფოიე": "Entrance &amp; Foyer",
        "სერვისები - მეტაფორა": "Services - METAPHORA",
        "შენი „მესამე სივრცე“": "Your 'Third Place'",
        "აღმოაჩინე „მეტაფორა“": "Discover Metaphora",
        "თემატური მიმართულება": "Themed Pillars",
        "2. მეტაფორა Business": "2. Metaphora Business",
        "— შენი მესამე ადგილი": "— Your Third Place",
        "🏛️ 5. მეტაფორა Clubs": "🏛️ 5. Metaphora Clubs",
        "კონსულტაციის ჯავშანი": "Consultation Booking",
        "📍 ლოკაცია & კონტაქტი": "📍 Location & Contact",
        "ყველა უფლება დაცულია": "All rights reserved",
        "← მთავარზე დაბრუნება": "← Back to Home",
        "პროექტების ინკუბაცია": "Project Incubation",
        "ღია დებატების ფორუმი": "Open Debate Forum",
        "წიგნების & კინოკლუბი": "Books & Film Club",
        "სტატიები & სიახლეები": "Articles & News",
        "პროდუქტიულობა • 3 წთ": "Productivity • 3 min",
        "თვითგამოხატვა • 5 წთ": "Self-Expression • 5 min",
        "ხალხი &amp; ემოციები": "People & Emotions",
        "გადახდაზე გადასვლა 💳": "Proceed to Payment 💳",
        "5. Clubs - მეტაფორა": "5. Clubs - METAPHORA",
        "Business - მეტაფორა": "Business - METAPHORA",
        "ხელოვნება & ენერგია": "Art & Energy",
        "განრიგი & პოსტერები": "Schedule & Posters",
        "მეტაფორას მანიფესტი": "Metaphora Manifesto",
        "✨ მყისიერი დაჯავშნა": "✨ Instant Booking",
        "ჩაერთე დისკუსიაში 🧠": "Join Discussion 🧠",
        "თბილისი, საქართველო": "Tbilisi, Georgia",
        "💼 B2B & ნეთვორქინგი": "💼 B2B & Networking",
        "დაინტერესდით თემით?": "Interested in this topic?",
        "სალონური დისკუსიები": "Salon Dialogues",
        "🧠 ფსიქოლოგია • 6 წთ": "🧠 Psychology • 6 min",
        "მეტაფორას ინტერიერი": "Metaphora Interior",
        "🚪 შესასვლელი & ფოიე": "🚪 Entrance & Foyer",
        "მისწერე მეტაბოტს...": "Type to MetaBot...",
        "დაწერეთ შეკითხვა...": "Type your message...",
        "რა სერვისები გაქვთ?": "What services do you offer?",
        "🌿 რა არის მეტაფორა?": "🌿 What is Metaphora?",
        "გალერეა - მეტაფორა": "Gallery - METAPHORA",
        "ღილაკს შესასვლელად": "button to enter",
        "ზრდა &amp; ბალანსი": "Growth & Balance",
        "ადგილის დაჯავშნა ✨": "Reserve Seat ✨",
        "მაგ: გიორგი ბერიძე": "e.g. Giorgi Beridze",
        "📅 სასურველი თარიღი": "📅 Preferred Date",
        "დაჯავშნის გაგზავნა": "Send Booking",
        "დაჯავშნე მაგიდა 🏛️": "Book a Table 🏛️",
        "კონტაქტი & ლოკაცია": "Contact & Location",
        "3. Playback თეატრი": "3. Playback Theatre",
        "სივრცეები & ლაუნჯი": "Spaces & Lounge",
        "პარტნიორობა & ზრდა": "Partnership & Growth",
        "მთავარზე დაბრუნება": "Back to Home",
        "Mastermind ჯგუფები": "Mastermind Circles",
        "Think Tank დარბაზი": "Think Tank Hall",
        "სტატიები & ფიქრები": "Articles & Reflections",
        "სტატიის წაკითხვა 📖": "Read Article 📖",
        "გადახდაზე გადასვლა": "Proceed to Payment",
        "გაიცანით მეტაფორას": "Meet Metaphora",
        "საუნდის საფუძველზე": "based on keystroke sound",
        "4. Art - მეტაფორა": "4. Art - METAPHORA",
        "👥 მეტაფორას გუნდი": "👥 Metaphora Team",
        "გაეცანი სერვისებს": "Explore Services",
        "5. მეტაფორა Clubs": "5. Metaphora Clubs",
        "დაჯავშნე ადგილი ✨": "Reserve a Seat ✨",
        "Instagram პროფილი": "Instagram Profile",
        "დაჯავშნე ვიზიტი ✨": "Book a Visit ✨",
        "🎨 4. მეტაფორა Art": "🎨 4. Metaphora Art",
        "🕒 დროის ინტერვალი": "🕒 Time Slot",
        "გახდი პარტნიორი 💼": "Become a Partner 💼",
        "სოციალური ქსელები": "Social Media",
        "🎭 Playback თეატრი": "🎭 Playback Theatre",
        "დებატები & იდეები": "Debates & Ideas",
        "🎬 ვიდეო მიმოხილვა": "🎬 Video Overview",
        "სრულად წაკითხვა →": "Read Full Story →",
        "2026 წლის აგვისტო": "August 2026",
        "ფსიქოლოგია • 6 წთ": "Psychology • 6 min",
        "მეტაფორას გალერეა": "Metaphora Gallery",
        "მეტაფორას მოზაიკა": "Metaphora Mosaic",
        "შესასვლელი & ფოიე": "Entrance & Foyer",
        "მეტაფორას AI გიდი": "Metaphora AI Guide",
        "რა არის მეტაფორა?": "What is Metaphora?",
        "გამარჯობა! მე ვარ": "Hello! I am",
        "საქართველოს ბანკი": "Bank of Georgia",
        "მეტაფორას ჯავშანი": "Metaphora Booking",
        "ბლოგი - მეტაფორა": "Blog - METAPHORA",
        "Clubs - მეტაფორა": "Clubs - METAPHORA",
        "👥 გუნდის წევრები": "👥 Team Members",
        "📞 დაგვიკავშირდით": "📞 Contact Us",
        "📅 ონლაინ ჯავშანი": "📅 Online Booking",
        "✨ ონლაინ ჯავშანი": "✨ Online Booking",
        "სერვისების ნახვა": "View Services",
        "შეუერთდი კომუნას": "Join Community",
        "შინაური გარემო ★": "Home Atmosphere ★",
        "ადგილის დაჯავშნა": "Reserve Seat",
        "ნათია ქოდუა": "Natia Kodua",
        "მარიკა ხალიანი": "Marika Khaliani",
        "Facebook პროფილი": "Facebook Profile",
        "ონლაინ ჯავშანი ✨": "Online Booking ✨",
        "ტელეფონის ნომერი": "Phone Number",
        "სამუშაო საათები:": "Working Hours:",
        "Deep Work გარემო": "Deep Work Environment",
        "ხალხი & ემოციები": "People & Emotions",
        "ონლაინ ასისტენტი": "Online Assistant",
        "მეტაბოტი წერს...": "MetaBot is typing...",
        "როგორ დავჯავშნო?": "How do I book?",
        "შექმნილია თქვენი": "Crafted for your",
        "✨ ჩვენს შესახებ": "✨ About Us",
        "მეტაფორას გუნდი": "Metaphora Team",
        "🧠 3. Think Tank": "🧠 3. Think Tank",
        "შედი მეტაფორაში": "Enter Metaphora",
        "სალონური გარემო": "Salon Atmosphere",
        "4. მეტაფორა Art": "4. Metaphora Art",
        "დაჯავშნე ადგილი": "Reserve a Seat",
        "დაჯავშნე ეხლავე": "Book Now",
        "ქეთი ჟვანია": "Keti Zhvania",
        "ქეთი მირიანაშვილი": "Keti Mirianashvili",
        "ჩვენი ფილოსოფია": "Our Philosophy",
        "დაჯავშნე ვიზიტი": "Book a Visit",
        "აირჩიეთ სერვისი": "Select Service",
        "სახელი და გვარი": "Full Name",
        "თქვენი ელ-ფოსტა": "Your Email Address",
        "სამუშაო საათები": "Working Hours",
        "📍 მეტაფორა ჰაბი": "📍 Metaphora Hub",
        "Playback თეატრი": "Playback Theatre",
        "რატომ მეტაფორა?": "Why Metaphora?",
        "გადადი სივრცეში": "Enter Space",
        "მეტაფორას ბლოგი": "Metaphora Blog",
        "🌟 რჩეული სტატია": "🌟 Featured Article",
        "სტატიის სათაური": "Article Title",
        "☕ პროდუქტიულობა": "☕ Productivity",
        "🍸 კომუნა • 4 წთ": "🍸 Community • 4 min",
        "🎨 თვითგამოხატვა": "🎨 Self-Expression",
        "სად მდებარეობთ?": "Where are you located?",
        "Art - მეტაფორა": "Art - METAPHORA",
        "გუნდის წევრები": "Team Members",
        "დაგვიკავშირდით": "Contact Us",
        "ონლაინ ჯავშანი": "Online Booking",
        "მიმართულება 01": "Pillar 01",
        "მიმართულება 02": "Pillar 02",
        "მიმართულება 03": "Pillar 03",
        "მიმართულება 04": "Pillar 04",
        "მიმართულება 05": "Pillar 05",
        "ზრდა & ბალანსი": "Growth & Balance",
        "შესაძლებლობები": "Opportunities",
        "აღმოაჩინე მეტი": "Discover More",
        "გაიცანი სივრცე": "Explore Space",
        "წიგნების კლუბი": "Book Club",
        "6 წთ საკითხავი": "6 min read",
        "5 წთ საკითხავი": "5 min read",
        "4 წთ საკითხავი": "4 min read",
        "3 წთ საკითხავი": "3 min read",
        "წაიკითხე ბლოგი": "Read Blog",
        "📚 წიგნის კლუბი": "📚 Book Club",
        "გალერეის ნახვა": "View Gallery",
        "📅 ღონისძიებები": "📅 Events",
        "ჩვენს შესახებ": "About Us",
        "გაიცანი წევრი": "Meet Member",
        "3. Think Tank": "3. Think Tank",
        "💼 2. Business": "💼 2. Business",
        "შესვლა საიტზე": "Enter Website",
        "აქტიური წევრი": "Active Members",
        "მიმართულებები": "Pillars",
        "შინაგანი ძალა": "Inner Power",
        "მესამე სივრცე": "Third Space",
        "მესამე ადგილი": "Third Place",
        "WhatsApp ჩატი": "WhatsApp Chat",
        "ჰარმონიისთვის": "harmony",
        "შემოგვიერთდით": "Join Us",
        "თქვენი სახელი": "Your Name",
        "რჩეული სტატია": "Featured Article",
        "კომუნა • 4 წთ": "Community • 4 min",
        "ღონისძიებებზე": "events",
        "ანი მაისურაძე": "Ani Maisuradze",
        "აფიშის ნახვა": "View Events",
        "ლალი ბადრიძე": "Lali Badridze",
        "ია ხიდირბეგიშვილი": "Ia Khidirbegishvili",
        "თეო ფერაძე": "Teo Peradze",
        "დამფუძნებელი": "Founder",
        "სრული სახელი": "Full Name",
        "3-4 ადამიანი": "3-4 People",
        "რუკის გახსნა": "Open Map",
        "ყველა სტატია": "All Articles",
        "აგვისტო 2026": "August 2026",
        "🧠 ფსიქოლოგია": "🧠 Psychology",
        "✨ ყველა ფოტო": "✨ All Photos",
        "ღონისძიებები": "Events",
        "ფოტოკოლექცია": "Photo Collection",
        "🏛️ სივრცეები": "🏛️ Spaces",
        "თიბისი ბანკი": "TBC Bank",
        "✓ დაკოპირდა!": "✓ Copied!",
        "🌱 სერვისები": "🌱 Services",
        "2. Business": "2. Business",
        "🏛️ 5. Clubs": "🏛️ 5. Clubs",
        "ნეთვორქინგი": "Networking",
        "შემოქმედება": "Creativity",
        "ჩვენ ვქმნით": "We create",
        "იდეებისა და": "for ideas &",
        "ადამიანების": "people's",
        "მეტაფორაში.": "at Metaphora.",
        "დანიშნულება": "Payment Purpose",
        "მეტაფორაში?": "at Metaphora?",
        "🖼️ გალერეა": "🖼️ Gallery",
        "📞 კონტაქტი": "📞 Contact",
        "დისკუსიები": "Discussions",
        "1 ადამიანი": "1 Person",
        "2 ადამიანი": "2 People",
        "მისამართი:": "Address:",
        "გაიგე მეტი": "Learn More",
        "ფსიქოლოგია": "Psychology",
        "ყველა ფოტო": "All Photos",
        "სერვისებზე": "services",
        "სივრცეებზე": "spaces",
        "📋 კოპირება": "📋 Copy",
        "„მეტაფორა“": "“Metaphora”",
        "🏠 მთავარი": "🏠 Home",
        "სერვისები": "Services",
        "ტელეფონი:": "Phone:",
        "ელ.ფოსტა:": "Email:",
        "მისამართი": "Address",
        "ხელოვნება": "Art",
        "სივრცეები": "Spaces",
        "დახურვა ✨": "Close ✨",
        "აღმოაჩინე": "Discover",
        "მანიფესტი": "Manifesto",
        "▶ მოსმენა": "▶ Listen",
        "5. Clubs": "5. Clubs",
        "🎨 4. Art": "🎨 4. Art",
        "კონტაქტი": "Contact",
        "ქეთი": "Keti",
        "ტელეფონი": "Phone",
        "ელ-ფოსტა": "Email Address",
        "გაგზავნა": "Send",
        "🍸 კომუნა": "🍸 Community",
        "მეტაბოტი": "MetaBot",
        "ჯავშანზე": "booking",
        "საფასური": "Fee",
        "კოპირება": "Copy",
        "მეტაფორა": "METAPHORA",
        "მთავარი": "Home",
        "გალერეა": "Gallery",
        "📖 ბლოგი": "📖 Blog",
        "დაწყება": "Explore",
        "მოსმენა": "Listen",
        "დახურვა": "Close",
        "ბიზნესი": "Business",
        "კლუბები": "Clubs",
        "მიმღები": "Recipient",
        "გაიცანი": "Meet",
        "ჯავშანი": "Booking",
        "4. Art": "4. Art",
        "ნათია": "Natia",
        "ია": "Ia",
        "სანდრო": "Sandro",
        "მესამე": "a third",
        "ადგილს": "place",
        "თარიღი": "Date",
        "კომუნა": "Community",
        "← უკან": "← Back",
        "ბლოგი": "Blog",
        "ძიება": "Search",
        "ნახვა": "Explore",
        "აფიშა": "Events & Posters",
        "თეო": "Teo",
        "პაუზა": "Pause",
        "ბანკი": "Bank",
        "გუნდი": "Team",
        "ლალი": "Lali",
        "მარიკა": "Marika",
        "4 წთ": "4 min",
        "5 წთ": "5 min",
        "6 წთ": "6 min",
        "3 წთ": "3 min",
        "დრო": "Time",
        "ან": "or"
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
                { name: 'ლალი', jobtitle: 'ფსიქოთერაპევტი, ტრენერი & ასოციაციის პრეზიდენტი', text: '„მეტაფორა“ არის გარემო, სადაც იდეები ცოცხლდებიან, ხოლო ადამიანები და შესაძლებლობები ერთმანეთს პოულობენ. აქ ყველაფერია შენი განვითარებისა და შთაგონებისთვის.' },
                { name: 'ქეთი', jobtitle: 'ქოუჩინგი, ტრენინგები & ფსიქოკონსულტირება', text: 'პერსონალური ქოუჩინგი, პიროვნული განვითარების ტრენინგები და პოზიტიური ფსიქოკონსულტირება ეხმარება ადამიანებს შინაგანი ძალის, ბალანსისა და ჰარმონიის პოვნაში.' },
                { name: 'ნათია', jobtitle: 'პოზიტიური ფსიქოთერაპევტი & ფსიქოკონსულტანტი', text: 'პოზიტიური და ტრანსკულტურალური ფსიქოთერაპია ეხმარება ადამიანს საკუთარი შინაგანი შესაძლებლობების აღმოჩენასა და ცხოვრებისეული გამოწვევების რესურსად გარდაქმნაში.' },
                { name: 'მარიკა', jobtitle: 'პერსონალური & ბიზნეს განვითარების ქოუჩი', text: 'ჩვენი მიზანია ადამიანებისა და ბიზნესების გაძლიერება პერსონალური და პროფესიული განვითარების, მართვის კონსალტინგისა და პრაქტიკული ქოუჩინგის გზით.' },
                { name: 'ია', jobtitle: 'ბიზნეს განვითარება & პარტნიორობა', text: 'მეტაფორა Business აერთიანებს მეწარმეებსა და პროფესიონალებს ნაყოფიერი თანამშრომლობის, პარტნიორობისა და ახალი შესაძლებლობების შესაქმნელად.' },
                { name: 'თეო', jobtitle: 'ქოუჩინგი, ტრენინგები & ფსიქოკონსულტირება', text: 'მეტაფორა Clubs არის შენი „მესამე სივრცე“ — ადგილი, სადაც თავს ყოველთვის შინაურად, მყუდროდ და თავისუფლად იგრძნობ თანამოაზრეებთან ერთად.' },
                { name: 'ქეთი', jobtitle: 'ფსიქოკონსულტანტი, ტრენერი & სერტიფიცირებული ქოუჩი', text: 'ჩვენ ვეხმარებით ადამიანებს შინაგანი რესურსების გააქტიურებაში, პიროვნულ ტრანსფორმაციასა და მიზნების მიღწევაში ქოუჩინგისა და პოზიტიური ფსიქოთერაპიის მეთოდებით.' },
                { name: 'ია', jobtitle: 'ქოუჩინგი, ტრენინგები & ფსიქოკონსულტირება', text: 'პერსონალური ქოუჩინგი და პოზიტიური ფსიქოკონსულტირება ქმნის უსაფრთხო გარემოს თვითგამორკვევისთვის, შინაგანი რესურსების გააქტიურებისა და პიროვნული ზრდისთვის.' }
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
                { name: 'Lali', jobtitle: 'Psychotherapist, Trainer & Association President', text: '“Metaphora” is an environment where ideas come to life and people connect with new possibilities. Everything here is crafted for your growth and inspiration.' },
                { name: 'Keti', jobtitle: 'Personal Coaching, Trainings & Psychoconsulting', text: 'Personal coaching, personal development workshops, and positive psychoconsulting help individuals find inner resilience, balance, and emotional harmony.' },
                { name: 'Natia', jobtitle: 'Positive Psychotherapist & Psychoconsultant', text: 'Positive and transcultural psychotherapy empowers individuals to discover their inner strengths and transform life challenges into valuable growth resources.' },
                { name: 'Marika', jobtitle: 'Personal & Business Development Coach', text: 'Our mission is empowering individuals and organizations through personal & business development coaching, management consulting, and transformative training.' },
                { name: 'Ia', jobtitle: 'Business Development & Partnerships', text: 'Metaphora Business unites entrepreneurs and professionals for impactful collaboration, strategic partnerships, and new ventures.' },
                { name: 'Teo', jobtitle: 'Personal Coaching, Trainings & Psychoconsulting', text: 'Metaphora Clubs is your “Third Place” — where you always feel at home, relaxed, and surrounded by kindred spirits.' },
                { name: 'Keti', jobtitle: 'Psychoconsultant, Trainer & Certified Coach', text: 'We empower individuals to activate their inner potential, achieve personal transformation, and reach meaningful goals through coaching and positive psychotherapy.' },
                { name: 'Ia', jobtitle: 'Personal Coaching, Trainings & Psychoconsulting', text: 'Personal coaching and positive psychoconsulting create a safe environment for self-discovery, unlocking inner resources, and personal growth.' }
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

        // Custom data-attribute translation support: data-i18n-en / data-i18n-ka
        if (node.nodeType === Node.ELEMENT_NODE) {
            if (targetLang === 'EN' && node.getAttribute('data-i18n-en')) {
                if (!node._originalKaHtml) node._originalKaHtml = node.innerHTML;
                node.innerHTML = node.getAttribute('data-i18n-en');
                return;
            } else if (targetLang === 'KA' && node._originalKaHtml) {
                node.innerHTML = node._originalKaHtml;
                return;
            }
        }

        if (node.nodeType === Node.TEXT_NODE) {
            const raw = node.nodeValue.trim();
            if (!raw) return;

            if (targetLang === 'EN') {
                if (!node._originalKa) node._originalKa = raw;
                
                // 1. Exact match
                if (I18N_DICTIONARY[raw]) {
                    node.nodeValue = node.nodeValue.replace(raw, I18N_DICTIONARY[raw]);
                    return;
                }
                
                // 2. Normalized whitespace match
                const clean = raw.replace(/\s+/g, ' ');
                if (I18N_DICTIONARY[clean]) {
                    node.nodeValue = node.nodeValue.replace(raw, I18N_DICTIONARY[clean]);
                    return;
                }

                // 3. HTML entity unescape match (&amp; -> &)
                const unescaped = clean.replace(/&amp;/g, '&').replace(/&quot;/g, '"');
                if (I18N_DICTIONARY[unescaped]) {
                    node.nodeValue = node.nodeValue.replace(raw, I18N_DICTIONARY[unescaped]);
                    return;
                }

                // 4. Substring phrase replacement for compound/new phrases containing known Georgian words
                let translated = raw;
                let matched = false;
                for (const [ka, en] of Object.entries(I18N_DICTIONARY)) {
                    if (ka.length > 2 && translated.includes(ka)) {
                        translated = translated.split(ka).join(en);
                        matched = true;
                    }
                }
                if (matched) {
                    node.nodeValue = node.nodeValue.replace(raw, translated);
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
                if (targetLang === 'EN') {
                    if (!node._origPlace) node._origPlace = p;
                    if (I18N_DICTIONARY[p]) {
                        node.placeholder = I18N_DICTIONARY[p];
                    }
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
                    } else {
                        const cleanOpt = optText.replace(/\s+/g, ' ');
                        if (I18N_DICTIONARY[cleanOpt]) {
                            node.textContent = I18N_DICTIONARY[cleanOpt];
                        }
                    }
                } else if (targetLang === 'KA' && node._origOptionText) {
                    node.textContent = node._origOptionText;
                }
            }

            // Handle title attributes
            if (node.getAttribute('title')) {
                const t = node.getAttribute('title').trim();
                if (targetLang === 'EN') {
                    if (!node._origTitle) node._origTitle = t;
                    if (I18N_DICTIONARY[t]) {
                        node.setAttribute('title', I18N_DICTIONARY[t]);
                    }
                } else if (targetLang === 'KA' && node._origTitle) {
                    node.setAttribute('title', node._origTitle);
                }
            }

            // Handle aria-label attributes
            if (node.getAttribute('aria-label')) {
                const al = node.getAttribute('aria-label').trim();
                if (targetLang === 'EN') {
                    if (!node._origAria) node._origAria = al;
                    if (I18N_DICTIONARY[al]) {
                        node.setAttribute('aria-label', I18N_DICTIONARY[al]);
                    }
                } else if (targetLang === 'KA' && node._origAria) {
                    node.setAttribute('aria-label', node._origAria);
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
            if (typeof startManifestoTypewriter === 'function') startManifestoTypewriter(false);
            if (typeof window.refreshActiveArticleLanguage === 'function') window.refreshActiveArticleLanguage(lang);

            // Update MetaBot welcome msg
            const firstBotMsg = document.querySelector('.metabot-msg.bot-msg .metabot-msg-bubble');
            if (firstBotMsg) {
                firstBotMsg.innerHTML = dynData.botWelcome;
            }
        }
    }

    function initI18nLanguageSwitcher() {
        const savedLang = localStorage.getItem('metafora_lang') || 'KA';
        
        if (savedLang === 'EN') {
            setLanguage('EN', false);
        } else {
            document.querySelectorAll('.lang-label, #lang-active-label, #portal-lang-active-label').forEach(lbl => {
                lbl.textContent = 'GE';
            });
        }

        // Global delegated click listener for language toggle buttons
        document.addEventListener('click', (e) => {
            const btn = e.target.closest('.lang-single-btn, #lang-toggle-btn, #portal-lang-toggle-btn');
            if (!btn) return;
            e.preventDefault();
            e.stopPropagation();

            const currentLang = localStorage.getItem('metafora_lang') || 'KA';
            const nextLang = (currentLang === 'KA') ? 'EN' : 'KA';
            
            btn.classList.add('flipping');
            setTimeout(() => btn.classList.remove('flipping'), 380);

            setLanguage(nextLang, true);
        });

        window.setLanguage = setLanguage;
    }

    initI18nLanguageSwitcher();
});
