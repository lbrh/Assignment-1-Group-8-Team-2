import sharp from 'sharp';

const IMAGE_SIZE = 128;
const IMAGENET_MEAN = [0.485, 0.456, 0.406];
const IMAGENET_STD = [0.229, 0.224, 0.225];

// Matches the training/export pipeline exactly: PIL Image.convert("RGB") ->
// torchvision transforms.Resize((128,128)) -> ToTensor() (scales to [0,1], HWC->CHW) ->
// Normalize(ImageNet mean/std). Output shape (1, 3, 128, 128): batch, channel, height,
// width — the rank-4 input the ONNX deployment expects.
export async function preprocessImage(imageBuffer: Buffer): Promise<number[][][][]> {
    const { data, info } = await sharp(imageBuffer)
        .rotate() // apply EXIF orientation, so a phone photo stored sideways reaches the model upright
        .removeAlpha()
        .toColourspace('srgb')
        .resize(IMAGE_SIZE, IMAGE_SIZE, { fit: 'fill', kernel: 'linear' })
        .raw()
        .toBuffer({ resolveWithObject: true });

    if (info.channels !== 3) {
        throw new Error(`expected 3 channels (RGB) after preprocessing, got ${info.channels}`);
    }

    const tensor: number[][][] = Array.from({ length: 3 }, () =>
        Array.from({ length: IMAGE_SIZE }, () => new Array<number>(IMAGE_SIZE).fill(0)),
    );

    for (let y = 0; y < IMAGE_SIZE; y++) {
        for (let x = 0; x < IMAGE_SIZE; x++) {
            const pixelOffset = (y * IMAGE_SIZE + x) * 3;
            for (let c = 0; c < 3; c++) {
                const scaled = data[pixelOffset + c] / 255;
                tensor[c][y][x] = (scaled - IMAGENET_MEAN[c]) / IMAGENET_STD[c];
            }
        }
    }

    return [tensor];
}
