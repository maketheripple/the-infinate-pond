/* =========================================================
   THE RIPPLE WELL
   VERSION 2.1

   THREE-LAYER WATER EXPERIENCE

   1. SURFACE
      Natural moonlit water movement.

   2. REFLECTION
      Header reflection reacts to water interaction.

   3. DEPTH
      Floating Impact Ripples live beneath the surface.

   IMPACT RIPPLE WAKE — VERSION 2.1
   ---------------------------------------------------------
   Each Impact Ripple now creates a subtle, singular,
   organic water disturbance while floating.

   The wake:
   - comes from a roundish source
   - expands as one continuous wave
   - is irregular rather than perfectly circular
   - slowly fades into the water
   - repeats organically
   - scales with the Impact Ripple
   - does NOT create the previous triangular effect

   IMPORTANT:
   - Clicking water creates a ripple.
   - Clicking water does NOT open the submission window.
   - "Make a Ripple" button opens the submission window.
========================================================= */


(() => {

    "use strict";


    /* =====================================================
       ELEMENTS
    ===================================================== */

    const canvas =
        document.getElementById("water-canvas");

    const waterWindow =
        document.getElementById("water-window");

    const reflectionLayer =
        document.getElementById("reflection-layer");

    const reflectionDistortion =
        document.getElementById("reflection-distortion");

    const impactLayer =
        document.getElementById("impact-ripples-layer");

    const makeRippleButton =
        document.getElementById("make-ripple-button");

    const makeRippleModal =
        document.getElementById("make-ripple-modal");

    const impactModal =
        document.getElementById("impact-modal");

    const rippleForm =
        document.getElementById("ripple-form");

    const closeButtons =
        document.querySelectorAll("[data-close-modal]");


    if (!canvas || !waterWindow) {

        console.error(
            "The Ripple Well: required water elements were not found."
        );

        return;
    }


    /* =====================================================
       IMPACT RIPPLE WAKE STYLE
       
       Injected by JavaScript so index.html does not need
       to be changed for this effect.
    ===================================================== */

    const wakeStyle =
        document.createElement("style");

    wakeStyle.textContent = `

        /* =================================================
           IMPACT RIPPLE — SINGLE ORGANIC WATER WAKE
        ================================================= */

        .impact-ripple-wake {

            position: absolute;

            left: 50%;
            top: 50%;

            width: var(--wake-width, 125px);
            height: var(--wake-height, 68px);

            transform:
                translate(-50%, -50%)
                rotate(var(--wake-rotation, 0deg))
                scale(0.28);

            border-radius:
                54% 46%
                62% 38%
                /
                47% 58%
                42% 53%;

            border:
                1px solid
                rgba(145, 222, 241, 0.0);

            background:
                transparent;

            box-shadow:
                0 0 0
                rgba(113, 214, 237, 0);

            opacity: 0;

            pointer-events: none;

            animation:
                impactWakeExpand
                var(--wake-duration, 5.8s)
                cubic-bezier(0.22, 0.61, 0.36, 1)
                forwards;

            z-index: -1;
        }


        /*
         * The secondary edge gives the wake an irregular
         * natural-water appearance without creating a
         * second visible ring.
         */

        .impact-ripple-wake::after {

            content: "";

            position: absolute;

            left: 4%;
            top: 7%;

            width: 92%;
            height: 86%;

            border-radius:
                48% 52%
                57% 43%
                /
                53% 46%
                55% 45%;

            border:
                1px solid
                rgba(163, 229, 244, 0.0);

            transform:
                rotate(-3deg)
                scale(1.015);

            opacity: 0.72;

            pointer-events: none;
        }


        @keyframes impactWakeExpand {

            0% {

                opacity: 0;

                transform:
                    translate(-50%, -50%)
                    rotate(var(--wake-rotation, 0deg))
                    scale(0.28);

                border-color:
                    rgba(145, 222, 241, 0);

                box-shadow:
                    0 0 0
                    rgba(113, 214, 237, 0);
            }


            12% {

                opacity:
                    var(--wake-opacity, 0.52);

                border-color:
                    rgba(145, 222, 241, 0.28);

                box-shadow:
                    0 0 7px
                    rgba(113, 214, 237, 0.08);
            }


            42% {

                opacity:
                    var(--wake-opacity, 0.52);

                border-color:
                    rgba(145, 222, 241, 0.20);
            }


            72% {

                opacity:
                    calc(
                        var(--wake-opacity, 0.52) * 0.42
                    );

                border-color:
                    rgba(145, 222, 241, 0.09);

                box-shadow:
                    0 0 10px
                    rgba(113, 214, 237, 0.04);
            }


            100% {

                opacity: 0;

                transform:
                    translate(-50%, -50%)
                    rotate(var(--wake-rotation, 0deg))
                    scale(1.0);

                border-color:
                    rgba(145, 222, 241, 0);

                box-shadow:
                    0 0 0
                    rgba(113, 214, 237, 0);
            }
        }


        /*
         * The wake sits underneath the Impact Ripple,
         * allowing the source to remain visible.
         */

        .impact-ripple {
            isolation: isolate;
        }


        /*
         * Slightly different wake behavior depending on
         * depth makes the pond feel less mechanically
         * synchronized.
         */

        .depth-far .impact-ripple-wake {

            filter:
                blur(0.65px);

        }


        .depth-mid .impact-ripple-wake {

            filter:
                blur(0.35px);

        }


        .depth-near .impact-ripple-wake {

            filter:
                blur(0.15px);

        }

    `;

    document.head.appendChild(
        wakeStyle
    );


    /* =====================================================
       CANVAS
    ===================================================== */

    const gl =
        canvas.getContext("webgl", {
            alpha: true,
            antialias: true
        });


    if (!gl) {

        console.error(
            "The Ripple Well: WebGL is not available."
        );

        return;
    }


    /* =====================================================
       DEVICE / SIZE
    ===================================================== */

    let width = 1;
    let height = 1;

    let dpr =
        Math.min(
            window.devicePixelRatio || 1,
            2
        );


    function resize() {

        const rect =
            waterWindow.getBoundingClientRect();

        width =
            Math.max(1, rect.width);

        height =
            Math.max(1, rect.height);

        canvas.width =
            Math.floor(width * dpr);

        canvas.height =
            Math.floor(height * dpr);

        canvas.style.width =
            `${width}px`;

        canvas.style.height =
            `${height}px`;

        gl.viewport(
            0,
            0,
            canvas.width,
            canvas.height
        );
    }


    window.addEventListener(
        "resize",
        resize,
        { passive: true }
    );

    resize();


    /* =====================================================
       SHADER HELPERS
    ===================================================== */

    function createShader(type, source) {

        const shader =
            gl.createShader(type);

        gl.shaderSource(
            shader,
            source
        );

        gl.compileShader(shader);


        if (
            !gl.getShaderParameter(
                shader,
                gl.COMPILE_STATUS
            )
        ) {

            console.error(
                gl.getShaderInfoLog(shader)
            );

            gl.deleteShader(shader);

            return null;
        }

        return shader;
    }


    function createProgram(
        vertexSource,
        fragmentSource
    ) {

        const vertexShader =
            createShader(
                gl.VERTEX_SHADER,
                vertexSource
            );

        const fragmentShader =
            createShader(
                gl.FRAGMENT_SHADER,
                fragmentSource
            );


        if (
            !vertexShader ||
            !fragmentShader
        ) {

            return null;
        }


        const program =
            gl.createProgram();

        gl.attachShader(
            program,
            vertexShader
        );

        gl.attachShader(
            program,
            fragmentShader
        );

        gl.linkProgram(program);


        if (
            !gl.getProgramParameter(
                program,
                gl.LINK_STATUS
            )
        ) {

            console.error(
                gl.getProgramInfoLog(program)
            );

            return null;
        }


        return program;
    }


    /* =====================================================
       VERTEX SHADER
    ===================================================== */

    const vertexShaderSource = `
        attribute vec2 a_position;

        void main() {

            gl_Position =
                vec4(
                    a_position,
                    0.0,
                    1.0
                );
        }
    `;


    /* =====================================================
       FRAGMENT SHADER
       
       Natural moonlit water.
    ===================================================== */

    const fragmentShaderSource = `

        precision highp float;


        uniform vec2 u_resolution;
        uniform float u_time;

        uniform vec2 u_ripple0;
        uniform float u_rippleTime0;

        uniform vec2 u_ripple1;
        uniform float u_rippleTime1;

        uniform vec2 u_ripple2;
        uniform float u_rippleTime2;


        /* -------------------------------------------------
           HASH / NOISE
        ------------------------------------------------- */

        float hash(vec2 p) {

            p =
                fract(
                    p *
                    vec2(
                        123.34,
                        456.21
                    )
                );

            p +=
                dot(
                    p,
                    p + 45.32
                );

            return
                fract(
                    p.x *
                    p.y
                );
        }


        float noise(vec2 p) {

            vec2 i =
                floor(p);

            vec2 f =
                fract(p);

            f =
                f *
                f *
                (
                    3.0 -
                    2.0 * f
                );


            float a =
                hash(i);

            float b =
                hash(
                    i +
                    vec2(
                        1.0,
                        0.0
                    )
                );

            float c =
                hash(
                    i +
                    vec2(
                        0.0,
                        1.0
                    )
                );

            float d =
                hash(
                    i +
                    vec2(
                        1.0,
                        1.0
                    )
                );


            return
                mix(
                    mix(a, b, f.x),
                    mix(c, d, f.x),
                    f.y
                );
        }


        /* -------------------------------------------------
           FRACTAL ORGANIC MOTION
        ------------------------------------------------- */

        float fbm(vec2 p) {

            float value = 0.0;

            float amplitude = 0.5;

            for (
                int i = 0;
                i < 5;
                i++
            ) {

                value +=
                    amplitude *
                    noise(p);

                p *= 2.02;

                amplitude *= 0.5;
            }

            return value;
        }


        /* -------------------------------------------------
           RIPPLE FUNCTION
        ------------------------------------------------- */

        float ripple(
            vec2 uv,
            vec2 center,
            float age
        ) {

            if (age < 0.0)
                return 0.0;


            float distanceFromCenter =
                distance(
                    uv,
                    center
                );


            float radius =
                age *
                0.32;


            float wave =
                sin(
                    (
                        distanceFromCenter -
                        radius
                    ) *
                    75.0
                );


            float ring =
                exp(
                    -abs(
                        distanceFromCenter -
                        radius
                    ) *
                    35.0
                );


            float fade =
                exp(
                    -age *
                    0.72
                );


            return
                wave *
                ring *
                fade;
        }


        /* -------------------------------------------------
           MAIN
        ------------------------------------------------- */

        void main() {

            vec2 uv =
                gl_FragCoord.xy /
                u_resolution.xy;


            /*
             * Correct the aspect ratio so the water
             * behaves naturally on wide screens.
             */

            vec2 aspectUV =
                uv;

            aspectUV.x *=
                u_resolution.x /
                u_resolution.y;


            /* ---------------------------------------------
               ORGANIC WATER MOVEMENT
            --------------------------------------------- */

            vec2 flowUV =
                aspectUV *
                2.4;


            flowUV +=
                vec2(
                    u_time * 0.012,
                    u_time * 0.006
                );


            float broadNoise =
                fbm(
                    flowUV
                );


            float fineNoise =
                fbm(
                    flowUV * 3.1 +
                    vec2(
                        -u_time * 0.018,
                        u_time * 0.011
                    )
                );


            float water =
                broadNoise * 0.72 +
                fineNoise * 0.28;


            /* ---------------------------------------------
               SMALL NATURAL WAVES
            --------------------------------------------- */

            float waves =
                sin(
                    aspectUV.x * 23.0 +
                    u_time * 0.18 +
                    water * 4.0
                )
                *
                0.018;


            waves +=
                sin(
                    aspectUV.x * 51.0 -
                    u_time * 0.11 +
                    water * 7.0
                )
                *
                0.009;


            /* ---------------------------------------------
               CLICK RIPPLES
            --------------------------------------------- */

            float r0 =
                ripple(
                    uv,
                    u_ripple0,
                    u_time - u_rippleTime0
                );

            float r1 =
                ripple(
                    uv,
                    u_ripple1,
                    u_time - u_rippleTime1
                );

            float r2 =
                ripple(
                    uv,
                    u_ripple2,
                    u_time - u_rippleTime2
                );


            float rippleValue =
                r0 +
                r1 +
                r2;


            /* ---------------------------------------------
               MOONLIGHT
            --------------------------------------------- */

            float moonGlow =
                exp(
                    -pow(
                        (uv.x - 0.5) * 3.2,
                        2.0
                    )
                );


            float reflectionNoise =
                noise(
                    vec2(
                        uv.x * 9.0,
                        uv.y * 3.0 +
                        u_time * 0.02
                    )
                );


            float moonReflection =
                moonGlow *
                (
                    0.24 +
                    reflectionNoise *
                    0.34
                );


            /*
             * Reflection becomes more fragmented lower
             * into the water.
             */

            float reflectionFade =
                smoothstep(
                    0.0,
                    0.68,
                    1.0 - uv.y
                );


            moonReflection *=
                reflectionFade;


            moonReflection +=
                rippleValue *
                0.16;


            /* ---------------------------------------------
               WATER COLOR
            --------------------------------------------- */

            vec3 deepWater =
                vec3(
                    0.005,
                    0.032,
                    0.045
                );


            vec3 surfaceWater =
                vec3(
                    0.025,
                    0.115,
                    0.145
                );


            vec3 color =
                mix(
                    deepWater,
                    surfaceWater,
                    smoothstep(
                        0.0,
                        0.9,
                        uv.y
                    )
                );


            /* ---------------------------------------------
               NATURAL WATER VARIATION
            --------------------------------------------- */

            color +=
                water *
                vec3(
                    0.012,
                    0.038,
                    0.047
                );


            color +=
                waves *
                vec3(
                    0.06,
                    0.14,
                    0.16
                );


            /* ---------------------------------------------
               MOONLIGHT COLOR
            --------------------------------------------- */

            color +=
                moonReflection *
                vec3(
                    0.48,
                    0.78,
                    0.88
                );


            /* ---------------------------------------------
               RIPPLE HIGHLIGHTS
            --------------------------------------------- */

            color +=
                abs(
                    rippleValue
                )
                *
                vec3(
                    0.16,
                    0.38,
                    0.46
                );


            /* ---------------------------------------------
               DEPTH DARKENING
            --------------------------------------------- */

            float depth =
                smoothstep(
                    0.0,
                    1.0,
                    uv.y
                );


            color *=
                mix(
                    1.0,
                    0.55,
                    depth * 0.62
                );


            /* ---------------------------------------------
               TOP SURFACE GLOW
            --------------------------------------------- */

            float surfaceGlow =
                smoothstep(
                    0.42,
                    0.0,
                    uv.y
                );


            color +=
                surfaceGlow *
                vec3(
                    0.025,
                    0.065,
                    0.08
                );


            gl_FragColor =
                vec4(
                    color,
                    1.0
                );
        }
    `;


    /* =====================================================
       PROGRAM
    ===================================================== */

    const program =
        createProgram(
            vertexShaderSource,
            fragmentShaderSource
        );


    if (!program) {
        return;
    }


    gl.useProgram(program);


    /* =====================================================
       FULLSCREEN QUAD
    ===================================================== */

    const positionBuffer =
        gl.createBuffer();

    gl.bindBuffer(
        gl.ARRAY_BUFFER,
        positionBuffer
    );


    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([
            -1, -1,
             1, -1,
            -1,  1,

            -1,  1,
             1, -1,
             1,  1
        ]),
        gl.STATIC_DRAW
    );


    const positionLocation =
        gl.getAttribLocation(
            program,
            "a_position"
        );


    gl.enableVertexAttribArray(
        positionLocation
    );


    gl.vertexAttribPointer(
        positionLocation,
        2,
        gl.FLOAT,
        false,
        0,
        0
    );


    /* =====================================================
       UNIFORMS
    ===================================================== */

    const uResolution =
        gl.getUniformLocation(
            program,
            "u_resolution"
        );

    const uTime =
        gl.getUniformLocation(
            program,
            "u_time"
        );


    const rippleLocations = [

        {
            point:
                gl.getUniformLocation(
                    program,
                    "u_ripple0"
                ),

            time:
                gl.getUniformLocation(
                    program,
                    "u_rippleTime0"
                )
        },

        {
            point:
                gl.getUniformLocation(
                    program,
                    "u_ripple1"
                ),

            time:
                gl.getUniformLocation(
                    program,
                    "u_rippleTime1"
                )
        },

        {
            point:
                gl.getUniformLocation(
                    program,
                    "u_ripple2"
                ),

            time:
                gl.getUniformLocation(
                    program,
                    "u_rippleTime2"
                )
        }
    ];


    /* =====================================================
       RIPPLE STATE
    ===================================================== */

    const MAX_RIPPLES = 3;

    const ripples = [];

    for (
        let i = 0;
        i < MAX_RIPPLES;
        i++
    ) {

        ripples.push({
            x: -10,
            y: -10,
            time: -100
        });
    }


    let rippleIndex = 0;


    /* =====================================================
       TIME
    ===================================================== */

    const startTime =
        performance.now();


    /* =====================================================
       REFLECTION DISTURBANCE
    ===================================================== */

    let reflectionTimeout = null;


    function disturbReflection(
        x,
        y
    ) {

        if (!reflectionDistortion)
            return;


        const percentX =
            `${x * 100}%`;

        const percentY =
            `${y * 100}%`;


        reflectionDistortion.style
            .setProperty(
                "--ripple-x",
                percentX
            );


        reflectionDistortion.style
            .setProperty(
                "--ripple-y",
                percentY
            );


        reflectionDistortion.classList
            .remove("active");


        void reflectionDistortion.offsetWidth;


        reflectionDistortion.classList
            .add("active");


        clearTimeout(
            reflectionTimeout
        );


        reflectionTimeout =
            setTimeout(
                () => {

                    reflectionDistortion
                        .classList
                        .remove("active");

                },
                850
            );
    }


    /* =====================================================
       CREATE VISIBLE RIPPLE
    ===================================================== */

    function createVisibleRipple(
        x,
        y
    ) {

        const ripple =
            document.createElement("div");


        ripple.className =
            "click-ripple";


        ripple.style.left =
            `${x * 100}%`;

        ripple.style.top =
            `${y * 100}%`;


        waterWindow.appendChild(
            ripple
        );


        ripple.addEventListener(
            "animationend",
            () => {

                ripple.remove();

            },
            {
                once: true
            }
        );
    }


    /* =====================================================
       ADD WATER RIPPLE
    ===================================================== */

    function addRipple(
        clientX,
        clientY
    ) {

        const rect =
            waterWindow.getBoundingClientRect();


        const x =
            (
                clientX -
                rect.left
            ) /
            rect.width;


        const y =
            (
                clientY -
                rect.top
            ) /
            rect.height;


        const now =
            (
                performance.now() -
                startTime
            ) /
            1000;


        ripples[rippleIndex] = {

            x,
            y,
            time: now
        };


        rippleIndex =
            (
                rippleIndex + 1
            ) %
            MAX_RIPPLES;


        createVisibleRipple(
            x,
            y
        );


        disturbReflection(
            x,
            y
        );
    }


    /* =====================================================
       POINTER INTERACTION
    ===================================================== */

    canvas.addEventListener(
        "pointerdown",
        event => {

            /*
             * Only the water canvas creates water ripples.
             * The Make a Ripple button remains separate.
             */

            addRipple(
                event.clientX,
                event.clientY
            );
        }
    );


    /* =====================================================
       RENDER
    ===================================================== */

    function render() {

        const elapsed =
            (
                performance.now() -
                startTime
            ) /
            1000;


        gl.useProgram(program);


        gl.uniform2f(
            uResolution,
            canvas.width,
            canvas.height
        );


        gl.uniform1f(
            uTime,
            elapsed
        );


        for (
            let i = 0;
            i < MAX_RIPPLES;
            i++
        ) {

            const ripple =
                ripples[i];


            gl.uniform2f(
                rippleLocations[i].point,
                ripple.x,
                1.0 - ripple.y
            );


            gl.uniform1f(
                rippleLocations[i].time,
                ripple.time
            );
        }


        gl.drawArrays(
            gl.TRIANGLES,
            0,
            6
        );


        requestAnimationFrame(
            render
        );
    }


    render();


    /* =====================================================
       STAR FIELD
    ===================================================== */

    const stars =
        document.getElementById("stars");


    if (stars) {

        const starCount =
            window.innerWidth < 700
                ? 48
                : 82;


        for (
            let i = 0;
            i < starCount;
            i++
        ) {

            const star =
                document.createElement("div");


            star.className =
                "star";


            const size =
                1 +
                Math.random() * 2.1;


            const opacity =
                0.28 +
                Math.random() * 0.58;


            const glow =
                2 +
                Math.random() * 7;


            const duration =
                2.5 +
                Math.random() * 5;


            star.style.width =
                `${size}px`;

            star.style.height =
                `${size}px`;

            star.style.left =
                `${Math.random() * 100}%`;

            star.style.top =
                `${Math.random() * 72}%`;

            star.style.setProperty(
                "--opacity",
                opacity
            );

            star.style.setProperty(
                "--glow",
                `${glow}px`
            );

            star.style.setProperty(
                "--duration",
                `${duration}s`
            );


            stars.appendChild(
                star
            );
        }
    }


    /* =====================================================
       MODAL HELPERS
    ===================================================== */

    function openModal(modal) {

        if (!modal)
            return;


        modal.classList.add("open");

        modal.setAttribute(
            "aria-hidden",
            "false"
        );


        document.body.style.overflow =
            "hidden";
    }


    function closeModal(modal) {

        if (!modal)
            return;


        modal.classList.remove("open");

        modal.setAttribute(
            "aria-hidden",
            "true"
        );


        /*
         * Only restore scrolling if no other
         * modal is open.
         */

        const anotherModalOpen =
            document.querySelector(
                ".modal-overlay.open"
            );


        if (!anotherModalOpen) {

            document.body.style.overflow =
                "";
        }
    }


    /* =====================================================
       MAKE A RIPPLE BUTTON
    ===================================================== */

    if (makeRippleButton) {

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
                event.key ===
                "Escape"
            ) {

                document
                    .querySelectorAll(
                        ".modal-overlay.open"
                    )
                    .forEach(
                        modal => {

                            closeModal(
                                modal
                            );
                        }
                    );
            }
        }
    );


    /* =====================================================
       SUBMISSION FORM
       
       This is intentionally still front-end only.
       Approval/storage will be connected later.
    ===================================================== */

    if (rippleForm) {

        rippleForm.addEventListener(
            "submit",
            event => {

                event.preventDefault();


                const message =
                    document
                        .getElementById(
                            "ripple-message"
                        );


                const name =
                    document
                        .getElementById(
                            "ripple-name"
                        );


                if (
                    !message ||
                    !message.value.trim()
                ) {

                    return;
                }


                console.log(
                    "Ripple submitted:",
                    {
                        message:
                            message.value.trim(),

                        name:
                            name
                                ? name.value.trim()
                                : ""
                    }
                );


                message.value = "";

                if (name) {
                    name.value = "";
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
            }
        );
    }


    /* =====================================================
       IMPACT RIPPLE DATA
    ===================================================== */

    const impactRippleData = [

        {
            x: 0.17,
            y: 0.37,
            depth: "far",
            floatTime: "13s",
            rotation: -8,

            wakeWidth: 86,
            wakeHeight: 46,
            wakeDuration: "6.8s",
            wakeOpacity: 0.32,
            wakeDelay: "0.4s"
        },

        {
            x: 0.36,
            y: 0.53,
            depth: "mid",
            floatTime: "16s",
            rotation: 6,

            wakeWidth: 108,
            wakeHeight: 56,
            wakeDuration: "6.4s",
            wakeOpacity: 0.40,
            wakeDelay: "1.8s"
        },

        {
            x: 0.62,
            y: 0.39,
            depth: "near",
            floatTime: "14s",
            rotation: -5,

            wakeWidth: 138,
            wakeHeight: 72,
            wakeDuration: "5.8s",
            wakeOpacity: 0.54,
            wakeDelay: "0.9s"
        },

        {
            x: 0.80,
            y: 0.58,
            depth: "far",
            floatTime: "18s",
            rotation: 11,

            wakeWidth: 92,
            wakeHeight: 49,
            wakeDuration: "7.2s",
            wakeOpacity: 0.30,
            wakeDelay: "3.2s"
        },

        {
            x: 0.25,
            y: 0.72,
            depth: "mid",
            floatTime: "15s",
            rotation: -12,

            wakeWidth: 112,
            wakeHeight: 58,
            wakeDuration: "6.6s",
            wakeOpacity: 0.40,
            wakeDelay: "2.6s"
        },

        {
            x: 0.71,
            y: 0.78,
            depth: "near",
            floatTime: "17s",
            rotation: 7,

            wakeWidth: 146,
            wakeHeight: 76,
            wakeDuration: "5.9s",
            wakeOpacity: 0.55,
            wakeDelay: "1.4s"
        }
    ];


    /* =====================================================
       IMPACT RIPPLE WAKE
       
       Creates ONE organic surrounding wave.
       
       The wake repeatedly emerges from underneath the
       Impact Ripple and expands outward.
    ===================================================== */

    function createImpactRippleWake(
        ripple,
        data
    ) {

        const wake =
            document.createElement("div");


        wake.className =
            "impact-ripple-wake";


        wake.style.setProperty(
            "--wake-width",
            `${data.wakeWidth}px`
        );


        wake.style.setProperty(
            "--wake-height",
            `${data.wakeHeight}px`
        );


        wake.style.setProperty(
            "--wake-duration",
            data.wakeDuration
        );


        wake.style.setProperty(
            "--wake-opacity",
            data.wakeOpacity
        );


        /*
         * Slightly different rotation keeps the wake
         * from looking mechanically attached to the
         * Impact Ripple's own rotation.
         */

        const wakeRotation =
            data.rotation * 0.35 +
            (Math.random() * 6 - 3);


        wake.style.setProperty(
            "--wake-rotation",
            `${wakeRotation}deg`
        );


        wake.style.animationDelay =
            data.wakeDelay;


        ripple.insertBefore(
            wake,
            ripple.firstChild
        );


        wake.addEventListener(
            "animationend",
            () => {

                /*
                 * Re-create the wake after a small,
                 * irregular pause.
                 */

                if (
                    !document.body.contains(
                        ripple
                    )
                ) {
                    return;
                }


                const nextDelay =
                    900 +
                    Math.random() * 2300;


                setTimeout(
                    () => {

                        if (
                            document.body.contains(
                                ripple
                            )
                        ) {

                            createImpactRippleWake(
                                ripple,
                                data
                            );
                        }

                    },
                    nextDelay
                );


                wake.remove();

            },
            {
                once: true
            }
        );
    }


    /* =====================================================
       CREATE IMPACT RIPPLES
       
       No "Impact Ripple" text appears on the objects.
    ===================================================== */

    function createImpactRipples() {

        if (!impactLayer)
            return;


        impactLayer.innerHTML = "";


        impactRippleData.forEach(
            (data, index) => {

                const ripple =
                    document.createElement("div");


                ripple.className =
                    `impact-ripple depth-${data.depth}`;


                ripple.dataset.index =
                    index;


                ripple.style.left =
                    `${data.x * 100}%`;


                ripple.style.top =
                    `${data.y * 100}%`;


                ripple.style.setProperty(
                    "--rotation",
                    `${data.rotation}deg`
                );


                ripple.style.setProperty(
                    "--secondary-rotation",
                    `${-data.rotation * 0.55}deg`
                );


                ripple.style.setProperty(
                    "--float-time",
                    data.floatTime
                );


                /*
                 * The Impact Ripple itself remains clean.
                 *
                 * The wake is a separate visual layer
                 * underneath it.
                 */

                createImpactRippleWake(
                    ripple,
                    data
                );


                /* -----------------------------------------
                   CLICK
                ----------------------------------------- */

                ripple.addEventListener(
                    "click",
                    event => {

                        event.stopPropagation();


                        openImpactRipple(
                            index
                        );
                    }
                );


                impactLayer.appendChild(
                    ripple
                );
            }
        );
    }


    /* =====================================================
       IMPACT RIPPLE OPEN
    ===================================================== */

    function openImpactRipple(
        index
    ) {

        const quote =
            document.getElementById(
                "impact-quote"
            );

        const details =
            document.getElementById(
                "impact-details"
            );


        if (!quote || !details)
            return;


        const sampleMessages = [

            {
                quote:
                    "You are never as alone as you think you are.",

                details:
                    "A message left in The Ripple Well to remind someone that there is always another ripple nearby."
            },

            {
                quote:
                    "Even the smallest ripple can reach someone.",

                details:
                    "A reminder that kindness does not have to be enormous to matter."
            },

            {
                quote:
                    "Keep going. Your story isn't finished.",

                details:
                    "A message of encouragement from one visitor to another."
            },

            {
                quote:
                    "You matter. More than you know.",

                details:
                    "A simple reminder waiting beneath the surface."
            },

            {
                quote:
                    "Someone out there is glad you are here.",

                details:
                    "A message of hope left for whoever needs to find it."
            },

            {
                quote:
                    "Make the ripple you wish someone had made for you.",

                details:
                    "A reminder that every act of kindness has somewhere to go."
            }
        ];


        const selected =
            sampleMessages[
                index %
                sampleMessages.length
            ];


        quote.textContent =
            `“${selected.quote}”`;


        details.textContent =
            selected.details;


        openModal(
            impactModal
        );
    }


    /* =====================================================
       INITIALIZE IMPACT RIPPLES
    ===================================================== */

    createImpactRipples();


    /* =====================================================
       VISIBILITY OPTIMIZATION
    ===================================================== */

    document.addEventListener(
        "visibilitychange",
        () => {

            /*
             * The animation naturally pauses according
             * to browser rendering behavior when the
             * document is hidden.
             */

        }
    );


    /* =====================================================
       INITIALIZATION COMPLETE
    ===================================================== */

    console.log(
        "The Ripple Well v2.1 initialized."
    );

    console.log(
        "Surface Layer: active"
    );

    console.log(
        "Reflection Layer: active"
    );

    console.log(
        "Depth Layer: active"
    );

    console.log(
        "Impact Ripple organic single-wave wakes: active"
    );

})();
