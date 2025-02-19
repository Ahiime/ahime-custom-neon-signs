/**
 * Fonction utilitaire pour calculer la distance entre 2 points
 * 
 * @param {*} p1 
 * @param {*} p2 
 * @returns 
 */
function actnsDistance(p1, p2) {
    if (!p1 || !p2 || isNaN(p1.x) || isNaN(p1.y) || isNaN(p2.x) || isNaN(p2.y)) {
        return 0;
    }

    return Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
}


/**
 * Calcul d'un point sur une courbe cubique de Bézier à un paramètre t (0 <= t <= 1)
 * 
 * @param {*} p0 
 * @param {*} p1 
 * @param {*} p2 
 * @param {*} p3 
 * @param {*} t 
 * @returns 
 */
function actnsCubicBezierPoint(p0, p1, p2, p3, t) {
    const mt = 1 - t;
    return {
        x: mt * mt * mt * p0.x + 3 * mt * mt * t * p1.x + 3 * mt * t * t * p2.x + t * t * t * p3.x,
        y: mt * mt * mt * p0.y + 3 * mt * mt * t * p1.y + 3 * mt * t * t * p2.y + t * t * t * p3.y,
    };
}

/**
 * Approximation de la longueur d'une courbe cubique de Bézier
 * 
 * @param {*} p0 
 * @param {*} p1 
 * @param {*} p2 
 * @param {*} p3 
 * @param {*} steps 
 * @returns 
 */
function actnsCubicBezierLength(p0, p1, p2, p3, steps = 20) {
    let length = 0;
    let prev = p0;
    for (let i = 1; i <= steps; i++) {
        const t = i / steps;
        const point = actnsCubicBezierPoint(p0, p1, p2, p3, t);
        length += actnsDistance(prev, point);
        prev = point;
    }
    return length;
}

/**
 * Calcul d'un point sur une courbe quadratique de Bézier à un paramètre t (0 <= t <= 1)
 * 
 * @param {*} p0 
 * @param {*} p1 
 * @param {*} p2 
 * @param {*} t 
 * @returns 
 */
function actnsQuadraticBezierPoint(p0, p1, p2, t) {
    const mt = 1 - t;
    return {
        x: mt * mt * p0.x + 2 * mt * t * p1.x + t * t * p2.x,
        y: mt * mt * p0.y + 2 * mt * t * p1.y + t * t * p2.y,
    };
}

/**
 * Approximation de la longueur d'une courbe quadratique de Bézier.
 * 
 * @param {*} p0 
 * @param {*} p1 
 * @param {*} p2 
 * @param {*} steps 
 * @returns 
 */
function actnsQuadraticBezierLength(p0, p1, p2, steps = 20) {
    let length = 0;
    let prev = p0;
    for (let i = 1; i <= steps; i++) {
        const t = i / steps;
        const point = actnsQuadraticBezierPoint(p0, p1, p2, t);
        length += actnsDistance(prev, point);
        prev = point;
    }
    return length;
}

/**
 * Fonction qui parcourt les commandes du glyphe et calcule la longueur totale
 * 
 * @param {*} commands 
 * @returns 
 */
function actnsComputePathLength(commands) {
    let totalLength = 0;
    let currentPoint = { x: 0, y: 0 };
    let startPoint = { x: 0, y: 0 };

    commands.forEach((command) => {
        switch (command.type) {
            case 'M':
                // 'M' démarre un nouveau sous-chemin
                currentPoint = { x: command.x, y: command.y };
                startPoint = { x: command.x, y: command.y };
                break;
            case 'L':
                // Ligne simple
                const newPointL = { x: command.x, y: command.y };
                totalLength += actnsDistance(currentPoint, newPointL);
                currentPoint = newPointL;
                break;
            case 'C':
                // Courbe cubique de Bézier
                const newPointC = { x: command.x, y: command.y };
                totalLength += actnsCubicBezierLength(
                    currentPoint,
                    { x: command.x1, y: command.y1 },
                    { x: command.x2, y: command.y2 },
                    newPointC,
                    20
                );
                currentPoint = newPointC;
                break;
            case 'Q':
                // Courbe quadratique de Bézier
                const newPointQ = { x: command.x, y: command.y };
                totalLength += actnsQuadraticBezierLength(
                    currentPoint,
                    { x: command.x1, y: command.y1 },
                    newPointQ,
                    20
                );
                currentPoint = newPointQ;
                break;
            case 'Z':
                // Fermeture du chemin (retour au point de départ)
                totalLength += actnsDistance(currentPoint, startPoint);
                currentPoint = startPoint;
                break;
        }
    });

    return totalLength;
}

