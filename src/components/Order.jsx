import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Grid,
  HStack,
  Text,
} from '@chakra-ui/react';
import { CHAIN_NAMESPACES, WALLET_ADAPTERS } from '@web3auth/base'
import { OpenloginAdapter } from "@web3auth/openlogin-adapter";

import { ColorModeSwitcher } from '../ColorModeSwitcher';
import { OrderCardList } from './OrderCard';
import { Web3AuthModalPack } from '@safe-global/auth-kit';
import Web3 from 'web3';
import eAAts from '../eAAts.json'
import { OrderCheckbox } from './OrderCheckbox';

const options = {
  clientId: 'BL7DvTW5eDnbbseTHotSiB8fFhueObVhMknseYNi4ICU8am0tB_6FWF-KU3i3gNjM5_IWs-mSNvBQEYSFTVB3AU',
  web3AuthNetwork: 'mainnet',
  chainConfig: {
    chainNamespace: CHAIN_NAMESPACES.EIP155,
    chainId: "0x89",
    blockExplorer: "https://mumbai.polygonscan.com",
    rpcTarget: "https://rpc-mainnet.maticvigil.com",
  },
  authMode: "DAPP"
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

export const Order = () => {
  const [web3Pack, setWeb3Pack] = useState(null);
  const [web3, setWeb3] = useState(null);
  const [address, setAddress] = useState("");
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    initWeb3AuthModal();
    checkLogin();
  }, [])

  const initWeb3AuthModal = async () => {
    try {
      // 인스턴스 생성
      const web3AuthModalPack = new Web3AuthModalPack({
          txServiceUrl: 'https://safe-transaction-polygon.safe.global' // safe 관련
      })
      // 옵션 파람스 https://web3auth.io/docs/sdk/pnp/web/modal/initialize#instantiating-web3auth
      await web3AuthModalPack.init({ options }, [], modalConfig );

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
      console.log(eoa, safes, userInfo)
      // web3 객체 만들기
      // const web3Provider = await web3Pack.getProvider();
      // const web3 = new Web3(web3Provider);

      window.localStorage.setItem("address", eoa);
      // setWeb3(web3);
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

  // const waitForReceipt = (hash: string, cb: Function) => {
  //   // console.log('Start waitForReceipt: ', hash)
  //   provider.httpWeb3.eth.getTransactionReceipt(hash, (err, receipt) => {
  //     // console.log('getTransactionReceipt: ', receipt)
  //     if (err) console.log("err: ", err);

  //     if (receipt === undefined || receipt === null) {
  //       // Try again in 1 second
  //       window.setTimeout(() => {
  //         waitForReceipt(hash, cb);
  //       }, 1000);
  //     } else {
  //       // Transaction went through
  //       if (cb) cb(receipt);
  //     }
  //   });
  // };

  const sendTransaction = async () => {
    if (web3 === null) {
      alert("Failed :(");
      return;
    }
    try {
      // contract 객체 만들기
      const contract = new web3.eth.Contract(eAAts.abi, "0xBB97CcD6EAB2891eac05A67181aa45f7e8a84c3C")
      console.log(contract);
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

  return (
    <Box textAlign="center" fontSize="xl">
      <Button onClick={() => login()}>login</Button>
      <Button onClick={() => logout()}>logout</Button>
      <Button onClick={() => sendTransaction()}>sendTransaction</Button>
      <Text>address: {address}</Text>
      {userInfo !== null &&
        <>
          <Text>email: {userInfo.email}</Text>
          <Text>name: {userInfo.name}</Text>
          <Text>typeOfLogin: {userInfo.typeOfLogin}</Text>
        </>
      }
       <HStack spacing="5vh">
        <OrderCheckbox />
        <OrderCheckbox />
        <OrderCheckbox />
      </HStack>
      <Grid minH="100vh" p={5} px={10}>
        <ColorModeSwitcher justifySelf="flex-end" />
        <OrderCardList />
        </Grid>
      </Box>
  );
}
