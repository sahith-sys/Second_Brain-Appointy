const ItemCard = ({ item, onEdit, onDelete }) => {
  const getTypeColor = (type) => {
    const colors = {
      note: 'bg-yellow-100 text-yellow-800',
      article: 'bg-blue-100 text-blue-800',
      product: 'bg-green-100 text-green-800',
      todo: 'bg-purple-100 text-purple-800',
      video: 'bg-red-100 text-red-800',
      image: 'bg-pink-100 text-pink-800',
      other: 'bg-gray-100 text-gray-800',
    };
    return colors[type] || colors.other;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">

      {item.type === 'video' && item.metadata?.videoId && (
        <div className="w-full aspect-video">
          <iframe
            width="100%"
            height="100%"
            src={`https://www.youtube.com/embed/${item.metadata.videoId}`}
            title={item.title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      )}

      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-900 flex-1">
            {item.title || 'Untitled'}
          </h3>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(item.type)}`}>
            {item.type}
          </span>
        </div>

        {item.metadata?.price && (
          <p className="text-green-600 font-bold text-lg mb-2">
            {item.metadata.price}
          </p>
        )}

        {item.metadata?.author && (
          <p className="text-sm text-gray-500 mb-2">
            By {item.metadata.author}
          </p>
        )}

        {item.content && (
          <p className="text-gray-600 mb-3 line-clamp-3">
            {item.content}
          </p>
        )}

        {item.url && (
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 text-sm mb-2 block truncate"
          >
            {item.url}
          </a>
        )}

        {item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {item.tags.map((tag, index) => (
              <span
                key={index}
                className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex justify-between items-center pt-3 border-t border-gray-200">
          <span className="text-xs text-gray-500">
            {formatDate(item.createdAt)}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(item)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
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

export default ItemCard;
