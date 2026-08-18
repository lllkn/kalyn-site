(function () {
    'use strict';

    var header = document.getElementById('site-header');
    var toggle = document.querySelector('.nav-toggle');
    var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var languageToggle = document.querySelector('.language-toggle');

    function setLanguage(language) {
        var isEnglish = language === 'en';
        document.documentElement.lang = isEnglish ? 'en' : 'zh-CN';
        document.documentElement.dataset.language = language;
        document.querySelectorAll('[data-zh][data-en]').forEach(function (element) {
            element.textContent = element.getAttribute(isEnglish ? 'data-en' : 'data-zh');
        });
        if (languageToggle) {
            languageToggle.classList.toggle('is-en', isEnglish);
            languageToggle.setAttribute('aria-label', isEnglish ? '切换到中文' : 'Switch to English');
        }
        try { localStorage.setItem('kalyn-language', language); } catch (error) { /* Storage may be disabled. */ }
    }

    var savedLanguage = 'zh';
    try { savedLanguage = localStorage.getItem('kalyn-language') || 'zh'; } catch (error) { /* Storage may be disabled. */ }
    setLanguage(savedLanguage);
    if (languageToggle) languageToggle.addEventListener('click', function () {
        setLanguage(document.documentElement.dataset.language === 'en' ? 'zh' : 'en');
    });

    function updateHeader() {
        if (header) header.classList.toggle('is-scrolled', window.scrollY > 18);
    }

    updateHeader();
    window.addEventListener('scroll', updateHeader, { passive: true });

    /* Mark enhancement availability before enabling the animated initial state. */
    document.body.classList.add('js-ready');

    /* ---- 入场编排触发 ---- */
    document.body.classList.add('is-loaded');

    /* ---- 滚动进度条 ---- */
    var progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress';
    progressBar.setAttribute('aria-hidden', 'true');
    document.body.appendChild(progressBar);
    function updateProgress() {
        var max = document.documentElement.scrollHeight - window.innerHeight;
        progressBar.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, window.scrollY / max) : 0) + ')';
    }
    updateProgress();
    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress);

    /* ---- 自定义光标（桌面端） ---- */
    var canHover = window.matchMedia('(hover: hover)').matches && window.innerWidth > 800;
    if (canHover && !prefersReducedMotion && document.body.classList.contains('portfolio-page')) {
        var cursorDot = document.createElement('div');
        var cursorRing = document.createElement('div');
        cursorDot.className = 'cursor-dot';
        cursorRing.className = 'cursor-ring';
        cursorDot.setAttribute('aria-hidden', 'true');
        cursorRing.setAttribute('aria-hidden', 'true');
        document.body.appendChild(cursorDot);
        document.body.appendChild(cursorRing);
        var mouseX = -100, mouseY = -100, ringX = -100, ringY = -100;
        window.addEventListener('mousemove', function (event) {
            mouseX = event.clientX;
            mouseY = event.clientY;
            cursorDot.style.transform = 'translate(' + (mouseX - 3) + 'px,' + (mouseY - 3) + 'px)';
        }, { passive: true });
        (function ringLoop() {
            ringX += (mouseX - ringX) * 0.16;
            ringY += (mouseY - ringY) * 0.16;
            var half = cursorRing.offsetWidth / 2;
            cursorRing.style.transform = 'translate(' + (ringX - half) + 'px,' + (ringY - half) + 'px)';
            requestAnimationFrame(ringLoop);
        }());
        document.querySelectorAll('a, button, .project-card, .interest-cloud span').forEach(function (el) {
            el.addEventListener('mouseenter', function () { cursorRing.classList.add('is-active'); });
            el.addEventListener('mouseleave', function () { cursorRing.classList.remove('is-active'); });
        });
    }

    /* ---- 导航 scrollspy（仅首页锚点） ---- */
    if (document.body.classList.contains('portfolio-page') && 'IntersectionObserver' in window) {
        var navAnchors = Array.from(document.querySelectorAll('.site-nav a[href*="#"]'));
        var spyMap = {};
        navAnchors.forEach(function (link) {
            var id = link.getAttribute('href').split('#')[1];
            if (id) spyMap[id] = link;
        });
        var spyObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                var link = spyMap[entry.target.id];
                if (!link) return;
                navAnchors.forEach(function (a) { a.classList.remove('is-active'); });
                link.classList.add('is-active');
            });
        }, { rootMargin: '-38% 0px -55% 0px' });
        ['profile', 'work', 'life', 'contact'].forEach(function (id) {
            var section = document.getElementById(id);
            if (section) spyObserver.observe(section);
        });
    }

    /* ---- 磁吸按钮 ---- */
    if (canHover && !prefersReducedMotion) {
        document.querySelectorAll('.button, .stack-step, .stack-toggle').forEach(function (el) {
            var strength = 0.28;
            el.addEventListener('mousemove', function (event) {
                var rect = el.getBoundingClientRect();
                var dx = event.clientX - (rect.left + rect.width / 2);
                var dy = event.clientY - (rect.top + rect.height / 2);
                el.style.transform = 'translate(' + (dx * strength).toFixed(1) + 'px,' + (dy * strength).toFixed(1) + 'px)';
            });
            el.addEventListener('mouseleave', function () {
                el.style.transition = 'transform .55s cubic-bezier(.2,.8,.2,1)';
                el.style.transform = '';
                setTimeout(function () { el.style.transition = ''; }, 560);
            });
        });
    }

    if (toggle) {
        toggle.addEventListener('click', function () {
            var open = document.body.classList.toggle('nav-open');
            toggle.setAttribute('aria-expanded', String(open));
            toggle.setAttribute('aria-label', open ? '关闭导航' : '打开导航');
        });
        document.querySelectorAll('.site-nav a').forEach(function (link) {
            link.addEventListener('click', function () {
                document.body.classList.remove('nav-open');
                toggle.setAttribute('aria-expanded', 'false');
            });
        });
    }

    var projectStack = document.querySelector('.kalyn-projects');
    var stackToggle = document.querySelector('.stack-toggle');
    var stackPrev = document.querySelector('.stack-prev');
    var stackNext = document.querySelector('.stack-next');
    var stackProgress = document.querySelector('.stack-progress b');
    var projectClose = document.querySelector('.project-close');
    var projectCards = projectStack ? Array.from(projectStack.querySelectorAll('.project-card')) : [];
    var activeProject = 0;
    var autoplayTimer = null;
    var autoplayDuration = 2600;

    /* ---- 指示点 ---- */
    var carouselDots = [];
    if (projectStack && projectCards.length > 1) {
        var dotsContainer = document.createElement('div');
        dotsContainer.className = 'carousel-dots';
        projectCards.forEach(function (_, index) {
            var dot = document.createElement('button');
            dot.type = 'button';
            dot.setAttribute('aria-label', '跳转到项目 ' + (index + 1));
            dot.addEventListener('click', function (e) {
                e.stopPropagation();
                goToProject(index);
                restartAutoplay();
            });
            dotsContainer.appendChild(dot);
            carouselDots.push(dot);
        });
        projectStack.appendChild(dotsContainer);
    }

    /* ---- 自动播放进度条 ---- */
    var progressBar = null;
    if (projectStack) {
        progressBar = document.createElement('div');
        progressBar.className = 'carousel-progress-bar';
        progressBar.innerHTML = '<span></span>';
        projectStack.appendChild(progressBar);
    }

    function layoutProjectStack(offset) {
        if (!projectStack || projectStack.classList.contains('is-open')) return;
        var stackWidth = projectStack.clientWidth;
        var cardWidth = stackWidth * (window.innerWidth < 800 ? 0.72 : 0.46);

        projectCards.forEach(function (card, index) {
            var delta = index - activeProject;
            var absDelta = Math.abs(delta);
            var x, scale, opacity, rotateY, zIndex;

            if (absDelta > 2) {
                /* 远处的卡片滑出视野 */
                x = delta > 0 ? stackWidth + cardWidth : -cardWidth * 2;
                scale = 0.4;
                opacity = 0;
                rotateY = 0;
                zIndex = 0;
            } else if (delta === 0) {
                /* 居中主卡片 */
                x = (stackWidth - cardWidth) / 2;
                scale = 1;
                opacity = 1;
                rotateY = 0;
                zIndex = 30;
            } else {
                /* 左右相邻卡片，带 3D 倾斜，不透明 */
                var direction = delta > 0 ? 1 : -1;
                x = (stackWidth - cardWidth) / 2 + direction * (cardWidth * 0.82);
                scale = 0.76 - (absDelta - 1) * 0.06;
                opacity = 1;
                rotateY = -direction * 15;
                zIndex = 20 - absDelta * 5;
            }

            card.style.setProperty('--card-x', (x + (offset || 0)) + 'px');
            card.style.setProperty('--card-scale', scale.toFixed(3));
            card.style.setProperty('--card-opacity', opacity.toFixed(2));
            card.style.setProperty('--card-z', String(zIndex));
            card.style.setProperty('--card-rotate-y', rotateY + 'deg');
            card.setAttribute('aria-current', delta === 0 ? 'true' : 'false');
            /* 可见的相邻卡片允许点击 */
            card.classList.toggle('is-nearby', absDelta > 0 && absDelta <= 2);
        });

        /* 更新指示点 */
        carouselDots.forEach(function (dot, i) {
            dot.classList.toggle('is-active', i === activeProject);
        });

        if (stackProgress) stackProgress.textContent = String(activeProject + 1).padStart(2, '0');
        if (stackPrev) stackPrev.disabled = activeProject === 0;
        if (stackNext) stackNext.disabled = activeProject === projectCards.length - 1;
    }

    function goToProject(index) {
        activeProject = Math.max(0, Math.min(projectCards.length - 1, index));
        layoutProjectStack(0);
    }

    function stopProjectAutoplay() {
        if (autoplayTimer) window.clearTimeout(autoplayTimer);
        autoplayTimer = null;
        if (progressBar) {
            progressBar.classList.remove('is-playing');
            /* force reflow to reset animation */
            void progressBar.offsetWidth;
        }
    }

    function restartAutoplay() {
        stopProjectAutoplay();
        startProjectAutoplay();
    }

    function startProjectAutoplay() {
        stopProjectAutoplay();
        if (!projectStack || document.hidden || projectStack.classList.contains('is-open') || projectStack.classList.contains('is-detail')) return;
        if (progressBar) {
            progressBar.classList.remove('is-playing');
            void progressBar.offsetWidth;
            progressBar.classList.add('is-playing');
        }
        autoplayTimer = window.setTimeout(function () {
            goToProject((activeProject + 1) % projectCards.length);
            startProjectAutoplay();
        }, autoplayDuration);
    }

    function setProjectDetail(open) {
        if (!projectStack) return;
        projectStack.classList.toggle('is-detail', open);
        if (open) stopProjectAutoplay();
        else startProjectAutoplay();
    }

    function setStackOpen(open) {
        if (!projectStack || !stackToggle) return;
        projectStack.classList.toggle('is-open', open);
        projectStack.classList.remove('is-detail');
        stackToggle.setAttribute('aria-expanded', String(open));
        if (stackPrev) stackPrev.hidden = open;
        if (stackNext) stackNext.hidden = open;
        if (stackProgress) stackProgress.parentElement.hidden = open;
        var label = stackToggle.querySelector('[data-zh][data-en]');
        if (label) {
            label.setAttribute('data-zh', open ? '收起项目' : '展开全部');
            label.setAttribute('data-en', open ? 'Stack projects' : 'Expand all');
            var isEnglish = document.documentElement.dataset.language === 'en';
            label.textContent = label.getAttribute(isEnglish ? 'data-en' : 'data-zh');
        }
        if (!open) requestAnimationFrame(function () { layoutProjectStack(0); startProjectAutoplay(); });
        else stopProjectAutoplay();
    }
    if (stackToggle && projectStack) {
        stackToggle.addEventListener('click', function () {
            setStackOpen(!projectStack.classList.contains('is-open'));
        });
        projectCards.forEach(function (card, index) {
            function openOrDetail() {
                var link = card.getAttribute('data-link');
                if (index !== activeProject) {
                    if (link) {
                        /* 有链接：保持“先滑到中间再打开链接” */
                        goToProject(index);
                        stopProjectAutoplay();
                        window.setTimeout(function () {
                            window.open(link, '_blank', 'noopener');
                            startProjectAutoplay();
                        }, 680);
                        return;
                    }
                    /* 无链接：同步切换焦点后直接放大（一步动画，不再先居中） */
                    goToProject(index);
                    stopProjectAutoplay();
                    setProjectDetail(true);
                    return;
                }
                if (link) { window.open(link, '_blank', 'noopener'); return; }
                setProjectDetail(true);
            }
            card.addEventListener('click', function () {
                if (projectStack.classList.contains('is-open')) return;
                if (wasJustDragging) return;
                openOrDetail();
            });
            card.addEventListener('keydown', function (event) {
                if ((event.key === 'Enter' || event.key === ' ') && !projectStack.classList.contains('is-open')) {
                    event.preventDefault();
                    openOrDetail();
                }
            });
        });
        if (stackPrev) stackPrev.addEventListener('click', function () { goToProject(activeProject - 1); });
        if (stackNext) stackNext.addEventListener('click', function () { goToProject(activeProject + 1); });
        if (projectClose) projectClose.addEventListener('click', function (event) {
            event.stopPropagation();
            setProjectDetail(false);
        });
        document.addEventListener('visibilitychange', function () {
            if (document.hidden) stopProjectAutoplay();
            else startProjectAutoplay();
        });
        window.addEventListener('resize', function () { layoutProjectStack(0); });

        /* ---- 拖拽 / 滑动 ---- */
        var dragStartX = 0;
        var dragDeltaX = 0;
        var isDragging = false;
        var wasJustDragging = false;
        var stackWidth = 0;

        function onDragStart(clientX) {
            if (projectStack.classList.contains('is-open') || projectStack.classList.contains('is-detail')) return;
            isDragging = true;
            dragStartX = clientX;
            dragDeltaX = 0;
            stackWidth = projectStack.clientWidth;
            projectStack.classList.add('is-dragging');
            stopProjectAutoplay();
        }

        function onDragMove(clientX) {
            if (!isDragging) return;
            dragDeltaX = clientX - dragStartX;
            if (Math.abs(dragDeltaX) > 6) wasJustDragging = true;
            layoutProjectStack(dragDeltaX);
        }

        function onDragEnd() {
            if (!isDragging) return;
            isDragging = false;
            projectStack.classList.remove('is-dragging');
            var threshold = stackWidth * 0.12;
            if (dragDeltaX < -threshold && activeProject < projectCards.length - 1) {
                goToProject(activeProject + 1);
            } else if (dragDeltaX > threshold && activeProject > 0) {
                goToProject(activeProject - 1);
            } else {
                layoutProjectStack(0);
            }
            startProjectAutoplay();
            if (wasJustDragging) {
                window.setTimeout(function () { wasJustDragging = false; }, 120);
            }
        }

        projectStack.addEventListener('pointerdown', function (e) {
            if (projectStack.classList.contains('is-open')) return;
            onDragStart(e.clientX);
        });
        projectStack.addEventListener('pointermove', function (e) {
            if (!isDragging) return;
            if (!wasJustDragging && Math.abs(e.clientX - dragStartX) > 6) {
                /* 确认是拖拽后才捕获指针，避免吞掉卡片点击 */
                try { projectStack.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
            }
            onDragMove(e.clientX);
        });
        projectStack.addEventListener('pointerup', onDragEnd);
        projectStack.addEventListener('pointercancel', onDragEnd);

        /* ---- hover 暂停 ---- */
        projectStack.addEventListener('mouseenter', function () {
            if (!isDragging) stopProjectAutoplay();
        });
        projectStack.addEventListener('mouseleave', function () {
            if (!isDragging) startProjectAutoplay();
        });

        /* ---- 键盘左右切换 ---- */
        document.addEventListener('keydown', function (e) {
            if (projectStack.classList.contains('is-open') || projectStack.classList.contains('is-detail')) return;
            var rect = projectStack.getBoundingClientRect();
            if (rect.bottom < 0 || rect.top > window.innerHeight) return;
            if (e.key === 'ArrowLeft' && activeProject > 0) {
                goToProject(activeProject - 1);
                restartAutoplay();
            } else if (e.key === 'ArrowRight' && activeProject < projectCards.length - 1) {
                goToProject(activeProject + 1);
                restartAutoplay();
            }
        });

        layoutProjectStack(0);
        startProjectAutoplay();
    }

    var year = document.getElementById('current-year');
    if (year) year.textContent = String(new Date().getFullYear());

    var revealItems = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window && !prefersReducedMotion) {
        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12 });
        revealItems.forEach(function (item) { observer.observe(item); });
    } else {
        revealItems.forEach(function (item) { item.classList.add('is-visible'); });
    }

    var spineShowcase = document.getElementById('spine-showcase');
    var spineCanvas = document.getElementById('spine-canvas');
    if (spineShowcase && spineCanvas) {
        var spineScenes = [
            { name: 'CODING', jsonUrl: '/site/spine/coding/animation.json', atlasUrl: '/site/spine/coding/animation.atlas', textureUrl: '/site/spine/coding/animation.webp' },
            { name: 'TRAVEL', jsonUrl: '/site/spine/travel/animation.json', atlasUrl: '/site/spine/travel/animation.atlas', textureUrl: '/site/spine/travel/animation.webp' },
            { name: 'READING', jsonUrl: '/site/spine/read/animation.json', atlasUrl: '/site/spine/read/animation.atlas', textureUrl: '/site/spine/read/animation.webp' },
            { name: 'CRAFT', jsonUrl: '/site/spine/craft/animation.json', atlasUrl: '/site/spine/craft/animation.atlas', textureUrl: '/site/spine/craft/animation.webp' }
        ];
        var spineContext = spineCanvas.getContext('2d', { alpha: true });
        var spineCaption = document.getElementById('spine-scene-name');
        var spineMeters = Array.from(spineShowcase.querySelectorAll('.spine-scene-meter i'));
        var spineCache = {};
        var activeSpineScene = null;
        var previousSpineScene = null;
        var queuedSpineScene = null;
        var activeSpineIndex = 0;
        var spineStartedAt = 0;
        var spineTransitionAt = 0;
        var spinePreviousTime = 0;
        var spineVisible = false;
        var spineFrameRequest = null;
        var spineWidth = 0;
        var spineHeight = 0;

        function parseSpineAtlas(atlasText) {
            var lines = atlasText.split(/\r?\n/);
            var atlasSize = { width: 1, height: 1 };
            var regions = {};
            lines.some(function (line) {
                var match = line.trim().match(/^size:\s*(\d+),\s*(\d+)$/);
                if (!match) return false;
                atlasSize.width = Number(match[1]);
                atlasSize.height = Number(match[2]);
                return true;
            });
            lines.forEach(function (line, index) {
                var name = line.trim();
                if (!/^frame_\d+$/.test(name)) return;
                var region = { name: name, x: 0, y: 0, width: 0, height: 0, rotate: false };
                for (var cursor = index + 1; cursor < lines.length; cursor += 1) {
                    var raw = lines[cursor];
                    if (raw && !/^\s/.test(raw)) break;
                    var property = raw.trim().match(/^(rotate|xy|size):\s*(.+)$/);
                    if (!property) continue;
                    if (property[1] === 'rotate') region.rotate = property[2] === 'true';
                    if (property[1] === 'xy' || property[1] === 'size') {
                        var values = property[2].split(',').map(Number);
                        if (property[1] === 'xy') { region.x = values[0]; region.y = values[1]; }
                        else { region.width = values[0]; region.height = values[1]; }
                    }
                }
                regions[name] = region;
            });
            return { size: atlasSize, regions: regions };
        }

        function loadSpineImage(url) {
            return new Promise(function (resolve, reject) {
                var image = new Image();
                image.decoding = 'async';
                image.onload = function () { resolve(image); };
                image.onerror = reject;
                image.src = url;
            });
        }

        function loadSpineScene(index) {
            if (spineCache[index]) return spineCache[index];
            var definition = spineScenes[index];
            spineCache[index] = Promise.all([
                fetch(definition.jsonUrl).then(function (response) {
                    if (!response.ok) throw new Error('Spine JSON ' + response.status);
                    return response.json();
                }),
                fetch(definition.atlasUrl).then(function (response) {
                    if (!response.ok) throw new Error('Spine atlas ' + response.status);
                    return response.text();
                }),
                loadSpineImage(definition.textureUrl)
            ]).then(function (assets) {
                var skeleton = assets[0];
                var atlas = parseSpineAtlas(assets[1]);
                var animationName = Object.keys(skeleton.animations || {})[0];
                var animation = skeleton.animations && skeleton.animations[animationName];
                var slotNames = animation && animation.slots ? Object.keys(animation.slots) : [];
                var slot = slotNames.length ? animation.slots[slotNames[0]] : null;
                var timeline = slot && slot.attachment ? slot.attachment.filter(function (keyframe) {
                    return atlas.regions[keyframe.name];
                }) : [];
                if (!timeline.length) throw new Error('No attachment timeline in Spine scene');
                var step = timeline.length > 1 ? timeline[1].time - timeline[0].time : 1 / 15;
                return {
                    definition: definition,
                    image: assets[2],
                    atlas: atlas,
                    timeline: timeline,
                    step: step,
                    duration: timeline[timeline.length - 1].time + step
                };
            });
            return spineCache[index];
        }

        function resizeSpineCanvas() {
            spineWidth = spineShowcase.clientWidth;
            spineHeight = spineShowcase.clientHeight;
            var ratio = Math.min(window.devicePixelRatio || 1, 2);
            spineCanvas.width = Math.round(spineWidth * ratio);
            spineCanvas.height = Math.round(spineHeight * ratio);
            spineContext.setTransform(ratio, 0, 0, ratio, 0, 0);
            spineContext.imageSmoothingEnabled = true;
        }

        function spineFrameAt(scene, time) {
            var localTime = Math.max(0, Math.min(time, scene.duration - scene.step));
            var low = 0;
            var high = scene.timeline.length - 1;
            while (low < high) {
                var middle = Math.ceil((low + high) / 2);
                if (scene.timeline[middle].time <= localTime) low = middle;
                else high = middle - 1;
            }
            return scene.atlas.regions[scene.timeline[low].name];
        }

        function drawSpineScene(scene, time, alpha) {
            if (!scene || alpha <= 0) return;
            var region = spineFrameAt(scene, time);
            var sourceScaleX = scene.image.naturalWidth / scene.atlas.size.width;
            var sourceScaleY = scene.image.naturalHeight / scene.atlas.size.height;
            var sourceX = region.x * sourceScaleX;
            var sourceY = region.y * sourceScaleY;
            var sourceWidth = region.width * sourceScaleX;
            var sourceHeight = region.height * sourceScaleY;
            var displayScale = Math.min(spineWidth / region.width, spineHeight / region.height) * 1.05;
            var displayWidth = region.width * displayScale;
            var displayHeight = region.height * displayScale;
            var displayX = (spineWidth - displayWidth) / 2;
            var displayY = (spineHeight - displayHeight) / 2;
            spineContext.save();
            spineContext.globalAlpha = alpha;
            if (region.rotate) {
                spineContext.translate(displayX + displayWidth / 2, displayY + displayHeight / 2);
                spineContext.rotate(-Math.PI / 2);
                spineContext.drawImage(scene.image, sourceX, sourceY, sourceWidth, sourceHeight, -displayHeight / 2, -displayWidth / 2, displayHeight, displayWidth);
            } else {
                spineContext.drawImage(scene.image, sourceX, sourceY, sourceWidth, sourceHeight, displayX, displayY, displayWidth, displayHeight);
            }
            spineContext.restore();
        }

        function updateSpineSceneLabel() {
            if (spineCaption) spineCaption.textContent = spineScenes[activeSpineIndex].name;
            spineMeters.forEach(function (meter, index) {
                meter.classList.toggle('is-active', index === activeSpineIndex);
            });
        }

        function queueNextSpineScene() {
            var nextIndex = (activeSpineIndex + 1) % spineScenes.length;
            queuedSpineScene = null;
            loadSpineScene(nextIndex).then(function (scene) {
                queuedSpineScene = { index: nextIndex, scene: scene };
            }).catch(function () {
                queuedSpineScene = null;
            });
        }

        function beginSpineScene(index, scene, now) {
            if (activeSpineScene) {
                previousSpineScene = activeSpineScene;
                spinePreviousTime = Math.max(0, activeSpineScene.duration - activeSpineScene.step);
            }
            activeSpineIndex = index;
            activeSpineScene = scene;
            spineStartedAt = now;
            spineTransitionAt = now;
            spineShowcase.classList.add('is-ready');
            updateSpineSceneLabel();
            queueNextSpineScene();
        }

        function renderSpine(now) {
            spineFrameRequest = null;
            if (!spineVisible || !activeSpineScene) return;
            var elapsed = prefersReducedMotion ? 0 : (now - spineStartedAt) / 1000;
            if (!prefersReducedMotion && elapsed >= activeSpineScene.duration && queuedSpineScene) {
                beginSpineScene(queuedSpineScene.index, queuedSpineScene.scene, now);
                elapsed = 0;
            } else if (elapsed >= activeSpineScene.duration) {
                spineStartedAt = now;
                elapsed = 0;
            }
            spineContext.clearRect(0, 0, spineWidth, spineHeight);
            if (previousSpineScene && !prefersReducedMotion) {
                var transition = Math.min(1, (now - spineTransitionAt) / 420);
                drawSpineScene(previousSpineScene, spinePreviousTime, 1 - transition);
                drawSpineScene(activeSpineScene, elapsed, transition);
                if (transition >= 1) previousSpineScene = null;
            } else {
                drawSpineScene(activeSpineScene, elapsed, 1);
            }
            spineFrameRequest = requestAnimationFrame(renderSpine);
        }

        function startSpineRendering() {
            spineVisible = true;
            if (activeSpineScene) spineStartedAt = performance.now();
            if (!spineFrameRequest) spineFrameRequest = requestAnimationFrame(renderSpine);
        }

        function stopSpineRendering() {
            spineVisible = false;
            if (spineFrameRequest) cancelAnimationFrame(spineFrameRequest);
            spineFrameRequest = null;
        }

        resizeSpineCanvas();
        if ('ResizeObserver' in window) new ResizeObserver(resizeSpineCanvas).observe(spineShowcase);
        else window.addEventListener('resize', resizeSpineCanvas);
        if ('IntersectionObserver' in window) {
            new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) startSpineRendering();
                    else stopSpineRendering();
                });
            }, { threshold: 0.08 }).observe(spineShowcase);
        } else {
            startSpineRendering();
        }
        loadSpineScene(0).then(function (scene) {
            beginSpineScene(0, scene, performance.now());
            if (spineVisible && !spineFrameRequest) spineFrameRequest = requestAnimationFrame(renderSpine);
        }).catch(function () {
            spineShowcase.classList.add('has-error');
            if (spineCaption) spineCaption.textContent = 'KL';
        });
    }

    var canvas = document.getElementById('hero-canvas');
    if (!canvas || typeof THREE === 'undefined') return;

    var hero = canvas.parentElement;
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.set(0, 0, 8);
    var renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: window.devicePixelRatio < 2 });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.7));
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    var group = new THREE.Group();
    scene.add(group);
    var green = new THREE.MeshPhysicalMaterial({ color: 0x78b9a5, roughness: 0.3, metalness: 0.05, transmission: 0.18, thickness: 1, transparent: true, opacity: 0.78 });
    var ivory = new THREE.MeshStandardMaterial({ color: 0xf4f1e7, roughness: 0.42, metalness: 0.02 });
    var gold = new THREE.MeshStandardMaterial({ color: 0xe4b75c, roughness: 0.34, metalness: 0.12 });

    var core = new THREE.Mesh(new THREE.IcosahedronGeometry(1.65, 1), green);
    core.rotation.set(0.35, 0.5, -0.15);
    group.add(core);
    var ring = new THREE.Mesh(new THREE.TorusGeometry(2.25, 0.055, 16, 100), gold);
    ring.rotation.set(1.15, 0.25, 0.25);
    group.add(ring);
    var satellite = new THREE.Mesh(new THREE.OctahedronGeometry(0.45, 0), ivory);
    satellite.position.set(2.2, 1.15, 0.4);
    group.add(satellite);
    var small = new THREE.Mesh(new THREE.SphereGeometry(0.18, 24, 24), gold);
    small.position.set(-2.15, -1.25, 0.8);
    group.add(small);

    scene.add(new THREE.HemisphereLight(0xffffff, 0xb9c8c0, 2.1));
    var light = new THREE.DirectionalLight(0xffffff, 3.4);
    light.position.set(3, 5, 6);
    scene.add(light);

    var pointer = { x: 0, y: 0 };
    window.addEventListener('pointermove', function (event) {
        pointer.x = (event.clientX / window.innerWidth - 0.5) * 0.35;
        pointer.y = (event.clientY / window.innerHeight - 0.5) * 0.22;
    }, { passive: true });

    function resize() {
        var width = hero.clientWidth;
        var height = hero.clientHeight;
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        group.position.set(2.9, 1.05, 0);
        group.scale.setScalar(width < 1100 ? 0.45 : 0.62);
    }

    function render(time) {
        var t = time * 0.00035;
        if (!prefersReducedMotion) {
            group.rotation.y += (pointer.x + t - group.rotation.y) * 0.025;
            group.rotation.x += (-pointer.y + Math.sin(t * 1.8) * 0.08 - group.rotation.x) * 0.025;
            satellite.position.y = 1.15 + Math.sin(t * 4) * 0.12;
            ring.rotation.z = t * 0.28;
        }
        renderer.render(scene, camera);
        requestAnimationFrame(render);
    }

    resize();
    window.addEventListener('resize', resize);
    requestAnimationFrame(render);
}());
