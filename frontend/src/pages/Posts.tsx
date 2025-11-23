export default function Posts() {
  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Posts</h1>
          <p className="mt-2 text-gray-600">Manage and create your LinkedIn posts</p>
        </div>
        <button className="btn btn-primary">+ Create Post</button>
      </div>

      <div className="card">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No posts yet</h3>
          <p className="text-gray-600 mb-6">Create your first LinkedIn post to get started</p>
          <button className="btn btn-primary">Create Your First Post</button>
        </div>
      </div>
    </div>
  );
}
