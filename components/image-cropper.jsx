'use client';

import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { Slider } from '@mui/material';
import getCroppedImg from '@/utils/cropImage';

export default function ImageCropper({ onCropComplete = () => {} }) {
  const [image, setImage] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [croppedImageUrl, setCroppedImageUrl] = useState(null);
  const [croppedBlob, setCroppedBlob] = useState(null);

  const onFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
      setCroppedImageUrl(null);
      setCroppedBlob(null);
    }
  };

  const onCrop = useCallback((_, areaPixels) => {
    setCroppedAreaPixels(areaPixels);
  }, []);

  const handleCropPreview = async () => {
    try {
      const blob = await getCroppedImg(image, croppedAreaPixels, 300, 200);
      const previewUrl = URL.createObjectURL(blob);
      setCroppedImageUrl(previewUrl);
      setCroppedBlob(blob);
    } catch (err) {
      console.error('Crop error:', err);
    }
  };

  const handleSave = () => {
    if (croppedBlob) {
      console.log(croppedBlob);   //here
    }
  };

  const handleReset = () => {
    setImage(null);
    setCroppedImageUrl(null);
    setCroppedBlob(null);
    setZoom(1);
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-md shadow space-y-6">
      {!image && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Upload ID Card Image:
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={onFileChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
      )}

      {image && !croppedImageUrl && (
        <>
          <div className="relative w-full h-[300px] bg-gray-100 rounded overflow-hidden shadow">
            <Cropper
              image={image}
              crop={crop}
              zoom={zoom}
              aspect={3 / 2}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCrop}
              cropShape="rect"
              showGrid={true}
            />
          </div>

          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">Zoom</label>
            <Slider
              value={zoom}
              min={0.5}
              max={3}
              step={0.1}
              onChange={(e, z) => setZoom(z)}
              aria-label="Zoom"
              sx={{
                color: '#0ea5e9',
              }}
            />
          </div>

          <div className="flex justify-between gap-4">
            <button
              onClick={handleCropPreview}
              className="flex-1 bg-sky-500 text-white py-2 rounded hover:bg-sky-700 transition"
            >
              Continue
            </button>
            <button
              onClick={handleReset}
              className="flex-1 bg-gray-300 text-gray-800 py-2 rounded hover:bg-gray-400 transition"
            >
              Upload New Card
            </button>
          </div>
        </>
      )}

      {croppedImageUrl && (
        <div className="space-y-4">
          <h2 className="text-md font-semibold text-gray-700">Cropped Preview:</h2>
          <img
            src={croppedImageUrl}
            alt="Cropped"
            className="w-[300px] h-[200px] border rounded object-cover mx-auto"
          />
          <div className="flex justify-between gap-4">
            <button
              onClick={handleSave}
              className="flex-1 bg-sky-400 text-white py-2 rounded hover:bg-green-800 transition"
            >
              Save Image
            </button>
            <button
              onClick={handleReset}
              className="flex-1 bg-gray-300 text-gray-800 py-2 rounded hover:bg-gray-400 transition"
            >
              Upload New Card
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
