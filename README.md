# FitGear – Online Gym Product Selling Website
BCA Minor Project (BCA-507) · Abhishek Chaudhary · Stack: HTML, CSS, JavaScript, PHP, MySQL, Apache (XAMPP)

## Folder structure
```
FitGear/
├── frontend/            (what the user sees)
│   ├── index.html
│   ├── css/style.css
│   ├── js/app.js        (calls the backend with fetch)
│   └── images/          (product pictures)
├── backend/             (PHP API – JSON)
│   ├── config.php       (DB settings + helpers)
│   ├── auth.php         (register / login / logout)
│   ├── products.php     (catalogue, search, categories)
│   ├── cart.php         (add / update / remove)
│   ├── orders.php       (checkout + payment record + order history)
│   └── admin.php        (dashboard, stock, products, order status)
└── database/fitgear.sql (tables + sample products + admin user)
```
## Quick run (no setup)
Open `frontend/index.html` directly in a browser. The app automatically uses a local demo API when PHP/MySQL is unavailable. Products, accounts, cart, orders, and admin changes are saved only in that browser's local storage; this is for demonstration and is not secure for real customer data or payments. Demo admin: `admin@fitgear.com` / `admin123`.

## GitHub Pages demo
The GitHub Actions workflow deploys the static frontend from `frontend/` when changes are pushed to `main`. The demo site is served at `https://aryan7898d.github.io/fitgear/` after the Pages deployment completes. GitHub Pages does not run PHP or MySQL, so this hosted version uses browser-local demo data; use the XAMPP setup below for the full backend.

## How to run with the PHP/MySQL backend (XAMPP)
1. Copy the `FitGear` folder into `C:\xampp\htdocs\`.
2. Start **Apache** and **MySQL** in the XAMPP Control Panel.
3. If MySQL uses a password, add the Apache environment variables `FITGEAR_DB_HOST`, `FITGEAR_DB_NAME`, `FITGEAR_DB_USER`, and `FITGEAR_DB_PASSWORD` in Windows Environment Variables before starting XAMPP. Defaults are `localhost`, `fitgear`, `root`, and an empty password. Restart the XAMPP Control Panel and Apache after changing them; do not put the password in source code.
4. Open http://localhost/phpmyadmin → Import → choose `database/fitgear.sql` → Go.
5. Open **http://localhost/FitGear/frontend/** in the browser (do not open `index.html` directly).
6. Admin login: `admin@fitgear.com` / `admin123`. Register a new account for a customer.

For a non-XAMPP Apache/PHP installation, point the web server document root to the `FitGear` folder and set the same database environment variables in its Apache configuration. The SQL import recreates the project tables and sample data.

## Notes
- Passwords are hashed (`password_hash`), all SQL uses prepared statements, checkout uses a DB transaction.
- Payment is a **sandbox simulation** in `orders.php`; replace that block with the Razorpay/Instamojo verification for real payments.
