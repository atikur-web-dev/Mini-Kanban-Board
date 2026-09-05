# Mini Kanban Board

A full-stack collaborative Kanban board application built as a technical assessment for a **Full-Stack Engineer** role.

The application allows authenticated users to create boards, organize workflow columns, manage tasks, share boards with other registered users, and move tasks through an interactive drag-and-drop interface.

---

## Project Overview

This project was developed for the **Web Briks Full-Stack Engineering Technical Assessment**.

The assessment requires building a functional Mini Kanban Board with:

- User registration and login
- Token-based authentication
- Board ownership and sharing
- Authorization and access control
- Board, column, and task management
- Task reordering within a column
- Moving tasks between columns
- Position-based task movement
- Stable and consistent task ordering
- Interactive drag-and-drop board UI
- PostgreSQL database
- Prisma ORM
- Next.js / React frontend
- TypeScript backend
- Docker-based local database setup

The assessment specifically asks candidates to design their own database schema and system architecture for collaboration, access permissions, and drag-and-drop task reordering.

---

## Features

### Authentication

- User registration
- User login
- Token-based authentication
- Password hashing
- Protected API routes
- Authentication middleware
- Secure user information handling

### Collaboration & Access Control

- Board ownership
- Share boards with registered users
- Board membership management
- Explicit access control
- Users can only access boards they own or have been granted access to
- Protection against unauthorized cross-board access
- Server-side authorization for board, column, and task operations

### Board Management

- Create boards
- View accessible boards
- Update boards
- Delete boards
- Board ownership tracking

### Column Management

- Create columns
- Update columns
- Delete columns
- Reorder columns
- Columns belong to a specific board

### Task Management

- Create tasks
- View tasks
- Update tasks
- Delete tasks
- Optional task descriptions
- Assign tasks to users
- Move tasks between columns
- Reorder tasks within a column

### Task Movement

The task movement system supports:

- Reordering a task within the same column
- Moving a task to another column
- Moving a task to a specific position index
- First-position movement
- Last-position movement
- Middle-position movement
- Moving into an empty column
- Maintaining unique task positions
- Transaction-based ordering updates
- Preventing inconsistent or duplicate positions

Task ordering is handled by the backend rather than trusting the frontend.

### Drag & Drop

The frontend provides an interactive Kanban board where users can:

- Drag tasks
- Drop tasks into another position
- Move tasks between columns
- See the updated ordering immediately

---

## Tech Stack

### Frontend

- **Next.js** - React framework with App Router
- **React** - UI library
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **@dnd-kit** - Drag and drop library

### Backend

- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **TypeScript** - Type-safe JavaScript
- **Zod** - Schema validation

### Database

- **PostgreSQL** - Relational database
- **Prisma ORM** - Type-safe database client

### Authentication & Security

- **JWT** - JSON Web Tokens
- **bcrypt** - Password hashing
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing
- **Environment variable validation**

### DevOps

- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration

---

## Architecture

The project follows a layered backend architecture:

Client
│
▼
Next.js Frontend
│
│ HTTP / REST API
▼
Express.js API
│
├── Middleware
│ ├── Authentication
│ ├── Authorization
│ └── Validation
│
▼
Controllers
│
▼
Services
│
▼
Prisma ORM
│
▼
PostgreSQL

## Project Structure
Mini-Kanban-Board/
│
├── Backend/
│ ├── src/
│ │ ├── config/
│ │ │ ├── env.ts
│ │ │ └── prisma.ts
│ │ │
│ │ ├── controllers/
│ │ │ ├── auth.controller.ts
│ │ │ ├── board.controller.ts
│ │ │ └── task.controller.ts
│ │ │
│ │ ├── middleware/
│ │ │ ├── auth.middleware.ts
│ │ │ ├── boardAuth.middleware.ts
│ │ │ ├── errorHandler.ts
│ │ │ └── validate.middleware.ts
│ │ │
│ │ ├── routes/
│ │ │ ├── auth.routes.ts
│ │ │ ├── board.routes.ts
│ │ │ └── task.routes.ts
│ │ │
│ │ ├── services/
│ │ │ ├── auth.service.ts
│ │ │ ├── board.service.ts
│ │ │ └── task.service.ts
│ │ │
│ │ ├── utils/
│ │ │ └── appError.ts
│ │ │
│ │ ├── lib/
│ │ │ └── prisma.ts
│ │ │
│ │ ├── app.ts
│ │ └── server.ts
│ │
│ ├── prisma/
│ │ ├── migrations/
│ │ └── schema.prisma
│ │
│ ├── .env.example
│ ├── package.json
│ └── tsconfig.json
│
├── Frontend/
│ ├── app/
│ │ ├── (auth)/
│ │ │ ├── login/
│ │ │ │ └── page.tsx
│ │ │ └── register/
│ │ │ └── page.tsx
│ │ ├── (dashboard)/
│ │ │ ├── dashboard/
│ │ │ │ └── page.tsx
│ │ │ └── board/
│ │ │ └── [id]/
│ │ │ └── page.tsx
│ │ ├── layout.tsx
│ │ ├── page.tsx
│ │ └── providers.tsx
│ │
│ ├── components/
│ │ ├── ui/
│ │ │ ├── Button/
│ │ │ ├── Input/
│ │ │ └── Loader/
│ │ ├── column/
│ │ │ └── Column.tsx
│ │ └── task/
│ │ └── TaskCard.tsx
│ │
│ ├── context/
│ │ ├── AuthContext.tsx
│ │ ├── BoardContext.tsx
│ │ └── TaskContext.tsx
│ │
│ ├── hooks/
│ │ └── useAuth.ts
│ │
│ ├── lib/
│ │ └── api/
│ │ ├── client.ts
│ │ ├── auth.ts
│ │ ├── board.ts
│ │ ├── column.ts
│ │ └── task.ts
│ │
│ ├── types/
│ │ ├── auth.ts
│ │ ├── board.ts
│ │ ├── column.ts
│ │ ├── task.ts
│ │ └── index.ts
│ │
│ ├── .env.local.example
│ ├── package.json
│ └── tsconfig.json
│
├── docker-compose.yml
├── .gitignore
└── README.md


