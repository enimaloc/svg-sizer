const fs = require("fs");
const core = require("@actions/core");
const sharp = require("sharp")
const axios = require("axios");

const outputFolder = core.getInput("output-folder") || './out';
const inputFolder = core.getInput("input-folder") || './in';
const inputFile = core.getInput("input-file") || './in.txt';
const dimension = core.getInput("dimension") || '16x16';

try {
    if (!fs.existsSync(outputFolder)) {
        fs.mkdirSync(outputFolder)
    }
    let exist = fs.existsSync(inputFolder);
    if (!exist) {
        if (fs.existsSync(inputFile)) {
            let lineReader = require('readline').createInterface({
                input: fs.createReadStream(inputFile)
            });

            lineReader.on('line', async function (line) {
                console.log(line);
                let filename = line.split('/').pop();

                const response = await axios.get(line,  { responseType: 'arraybuffer' })
                const buffer = Buffer.from(response.data, "utf-8")

                console.log(`Processing file: ${line}`);
                let fileOut = `${outputFolder}/${filename.split('.').slice(0, -1).join('.')}.png`;
                console.log(`Output: ${fileOut}`);
                let dimensions = dimension.split("x");
                sharp(buffer)
                    .png()
                    .resize(parseInt(dimensions[0]), parseInt(dimensions[1]))
                    .toFile(fileOut)
                    .then(() => console.log("Successfully resized " + line + " as " + dimension))
                    .catch(error => console.log(error + " | " + line))
            });

        }
    } else {
        fs.readdirSync(inputFolder).forEach(file => {
            console.log(`Processing file: ${inputFolder}/${file}`);
            if (fs.statSync(`${inputFolder}/${file}`).isFile()) {
                let fileOut = `${outputFolder}/${file.split('.').slice(0, -1).join('.')}.png`;
                console.log(`Output: ${fileOut}`);
                let dimensions = dimension.split("x");
                sharp(`${inputFolder}/${file}`).png()
                    .resize(parseInt(dimensions[0]), parseInt(dimensions[1]))
                    .toFile(fileOut)
                    .then(() => console.log(`Successfully resized ${inputFolder}/${file} as ${dimension}`))
                    .catch(error => console.log(error+" | "+`${inputFolder}/${file}`));
            }
        });
    }
} catch (error) {
    console.log(error);
    core.setFailed(error)
}