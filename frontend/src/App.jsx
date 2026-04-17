import { useState, useEffect, useCallback } from "react";

const COLORS = [
  { bg: "#EDE9FE", text: "#5B21B6" },
  { bg: "#DBEAFE", text: "#1D4ED8" },
  { bg: "#D1FAE5", text: "#065F46" },
  { bg: "#FCE7F3", text: "#9D174D" },
  { bg: "#FEF3C7", text: "#92400E" },
  { bg: "#CFFAFE", text: "#0E7490" },
];

function getInitials(name) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getColor(id) {
  if (typeof id === "string") {
    // Generate angka dari string UUID untuk konsistensi warna
    const sum = id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return COLORS[sum % COLORS.length];
  }
  return COLORS[(id || 0) % COLORS.length] || COLORS[0];
}

function App() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ name: "", email: "" });
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const API_URL = "http://localhost:8080/users";

  // Bungkus fungsi dengan useCallback
  const fetchUsers = useCallback(async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Error:", error);
    }
  }, []);

  // READ: Ambil data saat halaman dimuat
  useEffect(() => {
    const fetchData = async () => {
      await fetchUsers();
    };
    fetchData();
  }, [fetchUsers]);

  // Handle perubahan input form
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // CREATE & UPDATE: Submit Form
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isEditing) {
      // Logic Update (PUT)
      await fetch(`${API_URL}/${editId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setIsEditing(false);
      setEditId(null);
    } else {
      // Logic Create (POST)
      await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    }

    setForm({ name: "", email: "" }); // Reset form
    fetchUsers(); // Refresh list
  };

  // DELETE: Hapus user
  const handleDelete = async (id) => {
    await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    fetchUsers();
    setDeleteConfirm(null);
  };

  // Persiapan Edit
  const handleEdit = (user) => {
    setForm({ name: user.name, email: user.email });
    setIsEditing(true);
    setEditId(user.id);
  };

  // Batal Edit
  const handleCancel = () => {
    setIsEditing(false);
    setEditId(null);
    setForm({ name: "", email: "" });
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #EDE9FE 0%, #E0F2FE 50%, #ECFDF5 100%)",
        padding: "2.5rem 1.25rem",
        fontFamily: "'Plus Jakarta Sans', 'Segoe UI', sans-serif",
      }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />

      <div style={{ maxWidth: 820, margin: "0 auto" }}>
        {/* Header */}
        <div
          style={{
            background:
              "linear-gradient(135deg, #7C3AED 0%, #4F46E5 50%, #0EA5E9 100%)",
            borderRadius: 20,
            padding: "2rem 2.5rem",
            marginBottom: "1.5rem",
            display: "flex",
            alignItems: "center",
            gap: "1.25rem",
            boxShadow: "0 10px 40px rgba(79, 70, 229, 0.25)",
          }}
        >
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              background: "rgba(255,255,255,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg width="26" height="26" fill="none" viewBox="0 0 24 24">
              <path
                d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
                stroke="#fff"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <circle cx="9" cy="7" r="4" stroke="#fff" strokeWidth="2" />
              <path
                d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
                stroke="#fff"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div>
            <h1
              style={{
                color: "#fff",
                fontSize: 22,
                fontWeight: 700,
                margin: 0,
                letterSpacing: "-0.02em",
              }}
            >
              User Management
            </h1>
            <p
              style={{
                color: "rgba(255,255,255,0.72)",
                fontSize: 13.5,
                margin: "3px 0 0",
              }}
            >
              {users.length} registered user
            </p>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
            {users.slice(0, 3).map((u) => {
              const c = getColor(u.id);
              return (
                <div
                  key={u.id}
                  title={u.name}
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: "50%",
                    background: c.bg,
                    border: "2px solid rgba(255,255,255,0.6)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 11,
                    fontWeight: 700,
                    color: c.text,
                    marginLeft: -8,
                  }}
                >
                  {getInitials(u.name)}
                </div>
              );
            })}
          </div>
        </div>

        {/* Form Card */}
        <div
          style={{
            background: "#fff",
            borderRadius: 18,
            padding: "1.75rem 2rem",
            marginBottom: "1.25rem",
            border: isEditing ? "1.5px solid #A78BFA" : "1.5px solid #E0E7FF",
            boxShadow: isEditing
              ? "0 4px 24px rgba(124, 58, 237, 0.12)"
              : "0 2px 16px rgba(99, 102, 241, 0.07)",
            transition: "all 0.3s ease",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: "1.25rem",
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: isEditing ? "#7C3AED" : "#10B981",
              }}
            />
            <h2
              style={{
                fontSize: 15,
                fontWeight: 600,
                color: "#374151",
                margin: 0,
              }}
            >
              {isEditing ? "Edit User Data" : "Add a New User"}
            </h2>
          </div>

          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", gap: "0.875rem", flexWrap: "wrap" }}
          >
            <div style={{ flex: "1 1 200px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#6D28D9",
                  marginBottom: 6,
                  letterSpacing: "0.04em",
                }}
              >
                USERNAME
              </label>
              <input
                type="text"
                name="name"
                placeholder="Enter Your Full Name"
                value={form.name}
                onChange={handleChange}
                required
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: "1.5px solid #DDD6FE",
                  fontSize: 14,
                  color: "#1F2937",
                  background: "#FAFAFE",
                  outline: "none",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#7C3AED")}
                onBlur={(e) => (e.target.style.borderColor = "#DDD6FE")}
              />
            </div>

            <div style={{ flex: "1 1 200px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#0369A1",
                  marginBottom: 6,
                  letterSpacing: "0.04em",
                }}
              >
                EMAIL
              </label>
              <input
                type="email"
                name="email"
                placeholder="name@email.com"
                value={form.email}
                onChange={handleChange}
                required
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: "1.5px solid #BAE6FD",
                  fontSize: 14,
                  color: "#1F2937",
                  background: "#F0F9FF",
                  outline: "none",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#0284C7")}
                onBlur={(e) => (e.target.style.borderColor = "#BAE6FD")}
              />
            </div>

            <div
              style={{
                display: "flex",
                gap: 8,
                alignItems: "flex-end",
              }}
            >
              <button
                type="submit"
                style={{
                  padding: "10px 22px",
                  borderRadius: 10,
                  border: "none",
                  background: isEditing
                    ? "linear-gradient(135deg, #7C3AED, #6D28D9)"
                    : "linear-gradient(135deg, #4F46E5, #0EA5E9)",
                  color: "#fff",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                  boxShadow: isEditing
                    ? "0 4px 14px rgba(124, 58, 237, 0.4)"
                    : "0 4px 14px rgba(79, 70, 229, 0.35)",
                  transition: "all 0.2s",
                  whiteSpace: "nowrap",
                }}
              >
                {isEditing ? "✓ Update" : "+ Save"}
              </button>

              {isEditing && (
                <button
                  type="button"
                  onClick={handleCancel}
                  style={{
                    padding: "10px 18px",
                    borderRadius: 10,
                    border: "1.5px solid #DDD6FE",
                    background: "#F5F3FF",
                    color: "#6D28D9",
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Table Card */}
        <div
          style={{
            background: "#fff",
            borderRadius: 18,
            border: "1.5px solid #E0E7FF",
            overflow: "hidden",
            boxShadow: "0 2px 16px rgba(99, 102, 241, 0.07)",
          }}
        >
          {/* Table Header */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1.3fr auto",
              padding: "14px 24px",
              background: "linear-gradient(135deg, #F5F3FF, #EFF6FF)",
              borderBottom: "1px solid #E0E7FF",
              gap: 12,
            }}
          >
            <span
              style={{
                fontSize: 11.5,
                fontWeight: 700,
                color: "#7C3AED",
                letterSpacing: "0.06em",
              }}
            >
              NAME
            </span>
            <span
              style={{
                fontSize: 11.5,
                fontWeight: 700,
                color: "#0369A1",
                letterSpacing: "0.06em",
              }}
            >
              EMAIL
            </span>
            <span
              style={{
                fontSize: 11.5,
                fontWeight: 700,
                color: "#6B7280",
                letterSpacing: "0.06em",
                textAlign: "center",
                minWidth: 110,
              }}
            >
              ACTIONS
            </span>
          </div>

          {users.length > 0 ? (
            users.map((user, idx) => {
              const col = getColor(user.id);
              const isEven = idx % 2 === 0;
              return (
                <div
                  key={user.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1.3fr auto",
                    padding: "14px 24px",
                    borderBottom:
                      idx < users.length - 1 ? "1px solid #F3F4F6" : "none",
                    background: isEven ? "#FAFAFE" : "#fff",
                    alignItems: "center",
                    gap: 12,
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#F5F3FF")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = isEven
                      ? "#FAFAFE"
                      : "#fff")
                  }
                >
                  {/* Name + Avatar */}
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 12 }}
                  >
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        background: col.bg,
                        color: col.text,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 12,
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      {getInitials(user.name)}
                    </div>
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: "#1F2937",
                      }}
                    >
                      {user.name}
                    </span>
                  </div>

                  {/* Email */}
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <div
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: "#10B981",
                        flexShrink: 0,
                      }}
                    />
                    <span style={{ fontSize: 13.5, color: "#4B5563" }}>
                      {user.email}
                    </span>
                  </div>

                  {/* Actions */}
                  <div
                    style={{
                      display: "flex",
                      gap: 6,
                      minWidth: 110,
                      justifyContent: "flex-end",
                    }}
                  >
                    <button
                      onClick={() => handleEdit(user)}
                      style={{
                        padding: "6px 14px",
                        borderRadius: 8,
                        border: "1.5px solid #DDD6FE",
                        background: "#F5F3FF",
                        color: "#7C3AED",
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = "#EDE9FE";
                        e.target.style.borderColor = "#A78BFA";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = "#F5F3FF";
                        e.target.style.borderColor = "#DDD6FE";
                      }}
                    >
                      Edit
                    </button>

                    {deleteConfirm === user.id ? (
                      <button
                        onClick={() => handleDelete(user.id)}
                        style={{
                          padding: "6px 14px",
                          borderRadius: 8,
                          border: "none",
                          background:
                            "linear-gradient(135deg, #EF4444, #DC2626)",
                          color: "#fff",
                          fontSize: 13,
                          fontWeight: 600,
                          cursor: "pointer",
                          boxShadow: "0 2px 8px rgba(239, 68, 68, 0.35)",
                        }}
                      >
                        Sure?
                      </button>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirm(user.id)}
                        style={{
                          padding: "6px 14px",
                          borderRadius: 8,
                          border: "1.5px solid #FECACA",
                          background: "#FEF2F2",
                          color: "#EF4444",
                          fontSize: 13,
                          fontWeight: 600,
                          cursor: "pointer",
                          transition: "all 0.2s",
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = "#FEE2E2";
                          e.target.style.borderColor = "#FCA5A5";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = "#FEF2F2";
                          e.target.style.borderColor = "#FECACA";
                        }}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div style={{ padding: "4rem 2rem", textAlign: "center" }}>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 16,
                  background: "#F5F3FF",
                  margin: "0 auto 1rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
                  <path
                    d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
                    stroke="#A78BFA"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <circle
                    cx="9"
                    cy="7"
                    r="4"
                    stroke="#A78BFA"
                    strokeWidth="2"
                  />
                  <line
                    x1="22"
                    y1="11"
                    x2="16"
                    y2="11"
                    stroke="#A78BFA"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <line
                    x1="19"
                    y1="8"
                    x2="19"
                    y2="14"
                    stroke="#A78BFA"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <p style={{ color: "#9CA3AF", fontSize: 14, margin: 0 }}>
                Belum ada data user.
              </p>
              <p
                style={{ color: "#C4B5FD", fontSize: 12.5, margin: "4px 0 0" }}
              >
                Tambahkan user pertama di atas.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ textAlign: "center", marginTop: "1.25rem" }}>
          <span style={{ fontSize: 12, color: "#A78BFA" }}>
            Total {users.length} user • User Management System
          </span>
        </div>
      </div>
    </div>
  );
}

export default App;
