```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">

    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
    >

    <title>The Infinite Pond</title>

    <style>

        :root {

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
           FIXED TOP BANNER
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
                24px 24px 34px;

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
               Enlarged substantially from the original.
               The actual image is the Make the Ripple logo
               stored in the GitHub images folder.
            */

            max-width: 540px;
            max-height: 180px;

            width: auto;
            height: auto;

            object-fit: contain;

            margin-bottom: 16px;

            filter:
                drop-shadow(
                    0 0 18px
                    rgba(120, 220, 255, 0.32)
                );
        }


        /* =====================================================
           PRESENTED BY
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
           POND TITLE
        ===================================================== */

        #pondTitle {

            margin:
                0;

            color:
                var(--text-main);

            font-size:
                clamp(
                    32px,
                    5vw,
                    62px
                );

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
                12px 0 0;

            color:
                var(--text-soft);

            font-size:
                clamp(
                    12px,
                    1.5vw,
                    17px
                );

            line-height:
                1.5;

            letter-spacing:
                0.12em;
        }


        /* =====================================================
           MAKE A RIPPLE BUTTON
        ===================================================== */

        #rippleButton {

            position: fixed;

            top: 24px;
            right: 24px;

            z-index: 200;

            padding:
                12px 20px;

            border:
                1px solid
                rgba(
                    150,
                    220,
                    255,
                    0.30
                );

            border-radius:
                999px;

            background:
                rgba(
                    3,
                    22,
                    34,
                    0.78
                );

            color:
                #d9f6ff;

            font-family:
                Georgia,
                "Times New Roman",
                serif;

            font-size:
                14px;

            letter-spacing:
                0.08em;

            cursor:
                pointer;

            box-shadow:
                0 4px 18px
                rgba(
                    0,
                    0,
                    0,
                    0.30
                );

            backdrop-filter:
                blur(6px);

            transition:
                background 0.2s ease,
                border-color 0.2s ease,
                transform 0.2s ease;
        }


        #rippleButton:hover {

            background:
                rgba(
                    15,
                    55,
                    72,
                    0.88
                );

            border-color:
                rgba(
                    170,
                    235,
                    255,
                    0.55
                );

            transform:
                translateY(-1px);
        }


        #rippleButton:active {

            transform:
                translateY(1px);
        }


        /* =====================================================
           SCROLLABLE WATER AREA
        ===================================================== */

        .water-scroll {

            position: fixed;

            top:
                var(--banner-height);

            left: 0;

            width: 100%;

            height:
                calc(
                    100vh -
                    var(--banner-height)
                );

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
                rgba(
                    150,
                    220,
                    255,
                    0.25
                )
                transparent;
        }


        .water-scroll::-webkit-scrollbar {

            width:
                8px;
        }


        .water-scroll::-webkit-scrollbar-track {

            background:
                transparent;
        }


        .water-scroll::-webkit-scrollbar-thumb {

            background:
                rgba(
                    150,
                    220,
                    255,
                    0.22
                );

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


        /* =====================================================
           WEBGL WATER CANVAS
        ===================================================== */

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

            width:
                min(
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
                rgba(
                    150,
                    220,
                    255,
                    0.10
                );

            border-radius:
                16px;

            background:
                rgba(
                    2,
                    15,
                    25,
                    0.28
                );

            backdrop-filter:
                blur(3px);

            box-shadow:
                0 20px 80px
                rgba(
                    0,
                    0,
                    0,
                    0.22
                );

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
                rgba(
                    190,
                    225,
                    238,
                    0.78
                );

            font-size:
                17px;

            line-height:
                1.8;
        }


        /* =====================================================
           MOBILE
        ===================================================== */

        @media (max-width: 700px) {

            :root {

                --banner-height:
                    270px;
            }


            .stationary-banner {

                padding:
                    18px 18px 28px;
            }


            #pondLogo {

                max-width:
                    360px;

                max-height:
                    120px;

                margin-bottom:
                    10px;
            }


            #presented {

                font-size:
                    9px;

                margin-bottom:
                    6px;
            }


            #pondSubtitle {

                margin-top:
                    9px;

                letter-spacing:
                    0.08em;
            }


            #rippleButton {

                top:
                    16px;

                right:
                    16px;

                padding:
                    10px 16px;

                font-size:
                    12px;
            }


            .pond-content {

                width:
                    calc(
                        100% - 28px
                    );

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
</head>


<body>


    <!-- =====================================================
         FIXED BANNER
    ===================================================== -->

    <header class="stationary-banner">

        <div class="pond-header">


            <!-- =================================================
                 MAKE THE RIPPLE LOGO

                 GitHub:
                 maketheripple/the-infinate-pond
                 /images/Make the Ripple Large Logo.png
            ================================================== -->

            <img
                id="pondLogo"
                src="images/Make%20the%20Ripple%20Large%20Logo.png"
                alt="Make the Ripple"
            >


            <p id="presented">
                Presents
            </p>


            <h1 id="pondTitle">
                The Infinite Pond
            </h1>


            <p id="pondSubtitle">
                An ever-changing surface of light, water, and reflection
            </p>

        </div>

    </header>


    <!-- =====================================================
         MAKE A RIPPLE BUTTON

         Kept outside the water canvas so it remains fixed
         and cannot create an accidental water ripple.
    ====================================================== -->

    <button
        id="rippleButton"
        type="button"
    >
        Make a Ripple
    </button>


    <!-- =====================================================
         EVERYTHING BELOW THE BANNER IS SCROLLABLE
    ====================================================== -->

    <main class="water-scroll">

        <section class="water-stage">


            <!-- =================================================
                 WEBGL WATER
            ================================================== -->

            <canvas
                id="waterCanvas"
                aria-hidden="true"
            ></canvas>


            <!-- =================================================
                 POND CONTENT
            ================================================== -->

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


</body>
</html>
```
