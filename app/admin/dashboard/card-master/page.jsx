import DashboardLayout from '@/components/admin/page-layout'
import ImageCropper from '@/components/image-cropper'
import React from 'react'

const page = () => {
  return (
    <DashboardLayout>
      <h1 className='text-2xl font-semibold mb-6 text-gray-800'>Upload New Id card</h1>
      <ImageCropper/>
    </DashboardLayout>
  )
}

export default page