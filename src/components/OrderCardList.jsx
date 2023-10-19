import React from 'react';
import { SimpleGrid, Text } from '@chakra-ui/react';

import { OrderCard } from './OrderCard';
import { orderCardItem } from '../testcase';

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
