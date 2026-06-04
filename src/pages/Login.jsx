import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Login.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('student'); // student, school, industry
    const [error, setError] = useState('');
    const { login, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        
        const result = await login(email, password);
        if (result.success) {
            // Check if the registered role matches the selected tab role
            if (result.role !== role) {
                // If it doesn't match, force logout and show error
                logout();
                setError(`Gagal: Akun ini terdaftar sebagai ${result.role}, bukan ${role}.`);
                return;
            }

            // Redirect based on role returned from backend
            if (result.role === 'student') navigate('/student');
            else if (result.role === 'school') navigate('/school');
            else navigate('/industry');
        } else {
            setError(result.message || 'Email atau password salah.');
        }
    };

    return (
        <div className="bg-light-dynamic min-vh-100">
            <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center p-0">
                <div className="row g-0 auth-container shadow-lg rounded-4 overflow-hidden w-100 m-3 m-lg-5" style={{maxWidth: '1050px'}}>
                    
                    {/* Left Column - Brand Info */}
                    <div className="col-lg-6 d-none d-lg-flex bg-gradient-brand p-5 flex-column justify-content-between text-white position-relative">
                        <div className="brand-logo">
                            <i className="fa-solid fa-layer-group me-2"></i><strong>Finetern.</strong>
                        </div>
                        <div className="brand-brief my-auto">
                            <h1 className="fw-bold display-5 mb-3">Ekosistem Penghubung Cerdas</h1>
                            <p className="lead opacity-75">Mengatasi <em>skill mismatch</em> pada program magang SMK melalui Pencocokan Matematis dan Validasi Berbasis Bukti.</p>
                        </div>
                        <div className="brand-footer opacity-50 small">
                            LIDM 2026 &bull; Divisi Inovasi Teknologi Digital Pendidikan
                        </div>
                    </div>

                    {/* Right Column - Login Form */}
                    <div className="col-lg-6 bg-white p-4 p-md-5 d-flex flex-column justify-content-center">
                        <div className="form-header mb-4">
                            <div className="d-lg-none text-primary fw-bold mb-3 fs-4"><i className="fa-solid fa-layer-group me-2"></i>Finetern.</div>
                            <h3 className="fw-bold text-dark-blue">Selamat Datang Kembali</h3>
                            <p className="text-muted small">Silakan pilih peran Anda dan masukkan kredensial terdaftar.</p>
                        </div>

                        {error && (
                            <div className="alert alert-danger border-0 small d-flex align-items-center mb-3" role="alert">
                                <i className="fa-solid fa-circle-exclamation me-2"></i>
                                <div>{error}</div>
                            </div>
                        )}

                        <ul className="nav nav-pills nav-justified mb-4 p-1 bg-light rounded-3" id="roleTab" role="tablist">
                            <li className="nav-item" role="presentation">
                                <button className={`nav-link py-2 small fw-semibold ${role === 'student' ? 'active' : ''}`} onClick={() => setRole('student')} type="button" role="tab">
                                    <i className="fa-solid fa-user-graduate me-2"></i>Siswa
                                </button>
                            </li>
                            <li className="nav-item" role="presentation">
                                <button className={`nav-link py-2 small fw-semibold ${role === 'school' ? 'active' : ''}`} onClick={() => setRole('school')} type="button" role="tab">
                                    <i className="fa-solid fa-school me-2"></i>Sekolah
                                </button>
                            </li>
                            <li className="nav-item" role="presentation">
                                <button className={`nav-link py-2 small fw-semibold ${role === 'industry' ? 'active' : ''}`} onClick={() => setRole('industry')} type="button" role="tab">
                                    <i className="fa-solid fa-building me-2"></i>Industri
                                </button>
                            </li>
                        </ul>

                        <form onSubmit={handleLogin}>
                            <div className="mb-3">
                                <label htmlFor="emailInput" className="form-label text-secondary small fw-semibold">Alamat Email</label>
                                <div className="input-group">
                                    <span className="input-group-text bg-light border-end-0 text-muted"><i className="fa-regular fa-envelope"></i></span>
                                    <input type="email" className="form-control bg-light border-start-0" id="emailInput" placeholder="nama@email.com" required value={email} onChange={e => setEmail(e.target.value)} />
                                </div>
                            </div>
                            
                            <div className="mb-3">
                                <div className="d-flex justify-content-between align-items-center mb-1">
                                    <label htmlFor="passwordInput" className="form-label text-secondary small fw-semibold mb-0">Kata Sandi</label>
                                    <a href="#" onClick={(e) => { e.preventDefault(); alert('Fitur reset password belum tersedia. Silakan hubungi admin.'); }} className="text-decoration-none text-primary small link-forgot">Lupa Sandi?</a>
                                </div>
                                <div className="input-group">
                                    <span className="input-group-text bg-light border-end-0 text-muted"><i className="fa-solid fa-lock"></i></span>
                                    <input type="password" className="form-control bg-light border-start-0" id="passwordInput" placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;" required value={password} onChange={e => setPassword(e.target.value)} />
                                </div>
                            </div>

                            <div className="form-check mb-4">
                                <input className="form-check-input" type="checkbox" value="" id="rememberMe" />
                                <label className="form-check-label text-muted small" htmlFor="rememberMe">
                                    Ingat perangkat ini
                                </label>
                            </div>

                            <button type="submit" className="btn btn-primary w-100 py-2.5 rounded-3 fw-bold mb-3 shadow-sm btn-brand-primary">
                                Masuk ke Sistem <i className="fa-solid fa-arrow-right-to-bracket ms-2"></i>
                            </button>

                            <p className="text-center text-muted small mb-0">
                                Belum memiliki akun? <Link to="/register" className="text-decoration-none text-teal fw-semibold">Daftar Sekarang</Link>
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
