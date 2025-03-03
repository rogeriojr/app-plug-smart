import React, { } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import Modal from "react-native-modal";
import { colors, styles } from '../assets/styles';

export default function ModalLoading({ visible, text }) {
    return (
        <View>
            <Modal isVisible={visible} style={{
                alignItems: 'center',
                justifyContent: 'center',
                width: '90%',
            }}>
                <View style={{
                    width: '90%', height: 100, borderRadius: 10, backgroundColor: colors.white,
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                    <Text style={styles.textButtonText}>{text}</Text>
                </View>
            </Modal>
        </View>
    );
}