const ProductCard = ({ item, onEdit, onDelete }) => {
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
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all hover:scale-105 duration-200 border-t-4 border-green-500">
      {/* Product Image */}
      {displayImage && (
        <div className="relative bg-gray-100">
          <img
            src={displayImage}
            alt={item.title || 'Product image'}
            className="w-full h-56 object-contain p-4"
          />
        </div>
      )}

      <div className="p-4">
        {/* Product Name */}
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-900 flex-1 line-clamp-2">
            {item.title || 'Untitled Product'}
          </h3>
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 ml-2">
            Product
          </span>
        </div>

        {/* Price */}
        {item.metadata?.price && (
          <div className="mb-3">
            <span className="text-2xl font-bold text-green-600">
              {item.metadata.price}
            </span>
          </div>
        )}

        {/* Description */}
        {item.content && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {item.content}
          </p>
        )}

        {/* Site Name */}
        {item.metadata?.siteName && (
          <p className="text-xs text-gray-500 mb-2">
            From {item.metadata.siteName}
          </p>
        )}

        {/* View Product Button */}
        {item.url && (
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full bg-green-600 hover:bg-green-700 text-white text-center py-2 rounded-md text-sm font-medium transition-colors mb-3"
          >
            View Product
          </a>
        )}

        {/* Tags */}
        {item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {item.tags.map((tag, index) => (
              <span
                key={index}
                className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-between items-center pt-3 border-t border-gray-200">
          <span className="text-xs text-gray-500">
            Saved {formatDate(item.createdAt)}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(item)}
              className="text-green-600 hover:text-green-800 text-sm font-medium"
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

export default ProductCard;
