import TodoCard from './cards/TodoCard';
import ProductCard from './cards/ProductCard';
import ArticleCard from './cards/ArticleCard';
import NoteCard from './cards/NoteCard';
import ImageCard from './cards/ImageCard';
import VideoCard from './cards/VideoCard';

const ItemCard = ({ item, onEdit, onDelete }) => {
  // Route to specialized card components based on type
  switch (item.type) {
    case 'todo':
      return <TodoCard item={item} onEdit={onEdit} onDelete={onDelete} />;
    case 'product':
      return <ProductCard item={item} onEdit={onEdit} onDelete={onDelete} />;
    case 'article':
      return <ArticleCard item={item} onEdit={onEdit} onDelete={onDelete} />;
    case 'note':
      return <NoteCard item={item} onEdit={onEdit} onDelete={onDelete} />;
    case 'image':
      return <ImageCard item={item} onEdit={onEdit} onDelete={onDelete} />;
    case 'video':
      return <VideoCard item={item} onEdit={onEdit} onDelete={onDelete} />;
    default:
      // Generic card for 'other' type
      return <GenericCard item={item} onEdit={onEdit} onDelete={onDelete} />;
  }
};

// Generic fallback card for 'other' type
const GenericCard = ({ item, onEdit, onDelete }) => {
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
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {displayImage && (
        <img
          src={displayImage}
          alt={item.title || 'Item image'}
          className="w-full h-48 object-cover"
        />
      )}

      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-900 flex-1">
            {item.title || 'Untitled'}
          </h3>
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {item.type}
          </span>
        </div>

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
