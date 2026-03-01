const fs = require('fs');
const PDFParser = require("pdf2json");
const path = require('path');

const dir = "C:/Users/jimmy/.gemini/antigravity/scratch/reading-intervention/Resources";
const files = fs.readdirSync(dir).filter(f => f.endsWith('.pdf'));

if (!fs.existsSync("tmp")) fs.mkdirSync("tmp");

function parsePdf(filePath, fileName) {
    return new Promise((resolve, reject) => {
        const pdfParser = new PDFParser(this, 1);

        pdfParser.on("pdfParser_dataError", errData => {
            console.error(`Error processing ${fileName}:`, errData.parserError);
            resolve();
        });

        pdfParser.on("pdfParser_dataReady", pdfData => {
            const text = pdfParser.getRawTextContent().replace(/\r\n/g, "\n").trim();
            fs.writeFileSync(`tmp/${fileName}.txt`, text);
            console.log(`Saved full text for ${fileName}`);
            resolve();
        });

        pdfParser.loadPDF(filePath);
    });
}

async function processAll() {
    for (const file of files) {
        const filePath = path.join(dir, file);
        await parsePdf(filePath, file);
    }
}

processAll();
