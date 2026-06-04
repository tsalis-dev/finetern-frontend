import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axiosInstance from '../api/axios';
import NotificationDropdown from '../components/NotificationDropdown';

const IndustryDashboard = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    // Vacancy State
    const [vacancies, setVacancies] = useState([]);
    const [newVacancy, setNewVacancy] = useState({
        title: '',
        description: '',
        location: '',
        work_mode: 'WFO',
        quota: 1,
        deadline: '',
        required_skills: '',
        category: 'Technology'
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [applications, setApplications] = useState([]);
    const [selectedApplication, setSelectedApplication] = useState(null);

    // Journal State
    const [journals, setJournals] = useState([]);
    const [selectedAppIdForJournal, setSelectedAppIdForJournal] = useState(null);

    const handleOpenJournal = async (appId) => {
        setSelectedAppIdForJournal(appId);
        try {
            const res = await axiosInstance.get(`/journals?application_id=${appId}`);
            setJournals(res.data);
            const modal = new window.bootstrap.Modal(document.getElementById('modalJurnalIndustry'));
            modal.show();
        } catch (error) {
            console.error("Error fetching journals", error);
        }
    };

    const handleUpdateJournalStatus = async (journalId, status) => {
        try {
            await axiosInstance.put(`/journals/${journalId}`, { status });
            setJournals(journals.map(j => j.id === journalId ? { ...j, status } : j));
        } catch (error) {
            console.error("Error updating journal status", error);
            alert("Gagal mengupdate status jurnal.");
        }
    };

    useEffect(() => {
        if (activeTab === 'lowongan' || activeTab === 'dashboard') {
            fetchVacancies();
        }
        if (activeTab === 'lamaran' || activeTab === 'dashboard') {
            fetchApplications();
        }
    }, [activeTab]);

    const fetchApplications = async () => {
        try {
            const res = await axiosInstance.get('/applications');
            setApplications(res.data);
        } catch (error) {
            console.error("Error fetching applications", error);
        }
    };

    const handleUpdateApplicationStatus = async (id, status) => {
        try {
            await axiosInstance.put(`/applications/${id}`, { status });
            fetchApplications();
            document.getElementById('btnCloseReviewModal').click();
        } catch (error) {
            console.error("Error updating status", error);
            alert("Gagal mengupdate status.");
        }
    };

    const fetchVacancies = async () => {
        try {
            const res = await axiosInstance.get('/vacancies');
            setVacancies(res.data);
        } catch (error) {
            console.error("Error fetching vacancies", error);
        }
    };

    const handleAddVacancy = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const skillsArray = newVacancy.required_skills.split(',').map(s => s.trim()).filter(s => s);
            await axiosInstance.post('/vacancies', { ...newVacancy, required_skills: skillsArray });
            
            setNewVacancy({
                title: '', description: '', location: '', work_mode: 'WFO', quota: 1, deadline: '', required_skills: '', category: 'Technology'
            });
            fetchVacancies();
            document.getElementById('btnCloseVacancyModal').click();
        } catch (error) {
            console.error("Error adding vacancy", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteVacancy = async (id) => {
        if(!window.confirm('Tutup dan hapus lowongan ini?')) return;
        try {
            await axiosInstance.delete(`/vacancies/${id}`);
            fetchVacancies();
        } catch (error) {
            console.error("Error deleting vacancy", error);
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    return (
        <>
        <div className="d-flex" id="wrapper">
            {/* ========== SIDEBAR ========== */}
            <div className="border-end bg-white" id="sidebar-wrapper">
                <div className="sidebar-heading border-bottom p-4">
                    <i className="fa-solid fa-layer-group me-2 text-primary fs-4"></i>
                    <strong className="fs-4">Finetern<span className="text-teal">.</span></strong>
                </div>
                
                <div className="nav flex-column nav-pills list-group list-group-flush px-3 py-4 gap-2">
                    <button 
                        className={`nav-link text-start py-3 rounded-3 ${activeTab === 'dashboard' ? 'active' : ''}`} 
                        onClick={() => setActiveTab('dashboard')}
                    >
                        <i className="fa-solid fa-chart-pie me-3 w-20"></i>Ringkasan Mitra
                    </button>

                    <button 
                        className={`nav-link text-start py-3 rounded-3 ${activeTab === 'lowongan' ? 'active' : ''}`} 
                        onClick={() => setActiveTab('lowongan')}
                    >
                        <i className="fa-solid fa-briefcase me-3 w-20"></i>Lowongan Saya
                    </button>
                    
                    <button 
                        className={`nav-link text-start py-3 rounded-3 position-relative ${activeTab === 'lamaran' ? 'active' : ''}`} 
                        onClick={() => setActiveTab('lamaran')}
                    >
                        <i className="fa-solid fa-inbox me-3 w-20"></i>Lamaran Masuk
                        {applications.filter(a => a.status === 'Pending Review').length > 0 && <span className="position-absolute top-50 end-0 translate-middle-y me-3 badge rounded-pill bg-danger">{applications.filter(a => a.status === 'Pending Review').length}</span>}
                    </button>
                </div>
                <div className="mt-auto p-4 border-top">
                    <button onClick={handleLogout} className="btn btn-outline-danger w-100 fw-semibold">
                        <i className="fa-solid fa-arrow-right-from-bracket me-2"></i>Keluar
                    </button>
                </div>
            </div>
            
            {/* ========== MAIN CONTENT ========== */}
            <div id="page-content-wrapper" className="w-100 bg-light">
                {/* Top Navbar */}
                <nav className="navbar navbar-light bg-white border-bottom px-4 py-3">
                    <div className="container-fluid d-flex justify-content-between align-items-center p-0">
                        <button className="btn btn-light d-lg-none" id="sidebarToggle" onClick={() => document.getElementById('wrapper').classList.toggle('toggled')}><i className="fa-solid fa-bars"></i></button>
                        <div className="d-none d-md-block">
                            <span className="badge bg-primary-light text-primary py-2 px-3 rounded-pill fw-semibold">
                                <i className="fa-solid fa-building me-2"></i>Aktor: Industri (DUDI)
                            </span>
                        </div>
                        <div className="d-flex align-items-center gap-3">
                            <NotificationDropdown />
                            <div className="profile-avatar bg-primary text-white fw-bold d-flex align-items-center justify-content-center rounded-circle border border-primary shadow-sm" style={{width:'36px', height:'36px'}}>{user?.profile?.company_name?.substring(0,2).toUpperCase() || 'CP'}</div>
                            <span className="fw-semibold d-none d-md-block text-dark small">{user?.profile?.company_name || 'Company Name'}</span>
                        </div>
                    </div>
                </nav>
                
                {/* ========== TAB CONTENT ========== */}
                <div className="container-fluid px-4 py-4 tab-content">
                    
                    {/* ===== TAB 1: RINGKASAN MITRA ===== */}
                    {activeTab === 'dashboard' && (
                        <div className="tab-pane fade show active">
                            <div className="mb-4">
                                <h4 className="fw-bold mb-1">Ringkasan Industri</h4>
                                <p className="text-muted small mb-0">Pantau performa rekrutmen magang dan aktivitas siswa di perusahaan Anda.</p>
                            </div>

                            {/* Stats Cards */}
                            <div className="row g-4 mb-4">
                                <div className="col-12">
                                    <div className="card border-0 shadow-sm rounded-4 mb-0 overflow-hidden">
                                        <div className="profile-banner"></div>
                                        <div className="card-body p-4 p-md-5 position-relative z-1">
                                            <div className="d-flex flex-column flex-md-row align-items-center gap-4">
                                                <div className="avatar-xl bg-white text-primary fw-bold d-flex align-items-center justify-content-center rounded-circle shadow border border-4 border-white" style={{width: '100px', height: '100px', fontSize: '2rem'}}>
                                                    {user?.profile?.company_name?.substring(0,2).toUpperCase() || 'CP'}
                                                </div>
                                                <div className="text-center text-md-start text-dark">
                                                    <h2 className="fw-bold mb-1">{user?.profile?.company_name || 'Company Name'}</h2>
                                                    <p className="mb-2 text-muted"><i className="fa-solid fa-industry me-2"></i>Teknologi Informasi &bull; {user?.email}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-3 col-sm-6">
                                    <div className="card border-0 shadow-sm rounded-4 h-100 bg-white">
                                        <div className="card-body p-4 d-flex align-items-center">
                                            <div className="bg-success-light text-success rounded-circle d-flex align-items-center justify-content-center me-3" style={{width: '50px', height: '50px'}}>
                                                <i className="fa-solid fa-users-gears fs-4"></i>
                                            </div>
                                            <div>
                                                <h3 className="fw-bold mb-0 text-dark">{applications.filter(a => a.status === 'Accepted').length}</h3>
                                                <span className="text-muted small">Siswa Magang Aktif</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-3 col-sm-6">
                                    <div className="card border-0 shadow-sm rounded-4 h-100 bg-white">
                                        <div className="card-body p-4 d-flex align-items-center">
                                            <div className="bg-warning-light text-warning rounded-circle d-flex align-items-center justify-content-center me-3" style={{width: '50px', height: '50px'}}>
                                                <i className="fa-solid fa-clock-rotate-left fs-4"></i>
                                            </div>
                                            <div>
                                                <h3 className="fw-bold mb-0 text-dark">{applications.filter(a => a.status === 'Pending Review').length}</h3>
                                                <span className="text-muted small">Lamaran Menunggu</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-3 col-sm-6">
                                    <div className="card border-0 shadow-sm rounded-4 h-100 bg-white">
                                        <div className="card-body p-4 d-flex align-items-center">
                                            <div className="bg-primary-light text-primary rounded-circle d-flex align-items-center justify-content-center me-3" style={{width: '50px', height: '50px'}}>
                                                <i className="fa-solid fa-briefcase fs-4"></i>
                                            </div>
                                            <div>
                                                <h3 className="fw-bold mb-0 text-dark">{vacancies.length}</h3>
                                                <span className="text-muted small">Lowongan Terbuka</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-3 col-sm-6">
                                    <div className="card border-0 shadow-sm rounded-4 h-100 bg-white">
                                        <div className="card-body p-4 d-flex align-items-center">
                                            <div className="bg-teal-light text-teal rounded-circle d-flex align-items-center justify-content-center me-3" style={{width: '50px', height: '50px'}}>
                                                <i className="fa-solid fa-bolt fs-4"></i>
                                            </div>
                                            <div>
                                                <h3 className="fw-bold mb-0 text-dark">{applications.length > 0 ? Math.round(applications.reduce((acc, a) => acc + (a.match_rate || 0), 0) / applications.length) : 0}%</h3>
                                                <span className="text-muted small">Avg. Match Rate</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Extended Dashboard Information */}
                            <div className="row g-4">
                                <div className="col-lg-8">
                                    <div className="card border-0 shadow-sm rounded-4 h-100 bg-white">
                                        <div className="card-header bg-white border-0 pt-4 px-4 pb-0">
                                            <h6 className="fw-bold mb-0">Lamaran Masuk Terbaru</h6>
                                        </div>
                                        <div className="card-body p-4">
                                            {applications.slice(0, 5).length > 0 ? (
                                                <div className="table-responsive">
                                                    <table className="table table-borderless align-middle mb-0">
                                                        <tbody>
                                                            {applications.slice(0, 5).map(app => (
                                                                <tr key={app.id} className="border-bottom">
                                                                    <td className="py-3">
                                                                        <div className="d-flex align-items-center gap-3">
                                                                            <div className="avatar-sm bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center fw-bold" style={{width:'40px', height:'40px'}}>
                                                                                {app.user?.name?.substring(0,2).toUpperCase()}
                                                                            </div>
                                                                            <div>
                                                                                <h6 className="mb-0 fw-bold">{app.user?.name}</h6>
                                                                                <small className="text-muted">{app.vacancy?.title}</small>
                                                                            </div>
                                                                        </div>
                                                                    </td>
                                                                    <td className="py-3 text-end">
                                                                        <span className={`badge border px-2 py-1 ${app.status === 'Accepted' ? 'bg-success bg-opacity-10 text-success border-success' : app.status === 'Rejected' ? 'bg-danger bg-opacity-10 text-danger border-danger' : 'bg-warning bg-opacity-10 text-warning border-warning'}`}>
                                                                            {app.status}
                                                                        </span>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            ) : (
                                                <div className="text-center py-4 text-muted small">Belum ada lamaran masuk.</div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="col-lg-4">
                                    <div className="card border-0 shadow-sm rounded-4 h-100 bg-white">
                                        <div className="card-header bg-white border-0 pt-4 px-4 pb-0">
                                            <h6 className="fw-bold mb-0">Kebutuhan Skill Teratas</h6>
                                        </div>
                                        <div className="card-body p-4 text-center d-flex flex-column justify-content-center">
                                            <div className="mb-3">
                                                <div className="d-flex justify-content-between mb-1">
                                                    <span className="small fw-semibold">React</span>
                                                    <span className="small text-muted fw-bold">Diminta di 80% Lowongan</span>
                                                </div>
                                                <div className="progress" style={{height: '6px'}}>
                                                    <div className="progress-bar bg-primary" style={{width: '80%'}}></div>
                                                </div>
                                            </div>
                                            <div className="mb-3">
                                                <div className="d-flex justify-content-between mb-1">
                                                    <span className="small fw-semibold">Laravel</span>
                                                    <span className="small text-muted fw-bold">Diminta di 65% Lowongan</span>
                                                </div>
                                                <div className="progress" style={{height: '6px'}}>
                                                    <div className="progress-bar bg-info" style={{width: '65%'}}></div>
                                                </div>
                                            </div>
                                            <div className="mb-0">
                                                <div className="d-flex justify-content-between mb-1">
                                                    <span className="small fw-semibold">Figma</span>
                                                    <span className="small text-muted fw-bold">Diminta di 40% Lowongan</span>
                                                </div>
                                                <div className="progress" style={{height: '6px'}}>
                                                    <div className="progress-bar bg-success" style={{width: '40%'}}></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ===== TAB 2: LOWONGAN SAYA ===== */}
                    {activeTab === 'lowongan' && (
                        <div className="tab-pane fade show active">
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <div>
                                    <h4 className="fw-bold mb-1">Lowongan Saya</h4>
                                    <p className="text-muted small mb-0">Kelola posisi magang yang sedang dibuka di perusahaan Anda.</p>
                                </div>
                                <button className="btn btn-primary fw-semibold rounded-pill px-4" data-bs-toggle="modal" data-bs-target="#modalTambahLowongan"><i className="fa-solid fa-plus me-2"></i>Buat Lowongan Baru</button>
                            </div>
                            
                            <div className="row g-4">
                                {vacancies.length === 0 ? (
                                    <div className="col-12 text-center py-5">
                                        <div className="text-muted mb-2"><i className="fa-solid fa-briefcase fs-1 opacity-50"></i></div>
                                        <p className="text-muted small">Belum ada lowongan magang yang dibuka.</p>
                                    </div>
                                ) : vacancies.map(vacancy => (
                                <div className="col-md-6 col-lg-4" key={vacancy.id}>
                                    <div className="card border-0 shadow-sm h-100 rounded-4">
                                        <div className="card-body p-4 d-flex flex-column justify-content-between">
                                            <div>
                                                <div className="d-flex justify-content-between align-items-start mb-3">
                                                    <div>
                                                        <h5 className="fw-bold mb-1 text-dark">{vacancy.title}</h5>
                                                        <span className="text-muted extra-small"><i className="fa-solid fa-location-dot me-1"></i> {vacancy.work_mode} ({vacancy.location || '-'}) &bull; Kuota: {vacancy.quota} Siswa</span>
                                                    </div>
                                                    <span className={`badge px-2 py-1 border ${vacancy.status === 'open' ? 'bg-success bg-opacity-10 text-success border-success' : 'bg-secondary bg-opacity-10 text-secondary border-secondary'}`}>{vacancy.status === 'open' ? 'Open' : 'Closed'}</span>
                                                </div>
                                                <div className="mb-3 d-flex flex-wrap gap-1">
                                                    {vacancy.required_skills && vacancy.required_skills.map((skill, i) => (
                                                        <span key={i} className="badge bg-light text-secondary border mb-1">{skill}</span>
                                                    ))}
                                                </div>
                                                <p className="text-muted small mb-3 text-truncate-3">{vacancy.description || 'Tidak ada deskripsi.'}</p>
                                                <p className="text-muted extra-small mb-3"><i className="fa-solid fa-calendar me-1"></i> Deadline: {vacancy.deadline ? new Date(vacancy.deadline).toLocaleDateString('id-ID') : 'Tanpa batas'}</p>
                                            </div>
                                            <div className="d-flex gap-2 border-top pt-3 mt-auto">
                                                <button onClick={() => handleDeleteVacancy(vacancy.id)} className="btn btn-sm btn-outline-danger flex-grow-1"><i className="fa-solid fa-power-off me-1"></i>Tutup Lowongan</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ===== TAB 3: LAMARAN MASUK ===== */}
                    {activeTab === 'lamaran' && (
                        <div className="tab-pane fade show active">
                            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
                                <div>
                                    <h4 className="fw-bold mb-1">Lamaran Masuk</h4>
                                    <p className="text-muted small mb-0">Tinjau pelamar magang yang masuk berdasarkan kecocokan AI dan validasi sekolah.</p>
                                </div>
                            </div>
                            
                            <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                                <div className="card-body p-0">
                                    <div className="table-responsive">
                                        <table className="table table-hover mb-0 align-middle">
                                            <thead className="table-light text-muted small">
                                                <tr>
                                                    <th className="py-3 ps-4 border-0">Nama Pelamar</th>
                                                    <th className="py-3 border-0">Posisi Dilamar</th>
                                                    <th className="py-3 border-0">Finetern Match Rate</th>
                                                    <th className="py-3 border-0">Status</th>
                                                    <th className="py-3 text-end pe-4 border-0">Aksi</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {applications.length === 0 ? (
                                                    <tr>
                                                        <td colSpan="5" className="text-center py-4 text-muted">Belum ada lamaran masuk.</td>
                                                    </tr>
                                                ) : applications.map(app => (
                                                    <tr key={app.id}>
                                                        <td className="py-3 ps-4">
                                                            <p className="fw-bold mb-0 text-dark">{app.user?.name}</p>
                                                            <span className="text-muted extra-small">{app.user?.profile?.school || 'Sekolah Belum Diatur'} ({app.user?.profile?.department || 'Siswa SMK'})</span>
                                                        </td>
                                                        <td className="py-3 text-muted small">{app.vacancy?.title}</td>
                                                        <td className="py-3"><span className="badge bg-success bg-opacity-10 text-success fw-bold"><i className="fa-solid fa-bolt me-1"></i>{app.match_rate ?? 'N/A'}% Match</span></td>
                                                        <td className="py-3"><span className={`badge bg-opacity-10 border px-2 py-1 ${app.status === 'Accepted' ? 'bg-success text-success border-success' : app.status === 'Rejected' ? 'bg-danger text-danger border-danger' : 'bg-warning text-dark border-warning'}`}>{app.status}</span></td>
                                                        <td className="py-3 text-end pe-4">
                                                            {app.status === 'Accepted' ? (
                                                                <button className="btn btn-sm btn-outline-success rounded-pill px-3" onClick={() => handleOpenJournal(app.id)}>Tinjau Jurnal</button>
                                                            ) : (
                                                                <button className="btn btn-sm btn-primary rounded-pill px-3" onClick={() => setSelectedApplication(app)} data-bs-toggle="modal" data-bs-target="#modalReviewApplication">Review Detail</button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div> 
            </div> 
        </div> 

        {/* Modal Tambah Lowongan */}
        <div className="modal fade" id="modalTambahLowongan" tabIndex="-1" aria-hidden="true">
            <div className="modal-dialog modal-dialog-centered modal-lg">
                <div className="modal-content rounded-4 border-0 shadow">
                    <div className="modal-header border-bottom-0 pb-0">
                        <h5 className="modal-title fw-bold">Buat Lowongan Baru</h5>
                        <button type="button" className="btn-close" id="btnCloseVacancyModal" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <form onSubmit={handleAddVacancy}>
                        <div className="modal-body row g-3">
                            <div className="col-md-6">
                                <label className="form-label small fw-semibold">Judul Posisi *</label>
                                <input type="text" className="form-control" placeholder="Contoh: Frontend Developer Intern" required value={newVacancy.title} onChange={e => setNewVacancy({...newVacancy, title: e.target.value})} />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label small fw-semibold">Kategori Pekerjaan</label>
                                <select className="form-select" value={newVacancy.category} onChange={e => setNewVacancy({...newVacancy, category: e.target.value})}>
                                    <option value="Technology">Technology</option>
                                    <option value="Design">Design</option>
                                    <option value="Marketing">Marketing</option>
                                    <option value="Administration">Administration</option>
                                </select>
                            </div>
                            <div className="col-md-4">
                                <label className="form-label small fw-semibold">Mode Kerja *</label>
                                <select className="form-select" value={newVacancy.work_mode} onChange={e => setNewVacancy({...newVacancy, work_mode: e.target.value})}>
                                    <option value="WFO">WFO (Di Kantor)</option>
                                    <option value="WFH">WFH (Remote)</option>
                                    <option value="Hybrid">Hybrid</option>
                                </select>
                            </div>
                            <div className="col-md-4">
                                <label className="form-label small fw-semibold">Kuota Siswa *</label>
                                <input type="number" min="1" className="form-control" required value={newVacancy.quota} onChange={e => setNewVacancy({...newVacancy, quota: e.target.value})} />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label small fw-semibold">Batas Waktu (Deadline)</label>
                                <input type="date" className="form-control" value={newVacancy.deadline} onChange={e => setNewVacancy({...newVacancy, deadline: e.target.value})} />
                            </div>
                            <div className="col-md-12">
                                <label className="form-label small fw-semibold">Lokasi / Kota</label>
                                <input type="text" className="form-control" placeholder="Contoh: Jakarta Selatan" value={newVacancy.location} onChange={e => setNewVacancy({...newVacancy, location: e.target.value})} />
                            </div>
                            <div className="col-md-12">
                                <label className="form-label small fw-semibold">Persyaratan Skill (Pisahkan dengan koma) *</label>
                                <input type="text" className="form-control" placeholder="Contoh: React, JavaScript, HTML" required value={newVacancy.required_skills} onChange={e => setNewVacancy({...newVacancy, required_skills: e.target.value})} />
                            </div>
                            <div className="col-md-12">
                                <label className="form-label small fw-semibold">Deskripsi Pekerjaan *</label>
                                <textarea className="form-control" rows="4" placeholder="Jelaskan detail pekerjaan, tanggung jawab, dsb." required value={newVacancy.description} onChange={e => setNewVacancy({...newVacancy, description: e.target.value})}></textarea>
                            </div>
                        </div>
                        <div className="modal-footer border-top-0 pt-0">
                            <button type="button" className="btn btn-light" data-bs-dismiss="modal">Batal</button>
                            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>{isSubmitting ? 'Menyimpan...' : 'Terbitkan Lowongan'}</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>

        {/* Modal Tinjau Jurnal Industri */}
        <div className="modal fade" id="modalJurnalIndustry" tabIndex="-1" aria-hidden="true">
            <div className="modal-dialog modal-dialog-centered modal-lg">
                <div className="modal-content rounded-4 border-0 shadow">
                    <div className="modal-header border-bottom-0 pb-0">
                        <h5 className="modal-title fw-bold">Tinjauan Jurnal Magang Siswa</h5>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div className="modal-body py-4">
                        <div className="list-group list-group-flush">
                            {journals.length === 0 ? (
                                <div className="text-center py-5 text-muted small">Belum ada jurnal yang diserahkan oleh siswa ini.</div>
                            ) : journals.map(journal => (
                                <div key={journal.id} className="list-group-item px-0 py-3 border-bottom">
                                    <div className="d-flex justify-content-between mb-2">
                                        <span className="fw-bold">{new Date(journal.date).toLocaleDateString('id-ID')} <span className="fw-normal text-muted small ms-2">({journal.hours} Jam Kerja)</span></span>
                                        <span className={`badge ${journal.status === 'Approved' ? 'bg-success' : journal.status === 'Rejected' ? 'bg-danger' : 'bg-warning text-dark'} bg-opacity-10 border border-${journal.status === 'Approved' ? 'success' : journal.status === 'Rejected' ? 'danger' : 'warning'}`}>
                                            {journal.status}
                                        </span>
                                    </div>
                                    <div className="bg-light p-3 rounded mb-3 small">
                                        {journal.activity}
                                    </div>
                                    {journal.status === 'Pending' && (
                                        <div className="d-flex gap-2">
                                            <button className="btn btn-sm btn-success" onClick={() => handleUpdateJournalStatus(journal.id, 'Approved')}>Setujui Jurnal</button>
                                            <button className="btn btn-sm btn-outline-danger" onClick={() => handleUpdateJournalStatus(journal.id, 'Rejected')}>Tolak Jurnal</button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>

            {/* Modal Review Application */}
            <div className="modal fade" id="modalReviewApplication" tabIndex="-1">
                <div className="modal-dialog modal-dialog-centered modal-lg">
                    <div className="modal-content border-0 shadow">
                        <div className="modal-header border-bottom-0 pb-0">
                            <h5 className="fw-bold"><i className="fa-solid fa-clipboard-user text-primary me-2"></i>Review Profil Pelamar</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" id="btnCloseReviewModal"></button>
                        </div>
                        <div className="modal-body py-4">
                            {selectedApplication ? (
                                <div className="row g-4">
                                    <div className="col-md-12">
                                        <div className="d-flex align-items-center gap-3">
                                            <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold fs-4" style={{width: '60px', height: '60px'}}>{selectedApplication.user?.name?.substring(0,2).toUpperCase()}</div>
                                            <div>
                                                <h4 className="fw-bold mb-1">{selectedApplication.user?.name}</h4>
                                                <div className="text-muted small">{selectedApplication.user?.profile?.school} &bull; {selectedApplication.user?.profile?.department}</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-12">
                                        <p className="mb-0 bg-light p-3 rounded text-dark small">{selectedApplication.user?.profile?.bio || 'Siswa ini belum menuliskan bio singkat.'}</p>
                                    </div>
                                    <div className="col-md-6">
                                        <h6 className="fw-bold mb-3">Informasi Kontak</h6>
                                        <div className="small mb-2"><i className="fa-regular fa-envelope text-muted me-2"></i>{selectedApplication.user?.email}</div>
                                        <div className="small mb-2"><i className="fa-solid fa-phone text-muted me-2"></i>{selectedApplication.user?.profile?.phone || '-'}</div>
                                    </div>
                                    <div className="col-md-6">
                                        <h6 className="fw-bold mb-3">Dokumen Pelamar</h6>
                                        {selectedApplication.user?.profile?.cv_path ? (
                                            <a href={`http://localhost:8000/storage/${selectedApplication.user.profile.cv_path}`} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-primary"><i className="fa-solid fa-file-pdf me-2"></i>Unduh / Lihat CV PDF</a>
                                        ) : (
                                            <div className="text-muted small"><i className="fa-solid fa-circle-xmark me-1 text-danger"></i>Belum mengunggah CV</div>
                                        )}
                                    </div>
                                    <div className="col-md-12">
                                        <h6 className="fw-bold mb-3">Skill Tersertifikasi (Sekolah)</h6>
                                        <div className="d-flex flex-wrap gap-2 mb-3">
                                            {selectedApplication.user?.skills?.filter(s => s.is_validated).length > 0 ? selectedApplication.user.skills.filter(s => s.is_validated).map(skill => (
                                                <span key={skill.id} className="badge bg-success-light text-success border border-success px-2 py-1"><i className="fa-solid fa-check-circle me-1"></i>{skill.name} ({skill.proficiency})</span>
                                            )) : <span className="text-muted small">Belum ada skill yang divalidasi sekolah.</span>}
                                        </div>
                                    </div>
                                    <div className="col-md-12">
                                        <div className="bg-primary bg-opacity-10 border border-primary border-opacity-25 rounded-4 p-4 position-relative">
                                            <div className="position-absolute top-0 start-0 translate-middle ms-4 mt-1 bg-white rounded-circle p-1 shadow-sm">
                                                <div className="bg-gradient-brand text-white rounded-circle d-flex align-items-center justify-content-center" style={{width: '32px', height: '32px'}}>
                                                    <i className="fa-solid fa-robot small"></i>
                                                </div>
                                            </div>
                                            <div className="d-flex justify-content-between align-items-start mb-2 pt-2">
                                                <h6 className="fw-bold text-dark-blue mb-0">AI Matchmaker Insight</h6>
                                                <span className="badge bg-primary text-white fw-bold"><i className="fa-solid fa-bolt text-warning me-1"></i>{selectedApplication.match_rate}% Match</span>
                                            </div>
                                            <p className="text-dark small mb-0 lh-lg">{selectedApplication.ai_analysis || 'AI sedang memproses data...'}</p>
                                        </div>
                                    </div>
                                </div>
                            ) : <div className="text-center py-5"><div className="spinner-border text-primary" role="status"></div></div>}
                        </div>
                        <div className="modal-footer bg-light border-top-0">
                            {selectedApplication && selectedApplication.status !== 'Accepted' && selectedApplication.status !== 'Rejected' && (
                                <>
                                    <button type="button" className="btn btn-outline-danger" onClick={() => handleUpdateApplicationStatus(selectedApplication.id, 'Rejected')}><i className="fa-solid fa-xmark me-2"></i>Tolak Pelamar</button>
                                    <button type="button" className="btn btn-success px-4" onClick={() => handleUpdateApplicationStatus(selectedApplication.id, 'Accepted')}><i className="fa-solid fa-check me-2"></i>Terima Pelamar</button>
                                </>
                            )}
                            {selectedApplication && (selectedApplication.status === 'Accepted' || selectedApplication.status === 'Rejected') && (
                                <div className="text-muted small fw-semibold">Lamaran ini sudah {selectedApplication.status === 'Accepted' ? 'Diterima' : 'Ditolak'}.</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default IndustryDashboard;
