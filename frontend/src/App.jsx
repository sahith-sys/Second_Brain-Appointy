import { useState, useEffect } from 'react';
import ItemForm from './components/ItemForm';
import ItemList from './components/ItemList';
import { itemsAPI } from './services/api';

function App() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('');

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async (filters = {}) => {
    try {
      setLoading(true);
      const data = await itemsAPI.getItems(filters);
      setItems(data.items);
    } catch (error) {
      console.error('Error fetching items:', error);
      alert('Failed to fetch items');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateItem = async (itemData) => {
    try {
      await itemsAPI.createItem(itemData);
      fetchItems({ q: searchQuery, type: filterType });
      alert('Item created successfully!');
    } catch (error) {
      console.error('Error creating item:', error);
      alert('Failed to create item');
    }
  };

  const handleUpdateItem = async (itemData) => {
    try {
      await itemsAPI.updateItem(editingItem._id, itemData);
      setEditingItem(null);
      fetchItems({ q: searchQuery, type: filterType });
      alert('Item updated successfully!');
    } catch (error) {
      console.error('Error updating item:', error);
      alert('Failed to update item');
    }
  };

  const handleDeleteItem = async (id) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      await itemsAPI.deleteItem(id);
      fetchItems({ q: searchQuery, type: filterType });
      alert('Item deleted successfully!');
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Failed to delete item');
    }
  };

  const handleSearch = () => {
    fetchItems({ q: searchQuery, type: filterType });
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Project Synapse
          </h1>
          <p className="text-gray-600">Your Second Brain</p>
        </header>

        <div className="mb-8">
          <ItemForm
            onSubmit={editingItem ? handleUpdateItem : handleCreateItem}
            initialData={editingItem}
            onCancel={() => setEditingItem(null)}
          />
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search items..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value="note">Notes</option>
              <option value="article">Articles</option>
              <option value="product">Products</option>
              <option value="todo">Todos</option>
              <option value="video">Videos</option>
              <option value="image">Images</option>
              <option value="other">Other</option>
            </select>
            <button
              onClick={handleSearch}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Search
            </button>
          </div>
        </div>

        <ItemList
          items={items}
          onEdit={handleEdit}
          onDelete={handleDeleteItem}
          loading={loading}
        />
      </div>
    </div>
  );
}

export default App;
