/* =========================================================
   THE RIPPLE WELL
   VERSION 2.8 — SCROLL DEPTH

   THREE-LAYER WATER EXPERIENCE

   1. SURFACE
      Natural moonlit water movement.

   2. REFLECTION
      Header reflection reacts to water interaction.

   3. DEPTH
      Approved Impact Ripples loaded from Supabase.

   IMPACT RIPPLE DESIGN
   - Four approved database sizes:
       Small
       Medium
       Large
       Extra-Large
   - Natural irregular placement.
   - Deterministic positioning prevents ripples from
     jumping around between page loads.
   - Individual rotation, float, ring timing and opacity.
   - Organic elliptical ripple forms.
   - Recent approved ripples appear as subtle
     lower-banner glimpses.

   CLICK RIPPLE SCALE
   - Click ripple visual footprint = 25% of previous size.
   - WebGL ripple travel distance = 25%.
   - Ripple highlight intensity reduced proportionally.
   - Reflection disturbance remains centered on click.
   - Impact Ripples are unchanged.

   SUBMISSIONS
   - "Make a Ripple" opens the submission window.
   - Submissions are sent to Supabase.
   - New submissions receive status = "pending".
   - Water clicks do NOT open the submission window.
   - Province/State from the submission form is saved
     to the Supabase "region" column.

   IMPACT RIPPLE REVIEW
   - Approved submissions are loaded from Supabase.
   - Only approved submissions become Impact Ripples.
   - Database column used for size = "size".
   - Demonstration Impact Ripples have been removed.
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

    const recentImpactLayer =
        document.getElementById("recent-impact-ripples");

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
        uniform float u_scrollDepth;

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


            /*
             * The original travel distance was reduced
             * to 25%.
             */

            float radius =
                age *
                0.02;


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


            /*
             * Keep the water itself visually consistent across the
             * viewport. The reference design should feel like one
             * continuous body of water, not a dark-to-light gradient
             * baked into the screen. Depth is introduced by scrolling
             * the Well, below.
             */

            vec3 color =
                mix(
                    deepWater,
                    surfaceWater,
                    0.62
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


            /*
             * Ripple highlight intensity is reduced
             * proportionally with the smaller travel.
             */

            color +=
                abs(
                    rippleValue
                )
                *
                vec3(
                    0.01,
                    0.024,
                    0.029
                );


            float depth =
                smoothstep(
                    0.0,
                    1.0,
                    uv.y
                );


            /*
             * SCROLL DEPTH
             *
             * The Well itself stays visually simple while the
             * visitor descends. Instead of adding a black overlay,
             * the water's existing blue palette is progressively
             * reduced in brightness. This keeps the water looking
             * like the same body of water becoming deeper.
             */

            /*
             * SCROLL DEPTH
             *
             * This is intentionally a simple, uniform deepening of
             * the entire water view. At the surface the water keeps
             * its normal moonlit blue. As the visitor scrolls deeper,
             * the same water gradually becomes a richer navy and then
             * a very deep blue. We do NOT turn it black and we do NOT
             * move the darkness vertically through the viewport.
             */

            float scrollCurve =
                smoothstep(
                    0.0,
                    1.0,
                    u_scrollDepth
                );

            scrollCurve =
                pow(
                    scrollCurve,
                    1.05
                );

            /*
             * Reduce brightness gradually while preserving blue.
             * 1.00 = surface
             * 0.72 = shallow depth
             * 0.48 = deep water
             */
            float depthBrightness =
                mix(
                    1.0,
                    0.48,
                    scrollCurve
                );

            color *=
                depthBrightness;

            /*
             * Gently shift toward deeper blue as the visitor descends.
             * This keeps the water recognizable even at maximum depth.
             */
            color =
                mix(
                    color,
                    color * vec3(0.78, 0.88, 1.02),
                    scrollCurve * 0.55
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


    const uScrollDepth =
        gl.getUniformLocation(
            program,
            "u_scrollDepth"
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


        reflectionDistortion.style
            .setProperty(
                "--ripple-x",
                `${x * 100}%`
            );


        reflectionDistortion.style
            .setProperty(
                "--ripple-y",
                `${y * 100}%`
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
       SCROLL DEPTH
    ===================================================== */

    let scrollDepth = 0;


    function updateScrollDepth() {

        const well =
            document.getElementById("ripple-well");

        if (!well) {
            scrollDepth = 0;
            return;
        }

        const rect =
            well.getBoundingClientRect();

        const scrollableDistance =
            Math.max(1, well.offsetHeight - window.innerHeight);

        scrollDepth =
            Math.min(
                1,
                Math.max(
                    0,
                    (-rect.top) / scrollableDistance
                )
            );
    }


    window.addEventListener(
        "scroll",
        updateScrollDepth,
        { passive: true }
    );


    window.addEventListener(
        "resize",
        updateScrollDepth,
        { passive: true }
    );


    updateScrollDepth();


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


        gl.uniform1f(
            uScrollDepth,
            scrollDepth
        );


        for (
            let i = 0;
            i < MAX_RIPPLES;
            i++
        ) {

            const currentRipple =
                ripples[i];


            gl.uniform2f(
                rippleLocations[i].point,
                currentRipple.x,
                1.0 - currentRipple.y
            );


            gl.uniform1f(
                rippleLocations[i].time,
                currentRipple.time
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
       VISITOR COUNTRY
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
        name,
        region
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
                region
                    ? region.trim()
                    : "",

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


                if (
                    !message ||
                    !message.value.trim()
                ) {

                    return;
                }


    /* =====================================================
       SUBMIT BUTTON STATE
    ===================================================== */

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
                            : "",
                        region
                            ? region.value
                            : ""
                    );


                    message.value = "";


                    if (name) {

                        name.value = "";
                    }


                    if (region) {

                        region.value = "";
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
       SIZE SETTINGS
    ===================================================== */

    function getSizeSettings(size) {

        const normalized =
            String(
                size || "medium"
            )
            .trim()
            .toLowerCase();


    switch (normalized) {

        case "small":

            return {
                scale: 1,
                className: "impact-size-small",
                opacity: 0.28,
                ringScale: 0.78
            };


        case "medium":

            return {
                scale: 1,
                className: "impact-size-medium",
                opacity: 0.34,
                ringScale: 1.00
            };


        case "large":

            return {
                scale: 1,
                className: "impact-size-large",
                opacity: 0.39,
                ringScale: 1.16
            };


        case "extra-large":
        case "extra large":
        case "x-large":
        case "xlarge":

            return {
                scale: 1,
                className: "impact-size-extra-large",
                opacity: 0.44,
                ringScale: 1.32
            };


        default:

            return {
                scale: 1,
                className: "impact-size-medium",
                opacity: 0.34,
                ringScale: 1.00
            };
    }
}


/* =====================================================
   DETERMINISTIC RANDOM HELPERS
===================================================== */

function seededNumber(seed) {

    let value = 0;

    const text =
        String(seed);

    for (
        let i = 0;
        i < text.length;
        i++
    ) {

        value =
            (
                (
                    value * 31
                ) +
                text.charCodeAt(i)
            ) %
            2147483647;
    }

    value =
        (
            value * 16807
        ) %
        2147483647;

    return (
        value - 1
    ) /
    2147483646;
}


function seededRange(
    seed,
    minimum,
    maximum
) {

    return (
        minimum +
        (
            seededNumber(seed) *
            (
                maximum -
                minimum
            )
        )
    );
}


/* =====================================================
   NATURAL IMPACT RIPPLE POSITIONS
===================================================== */

function createNaturalPositions(
    count
) {

    const positions = [];


    /*
     * Keep the central upper portion relatively open
     * because this is where the reflection and moonlight
     * are most important.
     *
     * Also avoid placing ripples too close to the very
     * bottom where the interaction message lives.
     */

    const safeZones = [

        {
            minX: 0.08,
            maxX: 0.31,
            minY: 0.24,
            maxY: 0.63
        },

        {
            minX: 0.33,
            maxX: 0.66,
            minY: 0.36,
            maxY: 0.82
        },

        {
            minX: 0.69,
            maxX: 0.92,
            minY: 0.22,
            maxY: 0.67
        },

        {
            minX: 0.12,
            maxX: 0.86,
            minY: 0.68,
            maxY: 0.86
        }
    ];


    for (
        let i = 0;
        i < count;
        i++
    ) {

        let accepted = null;


        /*
         * Try several candidates so the placement
         * remains irregular while avoiding obvious
         * stacking.
         */

        for (
            let attempt = 0;
            attempt < 24;
            attempt++
        ) {

            const zone =
                safeZones[
                    Math.floor(
                        seededNumber(
                            `${i}-zone-${attempt}`
                        ) *
                        safeZones.length
                    )
                ];


            const x =
                seededRange(
                    `${i}-x-${attempt}`,
                    zone.minX,
                    zone.maxX
                );


            const y =
                seededRange(
                    `${i}-y-${attempt}`,
                    zone.minY,
                    zone.maxY
                );


            const candidate = {
                x,
                y
            };


            let tooClose = false;


            for (
                const existing
                of positions
            ) {

                const dx =
                    candidate.x -
                    existing.x;


                const dy =
                    (
                        candidate.y -
                        existing.y
                    ) *
                    0.72;


                const distance =
                    Math.sqrt(
                        dx * dx +
                        dy * dy
                    );


                if (
                    distance <
                    0.14
                ) {

                    tooClose = true;

                    break;
                }
            }


            if (!tooClose) {

                accepted =
                    candidate;

                break;
            }
        }


        /*
         * If the pond becomes crowded, accept a
         * candidate anyway rather than hiding the
         * approved submission.
         */

        if (!accepted) {

            accepted = {

                x:
                    seededRange(
                        `${i}-fallback-x`,
                        0.10,
                        0.90
                    ),

                y:
                    seededRange(
                        `${i}-fallback-y`,
                        0.28,
                        0.84
                    )
            };
        }


        positions.push(
            accepted
        );
    }


    return positions;
}


/* =====================================================
   CREATE INDIVIDUAL IMPACT RIPPLE
===================================================== */

function createImpactRippleElement(
    data,
    index,
    isSubmission
) {

    if (!impactLayer)
        return;


    const ripple =
        document.createElement("div");


    const sizeSettings =
        getSizeSettings(
            data.size
        );


    ripple.className =
        `impact-ripple depth-${data.depth || "mid"} ${sizeSettings.className}`;


    ripple.dataset.index =
        index;


    if (isSubmission) {

        ripple.dataset.submission =
            "true";
    }


    ripple.style.left =
        `${data.x * 100}%`;


    ripple.style.top =
        `${data.y * 100}%`;


    ripple.style.setProperty(
        "--rotation",
        `${data.rotation || 0}deg`
    );


    ripple.style.setProperty(
        "--secondary-rotation",
        `${-(data.rotation || 0) * 0.55}deg`
    );


    ripple.style.setProperty(
        "--float-time",
        data.floatTime || "15s"
    );


    ripple.style.setProperty(
        "--ripple-scale",
        (
            data.rippleScale ||
            sizeSettings.ringScale
        )
    );


    ripple.style.setProperty(
        "--ripple-time",
        data.rippleTime || "7s"
    );


    ripple.style.setProperty(
        "--ripple-opacity",
        data.rippleOpacity ||
        sizeSettings.opacity
    );


    ripple.style.setProperty(
        "--ripple-rotation",
        `${data.rippleRotation || 0}deg`
    );


    ripple.style.setProperty(
        "--ripple-secondary-rotation",
        `${data.secondaryRippleRotation || 0}deg`
    );


    ripple.style.setProperty(
        "--scale",
        "1"
    );


    /*
     * A tiny individual distortion scale makes the
     * rings less uniform without changing the
     * approved database size itself.
     */

    ripple.style.setProperty(
        "--organic-ring-scale-x",
        data.ringScaleX || 1
    );


    ripple.style.setProperty(
        "--organic-ring-scale-y",
        data.ringScaleY || 1
    );


    ripple.addEventListener(
        "click",
        event => {

            event.stopPropagation();


            openImpactRipple(
                data
            );
        }
    );


    impactLayer.appendChild(
        ripple
    );
}


/* =====================================================
   RECENT BANNER RIPPLE
===================================================== */

function createRecentBannerRipple(
    data,
    index
) {

    if (!recentImpactLayer)
        return;


    const ripple =
        document.createElement("div");


    ripple.className =
        "recent-impact-ripple";


    const sizeSettings =
        getSizeSettings(
            data.size
        );


    const sizeMap = {

        "impact-size-small": {
            width: 27,
            height: 12
        },

        "impact-size-medium": {
            width: 38,
            height: 16
        },

        "impact-size-large": {
            width: 52,
            height: 21
        },

        "impact-size-extra-large": {
            width: 66,
            height: 26
        }
    };


    const dimensions =
        sizeMap[
            sizeSettings.className
        ] ||
        sizeMap[
            "impact-size-medium"
        ];


    const left =
        seededRange(
            `${data.id}-recent-left`,
            3,
            97
        );


    const opacity =
        seededRange(
            `${data.id}-recent-opacity`,
            0.22,
            0.48
        );


    const rotation =
        seededRange(
            `${data.id}-recent-rotation`,
            -14,
            14
        );


    ripple.style.left =
        `${left}%`;


    ripple.style.setProperty(
        "--recent-width",
        `${dimensions.width}px`
    );


    ripple.style.setProperty(
        "--recent-height",
        `${dimensions.height}px`
    );


    ripple.style.setProperty(
        "--recent-opacity",
        opacity
    );


    ripple.style.setProperty(
        "--recent-rotation",
        `${rotation}deg`
    );


    ripple.style.setProperty(
        "--recent-inner-rotation",
        `${rotation * -0.55}deg`
    );


    ripple.style.setProperty(
        "--recent-duration",
        `${8 + (index % 5)}s`
    );


    recentImpactLayer.appendChild(
        ripple
    );
}


/* =====================================================
   SUPABASE APPROVED IMPACT RIPPLES
===================================================== */

async function loadApprovedImpactRipples() {

    if (!impactLayer)
        return;


    try {

        impactLayer.innerHTML = "";


        if (recentImpactLayer) {

            recentImpactLayer.innerHTML =
                "";
        }


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
                "The Ripple Well: could not load approved Impact Ripples.",
                response.status,
                errorText
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

            console.warn(
                "The Ripple Well: approved Impact Ripple response was not an array."
            );

            return;
        }


        console.log(
            `The Ripple Well: ${submissions.length} approved Impact Ripple(s) found.`
        );


        /*
         * Natural positions are generated once from
         * the number of approved submissions.
         */

        const positions =
            createNaturalPositions(
                submissions.length
            );


        submissions.forEach(
            (
                submission,
                index
            ) => {

                const position =
                    positions[index];


                const rotation =
                    seededRange(
                        `${submission.id}-rotation`,
                        -18,
                        18
                    );


                const depthValue =
                    seededNumber(
                        `${submission.id}-depth`
                    );


                let depth;


                if (
                    depthValue <
                    0.33
                ) {

                    depth = "far";

                } else if (
                    depthValue <
                    0.68
                ) {

                    depth = "mid";

                } else {

                    depth = "near";
                }


                const rippleData = {

                    id:
                        submission.id,

                    x:
                        position.x,

                    y:
                        position.y,

                    depth,

                    floatTime:
                        `${13 + seededRange(
                            `${submission.id}-float`,
                            0,
                            6
                        ).toFixed(1)}s`,

                    rotation,

                    size:
                        submission.size ||
                        "medium",

                    sizeBase:
                        1,

                    rippleScale:
                        seededRange(
                            `${submission.id}-ring-scale`,
                            0.88,
                            1.18
                        ),

                    rippleTime:
                        `${(
                            6.2 +
                            seededRange(
                                `${submission.id}-ripple-time`,
                                0,
                                2.4
                            )
                        ).toFixed(1)}s`,

                    rippleOpacity:
                        getSizeSettings(
                            submission.size
                        ).opacity *
                        seededRange(
                            `${submission.id}-opacity`,
                            0.82,
                            1.08
                        ),

                    rippleRotation:
                        rotation *
                        seededRange(
                            `${submission.id}-ring-rotation`,
                            0.45,
                            0.95
                        ),

                    secondaryRippleRotation:
                        rotation *
                        seededRange(
                            `${submission.id}-secondary-rotation`,
                            -0.65,
                            -0.25
                        ),

                    ringScaleX:
                        seededRange(
                            `${submission.id}-ring-x`,
                            0.92,
                            1.08
                        ),

                    ringScaleY:
                        seededRange(
                            `${submission.id}-ring-y`,
                            0.88,
                            1.06
                        ),

                    message:
                        submission.message ||
                        "",

                    details:
                        submission.name
                            ? `Left by ${submission.name}.`
                            : "A message left in The Ripple Well.",

                    submission:
                        true
                };


                createImpactRippleElement(
                    rippleData,
                    `submission-${submission.id}`,
                    true
                );


                /*
                 * Only a small number of recent ripples
                 * are shown in the banner.
                 *
                 * The most recent approved ripples are
                 * intentionally sampled rather than
                 * displaying the entire database.
                 */

                if (
                    index >=
                    Math.max(
                        0,
                        submissions.length - 7
                    )
                ) {

                    createRecentBannerRipple(
                        rippleData,
                        index
                    );
                }


                console.log(
                    "Approved Impact Ripple loaded:",
                    submission.message,
                    "Size:",
                    submission.size,
                    "Position:",
                    position
                );
            }
        );


    } catch (error) {

        console.error(
            "The Ripple Well: error loading approved Impact Ripples.",
            error
        );
    }
}


/* =====================================================
   IMPACT RIPPLE OPEN
===================================================== */

function openImpactRipple(
    rippleData
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


    quote.textContent =
        `“${rippleData.message || ""}”`;


    details.textContent =
        rippleData.details ||
        "A message left in The Ripple Well.";


    openModal(
        impactModal
    );
}


/* =====================================================
   LOAD APPROVED REAL RIPPLES
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
    "The Ripple Well v2.8 initialized."
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
    "Organic Impact Ripple Placement: active"
);


console.log(
    "Four Impact Ripple Sizes: active"
);


console.log(
    "Recent Banner Ripples: active"
);


console.log(
    "Click Ripple Scale: 25%"
);


console.log(
    "Supabase Submission: active"
);


console.log(
    "Province/State → region: active"
);


console.log(
    "Approved Impact Ripples Only: active"
);


})();
