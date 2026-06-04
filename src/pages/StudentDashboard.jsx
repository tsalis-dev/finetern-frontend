import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axiosInstance from '../api/axios';
import NotificationDropdown from '../components/NotificationDropdown';

const StudentDashboard = () => {
    const [activeTab, setActiveTab] = useState('profil');
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    // Skill State
    const [skills, setSkills] = useState([]);
    const [newSkill, setNewSkill] = useState({ name: '', proficiency: 'Beginner' });
    const [isSubmittingSkill, setIsSubmittingSkill] = useState(false);

    // Portfolio State
    const [portfolios, setPortfolios] = useState([]);
    const [newPortfolio, setNewPortfolio] = useState({ title: '', category: 'Web Application', tech_stack: '', description: '', url: '' });
    const [isSubmittingPortfolio, setIsSubmittingPortfolio] = useState(false);

    // Vacancy State
    const [vacancies, setVacancies] = useState([]);

    // Profile Edit State
    const [editProfileData, setEditProfileData] = useState({
        name: user?.name || '',
        phone: user?.profile?.phone || '',
        address: user?.profile?.address || '',
        nisn: user?.profile?.nisn || '',
        gender: user?.profile?.gender || '',
        birth_date: user?.profile?.birth_date || '',
        bio: user?.profile?.bio || '',
    });

    useEffect(() => {
        if (user) {
            setEditProfileData({
                name: user.name || '',
                phone: user.profile?.phone || '',
                address: user.profile?.address || '',
                nisn: user.profile?.nisn || '',
                gender: user.profile?.gender || '',
                birth_date: user.profile?.birth_date || '',
                bio: user.profile?.bio || '',
            });
        }
    }, [user]);

    const [cvFile, setCvFile] = useState(null);
    const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);

    // Applications State
    const [applications, setApplications] = useState([]);
    const [applyingId, setApplyingId] = useState(null);

    // Journal State
    const [journals, setJournals] = useState([]);
    const [selectedAppIdForJournal, setSelectedAppIdForJournal] = useState(null);
    const [newJournal, setNewJournal] = useState({ date: '', activity: '', hours: 8 });
    const [isSubmittingJournal, setIsSubmittingJournal] = useState(false);

    const handleOpenJournal = async (appId) => {
        setSelectedAppIdForJournal(appId);
        try {
            const res = await axiosInstance.get(`/journals?application_id=${appId}`);
            setJournals(res.data);
            const modal = new window.bootstrap.Modal(document.getElementById('modalJurnalStudent'));
            modal.show();
        } catch (error) {
            console.error("Error fetching journals", error);
        }
    };

    const handleAddJournal = async (e) => {
        e.preventDefault();
        setIsSubmittingJournal(true);
        try {
            const res = await axiosInstance.post('/journals', {
                application_id: selectedAppIdForJournal,
                ...newJournal
            });
            setJournals([res.data, ...journals]);
            setNewJournal({ date: '', activity: '', hours: 8 });
        } catch (error) {
            console.error("Error adding journal", error);
            alert("Gagal menyimpan jurnal.");
        } finally {
            setIsSubmittingJournal(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'skills' || activeTab === 'skill_gap' || activeTab === 'ai_recommender') fetchSkills();
        if (activeTab === 'portofolio') fetchPortfolios();
        if (activeTab === 'lowongan' || activeTab === 'skill_gap' || activeTab === 'ai_recommender') fetchVacancies();
        if (activeTab === 'lamaran' || activeTab === 'ai_recommender') fetchApplications();
    }, [activeTab]);

    // Calculate AI Recommender & Skill Gap
    const aiRecommendationApp = applications.find(app => app.ai_analysis);
    const userSkills = skills.map(s => s.name.toLowerCase());
    
    let allRequiredSkills = {};
    vacancies.forEach(v => {
        if (v.required_skills) {
            v.required_skills.forEach(s => {
                allRequiredSkills[s] = (allRequiredSkills[s] || 0) + 1;
            });
        }
    });
    
    const missingSkills = Object.keys(allRequiredSkills)
        .filter(s => !userSkills.includes(s.toLowerCase()))
        .map(s => ({ name: s, count: allRequiredSkills[s] }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 3);
        
    const avgMatchRate = vacancies.length > 0 
        ? Math.round(vacancies.reduce((acc, curr) => acc + (curr.match_rate || 0), 0) / vacancies.length) 
        : 0;

    const fetchApplications = async () => {
        try {
            const res = await axiosInstance.get('/applications');
            setApplications(res.data);
        } catch (error) {
            console.error("Error fetching applications", error);
        }
    };

    const handleApply = async (vacancyId) => {
        setApplyingId(vacancyId);
        try {
            await axiosInstance.post('/applications', { vacancy_id: vacancyId });
            alert("Berhasil melamar magang!");
        } catch (error) {
            console.error("Error applying", error);
            alert("Gagal melamar. Mungkin Anda sudah melamar posisi ini.");
        } finally {
            setApplyingId(null);
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

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setIsSubmittingProfile(true);
        try {
            const formData = new FormData();
            formData.append('name', editProfileData.name);
            formData.append('phone', editProfileData.phone);
            formData.append('address', editProfileData.address);
            formData.append('nisn', editProfileData.nisn);
            formData.append('gender', editProfileData.gender);
            formData.append('birth_date', editProfileData.birth_date);
            formData.append('bio', editProfileData.bio);
            if (cvFile) {
                formData.append('cv', cvFile);
            }

            const res = await axiosInstance.post('/profile', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            localStorage.setItem('user', JSON.stringify(res.data.user));
            setCvFile(null);
            window.location.reload();
        } catch (error) {
            console.error("Error updating profile", error);
        } finally {
            setIsSubmittingProfile(false);
        }
    };

    const fetchSkills = async () => {
        try {
            const res = await axiosInstance.get('/skills');
            setSkills(res.data);
        } catch (error) {
            console.error("Error fetching skills", error);
        }
    };

    const fetchPortfolios = async () => {
        try {
            const res = await axiosInstance.get('/portfolios');
            setPortfolios(res.data);
        } catch (error) {
            console.error("Error fetching portfolios", error);
        }
    };

    const handleAddSkill = async (e) => {
        e.preventDefault();
        setIsSubmittingSkill(true);
        try {
            await axiosInstance.post('/skills', newSkill);
            setNewSkill({ name: '', proficiency: 'Beginner' });
            fetchSkills();
            document.getElementById('btnCloseSkillModal').click();
        } catch (error) {
            console.error("Error adding skill", error);
        } finally {
            setIsSubmittingSkill(false);
        }
    };

    const handleAddPortfolio = async (e) => {
        e.preventDefault();
        setIsSubmittingPortfolio(true);
        try {
            const techStackArray = newPortfolio.tech_stack.split(',').map(s => s.trim()).filter(s => s);
            await axiosInstance.post('/portfolios', { ...newPortfolio, tech_stack: techStackArray });
            setNewPortfolio({ title: '', category: 'Web Application', tech_stack: '', description: '', url: '' });
            fetchPortfolios();
            document.getElementById('btnClosePortoModal').click();
        } catch (error) {
            console.error("Error adding portfolio", error);
        } finally {
            setIsSubmittingPortfolio(false);
        }
    };

    const handleDeleteSkill = async (id) => {
        if(!window.confirm('Hapus skill ini?')) return;
        try {
            await axiosInstance.delete(`/skills/${id}`);
            fetchSkills();
        } catch (error) {
            console.error(error);
        }
    };

    const handleDeletePortfolio = async (id) => {
        if(!window.confirm('Hapus portofolio ini?')) return;
        try {
            await axiosInstance.delete(`/portfolios/${id}`);
            fetchPortfolios();
        } catch (error) {
            console.error(error);
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
                        className={`nav-link text-start py-3 rounded-3 ${activeTab === 'profil' ? 'active' : ''}`} 
                        onClick={() => setActiveTab('profil')}
                    >
                        <i className="fa-regular fa-user me-3 w-20"></i>Profil Saya
                    </button>
                    
                    <button 
                        className={`nav-link text-start py-3 rounded-3 ${activeTab === 'skills' ? 'active' : ''}`} 
                        onClick={() => setActiveTab('skills')}
                    >
                        <i className="fa-solid fa-code me-3 w-20"></i>Skills Saya
                    </button>
                    
                    <button 
                        className={`nav-link text-start py-3 rounded-3 ${activeTab === 'portofolio' ? 'active' : ''}`} 
                        onClick={() => setActiveTab('portofolio')}
                    >
                        <i className="fa-regular fa-folder-open me-3 w-20"></i>Portofolio Saya
                    </button>
                    
                    <button 
                        className={`nav-link text-start py-3 rounded-3 ${activeTab === 'lowongan' ? 'active' : ''}`} 
                        onClick={() => setActiveTab('lowongan')}
                    >
                        <i className="fa-solid fa-briefcase me-3 w-20"></i>Lowongan Magang
                    </button>
                    
                    <button 
                        className={`nav-link text-start py-3 rounded-3 ${activeTab === 'lamaran' ? 'active' : ''}`} 
                        onClick={() => setActiveTab('lamaran')}
                    >
                        <i className="fa-solid fa-clipboard-list me-3 w-20"></i>Status Lamaran
                    </button>

                    <div className="text-muted extra-small fw-bold mt-3 mb-2 px-3">PEMBELAJARAN (AI)</div>
                    
                    <button 
                        className={`nav-link text-start py-3 rounded-3 ${activeTab === 'ai_recommender' ? 'active' : ''}`} 
                        onClick={() => setActiveTab('ai_recommender')}
                    >
                        <i className="fa-solid fa-wand-magic-sparkles me-3 w-20 text-primary"></i>AI Recommender
                    </button>
                    
                    <button 
                        className={`nav-link text-start py-3 rounded-3 ${activeTab === 'skill_gap' ? 'active' : ''}`} 
                        onClick={() => setActiveTab('skill_gap')}
                    >
                        <i className="fa-solid fa-chart-line me-3 w-20"></i>Statistik Skill-Gap
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
                                <i className="fa-solid fa-user-graduate me-2"></i>Aktor: Siswa (SMK)
                            </span>
                        </div>
                        <div className="d-flex align-items-center gap-3">
                            <NotificationDropdown />
                            <div className="profile-avatar bg-primary-light text-primary fw-bold d-flex align-items-center justify-content-center rounded-circle border border-primary" style={{width:'36px', height:'36px'}}>{user?.name?.substring(0,2).toUpperCase() || 'ST'}</div>
                            <span className="fw-semibold d-none d-md-block text-dark small">{user?.name || 'Nama Siswa'}</span>
                        </div>
                    </div>
                </nav>

                {/* ========== TAB CONTENT ========== */}
                <div className="container-fluid px-4 py-4 tab-content">
                    
                    {/* ===== TAB 1: PROFIL ===== */}
                    {activeTab === 'profil' && (
                        <div className="tab-pane fade show active">
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <div>
                                    <h4 className="fw-bold mb-1">Profil Saya</h4>
                                    <p className="text-muted small mb-0">Kelola informasi pribadi dan data akademik Anda.</p>
                                </div>
                                <div>
                                    {user?.profile?.cv_path && (
                                        <a href={`http://localhost:8000/storage/${user.profile.cv_path}`} target="_blank" rel="noreferrer" className="btn btn-outline-primary me-2"><i className="fa-solid fa-file-pdf me-2"></i>Lihat CV</a>
                                    )}
                                    <button className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#modalEditProfile"><i className="fa-solid fa-pen-to-square me-2"></i>Edit Profil</button>
                                </div>
                            </div>
                            
                            {/* Profile Header Card */}
                            <div className="card border-0 shadow-sm mb-4 profile-header-card overflow-hidden">
                                <div className="card-body p-0">
                                    <div className="profile-banner"></div>
                                    <div className="card-body p-4 p-md-5 position-relative z-1">
                                    <div className="d-flex flex-column flex-md-row align-items-center gap-4">
                                        <div className="avatar-xl bg-white text-primary fw-bold d-flex align-items-center justify-content-center rounded-circle shadow border border-4 border-white" style={{width: '100px', height: '100px', fontSize: '2rem'}}>
                                            {user?.name?.substring(0,2).toUpperCase()}
                                        </div>
                                        <div className="text-center text-md-start text-dark">
                                            <h2 className="fw-bold mb-1">{user?.name}</h2>
                                            <p className="mb-2 text-muted"><i className="fa-solid fa-graduation-cap me-2"></i>{user?.profile?.department || 'Siswa SMK'} &bull; {user?.profile?.school || 'Sekolah Belum Diatur'}</p>
                                        </div>
                                    </div>
                                </div>
                                </div>
                            </div>

                            {/* Profile Form */}
                            <div className="card border-0 shadow-sm mb-4">
                                <div className="card-header bg-white border-bottom py-3 px-4">
                                    <h6 className="fw-bold mb-0"><i className="fa-solid fa-id-card me-2 text-primary"></i>Data Pribadi & Akademik</h6>
                                </div>
                                <div className="card-body p-4">
                                    <div className="row g-4">
                                        <div className="col-md-12 mb-2">
                                            <label className="form-label small text-muted fw-semibold">Bio Singkat</label>
                                            <div className="fw-medium text-dark bg-light p-3 rounded">{user?.profile?.bio || 'Belum ada bio. Tuliskan deskripsi singkat tentang diri Anda untuk menarik perhatian Industri.'}</div>
                                        </div>
                                        <div className="col-sm-6">
                                            <div className="mb-3">
                                                <label className="form-label small text-muted fw-semibold">Alamat Email</label>
                                                <div className="fw-medium text-dark">{user?.email}</div>
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label small text-muted fw-semibold">Nomor Telepon</label>
                                                <div className="fw-medium text-dark">{user?.profile?.phone || '-'}</div>
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label small text-muted fw-semibold">Alamat Domisili</label>
                                                <div className="fw-medium text-dark">{user?.profile?.address || '-'}</div>
                                            </div>
                                        </div>
                                        <div className="col-sm-6">
                                            <div className="mb-3">
                                                <label className="form-label small text-muted fw-semibold">Tanggal Lahir</label>
                                                <div className="fw-medium text-dark">{user?.profile?.birth_date || '-'}</div>
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label small text-muted fw-semibold">Jenis Kelamin</label>
                                                <div className="fw-medium text-dark">{user?.profile?.gender === 'L' ? 'Laki-laki' : user?.profile?.gender === 'P' ? 'Perempuan' : '-'}</div>
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label small text-muted fw-semibold">NISN</label>
                                                <div className="fw-medium text-dark">{user?.profile?.nisn || '-'}</div>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label text-muted small fw-semibold">Asal Sekolah (Dikunci)</label>
                                            <input type="text" className="form-control bg-light" defaultValue={user?.profile?.school} disabled />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label text-muted small fw-semibold">Jurusan (Dikunci)</label>
                                            <input type="text" className="form-control bg-light" defaultValue={user?.profile?.department} disabled />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ===== TAB 2: SKILLS ===== */}
                    {activeTab === 'skills' && (
                        <div className="tab-pane fade show active">
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <div>
                                    <h4 className="fw-bold mb-1">Skills Saya</h4>
                                    <p className="text-muted small mb-0">Kelola kompetensi yang Anda kuasai untuk dicocokkan dengan kebutuhan industri.</p>
                                </div>
                                <button className="btn btn-teal fw-semibold" data-bs-toggle="modal" data-bs-target="#modalTambahSkill"><i className="fa-solid fa-plus me-2"></i>Tambah Skill</button>
                            </div>

                            <div className="row g-3">
                                {skills.length === 0 ? (
                                    <div className="col-12 text-center py-5">
                                        <div className="text-muted mb-2"><i className="fa-solid fa-code fs-1 opacity-50"></i></div>
                                        <p className="text-muted small">Belum ada skill yang ditambahkan. Silakan tambah skill Anda.</p>
                                    </div>
                                ) : skills.map(skill => (
                                <div className="col-md-6" key={skill.id}>
                                    <div className="card skill-card h-100">
                                        <div className="card-body p-4">
                                            <div className="d-flex justify-content-between align-items-start mb-3">
                                                <div className="d-flex align-items-center gap-3">
                                                    <div className="bg-primary-light text-primary rounded d-flex align-items-center justify-content-center" style={{width:'48px', height:'48px'}}>
                                                        <i className="fa-solid fa-code fs-4"></i>
                                                    </div>
                                                    <div>
                                                        <h5 className="fw-bold mb-1">{skill.name}</h5>
                                                        <span className={`badge border ${skill.proficiency === 'Advanced' ? 'bg-success-light text-success border-success' : skill.proficiency === 'Intermediate' ? 'bg-warning-light text-warning border-warning' : 'bg-secondary bg-opacity-10 text-secondary border-secondary'}`}>{skill.proficiency}</span>
                                                    </div>
                                                </div>
                                                <button onClick={() => handleDeleteSkill(skill.id)} className="btn btn-sm btn-light text-danger"><i className="fa-solid fa-trash"></i></button>
                                            </div>
                                            {skill.is_validated ? (
                                                <div className="d-flex align-items-center mt-3 bg-success-light p-2 rounded">
                                                    <i className="fa-solid fa-check-circle text-success me-2"></i>
                                                    <span className="small text-success fw-semibold">Divalidasi oleh: {skill.validator_name || 'Sekolah'}</span>
                                                </div>
                                            ) : (
                                                <div className="d-flex align-items-center mt-3 bg-warning-light p-2 rounded">
                                                    <i className="fa-solid fa-clock text-warning me-2"></i>
                                                    <span className="small text-warning fw-semibold">Menunggu validasi sekolah</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ===== TAB 3: PORTOFOLIO ===== */}
                    {activeTab === 'portofolio' && (
                        <div className="tab-pane fade show active">
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <div>
                                    <h4 className="fw-bold mb-1">Portofolio Saya</h4>
                                    <p className="text-muted small mb-0">Tampilkan proyek terbaik Anda sebagai bukti kompetensi.</p>
                                </div>
                                <button className="btn btn-primary fw-semibold" data-bs-toggle="modal" data-bs-target="#modalTambahPortofolio"><i className="fa-solid fa-cloud-arrow-up me-2"></i>Tambah Portofolio</button>
                            </div>

                            <div className="row g-4">
                                {portfolios.length === 0 ? (
                                    <div className="col-12 text-center py-5">
                                        <div className="text-muted mb-2"><i className="fa-regular fa-folder-open fs-1 opacity-50"></i></div>
                                        <p className="text-muted small">Belum ada portofolio yang diunggah.</p>
                                    </div>
                                ) : portfolios.map(porto => (
                                <div className="col-md-6" key={porto.id}>
                                    <div className="card porto-card h-100 overflow-hidden">
                                        <div className="bg-light p-4 text-center border-bottom d-flex align-items-center justify-content-center" style={{height:'160px'}}>
                                            <i className="fa-solid fa-laptop-code text-secondary opacity-25" style={{fontSize:'5rem'}}></i>
                                        </div>
                                        <div className="card-body p-4 d-flex flex-column">
                                            <div className="d-flex justify-content-between align-items-start mb-2">
                                                <span className="badge bg-primary-light text-primary">{porto.category}</span>
                                                <div className="d-flex gap-2">
                                                    {porto.status === 'verified' && <span className="badge bg-success text-white"><i className="fa-solid fa-check-circle me-1"></i>Verified</span>}
                                                    <button onClick={() => handleDeletePortfolio(porto.id)} className="btn btn-sm btn-link text-danger p-0 ms-2"><i className="fa-solid fa-trash"></i></button>
                                                </div>
                                            </div>
                                            <h5 className="fw-bold mb-2">{porto.title}</h5>
                                            <p className="text-muted small mb-3 text-truncate-3" style={{flex: 1}}>{porto.description || 'Tidak ada deskripsi.'}</p>
                                            <div className="mb-3 d-flex flex-wrap gap-1">
                                                {porto.tech_stack && porto.tech_stack.map((tech, i) => (
                                                    <span key={i} className="badge bg-light text-dark border">{tech}</span>
                                                ))}
                                            </div>
                                            {porto.url ? (
                                                <a href={porto.url} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-primary w-100 mt-auto"><i className="fa-solid fa-arrow-up-right-from-square me-2"></i>Lihat Proyek</a>
                                            ) : (
                                                <button disabled className="btn btn-sm btn-outline-secondary w-100 mt-auto">Tidak Ada Tautan</button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ===== TAB 4: LOWONGAN MAGANG ===== */}
                    {activeTab === 'lowongan' && (
                        <div className="tab-pane fade show active">
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <div>
                                    <h4 className="fw-bold mb-1">Eksplorasi Magang</h4>
                                    <p className="text-muted small mb-0">Temukan peluang magang yang paling cocok dengan keahlian Anda.</p>
                                </div>
                            </div>

                            <div className="row g-4">
                                {vacancies.length === 0 ? (
                                    <div className="col-12 text-center py-5">
                                        <div className="text-muted mb-2"><i className="fa-solid fa-briefcase fs-1 opacity-50"></i></div>
                                        <p className="text-muted small">Belum ada lowongan magang yang tersedia saat ini.</p>
                                    </div>
                                ) : vacancies.map(vacancy => (
                                <div className="col-md-6 col-lg-4" key={vacancy.id}>
                                    <div className="card job-card h-100 shadow-sm border-0">
                                        <div className="card-body p-4 d-flex flex-column">
                                            <div className="d-flex justify-content-between align-items-start mb-3">
                                                <div className="bg-light rounded p-2 border">
                                                    <i className="fa-solid fa-building text-primary fs-3"></i>
                                                </div>
                                                <span className={`badge border px-2 py-1 ${vacancy.match_rate >= 80 ? 'bg-success-light text-success border-success' : vacancy.match_rate >= 50 ? 'bg-warning-light text-warning border-warning' : 'bg-danger-light text-danger border-danger'}`}>
                                                    <i className="fa-solid fa-bolt text-warning me-1"></i>{vacancy.match_rate}% Match
                                                </span>
                                            </div>
                                            <h5 className="fw-bold mb-1">{vacancy.title}</h5>
                                            <p className="text-muted small mb-3">{vacancy.user?.profile?.company_name || 'Perusahaan'}</p>
                                            <div className="d-flex gap-3 mb-3 small">
                                                <span className="text-secondary"><i className="fa-solid fa-location-dot me-1"></i>{vacancy.location || '-'}</span>
                                                <span className="text-secondary"><i className="fa-solid fa-laptop-house me-1"></i>{vacancy.work_mode}</span>
                                            </div>
                                            <div className="mb-4 flex-grow-1">
                                                <p className="small text-muted fw-semibold mb-2">Persyaratan Skill:</p>
                                                <div className="d-flex flex-wrap gap-1">
                                                    {vacancy.required_skills && vacancy.required_skills.map((skill, i) => (
                                                        <span key={i} className="badge bg-primary-light text-primary border border-primary">{skill}</span>
                                                    ))}
                                                </div>
                                            </div>
                                            <button className="btn btn-primary w-100 fw-semibold" onClick={() => handleApply(vacancy.id)} disabled={applyingId === vacancy.id}>
                                                {applyingId === vacancy.id ? 'Mengirim...' : 'Lamar Sekarang'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ===== TAB 5: STATUS LAMARAN ===== */}
                    {activeTab === 'lamaran' && (
                        <div className="tab-pane fade show active">
                            <h4 className="fw-bold mb-1">Status Lamaran Saya</h4>
                            <p className="text-muted small mb-4">Pantau progres seluruh lamaran magang Anda secara real-time.</p>

                            <div className="card border-0 shadow-sm">
                                <div className="card-body p-0">
                                    <div className="table-responsive">
                                        <table className="table table-hover mb-0 align-middle">
                                            <thead className="table-light text-muted small">
                                                <tr>
                                                    <th className="py-3 ps-4">Posisi & Perusahaan</th>
                                                    <th className="py-3">Match Rate</th>
                                                    <th className="py-3">Tanggal Melamar</th>
                                                    <th className="py-3">Status</th>
                                                    <th className="py-3 pe-4 text-end">Aksi</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {applications.length === 0 ? (
                                                    <tr>
                                                        <td colSpan="5" className="text-center py-4 text-muted">Belum ada lamaran magang yang diajukan.</td>
                                                    </tr>
                                                ) : applications.map(app => (
                                                    <tr key={app.id}>
                                                        <td className="ps-4 py-3">
                                                            <div className="fw-bold text-dark">{app.vacancy?.title}</div>
                                                            <div className="small text-muted">{app.vacancy?.user?.profile?.company_name}</div>
                                                        </td>
                                                        <td><span className={`badge border px-2 py-1 ${app.match_rate >= 80 ? 'bg-success-light text-success border-success' : app.match_rate >= 50 ? 'bg-warning-light text-warning border-warning' : 'bg-danger-light text-danger border-danger'}`}><i className="fa-solid fa-bolt text-warning me-1"></i>{app.match_rate ?? 'N/A'}%</span></td>
                                                        <td className="small text-muted">{new Date(app.created_at).toLocaleDateString('id-ID')}</td>
                                                        <td>
                                                            <span className={`badge border px-2 py-1 fw-semibold ${app.status === 'Accepted' ? 'bg-success bg-opacity-10 text-success border-success' : app.status === 'Rejected' ? 'bg-danger bg-opacity-10 text-danger border-danger' : 'bg-warning bg-opacity-10 text-warning border-warning'}`}>
                                                                {app.status}
                                                            </span>
                                                        </td>
                                                        <td className="text-end pe-4">
                                                            {app.status === 'Accepted' ? (
                                                                <button onClick={() => handleOpenJournal(app.id)} className="btn btn-sm btn-outline-success">Kelola Jurnal</button>
                                                            ) : (
                                                                <button onClick={() => alert(`Analisis AI: ${app.ai_analysis || 'Belum tersedia'}\nMatch Rate: ${app.match_rate}%`)} className="btn btn-sm btn-outline-primary">Detail</button>
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

                    {/* ===== TAB 6: AI RECOMMENDER ===== */}
                    {activeTab === 'ai_recommender' && (
                        <div className="tab-pane fade show active">
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <div>
                                    <h4 className="fw-bold mb-1"><i className="fa-solid fa-wand-magic-sparkles text-primary me-2"></i>AI Learning Recommender</h4>
                                    <p className="text-muted small mb-0">Rekomendasi jalur pembelajaran adaptif dari Gemini AI berdasarkan gap kompetensi Anda.</p>
                                </div>
                            </div>

                            <div className="card border-0 shadow-sm rounded-4 mb-4 border-start border-primary border-4">
                                <div className="card-body p-4">
                                    <div className="d-flex gap-3">
                                        <div className="text-primary fs-3">
                                            <i className="fa-brands fa-google"></i>
                                        </div>
                                        <div>
                                            {aiRecommendationApp ? (
                                                <>
                                                    <h6 className="fw-bold text-dark mb-2">Analisis AI untuk Lamaran: {aiRecommendationApp.vacancy?.title} ({aiRecommendationApp.status})</h6>
                                                    <p className="small text-muted mb-3">{aiRecommendationApp.ai_analysis}</p>
                                                    <div className="bg-light p-3 rounded-3 mb-3 border">
                                                        <h6 className="small fw-bold text-dark mb-2">Saran Pembelajaran dari Gemini AI:</h6>
                                                        <p className="small text-muted mb-0">Disarankan untuk meningkatkan kemampuan teknis terkait spesifikasi pekerjaan ini sebelum Anda mulai bekerja atau mencoba posisi lain dengan persyaratan serupa.</p>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <h6 className="fw-bold text-dark mb-2">Analisis AI Belum Tersedia</h6>
                                                    <p className="small text-muted mb-3">Sistem belum dapat memberikan rekomendasi khusus. Silakan melamar beberapa lowongan magang agar AI dapat menganalisis kesesuaian skill Anda dengan kebutuhan industri.</p>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ===== TAB 7: STATISTIK SKILL-GAP ===== */}
                    {activeTab === 'skill_gap' && (
                        <div className="tab-pane fade show active">
                            <h4 className="fw-bold mb-1">Statistik Skill-Gap</h4>
                            <p className="text-muted small mb-4">Visualisasi pemetaan *skill* Anda dibandingkan dengan tren kebutuhan industri saat ini.</p>

                            <div className="row g-4">
                                <div className="col-md-6">
                                    <div className="card border-0 shadow-sm h-100 rounded-4">
                                        <div className="card-body p-4 text-center">
                                            <h6 className="fw-bold mb-4">Kesiapan Kerja (Employability)</h6>
                                            <div className="position-relative d-inline-block mb-3">
                                                <svg width="150" height="150" viewBox="0 0 36 36">
                                                    <path className="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#eee" strokeWidth="3" />
                                                    <path className="circle" strokeDasharray={`${avgMatchRate}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={avgMatchRate >= 75 ? "#198754" : avgMatchRate >= 50 ? "#ffc107" : "#dc3545"} strokeWidth="3" />
                                                </svg>
                                                <div className="position-absolute top-50 start-50 translate-middle">
                                                    <h3 className="fw-bold text-dark mb-0">{avgMatchRate}%</h3>
                                                </div>
                                            </div>
                                            <p className="small text-muted">Keterampilan Anda saat ini memenuhi {avgMatchRate}% dari rata-rata kebutuhan lowongan magang yang tersedia.</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="card border-0 shadow-sm h-100 rounded-4">
                                        <div className="card-body p-4">
                                            <h6 className="fw-bold mb-4">Top Skills yang Harus Ditingkatkan</h6>
                                            
                                            {missingSkills.length === 0 ? (
                                                <p className="text-muted small text-center my-5">Anda sudah memiliki keterampilan yang banyak dicari industri saat ini!</p>
                                            ) : missingSkills.map((ms, idx) => (
                                                <div className="mb-3" key={idx}>
                                                    <div className="d-flex justify-content-between mb-1">
                                                        <span className="small fw-semibold">{ms.name}</span>
                                                        <span className={`small fw-bold ${idx === 0 ? 'text-danger' : idx === 1 ? 'text-warning' : 'text-success'}`}>{idx === 0 ? 'Gap Tinggi' : idx === 1 ? 'Gap Sedang' : 'Gap Rendah'}</span>
                                                    </div>
                                                    <div className="progress" style={{height: '6px'}}>
                                                        <div className={`progress-bar ${idx === 0 ? 'bg-danger' : idx === 1 ? 'bg-warning' : 'bg-success'}`} style={{width: `${100 - (idx * 25)}%`}}></div>
                                                    </div>
                                                </div>
                                            ))}
                                            
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>

            {/* Modal Tambah Skill */}
            <div className="modal fade" id="modalTambahSkill" tabIndex="-1" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content rounded-4 border-0 shadow">
                        <div className="modal-header border-bottom-0 pb-0">
                            <h5 className="modal-title fw-bold">Tambah Skill Baru</h5>
                            <button type="button" className="btn-close" id="btnCloseSkillModal" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <form onSubmit={handleAddSkill}>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <label className="form-label small fw-semibold">Nama Skill</label>
                                    <select className="form-select" required value={newSkill.name} onChange={e => setNewSkill({...newSkill, name: e.target.value})}>
                                        <option value="" disabled>-- Pilih Skill --</option>
                                        <option value="HTML">HTML</option>
                                        <option value="CSS">CSS</option>
                                        <option value="JavaScript">JavaScript</option>
                                        <option value="TypeScript">TypeScript</option>
                                        <option value="React JS">React JS</option>
                                        <option value="Vue JS">Vue JS</option>
                                        <option value="Next.js">Next.js</option>
                                        <option value="Node.js">Node.js</option>
                                        <option value="Express JS">Express JS</option>
                                        <option value="PHP">PHP</option>
                                        <option value="Laravel">Laravel</option>
                                        <option value="CodeIgniter">CodeIgniter</option>
                                        <option value="Python">Python</option>
                                        <option value="Django">Django</option>
                                        <option value="Java">Java</option>
                                        <option value="Spring Boot">Spring Boot</option>
                                        <option value="C++">C++</option>
                                        <option value="C#">C#</option>
                                        <option value=".NET">.NET</option>
                                        <option value="Go">Go</option>
                                        <option value="Swift">Swift</option>
                                        <option value="Kotlin">Kotlin</option>
                                        <option value="React Native">React Native</option>
                                        <option value="Flutter">Flutter</option>
                                        <option value="MySQL">MySQL</option>
                                        <option value="PostgreSQL">PostgreSQL</option>
                                        <option value="MongoDB">MongoDB</option>
                                        <option value="Firebase">Firebase</option>
                                        <option value="Docker">Docker</option>
                                        <option value="AWS">AWS</option>
                                        <option value="Google Cloud">Google Cloud</option>
                                        <option value="Git">Git</option>
                                        <option value="Figma">Figma</option>
                                        <option value="UI/UX Design">UI/UX Design</option>
                                        <option value="Data Analysis">Data Analysis</option>
                                        <option value="Cybersecurity">Cybersecurity</option>
                                        <option value="Microsoft Office">Microsoft Office</option>
                                        <option value="Problem Solving">Problem Solving</option>
                                        <option value="Komunikasi">Komunikasi</option>
                                        <option value="Kerja Sama Tim">Kerja Sama Tim</option>
                                    </select>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label small fw-semibold">Tingkat Kemampuan</label>
                                    <select className="form-select" value={newSkill.proficiency} onChange={e => setNewSkill({...newSkill, proficiency: e.target.value})}>
                                        <option value="Beginner">Beginner (Pemula)</option>
                                        <option value="Intermediate">Intermediate (Menengah)</option>
                                        <option value="Advanced">Advanced (Mahir)</option>
                                    </select>
                                </div>
                            </div>
                            <div className="modal-footer border-top-0 pt-0">
                                <button type="button" className="btn btn-light" data-bs-dismiss="modal">Batal</button>
                                <button type="submit" className="btn btn-teal" disabled={isSubmittingSkill}>{isSubmittingSkill ? 'Menyimpan...' : 'Simpan Skill'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Modal Tambah Portofolio */}
            <div className="modal fade" id="modalTambahPortofolio" tabIndex="-1" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered modal-lg">
                    <div className="modal-content rounded-4 border-0 shadow">
                        <div className="modal-header border-bottom-0 pb-0">
                            <h5 className="modal-title fw-bold">Unggah Portofolio</h5>
                            <button type="button" className="btn-close" id="btnClosePortoModal" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <form onSubmit={handleAddPortfolio}>
                            <div className="modal-body row g-3">
                                <div className="col-md-6">
                                    <label className="form-label small fw-semibold">Judul Proyek</label>
                                    <input type="text" className="form-control" placeholder="Contoh: Aplikasi Kasir" required value={newPortfolio.title} onChange={e => setNewPortfolio({...newPortfolio, title: e.target.value})} />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label small fw-semibold">Kategori</label>
                                    <select className="form-select" value={newPortfolio.category} onChange={e => setNewPortfolio({...newPortfolio, category: e.target.value})}>
                                        <option value="Web Application">Web Application</option>
                                        <option value="Mobile Application">Mobile Application</option>
                                        <option value="UI/UX Design">UI/UX Design</option>
                                        <option value="Data Analysis">Data Analysis</option>
                                        <option value="Other">Lainnya</option>
                                    </select>
                                </div>
                                <div className="col-md-12">
                                    <label className="form-label small fw-semibold">Tech Stack (Pisahkan dengan koma)</label>
                                    <input type="text" className="form-control" placeholder="Contoh: React, Node.js, MySQL" value={newPortfolio.tech_stack} onChange={e => setNewPortfolio({...newPortfolio, tech_stack: e.target.value})} />
                                </div>
                                <div className="col-md-12">
                                    <label className="form-label small fw-semibold">Tautan Proyek (Opsional)</label>
                                    <input type="url" className="form-control" placeholder="https://github.com/..." value={newPortfolio.url} onChange={e => setNewPortfolio({...newPortfolio, url: e.target.value})} />
                                </div>
                                <div className="col-md-12">
                                    <label className="form-label small fw-semibold">Deskripsi Singkat</label>
                                    <textarea className="form-control" rows="3" placeholder="Jelaskan proyek ini..." value={newPortfolio.description} onChange={e => setNewPortfolio({...newPortfolio, description: e.target.value})}></textarea>
                                </div>
                            </div>
                            <div className="modal-footer border-top-0 pt-0">
                                <button type="button" className="btn btn-light" data-bs-dismiss="modal">Batal</button>
                                <button type="submit" className="btn btn-primary" disabled={isSubmittingPortfolio}>{isSubmittingPortfolio ? 'Menyimpan...' : 'Simpan Portofolio'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            {/* Modal Kelola Jurnal Siswa */}
            <div className="modal fade" id="modalJurnalStudent" tabIndex="-1" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered modal-lg">
                    <div className="modal-content rounded-4 border-0 shadow">
                        <div className="modal-header border-bottom-0 pb-0">
                            <h5 className="modal-title fw-bold">Kelola Jurnal Magang</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body row g-3">
                            <div className="col-12">
                                <form onSubmit={handleAddJournal} className="bg-light p-3 rounded border">
                                    <h6 className="fw-bold mb-3">Tambah Entri Baru</h6>
                                    <div className="row g-2 mb-3">
                                        <div className="col-md-6">
                                            <label className="form-label small fw-semibold">Tanggal</label>
                                            <input type="date" className="form-control form-control-sm" required value={newJournal.date} onChange={e => setNewJournal({...newJournal, date: e.target.value})} />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label small fw-semibold">Durasi Kerja (Jam)</label>
                                            <input type="number" className="form-control form-control-sm" required min="1" max="24" value={newJournal.hours} onChange={e => setNewJournal({...newJournal, hours: e.target.value})} />
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label small fw-semibold">Deskripsi Aktivitas</label>
                                        <textarea className="form-control form-control-sm" rows="2" required placeholder="Ceritakan apa yang Anda kerjakan hari ini..." value={newJournal.activity} onChange={e => setNewJournal({...newJournal, activity: e.target.value})}></textarea>
                                    </div>
                                    <button type="submit" className="btn btn-sm btn-primary" disabled={isSubmittingJournal}>{isSubmittingJournal ? 'Menyimpan...' : 'Kirim Jurnal'}</button>
                                </form>
                            </div>
                            <div className="col-12 mt-4">
                                <h6 className="fw-bold mb-3">Riwayat Jurnal</h6>
                                <div className="list-group list-group-flush">
                                    {journals.length === 0 ? (
                                        <div className="text-center py-3 text-muted small">Belum ada jurnal yang ditambahkan.</div>
                                    ) : journals.map(journal => (
                                        <div key={journal.id} className="list-group-item px-0 py-3 border-bottom">
                                            <div className="d-flex justify-content-between mb-1">
                                                <span className="fw-bold small">{new Date(journal.date).toLocaleDateString('id-ID')}</span>
                                                <span className={`badge ${journal.status === 'Approved' ? 'bg-success' : journal.status === 'Rejected' ? 'bg-danger' : 'bg-warning'} bg-opacity-10 text-${journal.status === 'Approved' ? 'success' : journal.status === 'Rejected' ? 'danger' : 'warning'} border border-${journal.status === 'Approved' ? 'success' : journal.status === 'Rejected' ? 'danger' : 'warning'}`}>
                                                    {journal.status}
                                                </span>
                                            </div>
                                            <p className="mb-1 small text-dark">{journal.activity}</p>
                                            <span className="extra-small text-muted">{journal.hours} Jam Kerja</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Edit Profil */}
            <div className="modal fade" id="modalEditProfile" tabIndex="-1">
                <div className="modal-dialog modal-dialog-centered modal-lg">
                    <div className="modal-content border-0 shadow">
                        <div className="modal-header border-bottom-0 pb-0">
                            <h5 className="fw-bold"><i className="fa-solid fa-pen-to-square text-primary me-2"></i>Edit Profil Pribadi</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" id="btnCloseProfileModal"></button>
                        </div>
                        <form onSubmit={handleUpdateProfile}>
                            <div className="modal-body py-4">
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <label className="form-label small fw-semibold">Nama Lengkap</label>
                                        <input type="text" className="form-control" value={editProfileData.name} onChange={e => setEditProfileData({...editProfileData, name: e.target.value})} required />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label small fw-semibold">Nomor Telepon</label>
                                        <input type="text" className="form-control" value={editProfileData.phone} onChange={e => setEditProfileData({...editProfileData, phone: e.target.value})} placeholder="08..." />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label small fw-semibold">Jenis Kelamin</label>
                                        <select className="form-select" value={editProfileData.gender} onChange={e => setEditProfileData({...editProfileData, gender: e.target.value})}>
                                            <option value="">Pilih...</option>
                                            <option value="L">Laki-laki</option>
                                            <option value="P">Perempuan</option>
                                        </select>
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label small fw-semibold">Tanggal Lahir</label>
                                        <input type="date" className="form-control" value={editProfileData.birth_date} onChange={e => setEditProfileData({...editProfileData, birth_date: e.target.value})} />
                                    </div>
                                    <div className="col-md-12">
                                        <label className="form-label small fw-semibold">NISN (Nomor Induk Siswa Nasional)</label>
                                        <input type="text" className="form-control" value={editProfileData.nisn} onChange={e => setEditProfileData({...editProfileData, nisn: e.target.value})} />
                                    </div>
                                    <div className="col-md-12">
                                        <label className="form-label small fw-semibold">Alamat Domisili</label>
                                        <textarea className="form-control" rows="2" value={editProfileData.address} onChange={e => setEditProfileData({...editProfileData, address: e.target.value})}></textarea>
                                    </div>
                                    <div className="col-md-12">
                                        <label className="form-label small fw-semibold">Bio Singkat</label>
                                        <textarea className="form-control" rows="3" placeholder="Ceritakan singkat tentang minat dan tujuan karir Anda..." value={editProfileData.bio} onChange={e => setEditProfileData({...editProfileData, bio: e.target.value})}></textarea>
                                    </div>
                                    <div className="col-md-12 border-top pt-3 mt-3">
                                        <label className="form-label small fw-semibold"><i className="fa-solid fa-file-pdf text-danger me-2"></i>Unggah CV (PDF)</label>
                                        <input type="file" className="form-control" accept=".pdf" onChange={e => setCvFile(e.target.files[0])} />
                                        <small className="text-muted">Opsional. Mengunggah CV baru akan menggantikan CV sebelumnya.</small>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer border-top-0 pt-0">
                                <button type="button" className="btn btn-light" data-bs-dismiss="modal">Batal</button>
                                <button type="submit" className="btn btn-primary" disabled={isSubmittingProfile}>{isSubmittingProfile ? 'Menyimpan...' : 'Simpan Perubahan'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
};

export default StudentDashboard;
