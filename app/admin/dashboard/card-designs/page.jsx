import DashboardLayout from '@/components/admin/page-layout'
import ImageCropper from '@/components/image-cropper'
import { idCardImages } from '@/lib/idCard'
import Image from 'next/image'

const page = () => {
  return (
    <DashboardLayout>
      <ImageCropper/>
      <div className="p-6">
              <h1 className="text-2xl font-semibold mb-6 text-sky-800">ID Card Designs</h1>
      
              <div className="flex flex-wrap gap-4 justify-center">
                {idCardImages.map((card) => (
                  <div
                    key={card.name}
                    className="w-[200px] rounded-lg  overflow-hidden flex flex-col items-center"
                  >
                    <div className="relative w-[200px] h-[300px]">
                      <Image
                        src={card.url}
                        alt={card.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <span className="w-full text-center py-2 text-sm font-medium text-sky-900">
                      {card.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
    </DashboardLayout>
  )
}

export default page