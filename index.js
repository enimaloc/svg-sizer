const fs = require("fs");
const fetch = require('node-fetch');
const core = require("@actions/core");
const sharp = require("sharp")

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
        fs.mkdirSync(inputFolder);
        if (fs.existsSync(inputFile)) {
            let lineReader = require('readline').createInterface({
                input: require('fs').createReadStream(inputFile)
            });

            lineReader.on('line', async function (line) {
                console.log(line);
                let filename = line.split('/').pop();
                const response = await fetch(line);
                const buffer = await response.buffer();
                fs.writeFile(`${outputFolder}/${filename}`, buffer, () => {});
            });
        }
    }
    fs.readdirSync(inputFolder).forEach(file => {
        if (fs.stat(file).isFile()) {
            let dimensions = dimension.split("x");
            sharp(file).png()
                .resize(parseInt(dimensions[0]), parseInt(dimensions[1]))
                .toFile(outputFolder + "/" + file)
                .then(() => console.log("Successfully resized " + file + " as " + dimension))
        }
    });
    if (!exist) {
        fs.rmdirSync(inputFolder)
    }
} catch (error) {
    console.log(error);
    core.setFailed(error)
}