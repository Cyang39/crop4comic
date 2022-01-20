import Jimp from "jimp";

const uniq = (arr: any[]) => Array.from(new Set(arr));
const to100 = (arr: any[]) => (1 - uniq(arr).length / arr.length) * 100

function border2Top(image: Jimp, sillValue = 99) {
  let borderPixels = 0;
  for (let y = 0; y < image.getHeight(); y++) {
    let line_pixels = [];
    for (let x = 0; x < image.getWidth(); x++) {
      let rgba = image.getPixelColor(x, y);
      line_pixels.push(rgba);
    }
    borderPixels++;
    if (to100(line_pixels) <= sillValue)
      return borderPixels;
  }
}

export async function cropBorders(inputBlob: Blob, type: string) {
  const url = URL.createObjectURL(inputBlob)
  const image = await Jimp.read(url);
  URL.revokeObjectURL(url);

  let topCrop = border2Top(image);
  console.log(topCrop);
  image.rotate(90);
  let rightCrop = border2Top(image);
  console.log(rightCrop);
  image.rotate(90);
  let bottonCrop = border2Top(image);
  console.log(bottonCrop);
  image.rotate(90);
  let leftCrop = border2Top(image);
  console.log(leftCrop);
  image.rotate(90);

  image.crop(leftCrop, topCrop,
    image.getWidth() - (rightCrop + leftCrop),
    image.getHeight() - (topCrop + bottonCrop)
  )

  const typeMap = {
    "image/jpg": Jimp.MIME_JPEG,
    "image/jpeg": Jimp.MIME_JPEG,
    "image/png": Jimp.MIME_PNG,
    "image/bmp": Jimp.MIME_BMP,
    "image/gif": Jimp.MIME_GIF,
    "image/tiff": Jimp.MIME_TIFF
  }

  const base64 = await image.getBufferAsync(typeMap[type]);
  return new Blob([base64], { type })
}
