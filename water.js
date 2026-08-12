/* =========================================================
   THE RIPPLE WELL
   VERSION 2.2

   THREE-LAYER WATER EXPERIENCE

   1. SURFACE
      Natural moonlit water movement.

   2. REFLECTION
      Header reflection reacts to water interaction.

   3. DEPTH
      Floating Impact Ripples live beneath the surface.

   VERSION 2.2
   LIVING IMPACT RIPPLES

   Impact Ripples now continuously disturb the water
   around themselves while floating.

   The larger / nearer the Impact Ripple appears,
   the larger its surrounding ripple becomes.

   IMPORTANT:
   - Clicking water creates a ripple.
   - Clicking water does NOT open the submission window.
   - "Make a Ripple" button opens the submission window.
   - Impact Ripples open their message only when clicked.
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
       
       NATURAL MOONLIT WATER
       + CONTINUOUS IMPACT RIPPLE DISTURBANCE
    ===================================================== */

    const fragmentShaderSource = `

        precision highp float;


        uniform vec2 u_resolution;
        uniform float u_time;


        /* -------------------------------------------------
           USER CLICK RIPPLES
        ------------------------------------------------- */

        uniform vec2 u_ripple0;
        uniform float u_rippleTime0;

        uniform vec2 u_ripple1;
        uniform float u_rippleTime1;

        uniform vec2 u_ripple2;
        uniform float u_rippleTime2;


        /* -------------------------------------------------
           IMPACT RIPPLE POSITIONS
           
           Each Impact Ripple continuously generates its
           own small expanding water disturbance.
        ------------------------------------------------- */

        uniform vec2 u_impact0;
        uniform float u_impactSize0;
        uniform float u_impactPulse0;

        uniform vec2 u_impact1;
        uniform float u_impactSize1;
        uniform float u_impactPulse1;

        uniform vec2 u_impact2;
        uniform float u_impactSize2;
        uniform float u_impactPulse2;

        uniform vec2 u_impact3;
        uniform float u_impactSize3;
        uniform float u_impactPulse3;

        uniform vec2 u_impact4;
        uniform float u_impactSize4;
        uniform float u_impactPulse4;

        uniform vec2 u_impact5;
        uniform float u_impactSize5;
        uniform float u_impactPulse5;


        /* -------------------------------------------------
           HASH
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


        /* -------------------------------------------------
           NOISE
        ------------------------------------------------- */

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
           USER CLICK RIPPLE
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
           LIVING IMPACT RIPPLE
           
           Creates several soft, expanding disturbances.

           The shape is intentionally imperfect.
        ------------------------------------------------- */

        float impactRipple(
            vec2 uv,
            vec2 center,
            float size,
            float pulse
        ) {

            vec2 p =
                uv -
                center;


            /*
             * Correct the horizontal aspect ratio.
             */

            p.x *=
                u_resolution.x /
                u_resolution.y;


            /*
             * Subtle organic distortion.
             */

            float organic =
                fbm(
                    p * 7.0 +
                    vec2(
                        pulse * 0.18,
                        -pulse * 0.13
                    )
                );


            float angle =
                atan(
                    p.y,
                    p.x
                );


            float directional =
                sin(
                    angle * 3.0 +
                    organic * 5.0 +
                    pulse * 0.17
                )
                *
                0.055;


            float radius =
                length(p);


            radius +=
                directional;


            /*
             * Main expanding ring.
             */

            float cycle =
                mod(
                    pulse * 0.075,
                    1.0
                );


            float ringRadius =
                cycle *
                size;


            float ringWidth =
                0.012 +
                size * 0.004;


            float ring =
                exp(
                    -pow(
                        (
                            radius -
                            ringRadius
                        )
                        /
                        ringWidth,
                        2.0
                    )
                );


            /*
             * Secondary inner ring.
             */

            float secondCycle =
                mod(
                    pulse * 0.075 + 0.42,
                    1.0
                );


            float secondRadius =
                secondCycle *
                size;


            float secondRing =
                exp(
                    -pow(
                        (
                            radius -
                            secondRadius
                        )
                        /
                        (
                            ringWidth * 0.82
                        ),
                        2.0
                    )
                );


            /*
             * Outer fading disturbance.
             */

            float outerGlow =
                exp(
                    -radius *
                    7.0
                )
                *
                0.08;


            /*
             * Rings fade naturally as they expand.
             */

            float ringFade =
                1.0 -
                cycle;


            float secondFade =
                1.0 -
                secondCycle;


            return
                (
                    ring *
                    ringFade
                    +
                    secondRing *
                    secondFade *
                    0.72
                    +
                    outerGlow
                );
        }


        /* -------------------------------------------------
           MAIN
        ------------------------------------------------- */

        void main() {

            vec2 uv =
                gl_FragCoord.xy /
                u_resolution.xy;


            /* ---------------------------------------------
               ASPECT CORRECTION
            --------------------------------------------- */

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
               USER CLICK RIPPLES
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
               IMPACT RIPPLE DISTURBANCES
            --------------------------------------------- */

            float impactValue = 0.0;


            impactValue +=
                impactRipple(
                    uv,
                    u_impact0,
                    u_impactSize0,
                    u_impactPulse0
                );


            impactValue +=
                impactRipple(
                    uv,
                    u_impact1,
                    u_impactSize1,
                    u_impactPulse1
                );


            impactValue +=
                impactRipple(
                    uv,
                    u_impact2,
                    u_impactSize2,
                    u_impactPulse2
                );


            impactValue +=
                impactRipple(
                    uv,
                    u_impact3,
                    u_impactSize3,
                    u_impactPulse3
                );


            impactValue +=
                impactRipple(
                    uv,
                    u_impact4,
                    u_impactSize4,
                    u_impactPulse4
                );


            impactValue +=
                impactRipple(
                    uv,
                    u_impact5,
                    u_impactSize5,
                    u_impactPulse5
                );


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
               USER RIPPLE HIGHLIGHTS
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
               LIVING IMPACT RIPPLE HIGHLIGHTS
               
               Deliberately stronger than the previous
               version so the effect is actually visible.
            --------------------------------------------- */

            color +=
                impactValue *
                vec3(
                    0.11,
                    0.29,
                    0.36
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
       IMPACT RIPPLE UNIFORMS
    ===================================================== */

    const impactLocations = [];


    for (
        let i = 0;
        i < 6;
        i++
    ) {

        impactLocations.push({

            point:
                gl.getUniformLocation(
                    program,
                    `u_impact${i}`
                ),

            size:
                gl.getUniformLocation(
                    program,
                    `u_impactSize${i}`
                ),

            pulse:
                gl.getUniformLocation(
                    program,
                    `u_impactPulse${i}`
                )
        });
    }


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


        /* ---------------------------------------------
           USER RIPPLE UNIFORMS
        --------------------------------------------- */

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


        /* ---------------------------------------------
           IMPACT RIPPLE UNIFORMS
        --------------------------------------------- */

        const impactElements =
            impactLayer
                ? impactLayer.querySelectorAll(
                    ".impact-ripple"
                )
                : [];


        for (
            let i = 0;
            i < 6;
            i++
        ) {

            const element =
                impactElements[i];


            if (!element) {

                gl.uniform2f(
                    impactLocations[i].point,
                    -10,
                    -10
                );

                gl.uniform1f(
                    impactLocations[i].size,
                    0.0
                );

                gl.uniform1f(
                    impactLocations[i].pulse,
                    0.0
                );

                continue;
            }


            const rect =
                element.getBoundingClientRect();


            const windowRect =
                waterWindow.getBoundingClientRect();


            const centerX =
                (
                    rect.left +
                    rect.width * 0.5 -
                    windowRect.left
                ) /
                windowRect.width;


            const centerY =
                (
                    rect.top +
                    rect.height * 0.5 -
                    windowRect.top
                ) /
                windowRect.height;


            /*
             * Size is based on the visual size of
             * the Impact Ripple.
             */

            const visualSize =
                Math.max(
                    rect.width,
                    rect.height
                ) /
                windowRect.height;


            /*
             * Larger / nearer objects disturb
             * more water.
             */

            const rippleSize =
                Math.max(
                    0.11,
                    visualSize * 1.75
                );


            gl.uniform2f(
                impactLocations[i].point,
                centerX,
                1.0 - centerY
            );


            gl.uniform1f(
                impactLocations[i].size,
                rippleSize
            );


            /*
             * Each Impact Ripple gets a slightly
             * different phase.
             */

            const phase =
                (
                    elapsed * 1.0 +
                    i * 1.73
                );


            gl.uniform1f(
                impactLocations[i].pulse,
                phase
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
       FUTURE IMPACT RIPPLE DATA
    ===================================================== */

    const impactRippleData = [

        {
            x: 0.17,
            y: 0.37,
            depth: "far",
            floatTime: "13s",
            rotation: -8
        },

        {
            x: 0.36,
            y: 0.53,
            depth: "mid",
            floatTime: "16s",
            rotation: 6
        },

        {
            x: 0.62,
            y: 0.39,
            depth: "near",
            floatTime: "14s",
            rotation: -5
        },

        {
            x: 0.80,
            y: 0.58,
            depth: "far",
            floatTime: "18s",
            rotation: 11
        },

        {
            x: 0.25,
            y: 0.72,
            depth: "mid",
            floatTime: "15s",
            rotation: -12
        },

        {
            x: 0.71,
            y: 0.78,
            depth: "near",
            floatTime: "17s",
            rotation: 7
        }
    ];


    /* =====================================================
       CREATE IMPACT RIPPLES
       
       The objects themselves remain unchanged.
       Their water disturbance is generated by WebGL.
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

            if (document.hidden) {

                /*
                 * Browser handles animation throttling.
                 */
            }
        }
    );


    /* =====================================================
       INITIALIZATION
    ===================================================== */

    console.log(
        "The Ripple Well v2.2 initialized."
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
        "Living Impact Ripples: active"
    );

})();
