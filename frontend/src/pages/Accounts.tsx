export default function Accounts() {
  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">LinkedIn Accounts</h1>
          <p className="mt-2 text-gray-600">Manage your connected LinkedIn accounts</p>
        </div>
        <button className="btn btn-primary">+ Connect Account</button>
      </div>

      <div className="card">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">👤</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No accounts connected</h3>
          <p className="text-gray-600 mb-6">Connect your LinkedIn account to start posting</p>
          <button className="btn btn-primary">Connect LinkedIn Account</button>
        </div>
      </div>
    </div>
  );
}
