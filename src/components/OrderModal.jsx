import {
  Button,
  FormControl,
  FormLabel,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  NumberInput,
  NumberInputField
} from '@chakra-ui/react';
import React, { useState } from 'react';

export const OrderModal = ({ isOpen, onSubmit, onClose }) => {
  const [minParticipants, setMinParticipants] = useState("");

  return (
    <Modal isOpen={isOpen}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Add Order</ModalHeader>
        <ModalBody>
          <FormControl>
            <FormLabel>Min Participants</FormLabel>
            <NumberInput
              value={minParticipants}
              onChange={(e) => setMinParticipants(e)}
            >
              <NumberInputField />
            </NumberInput>
          </FormControl>
        </ModalBody>
        <ModalFooter>
          <Button onClick={() => onSubmit(minParticipants)} mx={2}>Submit Order</Button>
          <Button onClick={onClose}>Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}