/* =========================================================
   THE INFINITE POND
   VERSION 10.7 — ANCHORED BANNER + BANNER CLICK PROTECTION
========================================================= */

const canvas =
    document.getElementById("waterCanvas");

if (!canvas) {

    console.error(
        "The Infinite Pond: waterCanvas not found."
    );

} else {

    const gl =
        canvas.getContext(
            "webgl",
            {
                alpha: false,
                antialias: false,
                powerPreference: "high-performance"
            }
        );


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
           BANNER ELEMENTS
        ================================================= */

        const logoElement =
            document.getElementById("pondLogo");

        const presentedElement =
            document.getElementById("presented");

        const titleElement =
            document.getElementById("pondTitle");

        const subtitleElement =
            document.getElementById("pondSubtitle");

        const stationaryBanner =
            document.querySelector(
                ".stationary-banner"
            );

        const makeRippleButton =
            document.getElementById(
                "makeRippleButton"
            );


        /* =================================================
           OFF-SCREEN BANNER REFLECTION
        ================================================= */

        const reflectionCanvas =
            document.createElement("canvas");

        reflectionCanvas.width = 1024;
        reflectionCanvas.height = 768;

        const reflectionContext =
            reflectionCanvas.getContext("2d");

        let reflectionTexture = null;
        let reflectionDirty = true;


        /* =================================================
           DRAW TRACKED TEXT
        ================================================= */

        function drawTrackedText(
            context,
            text,
            x,
            y,
            letterSpacing
        ) {

            if (!text) {
                return;
            }

            if (
                !letterSpacing ||
                !isFinite(letterSpacing)
            ) {

                context.fillText(
                    text,
                    x,
                    y
                );

                return;
            }

            let totalWidth = 0;

            for (
                let i = 0;
                i < text.length;
                i++
            ) {

                totalWidth +=
                    context.measureText(
                        text[i]
                    ).width;

                if (
                    i <
                    text.length - 1
                ) {

                    totalWidth +=
                        letterSpacing;

                }

            }

            let drawX =
                x -
                totalWidth * 0.5;

            for (
                let i = 0;
                i < text.length;
                i++
            ) {

                const character =
                    text[i];

                context.fillText(
                    character,
                    drawX,
                    y
                );

                drawX +=
                    context.measureText(
                        character
                    ).width
                    +
                    letterSpacing;

            }

        }


        /* =================================================
           DRAW ACTUAL HTML TEXT
        ================================================= */

        function drawTextElement(
            context,
            element,
            scaleX,
            scaleY
        ) {

            if (!element) {
                return;
            }

            const rect =
                element.getBoundingClientRect();

            if (
                rect.width <= 0 ||
                rect.height <= 0
            ) {

                return;

            }

            const style =
                window.getComputedStyle(
                    element
                );

            const fontSize =
                parseFloat(
                    style.fontSize
                );

            if (!fontSize) {
                return;
            }

            const fontWeight =
                style.fontWeight;

            const fontFamily =
                style.fontFamily;

            const letterSpacing =
                parseFloat(
                    style.letterSpacing
                );

            const text =
                element.textContent.trim();

            if (!text) {
                return;
            }

            context.save();

            context.font =
                `${fontWeight} ${fontSize * scaleY}px ${fontFamily}`;

            context.fillStyle =
                style.color;

            context.textAlign =
                "left";

            context.textBaseline =
                "alphabetic";

            context.shadowColor =
                "rgba(120,210,240,0.35)";

            context.shadowBlur =
                12;

            const centerX =
                (
                    rect.left +
                    rect.width * 0.5
                )
                *
                scaleX;

            const baselineY =
                (
                    rect.top +
                    rect.height -
                    fontSize * 0.12
                )
                *
                scaleY;

            drawTrackedText(
                context,
                text,
                centerX,
                baselineY,
                (
                    isFinite(letterSpacing)
                        ? letterSpacing
                        : 0
                ) * scaleX
            );

            context.restore();

        }


        /* =================================================
           BUILD REFLECTION SOURCE
        ================================================= */

        function updateReflectionSource() {

            if (!reflectionContext) {
                return;
            }

            const viewportWidth =
                window.innerWidth;

            const viewportHeight =
                window.innerHeight;

            if (
                viewportWidth <= 0 ||
                viewportHeight <= 0
            ) {

                return;

            }

            const scaleX =
                reflectionCanvas.width /
                viewportWidth;

            const scaleY =
                reflectionCanvas.height /
                viewportHeight;

            reflectionContext.clearRect(
                0,
                0,
                reflectionCanvas.width,
                reflectionCanvas.height
            );


            /* ---------------------------------------------
               LOGO
            --------------------------------------------- */

            if (
                logoElement &&
                logoElement.complete &&
                logoElement.naturalWidth > 0
            ) {

                const rect =
                    logoElement.getBoundingClientRect();

                reflectionContext.save();

                reflectionContext.globalAlpha =
                    0.98;

                reflectionContext.shadowColor =
                    "rgba(120,210,240,0.38)";

                reflectionContext.shadowBlur =
                    20;

                reflectionContext.drawImage(
                    logoElement,
                    rect.left * scaleX,
                    rect.top * scaleY,
                    rect.width * scaleX,
                    rect.height * scaleY
                );

                reflectionContext.restore();

            }


            /* ---------------------------------------------
               BANNER WORDING
            --------------------------------------------- */

            drawTextElement(
                reflectionContext,
                presentedElement,
                scaleX,
                scaleY
            );

            drawTextElement(
                reflectionContext,
                titleElement,
                scaleX,
                scaleY
            );

            drawTextElement(
                reflectionContext,
                subtitleElement,
                scaleX,
                scaleY
            );

            reflectionDirty = false;

            if (reflectionTexture) {

                gl.bindTexture(
                    gl.TEXTURE_2D,
                    reflectionTexture
                );

                gl.pixelStorei(
                    gl.UNPACK_FLIP_Y_WEBGL,
                    false
                );

                gl.texImage2D(
                    gl.TEXTURE_2D,
                    0,
                    gl.RGBA,
                    gl.RGBA,
                    gl.UNSIGNED_BYTE,
                    reflectionCanvas
                );

            }

        }


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

            const int MAX_RIPPLES = 12;

            uniform vec2 resolution;
            uniform float time;
            uniform float scroll;
            uniform sampler2D bannerTexture;

            uniform vec2 ripplePositions[MAX_RIPPLES];
            uniform float rippleStarts[MAX_RIPPLES];
            uniform float rippleStrengths[MAX_RIPPLES];


            /* =============================================
               HASH
            ============================================== */

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


            /* =============================================
               NOISE
            ============================================== */

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


            /* =============================================
               FBM
            ============================================== */

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

                    p *= 2.0;

                    amplitude *= 0.5;

                }

                return value;

            }


            /* =============================================
               LARGE WATER MOTION
            ============================================== */

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
                    waveA * 0.055
                    +
                    waveB * 0.035;

            }


            /* =============================================
               SMALL WAVES
            ============================================== */

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
                    waveA * 0.012
                    +
                    waveB * 0.008;

            }


            /* =============================================
               ORGANIC MOTION
            ============================================== */

            float organicMotion(vec2 p) {

                vec2 drift =
                    vec2(
                        time * 0.004,
                        -time * 0.003
                    );

                float n =
                    fbm(
                        p * 0.48 +
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


            /* =============================================
               NATURAL WATER SURFACE
            ============================================== */

            float naturalWaterSurface(vec2 p) {

                vec2 slowDrift =
                    vec2(
                        time * 0.0025,
                        -time * 0.0018
                    );

                float broadA =
                    fbm(
                        p * 0.36 +
                        slowDrift
                    );

                float broadB =
                    fbm(
                        p * 0.68 -
                        slowDrift * 1.35
                    );

                float fine =
                    fbm(
                        p * 1.35 +
                        slowDrift * 0.65 +
                        vec2(
                            4.7,
                            8.2
                        )
                    );

                float surfaceVariation =
                    broadA * 0.58 +
                    broadB * 0.30 +
                    fine * 0.12;

                return
                    (
                        surfaceVariation -
                        0.5
                    )
                    *
                    0.060;

            }


            /* =============================================
               NATURAL WATER MOVEMENT
            ============================================== */

            float naturalWaterMovement(vec2 p) {

                vec2 movementDrift =
                    vec2(
                        time * 0.006,
                        -time * 0.004
                    );

                float broadA =
                    fbm(
                        p * 0.30 +
                        movementDrift
                    );

                float broadB =
                    fbm(
                        p * 0.52 -
                        movementDrift * 1.15
                    );

                float movement =
                    broadA * 0.68 +
                    broadB * 0.32;

                return
                    (
                        movement -
                        0.5
                    )
                    *
                    0.018;

            }


            /* =============================================
               IMPACT DISPLACEMENT
            ============================================== */

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

                    if (strength > 0.0) {

                        float elapsed =
                            max(
                                0.0,
                                time -
                                rippleStarts[i]
                            );

                        if (elapsed < 2.5) {

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
                                    d * 42.0 -
                                    elapsed * 7.0
                                );

                            float decay =
                                exp(
                                    -elapsed *
                                    1.35
                                );

                            field +=
                                impactShape *
                                impactWave *
                                decay *
                                strength *
                                -0.075;

                        }

                    }

                }

                return field;

            }


            /* =============================================
               TOTAL WATER HEIGHT
            ============================================== */

            float waterHeight(vec2 p) {

                return
                    largeWave(p)
                    +
                    smallWaves(p)
                    +
                    organicMotion(p)
                    +
                    naturalWaterMovement(p)
                    +
                    impactDisplacement(p);

            }


            /* =============================================
               SURFACE NORMAL
            ============================================== */

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


            /* =============================================
               MIRRORED BANNER REFLECTION
            ============================================== */

            vec3 getBannerReflection(
                vec2 uv,
                vec3 normal
            ) {

                float screenY =
                    1.0 -
                    uv.y;

                float horizon =
                    0.70;

                float depth =
                    (
                        screenY -
                        horizon
                    )
                    /
                    (1.0 - horizon);

                if (
                    depth <= 0.0 ||
                    depth > 1.0
                ) {

                    return vec3(0.0);

                }

                float perspective =
                    smoothstep(
                        0.0,
                        1.0,
                        depth
                    );

                float sourceCanvasY =
                    mix(
                        0.63,
                        0.025,
                        perspective
                    );

                float widthScale =
                    mix(
                        0.32,
                        1.05,
                        pow(
                            perspective,
                            0.72
                        )
                    );

                float distortionX =
                    (
                        fbm(
                            vec2(
                                uv.x * 7.0,
                                depth * 10.0 +
                                time * 0.018
                            )
                        )
                        -
                        0.5
                    )
                    *
                    mix(
                        0.012,
                        0.055,
                        perspective
                    );

                float distortionY =
                    (
                        fbm(
                            vec2(
                                uv.x * 5.0 + 4.2,
                                depth * 14.0 -
                                time * 0.014
                            )
                        )
                        -
                        0.5
                    )
                    *
                    0.028;

                float sourceX =
                    0.5 +
                    (
                        uv.x -
                        0.5
                    )
                    /
                    widthScale
                    +
                    distortionX;

                sourceX +=
                    normal.x *
                    0.065;

                sourceCanvasY +=
                    normal.y *
                    0.045
                    +
                    distortionY;

                sourceX =
                    clamp(
                        sourceX,
                        0.001,
                        0.999
                    );

                sourceCanvasY =
                    clamp(
                        sourceCanvasY,
                        0.001,
                        0.999
                    );

                vec2 reflectionUV =
                    vec2(
                        sourceX,
                        sourceCanvasY
                    );

                vec4 reflected =
                    texture2D(
                        bannerTexture,
                        reflectionUV
                    );

                if (
                    reflected.a <= 0.001
                ) {

                    return vec3(0.0);

                }

                float fragmentNoise =
                    fbm(
                        vec2(
                            uv.x * 11.0,
                            depth * 22.0 +
                            time * 0.012
                        )
                    );

                float wave =
                    sin(
                        depth * 185.0 +
                        time * 0.06 +
                        uv.x * 3.0
                    );

                float horizontalBreakup =
                    smoothstep(
                        0.20,
                        0.76,
                        fragmentNoise
                    );

                float waveBreakup =
                    smoothstep(
                        -0.20,
                        0.72,
                        wave
                    );

                float fragmentation =
                    mix(
                        horizontalBreakup,
                        horizontalBreakup *
                        waveBreakup,
                        0.50
                    );

                float facing =
                    max(
                        dot(
                            normal,
                            normalize(
                                vec3(
                                    0.0,
                                    0.42,
                                    1.0
                                )
                            )
                        ),
                        0.0
                    );

                float shimmer =
                    pow(
                        facing,
                        7.0
                    );

                float surfaceLight =
                    shimmer * 0.78
                    +
                    pow(
                        max(
                            normal.z,
                            0.0
                        ),
                        5.0
                    )
                    *
                    0.22;

                float distanceFade =
                    mix(
                        1.0,
                        0.34,
                        perspective
                    );

                float foregroundBreakup =
                    mix(
                        1.0,
                        fragmentation,
                        smoothstep(
                            0.10,
                            0.88,
                            perspective
                        )
                    );

                float verticalFade =
                    smoothstep(
                        0.0,
                        0.045,
                        perspective
                    )
                    *
                    (
                        1.0 -
                        smoothstep(
                            0.92,
                            1.0,
                            perspective
                        )
                    );

                float horizontalFade =
                    smoothstep(
                        0.0,
                        0.08,
                        sourceX
                    )
                    *
                    (
                        1.0 -
                        smoothstep(
                            0.92,
                            1.0,
                            sourceX
                        )
                    );

                float alpha =
                    reflected.a *
                    distanceFade *
                    foregroundBreakup *
                    surfaceLight *
                    verticalFade *
                    horizontalFade;

                vec3 moonlightColor =
                    reflected.rgb *
                    vec3(
                        0.70,
                        0.88,
                        1.0
                    );

                return
                    moonlightColor *
                    alpha *
                    1.85;

            }


            /* =============================================
               MAIN IMAGE
            ============================================== */

            void main() {

                vec2 uv =
                    gl_FragCoord.xy /
                    resolution;

                vec2 p =
                    uv -
                    0.5;

                p.x *=
                    resolution.x /
                    resolution.y;

                /*
                   Keep the water surface visually fixed
                   to the viewport while the page scrolls.
                */

                p.y +=
                    scroll *
                    0.00022;

                p.y *=
                    1.55;

                float surface =
                    waterHeight(p);

                vec3 normal =
                    surfaceNormal(p);

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
                    0.55 +
                    0.5;

                float naturalSurface =
                    naturalWaterSurface(p);

                variation +=
                    naturalSurface;

                float backgroundVariation =
                    fbm(
                        p * 0.42 +
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

                vec3 reflection =
                    getBannerReflection(
                        uv,
                        normal
                    );

                color +=
                    reflection;

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

                color =
                    pow(
                        color,
                        vec3(0.86)
                    );

                gl_FragColor =
                    vec4(
                        color,
                        1.0
                    );

            }

        `;


        /* =================================================
           SHADER COMPILATION
        ================================================= */

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
                    gl.getShaderInfoLog(shader)
                );

                gl.deleteShader(
                    shader
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
                    gl.getProgramInfoLog(program)
                );

            } else {

                gl.useProgram(
                    program
                );


                /* =================================================
                   FULL SCREEN QUAD
                ================================================= */

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


                /* =================================================
                   UNIFORMS
                ================================================= */

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

                const bannerTextureLocation =
                    gl.getUniformLocation(
                        program,
                        "bannerTexture"
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


                /* =================================================
                   REFLECTION TEXTURE
                ================================================= */

                reflectionTexture =
                    gl.createTexture();

                gl.activeTexture(
                    gl.TEXTURE0
                );

                gl.bindTexture(
                    gl.TEXTURE_2D,
                    reflectionTexture
                );

                gl.texParameteri(
                    gl.TEXTURE_2D,
                    gl.TEXTURE_MIN_FILTER,
                    gl.LINEAR
                );

                gl.texParameteri(
                    gl.TEXTURE_2D,
                    gl.TEXTURE_MAG_FILTER,
                    gl.LINEAR
                );

                gl.texParameteri(
                    gl.TEXTURE_2D,
                    gl.TEXTURE_WRAP_S,
                    gl.CLAMP_TO_EDGE
                );

                gl.texParameteri(
                    gl.TEXTURE_2D,
                    gl.TEXTURE_WRAP_T,
                    gl.CLAMP_TO_EDGE
                );

                gl.texImage2D(
                    gl.TEXTURE_2D,
                    0,
                    gl.RGBA,
                    1,
                    1,
                    0,
                    gl.RGBA,
                    gl.UNSIGNED_BYTE,
                    new Uint8Array([
                        0,
                        0,
                        0,
                        0
                    ])
                );

                gl.uniform1i(
                    bannerTextureLocation,
                    0
                );


                /* =================================================
                   RIPPLE STORAGE
                ================================================= */

                const ripples = [];


                /* =================================================
                   BANNER CLICK PROTECTION
                ================================================= */

                function isBannerArea(
                    clientX,
                    clientY
                ) {

                    /*
                       The entire stationary banner occupies
                       the upper 65vh of the viewport.

                       This keeps clicks on the logo, wording,
                       stars, night sky, and banner area from
                       becoming water ripples.
                    */

                    const bannerHeight =
                        window.innerHeight *
                        0.65;

                    if (
                        clientY >= 0 &&
                        clientY <= bannerHeight
                    ) {

                        return true;

                    }


                    /*
                       Extra protection for the button in case
                       its position ever changes independently
                       of the banner height.
                    */

                    if (
                        makeRippleButton
                    ) {

                        const buttonRect =
                            makeRippleButton.getBoundingClientRect();

                        if (
                            clientX >=
                                buttonRect.left &&
                            clientX <=
                                buttonRect.right &&
                            clientY >=
                                buttonRect.top &&
                            clientY <=
                                buttonRect.bottom
                        ) {

                            return true;

                        }

                    }


                    return false;

                }


                /* =================================================
                   CREATE RIPPLE
                ================================================= */

                function createRipple(
                    clientX,
                    clientY
                ) {

                    /*
                       Never create a ripple from the
                       fixed banner area.
                    */

                    if (
                        isBannerArea(
                            clientX,
                            clientY
                        )
                    ) {

                        return;

                    }

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
                        performance.now() *
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


                /* =================================================
                   POINTER RIPPLE
                ================================================= */

                window.addEventListener(
                    "pointerdown",
                    function(event) {

                        if (
                            event.button !== 0 &&
                            event.pointerType !== "touch"
                        ) {

                            return;

                        }

                        /*
                           Banner clicks are deliberately ignored.
                        */

                        if (
                            isBannerArea(
                                event.clientX,
                                event.clientY
                            )
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


                /* =================================================
                   RESIZE
                ================================================= */

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

                    reflectionDirty =
                        true;

                }


                window.addEventListener(
                    "resize",
                    resizeWater
                );

                resizeWater();


                /* =================================================
                   BANNER CHANGE DETECTION
                ================================================= */

                window.addEventListener(
                    "resize",
                    function() {

                        reflectionDirty =
                            true;

                    }
                );


                if (
                    logoElement
                ) {

                    if (
                        logoElement.complete
                    ) {

                        reflectionDirty =
                            true;

                    } else {

                        logoElement.addEventListener(
                            "load",
                            function() {

                                reflectionDirty =
                                    true;

                            }
                        );

                    }

                }


                if (
                    window.ResizeObserver
                ) {

                    const bannerObserver =
                        new ResizeObserver(
                            function() {

                                reflectionDirty =
                                    true;

                            }
                        );

                    const pondHeader =
                        document.querySelector(
                            ".pond-header"
                        );

                    if (
                        pondHeader
                    ) {

                        bannerObserver.observe(
                            pondHeader
                        );

                    }

                }


                /* =================================================
                   RENDER LOOP
                ================================================= */

                function renderWater(
                    milliseconds
                ) {

                    const currentTime =
                        milliseconds *
                        0.001;

                    gl.useProgram(
                        program
                    );

                    if (
                        reflectionDirty
                    ) {

                        updateReflectionSource();

                    }

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
                            MAX_RIPPLES * 2
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
                            i < ripples.length
                        ) {

                            positions[i * 2] =
                                ripples[i].x;

                            positions[i * 2 + 1] =
                                ripples[i].y;

                            starts[i] =
                                ripples[i].start;

                            strengths[i] =
                                ripples[i].strength;

                        } else {

                            positions[i * 2] =
                                0.0;

                            positions[i * 2 + 1] =
                                0.0;

                            starts[i] =
                                -100.0;

                            strengths[i] =
                                0.0;

                        }

                    }


                    gl.activeTexture(
                        gl.TEXTURE0
                    );

                    gl.bindTexture(
                        gl.TEXTURE_2D,
                        reflectionTexture
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
