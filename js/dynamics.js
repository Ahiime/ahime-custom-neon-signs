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

        function adjusteNeonSize() {
            let element = $(".actns-animated-multicolor");

            let margin = 50;
        
            $("#actns-ruler").height(element.height() + margin);
            $("#actns-ruler").width(element.width() + margin);
            $("#actns-ruler").css("left", element.position().left - (margin / 2)); // Utilisation de .position()
            $("#actns-ruler").css("top", element.position().top - (margin / 2));

            $("#actns-ruler").removeClass("actns-hide");
        }

        $(document).on("mouseover click", function () {
            adjusteNeonSize();
            display_size();
        });


        // 1. Définir la taille de la police en fonction de la dimension (S, M, L, ...)
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
                case 'XS':
                    return '12px'; // Très petit
                case 'S':
                    return '24px'; // Petit
                case 'M':
                    return '36px'; // Moyen
                case 'L':
                    return '48px'; // Grand
                case 'XL':
                    return '60px'; // Très grand
                case 'XXL':
                    return '72px'; // Extra grand
                case 'XXXL':
                    return '96px'; // Très extra grand
                default:
                    return '24px'; // Par défaut (taille S)
            }
        }

        // 2. Appliquer la police et la taille du texte à l'élément
        function setTextStyle(element, fontFamily, fontSize) {
            element.style.fontFamily = fontFamily;
            element.style.fontSize = fontSize;
        }

        // 3. Mesurer les dimensions visuelles du texte
        function getTextDimensions(text, fontFamily, fontSize) {
            const element = document.getElementById('actns-neon-text');
            element.textContent = text;
            setTextStyle(element, fontFamily, fontSize);

            const width = element.offsetWidth;  // Largeur en pixels
            const height = element.offsetHeight; // Hauteur en pixels

            return { width, height };
        }

        // 4. Calculer les dimensions finales du néon
        function calculateNeonDimensions(text, dimension, fontFamily, tubeThickness, letterSpacing, safetyMargin) {
            // Obtenir la taille de la police en fonction de la dimension
            const fontSize = getFontSizeByDimension(dimension);

            // Mesurer les dimensions visuelles du texte
            const dimensions = getTextDimensions(text, fontFamily, fontSize);

            // Convertir les pixels en millimètres (1 pixel = 0.264583 mm)
            const pixelsToMillimeters = 0.264583;
            const widthInMillimeters = dimensions.width * pixelsToMillimeters;
            const heightInMillimeters = dimensions.height * pixelsToMillimeters;

            // Ajuster pour l'épaisseur du tube
            const adjustedWidth = widthInMillimeters + tubeThickness;
            const adjustedHeight = heightInMillimeters + tubeThickness;

            // Ajuster pour l'espacement entre les lettres
            const totalLetterSpacing = (text.length - 1) * letterSpacing;
            const adjustedWidthWithSpacing = adjustedWidth + totalLetterSpacing;

            // Ajouter la marge de sécurité
            const finalWidth = adjustedWidthWithSpacing + safetyMargin;
            const finalHeight = adjustedHeight + safetyMargin;

            return { width: finalWidth, height: finalHeight };
        }

        function display_size() {
            const text = $("#actns-text-editor").val(); // Texte du néon
            const dimension = $("input[name='request-sizes']:checked").val(); // Dimension (S, M, L)
            const fontFamily = "Arial"; // Police d'écriture
            const tubeThickness = 10; // Épaisseur du tube en mm
            const letterSpacing = 5; // Espacement entre les lettres en mm
            const safetyMargin = 20; // Marge de sécurité en mm

            // Calculer les dimensions finales
            const dimensions = calculateNeonDimensions(text, dimension, fontFamily, tubeThickness, letterSpacing, safetyMargin);

            $(".actns-ruler-left-content").text(dimensions.height.toFixed(2) + 'mm');
            $(".actns-ruler-bottom-content").text(dimensions.width.toFixed(2) + 'mm');
        }
    })
})(jQuery)