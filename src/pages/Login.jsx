import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => { if (u) navigate("/dashboard", { replace: true }); });
    return unsub;
  }, [navigate]);

  async function onSubmit(e) {
    e.preventDefault();
    setMsg("");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setMsg(err.message || "Sign in failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="center-screen">
      <div className="auth-wrap">
        <div className="auth-card card">
          <div className="brand">
            <div className="logo">BS</div>
            <div>
              <div style={{fontSize:14, color:"#a8b4c6"}}>BikeShop</div>
              <div style={{fontSize:12, color:"var(--muted)"}}>Admin dashboard</div>
            </div>
          </div>

          <h2 className="title">Welcome back</h2>

          <form onSubmit={onSubmit}>
            <label className="label">Email</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required />

            <label className="label">Password</label>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required />

            <button className="btn" disabled={loading}>{loading ? "Signing in…" : "Sign in"}</button>
            <div className="msg">{msg}</div>
          </form>
        </div>

        <div style={{maxWidth:420, color:"var(--muted)", textAlign:"center"}}>
          <p style={{margin:0}}>Only approved staff can access this panel. Make sure you use your admin email.</p>
        </div>
      </div>
    </div>
  );
}