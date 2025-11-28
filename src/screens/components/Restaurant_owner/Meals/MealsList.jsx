import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  ChefHat, 
  DollarSign,
  Tag,
  Loader
} from 'lucide-react';
import mealsService from '../../../../services/mealsService';
import categoriesService from '../../../../services/categoryApi';
 import LoadingSpinner from '../components/LoadingSpinner'; 


const MealsList = () => {
  const [meals, setMeals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    view: 'grid',
    search: '',
    category_id: '',
    availability: ''
  });

  useEffect(() => {
    fetchData();
  }, [filters.search, filters.category_id, filters.availability]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [mealsRes, categoriesRes] = await Promise.all([
        mealsService.getAllMeals(filters),
        categoriesService.getCategories()
      ]);
      
      if (mealsRes.success && mealsRes.data) {
        const mealsData = mealsRes.data.data || mealsRes.data || [];
        setMeals(mealsData);
      } else {
        setMeals([]);
      }
      
      if (categoriesRes.success) {
        const categoriesData = categoriesRes.data || [];
        setCategories(categoriesData);
      } else {
        setCategories([]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setMeals([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAvailability = async (mealId) => {
    try {
      await mealsService.toggleAvailability(mealId);
      fetchData();
    } catch (error) {
      console.error('Error toggling availability:', error);
    }
  };

  const handleDelete = async (mealId) => {
    if (window.confirm('Are you sure you want to delete this meal?')) {
      try {
        await mealsService.deleteMeal(mealId);
        fetchData();
      } catch (error) {
        console.error('Error deleting meal:', error);
      }
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
          <div className="mb-4 lg:mb-0">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg shadow-lg">
                <ChefHat className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-800">Meals Management</h1>
            </div>
            <p className="text-gray-600">Manage your restaurant's delicious menu items</p>
          </div>
          
          <Link
            to="/meals/create"
            className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-3 rounded-xl hover:from-yellow-600 hover:to-orange-600 transform hover:scale-105 transition-all duration-200 font-semibold shadow-lg flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add New Meal
          </Link>
        </div>

        {/* Filters Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search meals..."
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 transition-all duration-200"
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all duration-200 appearance-none bg-white"
                value={filters.category_id}
                onChange={(e) => setFilters({...filters, category_id: e.target.value})}
              >
                <option value="">All Categories</option>
                {categories.map(category => {
                  const categoryName = category.name || category.translations?.[0]?.name || `Category ${category.id}`;
                  return (
                    <option key={category.id} value={category.id}>
                      {categoryName}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Availability Filter */}
            <div className="relative">
              <Eye className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 appearance-none bg-white"
                value={filters.availability}
                onChange={(e) => setFilters({...filters, availability: e.target.value})}
              >
                <option value="">All Status</option>
                <option value="1">Available</option>
                <option value="0">Unavailable</option>
              </select>
            </div>

            {/* View Toggle */}
            <div className="flex space-x-2 bg-gray-100 p-1 rounded-xl">
              <button
                onClick={() => setFilters({...filters, view: 'grid'})}
                className={`flex-1 py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 ${
                  filters.view === 'grid' 
                    ? 'bg-white text-yellow-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <Grid className="w-4 h-4" />
                Grid
              </button>
              <button
                onClick={() => setFilters({...filters, view: 'list'})}
                className={`flex-1 py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 ${
                  filters.view === 'list' 
                    ? 'bg-white text-yellow-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <List className="w-4 h-4" />
                List
              </button>
            </div>

            {/* Results Count */}
            <div className="flex items-center justify-center lg:justify-end">
              <span className="text-sm text-gray-600 bg-gray-100 px-3 py-2 rounded-lg">
                {meals.length} {meals.length === 1 ? 'meal' : 'meals'} found
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        {filters.view === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {meals.map(meal => (
              <MealCard 
                key={meal.id} 
                meal={meal}
                onToggleAvailability={handleToggleAvailability}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-blue-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Meal</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Category</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Price</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {meals.map(meal => (
                  <MealRow 
                    key={meal.id}
                    meal={meal}
                    onToggleAvailability={handleToggleAvailability}
                    onDelete={handleDelete}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {meals.length === 0 && !loading && (
          <div className="text-center py-16">
            <div className="bg-white rounded-2xl shadow-lg p-12 max-w-md mx-auto border border-gray-100">
              <ChefHat className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No meals found</h3>
              <p className="text-gray-600 mb-6">Get started by creating your first delicious meal!</p>
              <Link
                to="/meals/create"
                className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-3 rounded-xl hover:from-yellow-600 hover:to-orange-600 transform hover:scale-105 transition-all duration-200 font-semibold inline-flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Create First Meal
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const MealCard = ({ meal, onToggleAvailability, onDelete }) => {
  const mealName = meal.translations?.find(t => t.locale === 'en')?.name || meal.translations?.[0]?.name || meal.name;
  const categoryName = meal.category?.name || meal.category?.translations?.[0]?.name || 'Uncategorized';
  const imageUrl = meal.image ? `http://127.0.0.1:8000/storage/${meal.image}` : '/images/placeholder-food.jpg';
  
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <div className="relative">
        <img
          src={imageUrl}
          alt={mealName}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-3 right-3">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            meal.available 
              ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' 
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}>
            {meal.available ? 'Available' : 'Unavailable'}
          </span>
        </div>
      </div>
      
      <div className="p-5">
        <h3 className="font-bold text-lg text-gray-800 mb-2 line-clamp-1">
          {mealName}
        </h3>
        
        <div className="flex items-center text-gray-600 text-sm mb-3">
          <Tag className="w-4 h-4 mr-1" />
          {categoryName}
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <span className="text-2xl font-bold text-yellow-600">${meal.price}</span>
          {meal.order !== undefined && (
            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
              Order: {meal.order}
            </span>
          )}
        </div>
        
        <div className="flex justify-between items-center">
          <button
            onClick={() => onToggleAvailability(meal.id)}
            className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
              meal.available 
                ? 'bg-amber-500 text-white hover:bg-amber-600' 
                : 'bg-yellow-500 text-white hover:bg-yellow-600'
            }`}
          >
            {meal.available ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {meal.available ? 'Disable' : 'Enable'}
          </button>
          
          <div className="flex gap-2">
            <Link
              to={`/meals/${meal.id}/edit`}
              className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition-colors duration-200"
              title="Edit Meal"
            >
              <Edit className="w-4 h-4" />
            </Link>
            <button
              onClick={() => onDelete(meal.id)}
              className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition-colors duration-200"
              title="Delete Meal"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const MealRow = ({ meal, onToggleAvailability, onDelete }) => {
  const mealName = meal.translations?.find(t => t.locale === 'en')?.name || meal.translations?.[0]?.name || meal.name;
  const mealDescription = meal.translations?.find(t => t.locale === 'en')?.description || meal.translations?.[0]?.description || '';
  const categoryName = meal.category?.name || meal.category?.translations?.[0]?.name || 'Uncategorized';
  const imageUrl = meal.image ? `http://127.0.0.1:8000/storage/${meal.image}` : '/images/placeholder-food.jpg';
  
  return (
    <tr className="hover:bg-gray-50 transition-colors duration-200">
      <td className="px-6 py-4">
        <div className="flex items-center">
          <img
            src={imageUrl}
            alt={mealName}
            className="w-14 h-14 object-cover rounded-xl shadow-sm"
          />
          <div className="ml-4">
            <div className="font-semibold text-gray-800">{mealName}</div>
            {mealDescription && (
              <div className="text-gray-500 text-sm mt-1 max-w-md">
                {mealDescription.substring(0, 80)}...
              </div>
            )}
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <span className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full font-medium">
          {categoryName}
        </span>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-1">
          <DollarSign className="w-4 h-4 text-yellow-500" />
          <span className="text-xl font-bold text-yellow-600">{meal.price}</span>
        </div>
      </td>
      <td className="px-6 py-4">
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
          meal.available 
            ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' 
            : 'bg-red-100 text-red-800 border border-red-200'
        }`}>
          {meal.available ? 'Available' : 'Unavailable'}
        </span>
      </td>
      <td className="px-6 py-4">
        <div className="flex gap-2">
          <button
            onClick={() => onToggleAvailability(meal.id)}
            className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
              meal.available 
                ? 'bg-amber-500 text-white hover:bg-amber-600' 
                : 'bg-yellow-500 text-white hover:bg-yellow-600'
            }`}
          >
            {meal.available ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {meal.available ? 'Disable' : 'Enable'}
          </button>
          <Link
            to={`/meals/${meal.id}/edit`}
            className="bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-200 flex items-center gap-1 text-sm font-semibold"
          >
            <Edit className="w-4 h-4" />
            Edit
          </Link>
          <button
            onClick={() => onDelete(meal.id)}
            className="bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 transition-colors duration-200 flex items-center gap-1 text-sm font-semibold"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
};

export default MealsList;