import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import { ethers } from 'ethers';
import { ADAPTER_EVENTS, CHAIN_NAMESPACES, WALLET_ADAPTERS } from '@web3auth/base'
import { EthereumPrivateKeyProvider } from '@web3auth/ethereum-provider';
import { OpenloginAdapter } from '@web3auth/openlogin-adapter';
import { Web3AuthModalPack } from '@safe-global/auth-kit';
import Safe, { EthersAdapter } from '@safe-global/protocol-kit';
import {
  Avatar,
  Box,
  Button,
  Grid,
  GridItem,
  HStack,
  Image,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Tag,
} from '@chakra-ui/react';

import { OrderCardList } from './OrderCard';
import { OrderCheckbox } from './OrderCheckbox';
import { ColorModeSwitcher } from '../ColorModeSwitcher';
import eAAts from '../eAAts.json'

import { convertAddress } from '../utils/convert';

import { PushAPI } from '@pushprotocol/restapi';
const getOwnerPush = async () => {
  try {
    const ownerWallet = new ethers.Wallet(process.env.PUSH_PK);
    const ownerPush = await PushAPI.initialize(ownerWallet, { env: 'staging' });
    return ownerPush;
  } catch (e) {
    console.error('error:getOwnerPush', e);
  }
};
const ownerPush = getOwnerPush();

