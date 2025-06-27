import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Loading from "../../Loading";

export default function ViewAllContacts() {
  const [contacts, setContacts] = useState([]);
  const [contactSearchTerm, setContactSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("authToken");

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await axios.get("https://lms-backend-flwq.onrender.com/api/v1/contacts", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        const mappedContacts = response.data.map((contact) => ({
          _id: contact._id,
          name: contact.name,
          email: contact.email,
          subject: contact.subject,
          query: contact.query,
          type: contact.type.charAt(0).toUpperCase() + contact.type.slice(1),
        }));
        setContacts(mappedContacts);
        setLoading(false);
      } catch (error) {
        const errorMessage =
          error.response?.status === 401
            ? "Unauthorized: Please check your token or log in again."
            : "Failed to fetch contacts. Please try again later.";
        setError(errorMessage);
        setLoading(false);
      }
    };

    if (token) fetchContacts();
    else {
      setError("No authentication token found. Please log in.");
      setLoading(false);
    }
  }, [token]);

  const filteredContacts = contacts.filter(
    (c) =>
      c.name.toLowerCase().includes(contactSearchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(contactSearchTerm.toLowerCase()) ||
      c.subject.toLowerCase().includes(contactSearchTerm.toLowerCase()) ||
      c.query.toLowerCase().includes(contactSearchTerm.toLowerCase()) ||
      c.type.toLowerCase().includes(contactSearchTerm.toLowerCase())
  );

  if (loading) return <Loading />;
  if (error) {
    return (
      <div className="p-4 sm:p-6 text-red-600 dark:text-red-400" style={{ backgroundColor: "var(--bg-color)", color: "var(--text-color)" }}>
        {error}
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 min-h-screen font-sans" style={{ backgroundColor: "var(--bg-color)", color: "var(--text-color)" }}>
      <div className="flex items-center gap-4 mb-6">
        <Link
          to="/ticket-contact"
          className="flex items-center px-3 py-2 rounded text-white text-sm"
          style={{ backgroundColor: "var(--button-color)" }}
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </Link>
        <h1 className="text-3xl font-semibold">All Contacts</h1>
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4">
        <div>
          <h2 className="text-xl font-medium mb-1">Contacts ({contacts.length})</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">View list of All Contact Queries Below</p>
        </div>
        <input
          type="text"
          placeholder="Search contacts..."
          value={contactSearchTerm}
          onChange={(e) => setContactSearchTerm(e.target.value)}
          className="pl-3 pr-4 py-2 border rounded-md w-full md:w-64 focus:outline-none focus:ring-2"
          style={{
            borderColor: "var(--border-color)",
            backgroundColor: "var(--card-bg)",
            color: "var(--text-color)",
          }}
        />
      </div>

      {/* Mobile View */}
      <div className="md:hidden grid gap-4 mb-4">
        {filteredContacts.map((c) => (
          <div key={c._id} className="p-4 rounded shadow border transition-shadow" style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--border-color)" }}>
            <h3 className="font-medium text-lg">{c.name}</h3>
            <p className="text-sm"><span className="font-semibold">Email:</span> {c.email}</p>
            <p className="text-sm"><span className="font-semibold">Subject:</span> {c.subject}</p>
            <p className="text-sm"><span className="font-semibold">Type:</span> {c.type}</p>
            <p className="text-sm">
              <span className="font-semibold">Query:</span>{" "}
              <span className="relative group">
                {c.query.length > 50 ? `${c.query.substring(0, 50)}...` : c.query}
                <span className="absolute left-0 mt-1 p-2 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                  {c.query}
                </span>
              </span>
            </p>
          </div>
        ))}
        {filteredContacts.length === 0 && (
          <p className="text-center text-gray-500 dark:text-gray-400">No contacts match your search.</p>
        )}
      </div>

      {/* Tablet View */}
      <div className="hidden md:block lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        {filteredContacts.map((c) => (
          <div key={c._id} className="p-4 rounded-xl shadow border transition-all duration-200" style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--border-color)" }}>
            <h3 className="text-lg font-semibold">{c.name}</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><p className="font-semibold">Email:</p><p className="truncate">{c.email}</p></div>
              <div><p className="font-semibold">Subject:</p><p className="truncate">{c.subject}</p></div>
              <div><p className="font-semibold">Type:</p><p className="truncate">{c.type}</p></div>
              <div><p className="font-semibold">Query:</p><p className="truncate">{c.query.length > 50 ? `${c.query.substring(0, 50)}...` : c.query}</p></div>
            </div>
          </div>
        ))}
        {filteredContacts.length === 0 && (
          <p className="text-center text-gray-500 col-span-2">No contacts match your search.</p>
        )}
      </div>

      {/* Desktop View */}
      <div className="hidden lg:block rounded shadow p-4 overflow-x-auto" style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--border-color)" }}>
        <table className="min-w-full text-sm text-left">
          <thead>
            <tr className="border-b text-gray-600 dark:text-gray-300">
              <th className="py-2 px-4">Name</th>
              <th className="py-2 px-4">Email</th>
              <th className="py-2 px-4">Subject</th>
              <th className="py-2 px-4">Type</th>
              <th className="py-2 px-4">Query</th>
            </tr>
          </thead>
          <tbody>
            {filteredContacts.map((c) => (
              <tr key={c._id} className="hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                <td className="py-2 px-4">{c.name}</td>
                <td className="py-2 px-4">{c.email}</td>
                <td className="py-2 px-4">{c.subject}</td>
                <td className="py-2 px-4">{c.type}</td>
                <td className="py-2 px-4">
                  <span className="relative group">
                    {c.query.length > 50 ? `${c.query.substring(0, 50)}...` : c.query}
                    <span className="absolute left-0 mt-1 p-2 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                      {c.query}
                    </span>
                  </span>
                </td>
              </tr>
            ))}
            {filteredContacts.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center text-gray-500 py-4">
                  No contacts match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
