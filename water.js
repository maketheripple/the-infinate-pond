/* =========================================================
   THE RIPPLE WELL
   VERSION 1.0.2

   ORGANIC FLOATING RIPPLE REFINEMENT

   MAKE THE RIPPLE

   IMPORTANT CONCEPT:

   Floating Impact Ripples have NO visible text.

   They are intended to feel like organic objects/
   disturbances naturally existing within The Ripple Well.

   They become identified as an "Impact Ripple" only
   after the visitor interacts with one.
========================================================= */


/* =========================================================
   DOM REFERENCES
========================================================= */

const canvas =
    document.getElementById(
        "water-canvas"
    );

const ctx =
    canvas.getContext("2d");

const waterWindow =
    document.getElementById(
        "water-window"
    );

const rippleLayer =
    document.getElementById(
        "impact-ripples-layer"
    );

const makeRippleButton =
    document.getElementById(
        "make-ripple-button"
    );

const makeRippleModal =
    document.getElementById(
        "make-ripple-modal"
    );

const impactModal =
    document.getElementById(
        "impact-modal"
    );

const rippleForm =
    document.getElementById(
        "ripple-form"
    );

const starsContainer =
    document.getElementById(
        "stars"
    );


/* =========================================================
   WATER STATE
========================================================= */

let width = 0;
let height = 0;

let pixelRatio =
    Math.min(
        window.devicePixelRatio || 1,
        2
    );

let time = 0;

const temporaryRipples = [];

const MAX_TEMPORARY_RIPPLES = 18;


/* =========================================================
   APPROVED IMPACT RIPPLE DATA
========================================================= */

const impactRipples = [

    {
        id: 1,

        quote:
            "You are not alone, even when it feels like you are.",

        author:
            "A Friend",

        details:
            "Sometimes the smallest reminder can make a difficult day feel a little less heavy."
    },

    {
        id: 2,

        quote:
            "It's okay to take things one day at a time.",

        author:
            "Someone Who Understands",

        details:
            "You don't have to solve everything today. One small step is still a step forward."
    },

    {
        id: 3,

        quote:
            "Your story is still being written.",

        author:
            "A Ripple Maker",

        details:
            "Whatever chapter you're in right now, it doesn't have to be the final one."
    },

    {
        id: 4,

        quote:
            "Asking for help is not weakness.",

        author:
            "A Friend",

        details:
            "Sometimes the strongest thing we can do is allow someone else to stand beside us."
    },

    {
        id: 5,

        quote:
            "Small acts of kindness can travel farther than we know.",

        author:
            "Make the Ripple Community",

        details:
            "A kind word may become the ripple that reaches someone when they need it most."
    },

    {
        id: 6,

        quote:
            "You matter.",

        author:
            "Anonymous",

        details:
            "Simple words can carry enormous weight."
    },

    {
        id: 7,

        quote:
            "There is no shame in beginning again.",

        author:
            "A Ripple Maker",

        details:
            "Starting over is sometimes the bravest kind of progress."
    },

    {
        id: 8,

        quote:
            "Leave a little kindness wherever you go.",

        author:
            "Anonymous",

        details:
            "You never know whose day might be changed by something small."
    }

];


/* =========================================================
   RESIZE CANVAS
========================================================= */

function resizeCanvas() {

    const rect =
        waterWindow.getBoundingClientRect();

    width =
        Math.max(
            1,
            Math.floor(rect.width)
        );

    height =
        Math.max(
            1,
            Math.floor(rect.height)
        );

    pixelRatio =
        Math.min(
            window.devicePixelRatio || 1,
            2
        );

    canvas.width =
        Math.floor(
            width *
            pixelRatio
        );

    canvas.height =
        Math.floor(
            height *
            pixelRatio
        );

    canvas.style.width =
        `${width}px`;

    canvas.style.height =
        `${height}px`;

    ctx.setTransform(
        pixelRatio,
        0,
        0,
        pixelRatio,
        0,
        0
    );

    positionImpactRipples();
}


window.addEventListener(
    "resize",
    resizeCanvas
);


/* =========================================================
   NIGHT SKY STARS
========================================================= */

function createStars() {

    starsContainer.innerHTML = "";

    const starCount =
        Math.max(
            45,
            Math.min(
                115,
                Math.floor(
                    window.innerWidth / 12
                )
            )
        );

    for (
        let i = 0;
        i < starCount;
        i++
    ) {

        const star =
            document.createElement(
                "div"
            );

        star.className =
            "star";

        const size =
            Math.random() < 0.84
                ? Math.random() * 1.8 + 0.5
                : Math.random() * 3 + 1.5;

        const opacity =
            Math.random() * 0.55 + 0.25;

        const glow =
            Math.random() * 7 + 1;

        const duration =
            Math.random() * 5 + 3;

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

        star.style.animationDelay =
            `${Math.random() * duration}s`;

        starsContainer.appendChild(
            star
        );
    }
}


