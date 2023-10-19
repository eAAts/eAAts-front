import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Grid,
  Text,
} from '@chakra-ui/react';
import { CHAIN_NAMESPACES } from '@web3auth/base'
import { OpenloginAdapter } from "@web3auth/openlogin-adapter";

import { ColorModeSwitcher } from '../ColorModeSwitcher';
import { OrderCardList } from './OrderCardList';
import { Web3AuthModalPack } from '@safe-global/auth-kit';

const options = {
  clientId: '12345',
  web3AuthNetwork: 'testnet',
  chainConfig: {
    chainNamespace: CHAIN_NAMESPACES.EIP155,
    chainId: '0x458',
    rpcTarget: 'https://api.test.wemix.com'
  }
}

export const Order = () => {
  const [web3Pack, setWeb3Pack] = useState(null);
  const [address, setAddress] = useState("");
  const [userInfo, setUserInfo] = useState({});

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
      await web3AuthModalPack.init({ options })

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
    if(address === null) return;
    if(userInfo === null) return;

    setAddress(address);
    setUserInfo(JSON.parse(userInfo))
  }

  const login = async () => {  
    if (web3Pack === undefined) {
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
      const web3Provider = await web3Pack.getProvider();

      window.localStorage.setItem("address", eoa);
      setAddress(eoa);
      setUserInfo(userInfo)
    } catch (e) {
      console.error("login:error", e)
    }
  }

  const logout = async () => {
    if (web3Pack === undefined) {
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
     setUserInfo({});
    } catch (e) {
      console.error("logout:error", e);
    }
  }

  const sendTransaction = () => {

  }

  return (
    <Box textAlign="center" fontSize="xl">
      <Button onClick={() => login()}>login</Button>
      <Button onClick={() => logout()}>logout</Button>
      <Button onClick={() => sendTransaction()}>sendTransaction</Button>
      <Text>address: {address}</Text>
      {Object.keys(userInfo).length > 0 &&
        <>
          <Text>email: {userInfo.email}</Text>
          <Text>name: {userInfo.name}</Text>
          <Text>typeOfLogin: {userInfo.typeOfLogin}</Text>
        </>
      }
      <Grid minH="100vh" p={5} px={10}>
        <ColorModeSwitcher justifySelf="flex-end" />
        <OrderCardList />
        </Grid>
      </Box>
  );
}
