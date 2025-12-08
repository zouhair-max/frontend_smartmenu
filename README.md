# SmartMenu - Restaurant Management System

A modern, full-featured restaurant management system with QR code menu functionality. Built with React, this application helps restaurant owners manage their menus, orders, staff, tables, and provides customers with an easy-to-use digital menu experience.

## 🌟 Features

### For Restaurant Owners
- **Dashboard**: Real-time analytics, statistics, and insights
- **Menu Management**: Create, update, and organize meals with categories
- **Order Management**: Track and process customer orders
- **Staff Management**: Manage staff members and their roles
- **Table Management**: Organize and track restaurant tables
- **Settings**: Customize restaurant information and preferences
- **Multi-language Support**: English, French, and Arabic

### For Customers
- **QR Code Menu**: Scan QR code to access digital menu
- **Mobile Optimized**: Perfect viewing experience on any device
- **Real-time Updates**: Always see the latest menu items and prices

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Backend API server running (default: `http://localhost:8000/api`)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd smart-menu
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and set your API base URL:
   ```env
   REACT_APP_API_BASE_URL=http://localhost:8000/api
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

   The app will open at [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
smart-menu/
├── public/                 # Static files
├── src/
│   ├── auth/              # Authentication pages (Login, Signup, etc.)
│   ├── components/        # Reusable components
│   │   ├── ErrorBoundary.jsx    # Global error boundary
│   │   └── LoadingFallback.jsx # Loading component for Suspense
│   ├── constants/         # Application constants
│   │   └── index.js       # API endpoints, routes, validation rules
│   ├── contexts/          # React contexts (Auth, Loading)
│   ├── hooks/             # Custom React hooks
│   │   ├── useApi.js      # API call hook with loading/error states
│   │   ├── useDebounce.js # Debounce hook
│   │   └── useLocalStorage.js # LocalStorage hook
│   ├── i18n/              # Internationalization configuration
│   │   └── locales/       # Translation files (en, fr, ar)
│   ├── screens/           # Main application screens
│   │   └── components/
│   │       ├── Restaurant_owner/  # Restaurant owner features
│   │       │   ├── Dashboard.jsx
│   │       │   ├── Categories/
│   │       │   ├── Meals/
│   │       │   ├── Orders/
│   │       │   ├── Staff/
│   │       │   └── Tables/
│   │       └── PageMenu.jsx      # Public customer menu
│   ├── services/          # API service layer
│   └── utils/             # Utility functions
│       ├── errorHandler.js # Error handling utilities
│       ├── format.js       # Formatting utilities (currency, date, etc.)
│       ├── validators.js   # Validation functions
│       └── translations.js # Translation utilities
├── .env.example           # Environment variables template
└── package.json
```

## 🛠️ Available Scripts

