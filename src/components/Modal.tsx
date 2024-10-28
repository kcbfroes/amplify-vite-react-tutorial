import { Flex, View } from '@aws-amplify/ui-react';
import { ModalProps } from './Interfaces';

const Modal = ( props: ModalProps ) => {
  if (!props.isOpen) return null;

  return (
    <Flex alignContent='center' alignItems='center'>
        <View
            position='fixed'
            top='25%'
            left='25%'
            padding='10px'
            backgroundColor="rgba(0, 0, 0, 0.5)"
            display="flex"
        >
            <View 
              backgroundColor='white'
              position='relative'
              display='flex'
              padding='50px'
            >
                {props.children}
            </View>
        </View>
    </Flex>
  );
};

export default Modal;