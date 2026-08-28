FRONTEND-BACKEND WIRING - FILES TO COPY INTO YOUR PROJECT
============================================================

Unzip this into your project ROOT (FInd-cert-app/), overwriting when prompted.
It will place files at:

  NEW FILES:
    src/api/backend.js
    src/context/AuthContext.jsx
    src/pages/Login.jsx
    src/pages/Signup.jsx
    src/pages/Auth.css

  MODIFIED FILES (these will overwrite your current versions):
    src/App.jsx                  - added AuthProvider + /login /signup routes
    src/context/CollectionsContext.jsx - now talks to real backend API
    src/components/Navbar.jsx    - shows login state
    src/components/Navbar.css    - styles for new navbar elements
    src/components/ListMenu.jsx  - requires login before saving, awaits backend calls
    .env.example                 - added VITE_API_BASE_URL

AFTER UNZIPPING:
1. Create/update your .env file (not .env.example) with:
     VITE_API_BASE_URL=http://localhost:5555   (for local dev)

2. On Vercel: add environment variable
     VITE_API_BASE_URL = https://find-cert-app-1.onrender.com
   then redeploy.

3. Commit and push:
     git add .
     git commit -m "Wire frontend to Flask backend (auth + collections)"
     git push

4. IMPORTANT: your Postgres tables aren't created yet. Signup/login will
   fail with a DB error until migrations run. Run this from your local
   machine (backend/ folder), using the EXTERNAL Database URL from Render:

     export DATABASE_URL="<external-url-from-render>"
     export FLASK_APP=run.py
     flask db upgrade
