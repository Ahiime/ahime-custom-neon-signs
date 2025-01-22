(function ($) {
    $(document).ready(function () {
        if ($(window).width() > 767) {
            $('#actns-left-section').scrollFollow({
                container: 'actns-container'
            });
        }

        function adjustFontSize() {
            const container = document.querySelector(".actns-animated-multicolor");
            let fontSize = 100;
            container.style.fontSize = fontSize + "px";

            // Réduire la taille du texte jusqu'à ce qu'il rentre
            while (
                (container.scrollWidth > container.clientWidth || container.scrollHeight > container.clientHeight)
                && fontSize > 5
            ) {
                fontSize--;
                container.style.fontSize = fontSize + "px";
            }
        }

        window.addEventListener("load", adjustFontSize);
        window.addEventListener("resize", adjustFontSize);

        $("#actns-text-editor").on("keyup", function () {
            let text = $(this).val();
            let formattedText = text.split("").map(letter => `<span>${letter}</span>`).join("");
            $(".actns-animated-multicolor").html(formattedText);
            adjustFontSize()

            // displayNeonText($("#actns-text-editor").val(), actualType);
        });

        let color = "#fff", lightColor = "#fff", actualText = "Ahime", actualType = 1, actualIntensity = 3;
        let actns_neon;

        $("#actns-2d-preview-selector").on("click", function () {
            $(".actns-preview-active").removeClass("actns-preview-active");
            $(".actns-2d-preview").addClass("actns-preview-active"); 
            
            
            $("#actns-2d-preview-selector").addClass("actns-hide");
            $("#actns-3d-preview-selector").removeClass("actns-hide");
        })

        $("#actns-3d-preview-selector").on("click", function () {
            $(".actns-preview-active").removeClass("actns-preview-active");
            $(".actns-3d-preview").addClass("actns-preview-active");
            
            actns_neon = new ACTNS_NEON(".actns-3d-preview");
    
            displayNeonText($("#actns-text-editor").val(), actualType);

            $("#actns-3d-preview-selector").addClass("actns-hide");
            $("#actns-2d-preview-selector").removeClass("actns-hide");
        })

       

        function displayNeonText(text, type) {
            actualText = text;
            actualType = type;
            actns_neon.removeAllObjects();

            switch (parseInt(type)) {
                case 1:
                    actns_neon.addNeonTextFormOne(text, color, lightColor, actualIntensity);
                    break;

                case 2:
                    actns_neon.addNeonTextFormTwo(text, color, lightColor, actualIntensity);
                    break;

                case 3:
                    actns_neon.addNeonTextFormThree(text, color, lightColor, actualIntensity);
                    break;

                case 4:
                    actns_neon.addNeonTextFormFour(text, color, lightColor, actualIntensity);
                    break;

                case 5:
                    actns_neon.addNeonTextFormFive(text, color, lightColor, actualIntensity);
                    break;

                case 6:
                    actns_neon.addNeonTextFormSix(text, color, lightColor, actualIntensity);
                    break;

                default:
                    actns_neon.addNeonTextFormOne(text, color, lightColor, actualIntensity);
                    break;
            }
        }
    })
})(jQuery)