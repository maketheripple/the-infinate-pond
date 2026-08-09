/* =========================================================
   THE INFINITE POND
   VERSION 8.4.5 — CALM MOONLIT POND + SINGLE RIPPLE
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
               The water should feel almost still.
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
               These should mostly be felt in the moonlight,
               rather than seen as obvious waves.
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
               No swirling or energetic surface behavior.
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

               Calm moonlit pond variation.

               This affects appearance only and remains
               independent from the ripple displacement.
            ================================================= */

            float naturalWaterSurface(vec2 p) {

                vec2 slowDrift =

                    vec2(

                        time *
                        0.003,

                        -time *
                        0.002

                    );


                float broadA =

                    fbm(

                        p *
                        0.42
                        +
                        slowDrift

                    );


                float broadB =

                    fbm(

                        p *
                        0.78
                        -
                        slowDrift *
                        1.2

                    );


                float broadVariation =

                    broadA *
                    0.70

                    +

                    broadB *
                    0.30;


                float surface =

                    (
                        broadVariation -
                        0.5
                    )
                    *
                    0.055;


                return surface;

            }


            /* =================================================
               RIPPLE INTERFERENCE

               DISABLED AS A VISUAL RIPPLE.
               PRESERVED SO THE RIPPLE SYSTEM STRUCTURE
               REMAINS COMPATIBLE.
            ================================================= */

            float rippleInterference(vec2 p) {

                return 0.0;

            }


            /* =================================================
               IMPACT DISPLACEMENT
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
                                0.075;

                        }

                    }

                }


                return field;

            }


            /* =================================================
               RIPPLE MICRO-WAVES

               Disabled to prevent secondary ripple visuals.
            ================================================= */

            float rippleMicroWaves(vec2 p) {

                return 0.0;

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


                float impact =

                    impactDisplacement(p);


                float microWaves =

                    rippleMicroWaves(p);


                return

                    baseWater

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
               MOON REFLECTION

               Soft, elongated reflection of moonlight across
               a calm pond.

               The reflection responds to the actual surface
               normal only.

               No independent ripple animation is introduced.
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

                        0.018,
                        0.32,
                        uv.y

                    );


                float surfaceDistortion =

                    (
                        normal.x +
                        normal.y
                    )
                    *
                    0.025;


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

                        32.0

                    );


                /* ---------------------------------------------
                   Very gentle breakup.

                   The moon reflection should remain coherent,
                   rather than looking smoky or fragmented.
                --------------------------------------------- */

                float breakup =

                    fbm(

                        uv *
                        5.0

                        +

                        vec2(

                            time *
                            0.008,

                            -time *
                            0.005

                        )

                    );


                breakup =

                    smoothstep(

                        0.32,

                        0.68,

                        breakup

                    );


                return

                    reflectionShape
                    *
                    sparkle
                    *
                    mix(

                        0.72,

                        1.0,

                        breakup

                    );

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


                /* ---------------------------------------------
                   Natural surface variation

                   Appearance only.
                   Does NOT affect waterHeight() or normals.
                --------------------------------------------- */

                float naturalSurface =

                    naturalWaterSurface(p);


                /* ---------------------------------------------
                   Subtle natural background variation

                   This affects only visual brightness.
                   It does NOT affect waterHeight() or normals,
                   preventing it from creating another ripple.
                --------------------------------------------- */

                float backgroundVariation =

                    fbm(

                        p * 0.42

                        +

                        vec2(

                            time * 0.004,

                            -time * 0.003

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

                    naturalSurface

                    +

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


                    const uvY =

                        1.0 -
                        (
                            localY /
                            rect.height
                        );


                    let rippleX =

                        uvX -
                        0.5;


                    let rippleY =

                        uvY -
                        0.5;


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


                    while (

                        ripples.length > 0 &&

                        currentTime -
                        ripples[0].start >
                        12.0

                    ) {

                        ripples.shift();

                    }


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
