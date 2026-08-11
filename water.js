                /* =================================================
                   POINTER RIPPLE
                   VERSION 10.7.3
                   RIPPLE ONLY WHEN WATER CANVAS IS CLICKED
                ================================================= */

                canvas.addEventListener(
                    "pointerdown",
                    function(event) {

                        /*
                           Ripples are intentionally generated
                           ONLY when the actual water canvas
                           receives the pointer event.

                           This prevents clicks on the stationary
                           banner, logo, title, subtitle, buttons,
                           or other page elements from creating
                           ripples.
                        */

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
