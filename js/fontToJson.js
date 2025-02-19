async function actnsConvertFontToJSON(url) {
    try {
        // Charger le fichier de police depuis l'URL
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();

        // Parser le fichier de police avec opentype.js
        const font = opentype.parse(arrayBuffer);
        const glyphsArray = Object.values(font.glyphs?.glyphs || {});

        // Extraire les glyphes et les stocker dans un objet
        const glyphs = {};

        
        glyphsArray.forEach(glyph => {
            if (glyph.unicode !== undefined) {
                const path = glyph.getPath(0, 0, 72);
                const boundingBox = path.getBoundingBox();

                glyphs[String.fromCharCode(glyph.unicode)] = {
                    x_min: Math.round(boundingBox.x1),
                    x_max: Math.round(boundingBox.x2),
                    y_min: -Math.round(boundingBox.y2),
                    y_max: -Math.round(boundingBox.y1),
                    ha: Math.round((glyph.advanceWidth || font.unitsPerEm / 2) * .08), // Réduction de l'espacement
                    o: path.commands.map(cmd => {
                        let cmdStr = cmd.type.toLowerCase();
                        if (cmd.x !== undefined && cmd.y !== undefined)
                            cmdStr += ` ${Math.round(cmd.x)} ${-Math.round(cmd.y)}`;
                        if (cmd.x1 !== undefined && cmd.y1 !== undefined)
                            cmdStr += ` ${Math.round(cmd.x1)} ${-Math.round(cmd.y1)}`;
                        if (cmd.x2 !== undefined && cmd.y2 !== undefined)
                            cmdStr += ` ${Math.round(cmd.x2)} ${-Math.round(cmd.y2)}`;
                        return cmdStr;
                    }).join(" ")
                };
            }
        });

        // Déterminer les limites globales de la police
        let xMin = Math.min(...glyphsArray.map(g => g.xMin || 0));
        let xMax = Math.max(...glyphsArray.map(g => g.xMax || 0));

        // Retourner un objet JSON compatible avec Three.js
        return {
            familyName: font.names.fontFamily.en,
            ascender: Math.round(font.ascender),
            descender: Math.round(font.descender),
            boundingBox: {
                yMin: -Math.round(font.tables.head.yMax),
                yMax: -Math.round(font.tables.head.yMin),
                xMin: Math.round(xMin),
                xMax: Math.round(xMax)
            },
            resolution: 1000,
            underlineThickness: Math.round(font.tables.post.underlineThickness),
            glyphs: glyphs
        };
    } catch (error) {
        console.error("Erreur lors du chargement ou du parsing de la police :", error);
        throw error;
    }
}
