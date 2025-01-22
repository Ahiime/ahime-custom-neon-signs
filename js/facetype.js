async function actnsConvertFontToThreeJS(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function (event) {
            try {
                const font = opentype.parse(event.target.result);
                const fontData = actnsConvert(font);
                resolve(fontData);
            } catch (error) {
                reject(error);
            }
        };
        reader.readAsArrayBuffer(file);
    });
}

function actnsConvert(font) {
    const scale = (1000 * 100) / ((font.unitsPerEm || 2048) * 72);
    const result = {
        glyphs: {},
        familyName: font.familyName,
        ascender: Math.round(font.ascender * scale),
        descender: Math.round(font.descender * scale),
        resolution: 1000,
        boundingBox: {
            yMin: Math.round(font.tables.head.yMin * scale),
            xMin: Math.round(font.tables.head.xMin * scale),
            yMax: Math.round(font.tables.head.yMax * scale),
            xMax: Math.round(font.tables.head.xMax * scale),
        },
        original_font_information: font.tables.name,
        cssFontWeight: font.styleName.toLowerCase().includes("bold") ? "bold" : "normal",
        cssFontStyle: font.styleName.toLowerCase().includes("italic") ? "italic" : "normal",
    };

    font.glyphs.forEach(glyph => {
        if (!glyph.unicode) return;
        const unicode = String.fromCharCode(glyph.unicode);

        result.glyphs[unicode] = {
            ha: Math.round(glyph.advanceWidth * scale),
            x_min: Math.round(glyph.xMin * scale),
            x_max: Math.round(glyph.xMax * scale),
            o: glyph.path.commands.map(cmd => {
                let cmdStr = cmd.type.toLowerCase();
                if (cmd.x !== undefined && cmd.y !== undefined) cmdStr += ` ${Math.round(cmd.x * scale)} ${Math.round(cmd.y * scale)}`;
                if (cmd.x1 !== undefined && cmd.y1 !== undefined) cmdStr += ` ${Math.round(cmd.x1 * scale)} ${Math.round(cmd.y1 * scale)}`;
                if (cmd.x2 !== undefined && cmd.y2 !== undefined) cmdStr += ` ${Math.round(cmd.x2 * scale)} ${Math.round(cmd.y2 * scale)}`;
                return cmdStr;
            }).join(" "),
        };
    });

    return JSON.stringify(result, null, 2);
}
