import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Grid,
  HStack,
  Text,
} from '@chakra-ui/react';
import { CHAIN_NAMESPACES, WALLET_ADAPTERS } from '@web3auth/base'

import { ColorModeSwitcher } from '../ColorModeSwitcher';
import { OrderCardList } from './OrderCard';
import { Web3AuthModalPack } from '@safe-global/auth-kit';
import Web3 from 'web3';
import eAAts from '../eAAts.json'
import { OrderCheckbox } from './OrderCheckbox';
import { ethers } from 'ethers';
import Safe, { EthersAdapter, SafeFactory, getSafeContract } from '@safe-global/protocol-kit';
import { OpenloginAdapter } from '@web3auth/openlogin-adapter';
import { EthereumPrivateKeyProvider } from '@web3auth/ethereum-provider';
import { GelatoRelayPack } from '@safe-global/relay-kit';
import { MetaTransactionData } from '@safe-global/safe-core-sdk-types'
import SafeApiKit from '@safe-global/api-kit';

const chainConfig = {
  chainNamespace: CHAIN_NAMESPACES.EIP155,
  chainId: "0x13881",
  blockExplorer: "https://mumbai.polygonscan.com",
  rpcTarget: "https://polygon-mumbai-bor.publicnode.com",
}
const options = {
  clientId: 'BL7DvTW5eDnbbseTHotSiB8fFhueObVhMknseYNi4ICU8am0tB_6FWF-KU3i3gNjM5_IWs-mSNvBQEYSFTVB3AU',
  web3AuthNetwork: "cyan",
  chainConfig,
   uiConfig: {
    theme: 'dark',
    loginMethodsOrder: ['google', 'facebook']
  }
}
const modalConfig = {
  [WALLET_ADAPTERS.TORUS_EVM]: {
    label: 'torus',
    showOnModal: false
  },
  [WALLET_ADAPTERS.METAMASK]: {
    label: 'metamask',
    showOnDesktop: true,
    showOnMobile: false
  }
}
const txServiceUrl = "https://safe-transaction-goerli.safe.global";
const eAAtsAddress = "0xBB97CcD6EAB2891eac05A67181aa45f7e8a84c3C"; // mumbai address
const safeAddress = "";

