import DashboardLayout from '@/components/admin/page-layout';
import Image from 'next/image';

export const idCardImages = [
  { name: 'idcard_design1', url: 'https://picsum.photos/200/300?image=1001' },
  { name: 'idcard_design2', url: 'https://picsum.photos/200/300?image=1002' },
  { name: 'idcard_design3', url: 'https://picsum.photos/200/300?image=1003' },
  { name: 'idcard_design4', url: 'https://picsum.photos/200/300?image=1004' },
  { name: 'idcard_design5', url: 'https://picsum.photos/200/300?image=1005' },
  { name: 'idcard_design6', url: 'https://picsum.photos/200/300?image=1006' },
  { name: 'idcard_design7', url: 'https://picsum.photos/200/300?image=1007' },
  { name: 'idcard_design8', url: 'https://picsum.photos/200/300?image=1008' },
  { name: 'idcard_design9', url: 'https://picsum.photos/200/300?image=1009' },
  { name: 'idcard_design10', url: 'https://picsum.photos/200/300?image=1010' },
  { name: 'idcard_design11', url: 'https://picsum.photos/200/300?image=1011' },
  { name: 'idcard_design12', url: 'https://picsum.photos/200/300?image=1012' },
  { name: 'idcard_design13', url: 'https://picsum.photos/200/300?image=1013' },
  { name: 'idcard_design14', url: 'https://picsum.photos/200/300?image=1014' },
  { name: 'idcard_design15', url: 'https://picsum.photos/200/300?image=1015' },
  { name: 'idcard_design16', url: 'https://picsum.photos/200/300?image=1016' },
  { name: 'idcard_design17', url: 'https://picsum.photos/200/300?image=1017' },
  { name: 'idcard_design18', url: 'https://picsum.photos/200/300?image=1018' },
  { name: 'idcard_design19', url: 'https://picsum.photos/200/300?image=1019' },
  { name: 'idcard_design20', url: 'https://picsum.photos/200/300?image=1020' },
  { name: 'idcard_design21', url: 'https://picsum.photos/200/300?image=1021' },
  { name: 'idcard_design22', url: 'https://picsum.photos/200/300?image=1022' },
  { name: 'idcard_design23', url: 'https://picsum.photos/200/300?image=1023' },
  { name: 'idcard_design24', url: 'https://picsum.photos/200/300?image=1024' },
  { name: 'idcard_design25', url: 'https://picsum.photos/200/300?image=1025' },
];

const Page = () => {
  const pairedCards = [];
  for (let i = 0; i < idCardImages.length; i += 2) {
    if (idCardImages[i] && idCardImages[i + 1]) {
      pairedCards.push({
        front: idCardImages[i],
        back: idCardImages[i + 1],
        name: `Card ${i / 2 + 1}`,
      });
    }
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-2xl font-semibold mb-6 text-sky-800">ID Card Designs</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-6">
          {pairedCards.map((card, index) => (
            <div
              key={index}
              className="bg-sky-50 rounded-xl shadow hover:shadow-lg transition overflow-hidden border border-gray-200 p-4"
            >
              <div className="flex justify-center gap-4">
                {card.front?.url && (
                  <div className="relative w-[280px] h-[400px] rounded overflow-hidden">
                    <Image
                      src={card.front.url}
                      alt={`${card.name} Front`}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                {card.back?.url && (
                  <div className="relative w-[280px] h-[400px] rounded overflow-hidden">
                    <Image
                      src={card.back.url}
                      alt={`${card.name} Back`}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
              </div>
              <div className="text-center pt-3 text-sm font-medium text-sky-900">
                {card.name}
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Page;
