export default async function StudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <div className="p-6"><h1 className="text-2xl font-bold">Student Profile</h1><p className="text-gray-500 mt-2">Student ID: {id}</p></div>
}