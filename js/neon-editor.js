import { BLYD3D_NEON } from "./BLYD3D-NEON.js";

var bldy3d;
window.onload = function () {
    bldy3d = new BLYD3D_NEON(".container-3d");
    let color = "#eee", lightColor = "#fff", actualText = "Ahime", actualType = 1, actualIntensity = 3;
    
    displayNeonText(actualText, actualType);


    function displayNeonText(text, type) {
        actualText = text;
        actualType = type;
        bldy3d.removeAllObjects();
        
        switch (parseInt(type)) {
            case 1:
                bldy3d.addNeonTextFormOne(text, color, lightColor, actualIntensity);
                break;

            case 2:
                bldy3d.addNeonTextFormTwo(text, color, lightColor, actualIntensity);
                break;

            case 3:
                bldy3d.addNeonTextFormThree(text, color, lightColor, actualIntensity);
                break;

            case 4:
                bldy3d.addNeonTextFormFour(text, color, lightColor, actualIntensity);
                break;

            case 5:
                bldy3d.addNeonTextFormFive(text, color, lightColor, actualIntensity);
                break;

            case 6:
                bldy3d.addNeonTextFormSix(text, color, lightColor, actualIntensity);
                break;
        
            default:
                bldy3d.addNeonTextFormOne(text, color, lightColor, actualIntensity);
                break;
        }
    }
}