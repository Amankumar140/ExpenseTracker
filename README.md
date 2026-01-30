# ExpenseTrack — AI-Powered Expense Management

A full-stack MERN application with integrated **ML microservice** that uses OCR to process receipt images, extract expense data, auto-categorize transactions using both AI/ML and keyword-based rules, and provide analytics with interactive charts.

## ✨ Features

- 📸 **Smart Receipt Upload** — Drag-and-drop with animated multi-step progress (Upload → OCR → Categorize)
- 🔍 **OCR Processing** — Automatic text extraction using Tesseract.js with confidence scoring
- 🤖 **ML Categorization** — Python-based ML microservice (scikit-learn) with keyword fallback
- 🏷️ **Auto-Categorization** — 12 smart categories with dual-source confidence tracking
- ✏️ **CRUD Operations** — Create, read, update, and delete expenses with inline editing
- 📊 **Visual Analytics** — Donut charts, gradient bar charts, category breakdowns, year filtering
- 📈 **Confidence Scoring** — Visual progress bars showing extraction and categorization confidence
- 📥 **CSV Export** — Export all expenses to CSV with year filtering
- 🔐 **Auth System** — JWT-based authentication with protected routes
- 🌙 **Dark Mode** — Full dark/light theme with smooth transitions
- 🎨 **Premium UI** — Glassmorphism, gradient accents, stagger animations, responsive mobile layouts

## 🛠️ Tech Stack

### Backend (Node.js)
| Technology | Purpose |
|-----------|---------|
| **Express.js** | REST API server |
| **MongoDB + Mongoose** | Database & ODM |
| **Tesseract.js** | OCR engine |
| **JWT + bcrypt** | Authentication |
| **Multer** | File upload handling |
| **json2csv** | CSV export |
| **Axios** | ML service communication |

### ML Microservice (Python)
| Technology | Purpose |
|-----------|---------|
| **Flask** | API server |
| **scikit-learn** | ML classification |
| **TF-IDF Vectorizer** | Text feature extraction |

### Frontend (React)
| Technology | Purpose |
|-----------|---------|
| **React 19** | UI library |
| **Vite** | Build tool & dev server |
| **Tailwind CSS v4** | Styling |
| **Recharts** | Charts & visualizations |
| **Axios** | HTTP client |
| **React Router v7** | Routing |

## 📁 Project Structure

```
ExpenseTracker/
├── backend/
│   ├── config/
│   │   └── database.js              # MongoDB connection
│   ├── middleware/
│   │   ├── auth.js                  # JWT authentication middleware
│   │   └── upload.js                # Multer configuration
│   ├── models/
│   │   ├── Expense.js               # Expense schema (with ML fields)
│   │   └── User.js                  # User schema
│   ├── routes/
│   │   ├── authRoutes.js            # Auth endpoints
│   │   └── expenseRoutes.js         # Expense CRUD + analytics + export
│   ├── services/
│   │   ├── ocrService.js            # OCR & parsing logic
│   │   ├── categorizationService.js # Keyword-based categorization
│   │   └── mlService.js             # ML microservice client
│   ├── server.js                    # Express server entry point
│   └── package.json
├── ml-service/
│   ├── app.py                       # Flask API server
│   ├── train.py                     # Model training script
│   ├── predict.py                   # Prediction logic
│   ├── model/                       # Trained model artifacts
│   ├── requirements.txt             # Python dependencies
│   └── Dockerfile                   # Container configuration
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Analytics.jsx        # Donut/bar charts, stat cards
│   │   │   ├── ExpenseTable.jsx     # Sortable table with category badges
│   │   │   ├── UploadReceipt.jsx    # Multi-step upload with progress
│   │   │   ├── Navbar.jsx           # Glassmorphism authenticated navbar
│   │   │   ├── PublicNavbar.jsx     # Public pages navbar
│   │   │   └── DarkModeToggle.jsx   # Theme toggle
│   │   ├── pages/
│   │   │   ├── Home.jsx             # Landing page with feature cards
│   │   │   ├── Dashboard.jsx        # Main dashboard with tabs
│   │   │   ├── Login.jsx            # Auth with floating orbs
│   │   │   ├── Signup.jsx           # Registration + password strength
│   │   │   ├── About.jsx            # About page
│   │   │   └── Contact.jsx          # Contact form
│   │   ├── context/
│   │   │   ├── AuthContext.jsx      # Authentication state
│   │   │   └── ThemeContext.jsx      # Dark/light theme state
│   │   ├── services/
│   │   │   └── api.js               # API service layer
│   │   ├── App.jsx
│   │   ├── index.css                # Design system & animations
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- Python 3.8+ (for ML service)
- MongoDB (local or Atlas)

### 1. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm run dev
```

### 2. ML Microservice Setup

```bash
cd ml-service
python -m venv venv
venv\Scripts\activate       # Windows
# source venv/bin/activate  # macOS/Linux
pip install -r requirements.txt
python train.py             # Train the model
python app.py               # Start Flask server (port 5001)
```

### 3. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
# Edit .env: VITE_API_URL=http://localhost:5000/api
npm run dev
```

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/signin` | Login user |

### Expenses
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/expenses/upload` | Upload & process receipt |
| GET | `/api/expenses` | List all expenses (with filters) |
| GET | `/api/expenses/:id` | Get single expense |
| PUT | `/api/expenses/:id` | Update expense |
| DELETE | `/api/expenses/:id` | Delete expense |
| GET | `/api/expenses/dashboard/stats` | Dashboard quick stats |
| GET | `/api/expenses/analytics/summary` | Analytics data |
| GET | `/api/expenses/export/csv` | Export as CSV |

### ML Service
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/predict` | Predict expense category |
| GET | `/health` | Service health check |

## 📂 Categories

The system auto-categorizes expenses into 12 categories:

`Food & Dining` · `Groceries` · `Transportation` · `Shopping` · `Entertainment` · `Healthcare` · `Utilities` · `Travel` · `Education` · `Personal Care` · `Insurance` · `Other`

## 🏗️ Architecture

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│   React UI  │────▶│  Express API │────▶│   MongoDB    │
│  (Vite)     │     │  (Node.js)   │     │              │
└─────────────┘     └──────┬───────┘     └──────────────┘
                           │
                    ┌──────▼───────┐
                    │ ML Service   │
                    │ (Flask/sklearn)│
                    └──────────────┘
```

## 📄 License

This project is open source and available under the MIT License.
