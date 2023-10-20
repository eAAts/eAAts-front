import {
  chakra,
  Box,
  Flex,
  Text,
  useCheckbox,
  useCheckboxGroup,
  Stack
} from '@chakra-ui/react';
import React from 'react';

export const OrderCheckbox = () => {
  const { value, getCheckboxProps } = useCheckboxGroup({
    defaultValue: ['2'],
  })

  return (
    <>
      {/* <Text textAlign="left">The selected checkboxes are: {value.sort().join(' and ')}</Text> */}
      <Stack direction={['column', 'row']}>
        <CheckBox {...getCheckboxProps({ value: '1' })}/>
        <CheckBox {...getCheckboxProps({ value: '2' })}/>
        <CheckBox {...getCheckboxProps({ value: '3' })}/>
      </Stack>
      </>
  )
}

export const CheckBox = (props) => {
   const { state, getCheckboxProps, getInputProps, getLabelProps, htmlProps } =
      useCheckbox(props)

  return (
     <chakra.label
        display='flex'
        flexDirection='row'
        alignItems='center'
        gridColumnGap={2}
        maxW='36'
        bg='green.50'
        border='1px solid'
        borderColor='green.500'
        rounded='lg'
        px={3}
        py={1}
        cursor='pointer'
        {...htmlProps}
      >
        <input {...getInputProps()} hidden />
        <Flex
          alignItems='center'
          justifyContent='center'
          border='2px solid'
          borderColor='green.500'
          w={4}
          h={4}
          {...getCheckboxProps()}
        >
          {state.isChecked && <Box w={2} h={2} bg='green.500' />}
        </Flex>
        <Text color="gray.700" {...getLabelProps()}>{props.value}</Text>
      </chakra.label>
    )
}