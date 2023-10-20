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
} from '@chakra-ui/react';
import { orderCardItem } from '../testcase';

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

export const OrderCardList = () => {
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
  </SimpleGrid>
  );
}
