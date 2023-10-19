import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Text,
} from '@chakra-ui/react';
import { CHAIN_NAMESPACES } from '@web3auth/base'
import { OpenloginAdapter } from "@web3auth/openlogin-adapter";

import { ColorModeSwitcher } from '../ColorModeSwitcher';
import { OrderCardList } from './OrderCardList';
import { Web3AuthModalPack } from '@safe-global/auth-kit';

const adapterSettings = {
  uxMode: "popup",
  whiteLabel: {
    appName: "eAAts",
    appUrl: "https://web3auth.io",
    logoLight: "https://web3auth.io/images/w3a-L-Favicon-1.svg",
    logoDark: "https://web3auth.io/images/w3a-D-Favicon-1.svg",
    defaultLanguage: "ko", // en, de, ja, ko, zh, es, fr, pt, nl
    mode: "dark", // whether to enable dark mode. defaultValue: auto
    theme: {
      primary: "#00D1B2",
    },
    useLogoLoader: true,
  }
}
const options = {
  clientId: '123',
  web3AuthNetwork: 'mainnet',
  chainConfig: {
    chainNamespace: CHAIN_NAMESPACES.EIP155,
    chainId: '0x89',
    rpcTarget: 'https://polygon-rpc.com'
  }
}

export const Order = () => {
  const [web3Pack, setWeb3Pack] = useState();
  const [address, setAddress] = useState();

  useEffect(() => {
    initWeb3AuthModal()
  }, [])

  useEffect(() => {
    console.log("web3Pack", web3Pack);
  }, [web3Pack])

  useEffect(() => {
    console.log("eoa", address);
  }, [address])

  const initWeb3AuthModal = async () => {
    const openloginAdapter = new OpenloginAdapter({
      adapterSettings
    })
    console.log(openloginAdapter)

   const web3AuthModalPack = new Web3AuthModalPack({
      txServiceUrl: 'https://safe-transaction-mainnet.safe.global'
   })
    await web3AuthModalPack.init({ options }, [openloginAdapter])
    setWeb3Pack(web3AuthModalPack)

    web3AuthModalPack.subscribe("connected", (e) => console.log("connect!", e));
    web3AuthModalPack.subscribe("connecting", (e) => console.log("connecting...", e));
    web3AuthModalPack.unsubscribe("disconnected", (e) => console.log("disconnect", e));
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
      setAddress(eoa);
      const userInfo = await web3Pack.getUserInfo();
      const web3Provider = await web3Pack.getProvider();
      console.log(eoa, safes, userInfo, web3Provider);
    } catch (e) {
      console.error("error", e)
    }
  }

  const logout = async () => {
    if (web3Pack === undefined) {
      alert("You are not logged in :(");
      return;
    }
    const { status } = web3Pack.web3Auth;
    if (status === "ready") {
      alert("You are not logged in :(");
      return;
    }

     await web3Pack.signOut();
  }

  return (
    <Box textAlign="center" fontSize="xl">
      <button onClick={() => login()}>login</button>
      <button onClick={() => logout()}>logout</button>
      <Text>address: {address}</Text>
      <Grid minH="100vh" p={5} px={10}>
        <ColorModeSwitcher justifySelf="flex-end" />
        <OrderCardList />
        </Grid>
      </Box>
  );
}
