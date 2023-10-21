import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Grid,
  GridItem,
  HStack,
  Image,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  SimpleGrid,
  Text,
  useRadio,
  useRadioGroup,
  VStack,
} from '@chakra-ui/react';

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
  const options = ["USDC", "ETH"];

  const { getRootProps, getRadioProps } = useRadioGroup({
    defaultValue: options[0],
    onChange: (e) => console.log(e),
  });
  const group = getRootProps();

  return (
    <Modal scrollBehavior="inside" isCentered={true} isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Order</ModalHeader>
        <ModalCloseButton top={3} />
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
          {/* TODO real QR */}
          <Image
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/QR_code_for_mobile_English_Wikipedia.svg/1024px-QR_code_for_mobile_English_Wikipedia.svg.png"
            alt="QR"
          />
          </Box>
          {/* TODO URL */}
          <Text
            fontWeight={500}
            textDecoration="underline"
            textAlign="center"
            my={3}
          >
            https://ethglobal.com/
          </Text>
          {/* order contents */}
          <Text fontSize={20} fontWeight="700">🏪 Restaurant &gt; eAAts Restaurant</Text>
          {/* food menu */}
          <Text fontSize={20} fontWeight="700">😋 Food Menu</Text>
          {FoodMenu &&
            FoodMenu.map(menu => (<FoodMenuGrid menu={menu} />))
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
            onClick={onJoin}
          >
            Join
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}