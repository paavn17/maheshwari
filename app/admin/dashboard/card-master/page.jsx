import DashboardLayout from '@/components/admin/page-layout'
import ImageCropper from '@/components/image-cropper'
import React from 'react'

const page = () => {
  return (
    <DashboardLayout>
      <ImageCropper/>
    </DashboardLayout>
  )
}

export default page