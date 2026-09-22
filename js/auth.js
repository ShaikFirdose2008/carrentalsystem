/* ==========================================================================
   ApexDrive - Authentication & Session Engine (auth.js)
   Handles User vs Admin Authentication, Passcode Checks, and Routing
   ========================================================================== */

const ADMIN_SECRET_KEY = 'ADMIN2026';

window.ApexAuth = {
  getCurrentUser: function () {
    const raw = localStorage.getItem('apexdrive_current_user');
    return raw ? JSON.parse(raw) : null;
  },

  setCurrentUser: function (user) {
    localStorage.setItem('apexdrive_current_user', JSON.stringify(user));
  },

  logout: function () {
    const currentUser = this.getCurrentUser();
    const wasAdmin = currentUser && currentUser.role === 'admin';
    localStorage.removeItem('apexdrive_current_user');
    if (window.showToast) {
      window.showToast('You have been logged out safely.', 'info');
    }
    setTimeout(() => {
      window.location.href = wasAdmin ? 'admin-auth.html' : 'index.html';
    }, 400);
  },

  // Register New User (Customer)
  registerUser: function (name, email, password, phone, city) {
    if (!name || !email || !password) {
      throw new Error('Please fill in all required fields.');
    }
    const existing = ApexDB.getUserByEmail(email);
    if (existing) {
      throw new Error('An account with this email already exists.');
    }

    const newUser = {
      name,
      email: email.trim().toLowerCase(),
      password,
      role: 'user',
      phone: phone || '+91 98765 00000',
      city: city || 'City Center'
    };

    ApexDB.saveUser(newUser);
    this.setCurrentUser(newUser);
    return newUser;
  },

  // Login User
  loginUser: function (email, password) {
    const user = ApexDB.getUserByEmail(email.trim());
    if (!user || user.password !== password) {
      throw new Error('Invalid email address or password.');
    }
    if (user.role !== 'user') {
      throw new Error('This account is registered as Admin. Please use the Admin Portal.');
    }
    this.setCurrentUser(user);
    return user;
  },

  // Register New Admin (Requires Master Admin Secret Key)
  registerAdmin: function (name, email, password, secretKey, department) {
    if (!name || !email || !password || !secretKey) {
      throw new Error('All fields including the Master Security Key are mandatory.');
    }
    if (secretKey.trim() !== ADMIN_SECRET_KEY) {
      throw new Error('Invalid Master Admin Security Key. Authorization failed.');
    }
    const existing = ApexDB.getUserByEmail(email);
    if (existing) {
      throw new Error('An account with this email already exists.');
    }

    const newAdmin = {
      name,
      email: email.trim().toLowerCase(),
      password,
      role: 'admin',
      department: department || 'Fleet Operations',
      city: 'Headquarters'
    };

    ApexDB.saveUser(newAdmin);
    this.setCurrentUser(newAdmin);
    return newAdmin;
  },

  // Login Admin
  loginAdmin: function (email, password) {
    const user = ApexDB.getUserByEmail(email.trim());
    if (!user || user.password !== password) {
      throw new Error('Invalid administrator credentials.');
    }
    if (user.role !== 'admin') {
      throw new Error('Access denied. This account does not possess administrator privileges.');
    }
    this.setCurrentUser(user);
    return user;
  },

  // Guard for protected pages (e.g. admin.html)
  requireRole: function (requiredRole, redirectPage) {
    const user = this.getCurrentUser();
    if (!user || user.role !== requiredRole) {
      window.location.href = redirectPage;
      return false;
    }
    return true;
  },

  // Attach Floating Demo Switcher for easy review presentation
  renderDemoSwitcher: function (currentPage) {
    const existing = document.querySelector('.demo-switcher');
    if (existing) return;

    const switcher = document.createElement('div');
    switcher.className = 'demo-switcher';
    switcher.innerHTML = `
      <span class="demo-switcher-label">⚡ SDC Demo:</span>
      <button class="demo-switcher-btn ${currentPage === 'user' ? 'active' : ''}" id="demo-user-btn">
        🚗 Customer View
      </button>
      <button class="demo-switcher-btn ${currentPage === 'admin' ? 'active' : ''}" id="demo-admin-btn">
        🛡️ Admin Portal
      </button>
      <button class="demo-switcher-btn" id="demo-reset-btn" title="Reset sample database to default state">
        🔄 Reset DB
      </button>
    `;
    document.body.appendChild(switcher);

    document.getElementById('demo-user-btn').addEventListener('click', () => {
      // Auto-login as sample user if not logged in
      const cur = ApexAuth.getCurrentUser();
      if (!cur || cur.role !== 'user') {
        ApexAuth.setCurrentUser(ApexDB.getUserByEmail('demo@apex.com'));
      }
      window.location.href = 'index.html';
    });

    document.getElementById('demo-admin-btn').addEventListener('click', () => {
      // Auto-login as admin for instant viva demo
      const cur = ApexAuth.getCurrentUser();
      if (!cur || cur.role !== 'admin') {
        ApexAuth.setCurrentUser(ApexDB.getUserByEmail('admin@apex.com'));
      }
      window.location.href = 'admin.html';
    });

    document.getElementById('demo-reset-btn').addEventListener('click', () => {
      if (confirm('Reset database to clean default sample cars, users & bookings?')) {
        ApexDB.resetToDefault();
        if (window.showToast) window.showToast('Database reset to defaults!', 'success');
        setTimeout(() => location.reload(), 400);
      }
    });
  }
};
