import React from 'react';

export default function MembersPage({ members, onUpdateRole }) {
  return (
    <div>
      <h2 className="fw-bold mb-4" style={{ color: 'var(--vd-desk-navy)' }}>
        Manajemen Akun Member & Staf
      </h2>

      <div className="vd-card p-4">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Pengguna</th>
                <th>Email</th>
                <th>Peran Saat Ini</th>
                <th>Terdaftar</th>
                <th>Ubah Hak Akses</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.id}>
                  <td>
                    <div className="fw-semibold">@{m.username}</div>
                    <small className="text-muted">{m.profile?.fullname || '-'}</small>
                  </td>
                  <td>{m.email}</td>
                  <td>
                    <span
                      className={`badge ${
                        m.role === 'Admin'
                          ? 'bg-danger'
                          : m.role === 'Librarian'
                          ? 'bg-info'
                          : 'bg-secondary'
                      }`}
                    >
                      {m.role}
                    </span>
                  </td>
                  <td className="small text-muted">{new Date(m.createdAt).toLocaleDateString('id-ID')}</td>
                  <td>
                    <select
                      className="form-select form-select-sm"
                      style={{ width: '130px' }}
                      value={m.role}
                      onChange={(e) => onUpdateRole(m.id, e.target.value)}
                    >
                      <option value="Member">Member</option>
                      <option value="Librarian">Librarian</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
