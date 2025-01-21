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
        });
    })
})(jQuery)