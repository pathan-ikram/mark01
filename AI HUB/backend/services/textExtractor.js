const fs = require("fs");
const path = require("path");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const xlsx = require("xlsx");

async function extractText(filePath, originalname) {
    const ext = path.extname(originalname).toLowerCase();

    switch (ext) {
        case ".pdf": {
            const buffer = fs.readFileSync(filePath);
            const data = await pdfParse(buffer);
            return data.text;
        }

        case ".docx": {
            const result = await mammoth.extractRawText({ path: filePath });
            return result.value;
        }

        case ".xlsx": {
            const workbook = xlsx.readFile(filePath);
            let text = "";
            workbook.SheetNames.forEach((sheetName) => {
                const sheet = workbook.Sheets[sheetName];
                text += xlsx.utils.sheet_to_csv(sheet) + "\n";
            });
            return text;
        }

        case ".csv":
        case ".txt":
        case ".md":
        case ".json": {
            return fs.readFileSync(filePath, "utf8");
        }

        default:
            throw new Error(`Unsupported file type for extraction: ${ext}`);
    }
}

module.exports = { extractText };