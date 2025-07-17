'use client';

import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { Slider } from '@mui/material';
import getCroppedImg from '@/utils/cropImage';
import InstituteLayout from '@/components/institute/page-layout';

export default function InstituteCardUploader() {
  const [step, setStep] = useState('front');
  const [image, setImage] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const [frontImage, setFrontImage] = useState(null);
  const [backImage, setBackImage] = useState(null);
  const [frontBlob, setFrontBlob] = useState(null);
  const [backBlob, setBackBlob] = useState(null);

  const [designName, setDesignName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        setImage(null);
      } else {
        setBackImage(previewUrl);
        setBackBlob(blob);
        setStep('done');
        setImage(null);
      }
    } catch (err) {
      console.error('Cropping failed:', err);
      alert('Cropping failed. Check console.');
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
    setDesignName('');
  };

  const handleSubmitDesign = async () => {
    if (!designName || !frontBlob || !backBlob) {
      alert('Missing design name or images.');
      return;
    }

    const toBase64 = (blob) =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

    setIsSubmitting(true);

    try {
      const frontBase64 = await toBase64(frontBlob);
      const backBase64 = await toBase64(backBlob);

      const res = await fetch('/api/institute/card-designs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: designName,
          front_img: frontBase64,
          back_img: backBase64,
        }),
      });

      const data = await res.json();

      if (data.success) {
        alert('✅ Design uploaded!');
        handleReset();
      } else {
        alert(`❌ Upload failed: ${data.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Upload error:', err);
      alert('Upload failed. Check console.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <InstituteLayout>
    <div className="max-w-xl mx-auto p-6 bg-white rounded shadow space-y-6">
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
              aspect={2 / 3}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCrop}
              cropShape="rect"
              showGrid
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Zoom</label>
            <Slider value={zoom} min={0.5} max={3} step={0.1} onChange={(e, z) => setZoom(z)} />
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleCropAndContinue}
              className="flex-1 bg-sky-500 text-white py-2 rounded hover:bg-sky-700"
            >
              {step === 'front' ? 'Crop Front' : 'Crop Back'}
            </button>
            <button
              onClick={handleReset}
              className="flex-1 bg-gray-300 text-gray-800 py-2 rounded hover:bg-gray-400"
            >
              Reset
            </button>
          </div>
        </>
      )}

      {step === 'done' && (
        <div className="space-y-4">
          <div className="flex gap-4">
            <div>
              <p className="text-sm font-medium">Front</p>
              <img src={frontImage} className="w-[200px] h-[300px] object-cover border rounded" />
            </div>
            <div>
              <p className="text-sm font-medium">Back</p>
              <img src={backImage} className="w-[200px] h-[300px] object-cover border rounded" />
            </div>
          </div>

          <input
            type="text"
            value={designName}
            onChange={(e) => setDesignName(e.target.value)}
            placeholder="Design Name"
            className="w-full border px-3 py-2 rounded"
          />

          <button
            onClick={handleSubmitDesign}
            disabled={isSubmitting}
            className="w-full bg-emerald-600 text-white py-2 rounded hover:bg-emerald-800 disabled:opacity-50"
          >
            {isSubmitting ? 'Uploading...' : 'Upload Design'}
          </button>
        </div>
      )}
    </div>
    </InstituteLayout>
  );
}
