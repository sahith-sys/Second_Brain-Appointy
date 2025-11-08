import { useState } from 'react';

const TodoCard = ({ item, onEdit, onDelete }) => {
  const [checkedItems, setCheckedItems] = useState({});

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Parse todo items from content
  const parseTodoItems = (content) => {
    if (!content) return [];

    // Split by newlines and filter lines that start with - or *
    const lines = content.split('\n');
    return lines
      .filter(line => line.trim().startsWith('-') || line.trim().startsWith('*'))
      .map(line => line.trim().replace(/^[-*]\s*/, ''));
  };

  const todoItems = parseTodoItems(item.content);

  const handleToggle = (index) => {
    setCheckedItems(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const completedCount = Object.values(checkedItems).filter(Boolean).length;
  const totalCount = todoItems.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow border-l-4 border-purple-500">
      <div className="p-4">
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-semibold text-gray-900 flex-1">
            {item.title || 'Todo List'}
          </h3>
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            Todo
          </span>
        </div>

        {/* Progress Bar */}
        {totalCount > 0 && (
          <div className="mb-3">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>{completedCount} of {totalCount} completed</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Todo Items */}
        {todoItems.length > 0 ? (
          <div className="space-y-2 mb-3">
            {todoItems.slice(0, 5).map((todoItem, index) => (
              <label
                key={index}
                className="flex items-start gap-2 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={checkedItems[index] || false}
                  onChange={() => handleToggle(index)}
                  className="mt-1 h-4 w-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                />
                <span
                  className={`text-sm ${
                    checkedItems[index]
                      ? 'line-through text-gray-400'
                      : 'text-gray-700 group-hover:text-gray-900'
                  }`}
                >
                  {todoItem}
                </span>
              </label>
            ))}
            {todoItems.length > 5 && (
              <p className="text-xs text-gray-500 italic pl-6">
                +{todoItems.length - 5} more items...
              </p>
            )}
          </div>
        ) : (
          <p className="text-gray-500 text-sm mb-3 italic">
            No todo items found. Use "-" or "*" to create list items.
          </p>
        )}

        {/* URL if present */}
        {item.url && (
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-600 hover:text-purple-800 text-xs mb-2 block truncate"
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
                className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs"
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
              className="text-purple-600 hover:text-purple-800 text-sm font-medium"
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

export default TodoCard;
