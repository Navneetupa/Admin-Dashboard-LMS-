import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { ArrowLeft } from "lucide-react";
import axios from "axios";
import Loading from '../Loading';

export default function RevenueReport() {
  const [timeframe, setTimeframe] = useState("day");
  const [revenueData, setRevenueData] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [paymentData, setPaymentData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem("authToken");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const axiosInstance = axios.create({
          baseURL: "https://lms-backend-flwq.onrender.com/api/v1",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        // Fetch revenue analytics
        const revenueRes = await axiosInstance.get(`/admin/analytics/revenue?timeframe=${timeframe}`);
        const { totalRevenue, breakdown } = revenueRes.data.data;
        const formattedRevenue = breakdown.map(item => {
          let timeLabel;
          const date = new Date(item.time);
          if (timeframe === "day") {
            timeLabel = date.toLocaleDateString("en-US", { weekday: "short" });
          } else if (timeframe === "month") {
            timeLabel = date.toLocaleDateString("en-US", { month: "short" });
          } else {
            timeLabel = item.time;
          }
          return { time: timeLabel, revenue: item.revenue };
        });

        setTotalRevenue(totalRevenue);
        setRevenueData(formattedRevenue);

        // Fetch payment history
        const paymentRes = await axiosInstance.get("/payments/history");
        const formattedPayments = paymentRes.data.data.map(item => ({
          id: item._id,
          user: item.user?.fullName || "N/A",
          amount: item.amount || 0,
          status: item.status || "Unknown",
          date: new Date(item.createdAt).toLocaleString(),
        }));
        setPaymentData(formattedPayments);

        setLoading(false);
      } catch (error) {
        const message =
          error.response?.status === 401
            ? "Unauthorized: Please log in again."
            : "Failed to load data. Try again.";
        setError(message);
        setLoading(false);
      }
    };

    fetchData();
  }, [token, timeframe]);

  const formatCurrency = (value) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(value);

  if (loading) return <Loading />;
  if (error) return <div className="p-6 text-red-600 text-center">{error}</div>;

  return (
    <div
      className="p-6 min-h-screen"
      style={{
        backgroundColor: "var(--bg-color)",
        color: "var(--text-color)",
      }}
    >
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-[#49BBBD] hover:underline mb-4"
      >
        <ArrowLeft size={20} /> Back
      </button>

      {/* Revenue Chart Section */}
      <div
        className="rounded-xl p-6 shadow-md mb-8"
        style={{
          backgroundColor: "var(--card-bg)",
          border: "1px solid var(--border-color)",
        }}
      >
        <h1 className="text-2xl font-bold mb-4">Revenue Report</h1>
        <div className="text-lg mb-6 font-medium">
          Total Revenue: {formatCurrency(totalRevenue)}
        </div>

        <div className="mb-6 flex gap-4">
          {["day", "month", "year"].map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-4 py-2 rounded-md font-semibold transition duration-150 ${
                timeframe === tf
                  ? "bg-[#49BBBD] text-white"
                  : "bg-gray-200 text-black dark:bg-gray-700 dark:text-white"
              }`}
            >
              {tf.charAt(0).toUpperCase() + tf.slice(1)}
            </button>
          ))}
        </div>

        <div style={{ width: "100%", height: 350 }}>
          {revenueData.length > 0 ? (
            <ResponsiveContainer>
              <LineChart data={revenueData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis tickFormatter={(value) => `$${value}`} />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#14b8a6"
                  strokeWidth={3}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center text-gray-500">No revenue data available.</div>
          )}
        </div>
      </div>

      {/* Payment History Section */}
      <div
        className="rounded-xl p-6 shadow-md"
        style={{
          backgroundColor: "var(--card-bg)",
          border: "1px solid var(--border-color)",
        }}
      >
        <h2 className="text-xl font-bold mb-4">Payment History</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-200 dark:bg-gray-700">
                <th className="p-3 text-left">Transaction ID</th>
                <th className="p-3 text-left">User</th>
                <th className="p-3 text-left">Amount</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              {paymentData.length > 0 ? (
                paymentData.map((item) => (
                  <tr key={item.id} className="border-b border-gray-300 dark:border-gray-700">
                    <td className="p-3">{item.id}</td>
                    <td className="p-3">{item.user}</td>
                    <td className="p-3">{formatCurrency(item.amount)}</td>
                    <td className="p-3">{item.status}</td>
                    <td className="p-3">{item.date}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center p-4 text-gray-500">
                    No payment data found.
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
