import { useState, useEffect } from "react";
import { Web3ReactProvider, useWeb3React } from "@web3-react/core";
import { Web3Provider } from "@ethersproject/providers";
import { InjectedConnector } from "@web3-react/injected-connector";
import { getGlobalInfo, listenAccounts, getTokenData, buyToken, transfer } from './api/functions';

export default function Home() {
  return (
    <Web3ReactProvider getLibrary={(provider: any) => new Web3Provider(provider)}>
      <App />
    </Web3ReactProvider>
  );
}

function App() {
  const { active, account, activate, deactivate, chainId, library } = useWeb3React();
  const [currentAccount, setCurrentAccount] = useState(account);
  const [currentChain, setCurrentChain] = useState('ropsten');
  const [ethBalance, setEthBalance] = useState(0);
  const [tokenBalance, setTokenBalance] = useState(0);
  const [contractBalance, setContractBalance] = useState(0);
  const [buyPrice, setBuyPrice] = useState('');
  const [amountToSend,setAmountToSend]=useState('100')
  const [toAddress, setToAddress]=useState("")
  const [tokenData, setTokenData] = useState({
    name: '',
    symbol: '',
    supply: '',
    address: '',
    priceInEth: '',
  });

  if (active) listenAccounts(setCurrentAccount, setCurrentChain);
  useEffect(() => {
    if (active) {
      getGlobalInfo(setEthBalance, setTokenBalance, setContractBalance, currentAccount);
      getTokenData(setTokenData);
    }
  }, [currentAccount, currentChain]);
  
  const onClickConnect = () => {
    activate(new InjectedConnector({}));
  }

  return (
    <>
    <nav className="bg-gray-800">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-between h-16 text-gray-100">
          {active ? (
            <>
              <div>
                {chainId === 1 ? "Mainnet" : "Testnet"} {chainId}
              </div>
              <div>
                {account}
              </div>
              <div>
                {/* {contractAddress.substring(0, 8)}...{contractAddress.substring(-8, 8)} */}
              </div>
              <div>{chainId == 97 ? "BNB" : "ETH"}: {ethBalance}</div>
              <button
                className="h-10 px-5 border border-gray-400 rounded-md"
                onClick={async () => {
                  deactivate()
                }}
              >
                Disconnect
              </button>
            </>
          ) : (
            <>
              <button
                className="h-10 px-5 border border-gray-400 rounded-md"
                onClick={onClickConnect}
              >
                Connect
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
    {active ? 
    <div className="text-center">
      <div>
        <p>Token name: {tokenData.name}</p>
        <p>Token symbol: {tokenData.symbol}</p>
        <p>Token address: {tokenData.address}</p>
        <p>Total supply: {tokenData.supply}</p>
        <p>Price in eth: {tokenData.priceInEth}</p>
        <p>Contract balance: {contractBalance}</p>
      </div>
      <div>
        <p>Current account token balance: {tokenBalance}</p>
      </div>
      <br />
      <div className="">  
        <input
          type="text"
          className="bg-gray-200 border-2 border-gray-200 rounded text-gray-700 m-5"
          placeholder="Amount of ETH to spend"
          onChange={(v) => setBuyPrice(v.target.value)}
        />

        <button
          className="border-2 border-gray-200 px-2"
          onClick={() => buyToken(buyPrice, currentAccount)}
        >
          Buy {tokenData.symbol}
        </button>
      </div>
      <br />
      <div>
        <input type="text"
          className="bg-gray-200 border-2 border-gray-200 rounded text-gray-700 m-5"
          placeholder="Amount of token to send"
          onChange={(v) => setAmountToSend(v.target.value)}
        />
        <input type="text"
          className="bg-gray-200 border-2 border-gray-200 rounded text-gray-700 m-5"
          placeholder="Address"
          onChange={(v) => setToAddress(v.target.value)}
        />
        <button
            className="border-2 border-gray-200 px-2"
            onClick={() => transfer(toAddress, amountToSend, account)}
          >
            Send {tokenData.symbol}
          </button>
      </div>
    </div>
    :
    <></>
    }
    
    </>
  );
}