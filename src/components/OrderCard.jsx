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
import { orderCardItem } from '../testcase';
import { AddIcon } from '@chakra-ui/icons';
import { OrderModal } from './OrderModal';

const OrderCard = ({ item }) => {
  const {
    participants,
    totalAmount,
    minParticipants,
    feeType,
    status
  } = item;
  const Participants = participants.length
    ? () => <><Text>Yummy :)</Text></>
    : () => <><Text>None :(</Text></>

  return (
    <Card>
      <CardHeader>
        <Heading size='md'>${totalAmount}</Heading>
      </CardHeader>
      <CardBody>
        <Participants />
        <Text>minParticipants: {minParticipants}</Text>
        <Text>feeType: {feeType}</Text>
        <Text>status: {status}</Text>
      </CardBody>
      <CardFooter>
        <Button>Order</Button>
      </CardFooter>
    </Card>
  )
}

const AddOrderCard = ({ onClick }) => {
  return (
    <Card>
      <CardBody>
        <Button onClick={onClick}>
          <AddIcon boxSize={10} />
        </Button>
      </CardBody>
    </Card>
  )
}

export const OrderCardList = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
   <SimpleGrid spacing={10} templateColumns='repeat(auto-fill, minmax(200px, 1fr))'>
      {orderCardItem.length
        ? orderCardItem.map(item =>
          <OrderCard item={item} key={new Date() + Math.random() + 4} />
        )
        : <>
          <Text>There's no order list :(</Text>
        </>
      }
      <AddOrderCard onClick={onOpen} />
      <OrderModal
        isOpen={isOpen}
        onSubmit={(e) => console.log(e)}
        onOpen={onOpen}
        onClose={onClose}
      />
  </SimpleGrid>
  );
}
