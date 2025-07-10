'use client';

import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { Slider } from '@mui/material';
import getCroppedImg from '@/utils/cropImage';

export default function ImageCropper({ onCropComplete = () => {} }) {
  const [step, setStep] = useState('front'); // 'front' -> 'back' -> 'done'
  const [image, setImage] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const [frontImage, setFrontImage] = useState(null);
  const [backImage, setBackImage] = useState(null);
  const [frontBlob, setFrontBlob] = useState(null);
  const [backBlob, setBackBlob] = useState(null);

  const onFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCroppedAreaPixels(null);
    }
  };

  const onCrop = useCallback((_, areaPixels) => {
    setCroppedAreaPixels(areaPixels);
  }, []);

  const handleCropAndContinue = async () => {
    try {
      const blob = await getCroppedImg(image, croppedAreaPixels, 200, 300);
      const previewUrl = URL.createObjectURL(blob);

      if (step === 'front') {
        setFrontImage(previewUrl);
        setFrontBlob(blob);
        setStep('back');
        setImage(null); // reset for next upload
      } else if (step === 'back') {
        setBackImage(previewUrl);
        setBackBlob(blob);
        setStep('done');
        setImage(null);
        onCropComplete({ front: blob, back: blob });
      }
    } catch (err) {
      console.error('Cropping failed:', err);
    }
  };

  const handleReset = () => {
    setStep('front');
    setImage(null);
    setFrontImage(null);
    setBackImage(null);
    setFrontBlob(null);
    setBackBlob(null);
    setZoom(1);
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-md shadow space-y-6">
      {step !== 'done' && !image && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Upload {step === 'front' ? 'Front' : 'Back'} Side of ID Card:
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={onFileChange}
            className="file:mr-4 file:py-2 file:px-4
                       file:rounded file:border-0
                       file:text-sm file:font-semibold
                       file:bg-sky-200 file:text-gray-700
                       hover:file:bg-sky-300 max-w-xs hover:cursor-pointer"
          />
        </div>
      )}

      {image && (
        <>
          <div className="relative w-full h-[300px] bg-gray-100 rounded overflow-hidden shadow">
            <Cropper
              image={image}
              crop={crop}
              zoom={zoom}
              aspect={2 / 3} // 200x300 = 2:3
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
              sx={{ color: '#0ea5e9' }}
            />
          </div>

          <div className="flex justify-between gap-4">
            <button
              onClick={handleCropAndContinue}
              className="flex-1 bg-sky-500 text-white py-2 rounded hover:bg-sky-700 transition"
            >
              {step === 'front' ? 'Crop Front' : 'Crop Back'}
            </button>
            <button
              onClick={handleReset}
              className="flex-1 bg-gray-300 text-gray-800 py-2 rounded hover:bg-gray-400 transition"
            >
              Reset
            </button>
          </div>
        </>
      )}

      {step === 'done' && (
        <div className="space-y-4">
          <h2 className="text-md font-semibold text-gray-700">Cropped Previews:</h2>
          <div className="flex justify-between gap-4">
            <div className="text-center">
              <p className="text-sm font-medium">Front</p>
              <img
                src={frontImage}
                alt="Front ID"
                className="w-[200px] h-[300px] object-cover border rounded"
              />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium">Back</p>
              <img
                src={backImage}
                alt="Back ID"
                className="w-[200px] h-[300px] object-cover border rounded"
              />
            </div>
          </div>
          <button
            onClick={() => onCropComplete({ front: frontBlob, back: backBlob })}
            className="w-full bg-sky-600 text-white py-2 rounded hover:bg-sky-800 transition"
          >
            Submit Both Images
          </button>
        </div>
      )}
    </div>
  );
}
