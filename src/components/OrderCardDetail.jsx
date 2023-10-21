import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  HStack,
  Image,
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

const RadioCard = (props) => {
  const { getInputProps, getRadioProps } = useRadio(props)

  const input = getInputProps()
  const checkbox = getRadioProps()

  return (
    <Box as='label' w="6rem" textAlign="center">
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


export const OrderCardDetail = ({ isOpen, onClose, onJoin }) => {
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
            fallbackSrc={require("../../src/assets/image/delivery.jpg")}
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
            https://maplestory.nexon.com
          </Text>
          {/* select order contents */}
          <Text fontSize={20} fontWeight="600">🏪 Restaurant</Text>
          <Text fontSize={20} fontWeight="600">😋 Food Menu</Text>
          <Text fontSize={20} fontWeight="600">💳 Payment method</Text>
          <HStack {...group} justifyContent="space-around" mt={5}>
            {options.map((value) => {
              const radio = getRadioProps({ value })
              return (
                <RadioCard key={value} {...radio}>
                  {value}
                </RadioCard>
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