export const Order = () => {
  const [web3Pack, setWeb3Pack] = useState(null);
  const [web3, setWeb3] = useState(null);
  const [address, setAddress] = useState("");
  const [userInfo, setUserInfo] = useState(null);
  const [contract, setContract] = useState(null);
  const [orderList, setOrderList] = useState(null);

  useEffect(() => {
    initWeb3AuthModal();
    checkLogin();
    initWeb3Provider();
  }, [])

  const initWeb3Provider = async () => {
    try {
      const provider = new Web3(chainConfig.rpcTarget);

      await getOrderList(provider);
      setWeb3(provider);
    } catch (e) {
      console.error("error:initWeb3Provider", e);
    }
  }

  const initWeb3AuthModal = async () => {
    try {
      const privateKeyProvider = new EthereumPrivateKeyProvider({
        config: { chainConfig }
      });

      const openloginAdapter = new OpenloginAdapter({
        loginSettings: {
          mfaLevel: 'mandatory'
        },
        adapterSettings: {
          uxMode: 'popup',
        },
        privateKeyProvider
      })
      // 인스턴스 생성
      const web3AuthConfig = {
        txServiceUrl, // safe 관련
      }
      const web3AuthModalPack = new Web3AuthModalPack(web3AuthConfig)

      // 옵션 파람스 https://web3auth.io/docs/sdk/pnp/web/modal/initialize#instantiating-web3auth
      await web3AuthModalPack.init({ options, adapters: [openloginAdapter], modalConfig });

      // 이벤트 구독
      web3AuthModalPack.subscribe("connected", (e) => console.log("connect!", e));
      web3AuthModalPack.subscribe("connecting", (e) =>  console.log("connecting...", e));
      web3AuthModalPack.subscribe("disconnected", (e) => console.log("disconnect", e));

      setWeb3Pack(web3AuthModalPack)
    } catch (e) {
      console.error("initWeb3AuthModal:error", e);
    }
  }

  // ! 상태관리
  // 새로고침 시 데이터 날아가서 가져옴
  const checkLogin = () => {
    const address = window.localStorage.getItem("address")
    const userInfo = window.localStorage.getItem("openlogin_store");
    if (address === null) return;
    if (userInfo === null) return;
    
    setAddress(address);
    setUserInfo(Object.keys(JSON.parse(userInfo)).length > 2 ? userInfo : null)
  }

  // 오더 리스트
  const getOrderList = async (provider) => {
    try {
      const contract = new provider.eth.Contract(eAAts.abi, eAAtsAddress);
      const orderList = await contract.methods.getOrdersByStatus(0).call();

      setContract(contract);
      setOrderList(orderList);
    } catch (e) {
      console.error("error:getOrderList", e);
    }
  }

  const login = async () => {  
    if (web3Pack === null) {
      alert("plz web3AuthModalPack init");
      return;
    }
    const { status } = web3Pack.web3Auth;
    if (status === "connected") {
      alert("You are already logged :(");
      return;
    }

    try {
      const { eoa, safes } = await web3Pack.signIn();
      // 소셜 로그인 정보
      const userInfo = await web3Pack.getUserInfo();
      console.log(web3Pack, eoa, safes, userInfo)
      // web3 객체 만들기
      const web3Provider = web3Pack.getProvider();
      console.log(web3Provider,12345)
      // const web3 = new ethers.providers.Web3Provider(web3Provider);

      window.localStorage.setItem("address", eoa);
      setWeb3(web3Provider);
      setAddress(eoa);
      setUserInfo(Object.keys(userInfo).length ? userInfo : null)
    } catch (e) {
      console.error("login:error", e)
    }
  }

  const logout = async () => {
    if (web3Pack === null) {
      alert("plz web3AuthModalPack init");
      return;
    }
    const { status } = web3Pack.web3Auth;
    if (status === "ready" || status === "connecting") {
      alert("You are not logged in :(");
      return;
    }

    try {
     await web3Pack.signOut();

     window.localStorage.removeItem("address");
     setAddress("");
     setUserInfo(null);
    } catch (e) {
      console.error("logout:error", e);
    }
  }

  const sendTransaction = async () => {
    if (web3 === null) {
      alert("Failed :(");
      return;
    }
    try {
      // * sign
      // await web3.eth.personal.sign("1234", address)
      // * list
      // const list = await contract.methods.getOrdersByStatus(0).call();
      // send transaction
      // * create order
      const encodeABI = contract.methods.createOrder(100, 0).encodeABI();
      // * join order
      // const encodeABI = contract.methods.joinOrder(1, 2).encodeABI();
      web3.eth.sendTransaction({
        from: address,
        to: "0xBB97CcD6EAB2891eac05A67181aa45f7e8a84c3C",
        data: encodeABI,
        gasPrice: 101000000000,
        value: "0x0",
      }, (err, hash) => {
        console.log(err, hash)
      })
    } catch (e) {
      console.error("sendTransaction:error", e);
    }
  }

  const signer = async () => {
    try {
      console.log(web3);
      const provider = new ethers.providers.Web3Provider(web3);
      const providerJsonPrc = new ethers.providers.JsonRpcProvider("https://eth-goerli.public.blastapi.io");
      const signer = provider.getSigner();
      // console.log(web3, signer, 1234)

      const ethAdapter = new EthersAdapter({    
        ethers,
        signerOrProvider: signer // || provider
      })
      console.log(provider, signer, 2345, ethAdapter)
      
      // * Signing transaction https://docs.safe.global/safe-core-aa-sdk/auth-kit/web3auth#signing-transactions-using-the-web3authmodalpack-and-protocol-kit
      const safeSDK = await Safe.create({
        ethAdapter,
        safeAddress : "0x4BD1f0331D7D3B928EB009aF9134888784f14218", // safeAddress?
      })

      // const safeTransactionData = {
      //   to: "0x98f2738Cf1784471554aDf2D850131Eb0f415b53",
      //   data: '0x',
      //   value: ethers.utils.parseUnits("0.000001", 'ether').toString()
      // }
      // const safeTransaction = await safeSDK.createTransaction({ safeTransactionData })

      // * protocol kit https://docs.safe.global/safe-core-aa-sdk/protocol-kit
      // const txServiceUrl = 'https://safe-transaction-polygon.safe.global';
      // const safeService = new SafeApiKit({ txServiceUrl, ethAdapter });
      // console.log(safeService, 1121);

      // const safeFactory = await SafeFactory.create({ ethAdapter });
      // console.log(safeFactory, 23, await signer.getAddress())

      // const safeAccountConfig = {
      //   owners: [await signer.getAddress()],
      //   threshold: 1
      // }
      // const safeSdkOwner1 = await safeFactory.deploySafe({ safeAccountConfig });
      // console.log(233, safeSdkOwner1);
      
      // * send to AA Ether https://docs.safe.global/safe-core-aa-sdk/protocol-kit#send-eth-to-the-safe
      // const safeAddress = "0x4BD1f0331D7D3B928EB009aF9134888784f14218"
      // const safeAmount = ethers.utils.parseUnits('0.00001', 'ether').toHexString();
      // const transactionParameters = {
      //   to: safeAddress,
      //   value: safeAmount
      // }

      // const tx = await signer.sendTransaction(transactionParameters);
      // console.log(tx)

      // * create Tx https://docs.safe.global/safe-core-aa-sdk/protocol-kit#create-a-transaction
      // const amount = ethers.utils.parseUnits('0.00001', 'ether').toString();
      // const safeTransactionData = {
      //   to: "0x98f2738Cf1784471554aDf2D850131Eb0f415b53", // await signer.getAddress(),
      //   data: "0x",
      //   value: amount,
      // };
      // const safeTransaction = await safeSDK.createTransaction({ safeTransactionData })
      // console.log(safeTransaction, 99);

      // * propose Tx https://docs.safe.global/safe-core-aa-sdk/protocol-kit#propose-the-transaction
      // const safeTxHash = await safeSDK.getTransactionHash(safeTransaction);
      // const senderSignature = await safeSDK.signTransactionHash(safeTxHash);
      // console.log(safeTxHash, senderSignature, 8989)

      // await safeService.proposeTransaction({
      //   safeAddress: "0x4BD1f0331D7D3B928EB009aF9134888784f14218",
      //   safeTransactionData: safeTransaction.data,
      //   safeTxHash,
      //   senderAddress: "0x98f2738Cf1784471554aDf2D850131Eb0f415b53", // await signer.getAddress(),
      //   senderSignature: senderSignature.data,
      // });
    
      // * pending Tx https://docs.safe.global/safe-core-aa-sdk/protocol-kit#get-pending-transactions
      // const pendingTransactions = await safeService.getPendingTransactions("0x4BD1f0331D7D3B928EB009aF9134888784f14218").results;
      // console.log(pendingTransactions, 2333);

      // * execute https://docs.safe.global/safe-core-aa-sdk/protocol-kit#execute-the-transaction
      // const signature = await safeSDK.signTransactionHash(safeTxHash)
      // const response = await safeService.confirmTransaction(safeTxHash, signature.data)
      // console.log(signature, response, 98888);

      // const executeTxResponse = await safeSDK.executeTransaction(safeTransaction)
      // console.log(executeTxResponse, 25555);
      // const receipt = await executeTxResponse.transactionResponse.wait()
      // console.log(executeTxResponse, receipt, 100399);

      // console.log('Transaction executed:')
      // console.log(`https://goerli.etherscan.io/tx/${receipt.transactionHash}`)

      // * relay kit
      // const withdrawAmount = ethers.utils.parseUnits('0.00001', 'ether').toString()
      // const transactions = [{
      //   to: "0x98f2738Cf1784471554aDf2D850131Eb0f415b53",
      //   data: '0x',
      //   value: withdrawAmount
      // }]
      // const options = {
      //   isSponsored: true
      // }

      // const relaykit = new GelatoRelayPack("LCoYNkDxEbhK53I6btEmHf9KLjPsanS3UOsAyKwvaGI_");
      // console.log(relaykit, 22233242);
      
      // // const relaykit = new GelatoRelayPack();
      // // console.log(relaykit, 34543);
      // const safeTransaction = await relaykit.createRelayedTransaction({ safe: safeSDK, transactions, options });
      // console.log(safeTransaction, 333222)
      // const signedSafeTransaction = await safeSDK.signTransaction(safeTransaction);
      // console.log(signedSafeTransaction, 5555);

      // const response = await relaykit.executeRelayTransaction(signedSafeTransaction, safeSDK, options);
      // console.log(`Relay Transaction Task ID: https://relay.gelato.digital/tasks/status/${response.taskId}`)
    } catch (e) {
      console.error("error:signer", e);
    }
  }

  return (
    <Box textAlign="center" fontSize="xl">
      <Button onClick={() => login()}>login</Button>
      <Button onClick={() => logout()}>logout</Button>
      <Button onClick={() => sendTransaction()}>sendTransaction</Button>
      <Button onClick={() => signer()}>Signer</Button>
      <Text>address: {address}</Text>
      {userInfo !== null &&
        <>
          <Text>email: {userInfo.email}</Text>
          <Text>name: {userInfo.name}</Text>
          <Text>typeOfLogin: {userInfo.typeOfLogin}</Text>
        </>
      }
       <HStack spacing="5vh">
        <OrderCheckbox list={["BeforeDelivery", "DuringDelivery", "AfterDelivery"]} />
        <OrderCheckbox list={["All", "Current", "My Order"]}/>
      </HStack>
      <Grid minH="100vh" mx="10">
        <ColorModeSwitcher justifySelf="flex-end" />
        {orderList && <OrderCardList orderList={orderList} onClick={() => console.log("join order")} />}
        </Grid>
      </Box>
  );
}
