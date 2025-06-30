import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChartBar, faDownload } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import { Link } from "react-router-dom";
import Loading from "../Loading";

export default function ViewTicket() {
  const [tickets, setTickets] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [ticketSearchTerm, setTicketSearchTerm] = useState("");
  const [contactSearchTerm, setContactSearchTerm] = useState("");
  const [totalTickets, setTotalTickets] = useState(0);
  const [resolvedTickets, setResolvedTickets] = useState(0);
  const [totalTicketsGrowth, setTotalTicketsGrowth] = useState(null);
  const [resolvedTicketsGrowth, setResolvedTicketsGrowth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloadError, setDownloadError] = useState(null);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [resolutionText, setResolutionText] = useState("");
  const [resolveError, setResolveError] = useState(null);

  const token = localStorage.getItem("authToken");

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const axiosInstance = axios.create({
          baseURL: "https://lms-backend-flwq.onrender.com/api/v1/admin",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const today = new Date("2025-05-21");
        const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const previousMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const previousMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);

        const formatDate = (date) => date.toISOString().split("T")[0];

        const currentResponse = await axiosInstance.get(
          `/tickets?startDate=${formatDate(currentMonthStart)}&endDate=${formatDate(today)}`
        );
        const currentData = currentResponse.data;

        const mappedTickets = currentData.data.map((ticket) => ({
          ticketId: ticket._id,
          name: `${ticket.user.firstName} ${ticket.user.lastName}`,
          category: ticket.category.charAt(0).toUpperCase() + ticket.category.slice(1),
          status: ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1),
          _id: ticket._id,
        }));

        const currentTotal = currentData.total || mappedTickets.length;
        const currentResolved = mappedTickets.filter((t) => t.status.toLowerCase() === "resolved").length;

        const previousResponse = await axiosInstance.get(
          `/tickets?startDate=${formatDate(previousMonthStart)}&endDate=${formatDate(previousMonthEnd)}`
        );
        const previousData = previousResponse.data;

        const previousTotal = previousData.data.length;
        const previousResolved = previousData.data.filter(
          (t) => t.status.toLowerCase() === "resolved"
        ).length;

        const calculateGrowth = (current, previous) => {
          if (previous === 0) return "N/A";
          return ((current - previous) / previous * 100).toFixed(1);
        };

        setTickets(mappedTickets);
        setTotalTickets(currentTotal);
        setResolvedTickets(currentResolved);
        setTotalTicketsGrowth(calculateGrowth(currentTotal, previousTotal));
        setResolvedTicketsGrowth(calculateGrowth(currentResolved, previousResolved));
      } catch (error) {
        console.error("Error fetching tickets:", error);
        const errorMessage =
          error.response?.data?.message ||
          (error.response?.status === 401
            ? "Unauthorized: Please check your token or log in again."
            : "Failed to fetch tickets. Please try again later.");
        setError(errorMessage);
      }
    };

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
      } catch (error) {
        console.error("Error fetching contacts:", error);
        setError(
          error.response?.status === 401
            ? "Unauthorized: Please check your token or log in again."
            : "Failed to fetch contacts. Please try again later."
        );
      }
    };

    if (token) {
      Promise.all([fetchTickets(), fetchContacts()]).finally(() => setLoading(false));
    } else {
      setError("No authentication token found. Please log in.");
      setLoading(false);
    }
  }, [token]);

  const handleDownload = async (ticketId) => {
    try {
      setDownloadError(null);
      const axiosInstance = axios.create({
        baseURL: "https://lms-backend-flwq.onrender.com/api/v1/admin",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/pdf",
        },
        responseType: "blob",
        timeout: 10000,
      });

      const response = await axiosInstance.get(`/tickets/${ticketId}/download`);
      const contentType = response.headers["content-type"];
      if (!contentType.includes("application/pdf")) {
        throw new Error("Server did not return a PDF file");
      }
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `ticket-${ticketId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading ticket:", error);
      let errorMessage;
      if (error.response?.status === 401) {
        errorMessage = "Unauthorized: Please check your token or log in again.";
      } else if (error.message === "Server did not return a PDF file") {
        errorMessage = "Failed to download ticket: Server did not return a PDF file.";
      } else if (error.code === "ECONNABORTED") {
        errorMessage = "Request timed out. Please check your connection or try again later.";
      } else {
        errorMessage = `Failed to download ticket as PDF: ${error.message || "Unknown error"}. Please try again later.`;
      }
      setDownloadError(errorMessage);
    }
  };

  const handleResolve = async () => {
    try {
      setResolveError(null);
      const axiosInstance = axios.create({
        baseURL: "https://lms-backend-flwq.onrender.com/api/v1/admin",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      await axiosInstance.patch(`/tickets/${selectedTicketId}/resolve`, {
        resolution: resolutionText,
      });

      setTickets(tickets.map((ticket) =>
        ticket.ticketId === selectedTicketId
          ? { ...ticket, status: "Resolved" }
          : ticket
      ));
      setShowResolveModal(false);
      setResolutionText("");
    } catch (error) {
      console.error("Error resolving ticket:", error);
      const errorMessage =
        error.response?.status === 401
          ? "Unauthorized: Please check your token or log in again."
          : "Failed to resolve ticket. Please try again later.";
      setResolveError(errorMessage);
    }
  };

  const getStatusColor = (status) =>
    status.toLowerCase() === "resolved"
      ? "bg-green-900 border-green-500 text-green-300"
      : "bg-red-900 border-red-500 text-red-300";

  const getGrowthColor = (growth) =>
    growth === "N/A"
      ? "bg-[var(--card-bg)] text-[var(--text-color)] border-[var(--border-color)]"
      : parseFloat(growth) > 0
      ? "bg-green-900 text-green-300 border-green-500"
      : "bg-red-900 text-red-300 border-red-500";

  const getGrowthText = (growth) =>
    growth === "N/A" ? "N/A" : parseFloat(growth) > 0 ? `↑ ${growth}%` : `↓ ${Math.abs(growth)}%`;

  const filteredTickets = tickets
    .filter(
      (t) =>
        t.status.toLowerCase() !== "resolved" &&
        (t.name.toLowerCase().includes(ticketSearchTerm.toLowerCase()) ||
          t.ticketId.toLowerCase().includes(ticketSearchTerm.toLowerCase()) ||
          t.category.toLowerCase().includes(ticketSearchTerm.toLowerCase()) ||
          t.status.toLowerCase().includes(ticketSearchTerm.toLowerCase()))
    )
    .sort((a, b) => a.name.localeCompare(b.name)) // Optional: Sort by name in ascending order
    .slice(0, 7);

  const filteredContacts = contacts
    .filter(
      (c) =>
        c.name.toLowerCase().includes(contactSearchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(contactSearchTerm.toLowerCase()) ||
        c.subject.toLowerCase().includes(contactSearchTerm.toLowerCase()) ||
        c.query.toLowerCase().includes(contactSearchTerm.toLowerCase()) ||
        c.type.toLowerCase().includes(contactSearchTerm.toLowerCase())
    )
    .slice(0, 7);

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <div className="p-4 sm:p-6 text-red-400" style={{ backgroundColor: 'var(--bg-color)' }}>{error}</div>;
  }

  return (
    <div className="p-4 sm:p-6 min-h-screen" style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-color)' }}>
      <h1 className="text-3xl font-semibold mb-6 text-center md:text-left">Tickets & Contacts</h1>

      {downloadError && (
        <div className="mb-4 p-3 bg-red-800 text-red-200 rounded">
          {downloadError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {[
          { label: "Total Tickets", value: totalTickets, growth: totalTicketsGrowth },
          { label: "Tickets Resolved", value: resolvedTickets, growth: resolvedTicketsGrowth },
        ].map((item, i) => (
          <div
            key={i}
            className="rounded-xl p-6 sm:p-8 shadow-lg relative w-full min-h-[220px]"
            style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)', borderWidth: '1px' }}
          >
            <div className="absolute top-5 left-5 p-3 rounded-md" style={{ backgroundColor: 'var(--card-bg)' }}>
              <FontAwesomeIcon
                icon={faChartBar}
                className="text-2xl"
                style={{ color: 'var(--accent-color)' }}
              />
            </div>
            <div className="flex flex-col justify-end h-full pt-12 mt-4">
              <div className="text-lg mb-1" style={{ color: 'var(--text-color)' }}>{item.label}</div>
              <div className="text-4xl font-bold" style={{ color: 'var(--text-color)' }}>{item.value}</div>
            </div>
            {/* <div className="absolute bottom-5 right-5">
              <span
                className={`inline-flex items-center text-sm px-4 py-2 rounded-full border ${getGrowthColor(item.growth)}`}
              >
                {getGrowthText(item.growth)}
              </span>
            </div> */}
          </div>
        ))}
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4">
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-xl font-medium mb-1" style={{ color: 'var(--text-color)' }}>
              Tickets ( {totalTickets} )
            </h2>
            <p className="text-sm" style={{ color: 'var(--text-color)' }}>View list of Complaints Below</p>
          </div>
          <Link
            to="/ticket-contact/all-tickets"
            className="px-4 py-2 rounded text-sm"
            style={{ backgroundColor: 'var(--accent-color)', color: 'var(--text-color)', borderColor: 'var(--accent-color)' }}
          >
            All Tickets
          </Link>
        </div>
        <div className="relative w-full md:w-64">
          <input
            type="text"
            placeholder="Search tickets by name, ID, category, or status..."
            value={ticketSearchTerm}
            onChange={(e) => setTicketSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 rounded-md w-full focus:outline-none focus:ring-2"
            style={{
              backgroundColor: 'var(--card-bg)',
              color: 'var(--text-color)',
              borderColor: 'var(--border-color)',
              borderWidth: '1px',
              '--tw-ring-color': 'var(--accent-color)',
            }}
          />
        </div>
      </div>

      {showResolveModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-50">
          <div
            className="p-6 rounded-lg shadow-lg w-full max-w-md"
            style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)', borderWidth: '1px' }}
          >
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-color)' }}>Resolve Ticket</h3>
            {resolveError && (
              <div className="mb-4 p-3 bg-red-800 text-red-200 rounded">
                {resolveError}
              </div>
            )}
            <textarea
              className="w-full p-2 rounded-md focus:outline-none focus:ring-2"
              rows="4"
              value={resolutionText}
              onChange={(e) => setResolutionText(e.target.value)}
              placeholder="Enter resolution details..."
              style={{
                backgroundColor: 'var(--card-bg)',
                color: 'var(--text-color)',
                borderColor: 'var(--border-color)',
                borderWidth: '1px',
                '--tw-ring-color': 'var(--accent-color)',
              }}
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowResolveModal(false);
                  setResolutionText("");
                  setResolveError(null);
                }}
                className="px-4 py-2 rounded"
                style={{ backgroundColor: 'var(--card-bg)', color: 'var(--text-color)' }}
              >
                Cancel
              </button>
              <button
                onClick={handleResolve}
                className="px-4 py-2 rounded"
                style={{
                  backgroundColor: 'var(--accent-color)',
                  color: 'var(--text-color)',
                  borderColor: 'var(--accent-color)',
                  borderWidth: '1px'
                }}
                disabled={!resolutionText.trim()}
              >
                Resolve
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile View (below md) */}
      <div className="md:hidden grid gap-4 mb-4">
        {filteredTickets.map((t) => (
          <div
            key={t._id}
            className="p-4 rounded-lg shadow-md transition-shadow"
            style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)', borderWidth: '1px' }}
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-base font-medium" style={{ color: 'var(--text-color)' }}>{t.name}</h3>
              <button
                onClick={() => {
                  setSelectedTicketId(t.ticketId);
                  setShowResolveModal(true);
                }}
                className="px-2 py-1 text-xs rounded"
                style={{ backgroundColor: 'var(--accent-color)', color: 'var(--text-color)', borderColor: 'var(--accent-color)' }}
              >
                Resolve
              </button>
            </div>
            <p className="text-sm mb-1" style={{ color: 'var(--text-color)' }}>
              <span className="font-semibold">Ticket ID:</span> {t.ticketId}
            </p>
            <p className="text-sm mb-1" style={{ color: 'var(--text-color)' }}>
              <span className="font-semibold">Nature of Ticket:</span> {t.category}
            </p>
            <div className="mt-2">
              <button
                onClick={() => handleDownload(t.ticketId)}
                className="px-3 py-1 rounded text-sm flex items-center gap-2"
                style={{ borderColor: 'var(--border-color)', borderWidth: '1px', color: 'var(--text-color)' }}
              >
                <FontAwesomeIcon icon={faDownload} /> Download
              </button>
            </div>
          </div>
        ))}
        {filteredTickets.length === 0 && (
          <div className="text-center py-4" style={{ color: 'var(--text-color)' }}>
            No unresolved tickets match your search.
          </div>
        )}
      </div>

      {/* Tablet View (md to lg) */}
      <div className="hidden md:block lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        {filteredTickets.map((t) => (
          <div
            key={t._id}
            className="p-4 rounded-xl shadow-md transition-all duration-200"
            style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)', borderWidth: '1px' }}
          >
            <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-color)' }}>{t.name}</h3>
            <div className="grid grid-cols-2 gap-2 text-sm" style={{ color: 'var(--text-color)' }}>
              <div>
                <p className="font-semibold">Ticket ID:</p>
                <p className="truncate">{t.ticketId}</p>
              </div>
              <div>
                <p className="font-semibold">Category:</p>
                <p className="truncate">{t.category}</p>
              </div>
              <div>
                <p className="font-semibold">Status:</p>
                <p className={getStatusColor(t.status)}>{t.status}</p>
              </div>
              <div>
                <p className="font-semibold">Action:</p>
                <button
                  onClick={() => {
                    setSelectedTicketId(t.ticketId);
                    setShowResolveModal(true);
                  }}
                  className="px-2 py-1 text-xs rounded"
                  style={{ backgroundColor: 'var(--accent-color)', color: 'var(--text-color)', borderColor: 'var(--accent-color)' }}
                >
                  Resolve
                </button>
              </div>
            </div>
            <div className="mt-2">
              <button
                onClick={() => handleDownload(t.ticketId)}
                className="px-3 py-1 rounded text-sm flex items-center gap-2"
                style={{ borderColor: 'var(--border-color)', borderWidth: '1px', color: 'var(--text-color)' }}
              >
                <FontAwesomeIcon icon={faDownload} /> Download
              </button>
            </div>
          </div>
        ))}
        {filteredTickets.length === 0 && (
          <div className="text-center py-4 col-span-2" style={{ color: 'var(--text-color)' }}>
            No unresolved tickets match your search.
          </div>
        )}
      </div>

      {/* Desktop View (lg and above) */}
      <div className="hidden lg:block rounded shadow p-4 overflow-x-auto mb-4" style={{ backgroundColor: 'var(--card-bg)', color: 'var(--text-color)' }}>
        <table className="min-w-full text-sm text-left whitespace-nowrap">
          <thead style={{ color: 'var(--text-color)' }}>
            <tr>
              <th className="py-2 px-4">Complainant's Name</th>
              <th className="py-2 px-4">Ticket ID</th>
              <th className="py-2 px-4">Nature of Ticket</th>
              <th className="py-2 px-4">Status</th>
              <th className="py-2 px-4">Download</th>
            </tr>
          </thead>
          <tbody>
            {filteredTickets.map((t) => (
              <tr key={t._id} className="hover:bg-[var(--accent-color)]/20">
                <td className="py-2 px-4">{t.name}</td>
                <td className="py-2 px-4">{t.ticketId}</td>
                <td className="py-2 px-4">{t.category}</td>
                <td className="py-2 px-4">
                  <button
                    onClick={() => {
                      setSelectedTicketId(t.ticketId);
                      setShowResolveModal(true);
                    }}
                    className="px-2 py-1 text-xs rounded"
                    style={{ backgroundColor: 'var(--accent-color)', color: 'var(--text-color)', borderColor: 'var(--accent-color)' }}
                  >
                    Resolve
                  </button>
                </td>
                <td className="py-2 px-4">
                  <button
                    onClick={() => handleDownload(t.ticketId)}
                    className="px-3 py-1 rounded text-sm flex items-center gap-2"
                    style={{ borderColor: 'var(--border-color)', borderWidth: '1px', color: 'var(--text-color)' }}
                  >
                    <FontAwesomeIcon icon={faDownload} /> Download
                  </button>
                </td>
              </tr>
            ))}
            {filteredTickets.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center py-4" style={{ color: 'var(--text-color)' }}>
                  No unresolved tickets match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4">
          <div className="flex items-center gap-4">
            <div>
              <h2 className="text-xl font-medium mb-1" style={{ color: 'var(--text-color)' }}>
                Contacts ( {contacts.length} )
              </h2>
              <p className="text-sm" style={{ color: 'var(--text-color)' }}>View list of Contact Queries Below</p>
            </div>
            <Link
              to="/ticket-contact/all-contacts"
              className="px-4 py-2 rounded text-sm"
              style={{ backgroundColor: 'var(--accent-color)', color: 'var(--text-color)', borderColor: 'var(--accent-color)', borderWidth: '1px' }}
            >
              All Contacts
            </Link>
          </div>
          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="Search contacts by name, email, subject, query, or type..."
              value={contactSearchTerm}
              onChange={(e) => setContactSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-md w-full focus:outline-none focus:ring-2"
              style={{
                backgroundColor: 'var(--card-bg)',
                color: 'var(--text-color)',
                borderColor: 'var(--border-color)',
                borderWidth: '1px',
                '--tw-ring-color': 'var(--accent-color)',
              }}
            />
          </div>
        </div>

        {/* Mobile View (below md) */}
        <div className="md:hidden grid gap-4 mb-4">
          {filteredContacts.map((c) => (
            <div
              key={c._id}
              className="p-4 rounded-lg shadow-md transition-shadow"
              style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)', borderWidth: '1px' }}
            >
              <h3 className="text-base font-medium mb-2" style={{ color: 'var(--text-color)' }}>{c.name}</h3>
              <p className="text-sm mb-1" style={{ color: 'var(--text-color)' }}>
                <span className="font-semibold">Email:</span> {c.email}
              </p>
              <p className="text-sm mb-1" style={{ color: 'var(--text-color)' }}>
                <span className="font-semibold">Subject:</span> {c.subject}
              </p>
              <p className="text-sm mb-1" style={{ color: 'var(--text-color)' }}>
                <span className="font-semibold">Type:</span> {c.type}
              </p>
              <p className="text-sm" style={{ color: 'var(--text-color)' }}>
                <span className="font-semibold">Query:</span>{" "}
                <span className="relative group">
                  {c.query.length > 50 ? `${c.query.substring(0, 50)}...` : c.query}
                  <span
                    className="absolute left-0 mt-1 p-2 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
                    style={{ backgroundColor: 'var(--card-bg)', color: 'var(--text-color)' }}
                  >
                    {c.query}
                  </span>
                </span>
              </p>
            </div>
          ))}
          {filteredContacts.length === 0 && (
            <div className="text-center py-4" style={{ color: 'var(--text-color)' }}>
              No contacts match your search.
            </div>
          )}
        </div>

        {/* Tablet View (md to lg) */}
        <div className="hidden md:block lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          {filteredContacts.map((c) => (
            <div
              key={c._id}
              className="p-4 rounded-xl shadow-md transition-all duration-200"
              style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)', borderWidth: '1px' }}
            >
              <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-color)' }}>{c.name}</h3>
              <div className="grid grid-cols-2 gap-2 text-sm" style={{ color: 'var(--text-color)' }}>
                <div>
                  <p className="font-semibold">Email:</p>
                  <p className="truncate">{c.email}</p>
                </div>
                <div>
                  <p className="font-semibold">Subject:</p>
                  <p className="truncate">{c.subject}</p>
                </div>
                <div>
                  <p className="font-semibold">Type:</p>
                  <p className="truncate">{c.type}</p>
                </div>
                <div>
                  <p className="font-semibold">Query:</p>
                  <p className="truncate">{c.query.length > 50 ? `${c.query.substring(0, 50)}...` : c.query}</p>
                </div>
              </div>
            </div>
          ))}
          {filteredContacts.length === 0 && (
            <div className="text-center py-4 col-span-2" style={{ color: 'var(--text-color)' }}>
              No contacts match your search.
            </div>
          )}
        </div>

        {/* Desktop View (lg and above) */}
        <div className="hidden lg:block rounded shadow p-4 overflow-x-auto" style={{ backgroundColor: 'var(--card-bg)', color: 'var(--text-color)' }}>
          <table className="min-w-full text-sm text-left whitespace-nowrap">
            <thead style={{ color: 'var(--text-color)' }}>
              <tr>
                <th className="py-2 px-4">Name</th>
                <th className="py-2 px-4">Email</th>
                <th className="py-2 px-4">Subject</th>
                <th className="py-2 px-4">Type</th>
                <th className="py-2 px-4">Query</th>
              </tr>
            </thead>
            <tbody>
              {filteredContacts.map((c) => (
                <tr key={c._id} className="hover:bg-[var(--accent-color)]/20">
                  <td className="py-2 px-4">{c.name}</td>
                  <td className="py-2 px-4">{c.email}</td>
                  <td className="py-2 px-4">{c.subject}</td>
                  <td className="py-2 px-4">{c.type}</td>
                  <td className="py-2 px-4">
                    <span className="relative group">
                      {c.query.length > 50 ? `${c.query.substring(0, 50)}...` : c.query}
                      <span
                        className="absolute left-0 mt-1 p-2 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
                        style={{ backgroundColor: 'var(--card-bg)', color: 'var(--text-color)' }}
                      >
                        {c.query}
                      </span>
                    </span>
                  </td>
                </tr>
              ))}
              {filteredContacts.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center py-4" style={{ color: 'var(--text-color)' }}>
                    No contacts match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}