<!DOCTYPE html>

<html lang="en">
<head>
    <meta charset="UTF-8">

```
<meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
>

<title>The Infinite 2 Pond</title>

<style>
    :root {
        /*
         * IMPORTANT:
         * The banner is intentionally taller so the
         * bottom border sits BELOW all banner wording.
         */
        --banner-height: 330px;

        --page-bg:
            #020b12;

        --banner-bg:
            rgba(2, 10, 17, 0.96);

        --text-main:
            #d9f6ff;

        --text-soft:
            #8fb7c7;
    }

    * {
        box-sizing: border-box;
    }

    html,
    body {
        width: 100%;
        height: 100%;
        margin: 0;
        padding: 0;

        background:
            var(--page-bg);

        color:
            var(--text-main);

        font-family:
            Georgia,
            "Times New Roman",
            serif;

        overflow: hidden;
    }


    /* =====================================================
       FIXED BANNER
    ===================================================== */

    .stationary-banner {
        position: fixed;

        top: 0;
        left: 0;

        width: 100%;
        height: var(--banner-height);

        z-index: 100;

        display: flex;
        flex-direction: column;

        align-items: center;
        justify-content: center;

        padding:
            30px 24px 42px;

        background:
            var(--banner-bg);

        border-bottom:
            1px solid
            rgba(150, 220, 255, 0.12);

        box-shadow:
            0 8px 30px
            rgba(0, 0, 0, 0.28);

        pointer-events:
            auto;
    }


    .pond-header {
        position: relative;

        width: 100%;
        max-width: 1100px;

        display: flex;
        flex-direction: column;

        align-items: center;
        justify-content: center;

        text-align: center;
    }


    /* =====================================================
       MAKE THE RIPPLE LOGO
    ===================================================== */

    #pondLogo {
        display: block;

        /*
         * Large logo restored.
         */
        max-width: 540px;
        max-height: 180px;

        width: auto;
        height: auto;

        object-fit: contain;

        margin-bottom: 18px;

        filter:
            drop-shadow(
                0 0 18px
                rgba(120, 220, 255, 0.30)
            );
    }


    /* =====================================================
       PRESENTED
    ===================================================== */

    #presented {
        margin:
            0 0 8px;

        color:
            #8fb7c7;

        font-size:
            12px;

        line-height:
            1.4;

        letter-spacing:
            0.24em;

        text-transform:
            uppercase;
    }


    /* =====================================================
       TITLE
    ===================================================== */

    #pondTitle {
        margin:
            0;

        color:
            var(--text-main);

        font-size:
            clamp(32px, 5vw, 62px);

        line-height:
            0.98;

        font-weight:
            500;

        letter-spacing:
            0.08em;

        text-transform:
            uppercase;

        text-shadow:
            0 0 18px
            rgba(130, 220, 255, 0.20);
    }


    /* =====================================================
       SUBTITLE
    ===================================================== */

    #pondSubtitle {
        margin:
            14px 0 0;

        color:
            var(--text-soft);

        font-size:
            clamp(12px, 1.5vw, 17px);

        line-height:
            1.5;

        letter-spacing:
            0.12em;
    }


    /* =====================================================
       SCROLLABLE AREA
    ===================================================== */

    .water-scroll {
        position: fixed;

        top:
            var(--banner-height);

        left: 0;

        width: 100%;

        height:
            calc(100vh - var(--banner-height));

        overflow-y:
            auto;

        overflow-x:
            hidden;

        overscroll-behavior:
            contain;

        -webkit-overflow-scrolling:
            touch;

        background:
            #020b12;

        scrollbar-width:
            thin;

        scrollbar-color:
            rgba(150, 220, 255, 0.25)
            transparent;
    }


    .water-scroll::-webkit-scrollbar {
        width: 8px;
    }


    .water-scroll::-webkit-scrollbar-track {
        background:
            transparent;
    }


    .water-scroll::-webkit-scrollbar-thumb {
        background:
            rgba(150, 220, 255, 0.22);

        border-radius:
            8px;
    }


    /* =====================================================
       WATER STAGE
    ===================================================== */

    .water-stage {
        position: relative;

        width: 100%;

        min-height:
            2400px;

        isolation:
            isolate;

        background:
            #020b12;
    }


    #waterCanvas {
        position: absolute;

        top: 0;
        left: 0;

        width: 100%;
        height: 100%;

        display: block;

        z-index: 0;

        pointer-events:
            auto;
    }


    /* =====================================================
       SCROLLABLE CONTENT
    ===================================================== */

    .pond-content {
        position: relative;

        z-index: 2;

        width: min(
            900px,
            calc(100% - 48px)
        );

        margin:
            0 auto;

        padding:
            360px 0 240px;

        pointer-events:
            none;
    }


    .pond-section {
        margin:
            0 auto 180px;

        max-width:
            760px;

        padding:
            40px;

        border:
            1px solid
            rgba(150, 220, 255, 0.10);

        border-radius:
            16px;

        background:
            rgba(2, 15, 25, 0.28);

        backdrop-filter:
            blur(3px);

        box-shadow:
            0 20px 80px
            rgba(0, 0, 0, 0.22);

        pointer-events:
            auto;
    }


    .pond-section h2 {
        margin:
            0 0 18px;

        font-size:
            28px;

        font-weight:
            400;

        letter-spacing:
            0.08em;

        color:
            #d9f6ff;
    }


    .pond-section p {
        margin:
            0;

        color:
            rgba(190, 225, 238, 0.78);

        font-size:
            17px;

        line-height:
            1.8;
    }


    /* =====================================================
       MAKE A RIPPLE BUTTON
    ===================================================== */

    #rippleButton {
        position: fixed;

        top: 18px;
        right: 22px;

        z-index: 150;

        padding:
            11px 18px;

        border:
            1px solid
            rgba(150, 220, 255, 0.32);

        border-radius:
            999px;

        background:
            rgba(2, 18, 29, 0.82);

        color:
            #d9f6ff;

        font-family:
            Georgia,
            "Times New Roman",
            serif;

        font-size:
            13px;

        letter-spacing:
            0.08em;

        cursor:
            pointer;

        box-shadow:
            0 4px 18px
            rgba(0, 0, 0, 0.30);

        backdrop-filter:
            blur(5px);
    }


    #rippleButton:hover {
        background:
            rgba(10, 35, 48, 0.92);

        border-color:
            rgba(150, 220, 255, 0.50);
    }


    /* =====================================================
       MOBILE
    ===================================================== */

    @media (max-width: 700px) {

        :root {
            --banner-height: 280px;
        }


        .stationary-banner {
            padding:
                22px 18px 34px;
        }


        #pondLogo {
            max-width:
                360px;

            max-height:
                125px;

            margin-bottom:
                12px;
        }


        #presented {
            font-size:
                9px;

            margin-bottom:
                6px;
        }


        #pondTitle {
            font-size:
                clamp(
                    27px,
                    8vw,
                    42px
                );
        }


        #pondSubtitle {
            margin-top:
                9px;

            letter-spacing:
                0.08em;
        }


        #rippleButton {
            top:
                12px;

            right:
                12px;

            padding:
                9px 14px;

            font-size:
                11px;
        }


        .pond-content {
            width:
                calc(100% - 28px);

            padding-top:
                280px;
        }


        .pond-section {
            padding:
                26px;

            margin-bottom:
                120px;
        }
    }
</style>
```

