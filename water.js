/* =========================================================
   THE INFINITE POND
   VERSION 7 — INTERACTIVE WATER
========================================================= */

const canvas = document.getElementById("waterCanvas");

if (!canvas) {
    console.error("The Infinite Pond: waterCanvas not found.");
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
               UNIFORMS
            ================================================= */

            uniform vec2 resolution;

            uniform float time;

            uniform float scroll;

            uniform vec2 ripplePosition;

            uniform float rippleStart;

            uniform float rippleStrength;


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
               MULTI-OCTAVE NOISE
            ================================================= */

            float fbm(vec2 p) {

                float value =
                    0.0;

                float amplitude =
                    0.5;

                for (
                    int i = 0;
                    i < 4;
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
               ORGANIC DIRECTIONAL WAVE
            ================================================= */

            float directionalWave(

                vec2 p,

                vec2 direction,

                float frequency,

                float speed,

                float amplitude,

                float phase

            ) {

                float distortion =

                    noise(

                        p * 0.72
                        +
                        vec2(
                            time * 0.018,
                            -time * 0.011
                        )

                    )
                    -
                    0.5;


                float position =

                    dot(
                        p,
                        direction
                    )
                    *
                    frequency;


                position +=

                    distortion *
                    0.55;


                position +=

                    time *
                    speed;


                position +=
                    phase;


                return

                    sin(position)
                    *
                    amplitude;

            }


            /* =================================================
               BASE WATER HEIGHT
            ================================================= */

            float waterHeight(vec2 p) {

                float result =
                    0.0;


                /* ---------------------------------------------
                   Large primary swells
                --------------------------------------------- */

                result +=

                    directionalWave(

                        p,

                        normalize(
                            vec2(
                                1.0,
                                0.19
                            )
                        ),

                        1.17,

                        0.43,

                        0.32,

                        0.37

                    );


                result +=

                    directionalWave(

                        p,

                        normalize(
                            vec2(
                                -0.41,
                                1.0
                            )
                        ),

                        0.93,

                        -0.29,

                        0.27,

                        2.11

                    );


                /* ---------------------------------------------
                   Secondary swells
                --------------------------------------------- */

                result +=

                    directionalWave(

                        p,

                        normalize(
                            vec2(
                                0.63,
                                0.78
                            )
                        ),

                        1.71,

                        0.52,

                        0.17,

                        4.73

                    );


                result +=

                    directionalWave(

                        p,

                        normalize(
                            vec2(
                                -0.88,
                                0.34
                            )
                        ),

                        2.13,

                        -0.41,

                        0.13,

                        1.29

                    );


                /* ---------------------------------------------
                   Smaller crossing waves
                --------------------------------------------- */

                result +=

                    directionalWave(

                        p,

                        normalize(
                            vec2(
                                0.22,
                                1.0
                            )
                        ),

                        3.27,

                        0.71,

                        0.075,

                        3.81

                    );


                result +=

                    directionalWave(

                        p,

                        normalize(
                            vec2(
                                -0.72,
                                0.51
                            )
                        ),

                        4.13,

                        -0.57,

                        0.052,

                        5.37

                    );


                /* ---------------------------------------------
                   Very subtle organic distortion
                --------------------------------------------- */

                float organicNoise =

                    fbm(

                        p * 1.15
                        +
                        vec2(
                            time * 0.021,
                            -time * 0.015
                        )

                    );


                result +=

                    (
                        organicNoise -
                        0.5
                    )
                    *
                    0.12;


                return result;

            }


            /* =================================================
               INTERACTIVE RIPPLE
            ================================================= */

            float interactiveRipple(vec2 p) {

                float elapsed =

                    max(
                        0.0,
                        time -
                        rippleStart
                    );


                /*
                 * Ripple travels outward.
                 */

                float radius =

                    elapsed *
                    0.48;


                /*
                 * Distance from click/touch.
                 */

                float distanceFromRipple =

                    distance(
                        p,
                        ripplePosition
                    );


                /*
                 * Width of ripple ring.
                 */

                float width =
                    0.075;


                /*
                 * Travelling wave.
                 */

                float wave =

                    sin(

                        (
                            distanceFromRipple -
                            radius
                        )
                        *
                        72.0

                    );


                /*
                 * Keep the wave concentrated
                 * around its moving edge.
                 */

                float ring =

                    exp(

                        -pow(

                            (
                                distanceFromRipple -
                                radius
                            )
                            /
                            width,

                            2.0

                        )

                    );


                /*
                 * Ripple fades naturally.
                 */

                float fade =

                    exp(
                        -elapsed *
                        0.55
                    );


                return

                    wave
                    *
                    ring
                    *
                    fade
                    *
                    rippleStrength
                    *
                    0.75;

            }


            /* =================================================
               COMBINED SURFACE
            ================================================= */

            float totalWaterHeight(vec2 p) {

                return

                    waterHeight(p)
                    +
                    interactiveRipple(p);

            }


            /* =================================================
               SURFACE NORMAL
            ================================================= */

            vec3 surfaceNormal(vec2 p) {

                float e =
                    0.0025;


                float center =

                    totalWaterHeight(p);


                float x =

                    totalWaterHeight(

                        p +
                        vec2(
                            e,
                            0.0
                        )

                    );


                float y =

                    totalWaterHeight(

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

                /*
                 * Center of moon reflection.
                 */

                float distanceFromCenter =

                    abs(
                        uv.x -
                        0.50
                    );


                /*
                 * Reflection widens
                 * toward the viewer.
                 */

                float spread =

                    mix(
                        0.035,
                        0.42,
                        uv.y
                    );


                float reflectionShape =

                    exp(

                        -pow(

                            distanceFromCenter
                            /
                            spread,

                            2.0

                        )

                    );


                /*
                 * Direction of moonlight.
                 */

                vec3 moonDirection =

                    normalize(

                        vec3(
                            0.0,
                            0.35,
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


                /*
                 * Sharp water highlights.
                 */

                float sparkle =

                    pow(
                        angle,
                        31.0
                    );


                /*
                 * Break up the reflection
                 * using two scales of noise.
                 */

                float breakupA =

                    fbm(

                        uv * 9.7
                        +
                        vec2(
                            time * 0.043,
                            -time * 0.027
                        )

                    );


                float breakupB =

                    fbm(

                        uv * 17.3
                        +
                        vec2(
                            -time * 0.031,
                            time * 0.019
                        )

                    );


                float breakup =

                    breakupA * 0.65
                    +
                    breakupB * 0.35;


                breakup =

                    smoothstep(
                        0.40,
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


                /*
                 * Convert screen coordinates
                 * into pond coordinates.
                 */

                vec2 p =

                    uv -
                    0.5;


                /*
                 * Correct for screen aspect ratio.
                 */

                p.x *=

                    resolution.x /
                    resolution.y;


                /*
                 * Scroll through the pond.
                 */

                p.y +=

                    scroll *
                    0.00022;


                /*
                 * Give the water more depth.
                 */

                p.y *=
                    1.55;


                /*
                 * Calculate the water surface.
                 */

                float surface =

                    totalWaterHeight(p);


                /*
                 * Calculate surface normal.
                 */

                vec3 normal =

                    surfaceNormal(p);


                /* ---------------------------------------------
                   Base water colors
                --------------------------------------------- */

                vec3 deepWater =

                    vec3(
                        0.002,
                        0.014,
                        0.026
                    );


                vec3 blueWater =

                    vec3(
                        0.006,
                        0.040,
                        0.065
                    );


                float variation =

                    surface *
                    0.5
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
                   Moon reflection
                --------------------------------------------- */

                float reflection =

                    moonReflection(
                        uv,
                        normal
                    );


                vec3 moonColor =

                    vec3(
                        0.70,
                        0.86,
                        1.00
                    );


                color +=

                    moonColor
                    *
                    reflection
                    *
                    1.65;


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
                        0.025,
                        0.050,
                        0.075
                    )
                    *
                    ambientMoon;


                /* ---------------------------------------------
                   Dark cinematic edges
                --------------------------------------------- */

                float vignette =

                    1.0 -

                    smoothstep(

                        0.35,

                        0.85,

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
                        0.60,
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
                            0.88
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
                gl.createShader(type);


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


                const ripplePositionLocation =

                    gl.getUniformLocation(
                        program,
                        "ripplePosition"
                    );


                const rippleStartLocation =

                    gl.getUniformLocation(
                        program,
                        "rippleStart"
                    );


                const rippleStrengthLocation =

                    gl.getUniformLocation(
                        program,
                        "rippleStrength"
                    );


/* =============================================
   RIPPLE STATE
============================================= */

let rippleX = 0.0;

let rippleY = 0.0;

let rippleStart = -100.0;

let rippleStrength = 0.0;


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


    /*
     * Convert browser coordinates
     * to normalized screen coordinates.
     */

    const uvX =
        clientX /
        window.innerWidth;


    const uvY =
        1.0 -
        (
            clientY /
            window.innerHeight
        );


    /*
     * Convert to pond coordinates.
     */

    rippleX =
        uvX -
        0.5;


    rippleY =
        uvY -
        0.5;


    /*
     * Match shader aspect ratio.
     */

    rippleX *=
        window.innerWidth /
        window.innerHeight;


    /*
     * Match shader vertical scale.
     */

    rippleY *=
        1.55;


    /*
     * Start the ripple.
     */

    rippleStart =
        performance.now()
        *
        0.001;


    /*
     * Strong while testing.
     */

    rippleStrength =
        3.0;

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


        


/* =============================================
   RESIZE
============================================= */

function resizeWater() {

                    const ratio =

                        Math.min(

                            window.devicePixelRatio || 1,

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
                       Resolution
                    ----------------------------------------- */

                    gl.uniform2f(

                        resolutionLocation,

                        canvas.width,

                        canvas.height

                    );


                    /* -----------------------------------------
                       Time
                    ----------------------------------------- */

                    gl.uniform1f(

                        timeLocation,

                        currentTime

                    );


                    /* -----------------------------------------
                       Page scrolling
                    ----------------------------------------- */

                    gl.uniform1f(

                        scrollLocation,

                        window.scrollY

                    );


                    /* -----------------------------------------
                       Ripple position
                    ----------------------------------------- */

                    gl.uniform2f(

                        ripplePositionLocation,

                        rippleX,

                        rippleY

                    );


                    /* -----------------------------------------
                       Ripple start time
                    ----------------------------------------- */

                    gl.uniform1f(

                        rippleStartLocation,

                        rippleStart

                    );


                    /* -----------------------------------------
                       Ripple strength
                    ----------------------------------------- */

                    gl.uniform1f(

                        rippleStrengthLocation,

                        rippleStrength

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
