import {useState} from 'react';
import axios from 'axios';
import querystring from 'querystring';

import {GARMIN_ROOT, GARMIN} from 'configs/api';
import {usePrevious} from 'utils/hook';
import {Oauth1Helper} from 'utils/oauth';

export const useConnectGarmin = () => {
  const [state, _setState] = useState({
    verifier: '',
    data: {key: '', secret: ''},
    token: {key: '', secret: ''},
    loadingRequest: false,
    loadingAccess: false,
    successAccess: false,
    successRequest: false,
    errorRequest: false,
    errorAccess: false,
  });
  const prevLoadingRequest = usePrevious(state?.loadingRequest);
  const prevLoadingAccess = usePrevious(state?.loadingAccess);

  const setState = values => {
    _setState(prev => ({
      ...prev,
      ...values,
    }));
  };

  const requestOptions = type => ({
    url: GARMIN_ROOT + type,
    method: 'POST',
    data: {},
  });

  const post = (url, data, authHeader) =>
    axios.post(url, data, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...authHeader,
      },
    });

  const doRequest = async () => {
    setState({loadingRequest: true});

    const request = requestOptions(GARMIN.REQUEST_TOKEN);

    const authHeader = Oauth1Helper.getAuthHeaderForRequest(request);
    // axios
    //   .post(request.url, request.data, {
    //     headers: {
    //       'Content-Type': 'application/json',
    //       Accept: 'application/json',
    //       ...authHeader,
    //     },
    //   })
    post(request.url, request.data, authHeader)
      .then(res => {
        const data = querystring.parse(res?.data);

        setState({
          loadingRequest: false,
          successRequest: true,
          errorRequest: false,
          token: {
            key: data?.oauth_token,
            secret: data?.oauth_token_secret,
          },
        });
      })
      .catch(err => {
        console.log('[ERROR-REQUEST]' + err);
        setState({
          loadingRequest: false,
          successRequest: false,
          errorRequest: true,
        });
      });
  };

  const doAccess = async () => {
    if (!state.verifier) {
      setState({
        successAccess: false,
        errorAccess: true,
      });
      return;
    }

    setState({loadingAccess: true});

    const access = requestOptions(GARMIN.ACCESS_TOKEN);

    const authHeader = Oauth1Helper.getAuthHeaderForRequest(
      access,
      state.token,
      state.verifier,
    );
    post(access.url, access.data, authHeader)
      .then(res => {
        const data = querystring.parse(res?.data);
        setState({
          data: {
            key: data?.oauth_token,
            secret: data?.oauth_token_secret,
          },
          loadingAccess: false,
          successAccess: true,
          errorAccess: false,
        });
      })
      .catch(err => {
        console.log('[ERROR-ACCESS]' + err);
        setState({
          loadingAccess: false,
          successAccess: false,
          errorAccess: true,
        });
      });
  };

  return {
    doRequest,
    doAccess,
    prevLoadingAccess,
    prevLoadingRequest,
    setState,
    ...state,
  };
};
