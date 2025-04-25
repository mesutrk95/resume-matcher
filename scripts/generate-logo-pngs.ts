import { getDirectoryFiles } from './utils';

import * as fs from 'fs';
import * as path from 'path';
import svg2img from 'svg2img';

// const svg2img = require('svg2img');

const toImage = (svgData: string, size: number): Promise<Buffer> =>
  new Promise(resolve => {
    svg2img(
      svgData,
      {
        resvg: {
          fitTo: {
            mode: 'height', // or height
            value: size,
          },
        },
      },
      function (error: any, buffer: Buffer) {
        //returns a Buffer
        resolve(buffer);
      },
    );
  });

(async () => {
  const targetPath = process.argv[2];
  if (!targetPath) {
    console.error('Please provide a file or directory path');
    process.exit(1);
  }

  const outputPath = process.argv[3];
  if (!outputPath) {
    console.error('Please provide output directory path');
    process.exit(1);
  }

  const files = await getDirectoryFiles(targetPath, '.svg');
  const sizes = [16, 32, 64, 128, 256, 512, 1024, 2048];

  // create resolution directories
  for (const size of sizes) {
    if (!fs.existsSync(path.join(outputPath, size.toString()))) {
      fs.mkdirSync(path.join(outputPath, size.toString()));
    }
  }

  // save logos
  for (const file of files) {
    const svgdata = fs.readFileSync(file, 'utf-8');
    for (const size of sizes) {
      const buffer = await toImage(svgdata, size);
      const filename = path.basename(file, path.extname(file));
      const dist = path.join(outputPath, size.toString(), `${filename}.png`);
      fs.writeFileSync(dist, buffer);
      console.log(`saving ${dist} ...`);
    }
  }
})();
