import React, {useState} from 'react';
import {View, Text} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';

import Garmin from 'components/Gamin';

const App = () => {
  const [data, setData] = useState(null);

  return (
    <SafeAreaProvider>
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Garmin handleSuccess={value => setData(value)} />
        <Text>{JSON.stringify(data)}</Text>
      </View>
    </SafeAreaProvider>
  );
};

export default App;
