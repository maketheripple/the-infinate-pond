/* =========================================================
   THE RIPPLE WELL
   VERSION 3.2 — 500% IMPACT RIPPLE TEST

   - Water.png remains the visual water surface.
   - The transparent click canvas covers the entire Well,
     including the dark section below the water image.
   - Approved Impact Ripples load from Supabase.
   - Each Impact Ripple pulses on its own randomized cycle.
   - Each pulse glows, expands into rings, then fades.
   - Impact Ripples remain clickable and open their quote.
   - Clicking an Impact Ripple does not create a normal click ripple.
========================================================= */

(() => {
    "use strict";


    /* =====================================================
       ELEMENTS
    ===================================================== */

    const rippleWell =
        document.getElementById("ripple-well");

    const waterWindow =
        document.getElementById("water-window");

    const waterImage =
        document.getElementById("water-surface-image");

    const canvas =
        document.getElementById("water-canvas");

    const makeRippleButton =
        document.getElementById("make-ripple-button");

    const makeRippleModal =
        document.getElementById("make-ripple-modal");

    const impactModal =
        document.getElementById("impact-modal");

    const rippleForm =
        document.getElementById("ripple-form");

    const impactCount =
        document.getElementById("impact-count");

    const impactQuote =
        document.getElementById("impact-quote");

    const impactDetails =
        document.getElementById("impact-details");

    const closeButtons =
        document.querySelectorAll(
            "[data-close-modal]"
        );


    if (
        !rippleWell ||
        !waterImage ||
        !canvas
    ) {

        console.error(
            "The Ripple Well: required elements were not found."
        );

        return;

    }


    /* =====================================================
       SUPABASE
    ===================================================== */

    const SUPABASE_URL =
        "https://vazgkkrrjgoowwywamot.supabase.co";

    const SUPABASE_KEY =
        "sb_publishable_gf0gD7JmbBlm6jR07qYkIQ_YZN301F-";


    /* =====================================================
       FULL-WELL CLICK RIPPLE CANVAS
    ===================================================== */

    const ctx =
        canvas.getContext(
            "2d",
            {
                alpha: true
            }
        );


    if (!ctx) {

        console.error(
            "The Ripple Well: 2D canvas is unavailable."
        );

        return;

    }


    /*
     * The current HTML places the canvas inside the
     * water-image section.
     *
     * We move it into the full Ripple Well here so that
     * click ripples continue working below the image,
     * inside the dark/deep portion as well.
     */

    rippleWell.appendChild(
        canvas
    );


    canvas.style.position =
        "absolute";

    canvas.style.inset =
        "0";

    canvas.style.width =
        "100%";

    canvas.style.height =
        "100%";

    canvas.style.zIndex =
        "30";

    canvas.style.pointerEvents =
        "auto";

    canvas.style.background =
        "transparent";


    let width = 1;
    let height = 1;
    let dpr = 1;


    const clickRipples = [];


    const CLICK_DURATION =
        2200;


    const MAX_CLICK_RIPPLES =
        12;


    function resizeCanvas() {

        const rect =
            rippleWell.getBoundingClientRect();


        width =
            Math.max(
                1,
                rect.width
            );


        height =
            Math.max(
                1,
                rect.height
            );


        dpr =
            Math.min(
                window.devicePixelRatio || 1,
                2
            );


        canvas.width =
            Math.round(
                width * dpr
            );


        canvas.height =
            Math.round(
                height * dpr
            );


        canvas.style.width =
            `${width}px`;


        canvas.style.height =
            `${height}px`;


        ctx.setTransform(
            dpr,
            0,
            0,
            dpr,
            0,
            0
        );

    }


    window.addEventListener(
        "resize",
        resizeCanvas,
        {
            passive: true
        }
    );


    if (
        typeof ResizeObserver !==
        "undefined"
    ) {

        const observer =
            new ResizeObserver(
                resizeCanvas
            );


        observer.observe(
            rippleWell
        );

    }


    resizeCanvas();


    /* =====================================================
       CREATE NORMAL CLICK RIPPLE
    ===================================================== */

    function addClickRipple(
        clientX,
        clientY
    ) {

        const rect =
            rippleWell.getBoundingClientRect();


        if (
            clientX < rect.left ||
            clientX > rect.right ||
            clientY < rect.top ||
            clientY > rect.bottom
        ) {

            return;

        }


        clickRipples.push({

            x:
                clientX -
                rect.left,

            y:
                clientY -
                rect.top,

            started:
                performance.now(),

            rotation:
                (
                    Math.random() -
                    0.5
                ) * 0.18,

            phase:
                Math.random() *
                Math.PI *
                2

        });


        if (
            clickRipples.length >
            MAX_CLICK_RIPPLES
        ) {

            clickRipples.shift();

        }

    }


    /* =====================================================
       POINTER INTERACTION
    ===================================================== */

    canvas.addEventListener(
        "pointerdown",
        event => {

            if (
                event.pointerType ===
                "mouse" &&
                event.button !== 0
            ) {

                return;

            }


            addClickRipple(
                event.clientX,
                event.clientY
            );

        },
        {
            passive: true
        }
    );


    /* =====================================================
       DRAW NORMAL CLICK RIPPLE
    ===================================================== */

    function drawClickRipple(
        ripple,
        now
    ) {

        const progress =
            Math.min(
                1,
                (
                    now -
                    ripple.started
                ) /
                CLICK_DURATION
            );


        if (
            progress >= 1
        ) {

            return false;

        }


        const fade =
            Math.pow(
                1 -
                progress,
                1.35
            );


        const radiusX =
            Math.min(
                54,
                width *
                0.075
            );


        const radiusY =
            radiusX *
            0.54;


        ctx.save();


        ctx.translate(
            ripple.x,
            ripple.y
        );


        ctx.rotate(
            ripple.rotation
        );


        const rings = [

            {
                scale: 0.46,
                alpha: 0.54,
                width: 1.0,
                delay: 0.00
            },

            {
                scale: 0.72,
                alpha: 0.36,
                width: 0.9,
                delay: 0.06
            },

            {
                scale: 1.00,
                alpha: 0.22,
                width: 0.8,
                delay: 0.12
            }

        ];


        for (
            const ring of rings
        ) {

            const p =
                Math.max(
                    0,
                    Math.min(
                        1,
                        (
                            progress -
                            ring.delay
                        ) /
                        (
                            1 -
                            ring.delay
                        )
                    )
                );


            const rx =
                radiusX *
                ring.scale *
                (
                    0.16 +
                    p *
                    0.84
                );


            const ry =
                radiusY *
                ring.scale *
                (
                    0.16 +
                    p *
                    0.84
                );


            const wobble =
                Math.sin(
                    ripple.phase +
                    p *
                    4.2
                ) *
                0.025;


            ctx.beginPath();


            ctx.ellipse(
                0,
                0,
                rx,
                ry *
                (
                    1 +
                    wobble
                ),
                0,
                0,
                Math.PI *
                2
            );


            ctx.strokeStyle =
                `rgba(177, 231, 246, ${
                    ring.alpha *
                    fade
                })`;


            ctx.lineWidth =
                ring.width;


            ctx.stroke();

        }


        const centerFade =
            Math.max(
                0,
                1 -
                progress *
                5
            );


        if (
            centerFade >
            0
        ) {

            ctx.beginPath();


            ctx.arc(
                0,
                0,
                2.2 +
                progress *
                2.2,
                0,
                Math.PI *
                2
            );


            ctx.fillStyle =
                `rgba(202, 241, 250, ${
                    0.32 *
                    centerFade
                })`;


            ctx.fill();

        }


        ctx.restore();


        return true;

    }


    /* =====================================================
       NORMAL CLICK RIPPLE ANIMATION
    ===================================================== */

    function renderClickRipples() {

        ctx.clearRect(
            0,
            0,
            width,
            height
        );


        const now =
            performance.now();


        for (
            let i =
                clickRipples.length - 1;

            i >= 0;

            i--
        ) {

            if (
                !drawClickRipple(
                    clickRipples[i],
                    now
                )
            ) {

                clickRipples.splice(
                    i,
                    1
                );

            }

        }


        requestAnimationFrame(
            renderClickRipples
        );

    }


    renderClickRipples();


    /* =====================================================
       MODALS
    ===================================================== */

    function openModal(
        modal
    ) {

        if (!modal) {
            return;
        }


        modal.classList.add(
            "open"
        );


        modal.setAttribute(
            "aria-hidden",
            "false"
        );


        document.body.style.overflow =
            "hidden";

    }


    function closeModal(
        modal
    ) {

        if (!modal) {
            return;
        }


        modal.classList.remove(
            "open"
        );


        modal.setAttribute(
            "aria-hidden",
            "true"
        );


        if (
            !document.querySelector(
                ".modal-overlay.open"
            )
        ) {

            document.body.style.overflow =
                "";

        }

    }


    /* =====================================================
       MAKE A RIPPLE BUTTON
    ===================================================== */

    if (
        makeRippleButton
    ) {

        makeRippleButton.addEventListener(
            "click",
            event => {

                event.preventDefault();

                event.stopPropagation();

                openModal(
                    makeRippleModal
                );

            }
        );

    }


    /* =====================================================
       CLOSE BUTTONS
    ===================================================== */

    closeButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    closeModal(
                        button.closest(
                            ".modal-overlay"
                        )
                    );

                }
            );

        }
    );


    /* =====================================================
       CLICK OUTSIDE MODAL
    ===================================================== */

    document
        .querySelectorAll(
            ".modal-overlay"
        )
        .forEach(
            overlay => {

                overlay.addEventListener(
                    "click",
                    event => {

                        if (
                            event.target ===
                            overlay
                        ) {

                            closeModal(
                                overlay
                            );

                        }

                    }
                );

            }
        );


    /* =====================================================
       ESCAPE KEY
    ===================================================== */

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key !==
                "Escape"
            ) {

                return;

            }


            document
                .querySelectorAll(
                    ".modal-overlay.open"
                )
                .forEach(
                    closeModal
                );

        }
    );


    /* =====================================================
       IMPACT RIPPLE STYLES
    ===================================================== */

    const impactStyle =
        document.createElement(
            "style"
        );


    impactStyle.id =
        "impact-ripple-runtime-styles";


    impactStyle.textContent = `

        #dynamic-impact-ripples {

            position:
                absolute;

            inset:
                0;

            z-index:
                60;

            pointer-events:
                none;

            overflow:
                hidden;

        }


        .runtime-impact-ripple {

            position:
                absolute;

            transform:
                translate(-50%, -50%)
                rotate(var(--rotation));

            width:
                var(--width);

            height:
                var(--height);

            padding:
                0;

            border:
                0;

            background:
                transparent;

            appearance:
                none;

            /*
             * Visual wrapper only.
             * The child hitTarget is the actual interactive element.
             */
            pointer-events:
                none;

            cursor:
                default;

            opacity:
                var(--base-opacity);

            filter:
                drop-shadow(
                    0 0 3px
                    rgba(
                        108,
                        211,
                        236,
                        0.08
                    )
                );

            transition:
                filter .25s ease,
                opacity .25s ease;

        }


        .runtime-impact-ripple.hit-hover {

            opacity:
                1;

            filter:
                drop-shadow(
                    0 0 10px
                    rgba(
                        108,
                        221,
                        244,
                        0.34
                    )
                );

        }


        /*
         * TRUE PHYSICAL HITBOX
         *
         * This button is the browser's actual clickable/touchable
         * area. It is sized to the maximum visible outer ripple
         * footprint, not to the full visual container.
         *
         * Because the dimensions are percentages, Small,
         * Medium, Large and Extra-Large all scale proportionally.
         */
        /*
         * DIAGNOSTIC HITBOX — BETA TEST ONLY
         *
         * This outline shows the EXACT physical button that
         * receives mouse/touch input.
         *
         * Do not judge the visual ripple here; judge only
         * whether this outlined ellipse is the boundary you
         * want to be clickable.
         */
        .impact-ripple-hit-target {

            position:
                absolute;

            left:
                50%;

            top:
                50%;

            /*
             * STARTING TEST SIZE:
             * Match the visible ripple's maximum footprint.
             *
             * We will adjust ONLY these two values after
             * seeing the boundary on the live site.
             */
            width:
                75.24%;

            height:
                58.14%;

            transform:
                translate(-50%, -50%);

            margin:
                0;

            padding:
                0;

            border:
                2px
                dashed
                rgba(
                    255,
                    255,
                    255,
                    0.85
                );

            border-radius:
                50%;

            background:
                rgba(
                    255,
                    255,
                    255,
                    0.035
                );

            appearance:
                none;

            pointer-events:
                auto;

            cursor:
                pointer;

            z-index:
                20;

            box-sizing:
                border-box;
        }


        .runtime-impact-ripple span {

            position:
                absolute;

            left:
                50%;

            top:
                50%;

            pointer-events:
                none;

        }


        .impact-glow {

            width:
                25%;

            height:
                40%;

            transform:
                translate(-50%, -50%);

            border-radius:
                50%;

            background:
                radial-gradient(
                    ellipse,
                    rgba(
                        210,
                        248,
                        255,
                        .96
                    ) 0%,

                    rgba(
                        101,
                        211,
                        239,
                        .58
                    ) 25%,

                    rgba(
                        45,
                        157,
                        196,
                        .20
                    ) 50%,

                    transparent 76%
                );

            filter:
                blur(4px);

            opacity:
                0;

        }


        .impact-core {

            width:
                7%;

            height:
                18%;

            transform:
                translate(-50%, -50%);

            border-radius:
                50%;

            background:
                rgba(
                    220,
                    250,
                    255,
                    .95
                );

            box-shadow:

                0 0 4px
                rgba(
                    220,
                    250,
                    255,
                    .95
                ),

                0 0 12px
                rgba(
                    86,
                    211,
                    239,
                    .60
                ),

                0 0 24px
                rgba(
                    62,
                    186,
                    219,
                    .24
                );

            opacity:
                .14;

        }


        .impact-ring {

            width:
                28%;

            height:
                23%;

            transform:
                translate(-50%, -50%)
                scale(.10);

            border:
                1px solid
                rgba(
                    168,
                    234,
                    248,
                    .74
                );

            border-radius:
                50%;

            box-shadow:
                0 0 5px
                rgba(
                    92,
                    206,
                    233,
                    .22
                );

            opacity:
                0;

        }


        .ring-two {

            width:
                45%;

            height:
                36%;

            border-color:
                rgba(
                    128,
                    222,
                    243,
                    .48
                );

            filter:
                blur(.25px);

        }


        .ring-three {

            width:
                66%;

            height:
                51%;

            border-color:
                rgba(
                    107,
                    211,
                    237,
                    .29
                );

            filter:
                blur(.65px);

        }


        .runtime-impact-ripple.pulsing
        .impact-glow {

            animation:
                impactGlowPulse
                var(--pulse-duration)
                ease-out
                forwards;

        }


        .runtime-impact-ripple.pulsing
        .impact-core {

            animation:
                impactCorePulse
                var(--pulse-duration)
                ease-out
                forwards;

        }


        .runtime-impact-ripple.pulsing
        .ring-one {

            animation:
                impactRingPulse
                var(--pulse-duration)
                ease-out
                forwards;

        }


        .runtime-impact-ripple.pulsing
        .ring-two {

            animation:
                impactRingPulseTwo
                var(--pulse-duration)
                ease-out
                forwards;

        }


        .runtime-impact-ripple.pulsing
        .ring-three {

            animation:
                impactRingPulseThree
                var(--pulse-duration)
                ease-out
                forwards;

        }


        @keyframes impactGlowPulse {

            0% {

                opacity:
                    0;

                transform:
                    translate(-50%,-50%)
                    scale(.55);

            }


            13% {

                opacity:
                    .92;

                transform:
                    translate(-50%,-50%)
                    scale(1);

            }


            32% {

                opacity:
                    .56;

                transform:
                    translate(-50%,-50%)
                    scale(1.16);

            }


            65% {

                opacity:
                    .18;

                transform:
                    translate(-50%,-50%)
                    scale(1.35);

            }


            100% {

                opacity:
                    0;

                transform:
                    translate(-50%,-50%)
                    scale(1.55);

            }

        }


        @keyframes impactCorePulse {

            0% {

                opacity:
                    .10;

                transform:
                    translate(-50%,-50%)
                    scale(.70);

            }


            10% {

                opacity:
                    1;

                transform:
                    translate(-50%,-50%)
                    scale(1.15);

            }


            26% {

                opacity:
                    .55;

                transform:
                    translate(-50%,-50%)
                    scale(.92);

            }


            50% {

                opacity:
                    .20;

                transform:
                    translate(-50%,-50%)
                    scale(.70);

            }


            100% {

                opacity:
                    0;

                transform:
                    translate(-50%,-50%)
                    scale(.45);

            }

        }


        @keyframes impactRingPulse {

            0% {

                opacity:
                    0;

                transform:
                    translate(-50%,-50%)
                    scale(.12);

            }


            10% {

                opacity:
                    .92;

                transform:
                    translate(-50%,-50%)
                    scale(.26);

            }


            42% {

                opacity:
                    .58;

                transform:
                    translate(-50%,-50%)
                    scale(.72);

            }


            72% {

                opacity:
                    .20;

                transform:
                    translate(-50%,-50%)
                    scale(1.02);

            }


            100% {

                opacity:
                    0;

                transform:
                    translate(-50%,-50%)
                    scale(1.18);

            }

        }


        @keyframes impactRingPulseTwo {

            0% {

                opacity:
                    0;

                transform:
                    translate(-50%,-50%)
                    scale(.08);

            }


            17% {

                opacity:
                    .44;

                transform:
                    translate(-50%,-50%)
                    scale(.24);

            }


            48% {

                opacity:
                    .30;

                transform:
                    translate(-50%,-50%)
                    scale(.68);

            }


            78% {

                opacity:
                    .11;

                transform:
                    translate(-50%,-50%)
                    scale(1.03);

            }


            100% {

                opacity:
                    0;

                transform:
                    translate(-50%,-50%)
                    scale(1.16);

            }

        }


        @keyframes impactRingPulseThree {

            0% {

                opacity:
                    0;

                transform:
                    translate(-50%,-50%)
                    scale(.06);

            }


            24% {

                opacity:
                    .24;

                transform:
                    translate(-50%,-50%)
                    scale(.22);

            }


            55% {

                opacity:
                    .18;

                transform:
                    translate(-50%,-50%)
                    scale(.70);

            }


            82% {

                opacity:
                    .07;

                transform:
                    translate(-50%,-50%)
                    scale(1.02);

            }


            100% {

                opacity:
                    0;

                transform:
                    translate(-50%,-50%)
                    scale(1.14);

            }

        }

    `;


    document.head.appendChild(
        impactStyle
    );


    /* =====================================================
       IMPACT RIPPLE DATA / PLACEMENT
    ===================================================== */

    const impactRipples = [];


    let impactLayer =
        null;


    function seededNumber(
        value
    ) {

        const text =
            String(
                value ||
                "impact"
            );


        let hash =
            2166136261;


        for (
            let i = 0;
            i < text.length;
            i++
        ) {

            hash ^=
                text.charCodeAt(
                    i
                );


            hash +=
                (
                    hash << 1
                ) +
                (
                    hash << 4
                ) +
                (
                    hash << 7
                ) +
                (
                    hash << 8
                ) +
                (
                    hash << 24
                );

        }


        return (
            (hash >>> 0) %
            100000
        ) / 100000;

    }


    /*
     * IMPACT RIPPLE VISUAL SIZE
     *
     * Increased to 150% of the previous v3.1 dimensions.
     *
     * Small:       88 x 48  -> 440 x 240
     * Medium:     120 x 66  -> 600 x 330
     * Large:      150 x 82  -> 750 x 410
     * Extra-Large:190 x 104 -> 950 x 520
     */

    function getSize(
        size
    ) {

        switch (
            String(
                size ||
                "medium"
            )
            .trim()
            .toLowerCase()
        ) {

            case "small":

                return {

                    width:
                        440,

                    height:
                        240,

                    opacity:
                        .68

                };


            case "large":

                return {

                    width:
                        750,

                    height:
                        410,

                    opacity:
                        .78

                };


            case "extra-large":

            case "extra large":

            case "x-large":

            case "xlarge":

                return {

                    width:
                        950,

                    height:
                        520,

                    opacity:
                        .86

                };


            default:

                return {

                    width:
                        600,

                    height:
                        330,

                    opacity:
                        .74

                };

        }

    }


    /*
     * IMPACT RIPPLE PLACEMENT
     *
     * Ripples are still randomly distributed, but placement is now
     * collision-aware. Each new candidate position is checked against
     * every ripple already placed. The required separation is based on
     * the actual size of the two ripples, plus a little extra breathing
     * room.
     *
     * The random sequence is seeded by each ripple's id, so the layout
     * remains stable instead of jumping around on every page refresh.
     */

    const IMPACT_MIN_GAP =
        18;


    const IMPACT_PLACEMENT_ATTEMPTS =
        180;


    function getImpactPlacementRadius(
        size
    ) {

        /*
         * Use the half-diagonal as a conservative footprint so that
         * rotated elliptical ripples do not end up visually touching.
         */

        return Math.sqrt(
            Math.pow(size.width / 2, 2) +
            Math.pow(size.height / 2, 2)
        );

    }


    function getRandomPlacementCandidate(
        data,
        index,
        attempt,
        waterRect,
        wellRect,
        size
    ) {

        /*
         * Multiple deterministic pseudo-random streams give every
         * ripple many different candidate positions without making
         * the final layout truly grid-like.
         */

        const xSeed =
            seededNumber(
                `${data.id}-${index}-placement-x-${attempt}`
            );


        const ySeed =
            seededNumber(
                `${data.id}-${index}-placement-y-${attempt}`
            );


        /*
         * Keep the centre away from the very edge of the water image.
         * The margins are based partly on the ripple dimensions so the
         * larger 500% ripples have room to breathe.
         */

        const horizontalMargin =
            Math.min(
                0.12,
                Math.max(
                    0.06,
                    (size.width / waterRect.width) * 0.70
                )
            );


        const verticalMargin =
            Math.min(
                0.18,
                Math.max(
                    0.10,
                    (size.height / waterRect.height) * 0.70
                )
            );


        return {

            x:

                waterRect.left -
                wellRect.left +
                waterRect.width *
                (
                    horizontalMargin +
                    xSeed *
                    (
                        1 -
                        horizontalMargin * 2
                    )
                ),


            y:

                waterRect.top -
                wellRect.top +
                waterRect.height *
                (
                    verticalMargin +
                    ySeed *
                    (
                        1 -
                        verticalMargin * 2
                    )
                )

        };

    }


    function placementIsClear(
        candidate,
        candidateSize,
        placed
    ) {

        const candidateRadius =
            getImpactPlacementRadius(
                candidateSize
            );


        for (
            const existing of placed
        ) {

            const dx =
                candidate.x -
                existing.x;


            const dy =
                candidate.y -
                existing.y;


            const distance =
                Math.sqrt(
                    dx * dx +
                    dy * dy
                );


            const requiredDistance =
                candidateRadius +
                existing.radius +
                IMPACT_MIN_GAP;


            if (
                distance <
                requiredDistance
            ) {

                return false;

            }

        }


        return true;

    }


    function findImpactPlacements() {

        const waterRect =
            waterImage.getBoundingClientRect();


        const wellRect =
            rippleWell.getBoundingClientRect();


        const placed = [];


        /*
         * Clear the old positions first. We then place ripples in
         * their existing Supabase order. Every later ripple must find
         * a location that is safely separated from earlier ripples.
         */

        impactRipples.forEach(
            (
                item,
                index
            ) => {

                const size =
                    getSize(
                        item.data.size
                    );


                let chosen =
                    null;


                /*
                 * Try many random candidates. This preserves the
                 * organic/random feel while making collisions unlikely.
                 */

                for (
                    let attempt = 0;
                    attempt < IMPACT_PLACEMENT_ATTEMPTS;
                    attempt++
                ) {

                    const candidate =
                        getRandomPlacementCandidate(
                            item.data,
                            index,
                            attempt,
                            waterRect,
                            wellRect,
                            size
                        );


                    if (
                        placementIsClear(
                            candidate,
                            size,
                            placed
                        )
                    ) {

                        chosen =
                            candidate;

                        break;

                    }

                }


                /*
                 * If the Well becomes unusually crowded, choose the
                 * candidate that is farthest from its nearest neighbour
                 * rather than allowing two ripples to stack directly
                 * on top of one another.
                 */

                if (!chosen) {

                    let bestCandidate =
                        null;

                    let bestDistance =
                        -Infinity;


                    for (
                        let attempt = 0;
                        attempt < 80;
                        attempt++
                    ) {

                        const candidate =
                            getRandomPlacementCandidate(
                                item.data,
                                index,
                                IMPACT_PLACEMENT_ATTEMPTS +
                                attempt,
                                waterRect,
                                wellRect,
                                size
                            );


                        let nearestDistance =
                            Infinity;


                        for (
                            const existing of placed
                        ) {

                            const dx =
                                candidate.x -
                                existing.x;


                            const dy =
                                candidate.y -
                                existing.y;


                            nearestDistance =
                                Math.min(
                                    nearestDistance,
                                    Math.sqrt(
                                        dx * dx +
                                        dy * dy
                                    )
                                );

                        }


                        if (
                            placed.length === 0
                        ) {

                            nearestDistance =
                                Infinity;

                        }


                        if (
                            nearestDistance >
                            bestDistance
                        ) {

                            bestDistance =
                                nearestDistance;

                            bestCandidate =
                                candidate;

                        }

                    }


                    chosen =
                        bestCandidate;

                }


                if (!chosen) {

                    return;

                }


                const radius =
                    getImpactPlacementRadius(
                        size
                    );


                placed.push({

                    x:
                        chosen.x,

                    y:
                        chosen.y,

                    radius:
                        radius

                });


                item.element.style.left =
                    `${chosen.x}px`;


                item.element.style.top =
                    `${chosen.y}px`;

            }
        );

    }


    function repositionImpactRipples() {

        findImpactPlacements();

    }


    window.addEventListener(
        "resize",
        repositionImpactRipples,
        {
            passive: true
        }
    );


    /* =====================================================
       IMPACT RIPPLE PULSE SCHEDULING
    ===================================================== */

    function pulseImpact(
        item
    ) {

        if (
            !item.element
        ) {

            return;

        }


        item.element.classList.remove(
            "pulsing"
        );


        /*
         * Force the browser to restart the animation.
         */

        void item.element.offsetWidth;


        item.element.style.setProperty(
            "--pulse-duration",
            `${item.duration}ms`
        );


        item.element.classList.add(
            "pulsing"
        );


        clearTimeout(
            item.activeTimer
        );


        item.activeTimer =
            setTimeout(
                () => {

                    item.element.classList.remove(
                        "pulsing"
                    );

                },
                item.duration +
                100
            );


        scheduleImpact(
            item
        );

    }


    function scheduleImpact(
        item,
        initial = false
    ) {

        clearTimeout(
            item.timer
        );


        /*
         * Initial appearances are staggered.
         *
         * After each pulse, the next pulse occurs somewhere
         * between 6 and 13 seconds later.
         */

        const delay =
            initial

                ? item.initialDelay

                : 6000 +
                  Math.random() *
                  7000;


        item.timer =
            setTimeout(
                () => {

                    pulseImpact(
                        item
                    );

                },
                delay
            );

    }


    /* =====================================================
       IMPACT RIPPLE QUOTE MODAL
    ===================================================== */

    function openImpactMessage(
        data
    ) {

        if (
            !impactModal
        ) {

            return;

        }


        if (
            impactQuote
        ) {

            impactQuote.textContent =
                data.message ||
                "A ripple of hope from The Well.";

        }


        if (
            impactDetails
        ) {

            const name =
                data.name &&
                String(
                    data.name
                ).trim()

                    ? String(
                        data.name
                    ).trim()

                    : "Anonymous";


            const location =
                [
                    data.region,
                    data.country
                ]

                .filter(
                    value =>
                        value &&
                        String(
                            value
                        ).trim()
                )

                .map(
                    value =>
                        String(
                            value
                        ).trim()
                )

                .join(
                    ", "
                );


            impactDetails.textContent =
                location

                    ? `— ${name}\n${location}`

                    : `— ${name}`;


            impactDetails.style.whiteSpace =
                "pre-line";

        }


        openModal(
            impactModal
        );

    }


    /* =====================================================
       CREATE ONE IMPACT RIPPLE
    ===================================================== */

    function createImpactRipple(
        data,
        index
    ) {

        if (
            !impactLayer
        ) {

            return;

        }


        const size =
            getSize(
                data.size
            );


        /*
         * VISUAL WRAPPER
         *
         * The outer element is visual-only.
         * A separate, smaller button below is the actual
         * browser hitbox.
         */
        const element =
            document.createElement(
                "div"
            );


        element.className =
            "runtime-impact-ripple";


        /*
         * Initial position is assigned by the collision-aware layout
         * pass after all approved ripples have been created.
         */

        element.style.left =
            "0px";


        element.style.top =
            "0px";


        element.style.setProperty(
            "--width",
            `${size.width}px`
        );


        element.style.setProperty(
            "--height",
            `${size.height}px`
        );


        element.style.setProperty(
            "--base-opacity",
            size.opacity
        );


        element.style.setProperty(
            "--rotation",
            `${

                -14 +

                seededNumber(
                    `${data.id}-rotation`
                ) *
                28

            }deg`
        );


        /*
         * TRUE PHYSICAL HIT TARGET
         *
         * The visible outer ring is 66% x 51% of the full
         * visual container and expands to 1.14x at its largest.
         *
         * Therefore the browser's actual clickable button is
         * 75.24% x 58.14% of the visual container.
         */
        const hitTarget =
            document.createElement(
                "button"
            );


        hitTarget.type =
            "button";


        hitTarget.className =
            "impact-ripple-hit-target";


        hitTarget.setAttribute(
            "aria-label",
            "Open Impact Ripple message"
        );


        element.append(
            hitTarget
        );


        const glow =
            document.createElement(
                "span"
            );


        glow.className =
            "impact-glow";


        const core =
            document.createElement(
                "span"
            );


        core.className =
            "impact-core";


        const ringOne =
            document.createElement(
                "span"
            );


        ringOne.className =
            "impact-ring ring-one";


        const ringTwo =
            document.createElement(
                "span"
            );


        ringTwo.className =
            "impact-ring ring-two";


        const ringThree =
            document.createElement(
                "span"
            );


        ringThree.className =
            "impact-ring ring-three";


        element.append(
            glow,
            core,
            ringOne,
            ringTwo,
            ringThree
        );


        impactLayer.appendChild(
            element
        );


        const item = {

            data,

            element,

            duration:

                2300 +

                Math.round(
                    seededNumber(
                        `${data.id}-duration`
                    ) *
                    900
                ),


            initialDelay:

                350 +

                Math.round(
                    seededNumber(
                        `${data.id}-delay`
                    ) *
                    2500
                ),


            timer:
                null,


            activeTimer:
                null

        };


        /*
         * IMPACT RIPPLE INTERACTION
         *
         * hitTarget is the ONLY clickable/touchable element.
         * The visual wrapper itself is pointer-transparent.
         */
        hitTarget.addEventListener(
            "pointerdown",
            event => {
                event.preventDefault();
                event.stopPropagation();
            }
        );


        hitTarget.addEventListener(
            "click",
            event => {
                event.preventDefault();
                event.stopPropagation();

                openImpactMessage(
                    data
                );
            }
        );


        hitTarget.addEventListener(
            "pointerenter",
            () => {
                element.classList.add(
                    "hit-hover"
                );
            }
        );


        hitTarget.addEventListener(
            "pointerleave",
            () => {
                element.classList.remove(
                    "hit-hover"
                );
            }
        );


        impactRipples.push(
            item
        );


        scheduleImpact(
            item,
            true
        );

    }


    /* =====================================================
       WAIT FOR WATER IMAGE
    ===================================================== */

    function waitForWaterImage() {

        if (
            waterImage.complete &&
            waterImage.naturalWidth >
            0
        ) {

            return Promise.resolve();

        }


        return new Promise(
            resolve => {

                waterImage.addEventListener(
                    "load",
                    resolve,
                    {
                        once: true
                    }
                );


                waterImage.addEventListener(
                    "error",
                    resolve,
                    {
                        once: true
                    }
                );

            }
        );

    }


    /* =====================================================
       LOAD APPROVED IMPACT RIPPLES
    ===================================================== */

    async function loadApprovedImpactRipples() {

        await waitForWaterImage();


        if (
            !impactLayer
        ) {

            impactLayer =
                document.createElement(
                    "div"
                );


            impactLayer.id =
                "dynamic-impact-ripples";


            rippleWell.appendChild(
                impactLayer
            );

        }


        impactLayer.innerHTML =
            "";


        impactRipples.forEach(
            item => {

                clearTimeout(
                    item.timer
                );


                clearTimeout(
                    item.activeTimer
                );

            }
        );


        impactRipples.length =
            0;


        try {

            const response =
                await fetch(

                    `${SUPABASE_URL}/rest/v1/ripple_submissions?select=id,created_at,message,name,region,country,status,size&status=eq.approved&order=created_at.asc`,

                    {

                        method:
                            "GET",

                        headers: {

                            "apikey":
                                SUPABASE_KEY,

                            "Authorization":
                                `Bearer ${SUPABASE_KEY}`,

                            "Accept":
                                "application/json"

                        }

                    }

                );


            if (
                !response.ok
            ) {

                console.warn(
                    "The Ripple Well: could not load approved Impact Ripples."
                );


                return;

            }


            const submissions =
                await response.json();


            if (
                !Array.isArray(
                    submissions
                )
            ) {

                return;

            }


            if (
                impactCount
            ) {

                impactCount.textContent =
                    submissions
                        .length
                        .toLocaleString();

            }


            submissions.forEach(
                (
                    submission,
                    index
                ) => {

                    createImpactRipple(
                        submission,
                        index
                    );

                }
            );


            repositionImpactRipples();


            /*
             * Run one more layout pass on the next frame so the placement
             * uses the final rendered Water.png dimensions.
             */

            requestAnimationFrame(
                repositionImpactRipples
            );


            console.log(
                `The Ripple Well: ${submissions.length} approved Impact Ripple(s) loaded.`
            );


        } catch (
            error
        ) {

            console.warn(
                "The Ripple Well: approved Impact Ripples unavailable.",
                error
            );

        }

    }


    loadApprovedImpactRipples();


    /* =====================================================
       VISITOR COUNTRY
    ===================================================== */

    function getVisitorCountry() {

        try {

            const parts =
                (
                    navigator.language ||
                    ""
                )
                .split("-");


            if (
                parts.length <
                2
            ) {

                return "";

            }


            const code =
                parts[
                    parts.length -
                    1
                ]
                .toUpperCase();


            const names = {

                CA:
                    "Canada",

                US:
                    "United States",

                GB:
                    "United Kingdom",

                AU:
                    "Australia",

                NZ:
                    "New Zealand",

                IE:
                    "Ireland",

                FR:
                    "France",

                DE:
                    "Germany",

                ES:
                    "Spain",

                IT:
                    "Italy",

                NL:
                    "Netherlands",

                BE:
                    "Belgium",

                SE:
                    "Sweden",

                NO:
                    "Norway",

                DK:
                    "Denmark",

                FI:
                    "Finland",

                IN:
                    "India",

                JP:
                    "Japan",

                CN:
                    "China",

                KR:
                    "South Korea"

            };


            return (
                names[code] ||
                code
            );


        } catch (
            error
        ) {

            console.warn(
                "Could not determine visitor locale.",
                error
            );


            return "";

        }

    }


    /* =====================================================
       SUBMISSION
    ===================================================== */

    async function submitRippleToSupabase(
        message,
        name,
        region,
        country
    ) {

        const submission = {

            message:
                message.trim(),

            name:
                name
                    ? name.trim()
                    : "",

            region:
                region
                    ? region.trim()
                    : "",

            country:

                country &&
                country.trim()

                    ? country.trim()

                    : getVisitorCountry(),

            status:
                "pending"

        };


        const response =
            await fetch(

                `${SUPABASE_URL}/rest/v1/ripple_submissions`,

                {

                    method:
                        "POST",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "apikey":
                            SUPABASE_KEY,

                        "Authorization":
                            `Bearer ${SUPABASE_KEY}`,

                        "Prefer":
                            "return=minimal"

                    },

                    body:
                        JSON.stringify(
                            submission
                        )

                }

            );


        if (
            !response.ok
        ) {

            let details =
                "Unknown Supabase error.";


            try {

                details =
                    await response.text();

            } catch (
                error
            ) {

                console.warn(
                    "Could not read Supabase error.",
                    error
                );

            }


            console.error(
                "Ripple submission failed:",
                response.status,
                details
            );


            throw new Error(
                `Supabase submission failed (${response.status}).`
            );

        }

    }


    /* =====================================================
       SUBMISSION FORM
    ===================================================== */

    if (
        rippleForm
    ) {

        rippleForm.addEventListener(
            "submit",
            async event => {

                event.preventDefault();


                const message =
                    document.getElementById(
                        "ripple-message"
                    );


                const name =
                    document.getElementById(
                        "ripple-name"
                    );


                const region =
                    document.getElementById(
                        "ripple-region"
                    );


                const country =
                    document.getElementById(
                        "ripple-country"
                    );


                if (
                    !message ||
                    !message.value.trim()
                ) {

                    return;

                }


                const submitButton =
                    rippleForm.querySelector(
                        'button[type="submit"]'
                    );


                const originalText =
                    submitButton

                        ? submitButton.textContent

                        : "";


                if (
                    submitButton
                ) {

                    submitButton.disabled =
                        true;


                    submitButton.textContent =
                        "Sending...";

                }


                try {

                    await submitRippleToSupabase(

                        message.value,

                        name
                            ? name.value
                            : "",

                        region
                            ? region.value
                            : "",

                        country
                            ? country.value
                            : ""

                    );


                    message.value =
                        "";


                    if (
                        name
                    ) {

                        name.value =
                            "";

                    }


                    if (
                        region
                    ) {

                        region.value =
                            "";

                    }


                    if (
                        country
                    ) {

                        country.value =
                            "";

                    }


                    closeModal(
                        makeRippleModal
                    );


                    setTimeout(
                        () => {

                            alert(
                                "Thank you for making a ripple. Your message has been submitted for review."
                            );

                        },
                        250
                    );


                } catch (
                    error
                ) {

                    console.error(
                        "The Ripple Well submission error:",
                        error
                    );


                    alert(
                        "We couldn't submit your ripple right now. Please try again in a moment."
                    );


                } finally {

                    if (
                        submitButton
                    ) {

                        submitButton.disabled =
                            false;


                        submitButton.textContent =
                            originalText;

                    }

                }

            }
        );

    }


    /* =====================================================
       INITIALIZATION
    ===================================================== */

    console.log(
        "The Ripple Well v3.2 initialized."
    );


    console.log(
        "Water image surface: active"
    );


    console.log(
        "Full Well click ripples: active"
    );


    console.log(
        "Impact Ripple pulse system: active"
    );


    console.log(
        "Impact Ripple quote modal: active"
    );


    console.log(
        "Supabase submission: active"
    );


})();
