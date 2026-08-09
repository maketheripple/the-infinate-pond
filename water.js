/* =========================================================
   THE INFINITE POND
   VERSION 8.0 — RIPPLE INTERFERENCE
========================================================= */

const canvas = document.getElementById("waterCanvas");

if (!canvas) {

    console.error(
        "The Infinite Pond: waterCanvas not found."
    );

} else {

    const gl = canvas.getContext("webgl", {
        alpha: false,
        antialias: false,
        powerPreference: "high-performance"
    });

    if (!gl) {

        console.error(
            "The Infinite Pond: WebGL unavailable."
        );

    } else {

        /* =====================================================
           SETTINGS
        ===================================================== */

        const MAX_RIPPLES = 12;


        /* =====================================================
           VERTEX SHADER
        ===================================================== */

        const vertexShaderSource = `

            attribute vec2 position;

            void main() {

                gl_Position =
                    vec4(
                        position,
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


            /* =================================================
               CONSTANTS
            ================================================= */

            const int MAX_RIPPLES = 12;


            /* =================================================
               UNIFORMS
            ================================================= */

            uniform vec2 resolution;

            uniform float time;

            uniform float scroll;

            uniform vec2 ripplePositions[MAX_RIPPLES];

            uniform float rippleStarts[MAX_RIPPLES];

            uniform float rippleStrengths[MAX_RIPPLES];


            /* =================================================
               HASH
            ================================================= */

            float hash(vec2 p) {

                return fract(

                    sin(
                        dot(
                            p,
                            vec2(
                                127.1,
                                311.7
                            )
                        )
                    )
                    *
                    43758.5453123

                );

            }


            /* =================================================
               SMOOTH NOISE
            ================================================= */

            float noise(vec2 p) {

                vec2 i =
                    floor(p);

                vec2 f =
                    fract(p);


                f =
                    f * f *
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


                return mix(

                    mix(
                        a,
                        b,
                        f.x
                    ),

                    mix(
                        c,
                        d,
                        f.x
                    ),

                    f.y

                );

            }


            /* =================================================
               FRACTAL BROWNIAN MOTION
            ================================================= */

            float fbm(vec2 p) {

                float value =
                    0.0;

                float amplitude =
                    0.5;


                for (
                    int i = 0;
                    i < 5;
                    i++
                ) {

                    value +=

                        noise(p)
                        *
                        amplitude;


                    p *=
                        2.0;


                    amplitude *=
                        0.5;

                }


                return value;

            }


            /* =================================================
               LARGE WATER MOTION
            ================================================= */

            float largeWave(vec2 p) {

                float waveA =

                    sin(

                        dot(
                            p,
                            normalize(
                                vec2(
                                    1.0,
                                    0.22
                                )
                            )
                        )
                        *
                        1.35
                        +
                        time *
                        0.34

                    );


                float waveB =

                    sin(

                        dot(
                            p,
                            normalize(
                                vec2(
                                    -0.45,
                                    1.0
                                )
                            )
                        )
                        *
                        1.05
                        -
                        time *
                        0.27

                    );


                float waveC =

                    sin(

                        dot(
                            p,
                            normalize(
                                vec2(
                                    0.58,
                                    0.81
                                )
                            )
                        )
                        *
                        1.85
                        +
                        time *
                        0.41

                    );


                return

                    waveA *
                    0.34

                    +

                    waveB *
                    0.28

                    +

                    waveC *
                    0.16;

            }


            /* =================================================
               SMALL SURFACE WAVES
            ================================================= */

            float smallWaves(vec2 p) {

                float waveA =

                    sin(

                        dot(
                            p,
                            normalize(
                                vec2(
                                    0.24,
                                    1.0
                                )
                            )
                        )
                        *
                        4.5
                        +
                        time *
                        0.62

                    );


                float waveB =

                    sin(

                        dot(
                            p,
                            normalize(
                                vec2(
                                    -0.76,
                                    0.48
                                )
                            )
                        )
                        *
                        5.8
                        -
                        time *
                        0.51

                    );


                float waveC =

                    sin(

                        dot(
                            p,
                            normalize(
                                vec2(
                                    0.91,
                                    0.28
                                )
                            )
                        )
                        *
                        7.2
                        +
                        time *
                        0.73

                    );


                return

                    waveA *
                    0.08

                    +

                    waveB *
                    0.06

                    +

                    waveC *
                    0.045;

            }


            /* =================================================
               ORGANIC MOTION
            ================================================= */

            float organicMotion(vec2 p) {

                vec2 drift =

                    vec2(

                        time *
                        0.018,

                        -time *
                        0.013

                    );


                float n1 =

                    fbm(

                        p *
                        0.75
                        +
                        drift

                    );


                float n2 =

                    fbm(

                        p *
                        1.65
                        -
                        drift *
                        1.4

                    );


                return

                    (
                        n1 -
                        0.5
                    )
                    *
                    0.22

                    +

                    (
                        n2 -
                        0.5
                    )
                    *
                    0.10;

            }


            /* =================================================
               RIPPLE PHASE
            ================================================= */

            float ripplePhase(

                vec2 p,

                vec2 ripplePosition,

                float start

            ) {

                float elapsed =

                    max(

                        0.0,

                        time -
                        start

                    );


                /*
                 * Ripple expands outward.
                 */

                float radius =

                    (
                        1.0 -
                        exp(
                            -elapsed *
                            0.55
                        )
                    )
                    *
                    2.25;


                float distanceFromRipple =

                    distance(

                        p,

                        ripplePosition

                    );


                /*
                 * The wave phase is based on
                 * the distance from the source.
                 *
                 * This is what allows waves
                 * from different ripples to
                 * interfere with one another.
                 */

                return

                    (
                        distanceFromRipple -
                        radius
                    )
                    *
                    55.0;

            }


            /* =================================================
               SINGLE RIPPLE ENVELOPE
            ================================================= */

            float rippleEnvelope(

                vec2 p,

                vec2 ripplePosition,

                float start

            ) {

                float elapsed =

                    max(

                        0.0,

                        time -
                        start

                    );


                float radius =

                    (
                        1.0 -
                        exp(
                            -elapsed *
                            0.55
                        )
                    )
                    *
                    2.25;


                float distanceFromRipple =

                    distance(

                        p,

                        ripplePosition

                    );


                float distanceFromRing =

                    abs(

                        distanceFromRipple -
                        radius

                    );


                float width =

                    mix(

                        0.045,

                        0.12,

                        smoothstep(

                            0.0,

                            4.0,

                            elapsed

                        )

                    );


                float ring =

                    exp(

                        -pow(

                            distanceFromRing /
                            width,

                            2.0

                        )

                    );


                /*
                 * Energy decreases gradually.
                 */

                float energy =

                    exp(

                        -elapsed *
                        0.40

                    );


                /*
                 * Eventually allow the ripple
                 * to disappear completely.
                 */

                float lifetime =

                    1.0 -

                    smoothstep(

                        8.0,

                        11.5,

                        elapsed

                    );


                return

                    ring *
                    energy *
                    lifetime;

            }


            /* =================================================
               RIPPLE INTERFERENCE FIELD
            ================================================= */

            float rippleInterference(vec2 p) {

                float field =
                    0.0;


                float totalInfluence =
                    0.0;


                for (
                    int i = 0;
                    i < MAX_RIPPLES;
                    i++
                ) {

                    float strength =

                        rippleStrengths[i];


                    if (
                        strength > 0.0
                    ) {

                        float elapsed =

                            max(

                                0.0,

                                time -
                                rippleStarts[i]

                            );


                        /*
                         * Ignore inactive ripples.
                         */

                        if (
                            elapsed < 12.0
                        ) {

                            float phase =

                                ripplePhase(

                                    p,

                                    ripplePositions[i],

                                    rippleStarts[i]

                                );


                            float envelope =

                                rippleEnvelope(

                                    p,

                                    ripplePositions[i],

                                    rippleStarts[i]

                                );


                            /*
                             * Each ripple contributes
                             * to the same wave field.
                             */

                            float wave =

                                sin(

                                    phase

                                );


                            field +=

                                wave *
                                envelope *
                                strength;


                            totalInfluence +=

                                envelope *
                                strength;

                        }

                    }

                }


                /*
                 * Prevent extreme values when
                 * many ripples overlap.
                 */

                if (
                    totalInfluence > 1.0
                ) {

                    field *=

                        1.0 /
                        sqrt(
                            totalInfluence
                        );

                }


                return

                    field *
                    0.70;

            }


            /* =================================================
               RIPPLE MICRO-WAVES
            ================================================= */

            float rippleMicroWaves(vec2 p) {

                float result =
                    0.0;


                for (
                    int i = 0;
                    i < MAX_RIPPLES;
                    i++
                ) {

                    float strength =

                        rippleStrengths[i];


                    if (
                        strength > 0.0
                    ) {

                        float elapsed =

                            max(

                                0.0,

                                time -
                                rippleStarts[i]

                            );


                        if (
                            elapsed < 12.0
                        ) {

                            float radius =

                                (
                                    1.0 -
                                    exp(
                                        -elapsed *
                                        0.55
                                    )
                                )
                                *
                                2.25;


                            float d =

                                distance(

                                    p,

                                    ripplePositions[i]

                                );


                            float wave =

                                sin(

                                    (
                                        d -
                                        radius
                                    )
                                    *
                                    21.0

                                );


                            float envelope =

                                exp(

                                    -pow(

                                        (
                                            d -
                                            radius
                                        )
                                        /
                                        0.22,

                                        2.0

                                    )

                                );


                            float decay =

                                exp(

                                    -elapsed *
                                    0.45

                                );


                            result +=

                                wave *
                                envelope *
                                decay *
                                strength *
                                0.09;

                        }

                    }

                }


                return result;

            }


            /* =================================================
               TOTAL WATER HEIGHT
            ================================================= */

            float waterHeight(vec2 p) {

                float baseWater =

                    largeWave(p)

                    +

                    smallWaves(p)

                    +

                    organicMotion(p);


                float interference =

                    rippleInterference(p);


                float microWaves =

                    rippleMicroWaves(p);


                return

                    baseWater

                    +

                    interference

                    +

                    microWaves;

            }


            /* =================================================
               SURFACE NORMAL
            ================================================= */

            vec3 surfaceNormal(vec2 p) {

                float e =
                    0.0025;


                float center =

                    waterHeight(p);


                float x =

                    waterHeight(

                        p +
                        vec2(
                            e,
                            0.0
                        )

                    );


                float y =

                    waterHeight(

                        p +
                        vec2(
                            0.0,
                            e
                        )

                    );


                return normalize(

                    vec3(

                        center - x,

                        center - y,

                        e

                    )

                );

            }


            /* =================================================
               MOON REFLECTION
            ================================================= */

            float moonReflection(

                vec2 uv,

                vec3 normal

            ) {

                float baseDistance =

                    abs(

                        uv.x -
                        0.50

                    );


                float spread =

                    mix(

                        0.025,

                        0.45,

                        uv.y

                    );


                /*
                 * Let the water normal distort
                 * the reflection.
                 */

                float surfaceDistortion =

                    (
                        normal.x +
                        normal.y
                    )
                    *
                    0.045;


                float distortedDistance =

                    abs(

                        baseDistance +
                        surfaceDistortion

                    );


                float reflectionShape =

                    exp(

                        -pow(

                            distortedDistance /
                            spread,

                            2.0

                        )

                    );


                /* ---------------------------------------------
                   Moon direction
                --------------------------------------------- */

                vec3 moonDirection =

                    normalize(

                        vec3(

                            0.0,

                            0.38,

                            1.0

                        )

                    );


                float angle =

                    max(

                        dot(

                            normal,

                            moonDirection

                        ),

                        0.0

                    );


                float sparkle =

                    pow(

                        angle,

                        25.0

                    );


                /* ---------------------------------------------
                   Organic breakup
                --------------------------------------------- */

                float breakupA =

                    fbm(

                        uv *
                        10.0

                        +

                        vec2(

                            time *
                            0.045,

                            -time *
                            0.030

                        )

                    );


                float breakupB =

                    fbm(

                        uv *
                        19.0

                        +

                        vec2(

                            -time *
                            0.037,

                            time *
                            0.021

                        )

                    );


                float breakup =

                    breakupA *
                    0.60

                    +

                    breakupB *
                    0.40;


                /* ---------------------------------------------
                   Ripple interference affects moonlight
                --------------------------------------------- */

                vec2 rippleP =

                    vec2(

                        uv.x -
                        0.5,

                        (
                            1.0 -
                            uv.y
                        )
                        *
                        1.55
                        -
                        0.775

                    );


                float rippleLightInteraction =
                    0.0;


                float rippleLightInfluence =
                    0.0;


                for (
                    int i = 0;
                    i < MAX_RIPPLES;
                    i++
                ) {

                    float strength =

                        rippleStrengths[i];


                    if (
                        strength > 0.0
                    ) {

                        float elapsed =

                            max(

                                0.0,

                                time -
                                rippleStarts[i]

                            );


                        if (
                            elapsed < 12.0
                        ) {

                            float radius =

                                (
                                    1.0 -
                                    exp(
                                        -elapsed *
                                        0.55
                                    )
                                )
                                *
                                2.25;


                            float d =

                                distance(

                                    rippleP,

                                    ripplePositions[i]

                                );


                            float distanceFromWave =

                                d -
                                radius;


                            float influence =

                                exp(

                                    -pow(

                                        distanceFromWave /
                                        0.16,

                                        2.0

                                    )

                                );


                            float wave =

                                sin(

                                    distanceFromWave *
                                    45.0

                                );


                            float decay =

                                exp(

                                    -elapsed *
                                    0.40

                                );


                            rippleLightInteraction +=

                                wave *
                                influence *
                                strength *
                                decay;


                            rippleLightInfluence +=

                                influence *
                                strength *
                                decay;

                        }

                    }

                }


                /*
                 * The combined ripple field modifies
                 * the brightness and breakup of the
                 * reflection.
                 */

                breakup +=

                    rippleLightInteraction *
                    0.22;


                sparkle *=

                    1.0 +

                    rippleLightInteraction *
                    0.10;


                breakup =

                    clamp(

                        breakup,

                        0.0,

                        1.0

                    );


                breakup =

                    smoothstep(

                        0.28,

                        0.72,

                        breakup

                    );


                return

                    reflectionShape
                    *
                    sparkle
                    *
                    breakup;

            }


            /* =================================================
               MAIN IMAGE
            ================================================= */

            void main() {

                vec2 uv =

                    gl_FragCoord.xy
                    /
                    resolution;


                /* ---------------------------------------------
                   Pond coordinates
                --------------------------------------------- */

                vec2 p =

                    uv -
                    0.5;


                p.x *=

                    resolution.x /
                    resolution.y;


                p.y +=

                    scroll *
                    0.00022;


                p.y *=

                    1.55;


                /* ---------------------------------------------
                   Water surface
                --------------------------------------------- */

                float surface =

                    waterHeight(p);


                vec3 normal =

                    surfaceNormal(p);


                /* ---------------------------------------------
                   Base water
                --------------------------------------------- */

                vec3 deepWater =

                    vec3(

                        0.0015,

                        0.010,

                        0.020

                    );


                vec3 blueWater =

                    vec3(

                        0.004,

                        0.032,

                        0.055

                    );


                float variation =

                    surface *
                    0.55
                    +
                    0.5;


                variation =

                    clamp(

                        variation,

                        0.0,

                        1.0

                    );


                vec3 color =

                    mix(

                        deepWater,

                        blueWater,

                        variation

                    );


                /* ---------------------------------------------
                   Surface highlights
                --------------------------------------------- */

                float highlight =

                    pow(

                        max(

                            normal.z,

                            0.0

                        ),

                        7.0

                    );


                color +=

                    vec3(

                        0.012,

                        0.035,

                        0.055

                    )

                    *

                    highlight;


                /* ---------------------------------------------
                   Moon reflection
                --------------------------------------------- */

                float reflection =

                    moonReflection(

                        uv,

                        normal

                    );


                vec3 moonColor =

                    vec3(

                        0.72,

                        0.87,

                        1.0

                    );


                color +=

                    moonColor

                    *

                    reflection

                    *

                    1.90;


                /* ---------------------------------------------
                   Ambient moon illumination
                --------------------------------------------- */

                float ambientMoon =

                    exp(

                        -pow(

                            (
                                uv.x -
                                0.50
                            )
                            /
                            0.48,

                            2.0

                        )

                    );


                color +=

                    vec3(

                        0.022,

                        0.045,

                        0.070

                    )

                    *

                    ambientMoon;


                /* ---------------------------------------------
                   Cinematic vignette
                --------------------------------------------- */

                float vignette =

                    1.0 -

                    smoothstep(

                        0.30,

                        0.88,

                        distance(

                            uv,

                            vec2(

                                0.5,

                                0.43

                            )

                        )

                    );


                color *=

                    mix(

                        0.58,

                        1.0,

                        vignette

                    );


                /* ---------------------------------------------
                   Final contrast
                --------------------------------------------- */

                color =

                    pow(

                        color,

                        vec3(

                            0.86

                        )

                    );


                gl_FragColor =

                    vec4(

                        color,

                        1.0

                    );

            }

        `;


        /* =====================================================
           SHADER COMPILATION
        ===================================================== */

        function createShader(

            type,

            source

        ) {

            const shader =

                gl.createShader(

                    type

                );


            gl.shaderSource(

                shader,

                source

            );


            gl.compileShader(

                shader

            );


            if (

                !gl.getShaderParameter(

                    shader,

                    gl.COMPILE_STATUS

                )

            ) {

                console.error(

                    "The Infinite Pond shader error:",

                    gl.getShaderInfoLog(

                        shader

                    )

                );


                return null;

            }


            return shader;

        }


        const vertexShader =

            createShader(

                gl.VERTEX_SHADER,

                vertexShaderSource

            );


        const fragmentShader =

            createShader(

                gl.FRAGMENT_SHADER,

                fragmentShaderSource

            );


        if (

            !vertexShader ||

            !fragmentShader

        ) {

            console.error(

                "The Infinite Pond: Shader creation failed."

            );

        } else {


            /* =================================================
               PROGRAM
            ================================================= */

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


            gl.linkProgram(

                program

            );


            if (

                !gl.getProgramParameter(

                    program,

                    gl.LINK_STATUS

                )

            ) {

                console.error(

                    "The Infinite Pond program error:",

                    gl.getProgramInfoLog(

                        program

                    )

                );

            } else {


                gl.useProgram(

                    program

                );


                /* =============================================
                   FULL SCREEN QUAD
                ============================================= */

                const buffer =

                    gl.createBuffer();


                gl.bindBuffer(

                    gl.ARRAY_BUFFER,

                    buffer

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


                /* =============================================
                   POSITION ATTRIBUTE
                ============================================= */

                const position =

                    gl.getAttribLocation(

                        program,

                        "position"

                    );


                gl.enableVertexAttribArray(

                    position

                );


                gl.vertexAttribPointer(

                    position,

                    2,

                    gl.FLOAT,

                    false,

                    0,

                    0

                );


                /* =============================================
                   UNIFORMS
                ============================================= */

                const resolutionLocation =

                    gl.getUniformLocation(

                        program,

                        "resolution"

                    );


                const timeLocation =

                    gl.getUniformLocation(

                        program,

                        "time"

                    );


                const scrollLocation =

                    gl.getUniformLocation(

                        program,

                        "scroll"

                    );


                const ripplePositionsLocation =

                    gl.getUniformLocation(

                        program,

                        "ripplePositions"

                    );


                const rippleStartsLocation =

                    gl.getUniformLocation(

                        program,

                        "rippleStarts"

                    );


                const rippleStrengthsLocation =

                    gl.getUniformLocation(

                        program,

                        "rippleStrengths"

                    );


                /* =============================================
                   RIPPLE STORAGE
                ============================================= */

                const ripples = [];


                /* =============================================
                   CREATE RIPPLE
                ============================================= */

                function createRipple(

                    clientX,

                    clientY

                ) {

                    console.log(

                        "INFINITE POND RIPPLE:",

                        clientX,

                        clientY

                    );


                    const uvX =

                        clientX /
                        window.innerWidth;


                    const uvY =

                        1.0 -

                        (

                            clientY /
                            window.innerHeight

                        );


                    let rippleX =

                        uvX -
                        0.5;


                    let rippleY =

                        uvY -
                        0.5;


                    rippleX *=

                        window.innerWidth /
                        window.innerHeight;


                    rippleY *=

                        1.55;


                    const now =

                        performance.now()
                        *
                        0.001;


                    /* -----------------------------------------
                       Add new ripple
                    ----------------------------------------- */

                    ripples.push({

                        x:
                            rippleX,

                        y:
                            rippleY,

                        start:
                            now,

                        strength:
                            3.0

                    });


                    /* -----------------------------------------
                       Keep maximum number
                    ----------------------------------------- */

                    if (

                        ripples.length >
                        MAX_RIPPLES

                    ) {

                        ripples.shift();

                    }

                }


                /* =============================================
                   POINTER RIPPLE
                ============================================= */

                window.addEventListener(

                    "pointerdown",

                    function (event) {

                        console.log(

                            "POINTER DETECTED"

                        );


                        if (

                            event.button !== 0 &&

                            event.pointerType !== "touch"

                        ) {

                            return;

                        }


                        createRipple(

                            event.clientX,

                            event.clientY

                        );

                    },

                    true

                );


                /* =============================================
                   RESIZE
                ============================================= */

                function resizeWater() {

                    const ratio =

                        Math.min(

                            window.devicePixelRatio ||
                            1,

                            2

                        );


                    canvas.width =

                        window.innerWidth *
                        ratio;


                    canvas.height =

                        window.innerHeight *
                        ratio;


                    canvas.style.width =

                        window.innerWidth +
                        "px";


                    canvas.style.height =

                        window.innerHeight +
                        "px";


                    gl.viewport(

                        0,

                        0,

                        canvas.width,

                        canvas.height

                    );

                }


                window.addEventListener(

                    "resize",

                    resizeWater

                );


                resizeWater();


                /* =============================================
                   RENDER LOOP
                ============================================= */

                function renderWater(

                    milliseconds

                ) {

                    const currentTime =

                        milliseconds *
                        0.001;


                    gl.useProgram(

                        program

                    );


                    /* -----------------------------------------
                       Remove expired ripples
                    ----------------------------------------- */

                    while (

                        ripples.length > 0 &&

                        currentTime -
                        ripples[0].start >
                        12.0

                    ) {

                        ripples.shift();

                    }


                    /* -----------------------------------------
                       Prepare uniform arrays
                    ----------------------------------------- */

                    const positions =

                        new Float32Array(

                            MAX_RIPPLES *
                            2

                        );


                    const starts =

                        new Float32Array(

                            MAX_RIPPLES

                        );


                    const strengths =

                        new Float32Array(

                            MAX_RIPPLES

                        );


                    for (

                        let i = 0;

                        i < MAX_RIPPLES;

                        i++

                    ) {

                        if (

                            i <
                            ripples.length

                        ) {

                            positions[
                                i * 2
                            ] =

                                ripples[i].x;


                            positions[
                                i * 2 + 1
                            ] =

                                ripples[i].y;


                            starts[i] =

                                ripples[i].start;


                            strengths[i] =

                                ripples[i].strength;

                        } else {

                            positions[
                                i * 2
                            ] =

                                0.0;


                            positions[
                                i * 2 + 1
                            ] =

                                0.0;


                            starts[i] =

                                -100.0;


                            strengths[i] =

                                0.0;

                        }

                    }


                    /* -----------------------------------------
                       Send uniforms
                    ----------------------------------------- */

                    gl.uniform2f(

                        resolutionLocation,

                        canvas.width,

                        canvas.height

                    );


                    gl.uniform1f(

                        timeLocation,

                        currentTime

                    );


                    gl.uniform1f(

                        scrollLocation,

                        window.scrollY

                    );


                    gl.uniform2fv(

                        ripplePositionsLocation,

                        positions

                    );


                    gl.uniform1fv(

                        rippleStartsLocation,

                        starts

                    );


                    gl.uniform1fv(

                        rippleStrengthsLocation,

                        strengths

                    );


                    /* -----------------------------------------
                       Draw
                    ----------------------------------------- */

                    gl.drawArrays(

                        gl.TRIANGLES,

                        0,

                        6

                    );


                    requestAnimationFrame(

                        renderWater

                    );

                }


                requestAnimationFrame(

                    renderWater

                );

            }

        }

    }

}
