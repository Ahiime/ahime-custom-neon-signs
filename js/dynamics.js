(function ($) {
    $(document).ready(function () {
        const cmMult = 37.7952755906;

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
        
            // Remplace chaque caractère par un <span>, en gérant les espaces et les sauts de ligne
            let formattedText = text.split("").map(letter => {
                if (letter === "\n") return "<br>"; // Gérer les retours à la ligne
                if (letter === " ") return `<span>&nbsp;</span>`; // Gérer les espaces
                return `<span>${letter}</span>`; // Autres caractères
            }).join("");
        
            $(".actns-animated-multicolor").html(formattedText);
            adjustFontSize();
            adjusteNeonSize();
            display_size()
        });
        
        

        let color = "yellow", lightColor = "yellow", actualText = "Ahime", actualType = 1, actualIntensity = 2;
        let actns_neon;

        $("#actns-2d-preview-selector").on("click", function () {
            $(".actns-preview-active").removeClass("actns-preview-active");
            $(".actns-2d-preview").addClass("actns-preview-active"); 
            
            
            $("#actns-2d-preview-selector").addClass("actns-hide");
            $("#actns-3d-preview-selector").removeClass("actns-hide");
            $("#actns-ruler").removeClass("actns-3d-mode");
            $("#actns-ruler").removeClass("actns-hide");
        })

        $("#actns-3d-preview-selector").on("click", function () {
            $(".actns-preview-active").removeClass("actns-preview-active");
            $(".actns-3d-preview").addClass("actns-preview-active");
            
            actns_neon = new ACTNS_NEON(".actns-3d-preview");
    
            displayNeonText($("#actns-text-editor").val(), actualType);

            $("#actns-3d-preview-selector").addClass("actns-hide");
            $("#actns-2d-preview-selector").removeClass("actns-hide");
            $("#actns-ruler").addClass("actns-hide");
            $("#actns-ruler").addClass("actns-3d-mode");
        })

       

        async function displayNeonText(text, type) {
            actualText = text;
            actualType = type;
            actns_neon.removeAllObjects();

            let font = await actnsConvertFontToJSON('http://127.0.0.1:5501/assets/font/Neonderthaw-Regular.ttf')


            switch (parseInt(type)) {
                case 1:
                    actns_neon.addNeonTextFormOne(text, color, lightColor, actualIntensity, font, true);
                    break;

                case 2:
                    actns_neon.addNeonTextFormTwo(text, color, lightColor, actualIntensity, font);
                    break;

                case 3:
                    actns_neon.addNeonTextFormThree(text, color, lightColor, actualIntensity, font);
                    break;

                case 4:
                    actns_neon.addNeonTextFormFour(text, color, lightColor, actualIntensity, font);
                    break;

                case 5:
                    actns_neon.addNeonTextFormFive(text, color, lightColor, actualIntensity, font);
                    break;

                case 6:
                    actns_neon.addNeonTextFormSix(text, color, lightColor, actualIntensity, font);
                    break;

                default:
                    actns_neon.addNeonTextFormOne(text, color, lightColor, actualIntensity, font, true);
                    break;
            }
        }

        function adjusteNeonSize() {
            let element = $(".actns-animated-multicolor");

            let margin = 50;
        
            $("#actns-ruler").height(element.height() + margin);
            $("#actns-ruler").width(element.width() + margin);
            $("#actns-ruler").css("left", element.position().left - (margin / 2)); // Utilisation de .position()
            $("#actns-ruler").css("top", element.position().top - (margin / 2));

            if(!$("#actns-ruler").hasClass('actns-3d-mode')) $("#actns-ruler").removeClass("actns-hide");
        }

        $(document).on("mouseover click", function () {
            adjusteNeonSize();
            display_size();
        });


        function getFontSizeByDimension(dimension) {

            dimension = dimension.toUpperCase();

            // Vérifier si la dimension est personnalisée (ex: "71cm")
            if (dimension.endsWith("CM")) {
                const sizeInCm = parseFloat(dimension); // Extraire la valeur numérique
                if (!isNaN(sizeInCm)) {
                    // Convertir les centimètres en pixels (1 cm = 37.7952755906 pixels)
                    const sizeInPixels = sizeInCm * 37.7952755906;
                    return `${sizeInPixels}px`;
                }
            }

            switch (dimension) { // Convertir en majuscules pour éviter les erreurs de casse
                case 'XXS':
                    return 226.7716535436; // Très petit
                case 'XS':
                    return 264.5669291342; // Très petit
                case 'S':
                    return 302.3622047248; // Petit
                case 'M':
                    return 377.952755906; // Moyen
                case 'L':
                    return 453.5433070872; // Grand
                case 'XL':
                    return 529.1338582684; // Très grand
                case 'XXL':
                    return 604.7244094496; // Extra grand
                case 'XXXL':
                    return 755.905511812; // Très extra grand
                default:
                    return 302.3622047248; // Par défaut (taille S)
            }
        }

       
        function getScaleFactor(dimension, reference = 'M') {
            const scaleFactors = {
                'XXS': 0.6,
                'XS': 0.7,
                'S': 0.8,
                'M': 1,
                'L': 1.2,
                'XL': 1.4,
                'XXL': 1.6,
                'XXXL': 2
            };
        
            // Vérifier si la dimension existe
            if (!scaleFactors[dimension] || !scaleFactors[reference]) {
                throw new Error(`Dimension inconnue : ${dimension} ou référence invalide : ${reference}`);
            }
        
            // Calcul du facteur par rapport à la référence choisie
            return scaleFactors[dimension] / scaleFactors[reference];
        }

        async function display_size() {
            const text = $("#actns-text-editor").val(); // Texte du néon
            const dimension = $("input[name='request-sizes']:checked").val(); // Dimension (S, M, L)
            const tubeThickness = 1 * cmMult; // Épaisseur du tube en mm
            const letterSpacing = 0 * cmMult; // Espacement entre les lettres en mm
            const safetyMargin = 2 * cmMult; // Marge de sécurité en mm

            // Calculer les dimensions finales
            // const dimensions = calculateNeonDimensions(text, dimension, fontFamily, tubeThickness, letterSpacing, safetyMargin);

            const dimensions = await actnsMeasureText(
                text, 
                getFontSizeByDimension(dimension), 
                {
                    tubeThickness: tubeThickness,
                    charSpacing: letterSpacing, 
                    scaleFactor: 1, // getScaleFactor(dimension),
                    margin: safetyMargin,
                    fontPath: '../assets/font/Flynn.ttf'
                }
            );
            
            let ropeCm =  dimensions.ropeLength / cmMult;
            let width = dimensions.width / cmMult; 
            let height = dimensions.height / cmMult; 
            $(".actns-ruler-left-content").text(height.toFixed(2) + 'cm');
            $(".actns-ruler-bottom-content").text(width.toFixed(2) + 'cm');
        }
    })
})(jQuery)