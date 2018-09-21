import { put, call } from "redux-saga/effects";
import { internalServerError } from "../../errors/statusCodeMessage";

import { getAuthToken } from "../../../utils/localStorage";

// SERVICES
import RechargeService from "../../../services/rechargeService";
import CoinService from "../../../services/coinService";
import { convertBiggestCoinUnit } from "../../../utils/numbers";
import TransactionService from "../../../services/transaction/transactionService";

// UTILS
import { getUserSeedWords } from "../../../utils/localStorage";
import { decryptAes } from "../../../utils/cryptography";

const rechargeService = new RechargeService();
const coinService = new CoinService();
const transactionService = new TransactionService();

export function* setModalStepSaga(payload) {
  yield put({
    type: "SET_MODAL_RECHARGE_STEP_REDUCER",
    step: payload.step
  });
}

export function* getOperatorsSaga(payload){
  try {
    yield put({
      type: "SET_LOADING_VAL_REDUCER",
      payload: true
    });

    let token       = yield call(getAuthToken);
    let response    = yield call(rechargeService.getOperadoras, token, payload.ddd);

    yield put({
      type: "GET_OPERADORAS_REDUCER",
      operadoras: response
    });

    return;

  }catch(error){
    yield put(internalServerError());
  }
}

export function* getValuesCreditSaga(payload){
  try {
    yield put({
      type: "SET_LOADING_VAL_REDUCER",
      payload: true
    });

    let token       = yield call(getAuthToken);
    let response    = yield call(rechargeService.getValoresRecarga, token, payload);

    yield put({
      type: "GET_VALORES_REDUCER",
      valores: response
    });

    return;

  }catch(error){
    yield put(internalServerError());
  }
}

export function* setRechargeSaga(payload){
  try {
    yield put({
      type: "SET_LOADING_REDUCER",
      payload: true
    });

    const value = parseFloat(payload.recharge.value);
    const {abbreviation, address} = payload.recharge.coin;

    const token = yield call(getAuthToken);

    const amountResponse = yield call(
      rechargeService.getCoinAmountPay,
      token,
      abbreviation,
      value
    );

    const balanceResponse = yield call(
      coinService.getCoinBalance,
      abbreviation,
      address,
      token
    );

    const balance = balanceResponse.data.data.available;
    const amount = amountResponse.data.data.value;

    const data = {
      number: payload.recharge.number,
      coin: payload.recharge.coin,
      balance: convertBiggestCoinUnit(balance, 8),
      amount: convertBiggestCoinUnit(amount, 8),
      value: value.toFixed(2).replace(".", ","),
      operator: {
        id: payload.recharge.operatorId,
        name: payload.recharge.operatorName
      }
    };

    yield put({
      type: "SET_RECHARGE_REDUCER",
      payload: data
    });

  }catch(error){
    yield put(internalServerError());
  }
}

export function* getFeeRechargeSaga(payload) {
  try {
    yield put({
      type: "SET_LOADING_REDUCER",
      payload: true
    });

    let response = yield call(
      coinService.getFee,
      payload.coin,
      payload.fromAddress,
      payload.toAddress,
      payload.amount,
      payload.decimalPoint
    );

    if(!response.fee){
      yield put({
        type: "SET_LOADING_REDUCER",
        payload: false
      });
      yield put(internalServerError());
    }

    yield put({
      type: "GET_FEE_RECHARGE_REDUCER",
      fee: response
    });
  } catch (error) {
    yield put(internalServerError());
  }
}

export function* setFeeRechargeSaga(payload) {
  yield put({
    type: "SET_FEE_RECHARGE_REDUCER",
    fee: payload
  });
}

export function* confirmRechargeSaga(payload) {
  try {
    yield put({
      type: "SET_LOADING_REDUCER",
      payload: true
    });

    const payload_transaction = {
      coin: payload.recharge.coin,
      fromAddress: payload.recharge.fromAddress,
      toAddress: payload.recharge.toAddress,
      amount: payload.recharge.amount,
      fee: payload.recharge.fee,
      feePerByte: payload.recharge.feePerByte,
      feeLunes: payload.recharge.feeLunes,
      price: payload.recharge.price,
      decimalPoint: payload.recharge.decimalPoint
    };

    console.log('payload', payload);

    try {
      let seed = yield call(getUserSeedWords);
      let token = yield call(getAuthToken);

      // pega o servico disponivel
      let lunesWallet = yield call(
        transactionService.transactionService,
        payload_transaction.coin,
        token
      );

      console.log("servico", lunesWallet);

      if (lunesWallet) {
        let response = yield call(
          transactionService.transaction,
          lunesWallet.id,
          payload_transaction,
          lunesWallet,
          decryptAes(seed, payload.recharge.user),
          token
        );

        console.log("transacao", response);

        const transacao_obj = JSON.parse(response.config.data);
        const ddd           = payload.recharge.recharge.number.substring(0,2);
        const totalnumero   = payload.recharge.recharge.number.length;
        const numero        = payload.recharge.recharge.number.substring(2,totalnumero);

        if (response) {
          const payload_elastic = {
            ddd: ddd,
            operatorId: payload.recharge.recharge.operator.operatorId,
            operatorName: payload.recharge.recharge.operator.operatorName,
            phone: numero,
            value: parseFloat(payload.recharge.recharge.value),
            txID: transacao_obj.txID,
            describe: "Recarga",
            serviceId: lunesWallet.id
          };

          let response_elastic = yield call(
            rechargeService.sendRecharge,
            token,
            payload_elastic
          );

          console.log("payload", payload_elastic);
          console.log("elastic", response_elastic);

          yield put({
            type: "SET_CLEAR_RECHARGE_REDUCER"
          });

          if (response_elastic.data.errorMessage) {
            yield put({
              type: "SET_MODAL_RECHARGE_STEP_REDUCER",
              step: 6
            });
            yield put(internalServerError());
          } else {
            yield put({
              type: "SET_MODAL_RECHARGE_STEP_REDUCER",
              step: 5
            });
          }

          return;
        }
      }

      yield put({
        type: "SET_CLEAR_RECHARGE_REDUCER"
      });

      yield put({
        type: "SET_MODAL_RECHARGE_STEP_REDUCER",
        step: 5
      });

      yield put({
        type: "SET_LOADING_REDUCER",
        payload: false
      });

      yield put({
        type: "SET_MODAL_RECHARGE_STEP_REDUCER",
        step: 6
      });

      yield put(internalServerError());

      return;
    } catch (error) {
      console.log('recharge error', error);
      yield put({
        type: "SET_LOADING_REDUCER",
        payload: false
      });

      yield put({
        type: "SET_MODAL_RECHARGE_STEP_REDUCER",
        step: 6
      });

      yield put(internalServerError());
    }

  } catch (error) {
    yield put(internalServerError());
  }
}

export function* getHistoryRechargeSaga() {
  try {
    yield put({
      type: "SET_LOADING_REDUCER",
      payload: true
    });

    let token = yield call(getAuthToken);
    let response = yield call(rechargeService.getHistory, token);

    let data = [];
    if (response.recharges) {
      data = response.recharges;
    }

    yield put({
      type: "GET_HISTORY_RECHARGE_REDUCER",
      history: data
    });
  } catch (error) {
    yield put(internalServerError());
  }
}
