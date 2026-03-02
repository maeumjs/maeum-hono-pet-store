# Maeum Hono Pet Store

> Enterprise-grade Pet Store API boilerplate built with Hono.js

Maeum Hono Pet Store is a production-ready boilerplate that demonstrates best practices for building modern REST APIs. Built on top of the ultra-fast Hono.js framework, it provides a solid foundation for developing scalable, maintainable, and type-safe web applications.

## 🚀 Features

### Core Framework & Architecture

- **[Hono.js](https://hono.dev/)** - Ultra-fast web framework for the edge
- **TypeScript** - Full type safety throughout the application
- **Layered Architecture** - Clean separation of concerns with handlers, repositories, and services
- **OpenAPI Integration** - Automatic API documentation with `@hono/zod-openapi`

### Database & ORM

- **[Drizzle ORM](https://orm.drizzle.team/)** - Type-safe SQL toolkit
- **MySQL** - Robust relational database support
- **Schema Validation** - Runtime validation with Zod schemas
- **Database Migrations** - Version-controlled schema changes

### Development Experience

- **Hot Reload** - Fast development with nodemon
- **Path Aliases** - Clean imports with TypeScript path mapping (`#/*`)
- **ESBuild** - Lightning-fast bundling
- **Comprehensive Testing** - Unit and integration tests with Vitest
- **Test Containers** - Isolated database testing with @testcontainers/mysql

### Code Quality & Standards

- **ESLint** - Extended Airbnb configuration with custom rules
- **Prettier** - Consistent code formatting
- **Husky** - Pre-commit hooks for code quality
- **Lint-staged** - Run linters on staged files only
- **TypeScript Strict Mode** - Maximum type safety

### Production Ready

- **Docker Support** - Multi-stage build with optimized production image
- **PM2 Integration** - Process management and clustering
- **Structured Logging** - Pino logger with request tracing
- **Error Handling** - Comprehensive error hierarchy with HTTP status codes
- **Health Checks** - Built-in health monitoring endpoints

## 📁 Project Structure

```text
src/
├── handlers/           # HTTP request handlers (controllers)
│   ├── category/       # Category management endpoints
│   ├── pet/           # Pet management endpoints
│   ├── tag/           # Tag management endpoints
│   └── health/        # Health check endpoints
├── repository/        # Data access layer
│   ├── database/      # Database repositories
│   └── logger/        # Logging repository
├── schema/            # Zod schemas and validation
│   ├── database/      # Database schema definitions
│   ├── repository/    # Repository input/output schemas
│   ├── configuration/ # Configuration schemas
│   └── common/        # Shared schema utilities
├── modules/           # Core application modules
│   ├── error/         # Custom error classes
│   ├── middleware/    # Custom middleware
│   ├── initialize/    # Application initialization
│   └── context/       # Async context management
└── app.ts            # Application entry point
```

## 🛠️ Quick Start

### Prerequisites

- Node.js >= 22
- PNPM >= 9.1.0
- MySQL 8.0+

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/maeumjs/maeum-hono-pet-store.git
   cd maeum-hono-pet-store
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Set up environment configuration**

   ```bash
   # The project uses a structured configuration approach:
   # - resources/configs/config.[environment].env - for sensitive data (passwords, keys)
   # - resources/configs/config.[environment].json - for general settings (git-tracked)

   # Copy and customize configuration for your environment
   cp resources/configs/config.local.env resources/configs/config.your-env.env
   cp resources/configs/config.local.json resources/configs/config.your-env.json
   ```

4. **Run database migrations**

   ```bash
   pnpm dk generate
   pnpm dk migrate
   ```

5. **Start development server**

   ```bash
   # Set RUN_MODE to your environment (local/develop/production)
   RUN_MODE=local pnpm dev
   ```

The API will be available at `http://localhost:3000`

### Configuration Structure

The application uses a dual configuration system for better security and maintainability:

#### Environment Variables (.env files)

Used for sensitive data that shouldn't be committed to git:

```bash
# resources/configs/config.[environment].env

# Database Configuration - Master (Read/Write)
DB_PET_STORE_MASTER_HOST=localhost
DB_PET_STORE_MASTER_PORT=3306
DB_PET_STORE_MASTER_DB=petstore
DB_PET_STORE_MASTER_USERNAME=root
DB_PET_STORE_MASTER_PASSWORD=your-password

# Database Configuration - Slave (Read-Only Replica)
DB_PET_STORE_SLAVE_HOST=localhost
DB_PET_STORE_SLAVE_PORT=3307
DB_PET_STORE_SLAVE_DB=petstore
DB_PET_STORE_SLAVE_USERNAME=root
DB_PET_STORE_SLAVE_PASSWORD=your-password

# Database Performance
DB_PET_STORE_SLOW_QUERY_THRESHOLD=2000

# Encryption & Security
ENV_ENCRYPTION_KEY=your-32-char-encryption-key
DEBUG_CHANNEL=maeum

# Feature Flags
ENV_PAYLOAD_LOGGING=true
ENV_PAYLOAD_LOG_COMPRESS=true
```

#### JSON Configuration Files

Used for general application settings (git-tracked):

```json
// resources/configs/config.[environment].json
{
  "endpoint": {
    "pokeapi": "https://pokeapi.co"
  },
  "server": {
    "runMode": "local",        // Runtime environment: local/develop/production
    "envMode": "production",   // NODE_ENV is always production for optimal performance
    "caller": "maeum",
    "port": 7878,
    "log": {
      "level": "debug"
    }
  }
}
```

#### Runtime Environment Control

- **NODE_ENV**: Always set to `production` for optimal Node.js and library performance
- **RUN_MODE**: Controls application behavior (`local`, `develop`, `production`)
- Configuration files are loaded based on `RUN_MODE` value

### Why Separate NODE_ENV and RUN_MODE?

This architecture separates **runtime optimization** from **application behavior** for several important reasons:

#### NODE_ENV = production (Fixed)

- **Library Optimization**: Most Node.js libraries (React, Express, etc.) optimize performance when `NODE_ENV=production`
- **Dependency Loading**: Eliminates dev dependencies and debugging overhead in all environments
- **Caching & Minification**: Enables production-level optimizations even during development
- **Runtime Consistency**: Prevents development-specific behaviors from causing production bugs
- **Variable Initialization**: Avoids Node.js development mode's automatic variable initialization that can hide bugs

#### RUN_MODE = {local|develop|production} (Variable)

- **Configuration Management**: Loads appropriate config files based on deployment environment
- **Feature Flags**: Controls application-specific behavior (logging, debugging, external services)
- **Environment Isolation**: Separate database connections, API endpoints per environment
- **Business Logic**: Application behavior independent of Node.js runtime optimization
- **Extended Environments**: Supports custom environments (qa, stage, uat) beyond Node.js standard environments

#### Benefits of This Approach

```bash
# ✅ Best of both worlds
NODE_ENV=production RUN_MODE=local pnpm dev     # Fast runtime + local config
NODE_ENV=production RUN_MODE=develop pnpm start # Fast runtime + develop config
NODE_ENV=production RUN_MODE=qa pnpm start      # Fast runtime + QA config
NODE_ENV=production RUN_MODE=stage pnpm start   # Fast runtime + staging config
NODE_ENV=production RUN_MODE=production pnpm start # Fast runtime + production config

# ❌ Traditional approach problems
NODE_ENV=development # Slower runtime, dev dependencies loaded, runtime inconsistencies
NODE_ENV=production  # Can't distinguish between staging/local/production environments
NODE_ENV=staging     # Not a standard Node.js environment, unpredictable behavior
```

#### Real-World Problems Solved

**🐛 Development Mode Runtime Inconsistencies:**

```javascript
// NODE_ENV=development behavior
let config = {}; // Node.js might auto-initialize properties
config.apiKey = undefined; // Still "works" but fails silently

// NODE_ENV=production behavior
let config = {};
config.apiKey = undefined; // Throws error immediately, catches bugs early
```

**🏗️ Environment Proliferation Issues:**

```bash
# Traditional approach confusion
NODE_ENV=development  # Local dev
NODE_ENV=staging      # Not standard, behavior unclear
NODE_ENV=qa           # Not standard, libraries confused
NODE_ENV=production   # Production

# Our approach clarity
NODE_ENV=production   # Always optimized runtime
RUN_MODE=local        # Clear configuration context
RUN_MODE=qa           # Clear configuration context
RUN_MODE=stage        # Clear configuration context
RUN_MODE=production   # Clear configuration context
```

This pattern ensures **optimal performance**, **runtime consistency**, and **flexible environment management** while avoiding the pitfalls of non-standard NODE_ENV values.

### Database Architecture: Master-Slave Configuration

The boilerplate demonstrates **production-ready database scaling** with Master-Slave (Read Replica) architecture:

#### Why Use Read Replicas?

**Performance Benefits:**

- **Read Scaling**: Distribute read queries across multiple database instances
- **Load Distribution**: Reduce load on master database for write-intensive operations
- **Geographic Distribution**: Place replicas closer to users for lower latency
- **Analytical Workloads**: Run heavy reporting queries on replicas without affecting production

**Reliability & Availability:**

- **High Availability**: Continue serving reads even if master is temporarily unavailable
- **Backup Strategy**: Use replicas for backup operations without affecting master performance
- **Disaster Recovery**: Quick failover capability in case of master database failure

#### Implementation Pattern

**Loader-based Dependency Injection:**

```typescript
// src/modules/initialize/init.db.ts
export async function initDb(): Promise<{
  writer: MySql2Database<typeof schema>;
  reader: MySql2Database<typeof schema>;
}> {
  const writerPoolConnection = mysql.createPool({
    host: process.env.DB_PET_STORE_MASTER_HOST,
    port: process.env.DB_PET_STORE_MASTER_PORT,
    // ... master config
  });

  const readerPoolConnection = mysql.createPool({
    host: process.env.DB_PET_STORE_SLAVE_HOST,
    port: process.env.DB_PET_STORE_SLAVE_PORT,
    // ... slave config
  });

  return {
    writer: drizzle(writerPoolConnection, { schema }),
    reader: drizzle(readerPoolConnection, { schema })
  };
}
```

**Repository Layer with Smart Routing:**

```typescript
// src/repository/database/pet.repository.ts
import { container } from '#/loader';

// Read operations - parameterized database selection
export async function readPetById(
  id: bigint,
  use: keyof typeof container.db = 'reader'  // Default to read replica
): Promise<Pet> {
  const db = use === 'writer' ? container.db.writer : container.db.reader;

  return await db.query.pets.findFirst({
    where: eq(pets.id, id),
    with: { tags: true, category: true }
  });
}

// Write operations - always use master
export async function createPet(pet: CreatePet): Promise<Pet> {
  return await container.db.writer.transaction(async (tx) => {
    const result = await tx.insert(pets).values(pet).$returningId();
    return await readPetById(result.id, 'writer'); // Consistent read after write
  });
}

// Flexible read routing for complex scenarios
export async function updatePet(id: bigint, pet: UpdatePet): Promise<Pet> {
  // Check existence on writer for consistency
  const existingPet = await readPetById(id, 'writer');
  if (!existingPet) throw new NotFoundError('Pet not found');

  await container.db.writer.transaction(async (tx) => {
    await tx.update(pets).set(pet).where(eq(pets.id, id));
  });

  return await readPetById(id, 'writer'); // Return fresh data from master
}
```

#### Configuration Benefits

**Development Environment:**

```bash
# Single database for simplicity
DB_PET_STORE_MASTER_HOST=localhost:3306
DB_PET_STORE_SLAVE_HOST=localhost:3306  # Same as master
```

**Production Environment:**

```bash
# Separate read replica for performance
DB_PET_STORE_MASTER_HOST=master.db.company.com:3306
DB_PET_STORE_SLAVE_HOST=replica.db.company.com:3306
```

This architecture provides a **scalable foundation** that grows with your application's needs.

## 📚 Architecture & Design Principles

The boilerplate implements several advanced design principles documented in detail:

- **[SCHEMA_FIRST.md](docs/SCHEMA_FIRST.md)** - Schema-first development: Prioritizing runtime validation over compile-time types for robust data integrity
- **[REQUEST_ID.md](docs/REQUEST_ID.md)** - End-to-end request tracing: Implementing correlation IDs for complete observability across client, proxy, and database layers
- **[LOADER.md](docs/LOADER.md)** - Type-safe initialization: Leveraging `--import` and top-level await for deterministic async bootstrapping in Node.js applications

These documents provide in-depth technical rationale and implementation strategies for enterprise-grade application architecture.

## 📜 Available Scripts

### Development

```bash
RUN_MODE=local pnpm dev      # Start development server with hot reload (local config)
RUN_MODE=develop pnpm dev    # Start with develop environment configuration
RUN_MODE=local pnpm debug    # Start with debugging enabled
```

### Building

```bash
pnpm build        # Build TypeScript to JavaScript
pnpm bundle       # Create optimized bundle with esbuild
```

### Database

```bash
pnpm dk           # Drizzle kit CLI
pnpm dk generate  # Generate migrations
pnpm dk migrate   # Run migrations
pnpm seed         # Seed database with sample data
```

### Testing

```bash
pnpm test         # Run all tests with coverage
```

### Code Quality

```bash
pnpm lint         # Run ESLint
pnpm prettier     # Format code with Prettier
pnpm lnb          # Run build and lint together
```

### Production

```bash
RUN_MODE=production pnpm start        # Start with PM2 (production config)
RUN_MODE=production pnpm start:withoutpm2  # Start without PM2
```

## 🔍 API Documentation

Once the server is running, you can access:

- **OpenAPI Documentation**: `http://localhost:3000/doc`
- **Health Check**: `http://localhost:3000/health`
- **Root Endpoint**: `http://localhost:3000/`

### Sample API Endpoints

```http
# Categories
GET    /category/:id     # Get category by ID
POST   /category         # Create new category
PUT    /category/:id     # Update category
DELETE /category/:id     # Delete category

# Pets
GET    /pet/:id         # Get pet by ID
POST   /pet             # Create new pet
PUT    /pet/:id         # Update pet
DELETE /pet/:id         # Delete pet
POST   /pet/:id/uploadImage  # Upload pet image

# Tags
GET    /tag/:id         # Get tag by ID
POST   /tag             # Create new tag
PUT    /tag/:id         # Update tag
DELETE /tag/:id         # Delete tag
```

## 🧪 Testing

The project includes comprehensive test coverage using Vitest and Test Containers:

```bash
# Run all tests
pnpm test

# Run tests with UI
pnpm test:ui

# Run specific test file
pnpm test src/repository/database/pet.repository.test.ts
```

Tests use MySQL test containers for isolated database testing, ensuring consistent test environments.

## 🐳 Docker Support

### Development

```bash
docker build -t maeum-pet-store .
docker run -p 3000:3000 maeum-pet-store
```

### Production

The Dockerfile uses multi-stage builds with PNPM for optimized production images.

## 🏗️ Architecture Patterns

### Configuration Management

**Dual Configuration System** for optimal security and maintainability:

- **Environment Files** (`.env`): Sensitive data (passwords, API keys, secrets)
- **JSON Config** (`.json`): General settings, feature flags, endpoints
- **Runtime Control**: `NODE_ENV=production` + `RUN_MODE={local|develop|production}`
- **Environment Isolation**: Separate configs per environment with clear separation of concerns

### Error Handling

Custom error hierarchy with proper HTTP status codes:

- `HttpError` - Base error class
- `BadRequestError` - 400 errors
- `UnauthorizedError` - 401 errors
- `ForbiddenError` - 403 errors
- `NotFoundError` - 404 errors
- `ConfigurationError` - 500 errors

### Type Safety

- Zod schemas for runtime validation
- Drizzle ORM for type-safe database queries
- OpenAPI integration with automatic type generation
- Comprehensive TypeScript configuration

### Repository Pattern

Clean separation between data access and business logic:

- Database repositories handle data persistence
- Schema validation at the repository level
- Test coverage for all repository methods

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Hono.js](https://hono.dev/) for the amazing web framework
- [Drizzle ORM](https://orm.drizzle.team/) for type-safe database operations
- [Zod](https://zod.dev/) for schema validation
- All the amazing open-source projects that make this possible

---

Built with ❤️ by [ByungJoon Lee](https://github.com/imjuni)
