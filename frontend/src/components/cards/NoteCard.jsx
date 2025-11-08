const NoteCard = ({ item, onEdit, onDelete }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Sticky note colors
  const noteColors = [
    'bg-yellow-100 border-yellow-300',
    'bg-pink-100 border-pink-300',
    'bg-blue-100 border-blue-300',
    'bg-green-100 border-green-300',
    'bg-purple-100 border-purple-300',
  ];

  // Simple hash function to consistently pick a color based on item ID
  const getColorClass = () => {
    if (!item._id) return noteColors[0];
    const hash = item._id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return noteColors[hash % noteColors.length];
  };

  return (
    <div className={`rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all transform hover:-rotate-1 ${getColorClass()} border-2`}>
      <div className="p-4 relative">
        {/* Pin/Thumbtack visual */}
        <div className="absolute top-2 right-2">
          <div className="w-6 h-6 bg-red-500 rounded-full shadow-md"></div>
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-800 mb-3 pr-8">
          {item.title || 'Quick Note'}
        </h3>

        {/* Content with handwriting-like font */}
        {item.content && (
          <p className="text-gray-700 text-sm mb-3 whitespace-pre-wrap leading-relaxed font-normal">
            {item.content.length > 200
              ? `${item.content.substring(0, 200)}...`
              : item.content
            }
          </p>
        )}

        {/* URL if present */}
        {item.url && (
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-700 hover:text-blue-900 text-xs mb-2 block truncate underline"
          >
            {item.url}
          </a>
        )}

        {/* Tags */}
        {item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {item.tags.map((tag, index) => (
              <span
                key={index}
                className="bg-yellow-300 bg-opacity-50 text-gray-700 px-2 py-1 rounded text-xs font-medium"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-between items-center pt-3 border-t border-gray-300 border-dashed mt-4">
          <span className="text-xs text-gray-600 italic">
            {formatDate(item.createdAt)}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(item)}
              className="text-gray-700 hover:text-gray-900 text-sm font-medium"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(item._id)}
              className="text-red-600 hover:text-red-800 text-sm font-medium"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoteCard;
