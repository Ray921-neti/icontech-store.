# ICONTECH - Modern E-Commerce & Gadget Repair Management System

ICONTECH is a full-featured, responsive e-commerce web platform and gadget repair tracking system built for **ICONTECH Electronics**, located opposite Adeyemi College of Education, Ondo, Ondo State, Nigeria.

Inspired by the vibrant, high-conversion shopping experience of Jumia and Temu, ICONTECH brings top-tier tech shopping and live gadget repair diagnostics to Nigerian customers.

---

## 🌟 Business Overview

- **Business Name**: ICONTECH
- **Hotline & WhatsApp**: `07039420600` (`+234 703 942 0600`)
- **Showroom & Workshop**: Opposite Adeyemi, Ondo, Ondo State, Nigeria
- **Currency**: Nigerian Naira (₦)
- **Specialties**: 
  - Sales of smartphones (Apple iPhones, Samsung Galaxy, etc.), laptops (MacBooks, HP, Dell), heavy-duty power banks (Romoss, Oraimo), GaN fast chargers, ANC earbuds, phone cases, and 9D ceramic screen protectors.
  - Same-day gadget diagnostic and repair engineering (screen replacement, battery swaps, liquid damage treatment, IC repairs).

---

## 🚀 Key Features

### 🛒 Customer Storefront
1. **Homepage Experience**:
   - Super Flash Sales with live ticking countdown timers and discount badges.
   - High-impact promotional hero banners with quick CTA buttons.
   - 10 Category icon cards: Smartphones, Laptops, Tablets, Chargers, Earpieces, Power Banks, Smartwatches, Phone Cases, Screen Protectors, Other Accessories.
   - Featured Gadgets and Best Sellers in Ondo State.
2. **Product Catalog & Search**:
   - Instant search across product titles, descriptions, categories, and brands.
   - Filter by category, stock availability, and sorting (Featured, Price Low/High, Rating).
3. **Product Modal & Detail View**:
   - High-resolution gallery with thumbnail selector.
   - Price in Nigerian Naira (₦) with savings calculator.
   - Complete technical specifications table.
   - Quantity selector with "Add to Cart" and "Buy Now" triggers.
   - Direct "Chat on WhatsApp" button referencing the exact product.
4. **Persistent Shopping Cart**:
   - Slide-over drawer with instant quantity modification and real-time total updates.
   - Free Ondo State Delivery progress bar (orders over ₦100,000).
5. **Checkout & Payment**:
   - Customer name, phone / WhatsApp number, and address validation.
   - Delivery options: Door delivery in Ondo / nationwide, or In-Store Pickup at Opposite Adeyemi, Ondo.
   - Transparent payment options: Direct Bank Transfer to ICONTECH business account or Cash on Delivery/Pickup (no simulated fake online cards).
   - Generates unique reference e.g. `ICON-ORD-XXXXX` with printable slip and one-click WhatsApp order confirmation.
6. **Dedicated Gadget Repair Booking**:
   - Device type selector (Smartphone, Laptop, Tablet, Smartwatch, Audio/Console).
   - Brand and model input, fault checklist, custom symptom description.
   - Optional photo attachment preview.
   - Immediate generation of unique Repair Reference (`ICON-REP-XXXXX`) and printable drop-off ticket.
7. **Live 7-Stage Repair Tracker**:
   - Tracks devices through: `Received` &rarr; `Diagnosing` &rarr; `Awaiting Customer Approval` &rarr; `Awaiting Parts` &rarr; `Repairing` &rarr; `Ready for Collection` &rarr; `Completed`.
   - Displays technician diagnosis report, quoted repair price in ₦, collection showroom address, and direct WhatsApp technician hotline.
8. **Customer Order Tracker**:
   - Look up purchase orders by Order ID and phone number.
9. **Contact & Location Center**:
   - Store address: Opposite Adeyemi, Ondo.
   - Store hours: Mon–Sat 8:00 AM – 7:00 PM, Sun 12:00 PM – 5:00 PM.
   - Click-to-call `07039420600` and direct WhatsApp chat links.

### 🛡️ Admin Dashboard (Backoffice)
- **Authentication**:
  - Secure Google Sign-In with allowlisted primary admin email (`raydiamond108@gmail.com`).
  - Development access passcode option (`icontech2026`).
- **Dashboard Metrics**:
  - Total Sales Revenue (₦), Total Orders Count, Pending Orders, Catalog Products, Low Stock Alerts, Active Repair Jobs, Completed Repairs.
