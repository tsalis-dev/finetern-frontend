import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axiosInstance from '../api/axios';
import NotificationDropdown from '../components/NotificationDropdown';

const SchoolDashboard = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    // Data State
    const [students, setStudents] = useState([]);
    const [aiAnalysis, setAiAnalysis] = useState(null);
    const [isLoadingAi, setIsLoadingAi] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [analytics, setAnalytics] = useState(null);

    // Journal State
    const [journals, setJournals] = useState([]);
    const handleOpenJournal = async (appId) => {
        try {
            const res = await axiosInstance.get(`/journals?application_id=${appId}`);
            setJournals(res.data);
            const modal = new window.bootstrap.Modal(document.getElementById('modalJurnalSchool'));
            modal.show();
        } catch (error) {
            console.error("Error fetching journals", error);
        }
    };

    const fetchSkillGap = async () => {
        setIsLoadingAi(true);
        try {
            const res = await axiosInstance.get('/schools/skill-gap');
            setAiAnalysis(res.data);
        } catch (error) {
            console.error("Error fetching AI analysis", error);
        } finally {
            setIsLoadingAi(false);
        }
    };

    const fetchStudents = async () => {
        try {
            const schoolName = user?.profile?.school || '';
            const res = await axiosInstance.get(`/students?school=${encodeURIComponent(schoolName)}`);
            setStudents(res.data);
        } catch (error) {
            console.error("Error fetching students", error);
        }
    };

    const fetchAnalytics = async () => {
        try {
            const res = await axiosInstance.get('/analytics');
            setAnalytics(res.data);
        } catch (error) {
            console.error("Error fetching analytics", error);
        }
    };

    useEffect(() => {
        if (activeTab === 'siswa' || activeTab === 'validasi' || activeTab === 'dashboard' || activeTab === 'monitoring' || activeTab === 'tinjauan_skill') fetchStudents();
        if (activeTab === 'adaptasi_kurikulum') fetchSkillGap();
        if (activeTab === 'dashboard') {
            fetchStudents();
            fetchAnalytics();
        }
    }, [activeTab]);


    const handleValidateSkill = async (skillId) => {
        try {
            await axiosInstance.put(`/skills/${skillId}`, { is_validated: true });
            alert("Skill berhasil divalidasi!");
            fetchStudents(); // Refresh the list
        } catch (error) {
            console.error("Error validating skill", error);
            alert("Gagal memvalidasi skill.");
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
                    <i className="fa-solid fa-layer-group me-2 text-success fs-4"></i>
                    <strong className="fs-4">Finetern<span className="text-teal">.</span></strong>
                </div>
                
                <div className="nav flex-column nav-pills list-group list-group-flush px-3 py-4 gap-2">
                    <button 
                        className={`nav-link text-start py-3 rounded-3 ${activeTab === 'dashboard' ? 'active' : ''}`} 
                        onClick={() => setActiveTab('dashboard')}
                    >
                        <i className="fa-solid fa-chart-pie me-3 w-20"></i>Ringkasan Utama
                    </button>
                    
                    <button 
                        className={`nav-link text-start py-3 rounded-3 ${activeTab === 'siswa' ? 'active' : ''}`} 
                        onClick={() => setActiveTab('siswa')}
                    >
                        <i className="fa-solid fa-users me-3 w-20"></i>Direktori Siswa
                    </button>
                    
                    <button 
                        className={`nav-link text-start py-3 rounded-3 position-relative ${activeTab === 'validasi' ? 'active' : ''}`} 
                        onClick={() => setActiveTab('validasi')}
                    >
                        <i className="fa-solid fa-clipboard-check me-3 w-20"></i>Validasi Kompetensi
                        {students.reduce((acc, s) => acc + (s.skills ? s.skills.filter(sk => !sk.is_validated).length : 0), 0) > 0 && <span className="position-absolute top-50 end-0 translate-middle-y me-3 badge rounded-pill bg-danger">{students.reduce((acc, s) => acc + (s.skills ? s.skills.filter(sk => !sk.is_validated).length : 0), 0)}</span>}
                    </button>
                    
                    <button 
                        className={`nav-link text-start py-3 rounded-3 ${activeTab === 'monitoring' ? 'active' : ''}`} 
                        onClick={() => setActiveTab('monitoring')}
                    >
                        <i className="fa-solid fa-chart-line me-3 w-20"></i>Monitoring Magang
                    </button>

                    <div className="text-muted extra-small fw-bold mt-3 mb-2 px-3">ANALITIK & LAPORAN</div>

                    <button 
                        className={`nav-link text-start py-3 rounded-3 ${activeTab === 'tinjauan_skill' ? 'active' : ''}`} 
                        onClick={() => setActiveTab('tinjauan_skill')}
                    >
                        <i className="fa-solid fa-chart-area me-3 w-20"></i>Tinjauan Skill-Gap
                    </button>
                    
                    <button 
                        className={`nav-link text-start py-3 rounded-3 ${activeTab === 'adaptasi_kurikulum' ? 'active' : ''}`} 
                        onClick={() => setActiveTab('adaptasi_kurikulum')}
                    >
                        <i className="fa-solid fa-book-open-reader me-3 w-20 text-success"></i>Adaptasi Kurikulum
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
                            <span className="badge bg-primary-light text-success py-2 px-3 rounded-pill fw-semibold">
                                <i className="fa-solid fa-school me-2"></i>Sekolah (Guru/BKK)
                            </span>
                        </div>
                        <div className="d-flex align-items-center gap-3">
                            <NotificationDropdown />
                            <div className="profile-avatar bg-primary-light text-success fw-bold d-flex align-items-center justify-content-center rounded-circle border border-success" style={{width:'36px', height:'36px'}}>{user?.profile?.school?.substring(0,2).toUpperCase() || 'SK'}</div>
                            <span className="fw-semibold d-none d-md-block text-dark small">{user?.profile?.school || 'Nama Sekolah'}</span>
                        </div>
                    </div>
                </nav>
                
                {/* ========== TAB CONTENT ========== */}
                <div className="container-fluid px-4 py-4 tab-content">
                    
                    {/* ===== TAB 1: RINGKASAN UTAMA ===== */}
                    {activeTab === 'dashboard' && (
                        <div className="tab-pane fade show active">
                            <div className="mb-4">
                                <h4 className="fw-bold mb-1">Dashboard Pemantauan Sekolah</h4>
                                <p className="text-muted small mb-0">Kelola direktori siswa, verifikasi kecakapan kompetensi, dan awasi status magang DUDI.</p>
                            </div>

                            {/* Stats Cards */}
                            <div className="row g-4 mb-4">
                                <div className="col-md-3 col-sm-6">
                                    <div className="card border-0 shadow-sm rounded-4 h-100 bg-white">
                                        <div className="card-body p-4 d-flex align-items-center">
                                            <div className="bg-primary-light text-success rounded-circle d-flex align-items-center justify-content-center me-3" style={{width: '50px', height: '50px'}}>
                                                <i className="fa-solid fa-users fs-4"></i>
                                            </div>
                                            <div>
                                                <h3 className="fw-bold mb-0 text-dark">{students.length}</h3>
                                                <span className="text-muted small">Siswa Terdaftar</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-3 col-sm-6">
                                    <div className="card border-0 shadow-sm rounded-4 h-100 bg-white">
                                        <div className="card-body p-4 d-flex align-items-center">
                                            <div className="bg-blue-light text-blue rounded-circle d-flex align-items-center justify-content-center me-3" style={{width: '50px', height: '50px'}}>
                                                <i className="fa-solid fa-briefcase fs-4"></i>
                                            </div>
                                            <div>
                                                <h3 className="fw-bold mb-0 text-dark">{analytics?.accepted_applications || 0}</h3>
                                                <span className="text-muted small">Siswa Diterima Magang</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-3 col-sm-6">
                                    <div className="card border-0 shadow-sm rounded-4 h-100 bg-white">
                                        <div className="card-body p-4 d-flex align-items-center">
                                            <div className="bg-warning-light text-warning rounded-circle d-flex align-items-center justify-content-center me-3" style={{width: '50px', height: '50px'}}>
                                                <i className="fa-solid fa-clipboard-question fs-4"></i>
                                            </div>
                                            <div>
                                                <h3 className="fw-bold mb-0 text-dark">
                                                    {students.reduce((acc, student) => acc + (student.skills ? student.skills.filter(s => !s.is_validated).length : 0), 0)}
                                                </h3>
                                                <span className="text-muted small">Menunggu Validasi</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-3 col-sm-6">
                                    <div className="card border-0 shadow-sm rounded-4 h-100 bg-white">
                                        <div className="card-body p-4 d-flex align-items-center">
                                            <div className="bg-danger-light text-danger rounded-circle d-flex align-items-center justify-content-center me-3" style={{width: '50px', height: '50px'}}>
                                                <i className="fa-solid fa-handshake fs-4"></i>
                                            </div>
                                            <div>
                                                <h3 className="fw-bold mb-0 text-dark">{analytics?.active_industries || 0}</h3>
                                                <span className="text-muted small">Mitra Industri Aktif</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Extended Information */}
                            <div className="row g-4">
                                <div className="col-lg-8">
                                    <div className="card border-0 shadow-sm rounded-4 h-100 bg-white">
                                        <div className="card-header bg-white border-0 pt-4 px-4 pb-0">
                                            <h6 className="fw-bold mb-0">Aktivitas Lamaran Terkini</h6>
                                        </div>
                                        <div className="card-body p-4">
                                            {analytics?.recent_activities?.length > 0 ? (
                                                <div className="table-responsive">
                                                    <table className="table table-borderless align-middle mb-0">
                                                        <tbody>
                                                            {analytics.recent_activities.map(app => (
                                                                <tr key={app.id} className="border-bottom">
                                                                    <td className="ps-0 py-3">
                                                                        <div className="d-flex align-items-center gap-3">
                                                                            <div className="avatar-sm bg-primary-light text-primary rounded-circle d-flex align-items-center justify-content-center fw-bold" style={{width:'36px', height:'36px'}}>
                                                                                {app.user?.name?.substring(0,2).toUpperCase()}
                                                                            </div>
                                                                            <div>
                                                                                <h6 className="mb-0 fw-bold">{app.user?.name}</h6>
                                                                                <span className="text-muted small">Melamar ke {app.vacancy?.user?.profile?.company_name || 'Perusahaan'}</span>
                                                                            </div>
                                                                        </div>
                                                                    </td>
                                                                    <td className="py-3 text-muted small">{app.vacancy?.title}</td>
                                                                    <td className="py-3 text-end pe-0">
                                                                        <span className={`badge rounded-pill px-3 py-2 ${app.status === 'Accepted' ? 'bg-success bg-opacity-10 text-success' : app.status === 'Rejected' ? 'bg-danger bg-opacity-10 text-danger' : 'bg-warning bg-opacity-10 text-warning'}`}>
                                                                            {app.status === 'Accepted' ? 'Diterima' : app.status === 'Rejected' ? 'Ditolak' : 'Menunggu'}
                                                                        </span>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            ) : (
                                                <div className="text-center py-4 text-muted small">Belum ada aktivitas lamaran magang dari siswa.</div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="col-lg-4">
                                    <div className="card border-0 shadow-sm rounded-4 h-100 bg-white">
                                        <div className="card-header bg-white border-0 pt-4 px-4 pb-0">
                                            <h6 className="fw-bold mb-0">Distribusi Jurusan Siswa</h6>
                                        </div>
                                        <div className="card-body p-4">
                                            {analytics?.departments?.length > 0 ? (
                                                <div className="d-flex flex-column gap-3">
                                                    {analytics.departments.map((dept, idx) => {
                                                        const percentage = analytics.total_students > 0 ? Math.round((dept.total / analytics.total_students) * 100) : 0;
                                                        return (
                                                            <div key={idx}>
                                                                <div className="d-flex justify-content-between mb-1">
                                                                    <span className="small fw-semibold">{dept.department || 'Belum Ditentukan'}</span>
                                                                    <span className="small text-muted">{dept.total} siswa ({percentage}%)</span>
                                                                </div>
                                                                <div className="progress rounded-pill" style={{height: '8px'}}>
                                                                    <div className={`progress-bar bg-${idx % 3 === 0 ? 'primary' : idx % 3 === 1 ? 'success' : 'warning'}`} role="progressbar" style={{width: `${percentage}%`}}></div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <div className="text-center py-4 text-muted small">Data jurusan belum tersedia.</div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ===== TAB 2: DIREKTORI SISWA ===== */}
                    {activeTab === 'siswa' && (
                        <div className="tab-pane fade show active">
                            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
                                <div>
                                    <h4 className="fw-bold mb-1">Direktori Siswa SMK</h4>
                                    <p className="text-muted small mb-0">Cari profil akademik, skill tervalidasi, dan bukti portofolio seluruh siswa terdaftar.</p>
                                </div>
                                <div className="d-flex gap-2 flex-wrap">
                                    <select className="form-select border-0 bg-white shadow-sm w-auto">
                                        <option value="Semua">Semua Jurusan</option>
                                        <option value="Rekayasa Perangkat Lunak">RPL</option>
                                        <option value="Teknik Komputer Jaringan">TKJ</option>
                                    </select>
                                </div>
                            </div>

                            <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                                <div className="card-body p-0">
                                    <div className="table-responsive">
                                        <table className="table table-hover align-middle mb-0">
                                            <thead className="table-light text-muted small">
                                                <tr>
                                                    <th className="py-3 ps-4">Nama Siswa & NISN</th>
                                                    <th className="py-3">Jurusan</th>
                                                    <th className="py-3">Skill Tervalidasi</th>
                                                    <th className="py-3">Status Penempatan</th>
                                                    <th className="py-3 text-end pe-4">Aksi</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {students.length === 0 ? (
                                                    <tr>
                                                        <td colSpan="5" className="text-center py-4 text-muted">Belum ada data siswa terdaftar dari sekolah Anda.</td>
                                                    </tr>
                                                ) : students.map(student => {
                                                    const validatedCount = student.skills ? student.skills.filter(s => s.is_validated).length : 0;
                                                    return (
                                                    <tr key={student.id}>
                                                        <td className="py-3 ps-4">
                                                            <div className="d-flex align-items-center gap-3">
                                                                <div className="avatar-sm bg-success bg-opacity-10 text-success rounded-circle d-flex align-items-center justify-content-center fw-bold" style={{width:'36px', height:'36px'}}>{student.name?.substring(0,2).toUpperCase()}</div>
                                                                <div>
                                                                    <p className="fw-bold mb-0 text-dark">{student.name}</p>
                                                                    <span className="text-muted extra-small">NISN: {student.profile?.nisn || '-'}</span>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="py-3 text-muted small">{student.profile?.department || '-'}</td>
                                                        <td className="py-3 fw-semibold text-center" style={{width: '150px'}}>{validatedCount} Skill tervalidasi</td>
                                                        <td className="py-3">{student.applications && student.applications.some(app => app.status === 'Accepted') 
    ? <span className="badge bg-success bg-opacity-10 text-success">Sedang Magang</span>
    : student.applications && student.applications.some(app => app.status === 'Pending Review')
    ? <span className="badge bg-warning bg-opacity-10 text-warning">Melamar</span>
    : <span className="badge bg-secondary bg-opacity-10 text-secondary">Belum Magang</span>
}</td>
                                                        <td className="py-3 text-end pe-4">
                                                            <button 
                                                                className="btn btn-sm btn-outline-success rounded-pill px-3"
                                                                onClick={() => setSelectedStudent(student)}
                                                                data-bs-toggle="modal" 
                                                                data-bs-target="#studentProfileModal"
                                                            >
                                                                Lihat Profil
                                                            </button>
                                                        </td>
                                                    </tr>
                                                    )
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ===== TAB 3: VALIDASI KOMPETENSI ===== */}
                    {activeTab === 'validasi' && (
                        <div className="tab-pane fade show active">
                            <div className="mb-4">
                                <h4 className="fw-bold mb-1">Validasi Kompetensi Siswa</h4>
                                <p className="text-muted small mb-0">Tinjau nilai mata pelajaran terkait sebelum memvalidasi skill siswa.</p>
                            </div>

                            <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                                <div className="card-body p-0">
                                    <div className="table-responsive">
                                        <table className="table table-hover align-middle mb-0">
                                            <thead className="table-light text-muted small">
                                                <tr>
                                                    <th className="py-3 ps-4">Nama Siswa & Kelas</th>
                                                    <th className="py-3">Kompetensi Diajukan</th>
                                                    <th className="py-3">Tingkatan</th>
                                                    <th className="py-3 text-end pe-4">Aksi Keputusan</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {students.map(student => 
                                                    student.skills && student.skills.filter(s => !s.is_validated).map(skill => (
                                                        <tr key={skill.id}>
                                                            <td className="py-3 ps-4">
                                                                <p className="fw-bold mb-0 text-dark">{student.name}</p>
                                                                <span className="text-muted extra-small">{student.profile?.department || 'Siswa SMK'}</span>
                                                            </td>
                                                            <td className="py-3 fw-semibold text-dark">{skill.name}</td>
                                                            <td className="py-3"><span className="badge bg-primary-light text-primary border border-primary">{skill.proficiency}</span></td>
                                                            <td className="py-3 text-end pe-4">
                                                                <button onClick={() => handleValidateSkill(skill.id)} className="btn btn-sm btn-outline-success rounded px-3">Validasi</button>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                                {students.every(s => !s.skills || s.skills.filter(sk => !sk.is_validated).length === 0) && (
                                                    <tr>
                                                        <td colSpan="4" className="text-center py-4 text-muted">Belum ada skill yang perlu divalidasi.</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ===== TAB 4: MONITORING MAGANG ===== */}
                    {activeTab === 'monitoring' && (
                        <div className="tab-pane fade show active">
                            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
                                <div>
                                    <h4 className="fw-bold mb-1">Monitoring Status Magang Siswa</h4>
                                    <p className="text-muted small mb-0">Pantau kemajuan laporan, lokasi industri, serta catat jurnal bimbingan.</p>
                                </div>
                            </div>

                            <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                                <div className="card-body p-0">
                                    <div className="table-responsive">
                                        <table className="table table-hover align-middle mb-0">
                                            <thead className="table-light text-muted small">
                                                <tr>
                                                    <th className="py-3 ps-4">Nama Siswa</th>
                                                    <th className="py-3">Perusahaan (DUDI) & Posisi</th>
                                                    <th className="py-3">Status</th>
                                                    <th className="py-3 text-end pe-4">Aksi</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {students.flatMap(student => 
                                                    (student.applications || [])
                                                        .filter(app => app.status === 'Accepted')
                                                        .map(app => (
                                                            <tr key={`${student.id}-${app.id}`}>
                                                                <td className="py-3 ps-4">
                                                                    <div className="d-flex align-items-center gap-3">
                                                                        <div className="avatar-sm bg-primary-light text-primary rounded-circle d-flex align-items-center justify-content-center fw-bold" style={{width:'36px', height:'36px'}}>{student.name?.substring(0,2).toUpperCase()}</div>
                                                                        <div>
                                                                            <p className="fw-bold mb-0 text-dark">{student.name}</p>
                                                                            <span className="text-muted extra-small">NISN: {student.profile?.nisn || '-'}</span>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td className="py-3 text-dark">
                                                                    <p className="fw-semibold mb-0">{app.vacancy?.user?.profile?.company_name || 'Perusahaan'}</p>
                                                                    <span className="text-muted small">{app.vacancy?.title}</span>
                                                                </td>
                                                                <td className="py-3">
                                                                    <span className="badge bg-success bg-opacity-10 text-success border border-success">Sedang Magang</span>
                                                                </td>
                                                                <td className="py-3 text-end pe-4">
                                                                    <button 
                                                                        className="btn btn-sm btn-outline-primary rounded px-3" 
                                                                        onClick={() => handleOpenJournal(app.id)}
                                                                    >
                                                                        Lihat Jurnal
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))
                                                )}
                                                {students.every(s => !s.applications || s.applications.filter(a => a.status === 'Accepted').length === 0) && (
                                                    <tr>
                                                        <td colSpan="4" className="text-center py-4 text-muted">Belum ada data siswa yang sedang magang.</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ===== TAB 5: TINJAUAN SKILL GAP ===== */}
                    {activeTab === 'tinjauan_skill' && (
                        <div className="tab-pane fade show active">
                            <div className="mb-4">
                                <h4 className="fw-bold mb-1">Tinjauan Skill-Gap Institusi</h4>
                                <p className="text-muted small mb-0">Visualisasi kesenjangan keterampilan agregat siswa SMK dibandingkan kebutuhan industri aktual.</p>
                            </div>

                            <div className="row g-4">
                                <div className="col-lg-8">
                                    <div className="card border-0 shadow-sm rounded-4 h-100">
                                        <div className="card-header bg-white border-bottom p-4">
                                            <h6 className="fw-bold mb-0 text-dark"><i className="fa-solid fa-chart-bar me-2 text-success"></i>Skill-Gap Analytics (SMK vs Industri)</h6>
                                        </div>
                                        <div className="card-body p-4 d-flex align-items-end justify-content-around" style={{height: '250px'}}>
                                            {/* Dummy Bar Chart */}
                                            <div className="d-flex flex-column align-items-center h-100 justify-content-end">
                                                <div className="d-flex align-items-end gap-1 mb-2 h-100">
                                                    <div className="bg-success rounded-top" style={{width: '20px', height: '85%'}}></div>
                                                    <div className="bg-light border rounded-top" style={{width: '20px', height: '90%'}}></div>
                                                </div>
                                                <span className="extra-small text-muted fw-semibold">React</span>
                                            </div>
                                            <div className="d-flex flex-column align-items-center h-100 justify-content-end">
                                                <div className="d-flex align-items-end gap-1 mb-2 h-100">
                                                    <div className="bg-success rounded-top" style={{width: '20px', height: '60%'}}></div>
                                                    <div className="bg-light border rounded-top" style={{width: '20px', height: '80%'}}></div>
                                                </div>
                                                <span className="extra-small text-muted fw-semibold">Node.js</span>
                                            </div>
                                            <div className="d-flex flex-column align-items-center h-100 justify-content-end">
                                                <div className="d-flex align-items-end gap-1 mb-2 h-100">
                                                    <div className="bg-success rounded-top" style={{width: '20px', height: '70%'}}></div>
                                                    <div className="bg-light border rounded-top" style={{width: '20px', height: '50%'}}></div>
                                                </div>
                                                <span className="extra-small text-muted fw-semibold">PHP</span>
                                            </div>
                                            <div className="d-flex flex-column align-items-center h-100 justify-content-end">
                                                <div className="d-flex align-items-end gap-1 mb-2 h-100">
                                                    <div className="bg-success rounded-top" style={{width: '20px', height: '40%'}}></div>
                                                    <div className="bg-light border rounded-top" style={{width: '20px', height: '85%'}}></div>
                                                </div>
                                                <span className="extra-small text-muted fw-semibold">Figma</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-lg-4">
                                    <div className="card border-0 shadow-sm rounded-4 h-100">
                                        <div className="card-header bg-white border-bottom p-4">
                                            <h6 className="fw-bold mb-0 text-dark">Status Penempatan</h6>
                                        </div>
                                        <div className="card-body p-4 text-center">
                                            <div className="position-relative d-inline-block mb-4 mt-2">
                                                <svg width="120" height="60" viewBox="0 0 36 18">
                                                    <path d="M 2 18 A 16 16 0 0 1 34 18" fill="none" stroke="#eee" strokeWidth="4" />
                                                    <path d="M 2 18 A 16 16 0 0 1 34 18" fill="none" stroke="#059669" strokeWidth="4" strokeDasharray="37.7 50" />
                                                </svg>
                                                <h3 className="fw-bold text-dark mt-2 mb-0">75%</h3>
                                            </div>
                                            <div className="d-flex justify-content-between small text-muted mb-2">
                                                <span><i className="fa-solid fa-circle text-success me-1"></i>Diterima Industri</span>
                                                <span className="fw-bold">75%</span>
                                            </div>
                                            <div className="d-flex justify-content-between small text-muted mb-2">
                                                <span><i className="fa-solid fa-circle text-warning me-1"></i>Dalam Proses</span>
                                                <span className="fw-bold">15%</span>
                                            </div>
                                            <div className="d-flex justify-content-between small text-muted">
                                                <span><i className="fa-solid fa-circle text-danger me-1"></i>Belum Diterima</span>
                                                <span className="fw-bold">10%</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ===== TAB 6: ADAPTASI KURIKULUM ===== */}
                    {activeTab === 'adaptasi_kurikulum' && (
                        <div className="tab-pane fade show active">
                            <div className="mb-4">
                                <h4 className="fw-bold mb-1"><i className="fa-solid fa-wand-magic-sparkles text-primary me-2"></i>Adaptasi Kurikulum Berbasis AI</h4>
                                <p className="text-muted small mb-0">Rekomendasi adaptasi kurikulum berdasarkan analitik kesenjangan keterampilan (Skill-Gap) riil dari industri.</p>
                            </div>

                            {isLoadingAi ? (
                                <div className="text-center py-5">
                                    <div className="spinner-border text-primary mb-3" role="status"></div>
                                    <p className="text-muted">AI sedang menganalisis data keterampilan...</p>
                                </div>
                            ) : aiAnalysis ? (
                                <div className="row g-4">
                                    <div className="col-lg-4">
                                        <div className="card border-0 shadow-sm rounded-4 h-100 bg-primary bg-opacity-10 border border-primary border-opacity-25">
                                            <div className="card-body p-4 text-center d-flex flex-column justify-content-center">
                                                <h6 className="fw-bold text-dark-blue mb-3">Overall Gap Score</h6>
                                                <div className="display-3 fw-bold text-primary mb-2">{aiAnalysis.overall_gap_score}<span className="fs-4 text-muted">/100</span></div>
                                                <p className="small text-muted mb-0">{aiAnalysis.overall_gap_score >= 80 ? 'Keterampilan siswa sangat selaras dengan industri.' : aiAnalysis.overall_gap_score >= 50 ? 'Diperlukan beberapa adaptasi kurikulum.' : 'Kesenjangan sangat tinggi. Kurikulum perlu dirombak.'}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-lg-8">
                                        <div className="card border-0 shadow-sm rounded-4 h-100">
                                            <div className="card-body p-4">
                                                <h6 className="fw-bold mb-3 text-dark"><i className="fa-solid fa-triangle-exclamation text-warning me-2"></i>Top Missing Skills di Sekolah Anda</h6>
                                                <div className="d-flex flex-wrap gap-2 mb-4">
                                                    {aiAnalysis.top_missing_skills?.map((skill, idx) => (
                                                        <span key={idx} className="badge bg-danger-light text-danger border border-danger px-3 py-2"><i className="fa-solid fa-xmark me-2"></i>{skill}</span>
                                                    ))}
                                                </div>
                                                <h6 className="fw-bold mb-3 text-dark"><i className="fa-solid fa-lightbulb text-success me-2"></i>Rekomendasi AI untuk Kurikulum</h6>
                                                <ul className="list-group list-group-flush">
                                                    {aiAnalysis.recommendations?.map((rec, idx) => (
                                                        <li key={idx} className="list-group-item px-0 py-2 text-dark small bg-transparent border-bottom-0 mb-1">
                                                            <i className="fa-solid fa-check text-primary me-2"></i>{rec}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="alert alert-warning">Gagal memuat analisis AI.</div>
                            )}
                        </div>
                    )}
                </div> 
            </div> 
        </div> 

        {/* Modal Profil Siswa - Moved outside of flex container to prevent backdrop issues */}
        <div className="modal fade" id="studentProfileModal" tabIndex="-1" aria-labelledby="studentProfileModalLabel" aria-hidden="true">
            <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
                <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                    {selectedStudent ? (
                        <>
                            <div className="modal-header bg-light border-0 px-4 py-3">
                                <div className="d-flex align-items-center gap-3">
                                    <div className="avatar-lg bg-success bg-opacity-10 text-success rounded-circle d-flex align-items-center justify-content-center fw-bold fs-3" style={{width:'60px', height:'60px'}}>
                                        {selectedStudent.name?.substring(0,2).toUpperCase()}
                                    </div>
                                    <div>
                                        <h5 className="modal-title fw-bold mb-0" id="studentProfileModalLabel">{selectedStudent.name}</h5>
                                        <span className="text-muted small">{selectedStudent.profile?.department || 'Jurusan Belum Ditentukan'} &bull; {selectedStudent.profile?.school}</span>
                                    </div>
                                </div>
                                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div className="modal-body p-4 bg-white">
                                <div className="mb-4">
                                    <h6 className="fw-bold text-dark mb-2 border-bottom pb-2">Informasi Pribadi</h6>
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <p className="small text-muted mb-1">Email</p>
                                            <p className="fw-semibold mb-0">{selectedStudent.email}</p>
                                        </div>
                                        <div className="col-md-6">
                                            <p className="small text-muted mb-1">Telepon</p>
                                            <p className="fw-semibold mb-0">{selectedStudent.profile?.phone || '-'}</p>
                                        </div>
                                        <div className="col-md-6">
                                            <p className="small text-muted mb-1">NISN</p>
                                            <p className="fw-semibold mb-0">{selectedStudent.profile?.nisn || '-'}</p>
                                        </div>
                                        <div className="col-md-6">
                                            <p className="small text-muted mb-1">Jenis Kelamin</p>
                                            <p className="fw-semibold mb-0">{selectedStudent.profile?.gender || '-'}</p>
                                        </div>
                                        <div className="col-12">
                                            <p className="small text-muted mb-1">Bio / Tentang Saya</p>
                                            <p className="small mb-0 text-dark bg-light p-3 rounded">{selectedStudent.profile?.bio || 'Belum ada bio'}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <h6 className="fw-bold text-dark mb-3 border-bottom pb-2 d-flex justify-content-between align-items-center">
                                        <span>Kompetensi & Keahlian</span>
                                    </h6>
                                    {selectedStudent.skills && selectedStudent.skills.length > 0 ? (
                                        <div className="d-flex flex-wrap gap-2">
                                            {selectedStudent.skills.map(skill => (
                                                <span key={skill.id} className={`badge rounded-pill py-2 px-3 fw-normal ${skill.is_validated ? 'bg-success bg-opacity-10 text-success border border-success' : 'bg-light text-dark border'}`}>
                                                    {skill.name} <span className="opacity-50 ms-1">({skill.proficiency})</span>
                                                    {skill.is_validated && <i className="fa-solid fa-circle-check ms-2 text-success"></i>}
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-muted small">Siswa ini belum menambahkan kompetensi.</div>
                                    )}
                                </div>

                                <div>
                                    <h6 className="fw-bold text-dark mb-3 border-bottom pb-2">Portofolio Project</h6>
                                    {selectedStudent.portfolios && selectedStudent.portfolios.length > 0 ? (
                                        <div className="row g-3">
                                            {selectedStudent.portfolios.map(porto => (
                                                <div className="col-md-6" key={porto.id}>
                                                    <div className="card border h-100 shadow-sm rounded-3">
                                                        <div className="card-body p-3">
                                                            <h6 className="fw-bold text-dark mb-1">{porto.title}</h6>
                                                            <p className="text-muted small mb-2 text-truncate">{porto.description}</p>
                                                            {porto.url && (
                                                                <a href={porto.url} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-primary rounded-pill mt-auto">
                                                                    <i className="fa-solid fa-arrow-up-right-from-square me-1"></i> Buka Tautan
                                                                </a>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-muted small">Belum ada portofolio yang diunggah.</div>
                                    )}
                                </div>
                            </div>
                            <div className="modal-footer bg-light border-0">
                                <button type="button" className="btn btn-secondary rounded-pill px-4" data-bs-dismiss="modal">Tutup</button>
                            </div>
                        </>
                    ) : (
                        <div className="p-5 text-center text-muted">Memuat data...</div>
                    )}
                </div>
            </div>
            </div>

            {/* Modal Tinjau Jurnal Sekolah (Read-Only) */}
            <div className="modal fade" id="modalJurnalSchool" tabIndex="-1" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered modal-lg">
                    <div className="modal-content rounded-4 border-0 shadow">
                        <div className="modal-header border-bottom-0 pb-0">
                            <h5 className="modal-title fw-bold">Riwayat Jurnal Magang Siswa</h5>
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
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default SchoolDashboard;
