import InstituteLayout from "@/components/institute/page-layout";

const Page = () => {
  const dues = [
    { id: 1, cardCount: 120, amount: 6000, dueDate: "2025-07-20", status: "Pending" },
    { id: 2, cardCount: 80, amount: 4000, dueDate: "2025-08-01", status: "Pending" },
    { id: 3, cardCount: 50, amount: 2500, dueDate: "2025-06-15", status: "Paid" },
  ];

  const history = [
    { id: 1, cardCount: 50, amount: 2500, paidOn: "2025-06-10" },
    { id: 2, cardCount: 100, amount: 5000, paidOn: "2025-05-01" },
  ];

  return (
    <InstituteLayout>
      <div className="p-6">
        <h1 className="text-2xl font-semibold mb-6 text-sky-800">ID Card Payment Page</h1>

        <div className="mb-10">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Pending Dues</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden text-sm">
              <thead className="bg-sky-200 text-gray-700 text-left">
                <tr>
                  <th className="px-6 py-3">Number of ID Cards</th>
                  <th className="px-6 py-3">Amount</th>
                  <th className="px-6 py-3">Due Date</th>
                  <th className="px-6 py-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {dues.map((item) => (
                  <tr
                    key={item.id}
                    className={`border-t transition ${
                      item.status === "Pending" ? "bg-red-50" : "bg-green-50"
                    } hover:bg-gray-50`}
                  >
                    <td className="px-6 py-3 font-medium text-gray-700">{item.cardCount}</td>
                    <td className="px-6 py-3 text-sky-700 font-semibold">₹{item.amount}</td>
                    <td className="px-6 py-3 text-gray-600">{item.dueDate}</td>
                    <td className="px-6 py-3 text-center">
                      <span
                        className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${
                          item.status === "Pending"
                            ? "bg-red-100 text-red-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Payment History</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden text-sm">
              <thead className="bg-sky-200 text-gray-700 text-left">
                <tr>
                  <th className="px-6 py-3">Number of ID Cards</th>
                  <th className="px-6 py-3">Amount</th>
                  <th className="px-6 py-3">Paid On</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item) => (
                  <tr key={item.id} className="border-t hover:bg-gray-50 transition">
                    <td className="px-6 py-3 font-medium text-gray-700">{item.cardCount}</td>
                    <td className="px-6 py-3 text-green-700 font-semibold">₹{item.amount}</td>
                    <td className="px-6 py-3 text-gray-600">{item.paidOn}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </InstituteLayout>
  );
};

export default Page;
