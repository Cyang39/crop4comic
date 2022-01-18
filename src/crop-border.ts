/**
 * @param blob An `image/*` type blob.
 * @param sillValue Adjust accuracy for cropping.
 * @returns A cropped image blob (in promise).
 */
export function cropImageBorder(blob: Blob, sillValue = 99): Promise<Blob> {
  return new Promise(function (resolve, reject) {
    var canvas = <HTMLCanvasElement>document.createElement("canvas");

    var ctx = canvas.getContext('2d');
    var img = new Image();

    img.src = URL.createObjectURL(blob);
    img.onload = function () {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0)

      var imageData = ctx.getImageData(1, 1, canvas.width, canvas.height);
      var borderTop = getWhiteTop(imageData, sillValue);
      var borderRight = getWhiteRight(imageData, sillValue);
      var borderBotton = getWhiteBotton(imageData, sillValue);
      var borderLeft = getWhiteLeft(imageData, sillValue);
      // 特殊页面, eg logo, small icon...
      // if ((borderTop > canvas.height / 3) ||
      //   (canvas.width - borderRight > canvas.width / 3) ||
      //   (canvas.height - borderBotton > canvas.height / 3) ||
      //   (borderLeft > canvas.width / 3)) {
      //     borderTop = borderRight = borderBotton = borderLeft = 0;
      // }

      canvas.height = img.height - (borderTop + borderBotton);
      canvas.width = img.width - (borderRight + borderLeft);
      ctx.drawImage(img, -borderLeft, -borderTop);

      canvas.toBlob(function (out) {
        resolve(out);
      }, blob.type)
    }
  })
};

function calValue(array: string[]) {
  return (1 - Array.from(new Set(array)).length / array.length) * 100
}

//https://stackoverflow.com/questions/667045/get-a-pixel-from-html-canvas#answer-27706656
function getPixelXY(imgData: ImageData, x: number, y: number) {
  function getPixel(imgData: ImageData, index: number) {
    var i = index * 4, d = imgData.data
    // return [d[i], d[i + 1], d[i + 2], d[i + 3]] // Returns array [R,G,B,A]
    return [d[i], d[i + 1], d[i + 2]]
  }
  return getPixel(imgData, y * imgData.width + x)
}

function getWhiteTop(imageData: ImageData, keyValue: number) {
  let result = 0;
  for (let line = 2; line < imageData.height; line++) {
    var rgba4line: string[] = []
    for (let i = 0; i < imageData.width; i++) {
      const rgba = getPixelXY(imageData, i, line).join("");
      rgba4line.push(rgba);
    }
    if (calValue(rgba4line) >= keyValue) result++;
    else return result;
  }
}

function getWhiteBotton(imageData: ImageData, keyValue: number) {
  let result = 0;
  for (let line = imageData.height - 2; line >= 0; line--) {
    var rgba4line: string[] = []
    for (let i = 0; i < imageData.width; i++) {
      const rgba = getPixelXY(imageData, i, line).join("");
      rgba4line.push(rgba);
    }
    if (calValue(rgba4line) >= keyValue) result++;
    else return result;
  }
}

function getWhiteRight(imageData: ImageData, keyValue: number) {
  let result = 0;
  for (let col = imageData.width - 2; col >= 0; col--) {
    var rgba4col: string[] = []
    for (let i = 0; i < imageData.height; i++) {
      const rgba = getPixelXY(imageData, col, i).join("");
      rgba4col.push(rgba);
    }
    if (calValue(rgba4col) >= keyValue) result++;
    else return result;
  }
}

function getWhiteLeft(imageData: ImageData, keyValue: number) {
  let result = 0;
  for (let col = 2; col < imageData.width; col++) {
    var rgba4col: string[] = []
    for (let i = 0; i < imageData.height; i++) {
      const rgba = getPixelXY(imageData, col, i).join("");
      rgba4col.push(rgba);
    }
    if (calValue(rgba4col) >= keyValue) result++;
    else return result;
  }
}
