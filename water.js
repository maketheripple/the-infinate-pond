/* =========================================================
   THE INFINITE POND
   VERSION 7.6 — LIVING WATER
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
               SMALL SURFACE RIPPLE DETAIL
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
               ORGANIC WATER DISTORTION
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
               INTERACTIVE RIPPLE
            ================================================= */

            float interactiveRipple(vec2 p) {

                float elapsed =

                    max(
                        0.0,
                        time -
                        rippleStart
                    );


                float radius =

                    elapsed *
                    0.62;


                float distanceFromRipple =

                    distance(
                        p,
                        ripplePosition
                    );


                float width =

                    0.065;


                float wave =

                    sin(

                        (
                            distanceFromRipple -
                            radius
                        )
                        *
                        78.0

                    );


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


                float fade =

                    exp(
                        -elapsed *
                        0.48
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
                    0.85;

            }


            /* =================================================
               TOTAL WATER HEIGHT
            ================================================= */

            float waterHeight(vec2 p) {

                float base =

                    largeWave(p);


                float detail =

                    smallWaves(p);


                float organic =

                    organicMotion(p);


                float ripple =

                    interactiveRipple(p);


                return

                    base
                    +
                    detail
                    +
                    organic
                    +
                    ripple;

            }


            /* =================================================
               SURFACE NORMAL
            ================================================= */

            vec3 surfaceNormal(vec2 p) {

                float e =
                    0.003;


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

                float distanceFromCenter =

                    abs(
                        uv.x -
                        0.50
                    );


                float spread =

                    mix(
                        0.028,
                        0.45,
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
                        26.0
                    );


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
                        18.0

                        +

                        vec2(
                            -time *
                            0.035,

                            time *
                            0.022
                        )

                    );


                float breakup =

                    breakupA *
                    0.62

                    +

                    breakupB *
                    0.38;


                breakup =

                    smoothstep(

                        0.34,

                        0.69,

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
                   WATER COLORS
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
                   WATER HIGHLIGHTS
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
                   MOONLIGHT
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
                    1.85;


                /* ---------------------------------------------
                   AMBIENT MOON GLOW
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
                   CINEMATIC VIGNETTE
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


                    const uvX =

                        clientX /
                        window.innerWidth;


                    const uvY =

                        1.0 -

                        (
                            clientY /
                            window.innerHeight
                        );


                    rippleX =

                        uvX -
                        0.5;


                    rippleY =

                        uvY -
                        0.5;


                    rippleX *=

                        window.innerWidth /
                        window.innerHeight;


                    rippleY *=

                        1.55;


                    rippleStart =

                        performance.now()
                        *
                        0.001;


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


                    gl.uniform2f(

                        ripplePositionLocation,

                        rippleX,

                        rippleY

                    );


                    gl.uniform1f(

                        rippleStartLocation,

                        rippleStart

                    );


                    gl.uniform1f(

                        rippleStrengthLocation,

                        rippleStrength

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