- **Product Management**:
  - Add, edit, delete products.
  - Multi-image URL support, selling price (₦), original price, stock count, in-stock toggle, flash deal flag, and specifications editor.
- **Order Management**:
  - Filter orders by status (`pending`, `confirmed`, `processing`, `shipped`, `ready_for_pickup`, `delivered`, `cancelled`).
  - Verify and record payment status (`unpaid`, `pending_verification`, `paid`).
  - One-click WhatsApp message generator to customer with order details.
- **Repair Ticket Management**:
  - Search tickets by customer, phone, or repair reference.
  - Advance status across all 8 pipeline stages.
  - Set diagnostic findings and quoted price (₦).
  - One-click "WhatsApp Status Update" sending real-time progress to customer.
- **Customer Directory**:
  - Consolidated customer list showing purchase history and linked repair records.
- **Database Tools**:
  - One-click "Seed Demo Products & Repairs" populates realistic Nigerian tech store items and sample tickets into Cloud Firestore.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Database**: Google Cloud Firestore (provisioned with hardened security rules)
- **Authentication**: Firebase Authentication (Google Auth + Admin Verification)
- **Deployment**: Node.js / Vite build / Cloud Run

---

## 📦 Setup & Installation Instructions

### 1. Prerequisites
- Node.js 18+ or 20+ installed
- Git installed

### 2. Clone Repository
```bash
git clone https://github.com/your-username/icontech-gadgets.git
cd icontech-gadgets
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Firebase Configuration
The app uses `firebase-applet-config.json` for Firebase credentials. Ensure this file is in the project root:
```json
{
  "projectId": "YOUR_FIREBASE_PROJECT_ID",
  "appId": "YOUR_APP_ID",
  "apiKey": "YOUR_API_KEY",
  "authDomain": "YOUR_PROJECT.firebaseapp.com",
  "firestoreDatabaseId": "YOUR_DATABASE_ID",
  "storageBucket": "YOUR_STORAGE_BUCKET"
}
```

### 5. Running Locally
Start the development server:
```bash
npm run dev
```
Open your browser at `http://localhost:3000`.

### 6. Building for Production
```bash
npm run build
```
The optimized bundle will be compiled into `/dist`.

---

## 🖼️ GitHub Image Preservation & Git Push Guidelines

To ensure that **GitHub never removes or corrupts any images** when you push:

1. **Binary Asset Integrity (`.gitattributes`)**:
   - The repository includes a `.gitattributes` file explicitly declaring `*.png`, `*.jpg`, `*.jpeg`, `*.webp`, `*.ico`, and `*.gif` as `binary`. This prevents Git from normalizing line endings or stripping image data during commits.

2. **Git Tracking Protection (`.gitignore`)**:
   - `.gitignore` explicitly whitelists `/public/`, `/public/**`, and all image extensions (`!*.png`, `!*.jpg`, `!*.svg`, etc.) so Git never ignores your assets.

3. **Self-Contained Image Assets (`/public/images/`)**:
   - The official SVG brand logo and all 10 category vector illustrations are stored inside `/public/images/`. These files are tracked directly inside your GitHub repository.

4. **Product & Repair Image Uploads**:
   - Images uploaded via the Admin Dashboard or Customer Repair forms are converted to base64 Data URIs and stored directly in your Cloud Firestore database, ensuring they persist across deployments and device switches.

### Pushing to GitHub (Step-by-step)
```bash
# 1. Initialize git (if not already done)
git init

# 2. Stage all files (all images in /public are included)
git add .

# 3. Verify images are staged
git status

# 4. Commit all project code and assets
git commit -m "feat: complete ICONTECH e-commerce and gadget repair tracking system"

# 5. Link to your GitHub repository
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY_NAME.git
git branch -M main

# 6. Push to GitHub
git push -u origin main
```


---

## 🔒 Security & Firestore Rules

Security rules are defined in `firestore.rules`:
- Products are publicly readable, while mutations require verified administrator authorization.
- Orders can be created with initial status `pending` and `unpaid`/`pending_verification`. Order status transitions and payment confirmations are locked to administrators.
- Repairs can be created with initial status `Received`. Only administrators can update quotes, diagnosis notes, and advance repair stages.
- Default deny on all unspecified paths.

---

## 📱 Contact & Inquiries

**ICONTECH Electronics & Repair Hub**  
Opposite Adeyemi, Ondo, Ondo State, Nigeria  
Phone / WhatsApp: **07039420600**
