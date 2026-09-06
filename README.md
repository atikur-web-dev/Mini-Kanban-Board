# 🚀 Mini Kanban Board

A clean, modern, and collaborative Kanban board designed for organizing projects, workflow columns, and tasks in one centralized place. 

Create custom boards, manage daily tasks, reorder work seamlessly with drag-and-drop mechanics, and securely share boards with other registered team members.


##  Core Features

###  Authentication & Security
- **User Sessions:** Secure registration, login, and token-based persistent authenticated sessions.
- **Session Expiration:** Automatic handling of expired tokens and secure logout logic.
- **Validation:** Strict client and server-side password validation rules.
- **Guarded Access:** Protected client dashboard routes and backend board endpoints.

###  Board Management
- **Multi-Board Hub:** Create, view, update details, and delete multiple boards easily.
- **Visibility Filters:** Clear separation between boards you own versus boards shared with you.
- **Access Control:** Granular ownership layer dictating who can modify board schemas.

###  Collaboration
- **Workspace Sharing:** Share boards immediately with any registered system user.
- **Member Roster:** View all board members and monitor current workspace access.
- **Access Revocation:** Owner-only administrative rights to remove members from shared environments.

###  Workflow & Columns
- **Dynamic Columns:** Create, rename, and delete workflow stages (columns) inside any board.
- **Task Bundling:** Organize specific task sets within isolated, individual columns.
- **Authorization:** Column-level security to prevent external payload injections.

###  Task Management
- **Deep Control:** Full CRUD operations (Create, Read, Update, Delete) on tasks.
- **Rich Context:** Edit task titles, add detailed descriptions, and view task granular details.
- **Cross-Movement:** Move tasks between columns or reorder them freely within the same column.

###  Drag & Drop Interactivity
- **Contextual Dragging:** Click and drag tasks directly from the UI card viewport.
- **Flexible Drop:** Reorder internal positions or drop tasks safely into entirely empty columns.
- **Fallback Operations:** Manual fallback button triggers are available for task positioning.
- **Visual Feedback:** Smooth drag transitions backed by clean, accessible visual feedback markers.

###  User Experience & Design
- **Responsive Workspace:** Adaptive grid layout fine-tuned seamlessly for **Desktop, Laptop, Tablet, and Mobile** layouts.
- **Action Signals:** Non-blocking interactive toast notifications highlighting action successes and errors.
- **UI States:** Contextual UI placeholders for active loading triggers and empty data spaces.
- **Safety Locks:** Explicit confirmation modal prompts guarding destructive database actions.

---

##  Tech Stack

### Frontend
- **Framework:** Next.js & React
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Interactions:** dnd-kit
- **Notifications:** React Hot Toast

### Backend
- **Runtime Environment:** Node.js
- **Framework:** Express.js
- **Language:** TypeScript
- **Security:** JWT Authentication
- **ORM:** Prisma ORM

### Database
- **Engine:** PostgreSQL (v14+)

---

##  Project Structure

```text
Mini-Kanban-Board/
│
├── Backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── validators/
│   │   ├── lib/
│   │   └── server.ts
│   │
│   ├── prisma/
│   │   ├── migrations/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   │
│   ├── .env.example
│   └── package.json
│
└── Frontend/
    ├── app/
    │   ├── (auth)/
    │   ├── (dashboard)/
    │   ├── globals.css
    │   └── providers.tsx
    │
    ├── components/
    ├── context/
    ├── hooks/
    ├── lib/
    ├── types/
    └── package.json
```

---

##  Getting Started & Setup

### Prerequisites
Ensure the following base dependencies are globally active on your workstation:
- **Node.js** (Version 20+)
- **PostgreSQL** (Version 14+)
- **npm** (Node Package Manager)

### 1. Clone the repository
```bash
git clone <your-repository-url>
cd Mini-Kanban-Board
```

---

##  Backend Setup

1. **Navigate to workspace & install packages:**
   ```bash
   cd Backend
   npm install
   ```

2. **Configure environment entries:**
   ```bash
   cp .env.example .env
   ```
   Open the newly generated `.env` file and replace the placeholder fields:
   ```env
   DATABASE_URL="postgresql://postgres:password@localhost:5432/mini_kanban"
   JWT_SECRET="your-super-secret-jwt-key"
   PORT=5000
   NODE_ENV="development"
   ```
   >  **Security Warning:** Never commit real credentials, secrets, or production environment values directly to the repository.

3. **Deploy database schemas:**
   Ensure your local PostgreSQL service instance is active, then run:
   ```bash
   npx prisma migrate dev
   ```

4. **Generate the programmatic client:**
   ```bash
   npx prisma generate
   ```

5. **Populate demo records (Seeding):**
   Execute the following routine to inject functional accounts (`Backend/prisma/seed.ts`):
   ```bash
   npx prisma db seed
   ```
   *Note: All seeded default users utilize the global credential:* **`password123`**

   ### Seeded Accounts Roster

   | Name | Registered Email | Purpose |
   | :--- | :--- | :--- |
   | **Test User** | test@example.com | Primary Owner Demo |
   | **Alinur** | alinur@gmail.com | Collaborator Target |
   | **Atikur Rahman** | atikurrahman@gmail.com | Collaborator Target |
   | **Rahim Khan** | rahim@gmail.com | Testing / Verification |
   | **Karim Mia** | karim@gmail.com | Testing / Verification |
   | **Sonia Akter** | sonia@gmail.com | Testing / Verification |
   | **Rafiq Islam** | rafiq@gmail.com | Testing / Verification |

6. **Boot the backend API engine:**
   ```bash
   npm run dev
   ```
   The application gateway activates at the port declared in your configuration server file.

---

##  Frontend Setup

1. **Shift workspace and inject node dependencies:**
   Open a separate shell terminal and issue:
   ```bash
   cd Frontend
   npm install
   ```

2. **Map local UI environment configurations:**
   ```bash
   cp .env.local.example .env.local
   ```
   Ensure your API route points directly toward the runtime backend engine:
   ```env
   NEXT_PUBLIC_API_URL="http://localhost:5000/api"
   ```

3. **Launch the client development server:**
   ```bash
   npm run dev
   ```
   Open your browser and navigate directly to: **[http://localhost:3000](http://localhost:3000)**


## Authorization & Access Control
- The architecture implements rigid strict **Resource-Level Authorization**.
- A user cannot read or mutate data parameters unless explicitly linked via **Board Ownership** or **Board Membership**.
- Constraints flow dynamically into underlying child elements including Columns, Tasks, and Member groups.
- All structural boundaries are defended inside backend middleware layer arrays, preventing cross-tenant security failures.

---

## Task Ordering Logic
- Tasks explicitly contain absolute indices mapped onto their host column array coordinates.
- Moving entries triggers transactional updates resolving stable integer positions across columns.
- The UI drag-and-drop actions communicate payload mutations synchronously with the `/move` endpoint to preserve exact user layouts across layout instances.

---

## API Overview

### Authentication

| Method | Endpoint | Action Target |
| :--- | :--- | :--- |
| **POST** | `/auth/register` | Create a new user account profile |
| **POST** | `/auth/login` | Validate profile credentials and return JWT |

### Boards

| Method | Endpoint | Action Target |
| :--- | :--- | :--- |
| **GET** | `/boards` | Index all boards readable by requesting token |