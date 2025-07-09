export const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.setAttribute('crossOrigin', 'anonymous'); // Needed to avoid CORS issues
    image.onload = () => resolve(image);
    image.onerror = (err) => reject(err);
    image.src = url;
  });
