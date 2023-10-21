import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Grid,
  GridItem,
  HStack,
  Image,
  Link,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  useRadio,
  useRadioGroup,
} from '@chakra-ui/react';
import { ExternalLinkIcon } from '@chakra-ui/icons';

const FoodMenu = [
  {
    imageSrc: require("../assets/image/hamburger2.jpg"),
    title: "* Hamburger",
    description: "On top of sesame bread two pure beef patties",
    price: 5
  },
  {
    imageSrc: require("../assets/image/hamburger2.jpg"),
    title: "* Cheese burger",
    description: "a special sauce lettuce Cheese, pickle, onion!",
    price: 5
  }
]
const options = ["USDC", "ETH"];

const FoodMenuGrid = ({ menu }) => {
  const {
    imageSrc,
    title,
    description,
    price
  } = menu;

  return (
    <Grid
      h="8rem"
      m={4}
      gap={2}
      templateRows="repeat(2, 1fr)"
      templateColumns="repeat(5, 1fr)"
    >
      <GridItem rowSpan={2} colSpan={2} display="flex" alignItems="center">
        <Image src={imageSrc} />
      </GridItem>
      <GridItem colSpan={3}>
        <Text fontSize={18} fontWeight={500}>{title}</Text>
        <Text ml={4} fontSize={14} fontWeight={300} textColor="gray.500">{description}</Text>
      </GridItem>
      <GridItem colSpan={3} maxH="4rem">
        <Text fontSize={18} textAlign="right">${price}</Text>
      </GridItem>
    </Grid>
  )
}

const PaymentRadio = (props) => {
  const { getInputProps, getRadioProps } = useRadio(props)

  const input = getInputProps()
  const checkbox = getRadioProps()

  return (
    <Box as='label' w="10rem" textAlign="center">
      <input {...input} />
      <Box
        {...checkbox}
        cursor='pointer'
        borderWidth='1px'
        borderRadius='md'
        boxShadow='md'
        _checked={{
          bg: 'blue.500',
          color: 'white',
          borderColor: 'blue.500',
        }}
        _focus={{
          boxShadow: 'outline',
        }}
        py={3}
      >
        {props.children}
      </Box>
    </Box>
  )
}

export const OrderCardModal = ({ isOpen, onClose, onJoin }) => {
  const [paymentType, setPaymentType] = useState(options[0]);

  const { getRootProps, getRadioProps } = useRadioGroup({
    defaultValue: options[0],
    onChange: (v) => setPaymentType(v),
  });
  const group = getRootProps();

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Order</ModalHeader>
        <ModalCloseButton top={4} />
        <ModalBody>
          {/* QR */}
          <Box
            display="flex"
            justifyContent="center"
            borderWidth="1px"
            borderRadius="lg"
            background="white"
            overflow="hidden"
          >
            <Image
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/QR_code_for_mobile_English_Wikipedia.svg/1024px-QR_code_for_mobile_English_Wikipedia.svg.png"
              alt="QR"
            />
          </Box>
          <Link display="flex" justifyContent="center" fontSize={14} my={3} isExternal={true} href="https://ethglobal.com/" >
            https://ethglobal.com/
            <ExternalLinkIcon ml="1" mt="1" />
          </Link>
          {/* order contents */}
          <Text fontSize={20} fontWeight="700" mt="2rem">🏪 Restaurant &gt; eAAts Restaurant</Text>
          {/* food menu */}
          <Text fontSize={20} fontWeight="700" mt="2">😋 Food Menu</Text>
          {FoodMenu &&
            FoodMenu.map(menu => (<FoodMenuGrid menu={menu} key={Math.random() + 2} />))
          }
          {/* payment */}
          <Text fontSize={20} fontWeight="700">💳 Payment</Text>
          <HStack {...group} justifyContent="space-around" mt={5}>
            {options.map((value) => {
              const radio = getRadioProps({ value })
              return (
                <PaymentRadio key={value} {...radio}>
                  {value}
                </PaymentRadio>
              )
            })}
          </HStack>
        </ModalBody>
        <ModalFooter>
          <Button
            w="100%"
            h="3rem"
            mx={2}
            onClick={() => onJoin(paymentType)}
          >
            Join
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}