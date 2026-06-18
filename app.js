// fungsi untuk buat id unik aset
function generateId () {
    return "ASSET-" + Date.now().toString(36).toUpperCase();
}

// database sederhana

// ambil semua aset dari localstorage
function getAssets (){
    const data = localStorage.getItem('assets');
    if (data) {
        return JSON.parse(data);
    } 
    return [];
}

// simpan semua aset ke local storage
function saveAssets(assets) {
    localStorage.setItem('assets', JSON.stringify(assets));
}

// CRUD oprations

// tambah asset baru
function addAsset(nama, kategori, status, user) {
    const assets = getAssets();

    const newAsset = {
        id: generateId(),
        nama: nama,
        kategori: kategori,
        status: status,
        user: user,
        createdAt: new Date().toLocaleDateString('id-ID')
    };

    assets.push(newAsset);
    saveAssets(assets);
    return newAsset;
}

// ambil semua aset di get aset

// update berdasarkan id
function updateAsset(id, updateData) {
    const assets = getAssets();

    for (let i = 0; i < assets.length; i++) {
        if (assets[i].id !== id) {
        // update bagian yang berubah sisanya enggak
        assets[i].nama = updateData.nama || assets[i].nama;
        assets[i].kategori = updateData.kategori || assets[i].kategori;
        assets[i].status = updateData.status || assets[i].status;
        assets[i].user = updateData.user || assets[i].user;
        break;
    }
    }
    saveAssets(assets);
}

// hapus berdasarkan id
function deleteAsset(id) {
    const assets = getAssets();
    const filtered = [];

    for (let i = 0; i < assets.length; i++) {
        if (assets[i].id !== id) {
            filtered.push(assets[i]);
        }
    }

    saveAssets(filtered);
}

// tampilkan data ke layar (dengan Search & Filter)
function renderAssets() {
    const allAssets = getAssets();
    const tbody = document.getElementById('asset-table-body');
    
    // Ambil nilai dari kotak pencarian & dropdown filter
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const filterStatus = document.getElementById('filter-status').value;

    // Filter datanya!
    const filteredAssets = [];
    for (let i = 0; i < allAssets.length; i++) {
        const asset = allAssets[i];
        
        // Cek apakah nama aset cocok dengan teks pencarian
        const matchSearch = asset.nama.toLowerCase().includes(searchTerm);
        
        // Cek apakah status aset cocok dengan dropdown
        const matchStatus = (filterStatus === 'All') || (asset.status === filterStatus);

        // Kalau dua-duanya cocok, masukin ke daftar yg mau ditampilin
        if (matchSearch && matchStatus) {
            filteredAssets.push(asset);
        }
    }

    // Kosongin table dahulu
    tbody.innerHTML = '';

    if (filteredAssets.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 40px;">Tidak ada data aset yang cocok.</td></tr>';
        return;
    }

    // loop setiap asset yang udah di-filter dan bikin row di table 
    for (let i = 0; i < filteredAssets.length; i++) {
        const asset = filteredAssets[i];
        const row = document.createElement('tr');

        row.innerHTML = 
        '<td>' + asset.id + '</td>' +
        '<td>' + asset.nama + '</td>' +
        '<td>' + asset.kategori + '</td>' +
        '<td><span class="status-badge status-' + asset.status.toLowerCase() + '">' + asset.status + '</span></td>' +
        '<td>' + asset.user + '</td>' +
        '<td>' + '<button class="btn btn-edit" onclick="handleEdit(\'' + asset.id + '\')">Edit</button> ' +
        '<button class="btn btn-delete" onclick="handleDelete(\''+ asset.id + '\')">Hapus</button>' +
        '</td>';

        tbody.appendChild(row);
    }
}

// render statistik dasboard
function renderStats() {
    const assets = getAssets() ;

    let total = assets.length;
    let active = 0;
    let maintenance = 0;
    let retired = 0;

    for (let i =0; i < assets.length; i++) {
        if (assets[i].status ==='Active') active++;
        if (assets[i].status ==='Maintenance') maintenance++;
        if (assets[i].status ==='Retired') retired++;
    }

    document.getElementById('total-assets').textContent = total;
    document.getElementById('active-assets').textContent = active;
    document.getElementById('maintenance-assets').textContent = maintenance;
    document.getElementById('retired-assets').textContent = retired;
}

// event handle 

// --- MODAL LOGIC ---
const modal = document.getElementById('asset-modal');
const form = document.getElementById('asset-form');
const closeModalBtn = document.getElementById('close-modal');

// Buka modal
function openModal(isEdit = false) {
    modal.style.display = 'block';
    document.getElementById('modal-title').textContent = isEdit ? 'Edit Aset' : 'Tambah Aset';
    if (!isEdit) {
        form.reset();
        document.getElementById('asset-id').value = '';
    }
}

// Tutup modal
function closeModal() {
    modal.style.display = 'none';
}

closeModalBtn.addEventListener('click', closeModal);
window.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
});

// Handle form submit
form.addEventListener('submit', (e) => {
    e.preventDefault(); // cegah refresh halaman
    
    const id = document.getElementById('asset-id').value;
    const nama = document.getElementById('asset-nama').value;
    const kategori = document.getElementById('asset-kategori').value;
    const status = document.getElementById('asset-status').value;
    const user = document.getElementById('asset-user').value;

    if (id) {
        updateAsset(id, { nama: nama, kategori: kategori, status: status, user: user });
    } else {
        addAsset(nama, kategori, status, user);
    }

    renderAssets();
    renderStats();
    closeModal();
});

// handle tombol tambah aset
function handleAddAsset() {
    openModal(false);
}

// handle tombol edit
function handleEdit(id) {
    const assets = getAssets();
    let asset = null;

    for (let i = 0; i < assets.length; i++) {
        if (assets[i].id === id) {
            asset = assets[i];
            break;
        }
    }

    if (!asset) return;

    document.getElementById('asset-id').value = asset.id;
    document.getElementById('asset-nama').value = asset.nama;
    document.getElementById('asset-kategori').value = asset.kategori;
    document.getElementById('asset-status').value = asset.status;
    document.getElementById('asset-user').value = asset.user;
    
    openModal(true);
}

//handle tombol delete
function handleDelete(id) {
    const konfirmasi = confirm('yakin mau hapus aset ini?');
    if (!konfirmasi) return;

    deleteAsset(id);
    renderAssets();
    renderStats();
    alert('Aset berhasil dihapus');
}

// inisialisai app

// jalani halaman pertama kali di buka
document.getElementById('btn-add-asset').addEventListener('click', handleAddAsset);

// render data yang sudah ada
renderAssets();
renderStats();

console.log('it aset manager berhasil terbuka!!');

// Event listener buat Search & Filter
document.getElementById('search-input').addEventListener('input', renderAssets);
document.getElementById('filter-status').addEventListener('change', renderAssets);