createStars();


/* =========================================================
   TEMPORARY WATER RIPPLE
========================================================= */

function createTemporaryRipple(
    x,
    y
) {

    if (
        temporaryRipples.length >=
        MAX_TEMPORARY_RIPPLES
    ) {

        temporaryRipples.shift();
    }

    temporaryRipples.push({

        x,
        y,

        radius: 3,

        strength: 1,

        life: 1,

        speed:
            0.9 +
            Math.random() * 0.45,

        width:
            1.0 +
            Math.random() * 0.8
    });
}


/* =========================================================
   WATER BACKGROUND
========================================================= */

function drawWaterBackground() {

    const gradient =
        ctx.createLinearGradient(
            0,
            0,
            0,
            height
        );

    gradient.addColorStop(
        0,
        "#071c28"
    );

    gradient.addColorStop(
        0.22,
        "#061923"
    );

    gradient.addColorStop(
        0.55,
        "#03121b"
    );

    gradient.addColorStop(
        1,
        "#01090f"
    );

    ctx.fillStyle =
        gradient;

    ctx.fillRect(
        0,
        0,
        width,
        height
    );
}


/* =========================================================
   NATURAL WATER MOVEMENT
========================================================= */

function drawNaturalWater() {

    const horizonHeight =
        Math.min(
            115,
            height * 0.22
        );

    for (
        let band = 0;
        band < 65;
        band++
    ) {

        const normalized =
            band / 65;

        const y =
            horizonHeight +
            normalized *
            (height - horizonHeight);

        const amplitude =
            1.1 +
            normalized * 5.5;

        const frequency =
            0.008 +
            normalized * 0.011;

        const phase =
            time *
            (
                0.0007 +
                normalized * 0.0012
            );

        ctx.beginPath();

        for (
            let x = 0;
            x <= width;
            x += 12
        ) {

            const wave =
                Math.sin(
                    x * frequency +
                    phase * 7 +
                    normalized * 4
                ) *
                amplitude;

            const wave2 =
                Math.sin(
                    x *
                    frequency *
                    2.2 -
                    phase * 4
                ) *
                amplitude *
                0.28;

            const yy =
                y +
                wave +
                wave2;

            if (
                x === 0
            ) {

                ctx.moveTo(
                    x,
                    yy
                );

            } else {

                ctx.lineTo(
                    x,
                    yy
                );
            }
        }

        ctx.strokeStyle =
            `rgba(
                99,
                174,
                199,
                ${0.015 + normalized * 0.025}
            )`;

        ctx.lineWidth =
            0.6 +
            normalized * 0.55;

        ctx.stroke();
    }
}


/* =========================================================
   MOONLIGHT REFLECTION
========================================================= */

function drawMoonlightReflection() {

    const centerX =
        width * 0.5;

    const horizonY =
        Math.min(
            95,
            height * 0.16
        );

    for (
        let i = 0;
        i < 75;
        i++
    ) {

        const depth =
            i / 75;

        const y =
            horizonY +
            depth *
            Math.min(
                height * 0.72,
                620
            );

        const widthAtDepth =
            18 +
            depth *
            depth *
            330;

        const waveOffset =
            Math.sin(
                time * 0.001 +
                i * 0.17
            ) *
            (
                3 +
                depth * 11
            );

        const left =
            centerX -
            widthAtDepth / 2 +
            waveOffset;

        const right =
            centerX +
            widthAtDepth / 2 +
            waveOffset;

        const fragments =
            4 +
            Math.floor(
                depth * 7
            );

        for (
            let f = 0;
            f < fragments;
            f++
        ) {

            const fragmentWidth =
                widthAtDepth /
                fragments;

            const startX =
                left +
                f *
                fragmentWidth;

            const gap =
                Math.random() *
                fragmentWidth *
                0.55;

            const endX =
                Math.min(
                    right,
                    startX +
                    fragmentWidth *
                    (
                        0.35 +
                        Math.random() * 0.5
                    )
                );

            const alpha =
                (1 - depth) *
                0.055 +
                0.006;

            ctx.beginPath();

            ctx.moveTo(
                startX + gap,
                y
            );

            ctx.lineTo(
                endX,
                y
            );

            ctx.strokeStyle =
                `rgba(
                    206,
                    244,
                    255,
                    ${alpha}
                )`;

            ctx.lineWidth =
                0.7 +
                (1 - depth) * 1.4;

            ctx.stroke();
        }
    }

    const glow =
        ctx.createRadialGradient(
            centerX,
            horizonY,
            4,
            centerX,
            horizonY,
            Math.min(
                width * 0.34,
                340
            )
        );

    glow.addColorStop(
        0,
        "rgba(180,235,250,0.13)"
    );

    glow.addColorStop(
        0.35,
        "rgba(100,190,220,0.045)"
    );

    glow.addColorStop(
        1,
        "rgba(0,0,0,0)"
    );

    ctx.fillStyle =
        glow;

    ctx.fillRect(
        centerX - 360,
        horizonY - 40,
        720,
        500
    );
}


