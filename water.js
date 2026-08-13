/* =========================================================
   THE RIPPLE WELL
   VERSION 2.0

   THREE-LAYER WATER EXPERIENCE

   1. SURFACE
      Natural moonlit water movement.

   2. REFLECTION
      Header reflection reacts to water interaction.

   3. DEPTH
      Floating Impact Ripples live beneath the surface.

   IMPACT RIPPLE ENHANCEMENT
   - Irregular concentric elliptical ripple appearance.
   - Transparent water distortion.
   - Slow organic floating movement.
   - Continuous single-wave ripple emission.
   - No visible persistent outline around the clickable area.

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

       Deliberately organic rather than grid-like.
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
           CLICK RIPPLE FUNCTION
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
             * Correct aspect ratio so the water behaves
             * naturally on wide screens.
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
       CREATE VISIBLE CLICK RIPPLE
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
       
       SIZE NOW CONTROLS:
       - Visible ripple scale
       - Ripple travel distance
       - Ripple duration
       - Ripple opacity
    ===================================================== */

    const impactRippleData = [

        {
            x: 0.17,
            y: 0.37,
            depth: "far",
            floatTime: "13s",
            rotation: -8,
            size: 0.78,
            rippleScale: 0.82,
            rippleTime: "7.8s"
        },

        {
            x: 0.36,
            y: 0.53,
            depth: "mid",
            floatTime: "16s",
            rotation: 6,
            size: 0.92,
            rippleScale: 1.00,
            rippleTime: "7.0s"
        },

        {
            x: 0.62,
            y: 0.39,
            depth: "near",
            floatTime: "14s",
            rotation: -5,
            size: 1.12,
            rippleScale: 1.18,
            rippleTime: "6.3s"
        },

        {
            x: 0.80,
            y: 0.58,
            depth: "far",
            floatTime: "18s",
            rotation: 11,
            size: 0.74,
            rippleScale: 0.76,
            rippleTime: "8.2s"
        },

        {
            x: 0.25,
            y: 0.72,
            depth: "mid",
            floatTime: "15s",
            rotation: -12,
            size: 0.96,
            rippleScale: 1.04,
            rippleTime: "7.1s"
        },

        {
            x: 0.71,
            y: 0.78,
            depth: "near",
            floatTime: "17s",
            rotation: 7,
            size: 1.16,
            rippleScale: 1.24,
            rippleTime: "6.0s"
        }
    ];


    /* =====================================================
       IMPACT RIPPLE STYLE
       
       IMPORTANT:
       The clickable object itself has NO visible border,
       background, or permanent outline.

       The visual ripple is produced separately by
       ::before and ::after.
    ===================================================== */

    const impactRippleStyle =
        document.createElement("style");


    impactRippleStyle.textContent = `

        .impact-ripple {

            /*
             * The clickable area remains.
             * The shape itself is invisible.
             */

            background: transparent !important;

            border: none !important;

            box-shadow: none !important;

            overflow: visible;

            opacity: 1;

            filter: none;

            /*
             * Preserve the existing floating motion.
             */

            animation:
                organicFloat
                var(--float-time)
                ease-in-out
                infinite
                alternate;
        }


        /*
         * SINGLE SURROUNDING RIPPLE
         *
         * This is the visible effect.
         *
         * It starts close to the Impact Ripple,
         * expands outward,
         * becomes slightly distorted,
         * and fades away.
         */

        .impact-ripple::before {

            content: "";

            position: absolute;

            left: 50%;
            top: 50%;

            width: 58%;
            height: 42%;

            transform:
                translate(-50%, -50%)
                rotate(var(--ripple-rotation, 0deg))
                scale(0.45);

            transform-origin: center;

            border:
                1px solid
                rgba(151, 226, 243, 0.34);

            border-radius:
                50%;

            background:
                transparent;

            box-shadow:
                0 0 5px
                rgba(101, 203, 229, 0.11);

            opacity: 0;

            pointer-events: none;

            animation:
                impactRippleWave
                var(--ripple-time, 7s)
                ease-out
                infinite;
        }


        /*
         * VERY SOFT WATER DISTORTION
         *
         * This gives the wave a little irregularity
         * instead of looking like a perfect graphic circle.
         */

        .impact-ripple::after {

            content: "";

            position: absolute;

            left: 50%;
            top: 50%;

            width: 76%;
            height: 52%;

            transform:
                translate(-50%, -50%)
                rotate(var(--ripple-secondary-rotation, 0deg))
                scale(0.40);

            border-radius:
                48%
                52%
                55%
                45%
                /
                53%
                47%
                51%
                49%;

            border:
                1px solid
                rgba(120, 212, 235, 0.11);

            background:
                transparent;

            filter:
                blur(1.4px);

            opacity: 0;

            pointer-events: none;

            animation:
                impactRippleDistortion
                var(--ripple-time, 7s)
                ease-out
                infinite;
        }


        /*
         * RIPPLE WAVE
         */

        @keyframes impactRippleWave {

            0% {

                transform:
                    translate(-50%, -50%)
                    rotate(var(--ripple-rotation, 0deg))
                    scale(0.42);

                opacity: 0;
            }


            8% {

                opacity:
                    var(--ripple-opacity, 0.34);
            }


            45% {

                opacity:
                    calc(
                        var(--ripple-opacity, 0.34) * 0.72
                    );
            }


            78% {

                opacity:
                    calc(
                        var(--ripple-opacity, 0.34) * 0.26
                    );
            }


            100% {

                transform:
                    translate(-50%, -50%)
                    rotate(
                        calc(
                            var(--ripple-rotation, 0deg) + 5deg
                        )
                    )
                    scale(
                        var(--ripple-scale, 1)
                    );

                opacity: 0;
            }
        }


        /*
         * SECONDARY DISTORTION
         */

        @keyframes impactRippleDistortion {

            0% {

                transform:
                    translate(-50%, -50%)
                    rotate(
                        var(
                            --ripple-secondary-rotation,
                            0deg
                        )
                    )
                    scale(0.40);

                opacity: 0;
            }


            15% {

                opacity:
                    calc(
                        var(--ripple-opacity, 0.34) * 0.24
                    );
            }


            55% {

                opacity:
                    calc(
                        var(--ripple-opacity, 0.34) * 0.13
                    );
            }


            100% {

                transform:
                    translate(-50%, -50%)
                    rotate(
                        calc(
                            var(
                                --ripple-secondary-rotation,
                                0deg
                            ) - 4deg
                        )
                    )
                    scale(
                        calc(
                            var(--ripple-scale, 1) * 1.08
                        )
                    );

                opacity: 0;
            }
        }


        /*
         * HOVER
         *
         * Only the ripple itself becomes more noticeable.
         * The clickable area never receives an outline.
         */

        .impact-ripple:hover {

            background: transparent !important;

            border: none !important;

            box-shadow: none !important;

            filter: none;

            opacity: 1;
        }


        .impact-ripple:hover::before {

            border-color:
                rgba(170, 235, 249, 0.52);

            box-shadow:
                0 0 9px
                rgba(110, 215, 240, 0.24);
        }


        .impact-ripple:hover::after {

            border-color:
                rgba(145, 224, 241, 0.20);
        }

    `;


    document.head.appendChild(
        impactRippleStyle
    );


    /* =====================================================
       CREATE SAMPLE IMPACT RIPPLES
       
       No "Impact Ripple" text appears on objects.
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
                 * Ripple-specific settings.
                 */

                ripple.style.setProperty(
                    "--ripple-scale",
                    data.rippleScale
                );


                ripple.style.setProperty(
                    "--ripple-time",
                    data.rippleTime
                );


                /*
                 * Larger Impact Ripples create a larger,
                 * slightly stronger surrounding ripple.
                 */

                const rippleOpacity =
                    data.size >= 1.1
                        ? 0.42
                        : data.size >= 0.9
                            ? 0.34
                            : 0.27;


                ripple.style.setProperty(
                    "--ripple-opacity",
                    rippleOpacity
                );


                ripple.style.setProperty(
                    "--ripple-rotation",
                    `${data.rotation * 0.35}deg`
                );


                ripple.style.setProperty(
                    "--ripple-secondary-rotation",
                    `${-data.rotation * 0.25}deg`
                );


                /*
                 * Scale the invisible clickable area.
                 * The size remains proportional to the
                 * original Impact Ripple concept.
                 */

                ripple.style.setProperty(
                    "--scale",
                    data.size
                );


                /*
                 * Important:
                 *
                 * There is intentionally NO visible
                 * "Impact Ripple" label and NO permanent
                 * outline around the clickable object.
                 */


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


    createImpactRipples();


    /* =====================================================
       VISIBILITY OPTIMIZATION
    ===================================================== */

    document.addEventListener(
        "visibilitychange",
        () => {

            /*
             * Nothing destructive happens here.
             * The animation loop naturally resumes
             * when the browser makes the tab active.
             */

        }
    );


    /* =====================================================
       INITIALIZATION COMPLETE
    ===================================================== */

    console.log(
        "The Ripple Well v2.0 initialized."
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
        "Impact Ripple Emission: active"
    );

})();
