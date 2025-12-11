import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { tableService } from '../../../services/tableService';
import { Plus, Edit, Trash2, QrCode, RefreshCw, X, Printer } from 'lucide-react';
import LoadingSpinner from './components/LoadingSpinner';

// Get base URL for storage files (without /api)
// Use the same base URL as API service but without /api suffix
// If REACT_APP_API_URL is not set, try to detect from window location or use production URL
const getStorageBaseUrl = () => {
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  if (process.env.REACT_APP_API_BASE_URL) {
    return process.env.REACT_APP_API_BASE_URL;
  }
  // If in production (not localhost), use production URL
  if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return 'https://backend-endsmartmenu-production.up.railway.app';
  }
  // Default to localhost for development
  return 'http://localhost:8000';
};

const STORAGE_BASE_URL = getStorageBaseUrl();

const Restaurant_Tables = () => {
  const navigate = useNavigate();
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openQrDialog, setOpenQrDialog] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  const statusColors = {
    available: 'bg-green-100 text-green-800',
    occupied: 'bg-red-100 text-red-800',
    reserved: 'bg-yellow-100 text-yellow-800',
    maintenance: 'bg-gray-100 text-gray-800'
  };

  // Fetch tables on component mount
  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await tableService.getTables();
      console.log('Tables response:', response);
      
      if (response.success) {
        const tablesArray = response.tables || [];
        console.log('Tables array:', tablesArray);
        setTables(tablesArray);
      } else {
        setError('Failed to load tables');
      }
    } catch (err) {
      console.error('Error fetching tables:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };


  const handleDeleteTable = async (id) => {
    if (window.confirm('Are you sure you want to delete this table?')) {
      try {
        const response = await tableService.deleteTable(id);
        if (response.success) {
          setSuccess('Table deleted successfully!');
          fetchTables();
        }
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleGenerateQrCode = async (id) => {
    try {
      const response = await tableService.generateNewQrCode(id);
      if (response.success) {
        setSuccess('QR code regenerated successfully!');
        fetchTables();
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleShowQrCode = async (id) => {
    try {
      const response = await tableService.getQrCode(id);
      console.log('QR Code response:', response);
      
      if (response.success) {
        // Handle both full URLs and relative paths
        let url = response.qr_code_url;
        console.log('Original QR code URL:', url);
        
        if (url) {
          // If it's a relative path, prepend the storage URL
          if (!url.startsWith('http://') && !url.startsWith('https://')) {
            // Remove leading slash if present
            const cleanPath = url.startsWith('/') ? url.substring(1) : url;
            url = `${STORAGE_BASE_URL}/${cleanPath}`;
          }
          // If it's a full URL, replace the base URL with STORAGE_BASE_URL
          else {
            // Check if URL contains localhost or 127.0.0.1 - always replace these
            if (url.includes('localhost') || url.includes('127.0.0.1')) {
              try {
                const urlObj = new URL(url);
                // Extract just the pathname (e.g., /storage/qrcodes/table_1_1765415787.svg)
                url = `${STORAGE_BASE_URL}${urlObj.pathname}`;
              } catch (e) {
                // If URL parsing fails, try simple string replacement for common patterns
                url = url
                  .replace(/^https?:\/\/localhost(:[0-9]+)?(\/|$)/, `${STORAGE_BASE_URL}/`)
                  .replace(/^https?:\/\/127\.0\.0\.1(:[0-9]+)?(\/|$)/, `${STORAGE_BASE_URL}/`)
                  .replace(/^https?:\/\/[^\/]+/, STORAGE_BASE_URL);
              }
            } else {
              // For other URLs, check if they match the current STORAGE_BASE_URL
              // If not, extract pathname and use STORAGE_BASE_URL
              try {
                const urlObj = new URL(url);
                const currentBase = urlObj.origin;
                // If the URL's origin doesn't match STORAGE_BASE_URL, replace it
                if (currentBase !== STORAGE_BASE_URL && !STORAGE_BASE_URL.includes(currentBase)) {
                  url = `${STORAGE_BASE_URL}${urlObj.pathname}`;
                }
              } catch (e) {
                // If URL parsing fails, try simple string replacement
                url = url.replace(/^https?:\/\/[^\/]+/, STORAGE_BASE_URL);
              }
            }
          }
        }
        
        console.log('Final QR code URL:', url);
        setQrCodeUrl(url);
        setOpenQrDialog(true);
      } else {
        setError(response.message || 'Failed to get QR code');
      }
    } catch (err) {
      console.error('Error fetching QR code:', err);
      setError(err.message || 'Failed to load QR code');
    }
  };

  const handleEdit = (table) => {
    navigate(`/Restaurant_Tables/${table.id}/edit`);
  };

  const handlePrintQrCode = () => {
    if (!qrCodeUrl) return;
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to print the QR code');
      return;
    }
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR Code - Print</title>
          <style>
            @media print {
              body { margin: 0; padding: 20px; }
              .qr-container { 
                display: flex; 
                flex-direction: column; 
                align-items: center; 
                justify-content: center;
                page-break-inside: avoid;
              }
              .qr-image { 
                max-width: 100%; 
                height: auto; 
                border: 2px solid #000;
                border-radius: 8px;
              }
              .qr-text {
                margin-top: 20px;
                font-size: 18px;
                font-weight: bold;
                text-align: center;
              }
            }
            body {
              margin: 0;
              padding: 20px;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
            }
            .qr-container {
              text-align: center;
            }
            .qr-image {
              max-width: 400px;
              height: auto;
              border: 2px solid #000;
              border-radius: 8px;
            }
            .qr-text {
              margin-top: 20px;
              font-size: 18px;
              font-weight: bold;
            }
          </style>
        </head>
        <body>
          <div class="qr-container">
            <img src="${qrCodeUrl}" alt="QR Code" class="qr-image" />
            <p class="qr-text">Scan this QR code to access the table</p>
          </div>
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() {
                window.close();
              };
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Restaurant Tables</h1>
        <button
          onClick={() => navigate('/Restaurant_Tables/create')}
          className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-all shadow-md"
        >
          <Plus size={20} />
          Add Table
        </button>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
          <span className="text-red-800">{error}</span>
          <button onClick={() => setError('')} className="text-red-600 hover:text-red-800">
            <X size={20} />
          </button>
        </div>
      )}
      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
          <span className="text-green-800">{success}</span>
          <button onClick={() => setSuccess('')} className="text-green-600 hover:text-green-800">
            <X size={20} />
          </button>
        </div>
      )}

      {/* Tables List */}
      {loading ? (
        <div className="text-center py-8">
         <LoadingSpinner />
        </div>
      ) : tables.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-500 text-lg">No tables found</p>
          <p className="text-gray-400 text-sm mt-2">Click "Add Table" to create your first table</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capacity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tables.map((table) => (
                  <tr key={table.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{table.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{table.capacity} persons</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[table.status] || statusColors.maintenance}`}>
                        {table.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(table.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(table)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleShowQrCode(table.id)}
                          className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          title="Show QR Code"
                        >
                          <QrCode size={18} />
                        </button>
                        <button
                          onClick={() => handleGenerateQrCode(table.id)}
                          className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                          title="Regenerate QR Code"
                        >
                          <RefreshCw size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteTable(table.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* QR Code Dialog */}
      {openQrDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-800">QR Code</h2>
              <button
                onClick={() => setOpenQrDialog(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-6 text-center">
              {qrCodeUrl ? (
                <>
                  <img
                    src={qrCodeUrl}
                    alt="QR Code"
                    className="max-w-full h-auto mx-auto border border-gray-200 rounded-lg"
                    onError={(e) => {
                      console.error('Failed to load QR code image from:', qrCodeUrl);
                      e.target.style.display = 'none';
                      const errorMsg = e.target.nextElementSibling;
                      if (errorMsg) {
                        errorMsg.classList.remove('hidden');
                      }
                    }}
                    onLoad={() => {
                      console.log('QR code image loaded successfully from:', qrCodeUrl);
                    }}
                  />
                  <p className="mt-4 text-sm text-red-600 hidden">
                    Failed to load QR code image. Please check the console for details.
                  </p>
                  <p className="mt-4 text-sm text-gray-600">
                    Scan this QR code to access the table
                  </p>
                </>
              ) : (
                <p className="text-gray-500">Loading QR code...</p>
              )}
            </div>
            <div className="flex justify-end gap-3 p-6 border-t">
              <button
                onClick={() => setOpenQrDialog(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
              <button
                onClick={handlePrintQrCode}
                disabled={!qrCodeUrl}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Printer size={18} />
                Print
              </button>
            
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Restaurant_Tables;
