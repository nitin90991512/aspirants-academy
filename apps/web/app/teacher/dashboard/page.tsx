export default function TeacherDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 font-[Poppins]">Teacher Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { title: "Today's Classes", value: '3', color: 'bg-blue-50 text-blue-700' },
          { title: 'Pending Homework', value: '2', color: 'bg-yellow-50 text-yellow-700' },
          { title: 'Pending Marks Entry', value: '1 Exam', color: 'bg-purple-50 text-purple-700' },
        ].map((card) => (
          <div key={card.title} className={`${card.color} rounded-xl p-5 border border-current border-opacity-20`}>
            <div className="text-3xl font-black font-[Poppins]">{card.value}</div>
            <div className="text-sm font-medium mt-1">{card.title}</div>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
        <h2 className="font-bold text-gray-900 mb-3">Today's Schedule</h2>
        <p className="text-gray-400 text-sm">No classes scheduled for today.</p>
      </div>
    </div>
  )
}
