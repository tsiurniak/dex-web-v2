import Web3 from 'web3';
import abiJSON from './abi'

interface contractsAddressInterface {
    [key: string]: any;
};

let contractsAddress: contractsAddressInterface = {
    // localhost: {
    //     tokenAddr: '0x5FbDB2315678afecb367f032d93F642f64180aa3'
    // },
    ropsten: {
        tokenAddr: '0x42e7e5fe451a67AA74E7B73e62B7a300685Cc180'
    },
    bsctestnet: {
        tokenAddr: '0x56A10EF655Efa9aA471d168057686c6e663Bc6f5'
    }
}

declare global {
    interface Window {
        ethereum:any;
    }
}

let currentNet = 'ropsten';

let token: any;
let isInitialized = false;
let provider: any;
let web3: any;

export const init = async () => {
    provider = window.ethereum;

    web3 = new Web3(provider);

    const networkId = await web3.eth.net.getId();

    if (networkId == '0x61') {
        currentNet = 'bsctestnet';
    }
    if (networkId == '0x3') {
        currentNet = 'ropsten';
    }

    // if (networkId == '0x31337') {
    //     currentNet = 'localhost';
    // }

    token = new web3.eth.Contract(
        abiJSON,
        contractsAddress[currentNet].tokenAddr
    );
    console.log('Chain address: ', contractsAddress[currentNet].tokenAddr);

    isInitialized = true;
};


export const getGlobalInfo = async (setEth: any, setToken: any, setContractBalance: any, acc: string) => {
    if (!isInitialized)
        await init();

    console.log(acc);


    web3.eth.getBalance(acc, (err: any, res: string) => {
        if (err) {
            console.error("An error occured when read ETH balance ", err);
            return;
        }
        setEth(web3.utils.fromWei(res));
    });
    token.methods.balanceOf(acc).call((err: any, res: string) => {
        if (err) {
            console.error("An error occured when read Token balance ", err);
            return;
        }
        setToken(web3.utils.fromWei(res));
    });

    token.methods.balanceOf(contractsAddress[currentNet].tokenAddr).call((err: any, res: string) => {
        if (err) {
            console.error("An error occured when read Token balance ", err);
            return;
        }
        setContractBalance(web3.utils.fromWei(res));
    });
};

export const getTokenData = async (setTokenData: any) => {
    if (!isInitialized)
        await init();

    let data = { name: '', symbol: '', supply: '', address: '', priceInEth: '' };

    await token.methods.name().call((err: any, res: string) => {
        if (err) {
            console.error("An error occured when read Token name ", err);
            return;
        }
        data.name = res;
    });

    await token.methods.symbol().call((err: any, res: string) => {
        if (err) {
            console.error("An error occured when read Token symbol ", err);
            return;
        }
        data.symbol = res;
    });

    await token.methods.totalSupply().call((err: any, res: string) => {
        if (err) {
            console.error("An error occured when read Token supply ", err);
            return;
        }
        data.supply = web3.utils.fromWei(res);
    });

    data.address = contractsAddress[currentNet].tokenAddr;

    await token.methods.tokenPrice().call((err: any, res: string) => {
        if (err) {
            console.error("An error occured when read Token price ", err);
            return;
        }
        data.priceInEth = web3.utils.fromWei(res);
    });
    setTokenData(data);
};


export const buyToken = async (value: string, account: string) => {
    if (!isInitialized)
        await init();
    token.methods.swap().send({
        from: account,
        value: web3.utils.toWei(value)
    });
};

export const transfer = async (to: string, value: string, account: string) => {
    if (!isInitialized)
        await init();
    console.log("Transfer ", to)
    token.methods.transfer(to, web3.utils.toWei(value)).send({ from: account });
}

export const listenAccounts = async (setCurrentAccount: any, setCurrentChain: any) => {
    if (!isInitialized)
        await init();

    if (!provider) {
        console.error('No provider');
        return;
    }

    await provider
        .request({ method: 'eth_requestAccounts' })
        .then((accounts: any) => {
            setCurrentAccount(accounts[0]);
        })
        .catch((err: any) => {
            console.log(err);
            return;
        });

    await provider
        .request({ method: 'eth_chainId' })
        .then((chainId: string) => {
            console.log(chainId);
            handleChangeChain(setCurrentChain, chainId);
        })

    window.ethereum.on('accountsChanged', (accounts: any) => {
        setCurrentAccount(accounts[0]);
    });
    window.ethereum.on('chainChanged', async (chainId: string) => {
        handleChangeChain(setCurrentChain, chainId);
    });
}

export function handleChangeChain(setCurrentChain: any, chainId: string) {
    if (chainId != '0x61' && chainId != '0x3')
        return;
    if (chainId == '0x61') {
        setCurrentChain('bsctestnet');
        currentNet = 'bsctestnet';
    }
    if (chainId == '0x3') {
        setCurrentChain('ropsten');
        currentNet = 'ropsten';
    }

    // if (chainId == '0x31337') {
    //     setCurrentChain('localhost');
    //     currentNet = 'localhost';
    // }

    isInitialized = false;
}


