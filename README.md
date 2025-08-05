# Viixoo Hemago MRP Application

A comprehensive Manufacturing Resource Planning (MRP) application built with modern web technologies, designed to manage production orders, work orders, and manufacturing processes.

## 🏭 Project Overview

This MRP application provides a complete solution for manufacturing management, including:

- **Production Order Management**: Create and track production orders with bill of materials
- **Work Order Management**: Monitor and control individual work orders on production lines
- **Component Management**: Track raw materials and component consumption
- **Time Tracking**: Monitor employee time and production efficiency
- **Quality Control**: Manage quality states and testing procedures
- **Blockage Management**: Handle production stoppages and loss tracking

## 🏗️ Architecture

The application follows a modern microservices architecture with separate frontend and backend components:

### Backend (`viixoo_app_engine/`)
- **Framework**: FastAPI with Python
- **Database**: PostgreSQL
- **Core Engine**: Custom Viixoo App Engine for microservices
- **Modules**: 
  - `viixoo_core/`: Core framework and utilities
  - `viixoo_backend_apps/mrp/`: MRP-specific business logic
  - `viixoo_backend_apps/example/`: Example module

### Frontend (`viixoo_app_engine/viixoo_frontend_apps/`)
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Library**: Chakra UI
- **State Management**: TanStack Query
- **Routing**: TanStack Router
- **Code Quality**: Biome for linting and formatting

## 🚀 Quick Start

### Prerequisites
- Python 3.9+ 
- Node.js 18+
- PostgreSQL database
- Docker (optional, for containerized deployment)

### Backend Setup

1. **Navigate to the backend directory:**
   ```bash
   cd viixoo_app_engine/viixoo_core
   ```

2. **Create and activate virtual environment:**
   ```bash
   python -m venv env
   # On Windows:
   env\Scripts\activate
   # On Linux/macOS:
   source env/bin/activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements-dev.txt
   pip install -e .[dev]
   ```

4. **Configure database:**
   - Update `viixoo_app_engine/viixoo_backend_apps/mrp/mrp.conf` with your PostgreSQL credentials
   - Ensure PostgreSQL is running on the configured port

5. **Run migrations:**
   ```bash
   viixoo_migrate
   ```

6. **Start the backend server:**
   ```bash
   uvicorn viixoo_core.app:app --reload
   ```
   
   The API will be available at `http://localhost:8000`

### Frontend Setup

1. **Navigate to the frontend directory:**
   ```bash
   cd viixoo_app_engine/viixoo_frontend_apps
   ```

2. **Install Node.js dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   
   The frontend will be available at `http://localhost:5173`

## 📁 Project Structure

```
viixoo_hemago_mrp_app/
├── viixoo_app_engine/
│   ├── viixoo_core/                    # Core framework
│   │   ├── app.py                      # FastAPI application
│   │   ├── models/                     # Database models
│   │   ├── routes/                     # Base controllers
│   │   ├── services/                   # Base services
│   │   └── migrations.py               # Database migrations
│   ├── viixoo_backend_apps/
│   │   ├── mrp/                        # MRP module
│   │   │   ├── models/                 # MRP data models
│   │   │   ├── routes/                 # API endpoints
│   │   │   ├── services/               # Business logic
│   │   │   └── mrp.conf               # Configuration
│   │   └── example/                    # Example module
│   └── viixoo_frontend_apps/
│       ├── src/
│       │   ├── components/             # React components
│       │   ├── routes/                 # Application routes
│       │   ├── hooks/                  # Custom React hooks
│       │   └── client/                 # API client
│       ├── package.json
│       └── vite.config.ts
├── IaC/                                # Infrastructure as Code
│   └── terraform/                      # Terraform configurations
└── docker-compose.yaml                 # Docker orchestration
```

## 🔧 Development

### Backend Development

For detailed backend development information, see: [Backend Documentation](./viixoo_app_engine/viixoo_core/README.md)

**Key Commands:**
- Run tests: `pytest -v`
- Run with coverage: `pytest --cov=viixoo_core`
- Convert Odoo models: `viixoo_convert <input> <output>`

### Frontend Development

For detailed frontend development information, see: [Frontend Documentation](./viixoo_app_engine/viixoo_frontend_apps/README.md)

**Key Commands:**
- Development server: `npm run dev`
- Build for production: `npm run build`
- Lint code: `npm run lint`
- Generate API client: `npm run generate-client`

## 🧪 Testing

### Backend Testing
```bash
cd viixoo_app_engine/viixoo_core
pytest -v
```

### Frontend Testing
```bash
cd viixoo_app_engine/viixoo_frontend_apps
npm test
```

## 🐳 Docker Deployment

The application includes Docker support for easy deployment:

```bash
docker-compose up -d
```

This will start both the backend and frontend services with proper networking.

## 📚 API Documentation

Once the backend is running, you can access:
- **Interactive API docs**: `http://localhost:8000/docs`
- **ReDoc documentation**: `http://localhost:8000/redoc`

## 🔗 Key Features

### Production Management
- Create and manage production orders
- Track bill of materials (BOM)
- Monitor production progress and completion

### Work Order Control
- Real-time work order status tracking
- Employee time monitoring
- Quality control integration
- Production blockage management

### Component Tracking
- Raw material consumption tracking
- Component availability monitoring
- Automated consumption workflows

### User Management
- Secure authentication system
- Role-based access control
- User activity tracking

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the terms specified in the [LICENSE](./LICENSE) file.

## 🆘 Support

For support and questions:
- Check the documentation in the respective module READMEs
- Review the API documentation at `/docs` when the server is running
- Open an issue for bugs or feature requests
