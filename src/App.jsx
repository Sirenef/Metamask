import { useState, useEffect } from 'react';
import Web3 from 'web3';
import { NFTStorage } from 'nft.storage';
import { ABI, contractAddress } from './utils/config';

function App() {
  const web3 = new Web3(window.ethereum);
  const [walletAddress, setWalletAddress] = useState('');
  const [balance, setBalance] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [amount, setAmount] = useState(0);
  const [contract, setContract] = useState('');
  const [mintAmount, setMintAmount] = useState(0);
  const [chainId, setChainId] = useState('');
  const [directory, setDirectory] = useState(null);
  const [ipfsHash, setIpfsHash] = useState('');
  const [imageURL, setImageURL] = useState([]);

  const nftStorageClient = new NFTStorage({
    token:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweGQ1YjhBOEJCNEYwM2IwZjAxQjk5OGVBMUQ0MjczMDE1MUIwM2ZGMTMiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTcwNjAwODQ1OTg2MiwibmFtZSI6IkZpcnN0IFByb2plY3QifQ.PI3nCl24rTt9VJH3R7bnU5tgZImN8urW7A65YI8z9yo',
  });
  const getBalance = async (address) => {
    try {
      const weiBalance = await web3.eth.getBalance(address);

      // const weiBalance = await contract.methods.balanceOf(address).call();
      const maxSupply = await contract.methods.maxSupply().call();

      const etherBalance = parseFloat(
        web3.utils.fromWei(weiBalance, 'ether')
      ).toFixed(2);

      setBalance(etherBalance);
      console.log('maxSuply: ', maxSupply);
    } catch (error) {
      console.error(error);
    }
  };

  const connectWallet = async () => {
    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });
      const connectedChainId = await window.ethereum.request({
        method: 'eth_chainId',
      });

      setWalletAddress(accounts[0]);
      getBalance(accounts[0]);
      setChainId(connectedChainId);

      console.log('Connected Chain ID:', connectedChainId);

      web3.eth.getChainId().then(console.log);
    } catch (error) {
      console.error(error);
    }
  };

  const transferToken = async () => {
    try {
      const amountInWei = web3.utils.toWei(amount, 'ether');

      const result = await web3.eth.sendTransaction({
        from: walletAddress,
        to: recipientAddress,
        value: amountInWei,
      });

      console.log('Transaction result:', result);
      alert('Transfer success');
      getBalance(walletAddress);
    } catch (error) {
      console.error(error);
    }
  };
  const mintToken = async () => {
    try {
      const amountInWei = web3.utils.toWei(mintAmount.toString(), 'ether');

      const result = await contract.methods.mintToken(amountInWei).send({
        from: walletAddress,
      });

      console.log('Mint Token result:', result);
      alert('Mint Token success');
    } catch (error) {
      console.error(error);
    }
  };

  const switchNetwork = async () => {
    try {
      const chainIdToAdd = '0x38';

      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: chainIdToAdd,
            chainName: 'Binance Smart Chain Mainnet',
            nativeCurrency: {
              name: 'BNB',
              symbol: 'BNB',
              decimals: 18,
            },
            rpcUrls: ['https://rpc.ankr.com/bsc'],
            blockExplorerUrls: ['https://bscscan.com'],
          },
        ],
      });

      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: chainIdToAdd }],
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleFileChange = (event) => {
    const selectedFiles = event.target.files;
    setDirectory(selectedFiles);
  };

  const handleUpload = async () => {
    if (!directory) {
      alert('Vui lòng chọn một thư mục để tải lên.');
      return;
    }

    try {
      const cid = await nftStorageClient.storeDirectory(directory);
      alert(`Thư mục đã được tải lên thành công! Hash IPFS: ${cid}`);

      const ipfsURL = `https://${cid}.ipfs.infura-ipfs.io/`;
      setIpfsHash(cid);
      setImageURL([ipfsURL]); // Update imageURL state here
    } catch (error) {
      console.error('Lỗi khi tải lên:', error);
      alert('Đã xảy ra lỗi khi tải lên.');
    }
  };

  useEffect(() => {
    const initWeb3 = async () => {
      if (typeof window.ethereum !== 'undefined') {
        window.ethereum.on('chainChanged', (chainId) => {
          setChainId(chainId);
        });

        const contract = new web3.eth.Contract(ABI, contractAddress);
        setContract(contract);
        window.ethereum.on('accountsChanged', (accounts) => {
          setWalletAddress(accounts[0] || '');
          getBalance(accounts[0]);
        });
      } else {
        console.log('MetaMask không được phát hiện trong trình duyệt');
      }
    };

    initWeb3();
  }, []);
  useEffect(() => {
    if (ipfsHash) {
      const ipfsURL = `https://${ipfsHash}.ipfs.infura-ipfs.io/`;
      console.log('ipfsHash:', ipfsHash);
      console.log('ipfsURL:', ipfsURL);
      setImageURL([ipfsURL]);
    }
  }, [ipfsHash]);

  return (
    <div className="flex flex-col justify-center gap-6 m-5">
      <div className="flex flex-col gap-4 mb-3">
        <button
          onClick={connectWallet}
          className=" bg-slate-500 rounded-md px-2 py-1 mt-4 w-[150px]"
        >
          Connect wallet
        </button>
        <h3>Wallet address: {walletAddress}</h3>
        <h3>Balance: {balance} BNB</h3>
        <h3>ChainId: {chainId}</h3>
        <button
          onClick={switchNetwork}
          className="bg-slate-500 rounded-md px-2 py-1 mt-4 w-[150px]"
        >
          Switch Network
        </button>
      </div>
      <div className="flex flex-col gap-2">
        <input type="file" onChange={handleFileChange} />
        <button
          className=" bg-slate-500 rounded-md px-2 py-1 mt-4 w-[150px]"
          onClick={handleUpload}
        >
          Tải Lên IPFS
        </button>
        {ipfsHash && <p>Hash IPFS: {ipfsHash}</p>}
        {imageURL.length > 0 && <img src={imageURL[0]} alt={`IPFS Image`} />}
      </div>

      <div className="">
        <label htmlFor="mintAmount">Mint Amount: </label>
        <input
          type="number"
          id="mintAmount"
          className="p-1 text-sm border border-black rounded-lg"
          value={mintAmount}
          onChange={(e) => setMintAmount(e.target.value)}
          required
        />
      </div>
      <div className="flex ">
        <button
          className="px-2 py-1 mt-2 rounded-md bg-slate-500"
          onClick={() => mintToken()}
        >
          Mint Token
        </button>
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