/* =========================================================
   TEMPORARY RIPPLE DRAWING
========================================================= */

function drawTemporaryRipples() {

    for (
        let i =
            temporaryRipples.length - 1;
        i >= 0;
        i--
    ) {

        const ripple =
            temporaryRipples[i];

        ripple.radius +=
            ripple.speed;

        ripple.life -=
            0.0075;

        if (
            ripple.life <= 0
        ) {

            temporaryRipples.splice(
                i,
                1
            );

            continue;
        }


        /* Primary ripple */

        ctx.beginPath();

        ctx.ellipse(

            ripple.x,
            ripple.y,

            ripple.radius *
                ripple.width,

            ripple.radius *
                0.34,

            0,

            0,
            Math.PI * 2
        );

        ctx.strokeStyle =
            `rgba(
                157,
                225,
                243,
                ${0.24 * ripple.life}
            )`;

        ctx.lineWidth =
            1.2;

        ctx.stroke();


        /*
         * Extremely faint outer disturbance.
         *
         * This should never look like a second
         * obvious ripple.
         */

        ctx.beginPath();

        ctx.ellipse(

            ripple.x,
            ripple.y,

            ripple.radius * 1.7,

            ripple.radius * 0.58,

            0,

            0,
            Math.PI * 2
        );

        ctx.strokeStyle =
            `rgba(
                118,
                199,
                221,
                ${0.035 * ripple.life}
            )`;

        ctx.lineWidth =
            0.7;

        ctx.stroke();
    }
}


/* =========================================================
   IMPACT RIPPLE REACTION
========================================================= */

function gentlyDisturbImpactRipples() {

    const elements =
        document.querySelectorAll(
            ".impact-ripple"
        );

    elements.forEach(
        (
            element,
            index
        ) => {

            const wave =
                Math.sin(
                    time * 0.0012 +
                    index * 1.7
                );

            const x =
                Math.sin(
                    time * 0.00028 +
                    index * 2.1
                ) * 5;

            const y =
                wave * 3;

            const rotation =
                parseFloat(
                    element.dataset.rotation ||
                    "0"
                );

            element.style.transform =
                `translate(
                    calc(-50% + ${x}px),
                    calc(-50% + ${y}px)
                )
                rotate(${rotation}deg)
                scale(
                    var(--scale, 1)
                )`;
        }
    );
}


/* =========================================================
   ANIMATION LOOP
========================================================= */

function animate() {

    time += 16.67;

    drawWaterBackground();

    drawMoonlightReflection();

    drawNaturalWater();

    drawTemporaryRipples();

    gentlyDisturbImpactRipples();

    requestAnimationFrame(
        animate
    );
}


/* =========================================================
   CREATE ORGANIC IMPACT RIPPLE
========================================================= */

