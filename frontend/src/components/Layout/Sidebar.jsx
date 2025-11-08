const Sidebar = ({ filterType, setFilterType }) => {
  const menuItems = [
    { icon: '📚', label: 'All Items', value: '', count: null },
    { icon: '📝', label: 'Notes', value: 'note', count: 24 },
    { icon: '📰', label: 'Articles', value: 'article', count: 18 },
    { icon: '🎬', label: 'Videos', value: 'video', count: 12 },
    { icon: '🖼️', label: 'Images', value: 'image', count: 15 },
    { icon: '🛒', label: 'Products', value: 'product', count: 8 },
    { icon: '✅', label: 'Todos', value: 'todo', count: 6 },
    { icon: '📦', label: 'Other', value: 'other', count: 3 },
  ];

  const quickActions = [
    { icon: '➕', label: 'New Item', color: 'from-green-500 to-emerald-600' },
    { icon: '🔍', label: 'Search', color: 'from-blue-500 to-cyan-600' },
    { icon: '🏷️', label: 'Tags', color: 'from-purple-500 to-pink-600' },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen sticky top-16 overflow-y-auto">
      {/* Quick Stats */}
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Quick Stats</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-3 rounded-xl">
            <div className="text-2xl font-bold text-indigo-600">86</div>
            <div className="text-xs text-indigo-600">Total Items</div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-3 rounded-xl">
            <div className="text-2xl font-bold text-purple-600">12</div>
            <div className="text-xs text-purple-600">This Week</div>
          </div>
        </div>
      </div>

      {/* Collections */}
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Collections</h3>
        <nav className="space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.value}
              onClick={() => setFilterType(item.value)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all ${
                filterType === item.value
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className="text-lg">{item.icon}</span>
                <span className="font-medium text-sm">{item.label}</span>
              </div>
              {item.count !== null && (
                <span className={`text-xs px-2 py-1 rounded-full ${
                  filterType === item.value
                    ? 'bg-white/20'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {item.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Quick Actions */}
      <div className="p-6">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Quick Actions</h3>
        <div className="space-y-2">
          {quickActions.map((action, index) => (
            <button
              key={index}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg bg-gradient-to-r ${action.color} text-white hover:shadow-lg transform hover:-translate-y-0.5 transition-all`}
            >
              <span className="text-lg">{action.icon}</span>
              <span className="font-medium text-sm">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Storage Info */}
      <div className="p-6 border-t border-gray-200">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Storage</h3>
        <div className="bg-gray-100 rounded-full h-2 mb-2">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full" style={{ width: '68%' }}></div>
        </div>
        <p className="text-xs text-gray-600">6.8 GB of 10 GB used</p>
      </div>
    </aside>
  );
};

export default Sidebar;