---

## Database Design

The application uses PostgreSQL with Prisma ORM.

The main entities are:
User
│
├── owns → Board
│
├── member of → Board
│
└── assigned → Task

Board
│
├── has → BoardMember
│
└── has → Column
│
└── has → Task


### Main Models

#### User

Stores registered users.

| Field          | Type     | Description           |
|----------------|----------|-----------------------|
| `id`           | UUID     | Primary key           |
| `name`         | String   | User's full name      |
| `email`        | String   | Unique email address  |
| `passwordHash` | String   | Hashed password       |
| `createdAt`    | DateTime | Creation timestamp    |
| `updatedAt`    | DateTime | Last update timestamp |

#### Board

Represents a Kanban board.

| Field       | Type     | Description              |
|-------------|----------|--------------------------|
| `id`        | UUID     | Primary key              |
| `name`      | String   | Board name               |
| `ownerId`   | UUID     | Reference to User (owner)|
| `createdAt` | DateTime | Creation timestamp       |
| `updatedAt` | DateTime | Last update timestamp    |

#### BoardMember

Represents explicit access to a board.

| Field       | Type     | Description           |
|-------------|----------|-----------------------|
| `id`        | UUID     | Primary key           |
| `boardId`   | UUID     | Reference to Board    |
| `userId`    | UUID     | Reference to User     |
| `createdAt` | DateTime | Creation timestamp    |

> **Constraint:** `@@unique([boardId, userId])` prevents duplicate memberships.

#### Column

Represents a workflow column.

| Field       | Type     | Description              |
|-------------|----------|--------------------------|
| `id`        | UUID     | Primary key              |
| `name`      | String   | Column name              |
| `boardId`   | UUID     | Reference to Board       |
| `position`  | Int      | Order within board       |
| `createdAt` | DateTime | Creation timestamp       |
| `updatedAt` | DateTime | Last update timestamp    |

> **Constraint:** `@@unique([boardId, position])` prevents duplicate positions.

#### Task

Represents an individual Kanban task.

| Field          | Type     | Description              |
|----------------|----------|--------------------------|
| `id`           | UUID     | Primary key              |
| `title`        | String   | Task title               |
| `description`  | String?  | Optional description     |
| `position`     | Int      | Order within column      |
| `columnId`     | UUID     | Reference to Column      |
| `assigneeId`   | UUID?    | Optional reference to User|
| `createdAt`    | DateTime | Creation timestamp       |
| `updatedAt`    | DateTime | Last update timestamp    |

> **Constraint:** `@@unique([columnId, position])` prevents duplicate positions.

---

## Authorization Model

Access to boards is explicitly controlled.

A user can access a board when:


The movement operation updates both the source and destination columns atomically.

---

## API Design

The backend exposes RESTful APIs grouped by resource.

### Authentication

| Method | Endpoint              | Description           |
|--------|-----------------------|-----------------------|
| POST   | `/api/auth/register`  | Register a new user   |
| POST   | `/api/auth/login`     | Login and get JWT     |

### Boards

| Method | Endpoint                    | Description                   |
|--------|-----------------------------|-------------------------------|
| GET    | `/api/boards`               | Get all accessible boards     |
| POST   | `/api/boards`               | Create a new board            |
| GET    | `/api/boards/:boardId`      | Get board details             |
| PATCH  | `/api/boards/:boardId`      | Update board                  |
| DELETE | `/api/boards/:boardId`      | Delete board                  |

### Board Sharing

| Method | Endpoint                               | Description           |
|--------|----------------------------------------|-----------------------|
| POST   | `/api/boards/:boardId/share`           | Share board with user |
| DELETE | `/api/boards/:boardId/members/:userId` | Remove member         |

### Columns

| Method | Endpoint                         | Description        |
|--------|----------------------------------|--------------------|
| POST   | `/api/boards/:boardId/columns`   | Create a column    |
| PATCH  | `/api/columns/:columnId`         | Update column      |
| DELETE | `/api/columns/:columnId`         | Delete column      |

### Tasks

| Method | Endpoint                   | Description        |
|--------|----------------------------|--------------------|
| POST   | `/api/columns/:columnId/tasks` | Create a task   |
| PATCH  | `/api/tasks/:taskId`       | Update task        |
| DELETE | `/api/tasks/:taskId`       | Delete task        |

### Task Movement

| Method | Endpoint                    | Description                    |
|--------|-----------------------------|--------------------------------|
| POST   | `/api/tasks/:taskId/move`   | Move task to a column/position |

**Example Request:**
```json
POST /api/tasks/:taskId/move
{
  "targetColumnId": "column-uuid",
  "targetPosition": 2
}

