import { useState, useEffect } from 'react';
import ItemForm from './components/ItemForm';
import ItemList from './components/ItemList';
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
import Footer from './components/Layout/Footer';
import { itemsAPI } from './services/api';

function App() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('');
  const [useSemanticSearch, setUseSemanticSearch] = useState(false);

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

  const handleSearch = async () => {
    // If there's a search query, use semantic or intelligent search
    // Otherwise, use regular filtering
    if (searchQuery.trim()) {
      try {
        setLoading(true);

        // Use semantic search if enabled, otherwise use intelligent search
        const data = useSemanticSearch
          ? await itemsAPI.semanticSearch(searchQuery)
          : await itemsAPI.intelligentSearch(searchQuery);

        setItems(data.items);
        console.log(`${useSemanticSearch ? 'Semantic' : 'Intelligent'} search results:`, data);
      } catch (error) {
        console.error('Error performing search:', error);
        // Fallback to regular search
        fetchItems({ q: searchQuery, type: filterType });
      } finally {
        setLoading(false);
      }
    } else {
      fetchItems({ q: searchQuery, type: filterType });
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      <Header />

      <div className="flex flex-1">
        <Sidebar filterType={filterType} setFilterType={setFilterType} />

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-6 py-8">
            {/* Search Bar */}
            <div className="bg-white p-6 rounded-2xl shadow-lg mb-8 border border-gray-200">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Ask anything... (e.g., 'videos about AI from last month')"
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                  </div>
                  <button
                    onClick={handleSearch}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-xl hover:shadow-lg transform hover:-translate-y-0.5 transition-all font-semibold flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Search
                  </button>
                </div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={useSemanticSearch}
                        onChange={(e) => setUseSemanticSearch(e.target.checked)}
                        className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer"
                      />
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700 group-hover:text-indigo-600 transition-colors">
                        Semantic Search
                      </span>
                      <p className="text-xs text-gray-500">Finds similar meaning, not just keywords</p>
                    </div>
                  </label>
                  <div className="h-8 w-px bg-gray-300"></div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-medium">AI-Powered</span>
                  </div>
                </div>
              </div>
            </div>

            {/* New Item Form */}
            <div className="mb-8">
              <ItemForm
                onSubmit={editingItem ? handleUpdateItem : handleCreateItem}
                initialData={editingItem}
                onCancel={() => setEditingItem(null)}
              />
            </div>

            {/* Items Grid */}
            <ItemList
              items={items}
              onEdit={handleEdit}
              onDelete={handleDeleteItem}
              loading={loading}
            />
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}

export default App;
