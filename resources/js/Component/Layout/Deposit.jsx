import React, { useState, useEffect } from "react";
import { QrCode, RefreshCw, CheckCircle, AlertCircle, Copy } from "lucide-react";


const Deposit = ({ accountId }) => {
  const [chains, setChains] = useState([]);
  const [selectedChain, setSelectedChain] = useState("");
  const [depositAddress, setDepositAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [message, setMessage] = useState(null);

  // Get API base and key from env
  const API_PORT = import.meta.env.VITE_PORT || 4000;
  const API_KEY = import.meta.env.VITE_API_KEY;
  const API_BASE = `http://localhost:${API_PORT}`;
  const API_HEADERS = {
    "Content-Type": "application/json",
    "x-api-key": API_KEY
  };

  // Load supported chains
  useEffect(() => {
    console.log(accountId);
    const fetchChains = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/chains/supported`, {
          headers: API_HEADERS
        });
        const data = await res.json();
        if (data.success) {
          setChains(data.chains);
          setSelectedChain(data.chains[0]?.key || "");
        }
      } catch (err) {
        console.error("Error loading chains:", err);
      }
    };
    fetchChains();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch deposit address for selected chain
  const loadDepositAddress = async () => {
    if (!selectedChain) return;
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/deposit/${accountId}/${selectedChain}/address`, {
        headers: API_HEADERS
      });
      const data = await res.json();
      if (data.success) {
        setDepositAddress(data.depositAddress);
        setMessage({ type: "success", text: data.message });
      } else {
        setMessage({ type: "error", text: data.error });
      }
    } catch (err) {
      console.error("Error fetching deposit address:", err);
      setMessage({ type: "error", text: "Failed to load deposit address" });
    } finally {
      setIsLoading(false);
    }
  };

  // Check deposit status
  const checkDeposit = async () => {
    if (!selectedChain) return;
    setIsChecking(true);
    try {
      const res = await fetch(`${API_BASE}/api/deposit/${accountId}/${selectedChain}/check`, {
        method: "POST",
        headers: API_HEADERS
      });
      const data = await res.json();
      if (data.success && data.deposit) {
        setMessage({
          type: "success",
          text: `Deposit received: ${data.deposit.amount} ${data.deposit.symbol}`
        });
      } else {
        setMessage({ type: "info", text: data.message || "No new deposits yet" });
      }
    } catch (err) {
      console.error("Error checking deposit:", err);
      setMessage({ type: "error", text: "Failed to check deposits" });
    } finally {
      setIsChecking(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(depositAddress);
      setMessage({ type: "success", text: "Address copied to clipboard!" });
    } catch {
      setMessage({ type: "error", text: "Failed to copy" });
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-gray-800 p-6 rounded-lg shadow-lg text-white">
      <h2 className="text-xl font-bold mb-4">Deposit</h2>

      {/* Chain Select */}
      <select
        value={selectedChain}
        onChange={(e) => setSelectedChain(e.target.value)}
        className="w-full mb-4 p-2 rounded bg-gray-700 border border-gray-600"
      >
        {chains.map((c) => (
          <option key={c.key} value={c.key}>
            {c.name} ({c.symbol})
          </option>
        ))}
      </select>

      <button
        onClick={loadDepositAddress}
        disabled={isLoading}
        className="w-full bg-cyan-600 hover:bg-cyan-700 p-2 rounded text-white"
      >
        {isLoading ? "Loading..." : "Get Deposit Address"}
      </button>

      {depositAddress && (
        <div className="mt-6 text-center">
          <p className="mb-2">Send funds to:</p>
          <div className="flex items-center justify-between bg-gray-900 p-2 rounded-lg mb-3">
            <code className="text-cyan-400 text-sm break-all">{depositAddress}</code>
            <button onClick={copyToClipboard} className="text-gray-400 hover:text-white ml-2">
              <Copy className="w-4 h-4" />
            </button>
          </div>

          {/* QR Code */}
          <div className="flex justify-center bg-white p-4 rounded-lg w-48 h-48 mx-auto">
            <QrCode className="w-40 h-40 text-gray-900" />
          </div>

          <button
            onClick={checkDeposit}
            disabled={isChecking}
            className="w-full bg-green-600 hover:bg-green-700 mt-4 p-2 rounded text-white"
          >
            {isChecking ? (
              <span className="flex items-center justify-center">
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Checking...
              </span>
            ) : (
              "I Have Deposited"
            )}
          </button>
        </div>
      )}

      {/* Messages */}
      {message && (
        <div
          className={`mt-4 p-3 rounded ${
            message.type === "success"
              ? "bg-green-900/50 text-green-300"
              : message.type === "error"
              ? "bg-red-900/50 text-red-300"
              : "bg-blue-900/50 text-blue-300"
          }`}
        >
          {message.type === "success" && <CheckCircle className="w-4 h-4 inline mr-2" />}
          {message.type === "error" && <AlertCircle className="w-4 h-4 inline mr-2" />}
          {message.text}
        </div>
      )}
    </div>
  );
};

export default Deposit;
