import sharp from 'sharp';

const DEFAULT_MAX_SIDE = 1600;
const DEFAULT_QUALITY = 82;

const parseDataUrl = (dataUrl) => {
  const match = /^data:(.*?);base64,(.+)$/i.exec(dataUrl || '');
  if (!match) {
    throw new Error('Invalid data URL');
  }
  const [, mime, base64] = match;
  return { mime, buffer: Buffer.from(base64, 'base64') };
};

/**
 * Compress a base64 data URL to a JPEG capped at the given max side.
 */
export async function compressBase64Image(dataUrl, options = {}) {
  const maxSide = options.maxSide || DEFAULT_MAX_SIDE;
  const quality = options.quality || DEFAULT_QUALITY;

  const { buffer } = parseDataUrl(dataUrl);

  const outputBuffer = await sharp(buffer)
    .rotate()
    .resize({ width: maxSide, height: maxSide, fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality, chromaSubsampling: '4:4:4' })
    .toBuffer();

  return `data:image/jpeg;base64,${outputBuffer.toString('base64')}`;
}
