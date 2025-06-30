import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { ArrowLeft } from "lucide-react";
import axios from "axios";
import Loading from "../Loading";

export default function RevenueReport() {
  const [paymentData, setPaymentData] = useState([]);
  const [paymentChartData, setPaymentChartData] = useState([]);
  const [timeframe, setTimeframe] = useState("day");
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

        const res = await axiosInstance.get("/payments/history");
        const payments = res.data.data;

        const formatted = payments
          .filter((item) => item.status?.toLowerCase() !== "pending") // Filter out pending
          .map((item) => ({
            id: item._id,
            user: `${item.student?.firstName || "N/A"} ${
              item.student?.lastName || ""
            }`,
            amount: item.amount || 0,
            status: item.status || "Unknown",
            date: new Date(item.paymentDate).toLocaleString(),
            rawDate: new Date(item.paymentDate),
          }));

        setPaymentData(formatted);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch payment data");
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  useEffect(() => {
    const grouped = {};

    paymentData.forEach((item) => {
      const date = item.rawDate;
      let key = "";

      if (timeframe === "day") {
        key = date.toISOString().split("T")[0];
      } else if (timeframe === "month") {
        key = date.toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        });
      } else if (timeframe === "year") {
        key = date.getFullYear().toString();
      }

      if (!grouped[key]) grouped[key] = 0;
      grouped[key] += item.amount;
    });

    const chartArray = Object.keys(grouped).map((key) => ({
      time: key,
      amount: grouped[key],
    }));

    setPaymentChartData(chartArray);
  }, [paymentData, timeframe]);

  const formatCurrency = (value) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(value);

  if (loading) return <Loading />;
  if (error)
    return <div className="p-6 text-red-600 text-center">{error}</div>;

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

      {/* Chart Section */}
      <div
        className="rounded-xl p-6 shadow-md mb-8"
        style={{
          backgroundColor: "var(--card-bg)",
          border: "1px solid var(--border-color)",
        }}
      >
        <h1 className="text-2xl font-bold mb-4">Payment Revenue Chart</h1>

        {/* Timeframe Buttons */}
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
          {paymentChartData.length > 0 ? (
            <ResponsiveContainer>
              <LineChart
                data={paymentChartData}
                margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis tickFormatter={formatCurrency} />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#14b8a6"
                  strokeWidth={3}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center text-gray-500">
              No payment chart data available.
            </div>
          )}
        </div>
      </div>

      {/* Payment History */}
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
                  <tr
                    key={item.id}
                    className="border-b border-gray-300 dark:border-gray-700"
                  >
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
