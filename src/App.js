import React from 'react';
import {
  ChakraProvider,
  theme,
} from '@chakra-ui/react';

import { Order } from './components/Order';

const App = () => {
  return (
    <ChakraProvider theme={theme}>
      <Order />
    </ChakraProvider>
  );
}

export default App;
