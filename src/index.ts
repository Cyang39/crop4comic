import JSZip from "jszip";
import { saveAs } from "file-saver";
import { cropImageBorder } from "./crop-border";

var input = document.getElementById('file');

function myLog(str: string, slot: string) {
  var elm = document.querySelector("#" + slot);
  if (!elm) {
    elm = document.createElement("div");
    elm.setAttribute("id", slot);
    document.querySelector("#log").append(elm);
  }
  elm.innerHTML = "<p>" + str + "</p>"
}

async function handleFile(file: File) {
  const inputFile_name = file.name.split(".").slice(0, -1).join(".");
  const inputFile_ext = file.name.split(".").pop();
  if (file.type.match(/image\/.+/)) {
    // crap single file.
    var cropped = await cropImageBorder(file);
    saveAs(cropped, `${inputFile_name}-cropped.${inputFile_ext}`)
  } else {
    // crap epub/cbz file.
    const zipFile = await JSZip.loadAsync(file);
    const imageFiles = zipFile.filter(function (relativePath, file) {
      return relativePath.match(/.+\.(JPEG|JPG|PNG|png|jpg|jpeg|jfif)$/) !== null;
    });

    for (var i = 0; i < imageFiles.length; i++) {
      myLog("processing: " + (i + 1) + "/" + imageFiles.length, "default");
      const imageFile = imageFiles[i];
      const name = imageFile.name;
      const inputBlob = await imageFile.async("blob");
      const outputBlob = await cropImageBorder(inputBlob);
      zipFile.remove(name);
      zipFile.file(name, outputBlob);
    }
    myLog("building, it will auto download then...", "default")
    var outZipFile = await zipFile.generateAsync({ type: "blob" });

    saveAs(outZipFile, `${inputFile_name}-cropped.${inputFile_ext}`);
  }
}

input.addEventListener('change', async function (evt) {
  const inputFile = (<HTMLInputElement>evt.target).files[0];
  handleFile(inputFile);
}, false);