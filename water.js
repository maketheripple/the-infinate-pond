/* =========================================================
   THE INFINITE POND
   VERSION 6 — NATURAL SURFACE WATER
========================================================= */

const canvas =
    document.getElementById("waterCanvas");

const gl =
    canvas.getContext(
        "webgl",
        {
            alpha: false,
            antialias: false,
            powerPreference:
                "high-performance"
        }
    );


if (!gl) {

    console.error(
        "WebGL unavailable."
    );

}


/* =========================================================
   VERTEX SHADER
========================================================= */

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


/* =========================================================
   FRAGMENT SHADER
========================================================= */

const fragmentShaderSource = `

precision highp float;


/* =========================================================
   UNIFORMS
========================================================= */

uniform vec2 resolution;

uniform float time;

uniform float scroll;


/* =========================================================
   CONSTANTS
========================================================= */

#define PI 3.14159265359


/* =========================================================
   HASH
========================================================= */

float hash(
    vec2 p
) {

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


/* =========================================================
   SMOOTH NOISE
========================================================= */

float noise(
    vec2 p
) {

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


/* =========================================================
   MULTI-OCTAVE NOISE
========================================================= */

float fbm(
    vec2 p
) {

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


/* =========================================================
   DIRECTIONAL WAVE
========================================================= */

float directionalWave(

    vec2 p,

    vec2 direction,

    float frequency,

    float speed,

    float amplitude

) {

    float phase =
        dot(
            p,
            direction
        )
        *
        frequency
        +
        time *
        speed;


    return
        sin(phase)
        *
        amplitude;

}


/* =========================================================
   WATER HEIGHT
========================================================= */

float waterHeight(
    vec2 p
) {

    float result =
        0.0;


    /*
     * Large slow swells
     */

    result +=

        directionalWave(

            p,

            normalize(
                vec2(
                    1.0,
                    0.25
                )
            ),

            1.3,

            0.45,

            0.34

        );


    result +=

        directionalWave(

            p,

            normalize(
                vec2(
                    -0.35,
                    1.0
                )
            ),

            1.0,

            -0.31,

            0.28

        );


    /*
     * Crossing medium waves
     */

    result +=

        directionalWave(

            p,

            normalize(
                vec2(
                    0.7,
                    0.45
                )
            ),

            2.8,

            0.63,

            0.14

        );


    result +=

        directionalWave(

            p,

            normalize(
                vec2(
                    -0.8,
                    0.35
                )
            ),

            3.5,

            -0.48,

            0.10

        );


    /*
     * Irregular distortion
     */

    result +=

        (
            fbm(
                p *
                1.6
                +
                time *
                0.03
            )
            -
            0.5
        )
        *
        0.22;


    return result;

}


/* =========================================================
   SURFACE NORMAL
========================================================= */

vec3 surfaceNormal(
    vec2 p
) {

    float e =
        0.004;


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


/* =========================================================
   MOON REFLECTION
========================================================= */

float moonReflection(

    vec2 uv,

    vec3 normal

) {

    /*
     * Moon reflection is centered
     * near the middle of the pond.
     */

    float distanceFromCenter =

        abs(
            uv.x -
            0.50
        );


    /*
     * Reflection spreads as
     * it travels toward the viewer.
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
     * Reflection is strongest
     * on certain surface angles.
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
     * Very sharp highlights.
     */

    float sparkle =

        pow(
            angle,
            24.0
        );


    /*
     * Irregular breakup.
     */

    float breakup =

        fbm(

            vec2(

                uv.x * 12.0,

                uv.y * 7.0

            )
            +
            time * 0.08

        );


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


/* =========================================================
   MAIN IMAGE
========================================================= */

void main() {


    vec2 uv =

        gl_FragCoord.xy
        /
        resolution;


    /*
     * Aspect correction.
     */

    vec2 p =

        uv -
        0.5;


    p.x *=

        resolution.x /
        resolution.y;


    /*
     * Scroll through the
     * virtual water surface.
     */

    p.y +=

        scroll *
        0.00022;


    /*
     * Give the water a
     * slightly longer horizon.
     */

    p.y *=
        1.55;


    /*
     * Calculate surface.
     */

    vec3 normal =

        surfaceNormal(
            p
        );


    /*
     * Water base.
     */

    float surface =
        waterHeight(p);


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


    vec3 color =

        mix(

            deepWater,

            blueWater,

            variation

        );


    /*
     * Moon reflection.
     */

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


    /*
     * Very subtle ambient
     * moon illumination.
     */

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


    /*
     * Dark edges.
     */

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


    /*
     * Slight cinematic contrast.
     */

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


/* =========================================================
   SHADER COMPILATION
========================================================= */

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

            gl.getShaderInfoLog(
                shader
            )

        );


        return null;

    }


    return shader;

}


/* =========================================================
   PROGRAM
========================================================= */

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

        gl.getProgramInfoLog(
            program
        )

    );

}


gl.useProgram(
    program
);


/* =========================================================
   FULL SCREEN QUAD
========================================================= */

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


/* =========================================================
   POSITION ATTRIBUTE
========================================================= */

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


/* =========================================================
   UNIFORMS
========================================================= */

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


/* =========================================================
   RESIZE
========================================================= */

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


/* =========================================================
   RENDER LOOP
========================================================= */

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