function createImpactRippleElement(
    ripple,
    index
) {

    const element =
        document.createElement(
            "div"
        );

    element.className =
        "impact-ripple";

    element.dataset.id =
        ripple.id;


    /*
     * Each Ripple gets its own personality.
     */

    const rotation =
        -22 +
        Math.random() * 44;

    const secondaryRotation =
        -12 +
        Math.random() * 24;

    const floatTime =
        5 +
        Math.random() * 5;


    element.dataset.rotation =
        rotation;

    element.style.setProperty(
        "--rotation",
        `${rotation}deg`
    );

    element.style.setProperty(
        "--secondary-rotation",
        `${secondaryRotation}deg`
    );

    element.style.setProperty(
        "--float-time",
        `${floatTime}s`
    );


    /*
     * Slight size variation.
     */

    const scale =
        0.78 +
        Math.random() * 0.42;

    element.style.setProperty(
        "--scale",
        scale
    );


    /*
     * Organic shape variation.

     * We deliberately generate four different
     * border-radius values for each Ripple.
     */

    const radiusA =
        45 +
        Math.random() * 20;

    const radiusB =
        35 +
        Math.random() * 25;

    const radiusC =
        50 +
        Math.random() * 18;

    const radiusD =
        40 +
        Math.random() * 25;

    const radiusE =
        44 +
        Math.random() * 20;

    const radiusF =
        35 +
        Math.random() * 25;

    element.style.borderRadius =
        `${radiusA}% ${radiusB}%
         ${radiusC}% ${radiusD}%
         /
         ${radiusE}% ${radiusF}%
         ${100 - radiusE}% ${100 - radiusF}%`;


    /*
     * Content container.

     * Currently empty.

     * Future sponsor/company logos can be inserted
     * here without redesigning the object.
     */

    const content =
        document.createElement(
            "div"
        );

    content.className =
        "impact-ripple-content";

    element.appendChild(
        content
    );


    /*
     * Clicking the organic object reveals
     * the complete message.
     */

    element.addEventListener(
        "click",
        function(event) {

            event.stopPropagation();

            showImpactRipple(
                ripple
            );
        }
    );


    rippleLayer.appendChild(
        element
    );

    return element;
}


/* =========================================================
   POSITION IMPACT RIPPLES
========================================================= */

function positionImpactRipples() {

    if (
        !rippleLayer
    ) {
        return;
    }

    const elements =
        document.querySelectorAll(
            ".impact-ripple"
        );


    /*
     * Positions are deliberately spread out
     * to create the feeling of depth.
     */

    const positions = [

        [17, 25],

        [73, 20],

        [42, 37],

        [83, 44],

        [23, 53],

        [61, 59],

        [36, 70],

        [76, 76]

    ];


    elements.forEach(
        (
            element,
            index
        ) => {

            const position =
                positions[
                    index %
                    positions.length
                ];

            element.style.left =
                `${position[0]}%`;

            element.style.top =
                `${position[1]}%`;
        }
    );
}


/* =========================================================
   BUILD IMPACT RIPPLE FIELD
========================================================= */

function buildImpactRippleField() {

    rippleLayer.innerHTML = "";

    impactRipples.forEach(
        (
            ripple,
            index
        ) => {

            createImpactRippleElement(
                ripple,
                index
            );
        }
    );

    positionImpactRipples();
}


/* =========================================================
   SHOW IMPACT RIPPLE
========================================================= */

function showImpactRipple(
    ripple
) {

    const quote =
        document.getElementById(
            "impact-quote"
        );

    const details =
        document.getElementById(
            "impact-details"
        );


    quote.textContent =
        `"${ripple.quote}"`;


    details.innerHTML =
        `
            <strong>
                ${escapeHtml(
                    ripple.author
                )}
            </strong>

            <br><br>

            ${escapeHtml(
                ripple.details
            )}
        `;


    openModal(
        impactModal
    );
}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHtml(
    value
) {

    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );
}


/* =========================================================
   MODALS
========================================================= */

function openModal(
    modal
) {

    modal.classList.add(
        "open"
    );

    modal.setAttribute(
        "aria-hidden",
        "false"
    );
}


function closeModal(
    modal
) {

    modal.classList.remove(
        "open"
    );

    modal.setAttribute(
        "aria-hidden",
        "true"
    );
}


document.querySelectorAll(
    "[data-close-modal]"
).forEach(
    button => {

        button.addEventListener(
            "click",
            function() {

                const modal =
                    button.closest(
                        ".modal-overlay"
                    );

                closeModal(
                    modal
                );
            }
        );
    }
);


/* =========================================================
   MAKE A RIPPLE BUTTON
========================================================= */

makeRippleButton.addEventListener(
    "click",
    function() {

        openModal(
            makeRippleModal
        );

        setTimeout(
            () => {

                const field =
                    document.getElementById(
                        "ripple-message"
                    );

                if (field) {
                    field.focus();
                }

            },
            350
        );
    }
);


/* =========================================================
   CLICK OUTSIDE MODAL
========================================================= */

document.querySelectorAll(
    ".modal-overlay"
).forEach(
    overlay => {

        overlay.addEventListener(
            "click",
            function(event) {

                if (
                    event.target === overlay
                ) {

                    closeModal(
                        overlay
                    );
                }
            }
        );
    }
);


/* =========================================================
   ESCAPE KEY
========================================================= */

document.addEventListener(
    "keydown",
    function(event) {

        if (
            event.key === "Escape"
        ) {

            document.querySelectorAll(
                ".modal-overlay.open"
            ).forEach(
                modal => {

                    closeModal(
                        modal
                    );
                }
            );
        }
    }
);


