import { createImage } from './helpers/createImage';

export default async function getCroppedImg(imageSrc, pixelCrop, width, height) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    width,
    height
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob); // You can send this Blob to backend or preview it
    }, 'image/jpeg');
  });
}