/**
 * Fonction principale qui, à partir d'un glyphe issu d'une font, retourne la longueur totale du contour
 * 
 * @param {*} font 
 * @param {*} character 
 * @param {*} fontsize 
 * @returns 
 */
function actnsCalculateGlyphLength(font, character, fontsize) {
    // On récupère le chemin du glyphe pour le caractère (ici positionné en (0,0))
    const path = font.getPath(character, 0, 0, fontsize);
    return actnsComputePathLength(path.commands);
}


async function actnsMeasureText(text, fontSize, options = {}) {
    return new Promise((resolve, reject) => {
        const {
            tubeThickness = 0,  // Épaisseur du tube néon
            margin = 0,         // Marge autour du texte
            charSpacing = 0,    // Espace supplémentaire entre chaque caractère
            scaleFactor = 1,    // Facteur d'échelle à appliquer aux dimensions finales
            fontPath = 'path/to/font.ttf'
        } = options;
        

        opentype.load(fontPath, function (err, font) {
            if (err) {
                console.error('Erreur lors du chargement de la police:', err);
                return reject(err);
            }

            let ropeLength = 0;
            let globalBBox = null; // Bounding box global du texte

            // Calcul de la hauteur de ligne en se basant sur les métriques de la police
            const computedLineHeight = (font.ascender - font.descender) * (fontSize / font.unitsPerEm);

            // Séparation du texte en lignes (en cas de retours à la ligne)
            const lines = text.split('\n');

            // Parcours de chaque ligne
            for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
                const line = lines[lineIndex];
                let xOffset = 0; // Décalage horizontal pour la ligne
                let yOffset = lineIndex * computedLineHeight; // Décalage vertical selon la ligne

                // Parcours de chaque caractère de la ligne
                for (let i = 0; i < line.length; i++) {
                    const char = line[i];
                    const glyph = font.charToGlyph(char);

                    // Obtention du chemin du glyphe positionné à (xOffset, yOffset)
                    const glyphPath = glyph.getPath(xOffset, yOffset, fontSize);
                    

                    // Calcul de la longueur du contour du glyphe (fonction à définir séparément)
                    const glyphLength = actnsCalculateGlyphLength(font, char, fontSize);

                    ropeLength += glyphLength;

                    // Récupération du bounding box du glyphe
                    const bbox = glyphPath.getBoundingBox();

                    // Agrandissement du bbox pour tenir compte de l'épaisseur du tube
                    const expandedBBox = {
                        x1: bbox.x1 - tubeThickness / 2,
                        y1: bbox.y1 - tubeThickness / 2,
                        x2: bbox.x2 + tubeThickness / 2,
                        y2: bbox.y2 + tubeThickness / 2,
                    };

                    // Construction du bounding box global
                    if (!globalBBox) {
                        globalBBox = { ...expandedBBox };
                    } else {
                        globalBBox.x1 = Math.min(globalBBox.x1, expandedBBox.x1);
                        globalBBox.y1 = Math.min(globalBBox.y1, expandedBBox.y1);
                        globalBBox.x2 = Math.max(globalBBox.x2, expandedBBox.x2);
                        globalBBox.y2 = Math.max(globalBBox.y2, expandedBBox.y2);
                    }

                    // Mise à jour de l'offset horizontal : 
                    // On avance de l'advanceWidth du glyphe (mise à l'échelle) plus l'espacement entre caractères
                    xOffset += glyph.advanceWidth * (fontSize / font.unitsPerEm) + charSpacing;
                }
            }

            // Calcul de la largeur et de la hauteur à partir du bounding box global
            let width = globalBBox ? (globalBBox.x2 - globalBBox.x1) : 0;
            let height = globalBBox ? (globalBBox.y2 - globalBBox.y1) : 0;

            // Ajout des marges (de chaque côté)
            width += margin * 2;
            height += margin * 2;

            // Application du facteur d'échelle sur toutes les dimensions
            ropeLength *= scaleFactor;
            width *= scaleFactor;
            height *= scaleFactor;

            // Retourne le résultat sous forme d'objet
            resolve({
                ropeLength,
                width,
                height
            });
        });
    });
}
