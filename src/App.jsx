import { useState, useEffect } from "react";
import Web3 from "web3";
import { ABI, contractAddress } from "./utils/config";

function App() {
  const [walletAddress, setWalletAddress] = useState("");
  const [web3, setWeb3] = useState(null);
  const [balance, setBalance] = useState("");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [amount, setAmount] = useState(0);
  const [contractData, setContractData] = useState("");

  const getBalance = async (address) => {
    try {
      const weiBalance = await web3.eth.getBalance(address);

      const etherBalance = parseFloat(
        web3.utils.fromWei(weiBalance, "ether")
      ).toFixed(2);

      setBalance(etherBalance);
    } catch (error) {
      console.error(error);
    }
  };

  const connectWallet = async () => {
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      setWalletAddress(accounts[0]);
      getBalance(accounts[0]);
    } catch (error) {
      console.error(error);
    }
  };

  const transferToken = async () => {
    try {
      const amountInWei = web3.utils.toWei(amount, "ether");

      const result = await web3.eth.sendTransaction({
        from: walletAddress,
        to: recipientAddress,
        value: amountInWei,
      });

      console.log("Transaction result:", result);
      alert("Transfer success");
      getBalance(walletAddress);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (typeof window.ethereum !== "undefined") {
      const w3 = new Web3(window.ethereum);
      setWeb3(w3);
      const contract = new w3.eth.Contract(ABI, contractAddress);
      setContractData(contract);
      window.ethereum.on("accountsChanged", (accounts) => {
        setWalletAddress(accounts[0] || "");
        getBalance(accounts[0]);
      });
    } else {
      console.log("MetaMask không được phát hiện trong trình duyệt");
    }
  }, []);

  return (
    <div className="flex flex-col justify-center m-5">
      <div className="flex flex-col gap-4 mb-3">
        <button
          onClick={connectWallet}
          className=" bg-slate-500 rounded-md px-2 py-1 mt-4 w-[150px]"
        >
          Connect wallet
        </button>
        <h3>Wallet address: {walletAddress}</h3>
        <h3>Balance: {balance} BNB</h3>
      </div>
      <div className="p-10 border rounded-lg w-fit solid">
        <h2 className="text-2xl font-bold">Transaction Form</h2>
        <div className="mt-6">
          <label htmlFor="address">Recipient Address: </label>
          <input
            type="text"
            id="address"
            className="p-1 text-sm text-black border border-black rounded-lg"
            required
            onChange={(e) => setRecipientAddress(e.target.value)}
          />
        </div>
        <div className="mt-4">
          <label htmlFor="balance">Amount: </label>
          <input
            type="text"
            id="balance"
            className="p-1 text-sm border border-black rounded-lg"
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>
        <div className="flex justify-center w-full align-middle">
          <button
            className="px-2 py-1 mx-auto mt-4 rounded-md bg-slate-500"
            onClick={() => transferToken()}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
