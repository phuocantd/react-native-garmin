import React, {useState, useEffect} from 'react';
import {View, Text, Button, StyleSheet, TouchableOpacity} from 'react-native';
import Modal from 'react-native-modal';
import {WebView} from 'react-native-webview';
import querystring from 'querystring';

import {OAUTH_ROOT, GARMIN} from 'configs/api';
import {useConnectGarmin} from 'hooks/garmin';
import Loading from './Loading';

const Gamin = ({handleSuccess}) => {
  const [visible, setVisible] = useState(false);

  const {
    data,
    token,
    doRequest,
    doAccess,
    setState,
    loadingRequest,
    prevLoadingRequest,
    successRequest,
    loadingAccess,
    prevLoadingAccess,
    successAccess,
  } = useConnectGarmin();

  const onHide = () => setVisible(false);

  useEffect(() => {
    if (prevLoadingRequest && !loadingRequest) {
      if (successRequest) {
        setVisible(true);
      }
    }
  }, [loadingRequest, prevLoadingRequest]);

  useEffect(() => {
    if (prevLoadingAccess && !loadingAccess) {
      if (successAccess) {
        handleSuccess?.(data);
      }
    }
  }, [prevLoadingAccess, loadingAccess]);

  const onNavigationStateChange = state => {
    if (state?.url?.includes('oauth_verifier')) {
      const parse = querystring.parse(state.url.replace('?', '&'));
      if (parse?.oauth_verifier !== 'null') {
        setState({
          verifier: parse?.oauth_verifier,
        });
      } else {
        setState({
          verifier: '',
          token: {key: '', secret: ''},
          successAccess: false,
          successRequest: false,
        });
      }
      setVisible(false);
    }
  };

  const onCancel = () => {
    setState({
      verifier: '',
      token: {key: '', secret: ''},
      successAccess: false,
      successRequest: false,
    });
    setVisible(false);
  };

  const renderModal = () => {
    return (
      <Modal
        isVisible={visible}
        onDismiss={onHide}
        useNativeDriver
        hideModalContentWhileAnimating
        onBackButtonPress={onHide}
        onBackdropPress={onHide}
        onSwipeComplete={onHide}
        style={styles.modal}
        onModalHide={doAccess}>
        <View style={styles.containerModal}>
          <View style={styles.containerModalHeader}>
            <TouchableOpacity onPress={onCancel}>
              <Text>{'Cancel'}</Text>
            </TouchableOpacity>
          </View>
          <WebView
            source={{
              uri: OAUTH_ROOT + GARMIN.OAUTH_CONFIRM + token?.key,
            }}
            onNavigationStateChange={onNavigationStateChange}
            startInLoadingState
            renderLoading={() => <Loading show={true} />}
          />
        </View>
      </Modal>
    );
  };

  return (
    <View>
      <Button title={'connect'} onPress={doRequest} />
      {renderModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },

  containerModal: {
    flex: 1,
    marginTop: 50,
    backgroundColor: '#fff',
    borderTopRightRadius: 15,
    borderTopLeftRadius: 15,
  },
  containerModalHeader: {
    borderTopRightRadius: 15,
    borderTopLeftRadius: 15,
    paddingHorizontal: 30,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
});

export default Gamin;
