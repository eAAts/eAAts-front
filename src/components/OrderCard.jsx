import React from 'react';
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Heading,
  Text,
} from '@chakra-ui/react';

export const OrderCard = ({ item }) => {
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
