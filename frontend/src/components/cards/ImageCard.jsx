const ImageCard = ({ item, onEdit, onDelete }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const displayImage = item.imageUrl || item.metadata?.image;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all">
      {/* Image */}
      {displayImage && (
        <div className="relative group bg-gray-100">
          <img
            src={displayImage}
            alt={item.title || 'Saved image'}
            className="w-full h-64 object-contain"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%23999">Image</text></svg>';
            }}
          />
          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center">
            <a
              href={displayImage}
              target="_blank"
              rel="noopener noreferrer"
              className="opacity-0 group-hover:opacity-100 bg-white text-gray-900 px-4 py-2 rounded-lg font-medium text-sm transition-opacity"
            >
              View Full Size
            </a>
          </div>
        </div>
      )}

      <div className="p-4">
        {/* Title and Badge */}
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-900 flex-1">
            {item.title || 'Untitled Image'}
          </h3>
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-pink-100 text-pink-800 ml-2">
            Image
          </span>
        </div>

        {/* Description/Caption */}
        {item.content && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {item.content}
          </p>
        )}

        {/* Source URL */}
        {item.url && (
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-pink-600 hover:text-pink-800 text-xs mb-2 block truncate"
          >
            Source: {item.url}
          </a>
        )}

        {/* Tags */}
        {item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {item.tags.map((tag, index) => (
              <span
                key={index}
                className="bg-pink-100 text-pink-700 px-2 py-1 rounded text-xs"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-between items-center pt-3 border-t border-gray-200">
          <span className="text-xs text-gray-500">
            {formatDate(item.createdAt)}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(item)}
              className="text-pink-600 hover:text-pink-800 text-sm font-medium"
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

export default ImageCard;
