import React, { useState, useEffect } from 'react';

export default function StaffPage({ apiUrl, token }) {
  const [staffList, setStaffList] = useState([]);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Librarian');
  const [fullname, setFullname] = useState('');

  const loadStaff = async () => {
    try {
      const res = await fetch(`${apiUrl}/api/staff`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.data) setStaffList(data.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadStaff();
  }, [apiUrl, token]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${apiUrl}/api/staff`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ username, email, password, role, fullname }),
      });
      if (res.ok) {
        setUsername('');
        setEmail('');
        setPassword('');
        setFullname('');
        loadStaff();
      } else {
        const err = await res.json();
        alert(err.message || 'Gagal menambahkan staf.');
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div>
      <h2 className="fw-bold mb-4" style={{ color: 'var(--vd-desk-navy)' }}>
        Manajemen Akun Staf & Hak Akses
      </h2>

      <div className="row g-4">
        <div className="col-md-4">
          <div className="vd-card p-4">
            <h5 className="fw-bold mb-3">Tambah Staf Baru</h5>
            <form onSubmit={handleCreate}>
              <div className="mb-3">
                <label className="form-label small fw-semibold">Nama Lengkap</label>
                <input
                  type="text"
                  className="form-control"
                  value={fullname}
                  onChange={(e) => setFullname(e.target.value)}
                  placeholder="Misal: Dewi Kartika"
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label small fw-semibold">Username</label>
                <input
                  type="text"
                  className="form-control"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="dewi.librarian"
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label small fw-semibold">Email</label>
                <input
                  type="email"
                  className="form-control"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="dewi@vibedesk.app"
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label small fw-semibold">Password</label>
                <input
                  type="password"
                  className="form-control"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label small fw-semibold">Peran (Role)</label>
                <select className="form-select" value={role} onChange={(e) => setRole(e.target.value)}>
                  <option value="Librarian">Librarian (Pustakawan)</option>
                  <option value="Admin">Admin (Super Administrator)</option>
                </select>
              </div>
              <button type="submit" className="btn btn-vd-primary btn-sm w-100">
                Buat Akun Staf
              </button>
            </form>
          </div>
        </div>

        <div className="col-md-8">
          <div className="vd-card p-4">
            <h5 className="fw-bold mb-3">Daftar Akun Staf Aktif ({staffList.length})</h5>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Staf</th>
                    <th>Email</th>
                    <th>Peran</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {staffList.map((s) => (
                    <tr key={s.id}>
                      <td>
                        <div className="fw-semibold">{s.profile?.fullname || s.username}</div>
                        <small className="text-muted">@{s.username}</small>
                      </td>
                      <td>{s.email}</td>
                      <td>
                        <span className={`badge ${s.role === 'Admin' ? 'bg-danger' : 'bg-info'}`}>
                          {s.role}
                        </span>
                      </td>
                      <td>
                        <span className="badge bg-success-subtle text-success">Aktif</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