/* =========================================================
   WATER CLICK / TAP
========================================================= */

canvas.addEventListener(
    "pointerdown",
    function(event) {

        const rect =
            canvas.getBoundingClientRect();

        const x =
            event.clientX -
            rect.left;

        const y =
            event.clientY -
            rect.top;


        /*
         * Clicking the water creates ONLY
         * a temporary visual ripple.
         *
         * It does NOT open the submission window.
         */

        createTemporaryRipple(
            x,
            y
        );
    }
);


/* =========================================================
   FORM SUBMISSION
========================================================= */

rippleForm.addEventListener(
    "submit",
    handleRippleSubmission
);


function handleRippleSubmission(
    event
) {

    event.preventDefault();

    const message =
        document
            .getElementById(
                "ripple-message"
            )
            .value
            .trim();


    if (
        !message
    ) {
        return;
    }


    /*
     * At this stage submissions are only
     * acknowledged locally.
     *
     * They do NOT automatically become
     * Impact Ripples.
     *
     * The future moderation system will
     * determine what becomes visible.
     */

    rippleForm.innerHTML =
        `
            <div
                style="
                    text-align:center;
                    padding:25px 5px;
                "
            >

                <div
                    style="
                        font-size:46px;
                        margin-bottom:14px;
                    "
                >
                    🌊
                </div>


                <h3
                    style="
                        font-weight:400;
                        font-size:25px;
                        margin:0 0 12px;
                    "
                >
                    Your Ripple Has Been Shared
                </h3>


                <p
                    style="
                        color:rgba(
                            211,
                            237,
                            245,
                            0.75
                        );
                        line-height:1.7;
                        margin:0;
                    "
                >

                    Thank you for adding
                    your voice to
                    The Ripple Well.

                    <br><br>

                    Submissions are reviewed
                    before they can become
                    an <strong>Impact Ripple</strong>.

                </p>


                <button
                    type="button"
                    class="modal-button submit"
                    style="margin-top:25px;"
                    id="submission-done"
                >
                    Return to the Well
                </button>

            </div>
        `;


    document
        .getElementById(
            "submission-done"
        )
        .addEventListener(
            "click",
            function() {

                closeModal(
                    makeRippleModal
                );

                setTimeout(
                    restoreRippleForm,
                    350
                );
            }
        );
}


/* =========================================================
   RESTORE SUBMISSION FORM
========================================================= */

function restoreRippleForm() {

    rippleForm.innerHTML =
        `
            <label for="ripple-message">
                Your Ripple
            </label>


            <textarea
                id="ripple-message"
                name="message"
                maxlength="500"
                required
                placeholder="What would you like someone to find in The Ripple Well?"
            ></textarea>


            <label for="ripple-name">
                Name or Display Name (Optional)
            </label>


            <input
                id="ripple-name"
                name="name"
                type="text"
                maxlength="80"
                placeholder="How would you like to be identified?"
            >


            <div class="modal-actions">

                <button
                    class="modal-button cancel"
                    type="button"
                    data-close-modal
                >
                    Maybe Later
                </button>


                <button
                    class="modal-button submit"
                    type="submit"
                >
                    Submit Ripple
                </button>

            </div>
        `;


    rippleForm.addEventListener(
        "submit",
        handleRippleSubmission
    );


    rippleForm
        .querySelectorAll(
            "[data-close-modal]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    function() {

                        closeModal(
                            makeRippleModal
                        );
                    }
                );
            }
        );
}


/* =========================================================
   INITIALIZATION
========================================================= */

resizeCanvas();

buildImpactRippleField();

animate();


/* =========================================================
   VERSION 1.0.2 NOTES

   ✔ Corrected GitHub logo path:
     images/Make the Ripple Large Logo.png

   ✔ Floating Ripples contain NO TEXT

   ✔ Floating Ripples are organic/oblong

   ✔ Each Ripple has:
       - different rotation
       - different shape
       - different size
       - different floating motion

   ✔ Hover reveals interactivity

   ✔ Click opens the full message

   ✔ "Impact Ripple" terminology appears
     inside the opened message only

   ✔ Water clicks create temporary ripples

   ✔ Water clicks do NOT open submission

   ✔ Make a Ripple button opens submission

   ✔ Submission does NOT automatically
     become an Impact Ripple

   ✔ Empty content area reserved for
     future company/supporter logos

   FUTURE:

   - True water displacement
   - Deeper diving/scrolling effect
   - Floating physics
   - Pop-up quotes
   - Company logos
   - Sponsor levels
   - Subscription expiration
   - Moderation system
   - Database
========================================================= */
