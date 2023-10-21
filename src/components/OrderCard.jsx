import React from 'react';
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Heading,
  SimpleGrid,
  Text,
  useDisclosure,
} from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';

import { OrderModal } from './OrderModal';
import { convertOrderCardFeeType, convertOrderCardStatus } from '../utils/convert';

const AddOrderCard = ({ onClick }) => {
  return (
    <Card
      border="1px"
      borderColor="gray.300"
      borderStyle="dashed"
      background="none"
    >
      <CardBody
        display="flex"
        flexDirection="column"
        justifyContent="center"
      >
        <Button
          onClick={onClick}
          height="100%"
          background="none"
        >
          <AddIcon boxSize={10} />
        </Button>
      </CardBody>
    </Card>
  )
}

const OrderCard = ({ order, onClick }) => {
  const {
    participants,
    totalAmount,
    minParticipants,
    feeType,
    status
  } = order;
  const currentParticipants = participants.legnth;

  // participant component
  const Participants = currentParticipants
    ? participants.map(participant =>
        <Text fontSize={14} pl={2}>participant: {participant}</Text>
      )
    : () => <><Text fontSize={14} pl={2}>None :(</Text></>

  return (
    <Card>
      <CardHeader>
        <Heading size='md' fontSize={20}>🚚 {convertOrderCardStatus(status)} 🚚</Heading>
      </CardHeader>
      <CardBody textAlign="left">
        <Text fontSize={16} fontWeight="300">Total order amount</Text>
        <Text fontSize={18} fontWeight="600">${totalAmount}</Text>
        <Text fontSize={25} fontWeight="300" py={3}>
          👥 {currentParticipants || 0} / {minParticipants}
        </Text>
        <Participants />
        <Text fontSize={16} mt={10}>📦 {convertOrderCardFeeType(feeType)}</Text>
        {/* TODO QR, URL */}
      </CardBody>
      <CardFooter>
        <Button w="100%" onClick={onClick}>Order detail</Button>
      </CardFooter>
    </Card>
  )
}

export const OrderCardList = ({ orderList, onClick, onSubmit }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const orderLength = orderList.length;

  return (
   <SimpleGrid spacing={10} templateColumns='repeat(auto-fill, minmax(270px, 1fr))'>
      {/* order card item list */}
      {orderLength
        ? orderList.map(order =>
          <OrderCard
            key={new Date() + Math.random() + 4}
            order={order}
            onClick={onClick}
          />
        )
        : <>
          <Text>There's no order list :(</Text>
        </>
      }
      {/* add order card */}
      {orderLength && <AddOrderCard onClick={onOpen} />}
      {/* add order modal */}
      <OrderModal
        isOpen={isOpen}
        onClose={onClose}
        onSubmit={onSubmit}
      />
  </SimpleGrid>
  );
}
