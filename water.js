/* =========================================================
   THE INFINITE POND
   VERSION 5 — WEBGL MOONLIT WATER
========================================================= */

const canvas =
    document.getElementById("waterCanvas");

const gl =
    canvas.getContext("webgl", {
        alpha: false,
        antialias: false,
        powerPreference: "high-performance"
    });


/* =========================================================
   WEBGL CHECK
========================================================= */

if (!gl) {

    console.error(
        "WebGL is not available."
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


/* Screen information */

uniform vec2 resolution;

uniform float time;

uniform float scroll;


/* ---------------------------------------------------------
   Hash
--------------------------------------------------------- */

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


/* ---------------------------------------------------------
   Smooth noise
--------------------------------------------------------- */

float noise(
    vec2 p
) {

    vec2 i =
        floor(p);

    vec2 f =
        fract(p);


    f =
        f *
        f *
        (
            3.0 -
            2.0 *
            f
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


/* ---------------------------------------------------------
   Fractal noise
--------------------------------------------------------- */

float fbm(
    vec2 p
) {

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


/* ---------------------------------------------------------
   Water height
--------------------------------------------------------- */

float water(
    vec2 p
) {

    float t =
        time;


    float large =
        fbm(
            p * 0.65
            +
            vec2(
                t * 0.035,
                t * 0.018
            )
        );


    float medium =
        fbm(
            p * 1.8
            -
            vec2(
                t * 0.055,
                t * 0.025
            )
        );


    float small =
        fbm(
            p * 4.0
            +
            vec2(
                t * 0.09,
                -t * 0.04
            )
        );


    return (

        large
        *
        0.55

        +

        medium
        *
        0.30

        +

        small
        *
        0.15

    );

}


/* ---------------------------------------------------------
   Surface normal
--------------------------------------------------------- */

vec3 getNormal(
    vec2 p
) {

    float e =
        0.004;


    float h =
        water(p);


    float hx =
        water(
            p +
            vec2(
                e,
                0.0
            )
        );


    float hy =
        water(
            p +
            vec2(
                0.0,
                e
            )
        );


    return normalize(

        vec3(

            h - hx,

            h - hy,

            e

        )

    );

}


/* ---------------------------------------------------------
   Main
--------------------------------------------------------- */

void main() {


    vec2 uv =
        gl_FragCoord.xy
        /
        resolution;


    /*
     * Convert the screen into
     * a water coordinate system.
     */

    vec2 p =
        uv;


    p.x *=
        resolution.x /
        resolution.y;


    /*
     * Slowly move the water
     * based on page scroll.
     */

    p.y +=
        scroll
        *
        0.00035;


    /*
     * Stretch the water vertically.
     */

    p.y *=
        1.8;


    /*
     * Water surface normal.
     */

    vec3 normal =
        getNormal(p);


    /*
     * Moon direction.
     */

    vec3 moonDirection =
        normalize(

            vec3(

                0.0,

                0.45,

                1.0

            )

        );


    /*
     * Reflection intensity.
     */

    float specular =
        pow(

            max(
                dot(
                    normal,
                    moonDirection
                ),
                0.0
            ),

            35.0

        );


    /*
     * Additional broad
     * moonlight.
     */

    float moonGlow =

        exp(

            -pow(
                (
                    uv.x -
                    0.50
                )
                /
                0.28,

                2.0

            )

        );


    /*
     * Break the reflection
     * into natural pieces.
     */

    float breakup =
        noise(
            p * 8.0
        );


    specular *=
        smoothstep(
            0.35,
            0.75,
            breakup
        );


    /*
     * Deep water colour.
     */

    vec3 deepWater =
        vec3(
            0.004,
            0.025,
            0.045
        );


    vec3 midWater =
        vec3(
            0.012,
            0.070,
            0.105
        );


    /*
     * Surface variation.
     */

    float surface =
        water(p);


    vec3 waterColor =
        mix(

            deepWater,

            midWater,

            surface

        );


    /*
     * Moonlight reflection.
     */

    vec3 moonlight =
        vec3(
            0.65,
            0.82,
            1.0
        )
        *
        specular
        *
        1.4;


    /*
     * Broad moon glow.
     */

    moonlight +=

        vec3(
            0.15,
            0.25,
            0.35
        )
        *
        moonGlow
        *
        0.18;


    /*
     * Final water.
     */

    vec3 color =
        waterColor
        +
        moonlight;


    /*
     * Darken edges.
     */

    float vignette =

        smoothstep(
            1.15,
            0.30,
            distance(
                uv,
                vec2(
                    0.5,
                    0.45
                )
            )
        );


    color *=
        vignette;


    gl_FragColor =
        vec4(
            color,
            1.0
        );

}

`;


/* =========================================================
   SHADER CREATION
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
   ATTRIBUTES
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

function resize() {

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
    resize
);


resize();


/* =========================================================
   RENDER
========================================================= */

function render(
    milliseconds
) {

    const time =
        milliseconds *
        0.001;


    gl.useProgram(
        program
    );


    gl.uniform2f(

        resolutionLocation,

        window.innerWidth,

        window.innerHeight

    );


    gl.uniform1f(

        timeLocation,

        time

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
        render
    );

}


requestAnimationFrame(
    render
);
