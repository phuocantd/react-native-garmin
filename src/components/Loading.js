import React from 'react';
import {View, ActivityIndicator, StyleSheet} from 'react-native';

const Loading = ({show}) => {
  if (!show) {
    return null;
  }
  return (
    <View style={[StyleSheet.absoluteFill, styles.container]}>
      <ActivityIndicator size={'large'} color={'#000'} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Loading;
