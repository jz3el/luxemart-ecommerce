# 🏪 LuxeMart - Premium E-Commerce Platform

A sophisticated full-stack e-commerce web application built with .NET 8 Web API backend and Angular 18 frontend, featuring a premium black & white gradient design theme.

## Project Structure

```
ecommerce-dotnet-angular/
├── backend/               # .NET Web API project
│   └── ECommerceAPI.csproj
├── frontend/             # Angular application
│   ├── src/
│   ├── package.json
│   └── angular.json
└── README.md
```

## Backend (.NET Web API)

The backend is located in the `backend` directory and provides RESTful APIs for the e-commerce functionality.

### Running the Backend

```bash
cd backend
dotnet run
```

The API will be available at `http://localhost:5000`.

## Frontend (Angular)

The frontend is located in the `frontend` directory and provides the user interface for the e-commerce application.

### Running the Frontend

```bash
cd frontend
npm start
```

The application will be available at `http://localhost:4200`.

## Development

1. Start the backend API server
2. Start the Angular development server
3. Both applications will run concurrently for full-stack development

## ✨ Features

### 🛍️ Customer Features
- **Product Catalog**: Browse premium products with advanced filtering and search
- **Shopping Cart**: Add, remove, and manage cart items with real-time updates
- **User Authentication**: Secure JWT-based registration and login system
- **Profile Management**: Complete user profile with address information
- **Responsive Design**: Mobile-friendly premium UI with smooth animations

### 👨‍💼 Admin Features
- **Admin Dashboard**: Comprehensive dashboard with statistics and analytics
- **Product Management**: Full CRUD operations for products
- **User Management**: Manage users, roles, and account status
- **Order Management**: View and manage customer orders
- **Inventory Tracking**: Low stock alerts and inventory management

### 🎨 Design Features
- **Premium Theme**: Professional black & white gradient design
- **Smooth Animations**: Advanced CSS transitions and hover effects
- **Glassmorphism**: Modern UI with backdrop blur effects
- **Professional Typography**: Clean, modern font styling
- **Interactive Elements**: Engaging user interface components

## 🛠️ Technologies Used

### Backend
- **.NET 8**: Latest .NET framework with ASP.NET Core Web API
- **Entity Framework Core**: ORM for database operations
- **SQL Server**: Primary database with LocalDB for development
- **JWT Authentication**: Secure token-based authentication
- **AutoMapper**: Object-to-object mapping
- **CORS**: Cross-origin resource sharing configuration

### Frontend
- **Angular 18**: Latest Angular framework with standalone components
- **TypeScript**: Strongly typed JavaScript with modern features
- **Bootstrap**: Responsive design framework
- **Bootstrap Icons**: Professional icon library
- **RxJS**: Reactive programming with observables
- **Angular Router**: Single-page application routing
- **SSR Support**: Server-side rendering capabilities

### Development Tools
- **Git**: Version control
- **Visual Studio Code**: Primary development IDE
- **Angular CLI**: Command-line interface for Angular
- **npm**: Package manager

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or later)
- .NET 8 SDK
- SQL Server or SQL Server Express LocalDB

### Backend Setup
```bash
cd backend
dotnet restore
dotnet run
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

### Access the Application
- **Frontend**: http://localhost:54565/ (or port shown in terminal)
- **Backend API**: http://localhost:5000
- **Admin Login**: Use seeded admin credentials

## 📱 Application Screenshots

### Premium Design Theme
- Modern black & white gradient color scheme
- Professional glassmorphism effects
- Smooth animations and transitions
- Responsive design for all devices

### User Experience
- Intuitive product browsing
- Seamless shopping cart experience
- Professional user authentication
- Comprehensive admin management

## 🗄️ Database Structure

The application uses Entity Framework Core with the following main entities:
- **Users**: Customer and admin accounts
- **Products**: Product catalog with categories
- **Categories**: Product categorization
- **CartItems**: Shopping cart management
- **Orders**: Order processing and history

## 🔐 Authentication & Authorization

- **JWT Tokens**: Secure authentication
- **Role-based Access**: Customer and Admin roles
- **Protected Routes**: Secure API endpoints
- **Auto-logout**: Token expiration handling

## 🎯 API Endpoints

### Public Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/products` - Browse products

### Protected Endpoints
- `GET /api/cart` - User's shopping cart
- `POST /api/cart/add` - Add to cart
- `GET /api/auth/profile` - User profile

### Admin Endpoints
- `GET /api/admin/dashboard` - Admin dashboard
- `GET /api/admin/users` - User management
- `GET /api/admin/products` - Product management
