import React, { useState, useEffect } from "react";
import { usePage, router } from "@inertiajs/react"; // ✅ use router instead of Inertia
import {
  QrCode,
  Copy,
  ExternalLink,
  ArrowDownRight,
  ArrowUpRight,
  Clock,
  Wallet,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  ChevronDown,
  Plus,
  Activity
} from "lucide-react";

// --- Reusable UI Components (Card, Button, Input, Select, Alert) ---
// Keep the ones you already wrote...

export default function MultiChainPayments() {
  const { historyGroup, totals, flash, auth } = usePage().props;

  const [activeTab, setActiveTab] = useState("deposit");
  const [selectedChain, setSelectedChain] = useState("ethereum");
  const [supportedChains, setSupportedChains] = useState([]);

  const [wallets, setWallets] = useState({});
  const [isLoadingWallets, setIsLoadingWallets] = useState(false);
  const [isCreatingWallet, setIsCreatingWallet] = useState(false);

  const [depositAddress, setDepositAddress] = useState("");
  const [isCheckingDeposit, setIsCheckingDeposit] = useState(false);

  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawAddress, setWithdrawAddress] = useState("");
  const [isProcessingWithdrawal, setIsProcessingWithdrawal] = useState(false);

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [expandedWallets, setExpandedWallets] = useState(false);

  const accountId = auth?.user?.id;

  // Load supported chains + wallets
  useEffect(() => {
    loadSupportedChains();
    if (accountId) {
      loadAllWallets();
    }
  }, [accountId]);

  useEffect(() => {
    if (flash?.success) setSuccessMessage(flash.success);
    if (flash?.error) setErrors({ general: flash.error });
  }, [flash]);

  // --- API Calls ---
  const loadSupportedChains = async () => {
    try {
      const res = await fetch("/api/supported-chains");
      const data = await res.json();
      setSupportedChains(data);
    } catch (err) {
      console.error("Error loading chains:", err);
    }
  };

  const loadAllWallets = async () => {
    setIsLoadingWallets(true);
    try {
      const res = await fetch(`/api/wallets/${accountId}`);
      const data = await res.json();
      setWallets(data);
    } catch (err) {
      console.error("Error loading wallets:", err);
    } finally {
      setIsLoadingWallets(false);
    }
  };

  const createWallet = async (chain) => {
    setIsCreatingWallet(true);
    try {
      const res = await fetch(`/api/wallet/new/${accountId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "spot", chain }),
      });
      const data = await res.json();
      if (data.success) {
        setWallets((prev) => ({ ...prev, [chain]: data.wallet }));
        setSuccessMessage(`Wallet created for ${chain}`);
      } else {
        setErrors({ general: data.error });
      }
    } catch (err) {
      console.error("Error creating wallet:", err);
    } finally {
      setIsCreatingWallet(false);
    }
  };

  const handleDeposit = (chain) => {
    if (!wallets[chain]) {
      setErrors({ general: `No wallet found for ${chain}` });
      return;
    }
    setDepositAddress(wallets[chain].address);
  };

  const handleWithdraw = async () => {
    setIsProcessingWithdrawal(true);
    try {
      const res = await fetch(`/api/wallet/withdraw/${accountId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chain: selectedChain,
          amount: withdrawAmount,
          to: withdrawAddress,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMessage("Withdrawal request submitted!");
        setWithdrawAmount("");
        setWithdrawAddress("");
      } else {
        setErrors({ general: data.error });
      }
    } catch (err) {
      console.error("Error withdrawing:", err);
    } finally {
      setIsProcessingWithdrawal(false);
    }
  };

  // --- UI Rendering ---
  return (
    <div className="max-w-4xl mx-auto p-6 text-white">
      <h1 className="text-2xl font-bold mb-6">Payments</h1>

      {errors.general && <Alert type="error">{errors.general}</Alert>}
      {successMessage && <Alert type="success">{successMessage}</Alert>}

      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        <Button
          variant={activeTab === "deposit" ? "primary" : "secondary"}
          onClick={() => setActiveTab("deposit")}
        >
          <ArrowDownRight className="w-4 h-4 mr-2" /> Deposit
        </Button>
        <Button
          variant={activeTab === "withdraw" ? "primary" : "secondary"}
          onClick={() => setActiveTab("withdraw")}
        >
          <ArrowUpRight className="w-4 h-4 mr-2" /> Withdraw
        </Button>
      </div>

      {/* Deposit */}
      {activeTab === "deposit" && (
        <Card>
          <Select
            label="Select Chain"
            value={selectedChain}
            onChange={(e) => setSelectedChain(e.target.value)}
          >
            {supportedChains.map((chain) => (
              <option key={chain} value={chain}>
                {chain}
              </option>
            ))}
          </Select>

          <Button
            variant="success"
            onClick={() => handleDeposit(selectedChain)}
            className="w-full mt-4"
          >
            <QrCode className="w-4 h-4 mr-2" /> Show Deposit Address
          </Button>

          {depositAddress && (
            <div className="mt-6 text-center">
              <p className="mb-2">Send funds to:</p>
              <code className="block bg-gray-900 p-2 rounded-lg mb-3">
                {depositAddress}
              </code>
              <QrCode className="w-32 h-32 mx-auto text-cyan-500" />
            </div>
          )}
        </Card>
      )}

      {/* Withdraw */}
      {activeTab === "withdraw" && (
        <Card>
          <Select
            label="Select Chain"
            value={selectedChain}
            onChange={(e) => setSelectedChain(e.target.value)}
          >
            {supportedChains.map((chain) => (
              <option key={chain} value={chain}>
                {chain}
              </option>
            ))}
          </Select>

          <Input
            label="Withdraw Address"
            value={withdrawAddress}
            onChange={(e) => setWithdrawAddress(e.target.value)}
            placeholder="0x..."
          />

          <Input
            label="Amount"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
            placeholder="0.0"
            type="number"
          />

          <Button
            variant="danger"
            disabled={isProcessingWithdrawal}
            onClick={handleWithdraw}
            className="w-full mt-4"
          >
            {isProcessingWithdrawal ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <ArrowUpRight className="w-4 h-4 mr-2" />
            )}
            Withdraw
          </Button>
        </Card>
      )}

      {/* Wallets List */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-3">My Wallets</h2>
        {isLoadingWallets ? (
          <p>Loading wallets...</p>
        ) : (
          Object.entries(wallets).map(([chain, wallet]) => (
            <Card key={chain} className="mb-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold capitalize">{chain}</p>
                  <p className="text-sm text-gray-400">{wallet.address}</p>
                </div>
                <Button
                  variant="secondary"
                  onClick={() => handleDeposit(chain)}
                >
                  Deposit
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
