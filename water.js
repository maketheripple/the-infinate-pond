/* =========================================================
   THE RIPPLE WELL
   VERSION 3.0

   THREE-LAYER WATER EXPERIENCE

   1. SURFACE
      Natural moonlit water movement.

   2. REFLECTION
      Header reflection reacts to water interaction.

   3. DEPTH
      Approved Impact Ripples live beneath the surface.

   CLICK RIPPLE SCALE
   - Click ripple visual footprint = 25% of previous size.
   - WebGL ripple travel distance = 25%.
   - Ripple highlight intensity reduced proportionally.
   - Reflection disturbance remains centered on click.
   - Impact Ripple sizes are controlled separately.

   SUBMISSIONS
   - "Make a Ripple" opens the submission window.
   - Submissions are sent to Supabase.
   - New submissions receive status = "pending".
   - Water clicks do NOT open the submission window.

   IMPACT RIPPLES
   - Only approved submissions appear.
   - Size is read from the Supabase "size" column.
   - Small = 70%
   - Medium = 100%
   - Large = 135%
   - Extra Large = 175%

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

        dpr =
            Math.min(
                window.devicePixelRatio || 1,
                2
            );

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


        /* =================================================
           CLICK RIPPLE

           25% OF ORIGINAL SIZE
        ================================================= */

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
                0.08;


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
                    140.0
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


        void main() {

            vec2 uv =
                gl_FragCoord.xy /
                u_resolution.xy;


            vec2 aspectUV =
                uv;

            aspectUV.x *=
                u_resolution.x /
                u_resolution.y;


            /* ---------------------------------------------
               ORGANIC WATER
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
                0.04;


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


            color +=
                moonReflection *
                vec3(
                    0.48,
                    0.78,
                    0.88
                );


            color +=
                abs(
                    rippleValue
                )
                *
                vec3(
                    0.04,
                    0.095,
                    0.115
                );


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


        reflectionDistortion.style
            .setProperty(
                "--ripple-scale",
                "0.25"
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


        ripple.style.setProperty(
            "--click-ripple-scale",
            "0.25"
        );


        ripple.style.setProperty(
            "--click-ripple-size",
            "25%"
        );


        ripple.style.setProperty(
            "--ripple-size-multiplier",
            "0.25"
        );


        ripple.style.setProperty(
            "--ripple-visual-scale",
            "0.25"
        );


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

        stars.innerHTML = "";


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
       SUPABASE CONFIGURATION
    ===================================================== */

    const SUPABASE_URL =
        "https://vazgkkrrjgoowwywamot.supabase.co";


    const SUPABASE_KEY =
        "sb_publishable_gf0gD7JmbBlm6jR07qYkIQ_YZN301F-";


    /* =====================================================
       VISITOR LOCATION
    ===================================================== */

    function getVisitorLocation() {

        let region = "";

        let country = "";


        try {

            const language =
                navigator.language ||
                "";


            const parts =
                language.split("-");


            if (parts.length >= 2) {

                const countryCode =
                    parts[
                        parts.length - 1
                    ].toUpperCase();


                const countryNames = {

                    CA: "Canada",

                    US: "United States",

                    GB: "United Kingdom",

                    AU: "Australia",

                    NZ: "New Zealand",

                    IE: "Ireland",

                    FR: "France",

                    DE: "Germany",

                    ES: "Spain",

                    IT: "Italy",

                    NL: "Netherlands",

                    BE: "Belgium",

                    SE: "Sweden",

                    NO: "Norway",

                    DK: "Denmark",

                    FI: "Finland",

                    IN: "India",

                    JP: "Japan",

                    CN: "China",

                    KR: "South Korea"
                };


                country =
                    countryNames[
                        countryCode
                    ] ||
                    countryCode;
            }

        } catch (error) {

            console.warn(
                "Could not determine visitor locale.",
                error
            );
        }


        return {

            region,

            country
        };
    }


    /* =====================================================
       SUBMIT RIPPLE TO SUPABASE
    ===================================================== */

    async function submitRippleToSupabase(
        message,
        name
    ) {

        const location =
            getVisitorLocation();


        const submission = {

            message:
                message.trim(),

            name:
                name
                    ? name.trim()
                    : "",

            region:
                location.region,

            country:
                location.country,

            status:
                "pending"
        };


        const response =
            await fetch(
                `${SUPABASE_URL}/rest/v1/ripple_submissions`,
                {

                    method: "POST",

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


        if (!response.ok) {

            let errorDetails =
                "Unknown Supabase error.";


            try {

                errorDetails =
                    await response.text();

            } catch (error) {

                console.warn(
                    "Could not read Supabase error.",
                    error
                );
            }


            console.error(
                "Ripple submission failed:",
                response.status,
                errorDetails
            );


            throw new Error(
                `Supabase submission failed (${response.status}).`
            );
        }


        return true;
    }


    /* =====================================================
       SUBMISSION FORM
    ===================================================== */

    if (rippleForm) {

        rippleForm.addEventListener(
            "submit",
            async event => {

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


                const submitButton =
                    rippleForm.querySelector(
                        'button[type="submit"]'
                    );


                const originalButtonText =
                    submitButton
                        ? submitButton.textContent
                        : "";


                if (submitButton) {

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
                            : ""
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


                } catch (error) {

                    console.error(
                        "The Ripple Well submission error:",
                        error
                    );


                    alert(
                        "We couldn't submit your ripple right now. Please try again in a moment."
                    );


                } finally {

                    if (submitButton) {

                        submitButton.disabled =
                            false;

                        submitButton.textContent =
                            originalButtonText;
                    }
                }
            }
        );
    }


    /* =====================================================
       IMPACT RIPPLE SIZE
    ===================================================== */

    function getImpactRippleScale(
        size
    ) {

        switch (
            String(size || "")
                .toLowerCase()
                .trim()
        ) {

            case "small":

                return 0.70;


            case "large":

                return 1.35;


            case "extra-large":

                return 1.75;


            case "medium":

            default:

                return 1.00;
        }
    }


    /* =====================================================
       STABLE NUMBER FROM STRING
       
       This gives every approved submission a repeatable
       number based on its database ID.
    ===================================================== */

    function stringHash(
        value
    ) {

        let hash = 0;


        const text =
            String(value || "");


        for (
            let i = 0;
            i < text.length;
            i++
        ) {

            hash =
                (
                    (
                        hash << 5
                    ) -
                    hash
                ) +
                text.charCodeAt(i);


            hash |= 0;
        }


        return Math.abs(hash);
    }


    /* =====================================================
       STABLE POSITION

       The same submission ID always produces the same
       position.
    ===================================================== */

    function getStablePosition(
        id,
        index
    ) {

        const hash =
            stringHash(
                `${id}-${index}`
            );


        const hash2 =
            stringHash(
                `${id}-position`
            );


        /*
         * Keep ripples away from the very top and bottom
         * edges of the water.
         */

        const x =
            0.10 +
            (
                (hash % 800) /
                1000
            );


        const y =
            0.28 +
            (
                (hash2 % 520) /
                1000
            );


        return {

            x:
                Math.min(
                    0.90,
                    x
                ),

            y:
                Math.min(
                    0.80,
                    y
                )
        };
    }


    /* =====================================================
       IMPACT RIPPLE STYLE
    ===================================================== */

    const impactRippleStyle =
        document.createElement("style");


    impactRippleStyle.textContent = `

        .impact-ripple {

            background: transparent !important;

            border: none !important;

            box-shadow: none !important;

            overflow: visible;

            opacity: 1;

            filter: none;

            animation:
                organicFloat
                var(--float-time)
                ease-in-out
                infinite
                alternate;

            cursor: pointer;
        }


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


        /* ---------------------------------------------
           ACCESSIBLE FOCUS
        --------------------------------------------- */

        .impact-ripple:focus {

            outline:
                1px solid
                rgba(
                    165,
                    230,
                    242,
                    0.55
                );

            outline-offset: 4px;
        }

    `;


    document.head.appendChild(
        impactRippleStyle
    );


    /* =====================================================
       CREATE IMPACT RIPPLE
    ===================================================== */

    function createImpactRipple(
        submission,
        index
    ) {

        const ripple =
            document.createElement("div");


        ripple.className =
            "impact-ripple";


        ripple.dataset.id =
            submission.id;


        ripple.dataset.index =
            index;


        /*
         * Stable location.
         */

        const position =
            getStablePosition(
                submission.id,
                index
            );


        ripple.style.left =
            `${position.x * 100}%`;


        ripple.style.top =
            `${position.y * 100}%`;


        /*
         * Size selected in admin.
         */

        const rippleScale =
            getImpactRippleScale(
                submission.size
            );


        /*
         * Slightly different floating behavior
         * for each ripple.
         */

        const hash =
            stringHash(
                submission.id
            );


        const rotation =
            (
                (hash % 240) -
                120
            ) /
            10;


        const floatSeconds =
            13 +
            (
                hash %
                7
            );


        const rippleSeconds =
            6.3 +
            (
                (hash % 22) /
                10
            );


        /*
         * Larger ripples receive a slightly stronger
         * visual presence.
         */

        const rippleOpacity =
            rippleScale >= 1.7
                ? 0.48
                : rippleScale >= 1.3
                    ? 0.40
                    : rippleScale >= 1.0
                        ? 0.34
                        : 0.27;


        ripple.style.setProperty(
            "--rotation",
            `${rotation}deg`
        );


        ripple.style.setProperty(
            "--secondary-rotation",
            `${-rotation * 0.55}deg`
        );


        ripple.style.setProperty(
            "--float-time",
            `${floatSeconds}s`
        );


        ripple.style.setProperty(
            "--ripple-scale",
            rippleScale
        );


        ripple.style.setProperty(
            "--ripple-time",
            `${rippleSeconds}s`
        );


        ripple.style.setProperty(
            "--ripple-opacity",
            rippleOpacity
        );


        ripple.style.setProperty(
            "--ripple-rotation",
            `${rotation * 0.35}deg`
        );


        ripple.style.setProperty(
            "--ripple-secondary-rotation",
            `${-rotation * 0.25}deg`
        );


        /*
         * CSS custom property used by existing site CSS
         * for the overall Impact Ripple footprint.
         */

        ripple.style.setProperty(
            "--scale",
            rippleScale
        );


        ripple.style.setProperty(
            "--impact-ripple-scale",
            rippleScale
        );


        /*
         * Make the element itself scale according to
         * the selected Impact Ripple size.
         *
         * The existing animation handles movement.
         */

        ripple.style.transform =
            `translate(-50%, -50%) scale(${rippleScale})`;


        /*
         * Keyboard accessibility.
         */

        ripple.tabIndex =
            0;


        ripple.setAttribute(
            "role",
            "button"
        );


        ripple.setAttribute(
            "aria-label",
            "Open Impact Ripple"
        );


        /*
         * Open the approved submission.
         */

        ripple.addEventListener(
            "click",
            event => {

                event.stopPropagation();


                openImpactRipple(
                    submission
                );
            }
        );


        ripple.addEventListener(
            "keydown",
            event => {

                if (
                    event.key === "Enter" ||
                    event.key === " "
                ) {

                    event.preventDefault();

                    event.stopPropagation();


                    openImpactRipple(
                        submission
                    );
                }
            }
        );


        impactLayer.appendChild(
            ripple
        );
    }


    /* =====================================================
       LOAD APPROVED IMPACT RIPPLES
    ===================================================== */

    async function loadApprovedImpactRipples() {

        if (!impactLayer) {

            console.warn(
                "The Ripple Well: Impact Ripple layer was not found."
            );

            return;
        }


        try {

            const response =
                await fetch(
                    `${SUPABASE_URL}/rest/v1/ripple_submissions?select=id,created_at,message,name,region,country,status,size&status=eq.approved&order=created_at.asc`,
                    {

                        method: "GET",

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


            if (!response.ok) {

                const errorText =
                    await response.text();


                console.error(
                    "Could not load approved Impact Ripples:",
                    response.status,
                    errorText
                );


                return;
            }


            const submissions =
                await response.json();


            /*
             * Remove any old/static Impact Ripples.
             */

            impactLayer.innerHTML =
                "";


            if (
                !Array.isArray(
                    submissions
                ) ||
                submissions.length === 0
            ) {

                console.log(
                    "The Ripple Well: No approved Impact Ripples found."
                );

                return;
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


            console.log(
                `The Ripple Well: ${submissions.length} approved Impact Ripple(s) loaded.`
            );


        } catch (error) {

            console.error(
                "The Ripple Well: Failed to load approved Impact Ripples.",
                error
            );
        }
    }


    /* =====================================================
       IMPACT RIPPLE OPEN
    ===================================================== */

    function openImpactRipple(
        submission
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


        const message =
            submission.message ||
            "A ripple left behind by someone who wanted to make a difference.";


        quote.textContent =
            `“${message}”`;


        let detailsText =
            "A message left in The Ripple Well to remind someone that they are not alone.";


        if (
            submission.name &&
            submission.name.trim()
        ) {

            detailsText =
                `A message left by ${submission.name.trim()} in The Ripple Well.`;
        }


        details.textContent =
            detailsText;


        openModal(
            impactModal
        );
    }


    /* =====================================================
       LOAD APPROVED RIPPLES
    ===================================================== */

    loadApprovedImpactRipples();


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
        "The Ripple Well v3.0 initialized."
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
        "Click Ripple Scale: 25%"
    );


    console.log(
        "Supabase Submission: active"
    );


    console.log(
        "Approved Impact Ripple Loading: active"
    );


    console.log(
        "Impact Ripple Size System: active"
    );


})();
