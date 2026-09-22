/* ==========================================================================
   ApexDrive - Admin Module Controller (admin.js)
   Executive Fleet Analytics, Inventory CRUD, Bookings & Maintenance Scheduler
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Guard Admin Access
  if (!window.ApexAuth || !ApexAuth.requireRole('admin', 'admin-auth.html')) {
    return;
  }

  // Render floating demo switcher
  ApexAuth.renderDemoSwitcher('admin');

  // DOM Elements
  const currentAdmin = ApexAuth.getCurrentUser();
  if (currentAdmin) {
    document.getElementById('admin-display-name').textContent = currentAdmin.name;
    document.getElementById('admin-display-dept').textContent = currentAdmin.department || 'Operations Lead';
  }

  // Tab Navigation Elements
  const tabLinks = document.querySelectorAll('.sidebar-link[data-tab]');
  const tabContents = document.querySelectorAll('.admin-tab-content');

  // Metric Cards
  const kpiTotalFleet = document.getElementById('kpi-total-fleet');
  const kpiActiveRentals = document.getElementById('kpi-active-rentals');
  const kpiTotalRevenue = document.getElementById('kpi-total-revenue');
  const kpiMaintenance = document.getElementById('kpi-maintenance');

  // Inventory Table & Modals
  const fleetTableBody = document.getElementById('fleet-table-body');
  const bookingsTableBody = document.getElementById('bookings-table-body');
  const maintenanceTableBody = document.getElementById('maintenance-table-body');

  const carModal = document.getElementById('admin-car-modal');
  const carModalTitle = document.getElementById('car-modal-title');
  const carForm = document.getElementById('admin-car-form');
  const carImgInput = document.getElementById('car-form-image');
  const carImgPreview = document.getElementById('car-form-preview-img');

  const maintModal = document.getElementById('admin-maint-modal');
  const maintForm = document.getElementById('admin-maint-form');

  // ------------------------------------------------------------------------
  // Tab Switching
  // ------------------------------------------------------------------------
  tabLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetTab = link.getAttribute('data-tab');

      tabLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');

      tabContents.forEach(content => {
        content.style.display = content.id === `tab-${targetTab}` ? 'block' : 'none';
      });

      // Refresh data on tab click
      refreshDashboard();
    });
  });

  // Logout Handler
  document.getElementById('admin-logout-btn').addEventListener('click', () => {
    ApexAuth.logout();
  });

  // ------------------------------------------------------------------------
  // KPI Metrics Computation
  // ------------------------------------------------------------------------
  function refreshMetrics() {
    const cars = ApexDB.getCars();
    const bookings = ApexDB.getBookings();

    const activeRentals = bookings.filter(b => b.status === 'Active').length;
    const maintenanceCount = cars.filter(c => c.status === 'Maintenance').length;

    const totalRevenue = bookings
      .filter(b => b.status !== 'Cancelled')
      .reduce((sum, b) => sum + (b.totalCost || 0), 0);

    kpiTotalFleet.textContent = cars.length;
    kpiActiveRentals.textContent = activeRentals;
    kpiTotalRevenue.textContent = `₹${totalRevenue.toLocaleString()}`;
    kpiMaintenance.textContent = maintenanceCount;
  }

  // ------------------------------------------------------------------------
  // Fleet Inventory CRUD
  // ------------------------------------------------------------------------
  function renderFleetTable(searchFilter = '') {
    const cars = ApexDB.getCars();
    fleetTableBody.innerHTML = '';

    const filtered = cars.filter(c => {
      if (!searchFilter.trim()) return true;
      const q = searchFilter.toLowerCase();
      return c.name.toLowerCase().includes(q) || c.brand.toLowerCase().includes(q) || c.category.toLowerCase().includes(q);
    });

    if (filtered.length === 0) {
      fleetTableBody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:2rem; color:#94a3b8;">No matching vehicles found in inventory.</td></tr>`;
      return;
    }

    filtered.forEach(car => {
      const tr = document.createElement('tr');

      let badgeClass = 'badge-available';
      if (car.status === 'Rented') badgeClass = 'badge-rented';
      if (car.status === 'Maintenance') badgeClass = 'badge-maintenance';

      tr.innerHTML = `
        <td><span style="font-family:monospace; font-weight:700; color:#64748b;">${car.id}</span></td>
        <td>
          <div class="car-cell-flex">
            <img src="${car.image}" class="car-thumb-sm" alt="${car.name}" onerror="this.src='https://images.unsplash.com/photo-1541348263662-e0c82661ac74?auto=format&fit=crop&w=900&q=80'">
            <div>
              <strong style="color:var(--text-main); font-size:0.95rem;">${car.name}</strong>
              <div style="font-size:0.75rem; color:#64748b;">${car.brand} • ${car.category}</div>
            </div>
          </div>
        </td>
        <td><strong>₹${car.pricePerDay.toLocaleString()}</strong></td>
        <td>${car.transmission} / ${car.fuelType}</td>
        <td>${car.seats} Seats</td>
        <td>
          <select class="form-input car-status-select" data-id="${car.id}" style="padding:0.35rem 0.6rem; font-size:0.8rem; width:auto;">
            <option value="Available" ${car.status === 'Available' ? 'selected' : ''}>Available</option>
            <option value="Rented" ${car.status === 'Rented' ? 'selected' : ''}>Rented</option>
            <option value="Maintenance" ${car.status === 'Maintenance' ? 'selected' : ''}>Maintenance</option>
          </select>
        </td>
        <td>
          <div class="action-btns-group">
            <button class="action-icon-btn action-edit-btn" data-id="${car.id}" title="Edit Vehicle">✏️</button>
            <button class="action-icon-btn action-delete-btn" data-id="${car.id}" title="Remove Vehicle">🗑️</button>
          </div>
        </td>
      `;

      // Status direct dropdown change
      tr.querySelector('.car-status-select').addEventListener('change', (e) => {
        ApexDB.updateCarStatus(car.id, e.target.value);
        showToast(`Status of ${car.name} updated to ${e.target.value}`, 'success');
        refreshDashboard();
      });

      // Edit Button
      tr.querySelector('.action-edit-btn').addEventListener('click', () => {
        openEditCarModal(car.id);
      });

      // Delete Button
      tr.querySelector('.action-delete-btn').addEventListener('click', () => {
        if (confirm(`Are you sure you want to permanently remove ${car.name} (${car.id}) from the fleet?`)) {
          ApexDB.deleteCar(car.id);
          showToast(`${car.name} removed from fleet inventory.`, 'warning');
          refreshDashboard();
        }
      });

      fleetTableBody.appendChild(tr);
    });
  }

  // Add / Edit Modal Controls
  function openAddCarModal() {
    carForm.reset();
    document.getElementById('car-form-id').value = '';
    carModalTitle.textContent = 'Add New Fleet Vehicle';
    carImgPreview.src = 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=900&q=80';
    document.getElementById('car-form-image').value = carImgPreview.src;
    carModal.classList.add('active');
  }

  function openEditCarModal(carId) {
    const car = ApexDB.getCarById(carId);
    if (!car) return;

    carModalTitle.textContent = `Edit Vehicle: ${car.name}`;
    document.getElementById('car-form-id').value = car.id;
    document.getElementById('car-form-brand').value = car.brand;
    document.getElementById('car-form-name').value = car.name;
    document.getElementById('car-form-category').value = car.category;
    document.getElementById('car-form-price').value = car.pricePerDay;
    document.getElementById('car-form-seats').value = car.seats;
    document.getElementById('car-form-transmission').value = car.transmission;
    document.getElementById('car-form-fuel').value = car.fuelType;
    document.getElementById('car-form-image').value = car.image;
    document.getElementById('car-form-desc').value = car.description;
    carImgPreview.src = car.image;

    carModal.classList.add('active');
  }

  // Live image preview
  carImgInput.addEventListener('input', (e) => {
    carImgPreview.src = e.target.value;
  });

  // Save Car Form Submission
  carForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('car-form-id').value;
    const brand = document.getElementById('car-form-brand').value.trim();
    const name = document.getElementById('car-form-name').value.trim();
    const category = document.getElementById('car-form-category').value;
    const pricePerDay = parseInt(document.getElementById('car-form-price').value, 10);
    const seats = parseInt(document.getElementById('car-form-seats').value, 10);
    const transmission = document.getElementById('car-form-transmission').value;
    const fuelType = document.getElementById('car-form-fuel').value;
    const image = document.getElementById('car-form-image').value.trim();
    const description = document.getElementById('car-form-desc').value.trim();

    const carData = {
      brand,
      name,
      category,
      pricePerDay,
      seats,
      transmission,
      fuelType,
      image,
      description,
      features: ['Air Conditioning', 'Bluetooth', 'Reverse Camera', 'ABS Brakes']
    };

    if (id) {
      carData.id = id;
    }

    ApexDB.saveCar(carData);
    carModal.classList.remove('active');
    showToast(id ? 'Car specifications updated successfully!' : 'New vehicle added to fleet inventory!', 'success');
    refreshDashboard();
  });

  document.getElementById('open-add-car-btn').addEventListener('click', openAddCarModal);

  // Search input for fleet
  const fleetSearchInput = document.getElementById('fleet-search-input');
  if (fleetSearchInput) {
    fleetSearchInput.addEventListener('input', (e) => {
      renderFleetTable(e.target.value);
    });
  }

  // ------------------------------------------------------------------------
  // Bookings Management
  // ------------------------------------------------------------------------
  function renderBookingsTable() {
    const bookings = ApexDB.getBookings();
    bookingsTableBody.innerHTML = '';

    if (bookings.length === 0) {
      bookingsTableBody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:2rem; color:#94a3b8;">No bookings recorded yet.</td></tr>`;
      return;
    }

    bookings.forEach(b => {
      const tr = document.createElement('tr');

      let badgeClass = 'badge-available';
      if (b.status === 'Cancelled') badgeClass = 'badge-maintenance';
      if (b.status === 'Completed') badgeClass = 'badge-luxury';

      tr.innerHTML = `
        <td><span style="font-family:monospace; font-weight:700;">${b.id}</span></td>
        <td>
          <strong>${b.userName}</strong>
          <div style="font-size:0.75rem; color:#64748b;">${b.userEmail}</div>
        </td>
        <td>
          <strong>${b.carName}</strong>
          <div style="font-size:0.75rem; color:#64748b;">Rate: ₹${b.dailyRate}/day</div>
        </td>
        <td>
          <div>${b.pickupDate} to ${b.returnDate}</div>
          <div style="font-size:0.75rem; color:#64748b;">(${b.totalDays} Days)</div>
        </td>
        <td><strong>₹${b.totalCost.toLocaleString()}</strong></td>
        <td><span class="badge ${badgeClass}">${b.status}</span></td>
        <td>
          <div class="action-btns-group">
            ${b.status === 'Active' ? `
              <button class="action-icon-btn action-complete-btn complete-booking-btn" data-id="${b.id}" title="Mark Completed / Vehicle Returned">
                ✓
              </button>
              <button class="action-icon-btn action-delete-btn cancel-booking-btn" data-id="${b.id}" title="Cancel Rental Order">
                ✕
              </button>
            ` : `<span style="font-size:0.8rem; color:#94a3b8;">Finished</span>`}
          </div>
        </td>
      `;

      const completeBtn = tr.querySelector('.complete-booking-btn');
      if (completeBtn) {
        completeBtn.addEventListener('click', () => {
          ApexDB.updateBookingStatus(b.id, 'Completed');
          showToast(`Booking ${b.id} marked as Completed. Vehicle marked Available.`, 'success');
          refreshDashboard();
        });
      }

      const cancelBtn = tr.querySelector('.cancel-booking-btn');
      if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
          if (confirm(`Cancel reservation for ${b.userName} (${b.id})?`)) {
            ApexDB.updateBookingStatus(b.id, 'Cancelled');
            showToast(`Booking ${b.id} cancelled.`, 'warning');
            refreshDashboard();
          }
        });
      }

      bookingsTableBody.appendChild(tr);
    });
  }

  // ------------------------------------------------------------------------
  // Maintenance Scheduler
  // ------------------------------------------------------------------------
  function renderMaintenanceTable() {
    const records = ApexDB.getMaintenance();
    maintenanceTableBody.innerHTML = '';

    if (records.length === 0) {
      maintenanceTableBody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:2rem; color:#94a3b8;">No active maintenance logs. All fleet vehicles are operational.</td></tr>`;
      return;
    }

    records.forEach(rec => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><span style="font-family:monospace; font-weight:700;">${rec.id}</span></td>
        <td><strong>${rec.carName}</strong></td>
        <td>${rec.serviceType}</td>
        <td>${rec.serviceCenter}</td>
        <td>${rec.startDate} &rarr; ${rec.estimatedCompletion}</td>
        <td>₹${rec.cost.toLocaleString()}</td>
        <td><span class="badge badge-maintenance">${rec.status}</span></td>
      `;
      maintenanceTableBody.appendChild(tr);
    });
  }

  // Schedule Maintenance Modal Controls
  function openMaintModal() {
    maintForm.reset();
    const select = document.getElementById('maint-car-select');
    select.innerHTML = '';

    const cars = ApexDB.getCars();
    cars.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.id;
      opt.textContent = `${c.name} (${c.status})`;
      select.appendChild(opt);
    });

    const today = new Date().toISOString().split('T')[0];
    document.getElementById('maint-start-date').value = today;

    maintModal.classList.add('active');
  }

  maintForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const carId = document.getElementById('maint-car-select').value;
    const car = ApexDB.getCarById(carId);
    const serviceType = document.getElementById('maint-service-type').value.trim();
    const serviceCenter = document.getElementById('maint-center').value.trim();
    const startDate = document.getElementById('maint-start-date').value;
    const estimatedCompletion = document.getElementById('maint-end-date').value;
    const cost = parseInt(document.getElementById('maint-cost').value, 10);

    ApexDB.addMaintenance({
      carId,
      carName: car.name,
      serviceType,
      serviceCenter,
      startDate,
      estimatedCompletion,
      cost,
      status: 'In Progress'
    });

    maintModal.classList.remove('active');
    showToast(`Vehicle ${car.name} placed in maintenance schedule.`, 'info');
    refreshDashboard();
  });

  document.getElementById('open-maint-btn').addEventListener('click', openMaintModal);

  // Close modal buttons
  document.querySelectorAll('.modal-close-btn, .modal-cancel-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const modal = e.target.closest('.modal-backdrop');
      if (modal) modal.classList.remove('active');
    });
  });

  // ------------------------------------------------------------------------
  // Global Refresh Routine
  // ------------------------------------------------------------------------
  function refreshDashboard() {
    refreshMetrics();
    renderFleetTable();
    renderBookingsTable();
    renderMaintenanceTable();
  }

  // Initial Load
  refreshDashboard();
});
