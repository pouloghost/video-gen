import sharp from 'sharp';
import * as fs from 'fs-extra';
import * as path from 'path';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

const argv = yargs(hideBin(process.argv))
    .option('folder', {
        alias: 'f',
        type: 'string',
        description: 'Input folder containing images',
        demandOption: true,
    })
    .option('size', {
        alias: 's',
        type: 'number',
        description: 'Output image size (width/height)',
        default: 2048,
    })
    .option('center', {
        alias: 'c',
        type: 'number',
        description: 'Center square size ratio (0-1)',
        default: 0.2,
    })
    .parseSync();

async function main() {
    const folderPath = path.resolve(argv.folder);
    const outputSize = argv.size;
    const centerRatio = argv.center;
    const centerSize = outputSize * centerRatio;

    console.log(`Processing folder: ${folderPath}`);
    console.log(`Output size: ${outputSize}x${outputSize}`);

    const images: Record<string, string | null> = {
        front: null,
        back: null,
        left: null,
        right: null,
    };

    const files = await fs.readdir(folderPath);

    for (const key of Object.keys(images)) {
        const file = files.find(f => f.toLowerCase().startsWith(key) && /\.(png|jpg|jpeg)$/i.test(f));
        if (file) {
            console.log(`Found ${key}: ${file}`);
            images[key] = path.join(folderPath, file);
        } else {
            console.warn(`Warning: Could not find image for ${key}`);
        }
    }

    // Create background
    let compositeOps: sharp.OverlayOptions[] = [];

    // Helper to create trapezoid SVG mask
    // Points are relative to the bounding box of the trapezoid section
    // But simpler to define the mask for the whole image size and composite
    function createTrapezoidSvg(p1: [number, number], p2: [number, number], p3: [number, number], p4: [number, number]) {
        return Buffer.from(`
      <svg width="${outputSize}" height="${outputSize}">
        <path d="M${p1[0]},${p1[1]} L${p2[0]},${p2[1]} L${p3[0]},${p3[1]} L${p4[0]},${p4[1]} Z" fill="white"/>
      </svg>
    `);
    }

    // Coordinates
    const cx = (outputSize - centerSize) / 2;
    const cy = (outputSize - centerSize) / 2;
    const cRight = cx + centerSize;
    const cBottom = cy + centerSize;

    // Process each image
    // We need to:
    // 1. Load image
    // 2. Rotate it
    // 3. Resize to cover the target area (roughly)
    // 4. Apply mask
    // 5. Composite

    // Since sharp composites in order, we can just composite the masked images on top of black background.
    // However, masking in sharp is usually done by `composite` with `blend: 'dest-in'`.
    // So for each image:
    //   Create a new blank image of outputSize
    //   Composite the rotated/resized image onto it at the right place?
    //   Actually, better:
    //   1. Create the trapezoid mask (white on transparent) for the specific section.
    //   2. Load the source image, rotate it, resize it to fill the screen (or the section).
    //   3. Composite the source image onto the mask with `blend: 'in'` (keep source where mask is opaque).
    //   4. Add to main composite list.

    // Wait, `blend: 'in'` keeps the source where the destination (mask) is.
    // So:
    // Base: Mask (White shape on transparent)
    // Composite: Source Image (Rotated/Scaled) with blend 'in'.
    // Result: Shaped image.
    // Then composite that result onto the main canvas.

    async function processSection(
        imagePath: string,
        p1: [number, number], p2: [number, number], p3: [number, number], p4: [number, number],
        rotation: number
    ) {
        // 1. Create Mask
        const maskSvg = createTrapezoidSvg(p1, p2, p3, p4);

        // 2. Prepare Image
        // We need the image to cover the trapezoid area.
        // The trapezoid is roughly half the screen height/width.
        // Let's resize image to outputSize to be safe (cover), then rotate.
        // Actually, rotation changes dimensions.
        // If we rotate 90/270, width becomes height.

        let img = sharp(imagePath);
        const metadata = await img.metadata();

        // Rotate first
        img = img.rotate(rotation);

        // Resize to cover the whole canvas (simplest way to ensure it covers the mask)
        // Or better, resize to cover the bounding box of the trapezoid?
        // Covering the whole canvas is safer and easier logic, though slightly less efficient.
        // Given 2048x2048, it's fine.
        img = img.resize(outputSize, outputSize, { fit: 'cover' });

        // 3. Masking
        // We want to cut out the trapezoid from this image.
        // Sharp way:
        // Create a pipeline starting with the mask? No, mask is shape.
        // Start with image, composite mask with 'dest-in'?
        // 'dest-in': The destination is retained only where the source is opaque.
        // If we start with Image (Dest) and composite Mask (Source) with 'dest-in':
        // Result is Image where Mask is opaque.

        // But our mask is SVG.
        const masked = await img
            .composite([{ input: maskSvg, blend: 'dest-in' }])
            .toBuffer();

        return masked;
    }

    // Front (Bottom, Red) - Upside down (180)
    // Points: BL(0, size), BR(size, size), InnerBR(cRight, cBottom), InnerBL(cx, cBottom)
    if (images.front) {
        const buffer = await processSection(images.front,
            [0, outputSize], [outputSize, outputSize], [cRight, cBottom], [cx, cBottom],
            180
        );
        compositeOps.push({ input: buffer });
    }

    // Back (Top, Yellow) - Normal (0)
    // Points: TL(0,0), TR(size,0), InnerTR(cRight, cy), InnerTL(cx, cy)
    if (images.back) {
        const buffer = await processSection(images.back,
            [0, 0], [outputSize, 0], [cRight, cy], [cx, cy],
            0
        );
        compositeOps.push({ input: buffer });
    }

    // Left (Left, Blue) - 270 deg
    // Points: TL(0,0), BL(0, size), InnerBL(cx, cBottom), InnerTL(cx, cy)
    if (images.left) {
        const buffer = await processSection(images.left,
            [0, 0], [0, outputSize], [cx, cBottom], [cx, cy],
            270
        );
        compositeOps.push({ input: buffer });
    }

    // Right (Right, Green) - 90 deg
    // Points: TR(size, 0), BR(size, size), InnerBR(cRight, cBottom), InnerTR(cRight, cy)
    if (images.right) {
        const buffer = await processSection(images.right,
            [outputSize, 0], [outputSize, outputSize], [cRight, cBottom], [cRight, cy],
            90
        );
        compositeOps.push({ input: buffer });
    }

    // Final Composition
    // Start with black background
    const final = sharp({
        create: {
            width: outputSize,
            height: outputSize,
            channels: 4,
            background: { r: 0, g: 0, b: 0, alpha: 1 }
        }
    })
        .composite(compositeOps);

    const outPath = path.join(folderPath, 'merged.png');
    await final.toFile(outPath);
    console.log(`Saved merged image to: ${outPath}`);
}

main().catch(console.error);
