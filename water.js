/* =========================================================
   THE INFINITE POND
   VERSION 8.5.1 — NATURAL WATER MOVEMENT
   ========================================================= */


const canvas =
    document.getElementById("waterCanvas");


if (!canvas) {

    console.error(
        "The Infinite Pond: waterCanvas not found."
    );

} else {


    const gl =
        canvas.getContext("webgl", {

            alpha: false,
            antialias: false,
            powerPreference: "high-performance"

        });


    if (!gl) {

        console.error(
            "The Infinite Pond: WebGL unavailable."
        );

    } else {


        /* =================================================
           SETTINGS
        ================================================= */

        const MAX_RIPPLES = 12;


        /* =================================================
           VERTEX SHADER
        ================================================= */

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


        /* =================================================
           FRAGMENT SHADER
        ================================================= */

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

               CALM MOONLIT POND

               Very slow, broad undulation.

               VERSION 8.5.1:

               Slightly more organic movement is introduced
               while keeping the pond extremely calm.
            ================================================= */

            float largeWave(vec2 p) {

                float waveA =

                    sin(

                        dot(
                            p,
                            normalize(
                                vec2(
                                    1.0,
                                    0.18
                                )
                            )
                        )
                        *
                        0.72
                        +
                        time *
                        0.055

                    );


                float waveB =

                    sin(

                        dot(
                            p,
                            normalize(
                                vec2(
                                    -0.32,
                                    1.0
                                )
                            )
                        )
                        *
                        0.58
                        -
                        time *
                        0.042

                    );


                return

                    waveA *
                    0.055

                    +

                    waveB *
                    0.035;

            }


            /* =================================================
               SMALL SURFACE WAVES

               Extremely subtle.
            ================================================= */

            float smallWaves(vec2 p) {

                float waveA =

                    sin(

                        dot(
                            p,
                            normalize(
                                vec2(
                                    0.35,
                                    1.0
                                )
                            )
                        )
                        *
                        2.8
                        +
                        time *
                        0.18

                    );


                float waveB =

                    sin(

                        dot(
                            p,
                            normalize(
                                vec2(
                                    -0.72,
                                    0.38
                                )
                            )
                        )
                        *
                        3.6
                        -
                        time *
                        0.14

                    );


                return

                    waveA *
                    0.012

                    +

                    waveB *
                    0.008;

            }


            /* =================================================
               ORGANIC MOTION

               Extremely restrained low-frequency movement.
            ================================================= */

            float organicMotion(vec2 p) {

                vec2 drift =

                    vec2(

                        time *
                        0.004,

                        -time *
                        0.003

                    );


                float n =

                    fbm(

                        p *
                        0.48
                        +
                        drift

                    );


                return

                    (
                        n -
                        0.5
                    )
                    *
                    0.035;

            }


            /* =================================================
               NATURAL WATER SURFACE

               VERSION 8.5.0

               Layered organic surface variation.

               The fine layers remain appearance-only.
            ================================================= */

            float naturalWaterSurface(vec2 p) {

                vec2 slowDrift =

                    vec2(

                        time *
                        0.0025,

                        -time *
                        0.0018

                    );


                float broadA =

                    fbm(

                        p *
                        0.36
                        +
                        slowDrift

                    );


                float broadB =

                    fbm(

                        p *
                        0.68
                        -
                        slowDrift *
                        1.35

                    );


                float fine =

                    fbm(

                        p *
                        1.35
                        +
                        slowDrift *
                        0.65
                        +
                        vec2(
                            4.7,
                            8.2
                        )

                    );


                float surfaceVariation =

                    broadA *
                    0.58

                    +

                    broadB *
                    0.30

                    +

                    fine *
                    0.12;


                return

                    (
                        surfaceVariation -
                        0.5
                    )
                    *
                    0.060;

            }


            /* =================================================
               NATURAL WATER MOVEMENT

               VERSION 8.5.1

               This is the new physical movement layer.

               It is intentionally separate from the
               appearance-only naturalWaterSurface() layer.

               The movement is:

               • broad
               • slow
               • non-repeating
               • extremely low amplitude

               It should make the pond feel alive without
               looking like a wave simulator.
            ================================================= */

            float naturalWaterMovement(vec2 p) {

                vec2 movementDrift =

                    vec2(

                        time *
                        0.006,

                        -time *
                        0.004

                    );


                /* ---------------------------------------------
                   Very broad organic movement.
                --------------------------------------------- */

                float broadA =

                    fbm(

                        p *
                        0.30
                        +
                        movementDrift

                    );


                /* ---------------------------------------------
                   Second movement layer travelling in a
                   slightly different direction.
                --------------------------------------------- */

                float broadB =

                    fbm(

                        p *
                        0.52
                        -
                        movementDrift *
                        1.15

                    );


                /* ---------------------------------------------
                   Blend the two broad fields.

                   Keeping this weighted heavily toward the
                   broadest layer prevents visible texture.
                --------------------------------------------- */

                float movement =

                    broadA *
                    0.68

                    +

                    broadB *
                    0.32;


                return

                    (
                        movement -
                        0.5
                    )
                    *
                    0.018;

            }


            /* =================================================
               RIPPLE INTERFERENCE

               Disabled.

               This prevents the old secondary ripple
               from returning.
            ================================================= */

            float rippleInterference(vec2 p) {

                return 0.0;

            }


            /* =================================================
               IMPACT DISPLACEMENT

               The ONLY click-generated ripple displacement.

               Ripple polarity is preserved from 8.4.9.
            ================================================= */

            float impactDisplacement(vec2 p) {

                float field =
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
                            elapsed < 2.5
                        ) {

                            float d =

                                distance(
                                    p,
                                    ripplePositions[i]
                                );


                            float impactRadius =

                                0.055 +
                                elapsed *
                                0.045;


                            float impactShape =

                                exp(

                                    -pow(

                                        d /
                                        impactRadius,

                                        2.0

                                    )

                                );


                            float impactWave =

                                cos(

                                    d *
                                    42.0

                                    -

                                    elapsed *
                                    7.0

                                );


                            float decay =

                                exp(

                                    -elapsed *
                                    1.35

                                );


                            field +=

                                impactShape
                                *
                                impactWave
                                *
                                decay
                                *
                                strength
                                *
                                -0.075;

                        }

                    }

                }


                return field;

            }


            /* =================================================
               RIPPLE MICRO-WAVES

               Disabled.

               This remains disabled so the new natural
               movement cannot accidentally create the old
               secondary ripple effect.
            ================================================= */

            float rippleMicroWaves(vec2 p) {

                return 0.0;

            }


            /* =================================================
               TOTAL WATER HEIGHT

               VERSION 8.5.1

               Natural movement is now part of the physical
               surface height.

               Natural appearance remains separate.

               Click ripples remain independent.
            ================================================= */

            float waterHeight(vec2 p) {

                float baseWater =

                    largeWave(p)

                    +

                    smallWaves(p)

                    +

                    organicMotion(p);


                float naturalMovement =

                    naturalWaterMovement(p);


                float interference =

                    rippleInterference(p);


                float impact =

                    impactDisplacement(p);


                float microWaves =

                    rippleMicroWaves(p);


                return

                    baseWater

                    +

                    naturalMovement

                    +

                    interference

                    +

                    impact

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
               MOON CLOUDS

               Visual-only cloud field.

               Does NOT affect waterHeight().
            ================================================= */

            float moonClouds(vec2 uv) {

                vec2 cloudUV =

                    uv *
                    vec2(
                        2.0,
                        1.15
                    );


                cloudUV +=

                    vec2(

                        time *
                        0.004,

                        -time *
                        0.0015

                    );


                float cloudA =

                    fbm(

                        cloudUV *
                        1.15

                    );


                float cloudB =

                    fbm(

                        cloudUV *
                        2.2

                        +

                        vec2(
                            7.3,
                            2.4
                        )

                    );


                float clouds =

                    cloudA *
                    0.72

                    +

                    cloudB *
                    0.28;


                return smoothstep(

                    0.48,
                    0.72,
                    clouds

                );

            }


            /* =================================================
               MOON ATMOSPHERE

               A very soft suggestion of moonlight near the
               top of the page.

               This is NOT a visible white moon orb.
            ================================================= */

            float moonAtmosphere(vec2 uv) {

                vec2 moonPosition =

                    vec2(
                        0.50,
                        1.12
                    );


                float distanceFromMoon =

                    distance(
                        uv,
                        moonPosition
                    );


                float glow =

                    exp(

                        -pow(

                            distanceFromMoon /
                            0.28,

                            2.0

                        )

                    );


                float clouds =

                    moonClouds(uv);


                return

                    glow
                    *
                    mix(
                        0.82,
                        0.38,
                        clouds
                    );

            }


            /* =================================================
               MOON REFLECTION

               Reflection begins at the top of the page
               and stretches downward.

               The moon itself is deliberately off-screen,
               so the viewer sees reflected moonlight rather
               than a bright white orb.
            ================================================= */

            float moonReflection(

                vec2 uv,

                vec3 normal

            ) {

                vec2 moonPosition =

                    vec2(
                        0.50,
                        1.12
                    );


                float verticalDistance =

                    clamp(

                        moonPosition.y -
                        uv.y,

                        0.0,
                        1.0

                    );


                float spread =

                    mix(

                        0.018,
                        0.22,

                        smoothstep(
                            0.0,
                            1.0,
                            verticalDistance
                        )

                    );


                float distortion =

                    (
                        normal.x *
                        0.65

                        +

                        normal.y *
                        0.35
                    )
                    *
                    0.028;


                float horizontalDistance =

                    abs(

                        uv.x -
                        moonPosition.x
                        +
                        distortion

                    );


                float reflectionShape =

                    exp(

                        -pow(

                            horizontalDistance /
                            spread,

                            2.0

                        )

                    );


                float distanceFade =

                    mix(

                        1.0,
                        0.42,

                        smoothstep(
                            0.0,
                            1.0,
                            verticalDistance
                        )

                    );


                vec3 moonDirection =

                    normalize(

                        vec3(

                            0.0,
                            0.42,
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
                        22.0
                    );


                float cloudAmount =

                    moonClouds(uv);


                float cloudLight =

                    mix(

                        1.0,
                        0.28,
                        cloudAmount

                    );


                float breakup =

                    fbm(

                        uv *
                        5.0

                        +

                        vec2(

                            time *
                            0.005,

                            -time *
                            0.003

                        )

                    );


                breakup =

                    smoothstep(

                        0.30,
                        0.72,
                        breakup

                    );


                float breakupStrength =

                    mix(

                        0.62,
                        1.0,
                        breakup

                    );


                return

                    reflectionShape

                    *

                    distanceFade

                    *

                    sparkle

                    *

                    cloudLight

                    *

                    breakupStrength;

            }


            /* =================================================
               MAIN IMAGE
            ================================================= */

            void main() {

                vec2 uv =

                    gl_FragCoord.xy
                    /
                    resolution;


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
                   Actual water surface
                --------------------------------------------- */

                float surface =

                    waterHeight(p);


                vec3 normal =

                    surfaceNormal(p);


                /* ---------------------------------------------
                   BASE WATER
                --------------------------------------------- */

                vec3 deepWater =

                    vec3(

                        0.0035,
                        0.018,
                        0.032

                    );


                vec3 blueWater =

                    vec3(

                        0.008,
                        0.052,
                        0.082

                    );


                float variation =

                    surface *
                    0.55
                    +
                    0.5;


                /* ---------------------------------------------
                   Natural surface appearance

                   This remains separate from the physical
                   movement so we can tune the two independently.
                --------------------------------------------- */

                float naturalSurface =

                    naturalWaterSurface(p);


                variation +=

                    naturalSurface;


                /* ---------------------------------------------
                   Background variation

                   Appearance only.
                   Does NOT affect normals.
                --------------------------------------------- */

                float backgroundVariation =

                    fbm(

                        p *
                        0.42

                        +

                        vec2(

                            time *
                            0.004,

                            -time *
                            0.003

                        )

                    );


                backgroundVariation =

                    (
                        backgroundVariation -
                        0.5
                    )
                    *
                    0.035;


                variation +=

                    backgroundVariation;


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
                   Natural surface sheen
                --------------------------------------------- */

                float surfaceSheen =

                    naturalSurface *
                    0.55;


                color +=

                    vec3(

                        0.004,
                        0.010,
                        0.014

                    )

                    *

                    surfaceSheen;


                /* ---------------------------------------------
                   MOON REFLECTION
                --------------------------------------------- */

                float reflection =

                    moonReflection(

                        uv,
                        normal

                    );


                vec3 moonColor =

                    vec3(

                        0.58,
                        0.74,
                        0.88

                    );


                color +=

                    moonColor

                    *

                    reflection

                    *

                    1.65;


                /* ---------------------------------------------
                   SOFT ATMOSPHERIC MOONLIGHT
                --------------------------------------------- */

                float atmosphere =

                    moonAtmosphere(uv);


                color +=

                    vec3(

                        0.008,
                        0.018,
                        0.030

                    )

                    *

                    atmosphere;


                /* ---------------------------------------------
                   AMBIENT MOONLIGHT
                --------------------------------------------- */

                float upperLight =

                    smoothstep(

                        0.10,
                        0.95,
                        uv.y

                    );


                float centerLight =

                    exp(

                        -pow(

                            (
                                uv.x -
                                0.50
                            )
                            /
                            0.52,

                            2.0

                        )

                    );


                float ambientMoon =

                    upperLight *
                    centerLight;


                color +=

                    vec3(

                        0.010,
                        0.024,
                        0.040

                    )

                    *

                    ambientMoon;


                /* ---------------------------------------------
                   CINEMATIC VIGNETTE
                --------------------------------------------- */

                float vignette =

                    1.0 -

                    smoothstep(

                        0.30,
                        0.92,

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

                        0.68,
                        1.0,
                        vignette

                    );


                /* ---------------------------------------------
                   FINAL CONTRAST
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


                    const rect =

                        canvas.getBoundingClientRect();


                    const localX =

                        clientX -
                        rect.left;


                    const localY =

                        clientY -
                        rect.top;


                    const uvX =

                        localX /
                        rect.width;


                    /* -----------------------------------------
                       Browser Y coordinates are inverted for
                       WebGL fragment coordinates.
                    ----------------------------------------- */

                    const uvY =

                        localY /
                        rect.height;


                    let rippleX =

                        uvX -
                        0.5;


                    let rippleY =

                        0.5 -
                        uvY;


                    rippleX *=

                        rect.width /
                        rect.height;


                    rippleY *=

                        1.55;


                    const now =

                        performance.now()
                        *
                        0.001;


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
                       Prepare ripple arrays
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
                       Upload uniforms
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
                       Draw pond
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
