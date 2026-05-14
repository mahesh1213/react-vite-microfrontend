# Micro Frontend Architecture with Vite & Module Federation

This is a micro frontend monorepo built with **Vite**, **React**, **Redux Toolkit**, and **Module Federation**. It demonstrates how to create a scalable architecture where multiple independent applications share a centralized Redux store.

## 📋 Project Overview

This architecture consists of:

- **Host App** (Port 3000) - Main application that exposes the centralized Redux store
- **Todo App** (Port 3001) - Remote application that consumes the store from the host

## 🏗️ Project Structure

```
micro-frontends-vite/
├── package.json              # Root monorepo config with workspaces
├── host/                     # Host application
│   ├── src/
│   │   ├── store/           # Centralized Redux Store
│   │   │   ├── store.ts     # Redux store configuration
│   │   │   └── todo/
│   │   │       ├── todoSlice.ts      # Redux slice with actions/reducers
│   │   │       └── todoActions.ts    # Exported actions
│   │   ├── App.tsx          # Main host component
│   │   └── main.tsx         # Entry point
│   ├── vite.config.ts       # Vite config with Module Federation
│   └── package.json         # Host dependencies
│
├── todo/                     # Remote Todo application
│   ├── src/
│   │   ├── components/
│   │   │   └── todo.tsx     # Todo component (imports from host store)
│   │   ├── App.tsx          # Main todo component
│   │   └── main.tsx         # Entry point
│   ├── vite.config.ts       # Vite config with Module Federation
│   └── package.json         # Todo dependencies
```

## 🔧 How We Set Up the Micro Frontend Architecture

### Step 1: Create Root Monorepo Configuration

**File:** `package.json`

```json
{
  "name": "micro-frontend-monorepo",
  "workspaces": ["host", "todo"],
  "scripts": {
    "dev": "concurrently \"npm run dev -w host\" \"npm run dev -w todo\"",
    "build:serve": "concurrently \"npm run build -w host && npm run serve -w host\" \"npm run build -w todo && npm run serve -w todo\""
  },
  "devDependencies": {
    "concurrently": "^8.2.2"
  }
}
```

This setup uses **npm workspaces** to manage multiple applications in one repository.

### Step 2: Create Centralized Redux Store in Host App

**File:** `host/src/store/store.ts`

```typescript
import { configureStore } from "@reduxjs/toolkit";
import todoReducer from "./todo/todoSlice";

export const store = configureStore({
  reducer: {
    todo: todoReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

**File:** `host/src/store/todo/todoSlice.ts`

```typescript
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface TodoState {
  items: string[];
}

const initialState: TodoState = { items: [] };

const todoSlice = createSlice({
  name: "todo",
  initialState,
  reducers: {
    addTodo: (state, action: PayloadAction<string>) => {
      state.items.push(action.payload);
    },
    removeTodo: (state, action: PayloadAction<number>) => {
      state.items.splice(action.payload, 1);
    },
  },
});

export const { addTodo, removeTodo } = todoSlice.actions;
export default todoSlice.reducer;
```

**File:** `host/src/store/todo/todoActions.ts`

```typescript
export { addTodo, removeTodo } from "./todoSlice";
```

### Step 3: Configure Module Federation in Host App

**File:** `host/vite.config.ts`

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import federation from "@originjs/vite-plugin-federation";

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: "app", // Host app name
      filename: "remoteEntry.js", // Federation entry file
      exposes: {
        "./store": "./src/store/store.ts", // Expose store
        "./todoActions": "./src/store/todo/todoActions.ts", // Expose actions
      },
      remotes: {
        todoApp: "http://localhost:3001/assets/remoteEntry.js", // Reference todo app
      },
      shared: ["react", "react-dom", "react-redux", "@reduxjs/toolkit"],
    }),
  ],
  build: {
    modulePreload: false,
    target: "esnext",
    minify: false,
    cssCodeSplit: false,
  },
});
```

**Key Points:**

- `exposes`: Modules that the host app shares with remote apps
- `remotes`: Remote apps that the host app consumes
- `shared`: Dependencies shared between apps to avoid duplication

### Step 4: Configure Module Federation in Todo App

**File:** `todo/vite.config.ts`

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import federation from "@originjs/vite-plugin-federation";

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: "todo_app", // Todo app name
      filename: "remoteEntry.js",
      exposes: {
        "./Todo": "./src/components/todo.tsx", // Expose todo component
      },
      remotes: {
        app: "http://localhost:3000/assets/remoteEntry.js", // Reference host app
      },
      shared: ["react", "react-dom", "react-redux", "@reduxjs/toolkit"],
    }),
  ],
  build: {
    modulePreload: false,
    target: "esnext",
    minify: false,
    cssCodeSplit: false,
  },
});
```

### Step 5: Use Centralized Store in Todo App

**File:** `todo/src/components/todo.tsx`

```typescript
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "app/store";          // Import types from host store
import { addTodo } from "app/todoActions";           // Import actions from host store

function Todo() {
  const todos = useSelector((state: RootState) => state.todo.items);
  const dispatch = useDispatch();

  return (
    <>
      <div>Todo app working</div>
      <input
        type="text"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            dispatch(addTodo(e.currentTarget.value));
            e.currentTarget.value = "";
          }
        }}
      />
      <ul>
        {todos.map((t: string, i: number) => (
          <li key={i}>{t}</li>
        ))}
      </ul>
    </>
  );
}

