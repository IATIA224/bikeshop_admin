import React, { useEffect, useRef, useState } from "react";
import { auth, db } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  collection,
  doc,
  setDoc,
  writeBatch,
  serverTimestamp,
  addDoc,
  onSnapshot,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  limit
} from "firebase/firestore";
import * as XLSX from "xlsx";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("");
  const [progress, setProgress] = useState(0);
  const [recentUploads, setRecentUploads] = useState([]);
  const [collectionName, setCollectionName] = useState("prices"); // new selector
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);
  const [creatingForm, setCreatingForm] = useState({});
  const [expandedId, setExpandedId] = useState(null);
  const fileRef = useRef();

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (u) => {
      if (!u) window.location.replace("/");
      else setUser(u);
    });
    return unsubAuth;
  }, []);

  // subscribe to selected collection
  useEffect(() => {
    if (!collectionName) return;
    const q = query(collection(db, collectionName), orderBy("__name__"), limit(200));
    const unsub = onSnapshot(q, (snap) => {
      const list = [];
      snap.forEach(d => list.push({ id: d.id, ...d.data() }));
      setItems(list);
    }, (err) => {
      setStatus("Failed to load collection: " + err.message);
    });

    return () => unsub();
  }, [collectionName]);

  function setStatusMsg(s) {
    setStatus(s);
  }

  function chunkArray(arr, n) {
    const out = [];
    for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
    return out;
  }

  // upload parsed rows into selected collection
  async function uploadRowsToCollection(rows, meta = {}) {
    if (!rows?.length) throw new Error("No rows");
    const chunks = chunkArray(rows, 400);
    let saved = 0;
    for (const chunk of chunks) {
      const batch = writeBatch(db);
      for (const r of chunk) {
        // If row contains an id-like key, reuse it; otherwise create a new doc id
        const ref = doc(collection(db, collectionName));
        batch.set(ref, { ...r, _uploadedFrom: meta.filename || null, _uploadedBy: meta.email || null, _uploadedAt: serverTimestamp() });
        saved++;
      }
      await batch.commit();
      setProgress(saved / rows.length);
    }
    return { rowCount: rows.length };
  }

  async function parseArrayBufferToJson(buffer) {
    const wb = XLSX.read(buffer, { type: "array" });
    const sheetName = wb.SheetNames[0];
    const ws = wb.Sheets[sheetName];
    const json = XLSX.utils.sheet_to_json(ws, { defval: null });
    return { json, sheetName };
  }

  async function onUpload(e) {
    e.preventDefault();
    setStatus(""); setProgress(0);
    const f = fileRef.current?.files?.[0];
    if (!f) return setStatusMsg("Select .xlsx file");

    try {
      setStatusMsg("Reading file...");
      const buf = await f.arrayBuffer();
      const { json, sheetName } = await parseArrayBufferToJson(buf);
      if (!json.length) return setStatusMsg("No rows found");
      setStatusMsg(`Uploading to "${collectionName}"...`);
      const res = await uploadRowsToCollection(json, { filename: f.name, uid: user?.uid, email: user?.email, sheetName });
      setProgress(1); setStatusMsg(`Uploaded ${res.rowCount} rows into "${collectionName}"`);
      setRecentUploads(prev => [{ id: Date.now().toString(), rows: res.rowCount, file: f.name, at: new Date().toLocaleString(), collection: collectionName }, ...prev].slice(0, 6));
      fileRef.current.value = "";
    } catch (err) {
      setStatusMsg("Upload failed: " + err.message);
    }
  }

  async function addItem(formData) {
    setStatusMsg("Saving...");
    try {
      await addDoc(collection(db, collectionName), { ...formData, createdBy: user?.email || user?.uid, createdAt: serverTimestamp() });
      setStatusMsg("Saved");
      setCreating(false);
      setCreatingForm({});
    } catch (err) {
      setStatusMsg("Save failed: " + err.message);
    }
  }

  async function updateItem(id, data) {
    setStatusMsg("Updating...");
    try {
      const ref = doc(db, collectionName, id);
      await updateDoc(ref, { ...data, updatedAt: serverTimestamp() });
      setEditing(null);
      setStatusMsg("Updated");
    } catch (err) {
      setStatusMsg("Update failed: " + err.message);
    }
  }

  async function removeItem(id) {
    // replace global confirm() to avoid ESLint no-restricted-globals error
    if (!window.confirm("Delete this item?")) return;

    setStatusMsg("Deleting...");
    try {
      await deleteDoc(doc(db, collectionName, id));
      setStatusMsg("Deleted");
    } catch (err) {
      setStatusMsg("Delete failed: " + err.message);
    }
  }

  async function doSignOut() {
    await signOut(auth);
    window.location.replace("/");
  }

  if (!user) return <div style={{ padding: 24 }}>Redirecting to login…</div>;

  // simple schema UIs for quick CRUD
  function CollectionForm({ onSubmit, initial = {}, onCancel }) {
    const [form, setForm] = useState(initial);
    // Choose fields default to common keys depending on collection
    const defaults = collectionName === "prices"
      ? ["productId", "productName", "price", "currency"]
      : ["serviceId", "title", "description", "cost"];

    // show inputs for each key (existing keys + defaults)
    const keys = Array.from(new Set([...Object.keys(initial), ...defaults]));
    return (
      <div style={{ marginTop: 10 }}>
        {keys.map(k => (
          <div key={k} style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <div style={{ width: 130, color: "var(--muted)" }}>{k}</div>
            <input
              style={{ width: "100%", padding: 8, borderRadius: 8, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.03)", color: "#fff" }}
              value={form[k] ?? ""}
              onChange={(e) => setForm({ ...form, [k]: e.target.value })}
            />
          </div>
        ))}

        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <button className="btn small" onClick={() => onSubmit(form)} type="button">Save</button>
          <button className="btn small" onClick={onCancel} type="button" style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.04)" }}>Cancel</button>
        </div>
      </div>
    );
  }

  function formatDate(ts) {
    if (!ts) return "";
    // Firestore Timestamp -> JS Date, or plain ISO string
    if (typeof ts?.toDate === "function") ts = ts.toDate();
    if (typeof ts === "number") ts = new Date(ts);
    const d = new Date(ts);
    return isNaN(d.getTime()) ? "" : d.toLocaleString();
  }

  function niceTitle(item) {
    const v = item?.title ?? item?.productName ?? item?.serviceId ?? item?.productId ?? item?.ID;
    if (v == null) return "Untitled";
    if (typeof v === "string") return v;
    try { return JSON.stringify(v); } catch { return String(v); }
  }

  function niceSubtitle(item) {
    const v = item?.description ?? item?.summary ?? item?.SERVICES ?? item?.PRICE ?? "";
    if (v == null) return "";
    return typeof v === "string" ? v : (typeof v === "object" ? JSON.stringify(v) : String(v));
  }

  function primaryValue(item) {
    const v = item?.price ?? item?.cost ?? item?.PRICE ?? null;
    return v == null ? null : (typeof v === "string" ? v : String(v));
  }

  // replace item rendering block below (previously JSON strings)
  return (
    <div className="app-shell">
      <div className="card header">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 18, fontWeight: 700 }}>BikeShop Admin</div>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>Upload product data via .xlsx — choose target collection</div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div className="user-pill">
            <div style={{ width: 36, height: 36, borderRadius: 8, background: "linear-gradient(90deg,var(--accent),var(--accent-2))", display: "flex", justifyContent: "center", alignItems: "center", fontWeight: 700 }}>
              {user.email?.[0]?.toUpperCase() || user.uid?.slice(0, 1)}
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: 13 }}>{user.email}</div>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>Signed in</div>
            </div>
          </div>

          <button className="btn small" onClick={doSignOut}>Sign out</button>
        </div>
      </div>

      <div className="card">
        {/* UPLOAD CONTROLS (restored) */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <label style={{ color: "var(--muted)" }}>Target collection</label>
            <select value={collectionName} onChange={(e) => setCollectionName(e.target.value)} style={{ padding: 8, borderRadius: 8, background: "rgba(255,255,255,0.02)", color: "#fff", border: "1px solid rgba(255,255,255,0.03)" }}>
              <option value="prices">prices</option>
              <option value="services">services</option>
            </select>

            <label className="input-file" style={{ cursor: "pointer" }}>
              <input ref={fileRef} type="file" accept=".xlsx,.xls" style={{ display: "none" }} onChange={() => setStatus("")} />
              <span style={{ color: "var(--muted)" }}>{fileRef.current?.files?.[0]?.name || "Choose .xlsx file"}</span>
            </label>

            <button className="primary" onClick={onUpload} type="button">Upload</button>
          </div>

          <div style={{ color: "var(--muted)" }}>{status}</div>
        </div>

        {/* keep existing Create/Refresh + table below */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={{ fontWeight: 700 }}>Collection: {collectionName}</div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn small" onClick={() => { setCreating(true); setEditing(null); }}>Create new</button>
            <button className="btn small" onClick={() => { setCreating(false); setEditing(null); }}>Refresh</button>
          </div>
        </div>

        {/* table view */}
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 64 }}></th>
                <th>Title / Name</th>
                <th style={{ width: 260 }}>Description</th>
                <th style={{ width: 120 }}>Price</th>
                <th style={{ width: 160 }}>Uploaded / Updated</th>
                <th style={{ width: 110 }}>ID</th>
                <th style={{ width: 210 }}></th>
              </tr>
            </thead>

            <tbody>
              {items.length === 0 ? (
                <tr className="empty-row"><td colSpan="7">No documents found in {collectionName}.</td></tr>
              ) : items.map(item => {
                const price = primaryValue(item);
                const subtitle = niceSubtitle(item);
                const title = niceTitle(item);
                const uploadedAt = formatDate(item._uploadedAt ?? item.createdAt ?? item.uploadedAt);
                const updatedAt = formatDate(item.updatedAt);
                const images = Array.isArray(item.IMAGES) ? item.IMAGES : (item.IMAGES ? [item.IMAGES] : []);
                return (
                  <tr key={item.id} className="data-row">
                    <td>
                      {images.length > 0 && typeof images[0] === "string" ? (
                        <img src={images[0]} alt="" className="thumbnail" />
                      ) : (
                        <div className="thumb-fallback">{String(title ?? '').slice(0,2).toUpperCase()}</div>
                      )}
                    </td>

                    <td>
                      <div className="row-title">{title}</div>
                      <div className="row-subtitle">{subtitle}</div>
                    </td>

                    <td>
                      <div className="desc-snippet">{(subtitle || "").toString().slice(0,120)}{(subtitle?.toString().length ?? 0) > 120 ? '…' : ''}</div>
                    </td>

                    <td>
                      {price != null ? <div className="price-pill">{price}</div> : <div className="muted">—</div>}
                    </td>

                    <td>
                      <div style={{ fontSize: 13, color: "var(--muted)" }}>{uploadedAt || updatedAt}</div>
                    </td>

                    <td>
                      <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 12, color: "var(--muted)" }}>{String(item.id).slice(0,12)}</div>
                    </td>

                    <td className="actions-cell">
                      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                        <button className="btn small" onClick={() => { setEditing(item); setCreating(false); setExpandedId(null); }}>Edit</button>
                        <button className="btn small" onClick={() => removeItem(item.id)} style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.04)" }}>Delete</button>
                        <button className="btn small" onClick={() => setExpandedId(expandedId === item.id ? null : item.id)} style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.04)" }}>
                          {expandedId === item.id ? "Close" : "View"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {expandedId && (
          <div style={{ marginTop: 12 }}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Details</div>
            <div style={{ padding: 12, borderRadius: 8, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.03)" }}>
              <pre style={{ color: "var(--muted)", whiteSpace: "pre-wrap", fontSize: 12 }}>
                {JSON.stringify(items.find(i => i.id === expandedId), null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>

      {/* edit/create form */}
      {creating && (
        <div style={{ marginTop: 12 }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Create new {collectionName} item</div>
          <CollectionForm
            initial={creatingForm}
            onSubmit={(form) => addItem(form)}
            onCancel={() => setCreating(false)}
          />
        </div>
      )}

      {editing && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-card card">
            <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8}}>
              <div style={{fontWeight:700}}>Edit {collectionName} — id: {editing.id}</div>
              <button className="btn small" onClick={() => setEditing(null)} style={{background:"transparent", border:"1px solid rgba(255,255,255,0.04)"}}>Close</button>
            </div>

            <CollectionForm
              initial={editing}
              onSubmit={(form) => updateItem(editing.id, form)}
              onCancel={() => setEditing(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}