</head>

<body>

```
<!-- =====================================================
     FIXED BANNER
     ===================================================== -->

<header class="stationary-banner">

    <div class="pond-header">

        <img
            id="pondLogo"
            src="images/Make%20the%20Ripple%20Large%20Logo.png"
            alt="Make the Ripple logo"
        >

        <p id="presented">
            Presented by
        </p>

        <h1 id="pondTitle">
            The Infinite Pond
        </h1>

        <p id="pondSubtitle">
            Every Ripple Begins Somewhere
        </p>

    </div>

</header>


<!-- =====================================================
     MAKE A RIPPLE BUTTON
     ===================================================== -->

<button
    id="rippleButton"
    type="button"
>
    Make a Ripple
</button>


<!-- =====================================================
     EVERYTHING BELOW THE BANNER IS SCROLLABLE
     ===================================================== -->

<main class="water-scroll">

    <section class="water-stage">

        <canvas
            id="waterCanvas"
            aria-hidden="true"
        ></canvas>


        <div class="pond-content">

            <section class="pond-section">

                <h2>
                    Beneath the Surface
                </h2>

                <p>
                    The water begins immediately beneath the
                    stationary banner. Scroll through the pond
                    and the surface continues beneath you.
                    Click or tap anywhere on the water to disturb
                    it with a ripple.
                </p>

            </section>


            <section class="pond-section">

                <h2>
                    The Infinite Pond
                </h2>

                <p>
                    This section is intentionally transparent
                    enough to allow the moving water to remain
                    visible beneath the content.
                </p>

            </section>


            <section class="pond-section">

                <h2>
                    Further Down
                </h2>

                <p>
                    The water surface continues for the entire
                    scrollable stage, creating the impression that
                    the page extends beneath the original surface.
                </p>

            </section>


            <section class="pond-section">

                <h2>
                    End of the Pond
                </h2>

                <p>
                    Additional site content can be placed here
                    without changing the water system.
                </p>

            </section>

        </div>

    </section>

</main>


<!-- =====================================================
     WATER ENGINE
     ===================================================== -->

<script src="water.js"></script>
```

</body>
</html>
