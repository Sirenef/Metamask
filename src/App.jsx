import { useState, useEffect } from "react";
import Web3 from "web3";

function App() {
  const [walletAddress, setWalletAddress] = useState("");
  const [web3, setWeb3] = useState(null);
  const [balance, setBalance] = useState("");
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

  useEffect(() => {
    if (typeof window.ethereum !== "undefined") {
      const w3 = new Web3(window.ethereum);
      setWeb3(w3);

      window.ethereum.on("accountsChanged", (accounts) => {
        setWalletAddress(accounts[0] || "");
        getBalance(accounts[0]);
      });
    } else {
      console.log("MetaMask không được phát hiện trong trình duyệt");
    }
  }, []);

  return (
    <div>
      <button onClick={connectWallet}>Connect wallet</button>
      <h3>Wallet address: {walletAddress}</h3>
      <h3>Balance: {balance} BNB</h3>
    </div>
  );
}

export default App;
