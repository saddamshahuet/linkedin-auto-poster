export default function Calendar() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Content Calendar</h1>
        <p className="mt-2 text-gray-600">View and manage your content schedule</p>
      </div>

      <div className="card min-h-[600px]">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📅</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Calendar View</h3>
          <p className="text-gray-600">Your scheduled posts will appear here</p>
        </div>
      </div>
    </div>
  );
}
