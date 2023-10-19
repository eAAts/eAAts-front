import React from 'react';
import {
  Box,
  Grid,
} from '@chakra-ui/react';

import { ColorModeSwitcher } from '../ColorModeSwitcher';
import { OrderCardList } from './OrderCardList';

export const Order = () => {
  return (
    <Box textAlign="center" fontSize="xl">
      <Grid minH="100vh" p={5} px={10}>
        <ColorModeSwitcher justifySelf="flex-end" />
        <OrderCardList />
        </Grid>
      </Box>
  );
}