### `npm start`
Runs the app in development mode at [http://localhost:3000](http://localhost:3000)

### `npm test`
Launches the test runner in interactive watch mode

### `npm run build`
Builds the app for production to the `build` folder. Optimized and minified for best performance.

### `npm run eject`
**Note: This is a one-way operation!** Ejects from Create React App to get full control over configuration.

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory (use `.env.example` as a template):

```env
# API Configuration
REACT_APP_API_BASE_URL=http://localhost:8000/api

# Environment
NODE_ENV=development
```

**Important**: All environment variables must be prefixed with `REACT_APP_` to be accessible in the React app.

### API Configuration

The application expects a RESTful API with the following endpoints:

- Authentication: `/api/auth/login`, `/api/auth/register`
- User: `/api/user`
- Categories: `/api/categories`
- Meals: `/api/meals`
- Orders: `/api/orders`
- Staff: `/api/staff`
- Tables: `/api/tables`
- Dashboard: `/api/dashboard`

## 👥 User Roles

- **Restaurant Owner**: Full access to all features
- **Staff**: Limited access to orders, tables, meals, and categories

## 🌐 Internationalization

The app supports multiple languages:
- English (en)
- French (fr)
- Arabic (ar)

Language files are located in `src/i18n/locales/`. The default language can be configured in `src/i18n/config.js`.

## 🎨 Styling

This project uses:
- **Tailwind CSS** for utility-first styling
- **Lucide React** for icons
- **Material-UI Icons** for additional icons

## 🛠️ Utilities & Hooks

### Custom Hooks

#### `useApi(apiFunction)`
Hook for API calls with built-in loading and error states.

```javascript
import { useApi } from './hooks';
import { mealsService } from './services/mealsService';

const { data, loading, error, execute, reset } = useApi(mealsService.getAllMeals);

// Call API
useEffect(() => {
  execute();
}, []);
```

#### `useDebounce(value, delay)`
Debounces a value to reduce API calls or expensive operations.

```javascript
import { useDebounce } from './hooks';

const [searchTerm, setSearchTerm] = useState('');
const debouncedSearch = useDebounce(searchTerm, 500);
```

#### `useLocalStorage(key, initialValue)`
Synchronizes state with localStorage.

```javascript
import { useLocalStorage } from './hooks';

const [theme, setTheme] = useLocalStorage('theme', 'light');
```

### Utility Functions

#### Error Handling
```javascript
import { handleApiError, extractValidationErrors } from './utils';

try {
  await api.post('/endpoint', data);
} catch (error) {
  const formattedError = handleApiError(error);
  // Use formattedError.message, formattedError.errors, etc.
}
```

#### Validation
```javascript
import { isValidEmail, validatePassword, validateRequired } from './utils';

const emailValid = isValidEmail('user@example.com');
const passwordCheck = validatePassword('password123');
const requiredCheck = validateRequired(value, 'Field Name');
```

#### Formatting
```javascript
import { formatCurrency, formatDate, formatPhone, truncateText } from './utils';

formatCurrency(29.99); // "$29.99"
formatDate(new Date()); // "Jan 15, 2024"
formatPhone('1234567890'); // "(123) 456-7890"
truncateText('Long text...', 20); // "Long text..."
```

### Constants

All application constants are centralized in `src/constants/index.js`:

```javascript
import { API_ENDPOINTS, USER_ROLES, ROUTES, VALIDATION } from './constants';
```

## 🔒 Security Features

- JWT-based authentication
- Protected routes with role-based access control
- Secure token storage in localStorage
- Automatic token validation and refresh

## 🐛 Error Handling

- Global Error Boundary component catches React errors
- API error handling with user-friendly messages
- Network error detection and retry mechanisms
- Centralized error handling utilities

## ⚡ Performance Optimizations

- **Code Splitting**: Routes are lazy-loaded for faster initial load
- **React.lazy & Suspense**: Components load on-demand
- **Debouncing**: Built-in debounce hook for search and API calls
- **Optimized Bundle**: Smaller bundle size with code splitting

## 📦 Dependencies

### Core
- React 19.2.0
- React Router DOM 7.9.6
- React i18next 16.4.0

### UI & Styling
- Tailwind CSS 3.4.18
- Lucide React 0.554.0
- Material-UI Icons 7.3.5
- React Hot Toast 2.6.0

## 🚢 Deployment

### Build for Production

```bash
npm run build
```

This creates an optimized production build in the `build` folder.

### Deploy to Static Hosting

The `build` folder can be deployed to:
- **Netlify**: Drag and drop the `build` folder
- **Vercel**: Connect your repository and deploy
- **GitHub Pages**: Use `gh-pages` package
- **AWS S3**: Upload `build` folder contents

### Environment Variables in Production

Make sure to set environment variables in your hosting platform:
- `REACT_APP_API_BASE_URL`: Your production API URL

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is private and proprietary.

## 🆘 Support

For issues, questions, or contributions, please contact the development team.

## 🔄 Version History

- **v0.1.0** - Initial release with core features

---

Built with ❤️ using React and modern web technologies.
