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

### 👤 Customer Authentication & Account Hub
1. **Registration (Create Account)**:
   - Full Name, Nigerian Phone Number (`+234` format or local `070...`, `080...`, `081...`, `090...`, `091...`), password with confirmation.
   - Comprehensive input validation and Nigerian phone format normalization.
2. **Customer Sign In**:
   - Log in using Phone Number and Password.
   - Show / Hide password toggles.
   - Real-time error messages (invalid credentials, network issues).
   - Session persistence via Firebase Authentication state listeners.
3. **Customer Account Dashboard (`My Account`)**:
   - View customer name, verified phone number, joined date, and email.
   - Update customer profile details (Full Name, Delivery Address, Contact Email).
   - View customer's personal order history with order items, totals, delivery status, and tracking links.
   - View customer's device repair tickets with live 8-stage repair pipeline status and technician diagnosis notes.
   - Safe Customer Sign Out returning customer to the public storefront.
4. **Seamless Storefront Integration**:
   - Header shows "Sign In" and "Create Account" when logged out.
   - Displays "Hi, [Customer Name]", "My Account", and "Sign Out" when logged in.
   - Auto-fills customer name, phone number, and address during Checkout and Repair booking.
   - Binds `customerUid` to orders and repairs so history automatically syncs to their account.

### 🛡️ Admin Dashboard (Backoffice)
- **Authentication**:
   - Secure Google Sign-In with allowlisted primary admin email (`raydiamond108@gmail.com`).
   - Development access passcode option (`icontech2026`).
   - Admin authentication is strictly isolated from customer accounts.
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

### 4. Firebase Configuration & Authentication Setup

#### A. Firebase Console Setup (Required for Customer Sign In & Registration)
1. Go to your **[Firebase Console](https://console.firebase.google.com/)** and select your project.
2. In the left navigation, click on **Build** > **Authentication**.
3. Under the **Sign-in method** tab:
   - Click **Email/Password**.
   - Enable **Email/Password** (Email link / passwordless is not needed).
   - Click **Save**.
   *(Note: ICONTECH maps normalized Nigerian phone numbers to secure customer auth identifiers behind the scenes, utilizing Firebase's high-security credential hashing and session engine without requiring third-party SMS gateway fees).*
4. Under **Firestore Database**, ensure your security rules match `firestore.rules`.

#### B. Environment Configuration & Google AI Studio Variables
The application reads configuration with automatic fallback:
1. First, it looks for `import.meta.env.VITE_FIREBASE_*` variables.
2. If those are not set, it automatically reuses the registered configuration in `firebase-applet-config.json`.

If you configure environment variables in Google AI Studio or your deployment hosting provider (Vercel, Netlify, Cloud Run), copy these exact values:

| Variable Name | Exact Value | Source in Firebase Console |
| :--- | :--- | :--- |
| `VITE_FIREBASE_PROJECT_ID` | `gen-lang-client-0571688528` | Project Settings > General > Project ID |
| `VITE_FIREBASE_APP_ID` | `1:21438484231:web:d37a8279d0d2a861b43fa2` | Project Settings > Your apps > Web app > App ID |
| `VITE_FIREBASE_API_KEY` | `AIzaSyDfTMIPNgTq4J4pbY02uvOWodT33EZ7Nnw` | Project Settings > General > Web API Key |
| `VITE_FIREBASE_AUTH_DOMAIN` | `gen-lang-client-0571688528.firebaseapp.com` | Project Settings > Your apps > authDomain |
| `VITE_FIREBASE_STORAGE_BUCKET` | `gen-lang-client-0571688528.firebasestorage.app` | Project Settings > Your apps > storageBucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `21438484231` | Project Settings > Cloud Messaging > Sender ID |
| `VITE_FIREBASE_DATABASE_ID` | `ai-studio-icontechgadgetsr-7ac8c481-d749-444d-ac81-485a390611a3` | Cloud Firestore > Databases > Database ID |

*(Note: Always use `ai-studio-icontechgadgetsr-7ac8c481-d749-444d-ac81-485a390611a3` as the database ID, not `(default)`).*

### 5. Running Automated Verification Tests
You can run the end-to-end verification test suite anytime to test phone normalization, admin privilege isolation, customer privacy scoping, and configuration integrity:
```bash
npx tsx src/tests/authAndPrivacy.test.ts
```

### 6. Running Locally
Start the development server:
```bash
npm run dev
```
Open your browser at `http://localhost:3000`.

### 7. Building for Production
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
