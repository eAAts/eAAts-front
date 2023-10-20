import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Grid,
  HStack,
  Stack,
  Text,
  VStack,
  useCheckboxGroup,
} from '@chakra-ui/react';
import { CHAIN_NAMESPACES, WALLET_ADAPTERS } from '@web3auth/base'
import { OpenloginAdapter } from "@web3auth/openlogin-adapter";

import { ColorModeSwitcher } from '../ColorModeSwitcher';
import { OrderCardList } from './OrderCard';
import { Web3AuthModalPack } from '@safe-global/auth-kit';
import Web3 from 'web3';
import Gov from '../gov.json'
import { OrderCheckbox } from './OrderCheckbox';

const options = {
  clientId: 'BPi5PB_UiIZ-cPz1GtV5i1I2iOSOHuimiXBI0e-Oe_u6X3oVAbCiAZOTEBtTXw4tsluTITPqA8zMsfxIKMjiqNQ',
  web3AuthNetwork: 'testnet',
  chainConfig: {
    chainNamespace: CHAIN_NAMESPACES.EIP155,
    chainId: "0x13881",
    displayName: "Mumbai",
    blockExplorer: "",
    ticker: "MATIC",
    tickerName: "MATIC",
    rpcTarget: "https://matic-mumbai.chainstacklabs.com",
  },
  uiConfig: {
    theme: 'light',
    loginMethodsOrder: ['facbook', 'google']
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
          txServiceUrl: 'https://safe-transaction-mainnet.safe.global' // safe 관련
      })
      // 옵션 파람스 https://web3auth.io/docs/sdk/pnp/web/modal/initialize#instantiating-web3auth
      await web3AuthModalPack.init({ options }, [], modalConfig);

      // 이벤트 구독
      web3AuthModalPack.subscribe("connected", (e) => console.log("connect!", e));
      web3AuthModalPack.subscribe("connecting", (e) =>  console.log("connecting...", e));
      web3AuthModalPack.unsubscribe("disconnected", (e) => console.log("disconnect", e));

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
      console.log(userInfo)
      // web3 객체 만들기
      const web3Provider = await web3Pack.getProvider();
      const web3 = new Web3(web3Provider);

      window.localStorage.setItem("address", eoa);
      setWeb3(web3);
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
      // contract 객체 만들기
      const contract = new web3.eth.Contract(Gov.abi, "0xa98C15B5D0d4F12A7b4C12bb8FA216f446D6534D")
      // sign
      await web3.eth.personal.sign("1234", address)
      // send transaction
      const encodeABI = contract.methods.finalizeEndedVote().encodeABI();
      web3.eth.sendTransaction({
        from: address,
        to: "0xa98C15B5D0d4F12A7b4C12bb8FA216f446D6534D",
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
