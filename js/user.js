/* ==========================================================================
   ApexDrive - User Module Controller (user.js)
   Catalog Search/Filters, Interactive Booking Calculator, Checkout & Invoicing
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Ensure DB & Auth exist
  if (!window.ApexDB || !window.ApexAuth) return;

  // Initialize Demo Switcher
  ApexAuth.renderDemoSwitcher('user');

  // State
  let allCars = ApexDB.getCars();
  let currentCategory = 'all';
  let searchQuery = '';
  let maxPrice = 20000;
  let transmissionFilter = 'all';
  let sortBy = 'popular';
  
  let selectedCarForBooking = null;
  let activeBookingData = null;

  // DOM Elements
  const carGrid = document.getElementById('car-grid');
  const searchInput = document.getElementById('search-input');
  const heroSearchInput = document.getElementById('hero-search-input');
  const sortSelect = document.getElementById('sort-select');
  const categoryPills = document.querySelectorAll('.category-pill');
  const priceFilterVal = document.getElementById('price-val');
  const priceSlider = document.getElementById('price-slider');
  const navUserSection = document.getElementById('nav-user-section');
  const bookingsBadge = document.getElementById('bookings-badge');
  const emptyState = document.getElementById('empty-catalog');

  // Modals
  const carDetailsModal = document.getElementById('car-details-modal');
  const checkoutModal = document.getElementById('checkout-modal');
  const voucherModal = document.getElementById('voucher-modal');
  const myBookingsModal = document.getElementById('my-bookings-modal');

  // ------------------------------------------------------------------------
  // Navbar User Session State
  // ------------------------------------------------------------------------
  function updateNavUserState() {
    const user = ApexAuth.getCurrentUser();
    if (!navUserSection) return;

    if (user && user.role === 'user') {
      const userBookings = ApexDB.getUserBookings(user.email);
      const activeCount = userBookings.filter(b => b.status === 'Active').length;

      if (bookingsBadge) {
        bookingsBadge.textContent = activeCount;
        bookingsBadge.style.display = activeCount > 0 ? 'flex' : 'none';
      }

      navUserSection.innerHTML = `
        <div class="user-profile-badge" id="open-profile-menu" title="${user.name} (${user.email})">
          <div class="avatar-circle">${user.name.charAt(0).toUpperCase()}</div>
          <span class="user-name-text">${user.name}</span>
        </div>
        <button class="btn btn-secondary btn-sm" id="nav-logout-btn" title="Sign Out">
          🚪 Logout
        </button>
      `;

      document.getElementById('nav-logout-btn').addEventListener('click', () => {
        ApexAuth.logout();
      });
    } else {
      if (bookingsBadge) bookingsBadge.style.display = 'none';
      navUserSection.innerHTML = `
        <a href="user-auth.html" class="btn btn-secondary btn-sm">Sign In</a>
        <a href="user-auth.html" class="btn btn-primary btn-sm">Get Started</a>
      `;
    }
  }

  // ------------------------------------------------------------------------
  // Car Catalog Filtering & Rendering
  // ------------------------------------------------------------------------
  function filterAndRenderCars() {
    allCars = ApexDB.getCars();
    let filtered = allCars.filter(car => {
      // Category filter
      if (currentCategory !== 'all' && car.category.toLowerCase() !== currentCategory.toLowerCase()) {
        return false;
      }
      // Price filter
      if (car.pricePerDay > maxPrice) {
        return false;
      }
      // Transmission filter
      if (transmissionFilter !== 'all' && car.transmission.toLowerCase() !== transmissionFilter.toLowerCase()) {
        return false;
      }
      // Text search
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const matchesName = car.name.toLowerCase().includes(query);
        const matchesBrand = car.brand.toLowerCase().includes(query);
        const matchesCategory = car.category.toLowerCase().includes(query);
        if (!matchesName && !matchesBrand && !matchesCategory) return false;
      }
      return true;
    });

    // Sorting
    if (sortBy === 'price-low') {
      filtered.sort((a, b) => a.pricePerDay - b.pricePerDay);
    } else if (sortBy === 'price-high') {
      filtered.sort((a, b) => b.pricePerDay - a.pricePerDay);
    } else if (sortBy === 'rating') {
      filtered.sort((a, b) => b.rating - a.rating);
    }

    renderGrid(filtered);
  }

  function renderGrid(cars) {
    if (!carGrid) return;
    carGrid.innerHTML = '';

    if (cars.length === 0) {
      if (emptyState) emptyState.style.display = 'block';
      return;
    }
    if (emptyState) emptyState.style.display = 'none';

    cars.forEach(car => {
      const card = document.createElement('div');
      card.className = 'car-card';

      // Status Badge
      let badgeClass = 'badge-available';
      if (car.status === 'Rented') badgeClass = 'badge-rented';
      if (car.status === 'Maintenance') badgeClass = 'badge-maintenance';

      // Category Badge
      let catBadgeClass = `badge-${car.category.toLowerCase()}`;

      const isAvailable = car.status === 'Available';

      card.innerHTML = `
        <div class="car-card-media">
          <img src="${car.image}" alt="${car.name}" class="car-card-image" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1541348263662-e0c82661ac74?auto=format&fit=crop&w=900&q=80'">
          <div class="car-badge-overlay">
            <span class="badge ${badgeClass}">${car.status}</span>
          </div>
          <div class="car-category-overlay">
            <span class="badge ${catBadgeClass}">${car.category}</span>
          </div>
        </div>

        <div class="car-card-content">
          <div class="car-card-header">
            <div>
              <p style="font-size: 0.75rem; color: #64748b; font-weight: 700; text-transform: uppercase;">${car.brand}</p>
              <h3 class="car-model-name">${car.name}</h3>
            </div>
            <div class="car-rating-pill">
              ⭐ ${car.rating} (${car.reviewsCount})
            </div>
          </div>

          <div class="car-specs-grid">
            <div class="spec-cell">
              <span class="icon">⚙️</span>
              <span>${car.transmission}</span>
            </div>
            <div class="spec-cell">
              <span class="icon">👥</span>
              <span>${car.seats} Seats</span>
            </div>
            <div class="spec-cell">
              <span class="icon">⚡</span>
              <span>${car.fuelType}</span>
            </div>
          </div>

          <div class="car-card-footer">
            <div class="car-price-block">
              <div class="price-val">₹${car.pricePerDay.toLocaleString()}</div>
              <div class="price-period">per day / taxes incl.</div>
            </div>

            <div class="card-actions">
              <button class="btn btn-secondary btn-sm details-btn" data-id="${car.id}">
                Specs
              </button>
              <button class="btn btn-primary btn-sm book-btn" data-id="${car.id}" ${!isAvailable ? 'disabled' : ''}>
                ${isAvailable ? 'Book Now' : 'Reserved'}
              </button>
            </div>
          </div>
        </div>
      `;

      // Event listeners for card buttons
      card.querySelector('.details-btn').addEventListener('click', () => openCarDetailsModal(car.id));
      const bookBtn = card.querySelector('.book-btn');
      if (isAvailable) {
        bookBtn.addEventListener('click', () => openCheckoutModal(car.id));
      }

      carGrid.appendChild(card);
    });
  }

  // ------------------------------------------------------------------------
  // Car Details Modal
  // ------------------------------------------------------------------------
  function openCarDetailsModal(carId) {
    const car = ApexDB.getCarById(carId);
    if (!car) return;

    selectedCarForBooking = car;
    document.getElementById('modal-car-title').textContent = `${car.brand} ${car.name}`;
    document.getElementById('modal-car-image').src = car.image;
    document.getElementById('modal-car-category').textContent = car.category;
    document.getElementById('modal-car-status').textContent = car.status;
    document.getElementById('modal-car-price').textContent = `₹${car.pricePerDay.toLocaleString()}`;
    document.getElementById('modal-car-desc').textContent = car.description;

    document.getElementById('spec-transmission').textContent = car.transmission;
    document.getElementById('spec-seats').textContent = `${car.seats} Adults`;
    document.getElementById('spec-fuel').textContent = car.fuelType;
    document.getElementById('spec-accel').textContent = car.acceleration;
    document.getElementById('spec-speed').textContent = car.topSpeed;

    // Feature tags
    const featuresList = document.getElementById('modal-car-features');
    featuresList.innerHTML = car.features.map(f => `<span class="badge" style="background:#e0e7ff; color:#3730a3;">✓ ${f}</span>`).join(' ');

    const modalBookBtn = document.getElementById('modal-proceed-book-btn');
    if (car.status === 'Available') {
      modalBookBtn.disabled = false;
      modalBookBtn.textContent = 'Proceed to Book This Vehicle';
      modalBookBtn.onclick = () => {
        closeModal(carDetailsModal);
        openCheckoutModal(car.id);
      };
    } else {
      modalBookBtn.disabled = true;
      modalBookBtn.textContent = `Currently ${car.status}`;
    }

    openModal(carDetailsModal);
  }

  // ------------------------------------------------------------------------
  // Checkout Modal & Interactive Payment Simulator
  // ------------------------------------------------------------------------
  function openCheckoutModal(carId) {
    // Check if user is logged in
    const user = ApexAuth.getCurrentUser();
    if (!user || user.role !== 'user') {
      showToast('Please login as a Customer to make a vehicle reservation!', 'warning');
      setTimeout(() => {
        window.location.href = 'user-auth.html';
      }, 1200);
      return;
    }

    const car = ApexDB.getCarById(carId);
    if (!car || car.status !== 'Available') {
      showToast('This vehicle is currently not available for rental.', 'error');
      return;
    }

    selectedCarForBooking = car;

    // Populate checkout car summary
    document.getElementById('checkout-car-name').textContent = car.name;
    document.getElementById('checkout-car-thumb').src = car.image;
    document.getElementById('checkout-daily-rate').textContent = `₹${car.pricePerDay.toLocaleString()}`;

    // Set default dates (Today to Today + 2 days)
    const today = new Date();
    const plusTwo = new Date();
    plusTwo.setDate(today.getDate() + 2);

    const formatDate = (d) => d.toISOString().split('T')[0];
    const pickupInput = document.getElementById('checkout-pickup-date');
    const returnInput = document.getElementById('checkout-return-date');

    pickupInput.min = formatDate(today);
    pickupInput.value = formatDate(today);
    returnInput.min = formatDate(today);
    returnInput.value = formatDate(plusTwo);

    // Populate customer info
    document.getElementById('checkout-driver-name').value = user.name;
    document.getElementById('checkout-driver-email').value = user.email;
    document.getElementById('checkout-driver-phone').value = user.phone || '+91 98765 43210';

    // Reset steps to step 1
    goToCheckoutStep(1);
    recalculateCheckoutTotal();
    openModal(checkoutModal);
  }

  function recalculateCheckoutTotal() {
    if (!selectedCarForBooking) return;

    const pickupDateStr = document.getElementById('checkout-pickup-date').value;
    const returnDateStr = document.getElementById('checkout-return-date').value;

    const pickup = new Date(pickupDateStr);
    const returnD = new Date(returnDateStr);

    let days = Math.ceil((returnD - pickup) / (1000 * 60 * 60 * 24));
    if (days <= 0) days = 1;

    let baseRent = days * selectedCarForBooking.pricePerDay;

    // Addons
    let addonsTotal = 0;
    if (document.getElementById('addon-insurance').checked) addonsTotal += (days * 500);
    if (document.getElementById('addon-gps').checked) addonsTotal += (days * 200);
    if (document.getElementById('addon-childseat').checked) addonsTotal += (days * 300);

    const grandTotal = baseRent + addonsTotal;

    document.getElementById('checkout-calc-days').textContent = `${days} Day(s)`;
    document.getElementById('checkout-base-rent').textContent = `₹${baseRent.toLocaleString()}`;
    document.getElementById('checkout-addons-cost').textContent = `₹${addonsTotal.toLocaleString()}`;
    document.getElementById('checkout-grand-total').textContent = `₹${grandTotal.toLocaleString()}`;
    document.getElementById('pay-now-amount-btn').textContent = `Pay ₹${grandTotal.toLocaleString()} & Confirm`;

    activeBookingData = {
      carId: selectedCarForBooking.id,
      carName: selectedCarForBooking.name,
      carImage: selectedCarForBooking.image,
      dailyRate: selectedCarForBooking.pricePerDay,
      pickupDate: pickupDateStr,
      returnDate: returnDateStr,
      totalDays: days,
      addonsCost: addonsTotal,
      totalCost: grandTotal
    };
  }

  function goToCheckoutStep(step) {
    document.querySelectorAll('.checkout-step-content').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.step-item').forEach(el => el.classList.remove('active'));

    document.getElementById(`checkout-step-${step}`).style.display = 'block';
    for (let i = 1; i <= step; i++) {
      const stepInd = document.getElementById(`step-ind-${i}`);
      if (stepInd) stepInd.classList.add('active');
    }
  }

  // Interactive Live Card Preview Listeners
  const cardNumInput = document.getElementById('card-number-input');
  const cardNameInput = document.getElementById('card-name-input');
  const cardExpInput = document.getElementById('card-exp-input');

  if (cardNumInput) {
    cardNumInput.addEventListener('input', (e) => {
      let val = e.target.value.replace(/\D/g, '').substring(0, 16);
      val = val.replace(/(\d{4})/g, '$1 ').trim();
      e.target.value = val;
      document.getElementById('preview-card-num').textContent = val || '•••• •••• •••• ••••';
    });
  }

  if (cardNameInput) {
    cardNameInput.addEventListener('input', (e) => {
      document.getElementById('preview-card-holder').textContent = e.target.value.toUpperCase() || 'YOUR NAME';
    });
  }

  if (cardExpInput) {
    cardExpInput.addEventListener('input', (e) => {
      let val = e.target.value.replace(/\D/g, '').substring(0, 4);
      if (val.length >= 2) val = val.substring(0, 2) + '/' + val.substring(2);
      e.target.value = val;
      document.getElementById('preview-card-exp').textContent = val || 'MM/YY';
    });
  }

  // ------------------------------------------------------------------------
  // Confirm Booking & Printable Invoice Voucher Generation
  // ------------------------------------------------------------------------
  function executeBookingPayment() {
    const user = ApexAuth.getCurrentUser();
    if (!user) return;

    const paymentMethod = document.querySelector('input[name="payment-method"]:checked').value;
    
    // Save to DB
    const finalBooking = {
      ...activeBookingData,
      userId: user.id,
      userEmail: user.email,
      userName: user.name,
      driverPhone: document.getElementById('checkout-driver-phone').value,
      paymentMethod: paymentMethod
    };

    const savedBooking = ApexDB.createBooking(finalBooking);

    // Close checkout and open Voucher
    closeModal(checkoutModal);
    showToast('Booking Successfully Reserved! Vehicle locked for your journey.', 'success', 4000);

    // Refresh catalog & Nav
    filterAndRenderCars();
    updateNavUserState();

    // Populate Printable Voucher
    openVoucherModal(savedBooking);
  }

  function openVoucherModal(booking) {
    document.getElementById('v-booking-id').textContent = booking.id;
    document.getElementById('v-booking-date').textContent = new Date().toLocaleDateString('en-IN', { dateStyle: 'long' });
    document.getElementById('v-customer-name').textContent = booking.userName;
    document.getElementById('v-customer-email').textContent = booking.userEmail;
    document.getElementById('v-car-name').textContent = booking.carName;
    document.getElementById('v-pickup-date').textContent = booking.pickupDate;
    document.getElementById('v-return-date').textContent = booking.returnDate;
    document.getElementById('v-days').textContent = `${booking.totalDays} Days`;
    document.getElementById('v-daily-rate').textContent = `₹${booking.dailyRate.toLocaleString()}`;
    document.getElementById('v-addons').textContent = `₹${booking.addonsCost.toLocaleString()}`;
    document.getElementById('v-total').textContent = `₹${booking.totalCost.toLocaleString()}`;
    document.getElementById('v-payment-mode').textContent = booking.paymentMethod;
    document.getElementById('v-qr-code').textContent = `[ID: ${booking.id}]`;

    openModal(voucherModal);
  }

  // ------------------------------------------------------------------------
  // "My Bookings" Modal Drawer
  // ------------------------------------------------------------------------
  function openMyBookingsModal() {
    const user = ApexAuth.getCurrentUser();
    if (!user) {
      showToast('Please sign in to view your booked vehicles.', 'info');
      setTimeout(() => window.location.href = 'user-auth.html', 800);
      return;
    }

    const bookings = ApexDB.getUserBookings(user.email);
    const container = document.getElementById('my-bookings-list-container');
    const emptyMsg = document.getElementById('no-bookings-msg');

    container.innerHTML = '';
    if (bookings.length === 0) {
      emptyMsg.style.display = 'block';
    } else {
      emptyMsg.style.display = 'none';
      bookings.forEach(b => {
        const item = document.createElement('div');
        item.className = 'booking-item-card';

        let badgeStyle = 'badge-available';
        if (b.status === 'Cancelled') badgeStyle = 'badge-maintenance';
        if (b.status === 'Completed') badgeStyle = 'badge-luxury';

        item.innerHTML = `
          <div class="booking-item-left">
            <img src="${b.carImage}" class="booking-car-thumb" alt="${b.carName}">
            <div>
              <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.25rem;">
                <h4 style="font-size:1.05rem;">${b.carName}</h4>
                <span class="badge ${badgeStyle}">${b.status}</span>
              </div>
              <p style="font-size:0.8rem; color:#64748b;">
                📅 ${b.pickupDate} to ${b.returnDate} (${b.totalDays} days) • Paid: <strong>₹${b.totalCost.toLocaleString()}</strong>
              </p>
              <p style="font-size:0.75rem; color:#94a3b8;">Booking Ref: ${b.id}</p>
            </div>
          </div>
          <div style="display:flex; gap:0.5rem; align-items:center;">
            <button class="btn btn-secondary btn-sm print-booking-btn" data-id="${b.id}">
              🧾 Receipt
            </button>
            ${b.status === 'Active' ? `
              <button class="btn btn-danger btn-sm cancel-booking-btn" data-id="${b.id}">
                Cancel
              </button>
            ` : ''}
          </div>
        `;

        item.querySelector('.print-booking-btn').addEventListener('click', () => {
          closeModal(myBookingsModal);
          openVoucherModal(b);
        });

        const cancelBtn = item.querySelector('.cancel-booking-btn');
        if (cancelBtn) {
          cancelBtn.addEventListener('click', () => {
            if (confirm(`Are you sure you want to cancel booking ${b.id}? Refund will be processed.`)) {
              ApexDB.updateBookingStatus(b.id, 'Cancelled');
              showToast('Booking cancelled. Vehicle returned to available inventory.', 'warning');
              filterAndRenderCars();
              updateNavUserState();
              openMyBookingsModal();
            }
          });
        }

        container.appendChild(item);
      });
    }

    openModal(myBookingsModal);
  }

  // ------------------------------------------------------------------------
  // Modal Utilities
  // ------------------------------------------------------------------------
  function openModal(modal) {
    if (modal) modal.classList.add('active');
  }

  function closeModal(modal) {
    if (modal) modal.classList.remove('active');
  }

  // Setup close buttons on all modals
  document.querySelectorAll('.modal-close-btn, .modal-cancel-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const modal = e.target.closest('.modal-backdrop');
      closeModal(modal);
    });
  });

  // Close on backdrop click
  document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) closeModal(backdrop);
    });
  });

  // ------------------------------------------------------------------------
  // Event Listeners Binding
  // ------------------------------------------------------------------------
  // Search inputs
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      filterAndRenderCars();
    });
  }

  if (heroSearchInput) {
    heroSearchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      if (searchInput) searchInput.value = searchQuery;
      filterAndRenderCars();
    });
  }

  // Category Pills
  categoryPills.forEach(pill => {
    pill.addEventListener('click', () => {
      categoryPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentCategory = pill.getAttribute('data-category');
      filterAndRenderCars();
    });
  });

  // Sort Select
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      sortBy = e.target.value;
      filterAndRenderCars();
    });
  }

  // Price Slider
  if (priceSlider) {
    priceSlider.addEventListener('input', (e) => {
      maxPrice = parseInt(e.target.value, 10);
      if (priceFilterVal) priceFilterVal.textContent = `₹${maxPrice.toLocaleString()}`;
      filterAndRenderCars();
    });
  }

  // Hero Quick Booking Widget Trigger
  const heroFindBtn = document.getElementById('hero-find-btn');
  if (heroFindBtn) {
    heroFindBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const heroCat = document.getElementById('hero-car-category').value;
      if (heroCat !== 'all') {
        currentCategory = heroCat;
        categoryPills.forEach(p => {
          if (p.getAttribute('data-category') === heroCat) p.classList.add('active');
          else p.classList.remove('active');
        });
      }
      filterAndRenderCars();
      const catalogEl = document.getElementById('fleet-catalog-anchor');
      if (catalogEl) catalogEl.scrollIntoView({ behavior: 'smooth' });
    });
  }

  // Checkout Date & Addon Listeners
  const pickupInput = document.getElementById('checkout-pickup-date');
  const returnInput = document.getElementById('checkout-return-date');
  if (pickupInput && returnInput) {
    pickupInput.addEventListener('change', recalculateCheckoutTotal);
    returnInput.addEventListener('change', recalculateCheckoutTotal);
  }

  ['addon-insurance', 'addon-gps', 'addon-childseat'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('change', recalculateCheckoutTotal);
  });

  // Checkout Wizard Navigation Buttons
  const step1NextBtn = document.getElementById('checkout-step1-next');
  if (step1NextBtn) {
    step1NextBtn.addEventListener('click', () => {
      goToCheckoutStep(2);
    });
  }

  const step2BackBtn = document.getElementById('checkout-step2-back');
  if (step2BackBtn) {
    step2BackBtn.addEventListener('click', () => {
      goToCheckoutStep(1);
    });
  }

  // Payment Confirmation Button
  const payConfirmBtn = document.getElementById('pay-now-amount-btn');
  if (payConfirmBtn) {
    payConfirmBtn.addEventListener('click', (e) => {
      e.preventDefault();
      payConfirmBtn.disabled = true;
      payConfirmBtn.textContent = 'Processing Secure Authorization...';

      setTimeout(() => {
        executeBookingPayment();
        payConfirmBtn.disabled = false;
      }, 1000);
    });
  }

  // Open "My Bookings" Button in Navbar
  const myBookingsNavBtn = document.getElementById('nav-my-bookings-btn');
  if (myBookingsNavBtn) {
    myBookingsNavBtn.addEventListener('click', (e) => {
      e.preventDefault();
      openMyBookingsModal();
    });
  }

  // Print Voucher Button
  const printVoucherBtn = document.getElementById('print-voucher-btn');
  if (printVoucherBtn) {
    printVoucherBtn.addEventListener('click', () => {
      window.print();
    });
  }

  // Initial Load
  updateNavUserState();
  filterAndRenderCars();
});