export default Todo;
```

**How It Works:**

- `import type { RootState } from "app/store"` - Gets TypeScript types from host store
- `import { addTodo } from "app/todoActions"` - Gets Redux actions from host store
- Both apps share the same Redux store instance at runtime
- Changes in todo app update the centralized state in the host app

## 🚀 Running the Application

### Development Mode (Hot Reload)

```bash
npm run dev
```

This command:

- Starts the **host app** on `http://localhost:3000` with hot module replacement
- Starts the **todo app** on `http://localhost:3001` with hot module replacement
- Both apps auto-reload on file changes
- **Recommended for active development**

### Production Build & Serve

```bash
npm run build:serve
```

This command:

1. **Builds both applications:**
   - Compiles TypeScript with `tsc -b`
   - Bundles with Vite: `vite build`
   - Generates `dist/` folder with optimized bundles

2. **Serves the built applications:**
   - Host app preview: `http://localhost:3000`
   - Todo app preview: `http://localhost:3001`

**Workflow Step by Step:**

```
npm run build:serve
    ↓
Host App:
    - npm run build (tsc + vite build)
    - npm run serve (vite preview)
    ↓
Todo App:
    - npm run build (tsc + vite build)
    - npm run serve (vite preview)
    ↓
Both apps running and ready on ports 3000 & 3001
```

### Other Commands

```bash
# Build all workspaces
npm run build

# Lint all workspaces
npm run lint

# Install dependencies for all workspaces
npm install:all
```

## 🔄 Data Flow Architecture

```
┌─────────────────────────────────────────┐
│         HOST APP (Port 3000)            │
│                                         │
│  ┌─────────────────────────────────┐  │
│  │   Redux Store (Centralized)     │  │
│  │                                 │  │
│  │  State: {                       │  │
│  │    todo: {                      │  │
│  │      items: ["task1", ...]      │  │
│  │    }                            │  │
│  │  }                              │  │
│  └─────────────────────────────────┘  │
│           ↑                     ↓      │
│  Module Federation Exposes      │      │
│  - ./store                      │      │
│  - ./todoActions                │      │
└────────────┬─────────────────────────┘
             │
   Federation Bridge (Module Federation)
   Shared Dependencies: react-redux, @reduxjs/toolkit
             │
┌────────────▼─────────────────────────┐
│     TODO APP (Port 3001)              │
│                                       │
│  ┌─────────────────────────────────┐ │
│  │  Todo Component                 │ │
│  │                                 │ │
│  │  - useSelector(state.todo)      │ │
│  │  - dispatch(addTodo(text))      │ │
│  │                                 │ │
│  │  Consumes from Host Store       │ │
│  │  via "app/store" & "app/...     │ │
│  │  todoActions"                   │ │
│  └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

## 📦 Key Dependencies

### Runtime Dependencies

- **react** & **react-dom** - UI library
- **react-redux** - Redux bindings for React
- **@reduxjs/toolkit** - Redux state management

### Dev Dependencies

- **vite** - Build tool & dev server
- **@originjs/vite-plugin-federation** - Module Federation support
- **typescript** - Type checking
- **eslint** - Code linting
- **concurrently** - Run multiple commands simultaneously

## ✨ Benefits of This Architecture

1. **Independent Deployment** - Each app can be built and deployed separately
2. **Shared State** - Centralized Redux store prevents state duplication
3. **Code Sharing** - Host app exposes modules for remote apps to use
4. **Scalability** - Easy to add more remote applications
5. **Type Safety** - TypeScript support across federated modules
6. **Development Speed** - Hot module replacement in dev mode
7. **Production Optimization** - Shared dependencies avoid duplication

## 🐛 Troubleshooting

### Module Not Found Error

If you get `Cannot find module 'app/store'`:

1. Ensure both host and todo apps are running on their respective ports
2. Check that `remotes` configuration in vite.config.ts points to correct URLs
3. Verify that `exposes` in host app includes the module you're importing

### Port Already in Use

If ports 3000 or 3001 are busy:

```bash
# Kill process on specific port (Windows)
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Build Issues

```bash
# Clear node_modules and reinstall
npm install:all

# Rebuild
npm run build:serve
```

## 📚 References

- [Vite Documentation](https://vitejs.dev)
- [Vite Plugin Federation](https://github.com/originjs/vite-plugin-federation)
- [Redux Toolkit](https://redux-toolkit.js.org)
- [Module Federation Concepts](https://webpack.js.org/concepts/module-federation/)

---

**Created:** May 2026  
**Architecture:** Micro Frontend with Vite Module Federation  
**State Management:** Redux Toolkit (Centralized Store in Host)

npm install @shared/ui-theme -w todo
npm install @shared/ui-theme -w host

tailwind.config.js each app
npm ls @shared/ui-theme

---

mkdir micro-frontend-monorepo
cd micro-frontend-monorepo
npm create vite@latest host -- --template react-ts
npm create vite@latest todo -- --template react-ts
npm install @originjs/vite-plugin-federation -w host
npm install @originjs/vite-plugin-federation -w todo

npm install

npm query .workspace
