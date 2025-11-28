import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import mealsService from '../../../../services/mealsService';

const MealOptionsExtras = () => {
  const { id } = useParams();
  const [meal, setMeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('options');
  const [optionForm, setOptionForm] = useState({
    name: { en: '', ar: '' },
    additional_price: ''
  });
  const [extraForm, setExtraForm] = useState({
    name: { en: '', ar: '' },
    additional_price: ''
  });

  useEffect(() => {
    fetchMealData();
  }, [id]);

  const fetchMealData = async () => {
    try {
      const response = await mealsService.getMealOptionsExtras(id);
      setMeal(response.data);
    } catch (error) {
      console.error('Error fetching meal data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddOption = async (e) => {
    e.preventDefault();
    try {
      await mealsService.addOption(id, optionForm);
      setOptionForm({ name: { en: '', ar: '' }, additional_price: '' });
      fetchMealData();
    } catch (error) {
      console.error('Error adding option:', error);
    }
  };

  const handleAddExtra = async (e) => {
    e.preventDefault();
    try {
      await mealsService.addExtra(id, extraForm);
      setExtraForm({ name: { en: '', ar: '' }, additional_price: '' });
      fetchMealData();
    } catch (error) {
      console.error('Error adding extra:', error);
    }
  };

  const handleDeleteOption = async (optionId) => {
    if (window.confirm('Are you sure you want to delete this option?')) {
      try {
        await mealsService.deleteOption(optionId);
        fetchMealData();
      } catch (error) {
        console.error('Error deleting option:', error);
      }
    }
  };

  const handleDeleteExtra = async (extraId) => {
    if (window.confirm('Are you sure you want to delete this extra?')) {
      try {
        await mealsService.deleteExtra(extraId);
        fetchMealData();
      } catch (error) {
        console.error('Error deleting extra:', error);
      }
    }
  };

  if (loading) return <div className="text-center">Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          {meal?.translations?.[0]?.name} - Options & Extras
        </h1>
        <p className="text-gray-600">Manage meal customization options</p>
      </div>

      {/* Tabs */}
      <div className="border-b mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('options')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'options'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Options ({meal?.options?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('extras')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'extras'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Extras ({meal?.extras?.length || 0})
          </button>
        </nav>
      </div>

      {/* Options Tab */}
      {activeTab === 'options' && (
        <div>
          {/* Add Option Form */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-lg font-semibold mb-4">Add New Option</h2>
            <form onSubmit={handleAddOption} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    English Name *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full p-2 border rounded"
                    value={optionForm.name.en}
                    onChange={(e) => setOptionForm({
                      ...optionForm,
                      name: { ...optionForm.name, en: e.target.value }
                    })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Arabic Name *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full p-2 border rounded text-right"
                    value={optionForm.name.ar}
                    onChange={(e) => setOptionForm({
                      ...optionForm,
                      name: { ...optionForm.name, ar: e.target.value }
                    })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Price *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  className="w-full p-2 border rounded"
                  value={optionForm.additional_price}
                  onChange={(e) => setOptionForm({
                    ...optionForm,
                    additional_price: e.target.value
                  })}
                />
              </div>
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Add Option
              </button>
            </form>
          </div>

          {/* Options List */}
          <div className="bg-white rounded-lg shadow-md">
            <h3 className="text-lg font-semibold p-4 border-b">Existing Options</h3>
            {meal?.options?.length > 0 ? (
              <div className="divide-y">
                {meal.options.map(option => (
                  <div key={option.id} className="p-4 flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">
                        {option.translations?.[0]?.name} 
                        {option.translations?.[1]?.name && (
                          <span className="text-gray-500 ml-2">
                            / {option.translations[1].name}
                          </span>
                        )}
                      </h4>
                      <p className="text-green-600 font-semibold">
                        +${option.additional_price}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteOption(option.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500">
                No options added yet
              </div>
            )}
          </div>
        </div>
      )}

      {/* Extras Tab */}
      {activeTab === 'extras' && (
        <div>
          {/* Add Extra Form */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-lg font-semibold mb-4">Add New Extra</h2>
            <form onSubmit={handleAddExtra} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    English Name *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full p-2 border rounded"
                    value={extraForm.name.en}
                    onChange={(e) => setExtraForm({
                      ...extraForm,
                      name: { ...extraForm.name, en: e.target.value }
                    })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Arabic Name *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full p-2 border rounded text-right"
                    value={extraForm.name.ar}
                    onChange={(e) => setExtraForm({
                      ...extraForm,
                      name: { ...extraForm.name, ar: e.target.value }
                    })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Price *
                  </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  className="w-full p-2 border rounded"
                  value={extraForm.additional_price}
                  onChange={(e) => setExtraForm({
                    ...extraForm,
                    additional_price: e.target.value
                  })}
                />
              </div>
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Add Extra
              </button>
            </form>
          </div>

          {/* Extras List */}
          <div className="bg-white rounded-lg shadow-md">
            <h3 className="text-lg font-semibold p-4 border-b">Existing Extras</h3>
            {meal?.extras?.length > 0 ? (
              <div className="divide-y">
                {meal.extras.map(extra => (
                  <div key={extra.id} className="p-4 flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">
                        {extra.translations?.[0]?.name} 
                        {extra.translations?.[1]?.name && (
                          <span className="text-gray-500 ml-2">
                            / {extra.translations[1].name}
                          </span>
                        )}
                      </h4>
                      <p className="text-green-600 font-semibold">
                        +${extra.additional_price}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteExtra(extra.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500">
                No extras added yet
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MealOptionsExtras;