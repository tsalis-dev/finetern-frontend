import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Register.css';

const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('student'); // student, school, industry
    const [schoolName, setSchoolName] = useState('');
    const [npsn, setNpsn] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [nib, setNib] = useState('');
    const [department, setDepartment] = useState('');
    const [schoolsList, setSchoolsList] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    // Form State
    const [name, setName] = useState('');

    const { register } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        import('../api/axios').then(module => {
            const api = module.default;
            api.get('/schools')
                .then(res => setSchoolsList(res.data))
                .catch(err => console.error("Error fetching schools", err));
        });
    }, []);

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        
        // Simple validation
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
            setError('Format email tidak valid.');
            return;
        }
        
        if (password.length < 8) {
            setError('Password minimal 8 karakter.');
            return;
        }
        
        // name is collected from the form
        const userData = {
            name: name, 
            email, 
            password, 
            role,
            school_name: schoolName,
            department: department,
            npsn,
            company_name: companyName,
            nib
        };

        const result = await register(userData);

        if (result.success) {
            setSuccess(true);
            setTimeout(() => {
                // Redirect based on role returned
                if (result.role === 'student') navigate('/student');
                else if (result.role === 'school') navigate('/school');
                else navigate('/industry');
            }, 2000);
        } else {
            setError(result.message || 'Email sudah digunakan. Silakan gunakan email lain.');
        }
    };

    return (
        <div className="bg-light-dynamic min-vh-100">
            <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center p-0">
                <div className="row g-0 auth-container shadow-lg rounded-4 overflow-hidden w-100 m-3 m-lg-5" style={{maxWidth: '1050px'}}>
                    
                    {/* Left Column - Brand Info */}
                    <div className="col-lg-6 d-none d-lg-flex bg-gradient-brand p-5 flex-column justify-content-between text-white position-relative">
                        <div className="brand-logo">
                            <i className="fa-solid fa-layer-group me-2"></i><strong>Finetern<span className="text-white-50">.</span></strong>
                        </div>
                        <div className="brand-brief my-auto">
                            <h1 className="fw-bold display-5 mb-3">Mulai Validasi Kompetensimu</h1>
                            <p className="lead opacity-75">Bergabunglah dalam ekosistem digital terintegrasi untuk menciptakan transparansi dan presisi penempatan magang SMK.</p>
                        </div>
                        <div className="brand-footer opacity-50 small">
                            LIDM 2026 &bull; Divisi Inovasi Teknologi Digital Pendidikan
                        </div>
                    </div>

                    {/* Right Column - Register Form */}
                    <div className="col-lg-6 bg-white p-4 p-md-5 d-flex flex-column justify-content-center">
                        <div className="form-header mb-4">
                            <div className="d-lg-none text-primary fw-bold mb-3 fs-4"><i className="fa-solid fa-layer-group me-2"></i>Finetern.</div>
                            <h3 className="fw-bold text-dark-blue">Daftar Akun Baru</h3>
                            <p className="text-muted small">Lengkapi data di bawah ini untuk bergabung ke platform Finetern.</p>
                        </div>

                        {error && (
                            <div className="alert alert-danger border-0 small d-flex align-items-center mb-3" role="alert">
                                <i className="fa-solid fa-circle-exclamation me-2"></i>
                                <div>{error}</div>
                            </div>
                        )}

                        {success && (
                            <div className="alert alert-success border-0 small d-flex align-items-center mb-3" role="alert">
                                <i className="fa-solid fa-circle-check me-2"></i>
                                <div>Registrasi berhasil! Mengarahkan ke dashboard...</div>
                            </div>
                        )}

                        <form onSubmit={handleRegister}>
                            <div className="mb-4">
                                <label className="form-label text-secondary small fw-semibold d-block mb-3">Pilih Peran Anda</label>
                                <div className="row g-2">
                                    <div className="col-4">
                                        <input type="radio" className="btn-check" name="roleOptions" id="roleSiswa" checked={role === 'student'} onChange={() => setRole('student')} />
                                        <label className="btn role-card w-100 p-3 h-100 d-flex flex-column align-items-center justify-content-center rounded-3" htmlFor="roleSiswa">
                                            <i className="fa-solid fa-user-graduate fs-4 mb-2 icon-role"></i>
                                            <span className="small fw-bold">Siswa</span>
                                        </label>
                                    </div>
                                    <div className="col-4">
                                        <input type="radio" className="btn-check" name="roleOptions" id="roleSekolah" checked={role === 'school'} onChange={() => setRole('school')} />
                                        <label className="btn role-card w-100 p-3 h-100 d-flex flex-column align-items-center justify-content-center rounded-3" htmlFor="roleSekolah">
                                            <i className="fa-solid fa-school fs-4 mb-2 icon-role"></i>
                                            <span className="small fw-bold">Sekolah</span>
                                        </label>
                                    </div>
                                    <div className="col-4">
                                        <input type="radio" className="btn-check" name="roleOptions" id="roleIndustri" checked={role === 'industry'} onChange={() => setRole('industry')} />
                                        <label className="btn role-card w-100 p-3 h-100 d-flex flex-column align-items-center justify-content-center rounded-3" htmlFor="roleIndustri">
                                            <i className="fa-solid fa-building fs-4 mb-2 icon-role"></i>
                                            <span className="small fw-bold">Industri</span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-3">
                                <label htmlFor="regName" className="form-label text-secondary small fw-semibold">Nama Lengkap / Nama Instansi</label>
                                <div className="input-group">
                                    <span className="input-group-text bg-light border-end-0 text-muted"><i className="fa-solid fa-user"></i></span>
                                    <input type="text" className="form-control bg-light border-start-0" id="regName" placeholder="masukkan nama lengkap" required value={name} onChange={e => setName(e.target.value)} />
                                </div>
                            </div>

                            <div className="mb-3">
                                <label htmlFor="regEmail" className="form-label text-secondary small fw-semibold">Alamat Email</label>
                                <div className="input-group">
                                    <span className="input-group-text bg-light border-end-0 text-muted"><i className="fa-regular fa-envelope"></i></span>
                                    <input type="email" className="form-control bg-light border-start-0" id="regEmail" placeholder="masukkan email aktif" required value={email} onChange={e => setEmail(e.target.value)} />
                                </div>
                            </div>

                            {role === 'school' && (
                                <>
                                    <div className="mb-3">
                                        <label className="form-label text-secondary small fw-semibold">Nama Sekolah</label>
                                        <div className="input-group">
                                            <span className="input-group-text bg-light border-end-0 text-muted"><i className="fa-solid fa-school"></i></span>
                                            <input type="text" className="form-control bg-light border-start-0" placeholder="contoh: SMK Negeri 1 Bandung" required id="schoolName" name="school_name" value={schoolName} onChange={e => setSchoolName(e.target.value)} />
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label text-secondary small fw-semibold">NPSN (Nomor Pokok Sekolah Nasional)</label>
                                        <div className="input-group">
                                            <span className="input-group-text bg-light border-end-0 text-muted"><i className="fa-solid fa-id-card"></i></span>
                                            <input type="text" className="form-control bg-light border-start-0" placeholder="8 digit angka NPSN" required id="npsn" name="npsn" value={npsn} onChange={e => setNpsn(e.target.value)} />
                                        </div>
                                    </div>
                                </>
                            )}

                            {role === 'student' && (
                                <>
                                    <div className="mb-3">
                                        <label className="form-label text-secondary small fw-semibold">Asal Sekolah</label>
                                        <div className="input-group">
                                            <span className="input-group-text bg-light border-end-0 text-muted"><i className="fa-solid fa-school"></i></span>
                                            <select className="form-select bg-light border-start-0" required value={schoolName} onChange={e => setSchoolName(e.target.value)}>
                                                <option value="">Pilih sekolah Anda...</option>
                                                {schoolsList.map(s => (
                                                    <option key={s.id} value={s.school}>{s.school}</option>
                                                ))}
                                            </select>
                                        </div>
                                        {schoolsList.length === 0 && <div className="form-text text-danger extra-small">Belum ada sekolah yang terdaftar di Finetern. Anda tidak bisa mendaftar sebagai Siswa saat ini.</div>}
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label text-secondary small fw-semibold">Jurusan / Program Keahlian</label>
                                        <div className="input-group">
                                            <span className="input-group-text bg-light border-end-0 text-muted"><i className="fa-solid fa-graduation-cap"></i></span>
                                            <input type="text" className="form-control bg-light border-start-0" placeholder="contoh: Rekayasa Perangkat Lunak" required value={department} onChange={e => setDepartment(e.target.value)} />
                                        </div>
                                    </div>
                                </>
                            )}

                            {role === 'industry' && (
                                <>
                                    <div className="mb-3">
                                        <label className="form-label text-secondary small fw-semibold">Nama Perusahaan</label>
                                        <div className="input-group">
                                            <span className="input-group-text bg-light border-end-0 text-muted"><i className="fa-solid fa-building"></i></span>
                                            <input type="text" className="form-control bg-light border-start-0" placeholder="contoh: PT Inovasi Teknologi" required id="companyName" name="company_name" value={companyName} onChange={e => setCompanyName(e.target.value)} />
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label text-secondary small fw-semibold">NIB (Nomor Induk Berusaha)</label>
                                        <div className="input-group">
                                            <span className="input-group-text bg-light border-end-0 text-muted"><i className="fa-solid fa-file-signature"></i></span>
                                            <input type="text" className="form-control bg-light border-start-0" placeholder="13 digit angka NIB" required id="nib" name="nib" value={nib} onChange={e => setNib(e.target.value)} />
                                        </div>
                                    </div>
                                </>
                            )}
                            
                            <div className="mb-4">
                                <label htmlFor="regPassword" className="form-label text-secondary small fw-semibold">Kata Sandi</label>
                                <div className="input-group mb-1">
                                    <span className="input-group-text bg-light border-end-0 text-muted"><i className="fa-solid fa-lock"></i></span>
                                    <input type="password" className="form-control bg-light border-start-0" id="regPassword" placeholder="minimal 8 karakter" required value={password} onChange={e => setPassword(e.target.value)} />
                                </div>
                                <div className="form-text text-muted extra-small">Gunakan kombinasi huruf dan angka demi keamanan akun.</div>
                            </div>

                            <button type="submit" className="btn btn-primary w-100 py-2.5 rounded-3 fw-bold mb-3 shadow-sm btn-brand-primary">
                                Daftar Akun <i className="fa-solid fa-user-plus ms-2"></i>
                            </button>

                            <p className="text-center text-muted small mb-0">
                                Sudah punya akun? <Link to="/" className="text-decoration-none text-primary fw-semibold">Masuk</Link>
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
