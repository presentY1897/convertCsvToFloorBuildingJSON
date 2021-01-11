const fs = require('fs');
const path = require('path');
const csvParse = require('csv-parse');

const resourcePath = 'resource';
const resultPath = 'result';
const main = async() => {
    const buildingShapeFilePath = path.resolve(__dirname, resourcePath, 'building.csv');
    const getCsvData = (path) => {
        return new Promise((resolve, reject) => {
            const csvData = [];
            try {
                fs.createReadStream(path)
                    .pipe(csvParse({ delimiter: ',' }))
                    .on('data', row => csvData.push(row))
                    .on('end', () => resolve(csvData));
            } catch {
                reject();
            }
        });
    };
    const result = await getCsvData(buildingShapeFilePath);
    result.splice(0, 1);

    const firstDiff = 5;
    const otherDiff = 3;
    const arrayToJSONString = (arr) => {
        return '{\n' + arr.map(data => data.key + ':[' + data.value.toString() + ']').join('\n,') + '\n}';
    };
    const writeJSONResult = (path, data) => {
        fs.writeFileSync(path, data);
    };
    (function createBuildingJSONFile() {
        const makeBuildingJSON = (data, idColumnIdx, lowHeightIdx, highHeightIdx) => {
            const getFloorCount = (heightDiff, firstDiff, otherDiff) => {
                const leftedHeight = heightDiff - firstDiff;
                if (leftedHeight <= 0) {
                    return [firstDiff, 0, 1];
                } else {
                    const floor = Math.ceil(leftedHeight / otherDiff);
                    return [firstDiff, 0, floor + 1];
                }
            };
            const floorData = data
                .map(line => { return { id: line[idColumnIdx], lowHeight: line[lowHeightIdx], highHeight: line[highHeightIdx] } })
                .map(value => {
                    return { key: value.id, value: getFloorCount(value.highHeight - value.lowHeight, firstDiff, otherDiff) }
                });
            return floorData;
        };

        const buildingJSON = arrayToJSONString(makeBuildingJSON(result, 0, 3, 6));
        const buildingPath = path.resolve(__dirname, resultPath, 'building.json');
        writeJSONResult(buildingPath, buildingJSON);
    })();
    (function createFloorJSONFile() {
        const makeFloorJSON = (data, idColumnIdx, lowHeightIdx, highHeightIdx) => {
            const getFloorCount = (heightDiff, firstDiff, otherDiff) => {
                const leftedHeight = heightDiff - firstDiff;
                if (leftedHeight <= 0) {
                    return [firstDiff, 0, 1];
                } else {
                    const floor = Math.ceil(leftedHeight / otherDiff);
                    return [firstDiff, 0, floor + 1];
                }
            };
            const floorData = data
                .map(line => { return { id: line[idColumnIdx], lowHeight: line[lowHeightIdx], highHeight: line[highHeightIdx] } })
                .map(value => {
                    const floorHeight = getFloorCount(value.highHeight - value.lowHeight, firstDiff, otherDiff);
                    const floor = floorHeight[2];
                    const floorData = [30, 50];
                    for (let i = 0; i < floor; i++) {
                        const value = Math.floor(Math.random() * 4);
                        floorData.push(value);
                    }
                    return { key: value.id, value: floorData }
                });
            return floorData;
        };

        const floorJSON = arrayToJSONString(makeFloorJSON(result, 0, 3, 6));
        const floorPath = path.resolve(__dirname, resultPath, 'floor.json');
        writeJSONResult(floorPath, floorJSON);
    })();
}

main();