const chainConfig = {
  chainNamespace: CHAIN_NAMESPACES.EIP155,
  chainId: '0x13881',
  blockExplorer: 'https://mumbai.polygonscan.com',
  rpcTarget: 'https://rpc.ankr.com/polygon_mumbai',
  wssTarget: 'wss://polygon-mumbai-bor.publicnode.com',
};
// for open login, modal pack options
const settings = {
  loginSettings: {
    mfaLevel: 'mandatory'
  },
  adapterSettings: {
    uxMode: 'popup',
  }
};
const web3AuthConfig = {
  txServiceUrl : "https://safe-transaction-goerli.safe.global" // safe?
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

const eAAtsAddress = "0xBB97CcD6EAB2891eac05A67181aa45f7e8a84c3C"; // mumbai
const safeAddress = "0x2E5f05e205E66aC258B0f10CBa6E386395d0c29f";

const deliveryStatus = ["Before delivery", "During delivery", "After delivery"];
const orderType = ["Participating", "Owner"];

export const Order = () => {
  const [web3Auth, setWeb3Auth] = useState(null); // web3AuthModalPack
  const [provider, setProvider] = useState(null); // web3 provider
  const [contract, setContract] = useState(null);
  const [wssContract, setWssContract] = useState(null);
  const [address, setAddress] = useState('');
  const [userInfo, setUserInfo] = useState(null);
  const [tagTrigger, setTagTrigger] = useState(true); // true: wallet address, false: social email

  const [orderList, setOrderList] = useState(null);

  // init web3 provider, eAAts contract
  const initWeb3 = async () => {
    try {
      const { rpcTarget, wssTarget } = chainConfig;
      const provider = new Web3(rpcTarget); // for before logging in
      const contract = new provider.eth.Contract(eAAts.abi, eAAtsAddress);
      const wssProvider = new Web3(wssTarget);
      const wssContract = new wssProvider.eth.Contract(eAAts.abi, eAAtsAddress);

      await getOrderList(provider);

      setProvider(provider);
      setContract(contract);
      setWssContract(wssContract);
    } catch (e) {
      console.error('error:initWeb3', e);
    }
  };

  const initWeb3AuthModal = async () => {
    try {
      // util for modal pack
      const privateKeyProvider = new EthereumPrivateKeyProvider({
        config: { chainConfig }
      });
      const openloginAdapter = new OpenloginAdapter({
        ...settings,
        privateKeyProvider
      })

      // create modal instance
      const web3AuthModalPack = new Web3AuthModalPack(web3AuthConfig)
      // parameter > https://web3auth.io/docs/sdk/pnp/web/modal/initialize#instantiating-web3auth
      await web3AuthModalPack.init({ options, adapters: [openloginAdapter], modalConfig });

      // subscribe connect event
      subscribeEvent(web3AuthModalPack)

      setWeb3Auth(web3AuthModalPack)
    } catch (e) {
      console.error("initWeb3AuthModal:error", e);
    }
  }

  const subscribeEvent = (web3Auth) => {
    web3Auth.subscribe(ADAPTER_EVENTS.CONNECTED, (e) => console.log("connect", e));
    web3Auth.subscribe(ADAPTER_EVENTS.CONNECTING, (e) =>  console.log("connecting", e));
    web3Auth.subscribe(ADAPTER_EVENTS.DISCONNECTED, () => console.log("disconnect"));
  }

  try {
    wssContract?.events
      .OrderJoined()
      .on('data', async event => {
        const participants = event.returnValues.participants;
        const joinerAddress = participants.pop();

        if (participants.length !== 0) {
          await ownerPush.channel.send([participants], {
            notification: {
              title: 'someone joined',
              body: `Who participated in the order: ${joinerAddress}`,
            },
          });
        }
      })
      .on('error', e => {
        console.error('event listener error1: ', e);
      });

    wssContract?.events
      .OrderDeliveryStarted()
      .on('data', async event => {
        const participants = event.returnValues.participants;

        await ownerPush.channel.send([participants], {
          notification: {
            title: 'Food picked up',
            body: `The delivery driver picked up the food`,
          },
        });
      })
      .on('error', e => {
        console.error('event listener error2: ', e);
      });

    wssContract?.events
      .SingleDeliveryCompleted()
      .on('data', async event => {
        const participant = event.returnValues.participant;

        await ownerPush.channel.send([participant], {
          notification: {
            title: 'Your delivery is complete',
            body: `Take the food as quickly as possible`,
          },
        });
      })
      .on('error', e => {
        console.error('event listener error3: ', e);
      });
  } catch (e) {
    console.log('Event listener registration error: ', e);
  }

  const login = async () => {  
    if (web3Auth === null) return;

    // if already logged in, logout
    const { status } = web3Auth.web3Auth;
    if (status === ADAPTER_EVENTS.CONNECTED) {
      alert("There's an error. Please try again. :(");
      await logout();
      return;
    }

    try {
      const { eoa, safes } = await web3Auth.signIn();
      console.log("safes", safes)
      // ["0x2E5f05e205E66aC258B0f10CBa6E386395d0c29f", "0x8F5be83Bb5f7308875eBd004E70FcEeD0B4E31Db"]

      // social login info
      const userInfo = await web3Auth.getUserInfo();

      // set auth provider
      const provider = web3Auth.getProvider();
      // set user information (refresh action)
      window.localStorage.setItem("address", eoa);
      window.localStorage.setItem("userInfo", JSON.stringify(userInfo));

      setAddress(eoa);
      setUserInfo(userInfo)
      setProvider(provider);
    } catch (e) {
      console.error("login:error", e)
    }
  }

  const logout = async () => {
    if (web3Auth === null) return;
    
    const { status } = web3Auth.web3Auth;
    if (status !== ADAPTER_EVENTS.CONNECTED) {
      alert("Session expired. :(");
      setAddress("");
      setUserInfo(null);
      return;
    }

    try {
     await web3Auth.signOut();

     window.localStorage.removeItem("address");
     window.localStorage.removeItem("userInfo");

     setAddress("");
     setUserInfo(null);
    } catch (e) {
      console.error("logout:error", e);
    }
  }

  const getOrderList = async () => {
    if(provider === null || contract === null) return;

    try {
      const orderList = await contract.methods.getOrdersByStatus(0).call();
      setOrderList(orderList);
    } catch (e) {
      console.error("error:getOrderList", e);
    }
  }

  const joinOrder = async (payment) => {
    if (web3Auth === null || contract === null) return;

    // if already logged in, logout
    const { status } = web3Auth.web3Auth;
    if (status !== ADAPTER_EVENTS.CONNECTED) {
      alert("Please log in first. :)");
      await login();
      return;
    }

    try {
      // TODO
    } catch (e) {
      console.error("error:joinOrder", e);
    }
  };

  const createOrder = async (order) => {
    if (web3Auth === null || contract === null) return;

    // if already logged in, logout
    const { status } = web3Auth.web3Auth;
    if (status !== ADAPTER_EVENTS.CONNECTED) {
      alert("Please log in first. :)");
      await login();
      return;
    }

    const { minParticipants, feeType } = order;
    try {
      // data encode
      const encodeABI = contract.methods.createOrder(minParticipants, feeType).encodeABI();

      // set for safe
      const authProvider = new ethers.providers.Web3Provider(web3Auth.getProvider());
      const signer = authProvider.getSigner();
      const ethAdapter = new EthersAdapter({
        ethers,
        signerOrProvider: signer || authProvider
      });
      const safeSDK = await Safe.create({
        ethAdapter,
        safeAddress
      });

      const safeTransactionData = {
        to: eAAtsAddress,
        data: encodeABI,
        value: "0x0",
      };
      // signing?
      const safeTransaction = await safeSDK.createTransaction({ safeTransactionData});
      console.log(safeTransaction);

      try {
        const pushResult = await ownerPush.channel.send([address], {
          notification: {
            title: 'order created',
            body: 'Please wait until all the members gather!',
          },
        });
        console.log(pushResult);
      } catch (e) {
        console.error('error:push', e);
      }

    } catch (e) {
      console.error("error:createOrder", e);
    }
  };

  // refresh keep user info
  const checkLogin = () => {
    const address = window.localStorage.getItem("address")
    const userInfo = window.localStorage.getItem("userInfo");
    if (address === null || userInfo === null) return;
    
    setAddress(address);
    setUserInfo(JSON.parse(userInfo))
  }

  // const sendTransaction = async () => {
  //   if (web3 === null) {
  //     alert("Failed :(");
  //     return;
  //   }
  //   try {
  //     // * sign
  //     // await web3.eth.personal.sign("1234", address)
  //     // * list
  //     // const list = await contract.methods.getOrdersByStatus(0).call();
  //     // send transaction
  //     // * create order
  //     const encodeABI = contract.methods.createOrder(100, 0).encodeABI();
  //     // * join order
  //     // const encodeABI = contract.methods.joinOrder(1, 2).encodeABI();
  //     web3.eth.sendTransaction({
  //       from: address,
  //       to: "0xBB97CcD6EAB2891eac05A67181aa45f7e8a84c3C",
  //       data: encodeABI,
  //       gasPrice: 101000000000,
  //       value: "0x0",
  //     }, (err, hash) => {
  //       console.log(err, hash)
  //     })
  //   } catch (e) {
  //     console.error("sendTransaction:error", e);
  //   }
  // }

  // const signer = async () => {
  //   try {
  //     console.log(web3);
  //     const provider = new ethers.providers.Web3Provider(web3);
  //     const providerJsonPrc = new ethers.providers.JsonRpcProvider("https://eth-goerli.public.blastapi.io");
  //     const signer = provider.getSigner();
  //     // console.log(web3, signer, 1234)

  //     const ethAdapter = new EthersAdapter({    
  //       ethers,
  //       signerOrProvider: signer // || provider
  //     })
  //     console.log(provider, signer, 2345, ethAdapter)
      
  //     // * Signing transaction https://docs.safe.global/safe-core-aa-sdk/auth-kit/web3auth#signing-transactions-using-the-web3authmodalpack-and-protocol-kit
  //     const safeSDK = await Safe.create({
  //       ethAdapter,
  //       safeAddress : "0x4BD1f0331D7D3B928EB009aF9134888784f14218", // safeAddress?
  //     })

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
  //   } catch (e) {
  //     console.error("error:signer", e);
  //   }
  // }

  useEffect(() => {
    initWeb3();
    initWeb3AuthModal();

    checkLogin();
  }, [])

  useEffect(() => {
    if(provider && contract) getOrderList();
  }, [provider, contract]);

  return (
    <Box textAlign="center" fontSize="xl">
      <Grid minH="100vh" m="8">
        {/* header */}
        <GridItem display="flex" justifyContent="space-between">
          <Image src={require("../assets/image/delivery.jpg")} alt="eAAts" maxH="5rem" />
          {/* user information */}
          {userInfo === null
            ?
              <GridItem>
                <Button onClick={() => login()}>login</Button>
              </GridItem>
            : 
              <GridItem textAlign="right">
                <HStack>
                  <Avatar src={require(`../assets/image/${userInfo.typeOfLogin || "metamask"}.svg`)} alt="adapter" />
                  {/* wallet trigger */}
                  <Popover trigger="hover">
                    <PopoverTrigger>
                      <Tag
                        onClick={() => setTagTrigger(!tagTrigger)}
                        border="1px"
                        background="none"
                      >
                        {tagTrigger
                          ? convertAddress(address)
                          : userInfo.email
                            ? userInfo.email
                            : convertAddress(address)
                        }
                      </Tag>
                    </PopoverTrigger>
                    {/* logout button */}
                    <PopoverContent w="6rem">
                      <Button onClick={() => logout()}>logout</Button>
                    </PopoverContent>
                  </Popover>
                  
                </HStack>
              </GridItem>
          }
        </GridItem>
        {/* options for order list */}
        {/* <HStack spacing="5vh">
          <OrderCheckbox list={deliveryStatus} />
          <OrderCheckbox list={orderType}/>
        </HStack> */}
        {/* change light/dark mode */}
        <ColorModeSwitcher justifySelf="flex-end" />
        {/* order item */}
        {orderList &&
          <OrderCardList
            orderList={orderList}
            onJoin={(payment) => joinOrder(payment)}
            onCreate={(order) => createOrder(order)}
          />
        }
        </Grid>
      </Box>
  );
}
