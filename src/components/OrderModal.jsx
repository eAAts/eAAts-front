import React, { useEffect, useState } from 'react';
import {
  Button,
  FormControl,
  FormHelperText,
  FormLabel,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  NumberInput,
  NumberInputField,
  Radio,
  RadioGroup,
  VStack
} from '@chakra-ui/react';

import { convertOrderCardFeeType } from '../utils/convert';

const initOrderData = {
  feeType: "0",
  minParticipants: ""
};

export const OrderModal = ({ isOpen, onClose, onSubmit }) => {
  const [orderData, setOrderData] = useState(initOrderData);
  const [formError, setFormError] = useState(false);
  
  // set order data item
  const setMinParticipants = (v) => {
    setOrderData({
      ...orderData,
      minParticipants: v
    });
    // submit button disabled on/off
    setFormError(!v.length ||  v < 1);
  }
  const setFeeType = (v) => {
    setOrderData({
      ...orderData,
      feeType: v
    })
  }

  useEffect(() => {
    setOrderData(initOrderData)
    setFormError(true)
  }, [isOpen])

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Add Order</ModalHeader>
        <ModalCloseButton top={3} />
        <ModalBody>
          <FormControl>
            {/* input participants */}
            <FormLabel pt={2}>* Min Participants</FormLabel>
            <NumberInput
              value={orderData.minParticipants}
              onChange={(v) => setMinParticipants(v)}
            >
              <NumberInputField />
            </NumberInput>
            {/* input fee type */}
            <FormHelperText>Please enter at least 1 person.</FormHelperText>
            <FormLabel pt={8}>* Fee Type</FormLabel>
            <RadioGroup
              pb={5}
              defaultValue={orderData.feeType}
              onChange={(v) => setFeeType(v)}
            >
              <VStack align="left" ml={2}>
                <Radio value="0">{convertOrderCardFeeType("0")}</Radio>
                <Radio value="1">{convertOrderCardFeeType("1")}</Radio>
              </VStack>
            </RadioGroup>
          </FormControl>
        </ModalBody>
        <ModalFooter>
          <Button
            w="100%"
            h="3rem"
            mx={2}
            isDisabled={formError}
            onClick={() => onSubmit(orderData)}
          >
            Submit
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}