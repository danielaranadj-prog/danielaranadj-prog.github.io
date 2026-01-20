/**
 * Tours Manager - Multi-Country Support
 * Manages tours for Argentina, España, México
 */

// Available countries
const COUNTRIES = [
    { id: 'argentina', name: 'Argentina', flag: '🇦🇷', cities: ['buenos-aires', 'el-calafate', 'el-chalten', 'iguazu', 'mendoza', 'ushuaia', 'rosario'] },
    { id: 'espana', name: 'España', flag: '🇪🇸', cities: ['madrid', 'barcelona', 'sevilla', 'granada', 'valencia', 'bilbao'] },
    { id: 'mexico', name: 'México', flag: '🇲🇽', cities: ['cdmx', 'cancun', 'oaxaca', 'guadalajara', 'merida', 'san-miguel'] }
];

let currentCountry = 'argentina';
let allTours = { argentina: [], espana: [], mexico: [] };

// Render country tabs
function renderCountryTabs() {
    const container = document.getElementById('tours-country-tabs');
    if (!container) return;

    container.innerHTML = COUNTRIES.map(c => `
        <button class="country-tab ${c.id === currentCountry ? 'active' : ''}" data-country="${c.id}">
            <span class="flag">${c.flag}</span>
            <span class="name">${c.name}</span>
            <span class="count">(${(allTours[c.id] || []).length})</span>
        </button>
    `).join('');

    container.querySelectorAll('.country-tab').forEach(btn => {
        btn.addEventListener('click', () => {
            currentCountry = btn.dataset.country;
            renderCountryTabs();
            renderToursGrid();
        });
    });
}

// Render tours grid
function renderToursGrid() {
    const container = document.getElementById('tours-grid');
    if (!container) return;

    const tours = allTours[currentCountry] || [];
    const country = COUNTRIES.find(c => c.id === currentCountry);

    if (tours.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <span class="icon">🎟️</span>
                <p>No hay tours en ${country.name} aún</p>
                <button onclick="openTourModal()" class="btn-primary">+ Agregar Tour</button>
            </div>
        `;
        return;
    }

    container.innerHTML = tours.map((tour, idx) => `
        <div class="tour-card-admin" data-idx="${idx}">
            <div class="tour-img" style="background-image: url('${tour.imagen}')">
                <span class="tour-ciudad">${tour.ciudad}</span>
            </div>
            <div class="tour-info">
                <h4>${tour.titulo}</h4>
                <div class="tour-meta">
                    <span class="precio">${tour.precio}</span>
                    <span class="duracion">${tour.duracion}</span>
                </div>
            </div>
            <div class="tour-actions">
                <button onclick="editTour(${idx})" class="btn-edit" title="Editar">
                    <ion-icon name="create-outline"></ion-icon>
                </button>
                <button onclick="deleteTour(${idx})" class="btn-delete" title="Eliminar">
                    <ion-icon name="trash-outline"></ion-icon>
                </button>
            </div>
        </div>
    `).join('');
}

// Open tour modal (create/edit)
let editingTourIdx = null;

window.openTourModal = (idx = null) => {
    editingTourIdx = idx;
    const modal = document.getElementById('tour-modal');
    const country = COUNTRIES.find(c => c.id === currentCountry);

    // Populate city dropdown
    const citySelect = document.getElementById('tour-ciudad');
    citySelect.innerHTML = country.cities.map(c =>
        `<option value="${c}">${c.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>`
    ).join('');

    if (idx !== null) {
        // Edit mode
        const tour = allTours[currentCountry][idx];
        document.getElementById('tour-modal-title').textContent = 'Editar Tour';
        document.getElementById('tour-titulo').value = tour.titulo;
        document.getElementById('tour-ciudad').value = tour.ciudad;
        document.getElementById('tour-precio').value = tour.precio;
        document.getElementById('tour-duracion').value = tour.duracion;
        document.getElementById('tour-imagen').value = tour.imagen;
        document.getElementById('tour-link').value = tour.linkAfiliado || tour.link || '';
    } else {
        // Create mode
        document.getElementById('tour-modal-title').textContent = 'Nuevo Tour';
        document.getElementById('tour-titulo').value = '';
        document.getElementById('tour-precio').value = 'US$ ';
        document.getElementById('tour-duracion').value = '';
        document.getElementById('tour-imagen').value = '';
        document.getElementById('tour-link').value = '';
    }

    modal.classList.add('open');
};

window.closeTourModal = () => {
    document.getElementById('tour-modal').classList.remove('open');
    editingTourIdx = null;
};

window.editTour = (idx) => openTourModal(idx);

window.deleteTour = async (idx) => {
    if (!confirm('¿Eliminar este tour?')) return;

    allTours[currentCountry].splice(idx, 1);
    await saveToursToFirestore();
    renderCountryTabs();
    renderToursGrid();
    showToast('Tour eliminado');
};

window.saveTour = async () => {
    const tour = {
        id: document.getElementById('tour-titulo').value.toLowerCase().replace(/\s+/g, '-').substring(0, 20),
        pais: currentCountry,
        ciudad: document.getElementById('tour-ciudad').value,
        titulo: document.getElementById('tour-titulo').value.trim(),
        precio: document.getElementById('tour-precio').value.trim(),
        duracion: document.getElementById('tour-duracion').value.trim(),
        imagen: document.getElementById('tour-imagen').value.trim(),
        linkAfiliado: document.getElementById('tour-link').value.trim(),
        activo: true
    };

    if (!tour.titulo || !tour.ciudad) {
        showToast('Título y ciudad son requeridos', 'error');
        return;
    }

    if (editingTourIdx !== null) {
        allTours[currentCountry][editingTourIdx] = tour;
    } else {
        allTours[currentCountry].push(tour);
    }

    await saveToursToFirestore();
    closeTourModal();
    renderCountryTabs();
    renderToursGrid();
    showToast(editingTourIdx !== null ? 'Tour actualizado' : 'Tour creado');
};

// Firestore integration
async function loadToursFromFirestore() {
    try {
        const docRef = firebase.firestore().collection('config').doc('tours');
        const doc = await docRef.get();

        if (doc.exists) {
            const data = doc.data();
            allTours = {
                argentina: data.argentina || [],
                espana: data.espana || [],
                mexico: data.mexico || []
            };
        }
    } catch (error) {
        console.error('Error loading tours:', error);
    }
}

async function saveToursToFirestore() {
    try {
        const docRef = firebase.firestore().collection('config').doc('tours');
        await docRef.set(allTours, { merge: true });
    } catch (error) {
        console.error('Error saving tours:', error);
        showToast('Error al guardar', 'error');
    }
}

// Initialize Tours Manager
window.initToursManager = async () => {
    await loadToursFromFirestore();
    renderCountryTabs();
    renderToursGrid();
};

// Toast helper
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// Export
window.COUNTRIES = COUNTRIES;
window.allTours = allTours;
window.currentCountry = currentCountry;
