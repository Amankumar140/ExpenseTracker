# Expense Auto-Categorizer

A full-stack MERN application that uses OCR to automatically process receipt images, extract expense data, categorize transactions using keyword-based rules, and provide analytics with interactive charts.

## Features

- 📸 **Receipt Upload**: Drag-and-drop or click to upload receipt images
- 🔍 **OCR Processing**: Automatic text extraction using Tesseract.js
- 🏷️ **Auto-Categorization**: Smart keyword-based expense categorization
- ✏️ **CRUD Operations**: Create, read, update, and delete expenses
- 📊 **Analytics Dashboard**: Interactive charts with Recharts (pie charts, bar charts)
- 📈 **Confidence Scoring**: Shows extraction and categorization confidence levels
- 📥 **CSV Export**: Export all expenses to CSV format
- 🎨 **Modern UI**: Responsive design with Tailwind CSS

## Tech Stack

### Backend
- **Node.js** & **Express**: Server and API
- **MongoDB** & **Mongoose**: Database and ODM
- **Tesseract.js**: OCR engine
- **Multer**: File upload handling
- **json2csv**: CSV export functionality

### Frontend
- **React**: UI library
- **Vite**: Build tool and dev server
- **Axios**: HTTP client
- **Recharts**: Chart library
- **Tailwind CSS**: Styling

## Project Structure

```
expenseTracker/
├── backend/
│   ├── config/
│   │   └── database.js          # MongoDB connection
│   ├── middleware/
│   │   └── upload.js             # Multer configuration
│   ├── models/
│   │   └── Expense.js            # Mongoose schema
│   ├── routes/
│   │   └── expenseRoutes.js      # API routes
│   ├── services/
│   │   ├── ocrService.js         # OCR & parsing logic
│   │   └── categorizationService.js  # Auto-categorization
│   ├── uploads/                  # Uploaded receipt images
│   ├── .env.example              # Environment variables template
│   ├── package.json
│   ├── render.yaml               # Render deployment config
│   └── server.js                 # Express server
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Analytics.jsx     # Analytics dashboard
│   │   │   ├── ExpenseTable.jsx  # Expense list with edit/delete
│   │   │   └── UploadReceipt.jsx # File upload component
│   │   ├── services/
│   │   │   └── api.js            # API service layer
│   │   ├── App.jsx               # Main app component
│   │   ├── index.css             # Tailwind imports
│   │   └── main.jsx
│   ├── .env.example              # Frontend env template
│   ├── package.json
│   ├── tailwind.config.js
│   ├── vercel.json               # Vercel deployment config
│   └── vite.config.js
└── README.md
```

## Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

4. Update the `.env` file with your MongoDB connection string:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/expense-categorizer
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

5. Start the backend server:
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

4. Update the `.env` file:
```env
VITE_API_URL=http://localhost:5000/api
```

5. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## API Documentation

### Endpoints

#### Upload Receipt
```
POST /api/expenses/upload
Content-Type: multipart/form-data

Body: { receipt: <image file> }

Response: {
  message: "Receipt processed successfully",
  expense: { ... }
}
```

#### Get All Expenses
```
GET /api/expenses
Query params: ?category=<category>&minAmount=<min>&maxAmount=<max>

Response: {
  count: <number>,
  expenses: [ ... ]
}
```

#### Get Single Expense
```
GET /api/expenses/:id

Response: { expense object }
```

#### Update Expense
```
PUT /api/expenses/:id
Content-Type: application/json

Body: {
  merchant: "...",
  date: "...",
  total: 123.45,
  tax: 10.00,
  category: "...",
  notes: "..."
}

Response: {
  message: "Expense updated successfully",
  expense: { ... }
}
```

#### Delete Expense
```
DELETE /api/expenses/:id

Response: {
  message: "Expense deleted successfully"
}
```

#### Get Analytics
```
GET /api/expenses/analytics/summary

Response: {
  categoryBreakdown: { ... },
  monthlySpending: { ... },
  stats: { ... }
}
```

#### Export CSV
```
GET /api/expenses/export/csv

Response: CSV file download
```

## Categories

The system auto-categorizes expenses into:
- Food & Dining
- Groceries
- Transportation
- Shopping
- Entertainment
- Healthcare
- Utilities
- Travel
- Education
- Personal Care
- Insurance
- Other

## Deployment

### Backend (Render)

1. Push your code to GitHub
2. Create a new Web Service on Render
3. Connect your repository
4. Set environment variables in Render dashboard
5. Deploy

### Frontend (Vercel)

1. Push your code to GitHub
2. Import project to Vercel
3. Set `VITE_API_URL` environment variable
4. Deploy

## Development

### Running Tests
```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test
```

### Building for Production
```bash
# Frontend
cd frontend
npm run build
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is open source and available under the MIT License.

## Acknowledgments

- Tesseract.js for OCR functionality
- Recharts for beautiful charts
- Tailwind CSS for styling
- The MERN stack community

## Support

For issues, questions, or contributions, please open an issue on GitHub.
