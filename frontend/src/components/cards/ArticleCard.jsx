const ArticleCard = ({ item, onEdit, onDelete }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Estimate read time based on content length (average reading speed: 200 words/min)
  const estimateReadTime = (text) => {
    if (!text) return null;
    const words = text.trim().split(/\s+/).length;
    const minutes = Math.ceil(words / 200);
    return minutes;
  };

  const displayImage = item.imageUrl || item.metadata?.image;
  const readTime = estimateReadTime(item.content);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {/* Cover Image */}
      {displayImage && (
        <div className="relative h-48 bg-gray-100 overflow-hidden">
          <img
            src={displayImage}
            alt={item.title || 'Article cover'}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2 right-2">
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-600 text-white shadow-lg">
              Article
            </span>
          </div>
        </div>
      )}

      <div className="p-4">
        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
          {item.title || 'Untitled Article'}
        </h3>

        {/* Meta Info */}
        <div className="flex items-center gap-3 text-sm text-gray-500 mb-3">
          {item.metadata?.author && (
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
              {item.metadata.author}
            </span>
          )}
          {readTime && (
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              {readTime} min read
            </span>
          )}
        </div>

        {/* Description */}
        {item.content && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
            {item.content}
          </p>
        )}

        {/* Site Name */}
        {item.metadata?.siteName && (
          <p className="text-xs text-gray-400 mb-3 uppercase tracking-wide">
            {item.metadata.siteName}
          </p>
        )}

        {/* Read Article Button */}
        {item.url && (
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium mb-3 group"
          >
            Read Full Article
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        )}

        {/* Tags */}
        {item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {item.tags.map((tag, index) => (
              <span
                key={index}
                className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs"
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

export default ArticleCard;
