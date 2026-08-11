/* =========================================================
   THE INFINITE POND
   VERSION 10.8 — ANCHORED PERSPECTIVE REFLECTION
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
        console.error("The Infinite Pond: WebGL unavailable.");
    } else {

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
            document.querySelector(".stationary-banner");


        /* =================================================
           REFLECTION SOURCE
        ================================================= */

        const reflectionCanvas =
            document.createElement("canvas");

        reflectionCanvas.width = 1024;
        reflectionCanvas.height = 768;

        const reflectionContext =
            reflectionCanvas.getContext("2d");

        let reflectionTexture = null;
        let reflectionDirty = true;

        let reflectionTop = 0.62;
        let reflectionBottom = 1.0;


        /* =================================================
           TRACKED TEXT
        ================================================= */

        function drawTrackedText(
            context,
            text,
            x,
            y,
            letterSpacing
        ) {

            if (!text) return;

            if (!isFinite(letterSpacing)) {
                letterSpacing = 0;
            }

            let totalWidth = 0;

            for (let i = 0; i < text.length; i++) {
                totalWidth += context.measureText(text[i]).width;

                if (i < text.length - 1) {
                    totalWidth += letterSpacing;
                }
            }

            let drawX = x - totalWidth * 0.5;

            for (let i = 0; i < text.length; i++) {

                const character = text[i];

                context.fillText(
                    character,
                    drawX,
                    y
                );

                drawX +=
                    context.measureText(character).width +
                    letterSpacing;
            }
        }


        /* =================================================
           DRAW HTML TEXT INTO REFLECTION
        ================================================= */

        function drawTextElement(
            context,
            element,
            scaleX,
            scaleY
        ) {

            if (!element) return;

            const rect =
                element.getBoundingClientRect();

            if (
                rect.width <= 0 ||
                rect.height <= 0
            ) {
                return;
            }

            const style =
                window.getComputedStyle(element);

            const fontSize =
                parseFloat(style.fontSize);

            if (!fontSize) return;

            const text =
                element.textContent.trim();

            if (!text) return;

            const letterSpacing =
                parseFloat(style.letterSpacing);

            context.save();

            context.font =
                `${style.fontWeight} ${fontSize * scaleY}px ${style.fontFamily}`;

            context.fillStyle =
                style.color;

            context.textAlign = "left";
            context.textBaseline = "alphabetic";

            context.shadowColor =
                "rgba(150,220,255,0.40)";

            context.shadowBlur = 14;

            const centerX =
                (rect.left + rect.width * 0.5) *
                scaleX;

            const baselineY =
                (rect.top + rect.height - fontSize * 0.12) *
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
           UPDATE REFLECTION ANCHOR
        ================================================= */

        function updateReflectionPosition() {

            const height = window.innerHeight;

            if (height <= 0) return;

            let anchor =
                height * 0.62;

            if (stationaryBanner) {

                const rect =
                    stationaryBanner.getBoundingClientRect();

                if (rect.height > 0) {
                    anchor = rect.bottom;
                }
            }

            /*
               This is the important anchor.

               The top of the reflection is tied directly
               to the bottom of the stationary banner.
            */

            reflectionTop =
                Math.max(
                    0.0,
                    Math.min(
                        1.0,
                        anchor / height
                    )
                );

            reflectionBottom = 1.0;
        }


        /* =================================================
           BUILD REFLECTION SOURCE
        ================================================= */

        function updateReflectionSource() {

            if (!reflectionContext) return;

            const width = window.innerWidth;
            const height = window.innerHeight;

            if (width <= 0 || height <= 0) return;

            updateReflectionPosition();

            const scaleX =
                reflectionCanvas.width / width;

            const scaleY =
                reflectionCanvas.height / height;

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

                reflectionContext.globalAlpha = 1.0;

                reflectionContext.shadowColor =
                    "rgba(120,210,240,0.42)";

                reflectionContext.shadowBlur = 22;

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
               WORDING
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
                gl_Position = vec4(position, 0.0, 1.0);
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

            uniform sampler2D bannerTexture;

            uniform float reflectionTop;
            uniform float reflectionBottom;

            uniform vec2 ripplePositions[MAX_RIPPLES];
            uniform float rippleStarts[MAX_RIPPLES];
            uniform float rippleStrengths[MAX_RIPPLES];


            float hash(vec2 p) {
                return fract(
                    sin(
                        dot(
                            p,
                            vec2(127.1,311.7)
                        )
                    ) * 43758.5453123
                );
            }


            float noise(vec2 p) {

                vec2 i = floor(p);
                vec2 f = fract(p);

                f = f * f * (3.0 - 2.0 * f);

                float a = hash(i);
                float b = hash(i + vec2(1.0,0.0));
                float c = hash(i + vec2(0.0,1.0));
                float d = hash(i + vec2(1.0,1.0));

                return mix(
                    mix(a,b,f.x),
                    mix(c,d,f.x),
                    f.y
                );
            }


            float fbm(vec2 p) {

                float value = 0.0;
                float amplitude = 0.5;

                for (int i = 0; i < 5; i++) {

                    value += noise(p) * amplitude;

                    p *= 2.0;
                    amplitude *= 0.5;
                }

                return value;
            }


            float waterHeight(vec2 p) {

                float large =
                    sin(
                        dot(
                            p,
                            normalize(vec2(1.0,0.18))
                        ) * 0.72 +
                        time * 0.055
                    ) * 0.055;

                large +=
                    sin(
                        dot(
                            p,
                            normalize(vec2(-0.32,1.0))
                        ) * 0.58 -
                        time * 0.042
                    ) * 0.035;

                float small =
                    sin(
                        dot(
                            p,
                            normalize(vec2(0.35,1.0))
                        ) * 2.8 +
                        time * 0.18
                    ) * 0.012;

                small +=
                    sin(
                        dot(
                            p,
                            normalize(vec2(-0.72,0.38))
                        ) * 3.6 -
                        time * 0.14
                    ) * 0.008;

                vec2 drift =
                    vec2(
                        time * 0.004,
                        -time * 0.003
                    );

                float organic =
                    (
                        fbm(p * 0.48 + drift) -
                        0.5
                    ) * 0.035;

                float natural =
                    (
                        fbm(
                            p * 0.36 +
                            vec2(
                                time * 0.0025,
                                -time * 0.0018
                            )
                        ) - 0.5
                    ) * 0.060;

                float movement =
                    (
                        fbm(
                            p * 0.30 +
                            vec2(
                                time * 0.006,
                                -time * 0.004
                            )
                        ) - 0.5
                    ) * 0.018;

                float ripple = 0.0;

                for (int i = 0; i < MAX_RIPPLES; i++) {

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

                            float radius =
                                0.055 +
                                elapsed * 0.045;

                            float shape =
                                exp(
                                    -pow(
                                        d / radius,
                                        2.0
                                    )
                                );

                            float wave =
                                cos(
                                    d * 42.0 -
                                    elapsed * 7.0
                                );

                            ripple +=
                                shape *
                                wave *
                                exp(-elapsed * 1.35) *
                                strength *
                                -0.075;
                        }
                    }
                }

                return
                    large +
                    small +
                    organic +
                    natural +
                    movement +
                    ripple;
            }


            vec3 surfaceNormal(vec2 p) {

                float e = 0.0025;

                float center =
                    waterHeight(p);

                float x =
                    waterHeight(
                        p + vec2(e,0.0)
                    );

                float y =
                    waterHeight(
                        p + vec2(0.0,e)
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
               ANCHORED PYRAMID REFLECTION
            ================================================= */

            vec3 bannerReflection(
                vec2 uv,
                vec3 normal
            ) {

                float screenY =
                    1.0 - uv.y;

                float depth =
                    (
                        screenY -
                        reflectionTop
                    ) /
                    max(
                        reflectionBottom -
                        reflectionTop,
                        0.001
                    );

                if (
                    depth <= 0.0 ||
                    depth > 1.0
                ) {
                    return vec3(0.0);
                }


                /*
                   Perspective deliberately starts narrow
                   at the banner and expands toward the viewer.
                */

                float perspective =
                    smoothstep(
                        0.0,
                        1.0,
                        depth
                    );


                /*
                   Narrow near the distant banner.
                   Wide near the foreground.
                */

                float widthScale =
                    mix(
                        0.22,
                        1.12,
                        pow(
                            perspective,
                            0.70
                        )
                    );


                /*
                   The reflection source is vertically
                   compressed toward the logo/text area.
                */

                float sourceY =
                    mix(
                        0.61,
                        0.025,
                        perspective
                    );


                float distortion =
                    (
                        fbm(
                            vec2(
                                uv.x * 7.0,
                                depth * 12.0 +
                                time * 0.018
                            )
                        ) - 0.5
                    ) *
                    mix(
                        0.008,
                        0.050,
                        perspective
                    );


                float sourceX =
                    0.5 +
                    (
                        uv.x - 0.5
                    ) /
                    widthScale +
                    distortion;


                sourceX +=
                    normal.x * 0.075;


                sourceY +=
                    normal.y * 0.045;


                sourceX =
                    clamp(
                        sourceX,
                        0.001,
                        0.999
                    );

                sourceY =
                    clamp(
                        sourceY,
                        0.001,
                        0.999
                    );


                vec4 reflected =
                    texture2D(
                        bannerTexture,
                        vec2(
                            sourceX,
                            sourceY
                        )
                    );


                if (reflected.a <= 0.001) {
                    return vec3(0.0);
                }


                /*
                   Break the reflection into horizontal
                   pieces so it behaves like moonlight.
                */

                float breakup =
                    fbm(
                        vec2(
                            uv.x * 12.0,
                            depth * 24.0 +
                            time * 0.012
                        )
                    );


                float horizontalBreakup =
                    smoothstep(
                        0.24,
                        0.76,
                        breakup
                    );


                float wave =
                    sin(
                        depth * 190.0 +
                        time * 0.06 +
                        uv.x * 3.0
                    );


                float waveBreakup =
                    smoothstep(
                        -0.25,
                        0.70,
                        wave
                    );


                float fragmentation =
                    mix(
                        horizontalBreakup,
                        horizontalBreakup *
                        waveBreakup,
                        0.48
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


                float surfaceLight =
                    pow(facing,7.0) * 0.78 +
                    pow(
                        max(normal.z,0.0),
                        5.0
                    ) * 0.22;


                float foregroundBreakup =
                    mix(
                        1.0,
                        fragmentation,
                        smoothstep(
                            0.08,
                            0.88,
                            perspective
                        )
                    );


                float fade =
                    smoothstep(
                        0.0,
                        0.045,
                        perspective
                    ) *
                    (
                        1.0 -
                        smoothstep(
                            0.93,
                            1.0,
                            perspective
                        )
                    );


                float sideFade =
                    smoothstep(
                        0.0,
                        0.07,
                        sourceX
                    ) *
                    (
                        1.0 -
                        smoothstep(
                            0.93,
                            1.0,
                            sourceX
                        )
                    );


                float distanceFade =
                    mix(
                        1.0,
                        0.30,
                        perspective
                    );


                float alpha =
                    reflected.a *
                    foregroundBreakup *
                    surfaceLight *
                    fade *
                    sideFade *
                    distanceFade;


                vec3 moonlight =
                    reflected.rgb *
                    vec3(
                        0.70,
                        0.88,
                        1.0
                    );


                return
                    moonlight *
                    alpha *
                    1.90;
            }


            void main() {

                vec2 uv =
                    gl_FragCoord.xy /
                    resolution;

                vec2 p =
                    uv - 0.5;

                p.x *=
                    resolution.x /
                    resolution.y;

                p.y *= 1.55;


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
                    surface * 0.55 + 0.5;


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
                        max(normal.z,0.0),
                        7.0
                    );


                color +=
                    vec3(
                        0.012,
                        0.035,
                        0.055
                    ) *
                    highlight;


                /*
                   Anchored banner reflection.
                */

                color +=
                    bannerReflection(
                        uv,
                        normal
                    );


                /*
                   Subtle moonlit atmosphere.
                */

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
                                uv.x - 0.50
                            ) / 0.52,
                            2.0
                        )
                    );


                color +=
                    vec3(
                        0.010,
                        0.024,
                        0.040
                    ) *
                    upperLight *
                    centerLight;


                float vignette =
                    1.0 -
                    smoothstep(
                        0.30,
                        0.92,
                        distance(
                            uv,
                            vec2(0.5,0.43)
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
           SHADER CREATION
        ================================================= */

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
                    "The Infinite Pond shader error:",
                    gl.getShaderInfoLog(shader)
                );

                gl.deleteShader(shader);

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


        if (!vertexShader || !fragmentShader) {

            console.error(
                "The Infinite Pond: Shader creation failed."
            );

        } else {

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
                    "The Infinite Pond program error:",
                    gl.getProgramInfoLog(program)
                );

            } else {

                gl.useProgram(program);


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
                        -1,-1,
                         1,-1,
                        -1, 1,

                        -1, 1,
                         1,-1,
                         1, 1
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

                const reflectionTopLocation =
                    gl.getUniformLocation(
                        program,
                        "reflectionTop"
                    );

                const reflectionBottomLocation =
                    gl.getUniformLocation(
                        program,
                        "reflectionBottom"
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
                        0,0,0,0
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
                   CREATE RIPPLE
                ================================================= */

                function createRipple(
                    clientX,
                    clientY
                ) {

                    const rect =
                        canvas.getBoundingClientRect();

                    const localX =
                        clientX - rect.left;

                    const localY =
                        clientY - rect.top;

                    const uvX =
                        localX / rect.width;

                    const uvY =
                        localY / rect.height;

                    let rippleX =
                        uvX - 0.5;

                    let rippleY =
                        0.5 - uvY;

                    rippleX *=
                        rect.width / rect.height;

                    rippleY *= 1.55;

                    ripples.push({

                        x: rippleX,
                        y: rippleY,

                        start:
                            performance.now() *
                            0.001,

                        strength: 3.0
                    });


                    if (
                        ripples.length >
                        MAX_RIPPLES
                    ) {
                        ripples.shift();
                    }
                }


                /* =================================================
                   BANNER PROTECTION
                   DO NOT MODIFY — WORKING VERSION
                ================================================= */

                function pointIsInsideBanner(
                    clientX,
                    clientY
                ) {

                    if (!stationaryBanner) {
                        return false;
                    }

                    const rect =
                        stationaryBanner.getBoundingClientRect();

                    return (
                        clientX >= rect.left &&
                        clientX <= rect.right &&
                        clientY >= rect.top &&
                        clientY <= rect.bottom
                    );
                }


                /* =================================================
                   POINTER RIPPLE
                   WORKING BANNER PROTECTION
                ================================================= */

                canvas.addEventListener(
                    "pointerdown",
                    function(event) {

                        if (
                            pointIsInsideBanner(
                                event.clientX,
                                event.clientY
                            )
                        ) {
                            return;
                        }

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
                    false
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
                        window.innerWidth * ratio;

                    canvas.height =
                        window.innerHeight * ratio;

                    canvas.style.width =
                        window.innerWidth + "px";

                    canvas.style.height =
                        window.innerHeight + "px";

                    gl.viewport(
                        0,
                        0,
                        canvas.width,
                        canvas.height
                    );

                    reflectionDirty = true;

                    updateReflectionPosition();
                }


                window.addEventListener(
                    "resize",
                    resizeWater
                );

                resizeWater();


                /* =================================================
                   REFLECTION UPDATES
                ================================================= */

                if (logoElement) {

                    if (
                        logoElement.complete
                    ) {

                        reflectionDirty = true;

                    } else {

                        logoElement.addEventListener(
                            "load",
                            function() {
                                reflectionDirty = true;
                            }
                        );
                    }
                }


                if (window.ResizeObserver) {

                    const observer =
                        new ResizeObserver(
                            function() {

                                reflectionDirty = true;

                                updateReflectionPosition();
                            }
                        );


                    if (stationaryBanner) {
                        observer.observe(
                            stationaryBanner
                        );
                    }


                    const header =
                        document.querySelector(
                            ".pond-header"
                        );

                    if (header) {
                        observer.observe(header);
                    }
                }


                /* =================================================
                   RENDER LOOP
                ================================================= */

                function renderWater(
                    milliseconds
                ) {

                    const currentTime =
                        milliseconds * 0.001;

                    gl.useProgram(program);


                    if (reflectionDirty) {
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

                            positions[i * 2] = 0.0;
                            positions[i * 2 + 1] = 0.0;

                            starts[i] = -100.0;
                            strengths[i] = 0.0;
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
                        reflectionTopLocation,
                        reflectionTop
                    );

                    gl.uniform1f(
                        reflectionBottomLocation,
                        reflectionBottom
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
