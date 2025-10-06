# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is a full-stack e-commerce web application with a .NET Web API backend and Angular frontend. The project is in early development stages with basic scaffolding in place.

**Architecture**: 
- **Backend**: .NET 9 Web API with Entity Framework Core, JWT Authentication support, and Swagger documentation
- **Frontend**: Angular 20 with Server-Side Rendering (SSR), Bootstrap styling, and TypeScript
- **Project Structure**: Monorepo with separate `backend/` and `frontend/` directories

## Common Development Commands

### Backend (.NET Web API)
Located in `backend/` directory:

```bash
# Navigate to backend
cd backend

# Restore packages
dotnet restore

# Run the application (development mode)
dotnet run

# Build the application
dotnet build

# Run tests (when test projects are added)
dotnet test

# Add Entity Framework migrations (when DB context is configured)
dotnet ef migrations add MigrationName

# Update database (when DB context is configured)
dotnet ef database update

# Watch mode for development (auto-reload on changes)
dotnet watch run

# Entity Framework commands
dotnet ef migrations add MigrationName
dotnet ef database update
dotnet ef database drop --force
dotnet ef migrations remove

# View database migrations
dotnet ef migrations list
```

**Backend runs on**:
- HTTPS: https://localhost:7000
- HTTP: http://localhost:5000

### Frontend (Angular)
Located in `frontend/` directory:

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm start
# Alternative: ng serve

# Build for production
npm run build
# Alternative: ng build

# Run tests
npm test
# Alternative: ng test

# Watch build (auto-rebuild on changes)
npm run watch
# Alternative: ng build --watch --configuration development

# Serve SSR build
npm run serve:ssr:frontend

# Lint (when ESLint is configured)
ng lint

# Generate components/services/etc
ng generate component component-name
ng generate service service-name
```

**Frontend runs on**: http://localhost:4200

### Full-Stack Development
To run both applications simultaneously for development:

```bash
# Terminal 1 - Backend
cd backend && dotnet run

# Terminal 2 - Frontend  
cd frontend && npm start
```

## Architecture & Code Organization

### Backend Structure
- **Program.cs**: Application entry point with Entity Framework and CORS configuration
- **ECommerceAPI.csproj**: Project dependencies and configuration
  - .NET 9 target framework
  - Entity Framework Core (SQL Server + InMemory providers)
  - JWT Bearer authentication ready
  - Swagger/OpenAPI documentation
- **Models/**: Entity Framework models for e-commerce domain
  - **User.cs**: User accounts with authentication and profile information
  - **Product.cs**: Product catalog with categories, pricing, and inventory
  - **Category.cs**: Product categorization system
  - **Order.cs**: Order management with status tracking and shipping
  - **OrderItem.cs**: Individual items within orders
  - **CartItem.cs**: Shopping cart functionality
- **Data/**: Database context and configuration
  - **ECommerceDbContext.cs**: Entity Framework context with relationships and seed data
- **Migrations/**: Entity Framework database migrations
- **Properties/**: Launch settings and application properties
- **obj/**: Build artifacts (auto-generated)

**Current State**: Full e-commerce database schema implemented with:
- Complete entity models with relationships and validation
- SQL Server database created and seeded with initial data
- Entity Framework context configured with Fluent API
- CORS enabled for Angular frontend integration
- Ready for controllers implementation

### Frontend Structure
- **src/app/**: Main application code
  - **app.ts**: Root component (currently default Angular template)
  - **app.routes.ts**: Routing configuration (empty, ready for routes)
  - **app.config.ts**: Application configuration
- **src/**: Application entry points and global styles
  - **main.ts**: Browser entry point
  - **main.server.ts**: SSR entry point
  - **server.ts**: Express server for SSR
- **public/**: Static assets
- **angular.json**: Angular CLI configuration with SSR enabled
- **package.json**: Dependencies including Bootstrap and Angular 20

**Current State**: Fresh Angular scaffold with SSR setup. Ready for e-commerce features like:
- Product catalog components
- Shopping cart functionality  
- User authentication pages
- Order management interfaces

### Key Technologies & Dependencies

**Backend**:
- .NET 9 with ASP.NET Core Web API
- Entity Framework Core 9.0.1 with SQL Server
- JWT Bearer Authentication 9.0.8 (ready for implementation)
- Swagger/OpenAPI documentation
- Complete e-commerce database schema (Users, Products, Orders, Categories, Cart)
- Database seeded with initial test data

**Frontend**:
- Angular 20 with TypeScript 5.8
- Server-Side Rendering (SSR) with Express
- Bootstrap 5.3.3 for styling
- Jasmine/Karma for testing
- Prettier configuration for HTML formatting

### Development Workflow Notes

1. **Database**: SQL Server configured with Entity Framework Core - database created and ready
2. **Authentication**: JWT Bearer authentication package included but not implemented
3. **API Documentation**: Swagger/OpenAPI configured for development environment
4. **Testing**: Angular testing setup ready with Jasmine/Karma; .NET test projects not yet added
5. **Styling**: Bootstrap included in frontend for consistent UI components
6. **SSR**: Frontend configured for server-side rendering with Express

### Planned Features (from README)
- Product catalog
- Shopping cart
- User authentication  
- Order management
- Payment processing
- Admin dashboard

## Development Guidelines

- **API Development**: Use controller-based approach rather than minimal APIs for complex e-commerce functionality
- **Database**: 
  - SQL Server database is configured and ready with complete e-commerce schema
  - Use Entity Framework migrations for schema changes: `dotnet ef migrations add MigrationName`
  - Connection strings configured for both development and production environments
  - Seeded with initial Categories and Products data
- **Authentication**: Implement JWT token generation and validation for secure API endpoints
- **Frontend Components**: Follow Angular component architecture with proper separation of concerns
- **Styling**: Leverage Bootstrap classes for consistent UI across e-commerce pages
- **Testing**: Add unit tests for both backend controllers/services and frontend components as features are developed

## Single Test Execution

### Backend
```bash
# Run specific test class (when tests exist)
cd backend
dotnet test --filter "ClassName=TestClassName"

# Run specific test method (when tests exist)
dotnet test --filter "MethodName=TestMethodName"
```

### Frontend
```bash
# Run tests for specific component
cd frontend
ng test --include="**/component-name.spec.ts"

# Run tests in single-run mode (CI)
ng test --watch=false --browsers=ChromeHeadless
```