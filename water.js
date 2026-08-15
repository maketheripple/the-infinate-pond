/* =========================================================
   THE RIPPLE WELL
   VERSION 3.0 — IMAGE WATER FOUNDATION

   WATER DESIGN
   - Water(1).png is the actual water surface.
   - This file does NOT generate a replacement water surface.
   - The canvas is transparent and exists only for interaction.
   - Clicks create small, subtle ripple rings on the image.
   - Ripple interaction is physically restricted to the water image.

   IMPACT RIPPLES
   - Temporarily disabled in the visual layer.
   - Approved Impact Ripple count is still read from Supabase so
     the lower banner can retain its live count.
   - No Impact Ripple objects are created or displayed.

   SUBMISSIONS
   - "Make a Ripple" opens the submission window.
   - Submissions are sent to Supabase with status = "pending".
   - Water clicks never open the submission window.
========================================================= */

(() => {
    "use strict";

    /* =====================================================
       ELEMENTS
    ===================================================== */

    const waterWindow =
        document.getElementById("water-window");

    const waterImage =
        document.getElementById("water-surface-image");

    const canvas =
        document.getElementById("water-canvas");

    const makeRippleButton =
        document.getElementById("make-ripple-button");

    const makeRippleModal =
        document.getElementById("make-ripple-modal");

    const impactModal =
        document.getElementById("impact-modal");

    const rippleForm =
        document.getElementById("ripple-form");

    const impactCount =
        document.getElementById("impact-count");

    const closeButtons =
        document.querySelectorAll("[data-close-modal]");


    if (!waterWindow || !waterImage || !canvas) {
        console.error(
            "The Ripple Well: water image or interaction canvas was not found."
        );
        return;
    }


    /* =====================================================
       TRANSPARENT 2D RIPPLE CANVAS
    ===================================================== */

    const ctx = canvas.getContext("2d", {
        alpha: true
    });

    if (!ctx) {
        console.error(
            "The Ripple Well: 2D canvas is not available."
        );
        return;
    }


    let width = 1;
    let height = 1;
    let dpr = 1;

    const ripples = [];

    const RIPPLE_DURATION = 2200;
    const MAX_RIPPLES_ON_SCREEN = 12;


    function resizeCanvas() {
        const rect =
            waterWindow.getBoundingClientRect();

        width = Math.max(1, rect.width);
        height = Math.max(1, rect.height);

        dpr = Math.min(
            window.devicePixelRatio || 1,
            2
        );

        canvas.width =
            Math.round(width * dpr);

        canvas.height =
            Math.round(height * dpr);

        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;

        ctx.setTransform(
            dpr,
            0,
            0,
            dpr,
            0,
            0
        );
    }


    function waitForWaterImage() {
        if (waterImage.complete) {
            resizeCanvas();
        } else {
            waterImage.addEventListener(
                "load",
                resizeCanvas,
                { once: true }
            );
        }
    }


    window.addEventListener(
        "resize",
        resizeCanvas,
        { passive: true }
    );


    if (typeof ResizeObserver !== "undefined") {
        const observer = new ResizeObserver(
            resizeCanvas
        );

        observer.observe(waterWindow);
    }


    waitForWaterImage();


    /* =====================================================
       CREATE SMALL CLICK RIPPLE

       The final footprint is deliberately small. The ripple
       expands horizontally more than vertically so it feels
       like a ring sitting on the surface of the lake.
    ===================================================== */

    function addRipple(clientX, clientY) {
        const rect =
            waterWindow.getBoundingClientRect();

        if (
            clientX < rect.left ||
            clientX > rect.right ||
            clientY < rect.top ||
            clientY > rect.bottom
        ) {
            return;
        }

        const x = clientX - rect.left;
        const y = clientY - rect.top;

        ripples.push({
            x,
            y,
            started: performance.now(),
            rotation:
                (Math.random() - 0.5) * 0.18,
            phase:
                Math.random() * Math.PI * 2
        });

        if (
            ripples.length >
            MAX_RIPPLES_ON_SCREEN
        ) {
            ripples.shift();
        }
    }


    /* =====================================================
       POINTER INTERACTION

       The listener is attached ONLY to the transparent canvas,
       which itself exists ONLY over the water image.
    ===================================================== */

    canvas.addEventListener(
        "pointerdown",
        event => {
            if (
                event.pointerType === "mouse" &&
                event.button !== 0
            ) {
                return;
            }

            addRipple(
                event.clientX,
                event.clientY
            );
        },
        { passive: true }
    );


    /* =====================================================
       RIPPLE RENDERING
    ===================================================== */

    function drawRipple(ripple, now) {
        const age =
            now - ripple.started;

        const progress =
            Math.min(
                1,
                age / RIPPLE_DURATION
            );

        if (progress >= 1) {
            return false;
        }

        /* Ease out gives the feeling of a disturbance spreading
           quickly at first and then settling into the lake. */
        const eased =
            1 - Math.pow(
                1 - progress,
                2.15
            );

        const fade =
            Math.pow(
                1 - progress,
                1.35
            );

        const maxRadiusX =
            Math.min(
                54,
                width * 0.075
            );

        const maxRadiusY =
            maxRadiusX * 0.54;

        ctx.save();

        ctx.translate(
            ripple.x,
            ripple.y
        );

        ctx.rotate(
            ripple.rotation
        );

        /* Three quiet rings create a more natural ripple than one
           perfect outline. */
        const ringData = [
            {
                scale: 0.46,
                alpha: 0.54,
                width: 1.0,
                delay: 0.00
            },
            {
                scale: 0.72,
                alpha: 0.36,
                width: 0.9,
                delay: 0.06
            },
            {
                scale: 1.00,
                alpha: 0.22,
                width: 0.8,
                delay: 0.12
            }
        ];

        for (const ring of ringData) {
            const ringProgress =
                Math.max(
                    0,
                    Math.min(
                        1,
                        (progress - ring.delay) /
                        (1 - ring.delay)
                    )
                );

            const radiusX =
                maxRadiusX *
                ring.scale *
                (0.16 + ringProgress * 0.84);

            const radiusY =
                maxRadiusY *
                ring.scale *
                (0.16 + ringProgress * 0.84);

            const wobble =
                Math.sin(
                    ripple.phase +
                    ringProgress * 4.2
                ) *
                0.025;

            ctx.beginPath();

            ctx.ellipse(
                0,
                0,
                radiusX,
                radiusY * (1 + wobble),
                0,
                0,
                Math.PI * 2
            );

            ctx.strokeStyle =
                `rgba(177, 231, 246, ${
                    ring.alpha * fade
                })`;

            ctx.lineWidth =
                ring.width;

            ctx.stroke();
        }

        /* A very subtle inner disturbance remains near the point
           of impact before disappearing. */
        const centerFade =
            Math.max(
                0,
                1 - progress * 5
            );

        if (centerFade > 0) {
            ctx.beginPath();

            ctx.arc(
                0,
                0,
                2.2 + progress * 2.2,
                0,
                Math.PI * 2
            );

            ctx.fillStyle =
                `rgba(202, 241, 250, ${
                    0.32 * centerFade
                })`;

            ctx.fill();
        }

        ctx.restore();

        return true;
    }


    function render() {
        ctx.clearRect(
            0,
            0,
            width,
            height
        );

        const now =
            performance.now();

        for (
            let i = ripples.length - 1;
            i >= 0;
            i--
        ) {
            if (
                !drawRipple(
                    ripples[i],
                    now
                )
            ) {
                ripples.splice(i, 1);
            }
        }

        requestAnimationFrame(render);
    }


    render();


    /* =====================================================
       MODAL HELPERS
    ===================================================== */

    function openModal(modal) {
        if (!modal) return;

        modal.classList.add("open");

        modal.setAttribute(
            "aria-hidden",
            "false"
        );

        document.body.style.overflow = "hidden";
    }


    function closeModal(modal) {
        if (!modal) return;

        modal.classList.remove("open");

        modal.setAttribute(
            "aria-hidden",
            "true"
        );

        if (
            !document.querySelector(
                ".modal-overlay.open"
            )
        ) {
            document.body.style.overflow = "";
        }
    }


    /* =====================================================
       MAKE A RIPPLE BUTTON
    ===================================================== */

    if (makeRippleButton) {
        makeRippleButton.addEventListener(
            "click",
            event => {
                event.preventDefault();
                event.stopPropagation();

                openModal(
                    makeRippleModal
                );
            }
        );
    }


    /* =====================================================
       CLOSE BUTTONS
    ===================================================== */

    closeButtons.forEach(
        button => {
            button.addEventListener(
                "click",
                () => {
                    closeModal(
                        button.closest(
                            ".modal-overlay"
                        )
                    );
                }
            );
        }
    );


    /* =====================================================
       CLICK OUTSIDE MODAL
    ===================================================== */

    document
        .querySelectorAll(".modal-overlay")
        .forEach(
            overlay => {
                overlay.addEventListener(
                    "click",
                    event => {
                        if (
                            event.target ===
                            overlay
                        ) {
                            closeModal(
                                overlay
                            );
                        }
                    }
                );
            }
        );


    /* =====================================================
       ESCAPE KEY
    ===================================================== */

    document.addEventListener(
        "keydown",
        event => {
            if (event.key !== "Escape") {
                return;
            }

            document
                .querySelectorAll(
                    ".modal-overlay.open"
                )
                .forEach(
                    closeModal
                );
        }
    );


    /* =====================================================
       SUPABASE CONFIGURATION
    ===================================================== */

    const SUPABASE_URL =
        "https://vazgkkrrjgoowwywamot.supabase.co";

    const SUPABASE_KEY =
        "sb_publishable_gf0gD7JmbBlm6jR07qYkIQ_YZN301F-";


    /* =====================================================
       VISITOR COUNTRY
    ===================================================== */

    function getVisitorCountry() {
        try {
            const language =
                navigator.language || "";

            const parts =
                language.split("-");

            if (parts.length < 2) {
                return "";
            }

            const code =
                parts[
                    parts.length - 1
                ].toUpperCase();

            const countryNames = {
                CA: "Canada",
                US: "United States",
                GB: "United Kingdom",
                AU: "Australia",
                NZ: "New Zealand",
                IE: "Ireland",
                FR: "France",
                DE: "Germany",
                ES: "Spain",
                IT: "Italy",
                NL: "Netherlands",
                BE: "Belgium",
                SE: "Sweden",
                NO: "Norway",
                DK: "Denmark",
                FI: "Finland",
                IN: "India",
                JP: "Japan",
                CN: "China",
                KR: "South Korea"
            };

            return (
                countryNames[code] ||
                code
            );

        } catch (error) {
            console.warn(
                "Could not determine visitor locale.",
                error
            );

            return "";
        }
    }


    /* =====================================================
       SUBMIT RIPPLE TO SUPABASE
    ===================================================== */

    async function submitRippleToSupabase(
        message,
        name,
        region,
        country
    ) {
        const submission = {
            message:
                message.trim(),

            name:
                name
                    ? name.trim()
                    : "",

            region:
                region
                    ? region.trim()
                    : "",

            country:
                country &&
                country.trim()
                    ? country.trim()
                    : getVisitorCountry(),

            status:
                "pending"
        };

        const response =
            await fetch(
                `${SUPABASE_URL}/rest/v1/ripple_submissions`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",

                        "apikey":
                            SUPABASE_KEY,

                        "Authorization":
                            `Bearer ${SUPABASE_KEY}`,

                        "Prefer":
                            "return=minimal"
                    },

                    body:
                        JSON.stringify(
                            submission
                        )
                }
            );

        if (!response.ok) {
            let errorDetails =
                "Unknown Supabase error.";

            try {
                errorDetails =
                    await response.text();

            } catch (error) {
                console.warn(
                    "Could not read Supabase error.",
                    error
                );
            }

            console.error(
                "Ripple submission failed:",
                response.status,
                errorDetails
            );

            throw new Error(
                `Supabase submission failed (${response.status}).`
            );
        }

        return true;
    }


    /* =====================================================
       SUBMISSION FORM
    ===================================================== */

    if (rippleForm) {
        rippleForm.addEventListener(
            "submit",
            async event => {
                event.preventDefault();

                const message =
                    document.getElementById(
                        "ripple-message"
                    );

                const name =
                    document.getElementById(
                        "ripple-name"
                    );

                const region =
                    document.getElementById(
                        "ripple-region"
                    );

                const country =
                    document.getElementById(
                        "ripple-country"
                    );

                if (
                    !message ||
                    !message.value.trim()
                ) {
                    return;
                }

                const submitButton =
                    rippleForm.querySelector(
                        'button[type="submit"]'
                    );

                const originalButtonText =
                    submitButton
                        ? submitButton.textContent
                        : "";

                if (submitButton) {
                    submitButton.disabled =
                        true;

                    submitButton.textContent =
                        "Sending...";
                }

                try {
                    await submitRippleToSupabase(
                        message.value,

                        name
                            ? name.value
                            : "",

                        region
                            ? region.value
                            : "",

                        country
                            ? country.value
                            : ""
                    );

                    message.value = "";

                    if (name) {
                        name.value = "";
                    }

                    if (region) {
                        region.value = "";
                    }

                    if (country) {
                        country.value = "";
                    }

                    closeModal(
                        makeRippleModal
                    );

                    setTimeout(
                        () => {
                            alert(
                                "Thank you for making a ripple. Your message has been submitted for review."
                            );
                        },
                        250
                    );

                } catch (error) {
                    console.error(
                        "The Ripple Well submission error:",
                        error
                    );

                    alert(
                        "We couldn't submit your ripple right now. Please try again in a moment."
                    );

                } finally {
                    if (submitButton) {
                        submitButton.disabled =
                            false;

                        submitButton.textContent =
                            originalButtonText;
                    }
                }
            }
        );
    }


    /* =====================================================
       APPROVED IMPACT RIPPLE COUNT ONLY

       The visual Impact Ripple objects are intentionally disabled.
       We still retrieve the approved count so the existing lower
       banner remains useful and can continue to show the live total.
    ===================================================== */

    async function loadImpactRippleCount() {
        if (!impactCount) {
            return;
        }

        try {
            const response =
                await fetch(
                    `${SUPABASE_URL}/rest/v1/ripple_submissions?select=id&status=eq.approved`,
                    {
                        method: "GET",

                        headers: {
                            "apikey":
                                SUPABASE_KEY,

                            "Authorization":
                                `Bearer ${SUPABASE_KEY}`,

                            "Accept":
                                "application/json"
                        }
                    }
                );

            if (!response.ok) {
                console.warn(
                    "The Ripple Well: could not load the Impact Ripple count."
                );

                return;
            }

            const submissions =
                await response.json();

            if (
                Array.isArray(
                    submissions
                )
            ) {
                impactCount.textContent =
                    submissions.length
                        .toLocaleString();
            }

        } catch (error) {
            console.warn(
                "The Ripple Well: Impact Ripple count unavailable.",
                error
            );
        }
    }


    loadImpactRippleCount();


    /* =====================================================
       INITIALIZATION
    ===================================================== */

    console.log(
        "The Ripple Well v3.0 initialized."
    );

    console.log(
        "Image Water Surface: active"
    );

    console.log(
        "Click Ripple Interaction: active"
    );

    console.log(
        "Impact Ripple Visual Layer: temporarily disabled"
    );

    console.log(
        "Stationary Lower Interaction Banner: active"
    );

    console.log(
        "Supabase Submission: active"
    );

})();
