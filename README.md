<div align="center">

# 🧸 Artemon Joy Marketplace

### *Where Premium Toys Meet Modern E-Commerce*

<img src="https://img.shields.io/badge/React-18.0-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React" />
<img src="https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
<img src="https://img.shields.io/badge/SQLite-3-003B57?style=for-the-badge&logo=sqlite&logoColor=white" alt="SQLite" />
<img src="https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind" />
<img src="https://img.shields.io/badge/Express-4.x-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />

**A full-stack e-commerce platform for premium educational toys**  
*Built with modern web technologies • Single developer passion project*

[✨ Features](#-features) • [🚀 Quick Start](#-quick-start) • [📖 Documentation](#-project-structure) • [🗺️ Roadmap](#️-roadmap)

---

</div>

## 🎯 About The Project

**Artemon Joy** is a modern, feature-rich e-commerce platform designed from the ground up for selling premium, educational, and fun toys. Built as a single-developer project, it showcases clean architecture, responsive design, and a seamless user experience.

### Why Artemon Joy?

- 🎨 **Modern UI/UX** - Clean, intuitive interface built with Tailwind CSS
- 🔐 **Secure Authentication** - Complete user management system with persistent sessions
- 📱 **Mobile First** - Fully responsive design that works on any device
- ⚡ **Lightning Fast** - Optimized performance with Vite and SQLite
- 🛠️ **Developer Friendly** - Easy setup, clear code structure, comprehensive documentation

---

## ✨ Features

### 🛒 Storefront Experience

<table>
<tr>
<td width="50%">

#### 🏠 **Home Page**
- Eye-catching hero banner
- Quick category navigation
- Trending products showcase
- Smooth animations & transitions

</td>
<td width="50%">

#### 📦 **Product Catalog**
- Browse full toy collection
- Filter by categories
- Search functionality
- Sort by price, popularity, etc.

</td>
</tr>
<tr>
<td width="50%">

#### 🔍 **Product Details**
- High-quality product images
- Detailed descriptions
- Real-time stock status
- Customer reviews (coming soon)

</td>
<td width="50%">

#### 📱 **Responsive Design**
- Mobile-optimized layouts
- Touch-friendly interactions
- Fast load times
- Cross-browser compatible

</td>
</tr>
</table>

### 🔐 Authentication & User Management

- ✅ Full registration & login flow
- ✅ Persistent sessions across page reloads
- ✅ Secure password handling
- ✅ Session management with LocalStorage
- ✅ User profile data storage

### ⚙️ Backend & Database

- 🗄️ **SQLite Database** - Zero-config, file-based database
- 🚀 **Express API** - RESTful endpoints for all operations
- 📊 **WAL Mode** - Optimized for Windows with better concurrency
- 🌱 **Auto Seeding** - Automatic dummy data population
- 🔄 **API Versioning** - Clean, maintainable API structure

---

## 🚀 Quick Start

### Prerequisites

```bash
node --version  # v18.0.0 or higher required
npm --version   # v9.0.0 or higher recommended
```

### Installation

```bash
# 1️⃣ Clone the repository
git clone https://github.com/AquaaX/artemon-joy.git
cd artemon-joy

# 2️⃣ Install dependencies
npm install

# 3️⃣ Start the application
npm run dev
```

### 🎉 That's it!

- **Frontend**: Open [http://localhost:5173](http://localhost:5173) in your browser
- **Backend**: Running at [http://localhost:3000](http://localhost:3000)
- **Database**: Auto-created at `server/artemon.db`

---

## 📖 Project Structure

```
artemon-joy/
│
├── 📁 public/                    # Static assets
│   ├── banner.jpg               # Hero banner image
│   └── vite.svg                 # Application logo
│
├── 📁 server/                    # Backend application
│   ├── artemon.db               # SQLite database (auto-generated)
│   ├── db.js                    # Database connection & schema
│   └── index.js                 # Express API routes
│
├── 📁 src/                       # Frontend application
│   ├── 📁 components/           # Reusable UI components
│   │   ├── layout/              # Navbar, Footer, Layout
│   │   └── product/             # ProductCard, ProductList, ProductGrid
│   │
│   ├── 📁 context/              # React Context (Global State)
│   │   └── AuthContext.jsx     # Authentication state management
│   │
│   ├── 📁 pages/                # Page components
│   │   ├── auth/                # Login, Register pages
│   │   └── shop/                # Home, Shop, ProductDetail
│   │
│   ├── App.jsx                  # Main router configuration
│   ├── main.jsx                 # Application entry point
│   └── index.css                # Global styles
│
├── package.json                 # Dependencies & scripts
├── vite.config.js               # Vite configuration
├── tailwind.config.js           # Tailwind CSS configuration
└── README.md                    # You are here! 📍
```

---

## 🛠️ Tech Stack

<div align="center">

### Frontend
![React](https://img.shields.io/badge/React-18.0-61DAFB?style=flat-square&logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?style=flat-square&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)
![Lucide React](https://img.shields.io/badge/Lucide_React-Icons-F56565?style=flat-square)

### Backend
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.x-000000?style=flat-square&logo=express&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-3-003B57?style=flat-square&logo=sqlite&logoColor=white)

### Development Tools
![Concurrently](https://img.shields.io/badge/Concurrently-8.0-E10098?style=flat-square)
![ESLint](https://img.shields.io/badge/ESLint-Enabled-4B32C3?style=flat-square&logo=eslint&logoColor=white)

</div>

---

## 🗺️ Roadmap

### 🔜 Coming Soon

- [ ] 🛒 **Shopping Cart** - Add/remove items, quantity management
- [ ] 💳 **Checkout Flow** - Address entry, payment integration
- [ ] 📜 **Order History** - View and track past purchases
- [ ] ⭐ **Product Reviews** - Customer ratings and feedback
- [ ] 🔍 **Advanced Search** - Filters, price ranges, sorting options

### 🚧 In Progress

- [ ] 👨‍💼 **Admin Dashboard** - Inventory management, sales analytics
- [ ] 📧 **Email Notifications** - Order confirmations, updates
- [ ] 🎁 **Wishlist Feature** - Save favorite items for later

### 💡 Future Ideas

- [ ] 🤖 **AI Recommendations** - Personalized product suggestions
- [ ] 🌐 **Multi-language Support** - Internationalization
- [ ] 📊 **Analytics Dashboard** - Sales metrics, user behavior
- [ ] 🎨 **Theme Customization** - Dark mode, color schemes
- [ ] 🔔 **Push Notifications** - Real-time order updates

---

## 🔧 Development

### Available Scripts

```bash
# Start development servers (frontend + backend)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

### Database Management

```bash
# Reset database (delete and regenerate)
# 1. Stop the server (Ctrl + C)
# 2. Delete database files
rm server/artemon.db server/artemon.db-shm server/artemon.db-wal

# 3. Restart the server
npm run dev
```

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

---

## 👨‍💻 Author

**AquaaX**

- GitHub: [@AquaaX](https://github.com/AquaaX)
- Project Link: [https://github.com/AquaaX/artemon-joy](https://github.com/AquaaX/artemon-joy)

---

<div align="center">

### ⭐ Star this repo if you find it helpful!

**Built with ❤️ and lots of ☕**

*Making toy shopping delightful, one line of code at a time*

</div>
