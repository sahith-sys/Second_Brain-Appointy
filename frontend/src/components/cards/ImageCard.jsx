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
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 border border-gray-100">
      {/* Image */}
      {displayImage && (
        <div className="relative group bg-gradient-to-br from-pink-50 to-purple-50">
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
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end justify-center pb-6">
            <a
              href={displayImage}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white text-gray-900 px-5 py-2.5 rounded-xl font-semibold text-sm shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              View Full Size
            </a>
          </div>
        </div>
      )}

      <div className="p-5">
        {/* Title and Badge */}
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-bold text-gray-900 flex-1 leading-tight">
            {item.title || 'Untitled Image'}
          </h3>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-pink-500 to-rose-500 text-white ml-2 shadow-sm">
            🖼️ Image
          </span>
        </div>

        {/* Description/Caption */}
        {item.content && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2 leading-relaxed">
            {item.content}
          </p>
        )}

        {/* OCR Extracted Text */}
        {item.ocrText && item.ocrText.trim() && (
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-100 rounded-xl p-3 mb-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-indigo-500 p-1 rounded-lg">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="text-xs font-bold text-indigo-700">AI Extracted Text</span>
            </div>
            <p className="text-gray-700 text-xs line-clamp-4 whitespace-pre-wrap leading-relaxed">
              {item.ocrText}
            </p>
          </div>
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
          <div className="flex flex-wrap gap-2 mb-3">
            {item.tags.map((tag, index) => (
              <span
                key={index}
                className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 px-3 py-1 rounded-full text-xs font-medium"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-between items-center pt-4 border-t-2 border-gray-100 mt-4">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {formatDate(item.createdAt)}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(item)}
              className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 text-xs font-semibold transition-all"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(item._id)}
              className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 text-xs font-semibold transition-all"
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
